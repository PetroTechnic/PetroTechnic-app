import {
  doc,
  serverTimestamp,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type SupabaseSystemAuditLogRow,
} from './supabaseClient';
import type {
  AuditCategory,
  AuditChangeDiff,
  AuditSeverity,
  SystemAuditLog,
} from '../types/domain';

export interface AdminAuditEventInput {
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  targetType: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  changes?: AuditChangeDiff[];
}

export interface NormalizedAuditEnvelope {
  id: string;
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  targetType: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  changes: AuditChangeDiff[];
  actorUid: string;
  actorEmail: string;
  actorName: string;
  createdAtIso: string;
}

export type SupabaseSinkStatus = 'committed' | 'skipped_unconfigured' | 'skipped_no_session' | 'failed';

export interface AuditSinkReceipt {
  eventId: string;
  action: string;
  supabaseStatus: SupabaseSinkStatus;
  errorMessage?: string;
  timestamp: string;
}

const MAX_RECENT_RECEIPTS = 25;
const recentReceipts: AuditSinkReceipt[] = [];
const receiptListeners = new Set<(receipts: AuditSinkReceipt[]) => void>();

function recordSinkReceipt(receipt: AuditSinkReceipt): void {
  recentReceipts.unshift(receipt);
  if (recentReceipts.length > MAX_RECENT_RECEIPTS) {
    recentReceipts.length = MAX_RECENT_RECEIPTS;
  }
  const snapshot = [...recentReceipts];
  for (const listener of receiptListeners) {
    listener(snapshot);
  }
}

export function subscribeAuditSinkReceipts(
  listener: (receipts: AuditSinkReceipt[]) => void,
): () => void {
  receiptListeners.add(listener);
  listener([...recentReceipts]);
  return () => {
    receiptListeners.delete(listener);
  };
}

/**
 * Computes normalized Before -> After diffs from declarative field extractors.
 */
export function computeFieldDiffs<T>(
  previous: T | null | undefined,
  next: T,
  specs: {
    field: string;
    get: (item: T) => string;
    emptyFallback?: string;
  }[],
): AuditChangeDiff[] {
  const diffs: AuditChangeDiff[] = [];
  for (const spec of specs) {
    const afterVal = spec.get(next);
    if (!previous) {
      diffs.push({
        field: spec.field,
        before: spec.emptyFallback ?? '—',
        after: afterVal,
      });
      continue;
    }
    const beforeVal = spec.get(previous);
    if (beforeVal !== afterVal) {
      diffs.push({
        field: spec.field,
        before: beforeVal || (spec.emptyFallback ?? '(empty)'),
        after: afterVal || '(cleared)',
      });
    }
  }
  return diffs;
}

/**
 * Converts a normalized audit envelope into the exact snake_case row expected
 * by the Supabase `public.system_audit_logs` table and its RLS policies.
 */
export function toSupabaseAuditRow(
  envelope: NormalizedAuditEnvelope,
  overrideActorUid?: string,
  overrideActorEmail?: string,
): SupabaseSystemAuditLogRow {
  return {
    id: envelope.id,
    category: envelope.category,
    action: envelope.action,
    severity: envelope.severity,
    target_type: envelope.targetType,
    target_id: envelope.targetId,
    target_label: envelope.targetLabel,
    summary: envelope.summary,
    changes: envelope.changes,
    actor_uid: overrideActorUid ?? envelope.actorUid,
    actor_email: (overrideActorEmail ?? envelope.actorEmail).toLowerCase(),
    actor_name: envelope.actorName,
    created_at: envelope.createdAtIso,
  };
}

/**
 * Builds a schema-safe audit envelope bound to the currently authenticated operator.
 */
export function buildNormalizedAuditEnvelope(
  event: AdminAuditEventInput,
  explicitActor?: { uid: string; email: string; name?: string },
): NormalizedAuditEnvelope | null {
  const fbUser = auth.currentUser;
  const uid = explicitActor?.uid || fbUser?.uid || '';
  const email = (explicitActor?.email || fbUser?.email || '').trim().toLowerCase();
  if (!uid || !email) return null;

  const rand = Math.floor(1000 + Math.random() * 9000);
  const id = `AUD-${Date.now()}-${rand}`;
  const cleanChanges: AuditChangeDiff[] = (event.changes ?? [])
    .slice(0, 12)
    .map((c) => ({
      field: String(c.field).slice(0, 60),
      before: String(c.before).slice(0, 160),
      after: String(c.after).slice(0, 160),
    }));

  const name = (
    explicitActor?.name ||
    fbUser?.displayName ||
    email.split('@')[0] ||
    'Operator'
  ).slice(0, 120);

  return {
    id,
    category: event.category,
    action: event.action.slice(0, 80),
    severity: event.severity,
    targetType: event.targetType.slice(0, 48),
    targetId: event.targetId.slice(0, 128),
    targetLabel: event.targetLabel.slice(0, 160),
    summary: event.summary.slice(0, 400),
    changes: cleanChanges,
    actorUid: uid,
    actorEmail: email.slice(0, 160),
    actorName: name,
    createdAtIso: new Date().toISOString(),
  };
}

/**
 * Attaches an immutable audit log record to an in-flight Firestore WriteBatch
 * and returns the normalized envelope for post-commit Supabase mirroring.
 */
