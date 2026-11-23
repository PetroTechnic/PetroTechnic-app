import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuditCategory,
  AuditChangeDiff,
  AuditSeverity,
} from '../types/domain';

export interface SupabaseSystemAuditLogRow {
  id: string;
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  target_type: string;
  target_id: string;
  target_label: string;
  summary: string;
  changes: AuditChangeDiff[];
  actor_uid: string;
  actor_email: string;
  actor_name: string;
  created_at: string;
}

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const rawAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

function isRealSupabaseEnv(url: string, anonKey: string): boolean {
  if (!url || !anonKey) return false;
  if (url.includes('YOUR_PROJECT_REF') || anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    return false;
  }
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || /^https?:\/\/.+/.test(url);
}

let cachedClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return isRealSupabaseEnv(rawUrl, rawAnonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  if (!isRealSupabaseEnv(rawUrl, rawAnonKey)) {
    cachedClient = null;
    return null;
  }
  cachedClient = createClient(rawUrl, rawAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return cachedClient;
}
