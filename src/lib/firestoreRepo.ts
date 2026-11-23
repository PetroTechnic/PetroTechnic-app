import {
  collection,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  interceptAdminBatchWrite,
  queueNormalizedAuditInBatch,
  type AdminAuditEventInput,
} from './adminAuditInterceptor';
import type {
  AdminPermissions,
  AdminRole,
  AdminUser,
  AuditCategory,
  AuditChangeDiff,
  AuditSeverity,
  BuyerProfile,
  DocumentAccessLog,
  HistoricalPricePoint,
  MarketInsight,
  OrderFulfillmentStage,
  PlatformSettings,
  Product,
  RfqPayload,
  RfqRecord,
  RfqStatus,
  RoleDefinition,
  SystemAuditLog,
  TradeCorridor,
} from '../types/domain';
import type { TradeDocumentTemplate } from '../data/documents';
import {
  countEnabledPermissions,
  getDefaultRoleMetaForTier,
  normalizePermissions,
} from '../data/roles';

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function sanitizeDocId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export type AuditEventInput = AdminAuditEventInput;
export const queueAuditLogInBatch = queueNormalizedAuditInBatch;

export function subscribeSystemAuditLogs(
  onData: (logs: SystemAuditLog[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'system_audit_logs';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: SystemAuditLog[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          category: (raw.category as AuditCategory) ?? 'system',
          action: String(raw.action ?? ''),
          severity: (raw.severity as AuditSeverity) ?? 'info',
          targetType: String(raw.targetType ?? ''),
          targetId: String(raw.targetId ?? ''),
          targetLabel: String(raw.targetLabel ?? ''),
          summary: String(raw.summary ?? ''),
          changes: Array.isArray(raw.changes)
            ? (raw.changes as AuditChangeDiff[])
            : [],
          actorUid: String(raw.actorUid ?? ''),
          actorEmail: String(raw.actorEmail ?? ''),
          actorName: String(raw.actorName ?? ''),
          createdAt: timestampToIso(raw.createdAt),
        };
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

// -----------------------------------------------------------------------------
// 1. Products Catalog & Live FOB Pricing
// -----------------------------------------------------------------------------
export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: Product[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<Product, 'updatedAt'>),
          slug: d.id,
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) {
          return a.featured ? -1 : 1;
        }
        return a.shortName.localeCompare(b.shortName);
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveProduct(
  product: Product,
  previous?: Product | null,
): Promise<void> {
  const slug = sanitizeDocId(product.slug);
  const path = `products/${slug}`;
  const nextPrice = Number(product.fobUsdMt ?? 650);
  const nextMoq = Number(product.moqMt);
  const nextFeatured = Boolean(product.featured);

  const changes: AuditChangeDiff[] = [];
  let category: AuditCategory = 'catalog';
  let action = previous ? 'product.updated' : 'product.created';
  let severity: AuditSeverity = 'info';
  let summary = previous
    ? `Updated catalog specification for ${product.shortName.trim()}`
    : `Added new commodity line ${product.shortName.trim()} ($${nextPrice} FOB/MT)`;

  if (previous) {
    const prevPrice = Number(previous.fobUsdMt ?? 650);
    if (prevPrice !== nextPrice) {
      changes.push({
        field: 'FOB Price (USD/MT)',
        before: `$${prevPrice.toLocaleString()}`,
        after: `$${nextPrice.toLocaleString()}`,
      });
    }
    if (previous.moqMt !== nextMoq) {
      changes.push({
        field: 'MOQ (MT)',
        before: `${previous.moqMt.toLocaleString()} MT`,
        after: `${nextMoq.toLocaleString()} MT`,
      });
    }
    if (Boolean(previous.featured) !== nextFeatured) {
      changes.push({
        field: 'Featured Listing',
        before: previous.featured ? 'Featured' : 'Standard',
        after: nextFeatured ? 'Featured' : 'Standard',
      });
    }
    if (previous.shortName !== product.shortName.trim()) {
      changes.push({
        field: 'Short Name',
        before: previous.shortName,
        after: product.shortName.trim(),
      });
    }
    if (prevPrice !== nextPrice && changes.length === 1) {
      category = 'pricing';
      action = 'product.price_updated';
      severity = 'warning';
      summary = `Updated ${product.shortName.trim()} live FOB price from $${prevPrice.toLocaleString()} to $${nextPrice.toLocaleString()} USD/MT`;
    } else if (prevPrice !== nextPrice) {
      category = 'pricing';
      severity = 'warning';
      summary = `Updated ${product.shortName.trim()} catalog specs & FOB price ($${prevPrice.toLocaleString()} → $${nextPrice.toLocaleString()} USD/MT)`;
    } else if (Boolean(previous.featured) !== nextFeatured && changes.length === 1) {
      action = 'product.featured_toggled';
      summary = `${nextFeatured ? 'Promoted' : 'Removed'} ${product.shortName.trim()} ${nextFeatured ? 'to' : 'from'} homepage featured lineup`;
    }
  } else {
    changes.push(
      { field: 'Category', before: '—', after: product.category },
      { field: 'FOB Price (USD/MT)', before: '—', after: `$${nextPrice.toLocaleString()}` },
      { field: 'MOQ (MT)', before: '—', after: `${nextMoq.toLocaleString()} MT` },
    );
  }

  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category,
      action,
      severity,
      targetType: 'product',
      targetId: slug,
      targetLabel: product.shortName.trim() || slug,
      summary,
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'products', slug), {
        slug,
        category: product.category,
        shortName: product.shortName.trim(),
        formula: product.formula.trim(),
        casNumber: product.casNumber.trim(),
        hsCode: product.hsCode.trim(),
        moqMt: nextMoq,
        fobUsdMt: nextPrice,
        image: product.image.trim(),
        featured: nextFeatured,
        name: product.name,
        summary: product.summary,
        overview: product.overview,
        grades: product.grades,
        specs: product.specs,
        applications: product.applications,
        packaging: product.packaging,
        loadingPorts: product.loadingPorts,
        inspections: product.inspections,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export async function deleteProduct(
  slug: string,
  productLabel?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `products/${slug}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'catalog',
      action: 'product.deleted',
      severity: 'critical',
      targetType: 'product',
      targetId: slug,
      targetLabel: productLabel || slug,
      summary: `Permanently removed commodity ${productLabel || slug} from live catalog`,
      changes: [{ field: 'Status', before: 'Active Catalog Line', after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'products', slug));
    },
  });
}

// -----------------------------------------------------------------------------
// 2. Buyer RFQ Inquiries Pipeline
// -----------------------------------------------------------------------------
export interface RfqOrderTrackingUpdate {
  fulfillmentStage?: OrderFulfillmentStage | '';
  vesselName?: string;
  blNumber?: string;
  portOfLoading?: string;
  etaDate?: string;
  buyerNotice?: string;
}

export async function createRfqInquiry(payload: RfqPayload): Promise<RfqRecord> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(100000 + Math.random() * 900000);
  const referenceId = `PT-${yymm}-${rand}`;
  const path = `rfq_inquiries/${referenceId}`;

  const normalizedEmail = payload.email.trim().toLowerCase();
  const currentUser = auth.currentUser;
  const attachBuyerUid =
    currentUser &&
    currentUser.emailVerified &&
    currentUser.email?.toLowerCase() === normalizedEmail
      ? currentUser.uid
      : undefined;

  const docData: Record<string, unknown> = {
    referenceId,
    productSlug: payload.productSlug.trim(),
    productName: payload.productName.trim(),
    grade: payload.grade.trim(),
    quantityMt: Number(payload.quantityMt),
    destination: payload.destination.trim(),
    incoterm: payload.incoterm,
    packaging: payload.packaging.trim(),
    inspection: payload.inspection,
    currency: payload.currency ?? 'USD',
    estimatedUnitPrice: Number(payload.estimatedUnitPrice ?? 0),
    estimatedTotal: Number(payload.estimatedTotal ?? 0),
    companyName: payload.companyName.trim(),
    contactName: payload.contactName.trim(),
    email: normalizedEmail,
    phone: payload.phone.trim(),
    notes: (payload.notes ?? '').trim(),
    status: 'received' as const,
    deskNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (attachBuyerUid) {
    docData.buyerUid = attachBuyerUid;
  }

  try {
    await setDoc(doc(db, 'rfq_inquiries', referenceId), docData);
    return {
      ...payload,
      email: normalizedEmail,
      buyerUid: attachBuyerUid,
      referenceId,
      currency: (payload.currency ?? 'USD'),
      estimatedUnitPrice: Number(payload.estimatedUnitPrice ?? 0),
      estimatedTotal: Number(payload.estimatedTotal ?? 0),
      notes: (payload.notes ?? '').trim(),
      status: 'received',
      deskNotes: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeRfqs(
  onData: (rfqs: RfqRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'rfq_inquiries';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: RfqRecord[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<RfqRecord, 'createdAt' | 'updatedAt'>),
          referenceId: d.id,
          createdAt: timestampToIso(raw.createdAt),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export function subscribeBuyerRfqs(
  buyerEmail: string,
  onData: (rfqs: RfqRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'rfq_inquiries';
  const normalized = buyerEmail.trim().toLowerCase();
  const q = query(collection(db, path), where('email', '==', normalized));
  return onSnapshot(
    q,
    (snap) => {
      const list: RfqRecord[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<RfqRecord, 'createdAt' | 'updatedAt'>),
          referenceId: d.id,
          createdAt: timestampToIso(raw.createdAt),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function updateRfqStatusAndNotes(
  referenceId: string,
  status: RfqStatus,
  deskNotes: string,
  previous?: Partial<RfqRecord>,
  orderTracking?: RfqOrderTrackingUpdate,
): Promise<void> {
  const path = `rfq_inquiries/${referenceId}`;
  const trimmedNotes = deskNotes.trim();
  const changes: AuditChangeDiff[] = [];
  if (!previous || previous.status !== status) {
    changes.push({
      field: 'Pipeline Status',
      before: previous?.status ?? 'unknown',
      after: status,
    });
  }
  if (!previous || (previous.deskNotes ?? '').trim() !== trimmedNotes) {
    changes.push({
      field: 'Commercial Desk Notes',
      before: previous?.deskNotes?.trim() ? 'Recorded note' : '(empty)',
      after: trimmedNotes ? trimmedNotes.slice(0, 120) : '(cleared)',
    });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    deskNotes: trimmedNotes,
    updatedAt: serverTimestamp(),
  };

  let fulfillmentChanged = false;
  if (orderTracking) {
    const nextStage = orderTracking.fulfillmentStage || undefined;
    if (nextStage !== previous?.fulfillmentStage) {
      fulfillmentChanged = true;
      changes.push({
        field: 'Order Fulfillment Stage',
        before: previous?.fulfillmentStage ?? '(none)',
        after: nextStage ?? '(cleared)',
      });
      updatePayload.fulfillmentStage = nextStage ?? deleteField();
    }

    const trackedFields: {
      key: keyof Omit<RfqOrderTrackingUpdate, 'fulfillmentStage'>;
      label: string;
      maxLen: number;
    }[] = [
      { key: 'portOfLoading', label: 'Port of Loading', maxLen: 120 },
      { key: 'vesselName', label: 'Vessel / Carrier', maxLen: 120 },
      { key: 'blNumber', label: 'B/L Reference', maxLen: 80 },
      { key: 'etaDate', label: 'Estimated Arrival (ETA)', maxLen: 40 },
      { key: 'buyerNotice', label: 'Buyer Portal Notice', maxLen: 1000 },
    ];

    for (const f of trackedFields) {
      const nextVal = (orderTracking[f.key] ?? '').trim().slice(0, f.maxLen);
      const prevVal = (previous?.[f.key] ?? '').trim();
      if (nextVal !== prevVal) {
        fulfillmentChanged = true;
        changes.push({
          field: f.label,
          before: prevVal || '(empty)',
          after: nextVal ? nextVal.slice(0, 120) : '(cleared)',
        });
        updatePayload[f.key] = nextVal;
      }
    }
  }

  const companyLabel = previous?.companyName
    ? `${referenceId} (${previous.companyName})`
    : referenceId;

  const action =
    previous && previous.status !== status
      ? 'rfq.status_changed'
      : fulfillmentChanged
        ? 'rfq.fulfillment_updated'
        : 'rfq.notes_updated';

  const summary =
    previous && previous.status !== status
      ? `Transitioned RFQ ${referenceId} status from ${previous.status} to ${status}`
      : fulfillmentChanged
        ? `Updated active shipment fulfillment tracking on ${referenceId}`
        : `Updated internal commercial desk notes on RFQ ${referenceId}`;

  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.UPDATE,
    event: {
      category: 'rfq',
      action,
      severity: status === 'contracted' ? 'warning' : 'info',
      targetType: 'rfq_inquiry',
      targetId: referenceId,
      targetLabel: companyLabel,
      summary,
      changes,
    },
    mutate: (batch) => {
      batch.update(doc(db, 'rfq_inquiries', referenceId), updatePayload);
    },
  });
}

export async function deleteRfq(
  referenceId: string,
  companyName?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `rfq_inquiries/${referenceId}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'rfq',
      action: 'rfq.deleted',
      severity: 'critical',
      targetType: 'rfq_inquiry',
      targetId: referenceId,
      targetLabel: companyName ? `${referenceId} (${companyName})` : referenceId,
      summary: `Permanently deleted buyer RFQ ${referenceId}`,
      changes: [{ field: 'Record', before: 'Active RFQ', after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'rfq_inquiries', referenceId));
    },
  });
}