export function queueNormalizedAuditInBatch(
  batch: WriteBatch,
  event: AdminAuditEventInput,
): NormalizedAuditEnvelope | null {
  const envelope = buildNormalizedAuditEnvelope(event);
  if (!envelope) return null;

  batch.set(doc(db, 'system_audit_logs', envelope.id), {
    id: envelope.id,
    category: envelope.category,
    action: envelope.action,
    severity: envelope.severity,
    targetType: envelope.targetType,
    targetId: envelope.targetId,
    targetLabel: envelope.targetLabel,
    summary: envelope.summary,
    changes: envelope.changes,
    actorUid: envelope.actorUid,
    actorEmail: envelope.actorEmail,
    actorName: envelope.actorName,
    createdAt: serverTimestamp(),
  });

  return envelope;
}

/**
 * Commits an intercepted admin audit envelope to the Supabase `public.system_audit_logs`
 * table using the active Supabase authenticated session (enforcing RLS actor checks).
 */
export async function dispatchSupabaseAuditEnvelope(
  envelope: NormalizedAuditEnvelope | null,
): Promise<AuditSinkReceipt | null> {
  if (!envelope) return null;

  if (!isSupabaseConfigured()) {
    const receipt: AuditSinkReceipt = {
      eventId: envelope.id,
      action: envelope.action,
      supabaseStatus: 'skipped_unconfigured',
      timestamp: new Date().toISOString(),
    };
    recordSinkReceipt(receipt);
    return receipt;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user || !user.email) {
      const receipt: AuditSinkReceipt = {
        eventId: envelope.id,
        action: envelope.action,
        supabaseStatus: 'skipped_no_session',
        errorMessage: authErr?.message || 'No active Supabase auth session for RLS actor check.',
        timestamp: new Date().toISOString(),
      };
      recordSinkReceipt(receipt);
      return receipt;
    }

    const row = toSupabaseAuditRow(envelope, user.id, user.email.toLowerCase());
    const { error: insertErr } = await supabase
      .from('system_audit_logs')
      .insert(row);

    if (insertErr) {
      const receipt: AuditSinkReceipt = {
        eventId: envelope.id,
        action: envelope.action,
        supabaseStatus: 'failed',
        errorMessage: insertErr.message,
        timestamp: new Date().toISOString(),
      };
      recordSinkReceipt(receipt);
      return receipt;
    }

    const receipt: AuditSinkReceipt = {
      eventId: envelope.id,
      action: envelope.action,
      supabaseStatus: 'committed',
      timestamp: new Date().toISOString(),
    };
    recordSinkReceipt(receipt);
    return receipt;
  } catch (err) {
    const receipt: AuditSinkReceipt = {
      eventId: envelope.id,
      action: envelope.action,
      supabaseStatus: 'failed',
      errorMessage: err instanceof Error ? err.message : 'Unexpected Supabase audit error.',
      timestamp: new Date().toISOString(),
    };
    recordSinkReceipt(receipt);
    return receipt;
  }
}

/**
 * Centralized Admin Write Interceptor for Firestore + Supabase dual-sink logging.
 * Every Admin Dashboard mutation (FOB price updates, RFQ status/fulfillment transitions,
 * role edits, vault revocations, FX updates, deletions) routes through this single utility.
 */
export async function interceptAdminBatchWrite(params: {
  path: string;
  operationType: OperationType;
  event: AdminAuditEventInput;
  mutate: (batch: WriteBatch) => void;
}): Promise<NormalizedAuditEnvelope | null> {
  const { path, operationType, event, mutate } = params;
  try {
    const batch = writeBatch(db);
    mutate(batch);
    const envelope = queueNormalizedAuditInBatch(batch, event);
    await batch.commit();
    // Mirror the committed administrative action to Supabase `public.system_audit_logs`
    void dispatchSupabaseAuditEnvelope(envelope);
    return envelope;
  } catch (err) {
    handleFirestoreError(err, operationType, path);
  }
}

/**
 * Higher-order interceptor for direct Supabase Admin write operations (Vercel + Supabase mode).
 * Runs the target mutation and commits the corresponding audit record into `public.system_audit_logs`.
 */
export async function interceptSupabaseAdminWrite<T>(params: {
  event: AdminAuditEventInput;
  mutate: () => Promise<T>;
}): Promise<{ result: T; auditReceipt: AuditSinkReceipt | null }> {
  const result = await params.mutate();
  const supabase = getSupabaseClient();
  let explicitActor: { uid: string; email: string; name?: string } | undefined;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id && user.email) {
      explicitActor = {
        uid: user.id,
        email: user.email,
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          user.email.split('@')[0],
      };
    }
  }

  const envelope = buildNormalizedAuditEnvelope(params.event, explicitActor);
  const auditReceipt = await dispatchSupabaseAuditEnvelope(envelope);
  return { result, auditReceipt };
}

/**
 * Reads recent immutable audit records directly from Supabase `public.system_audit_logs`
 * when running against a live Supabase project.
 */
export async function fetchSupabaseAuditLogs(
  limit = 100,
): Promise<SystemAuditLog[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('system_audit_logs')
    .select(
      'id, category, action, severity, target_type, target_id, target_label, summary, changes, actor_uid, actor_email, actor_name, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return (data as SupabaseSystemAuditLogRow[]).map((row) => ({
    id: row.id,
    category: row.category,
    action: row.action,
    severity: row.severity,
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    summary: row.summary,
    changes: Array.isArray(row.changes) ? row.changes : [],
    actorUid: row.actor_uid,
    actorEmail: row.actor_email,
    actorName: row.actor_name,
    createdAt: row.created_at,
  }));
}