// -----------------------------------------------------------------------------
// 3. Trilingual Market Insights
// -----------------------------------------------------------------------------
export function subscribePublishedInsights(
  onData: (insights: MarketInsight[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'market_insights';
  const q = query(collection(db, path), where('published', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list: MarketInsight[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<MarketInsight, 'updatedAt'>),
          slug: d.id,
          published: Boolean(raw.published),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export function subscribeAllInsights(
  onData: (insights: MarketInsight[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'market_insights';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: MarketInsight[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<MarketInsight, 'updatedAt'>),
          slug: d.id,
          published: Boolean(raw.published),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveInsight(
  insight: MarketInsight,
  previous?: MarketInsight | null,
): Promise<void> {
  const slug = sanitizeDocId(insight.slug);
  const path = `market_insights/${slug}`;
  const published = insight.published !== false;
  const changes: AuditChangeDiff[] = [];
  if (previous) {
    if (Boolean(previous.published) !== published) {
      changes.push({
        field: 'Visibility',
        before: previous.published ? 'Published' : 'Draft',
        after: published ? 'Published' : 'Draft',
      });
    }
    if (previous.title.en !== insight.title.en) {
      changes.push({
        field: 'Title (EN)',
        before: previous.title.en,
        after: insight.title.en,
      });
    }
  } else {
    changes.push({
      field: 'Visibility',
      before: '—',
      after: published ? 'Published' : 'Draft',
    });
  }

  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'market',
      action: previous
        ? Boolean(previous.published) !== published && changes.length === 1
          ? published
            ? 'insight.published'
            : 'insight.unpublished'
          : 'insight.updated'
        : 'insight.created',
      severity: 'info',
      targetType: 'market_insight',
      targetId: slug,
      targetLabel: insight.title.en.slice(0, 140) || slug,
      summary: previous
        ? `Updated market insight "${insight.title.en.slice(0, 90)}"`
        : `Published new market insight "${insight.title.en.slice(0, 90)}"`,
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'market_insights', slug), {
        slug,
        category: insight.category,
        categoryLabel: insight.categoryLabel,
        date: insight.date.trim(),
        readTimeMinutes: Number(insight.readTimeMinutes),
        image: insight.image.trim(),
        title: insight.title,
        excerpt: insight.excerpt,
        sections: insight.sections,
        published,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export async function deleteInsight(
  slug: string,
  titleEn?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `market_insights/${slug}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'market',
      action: 'insight.deleted',
      severity: 'critical',
      targetType: 'market_insight',
      targetId: slug,
      targetLabel: titleEn || slug,
      summary: `Deleted market insight "${titleEn || slug}"`,
      changes: [{ field: 'Record', before: 'Active Article', after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'market_insights', slug));
    },
  });
}

// -----------------------------------------------------------------------------
// 4. Historical FOB Price Benchmarks (Recharts)
// -----------------------------------------------------------------------------
export function subscribeHistoricalPrices(
  onData: (rows: HistoricalPricePoint[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'historical_prices';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: HistoricalPricePoint[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          month: String(raw.month),
          sortOrder: Number(raw.sortOrder ?? 0),
          urea: Number(raw.urea),
          hdpe: Number(raw.hdpe),
          pp: Number(raw.pp),
          methanol: Number(raw.methanol),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveHistoricalPrice(
  point: HistoricalPricePoint,
  previous?: HistoricalPricePoint | null,
): Promise<void> {
  const id = sanitizeDocId(point.id);
  const path = `historical_prices/${id}`;
  const changes: AuditChangeDiff[] = [];
  if (previous) {
    for (const k of ['urea', 'hdpe', 'pp', 'methanol'] as const) {
      if (Number(previous[k]) !== Number(point[k])) {
        changes.push({
          field: `${k.toUpperCase()} FOB ($/MT)`,
          before: `$${previous[k]}`,
          after: `$${Number(point[k])}`,
        });
      }
    }
  } else {
    changes.push(
      { field: 'Urea', before: '—', after: `$${Number(point.urea)}` },
      { field: 'HDPE', before: '—', after: `$${Number(point.hdpe)}` },
      { field: 'PP', before: '—', after: `$${Number(point.pp)}` },
      { field: 'Methanol', before: '—', after: `$${Number(point.methanol)}` },
    );
  }

  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'pricing',
      action: previous ? 'benchmark.price_updated' : 'benchmark.month_added',
      severity: 'warning',
      targetType: 'historical_price',
      targetId: id,
      targetLabel: point.month.trim(),
      summary: previous
        ? `Updated ${point.month.trim()} FOB benchmark series (${changes.length} commodity rate${changes.length === 1 ? '' : 's'} modified)`
        : `Added new ${point.month.trim()} FOB benchmark pricing data point`,
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'historical_prices', id), {
        id,
        month: point.month.trim(),
        sortOrder: Number(point.sortOrder),
        urea: Number(point.urea),
        hdpe: Number(point.hdpe),
        pp: Number(point.pp),
        methanol: Number(point.methanol),
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export async function deleteHistoricalPrice(
  id: string,
  monthLabel?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `historical_prices/${id}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'pricing',
      action: 'benchmark.month_deleted',
      severity: 'critical',
      targetType: 'historical_price',
      targetId: id,
      targetLabel: monthLabel || id,
      summary: `Deleted historical FOB benchmark point ${monthLabel || id}`,
      changes: [{ field: 'Record', before: monthLabel || id, after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'historical_prices', id));
    },
  });
}

// -----------------------------------------------------------------------------
// 5. Global Trade Corridors (D3 Map)
// -----------------------------------------------------------------------------
export function subscribeCorridors(
  onData: (corridors: TradeCorridor[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'trade_corridors';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: TradeCorridor[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as Omit<TradeCorridor, 'updatedAt'>),
          id: d.id,
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => a.region.en.localeCompare(b.region.en));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveCorridor(
  corridor: TradeCorridor,
  previous?: TradeCorridor | null,
): Promise<void> {
  const id = sanitizeDocId(corridor.id);
  const path = `trade_corridors/${id}`;
  const changes: AuditChangeDiff[] = [];
  if (previous) {
    if (previous.transitDays !== corridor.transitDays.trim()) {
      changes.push({
        field: 'Transit Window',
        before: `${previous.transitDays} days`,
        after: `${corridor.transitDays.trim()} days`,
      });
    }
    if (previous.loadingPorts.join(', ') !== corridor.loadingPorts.join(', ')) {
      changes.push({
        field: 'Loading Ports',
        before: previous.loadingPorts.join(', '),
        after: corridor.loadingPorts.join(', '),
      });
    }
  }
  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'market',
      action: 'corridor.updated',
      severity: 'info',
      targetType: 'trade_corridor',
      targetId: id,
      targetLabel: corridor.region.en,
      summary: `Updated logistics corridor "${corridor.region.en}" (${corridor.transitDays.trim()} days)`,
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'trade_corridors', id), {
        id,
        modeCode: corridor.modeCode,
        region: corridor.region,
        mode: corridor.mode,
        loadingPorts: corridor.loadingPorts,
        destinations: corridor.destinations,
        transitDays: corridor.transitDays.trim(),
        commodities: corridor.commodities,
        summary: corridor.summary,
        originPoint: corridor.originPoint,
        targetPoint: corridor.targetPoint,
        curveControl: corridor.curveControl,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export async function deleteCorridor(id: string): Promise<void> {
  await interceptAdminBatchWrite({
    path: `trade_corridors/${id}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'market',
      action: 'corridor.deleted',
      severity: 'critical',
      targetType: 'trade_corridor',
      targetId: id,
      targetLabel: id,
      summary: `Deleted trade corridor ${id}`,
      changes: [{ field: 'Record', before: 'Active Corridor', after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'trade_corridors', id));
    },
  });
}

// -----------------------------------------------------------------------------
// 6. Document Hub Templates & Buyer Vault Audit Logs
// -----------------------------------------------------------------------------
export function subscribeDocumentTemplates(
  onData: (templates: TradeDocumentTemplate[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'document_templates';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: TradeDocumentTemplate[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...(raw as TradeDocumentTemplate),
          id: d.id,
        };
      });
      list.sort((a, b) => a.stageRef.localeCompare(b.stageRef));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveDocumentTemplate(
  template: TradeDocumentTemplate,
  previous?: TradeDocumentTemplate | null,
): Promise<void> {
  const id = sanitizeDocId(template.id);
  const path = `document_templates/${id}`;
  const changes: AuditChangeDiff[] = [];
  if (previous) {
    if (previous.revision !== template.revision.trim()) {
      changes.push({
        field: 'Revision',
        before: previous.revision,
        after: template.revision.trim(),
      });
    }
    if (previous.code !== template.code.trim()) {
      changes.push({
        field: 'Document Code',
        before: previous.code,
        after: template.code.trim(),
      });
    }
    if (previous.signatory !== template.signatory.trim()) {
      changes.push({
        field: 'Signatory',
        before: previous.signatory,
        after: template.signatory.trim(),
      });
    }
  }
  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'documents',
      action: 'document_template.updated',
      severity: 'info',
      targetType: 'document_template',
      targetId: id,
      targetLabel: `${template.code.trim()} (${template.revision.trim()})`,
      summary: `Updated Document Hub template ${template.code.trim()} (${template.revision.trim()})`,
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'document_templates', id), {
        id,
        code: template.code.trim(),
        category: template.category,
        revision: template.revision.trim(),
        sha256: template.sha256.trim(),
        stageRef: template.stageRef.trim(),
        issuer: template.issuer,
        title: template.title,
        summary: template.summary,
        documentTitleEn: template.documentTitleEn.trim(),
        subtitleEn: template.subtitleEn.trim(),
        metadata: template.metadata,
        tableHeaders: template.tableHeaders,
        lineItems: template.lineItems,
        clauses: template.clauses,
        signatory: template.signatory.trim(),
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export async function deleteDocumentTemplate(id: string): Promise<void> {
  await interceptAdminBatchWrite({
    path: `document_templates/${id}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'documents',
      action: 'document_template.deleted',
      severity: 'critical',
      targetType: 'document_template',
      targetId: id,
      targetLabel: id,
      summary: `Deleted Document Hub template ${id}`,
      changes: [{ field: 'Template', before: 'Active', after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'document_templates', id));
    },
  });
}

export async function createDocumentAccessLog(
  company: string,
  email: string,
): Promise<DocumentAccessLog> {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const token = `PT-DOC-${rand}`;
  const path = `document_access_logs/${token}`;
  const nowIso = new Date().toISOString();

  try {
    await setDoc(doc(db, 'document_access_logs', token), {
      token,
      company: company.trim(),
      email: email.trim().toLowerCase(),
      status: 'active',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      token,
      company: company.trim(),
      email: email.trim().toLowerCase(),
      status: 'active',
      verifiedAt: nowIso,
      updatedAt: nowIso,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeDocumentAccessLogs(
  onData: (logs: DocumentAccessLog[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'document_access_logs';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: DocumentAccessLog[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          token: d.id,
          company: String(raw.company),
          email: String(raw.email),
          status: raw.status === 'revoked' ? 'revoked' : 'active',
          verifiedAt: timestampToIso(raw.verifiedAt),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => (b.verifiedAt ?? '').localeCompare(a.verifiedAt ?? ''));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function setDocumentAccessRevoked(
  token: string,
  revoked: boolean,
  buyerLabel?: string,
): Promise<void> {
  const path = `document_access_logs/${token}`;
  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'documents',
      action: revoked ? 'vault.access_revoked' : 'vault.access_restored',
      severity: revoked ? 'critical' : 'warning',
      targetType: 'vault_token',
      targetId: token,
      targetLabel: buyerLabel ? `${token} (${buyerLabel})` : token,
      summary: revoked
        ? `Revoked Document Hub clearance ${token}${buyerLabel ? ` for ${buyerLabel}` : ''}`
        : `Restored Document Hub clearance ${token}${buyerLabel ? ` for ${buyerLabel}` : ''}`,
      changes: [
        {
          field: 'Vault Status',
          before: revoked ? 'active' : 'revoked',
          after: revoked ? 'revoked' : 'active',
        },
      ],
    },
    mutate: (batch) => {
      batch.update(doc(db, 'document_access_logs', token), {
        status: revoked ? 'revoked' : 'active',
        updatedAt: serverTimestamp(),
      });
      if (revoked) {
        batch.set(doc(db, 'vault_revocations', token), {
          token,
          revoked: true,
          revokedAt: serverTimestamp(),
        });
      } else {
        batch.delete(doc(db, 'vault_revocations', token));
      }
    },
  });
}

export async function isVaultTokenRevoked(token: string): Promise<boolean> {
  if (!token) return false;
  const path = `vault_revocations/${token}`;
  try {
    const snap = await getDoc(doc(db, 'vault_revocations', token));
    return snap.exists() && snap.data()?.revoked === true;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// -----------------------------------------------------------------------------
// 7. Platform Settings (FX Rates, Incoterms, Regional Desks, FAQs)
// -----------------------------------------------------------------------------
export function subscribePlatformSettings(
  onData: (settings: PlatformSettings | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'platform_settings/global';
  return onSnapshot(
    doc(db, 'platform_settings', 'global'),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const raw = snap.data();
      onData({
        fxRates: raw.fxRates,
        incotermDeltas: raw.incotermDeltas,
        regionalDesks: raw.regionalDesks ?? [],
        faqs: raw.faqs ?? [],
        updatedAt: timestampToIso(raw.updatedAt),
      });
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function savePlatformSettings(
  settings: PlatformSettings,
  previous?: PlatformSettings | null,
): Promise<void> {
  const path = 'platform_settings/global';
  const changes: AuditChangeDiff[] = [];
  if (previous) {
    if (previous.fxRates.EUR !== Number(settings.fxRates.EUR)) {
      changes.push({
        field: 'FX Rate (USD→EUR)',
        before: String(previous.fxRates.EUR),
        after: String(Number(settings.fxRates.EUR)),
      });
    }
    if (previous.fxRates.AED !== Number(settings.fxRates.AED)) {
      changes.push({
        field: 'FX Rate (USD→AED)',
        before: String(previous.fxRates.AED),
        after: String(Number(settings.fxRates.AED)),
      });
    }
    for (const term of ['FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'DAP'] as const) {
      if (previous.incotermDeltas[term] !== Number(settings.incotermDeltas[term])) {
        changes.push({
          field: `Incoterm ${term} Delta`,
          before: `+$${previous.incotermDeltas[term]}/MT`,
          after: `+$${Number(settings.incotermDeltas[term])}/MT`,
        });
      }
    }
  }

  await interceptAdminBatchWrite({
    path,
    operationType: OperationType.WRITE,
    event: {
      category: 'settings',
      action: 'settings.commercial_updated',
      severity: 'warning',
      targetType: 'platform_settings',
      targetId: 'global',
      targetLabel: 'FX Rates, Incoterms & Desks',
      summary:
        changes.length > 0
          ? `Updated commercial configuration (${changes.length} parameter${changes.length === 1 ? '' : 's'} changed)`
          : 'Saved commercial FX rates, Incoterm freight allowances, and regional desk directory',
      changes,
    },
    mutate: (batch) => {
      batch.set(doc(db, 'platform_settings', 'global'), {
        fxRates: {
          USD: Number(settings.fxRates.USD),
          EUR: Number(settings.fxRates.EUR),
          AED: Number(settings.fxRates.AED),
        },
        incotermDeltas: {
          FOB: Number(settings.incotermDeltas.FOB),
          CFR: Number(settings.incotermDeltas.CFR),
          CIF: Number(settings.incotermDeltas.CIF),
          FCA: Number(settings.incotermDeltas.FCA),
          CPT: Number(settings.incotermDeltas.CPT),
          DAP: Number(settings.incotermDeltas.DAP),
        },
        regionalDesks: settings.regionalDesks,
        faqs: settings.faqs,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

// -----------------------------------------------------------------------------
// 8. Granular Role Definitions & RBAC Admins Directory
// -----------------------------------------------------------------------------
export function subscribeRoleDefinitions(
  onData: (roles: RoleDefinition[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'role_definitions';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: RoleDefinition[] = snap.docs.map((d) => {
        const raw = d.data();
        const baseTier = (raw.baseTier as AdminRole) ?? 'analyst';
        return {
          id: d.id,
          name: String(raw.name ?? d.id),
          description: String(raw.description ?? ''),
          baseTier,
          isSystem: Boolean(raw.isSystem),
          permissions: normalizePermissions(
            raw.permissions as Partial<Record<string, unknown>> | undefined,
            baseTier,
          ),
          createdAt: timestampToIso(raw.createdAt),
          updatedAt: timestampToIso(raw.updatedAt),
        };
      });
      list.sort((a, b) => {
        if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveRoleDefinitionAndSyncMembers(
  roleDef: {
    id: string;
    name: string;
    description: string;
    baseTier: AdminRole;
    isSystem: boolean;
    permissions: AdminPermissions;
  },
  assignedAdmins: AdminUser[],
  isUpdate: boolean,
  previous?: RoleDefinition | null,
): Promise<void> {
  const id = sanitizeDocId(roleDef.id);
  const path = `role_definitions/${id}`;
  const cleanPerms = normalizePermissions(roleDef.permissions, roleDef.baseTier);
  const enabledCount = countEnabledPermissions(cleanPerms);
  const impactedCount = assignedAdmins.filter((a) => a.roleId === id).length;

  const changes: AuditChangeDiff[] = [];
  if (previous) {
    if (previous.name !== roleDef.name.trim()) {
      changes.push({ field: 'Role Name', before: previous.name, after: roleDef.name.trim() });
    }
    const prevCount = countEnabledPermissions(previous.permissions);
    if (prevCount !== enabledCount) {
      changes.push({
        field: 'Enabled Permissions',
        before: `${prevCount} / 12`,
        after: `${enabledCount} / 12`,
      });
    }
    if (impactedCount > 0) {
      changes.push({
        field: 'Synced Operators',
        before: `${impactedCount} assigned`,
        after: `${impactedCount} synced atomically`,
      });
    }
  } else {
    changes.push(
      { field: 'Base Tier', before: '—', after: roleDef.baseTier },
      { field: 'Enabled Permissions', before: '—', after: `${enabledCount} / 12` },
    );
  }

  await interceptAdminBatchWrite({
    path,
    operationType: isUpdate ? OperationType.UPDATE : OperationType.CREATE,
    event: {
      category: 'roles',
      action: isUpdate ? 'role.matrix_updated' : 'role.created',
      severity: 'warning',
      targetType: 'role_definition',
      targetId: id,
      targetLabel: roleDef.name.trim(),
      summary: isUpdate
        ? `Updated role "${roleDef.name.trim()}" (${enabledCount}/12 perms) and synced ${impactedCount} operator${impactedCount === 1 ? '' : 's'}`
        : `Created custom access role "${roleDef.name.trim()}" (${enabledCount}/12 perms)`,
      changes,
    },
    mutate: (batch) => {
      const roleRef = doc(db, 'role_definitions', id);
      if (isUpdate) {
        batch.update(roleRef, {
          name: roleDef.name.trim(),
          description: roleDef.description.trim(),
          baseTier: roleDef.baseTier,
          permissions: cleanPerms,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(roleRef, {
          id,
          name: roleDef.name.trim(),
          description: roleDef.description.trim(),
          baseTier: roleDef.baseTier,
          isSystem: id === 'superadmin' ? Boolean(roleDef.isSystem) : false,
          permissions: cleanPerms,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Atomically sync updated permission snapshot & role metadata onto every assigned operator
      for (const adm of assignedAdmins) {
        if (adm.roleId === id) {
          batch.update(doc(db, 'admins', adm.uid), {
            displayName: adm.displayName,
            email: adm.email,
            role: roleDef.baseTier,
            roleId: id,
            roleName: roleDef.name.trim(),
            permissions: cleanPerms,
            status: adm.status,
            updatedAt: serverTimestamp(),
          });
        }
      }
    },
  });
}

export async function deleteRoleDefinition(
  roleId: string,
  roleName?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `role_definitions/${roleId}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'roles',
      action: 'role.deleted',
      severity: 'critical',
      targetType: 'role_definition',
      targetId: roleId,
      targetLabel: roleName || roleId,
      summary: `Deleted custom role template "${roleName || roleId}"`,
      changes: [{ field: 'Role Template', before: roleName || roleId, after: 'Deleted' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'role_definitions', roleId));
    },
  });
}

function hydrateAdminUser(id: string, raw: Record<string, unknown>): AdminUser {
  const role = (raw.role as AdminRole) ?? 'analyst';
  const fallbackMeta = getDefaultRoleMetaForTier(role);
  return {
    uid: id,
    email: String(raw.email ?? ''),
    displayName: String(raw.displayName ?? ''),
    role,
    roleId: typeof raw.roleId === 'string' && raw.roleId ? raw.roleId : fallbackMeta.roleId,
    roleName:
      typeof raw.roleName === 'string' && raw.roleName ? raw.roleName : fallbackMeta.roleName,
    permissions: normalizePermissions(
      raw.permissions as Partial<Record<string, unknown>> | undefined,
      role,
    ),
    status: raw.status === 'disabled' ? 'disabled' : 'active',
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  };
}

export async function getAdminUserByUid(uid: string): Promise<AdminUser | null> {
  const path = `admins/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    if (!snap.exists()) return null;
    return hydrateAdminUser(snap.id, snap.data() as Record<string, unknown>);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeAdmins(
  onData: (admins: AdminUser[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'admins';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: AdminUser[] = snap.docs.map((d) =>
        hydrateAdminUser(d.id, d.data() as Record<string, unknown>),
      );
      list.sort((a, b) => a.email.localeCompare(b.email));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function upsertAdminUser(
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: AdminRole;
    roleId: string;
    roleName: string;
    permissions: AdminPermissions;
    status: 'active' | 'disabled';
  },
  isUpdate: boolean,
  previous?: AdminUser | null,
): Promise<void> {
  const uid = user.uid.trim();
  const path = `admins/${uid}`;
  const cleanPerms = normalizePermissions(user.permissions, user.role);
  const emailLower = user.email.trim().toLowerCase();

  const changes: AuditChangeDiff[] = [];
  let action = isUpdate ? 'operator.updated' : 'operator.onboarded';
  let severity: AuditSeverity = 'warning';
  let summary = isUpdate
    ? `Updated operator ${emailLower}`
    : `Onboarded ${emailLower} with role "${user.roleName.trim()}"`;

  if (previous) {
    if (previous.roleId !== sanitizeDocId(user.roleId)) {
      action = 'operator.role_reassigned';
      summary = `Reassigned ${emailLower} from "${previous.roleName}" to "${user.roleName.trim()}"`;
      changes.push({
        field: 'Assigned Role',
        before: previous.roleName,
        after: user.roleName.trim(),
      });
    }
    if (previous.status !== user.status) {
      action = 'operator.status_changed';
      severity = user.status === 'disabled' ? 'critical' : 'warning';
      summary =
        user.status === 'disabled'
          ? `Suspended console access for ${emailLower}`
          : `Restored console access for ${emailLower}`;
      changes.push({
        field: 'Account Status',
        before: previous.status,
        after: user.status,
      });
    }
  } else {
    changes.push(
      { field: 'Assigned Role', before: '—', after: user.roleName.trim() },
      { field: 'Account Status', before: '—', after: user.status },
    );
  }

  await interceptAdminBatchWrite({
    path,
    operationType: isUpdate ? OperationType.UPDATE : OperationType.CREATE,
    event: {
      category: 'roles',
      action,
      severity,
      targetType: 'admin_user',
      targetId: uid,
      targetLabel: `${user.displayName.trim()} (${emailLower})`,
      summary,
      changes,
    },
    mutate: (batch) => {
      const ref = doc(db, 'admins', uid);
      if (isUpdate) {
        batch.update(ref, {
          displayName: user.displayName.trim(),
          email: emailLower,
          role: user.role,
          roleId: sanitizeDocId(user.roleId),
          roleName: user.roleName.trim(),
          permissions: cleanPerms,
          status: user.status,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(ref, {
          uid,
          email: emailLower,
          displayName: user.displayName.trim(),
          role: user.role,
          roleId: sanitizeDocId(user.roleId),
          roleName: user.roleName.trim(),
          permissions: cleanPerms,
          status: user.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    },
  });
}

export async function deleteAdminUser(
  uid: string,
  operatorLabel?: string,
): Promise<void> {
  await interceptAdminBatchWrite({
    path: `admins/${uid}`,
    operationType: OperationType.DELETE,
    event: {
      category: 'roles',
      action: 'operator.removed',
      severity: 'critical',
      targetType: 'admin_user',
      targetId: uid,
      targetLabel: operatorLabel || uid,
      summary: `Removed operator ${operatorLabel || uid} from RBAC directory`,
      changes: [{ field: 'Access', before: 'Authorized Operator', after: 'Removed' }],
    },
    mutate: (batch) => {
      batch.delete(doc(db, 'admins', uid));
    },
  });
}

// -----------------------------------------------------------------------------
// 9. Client Portal — Registered Buyer Corporate Profiles
// -----------------------------------------------------------------------------
export function subscribeBuyerProfile(
  uid: string,
  onData: (profile: BuyerProfile | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = `buyer_profiles/${uid}`;
  return onSnapshot(
    doc(db, 'buyer_profiles', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const raw = snap.data();
      onData({
        uid: snap.id,
        email: String(raw.email ?? ''),
        companyName: String(raw.companyName ?? ''),
        contactName: String(raw.contactName ?? ''),
        phone: String(raw.phone ?? ''),
        country: String(raw.country ?? ''),
        preferredPort: String(raw.preferredPort ?? ''),
        taxOrRegId: String(raw.taxOrRegId ?? ''),
        preferredCurrency:
          raw.preferredCurrency === 'EUR' || raw.preferredCurrency === 'AED'
            ? raw.preferredCurrency
            : 'USD',
        createdAt: timestampToIso(raw.createdAt),
        updatedAt: timestampToIso(raw.updatedAt),
      });
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    },
  );
}

export async function saveBuyerProfile(
  profile: Omit<BuyerProfile, 'createdAt' | 'updatedAt'>,
  isUpdate: boolean,
): Promise<void> {
  const uid = profile.uid.trim();
  const path = `buyer_profiles/${uid}`;
  const cleanPayload = {
    companyName: profile.companyName.trim().slice(0, 160),
    contactName: profile.contactName.trim().slice(0, 120),
    phone: profile.phone.trim().slice(0, 40),
    country: profile.country.trim().slice(0, 80),
    preferredPort: profile.preferredPort.trim().slice(0, 120),
    taxOrRegId: profile.taxOrRegId.trim().slice(0, 64),
    preferredCurrency: profile.preferredCurrency,
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = doc(db, 'buyer_profiles', uid);
    if (isUpdate) {
      await updateDoc(ref, cleanPayload);
    } else {
      await setDoc(ref, {
        uid,
        email: profile.email.trim().toLowerCase().slice(0, 160),
        ...cleanPayload,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(
      err,
      isUpdate ? OperationType.UPDATE : OperationType.CREATE,
      path,
    );
  }
}
