import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { PRODUCTS_CATALOG } from '../data/catalog';
import { FAQ_ITEMS, MARKET_INSIGHTS, REGIONAL_DESKS, TRADE_CORRIDORS } from '../data/trade';
import { TRADE_DOCUMENT_TEMPLATES } from '../data/documents';
import { INCOTERM_FREIGHT_DELTA_USD_MT, PRODUCT_FOB_USD_MT } from '../data/currency';
import { DEFAULT_ROLE_DEFINITIONS, FULL_PERMISSIONS } from '../data/roles';
import {
  dispatchSupabaseAuditEnvelope,
  queueNormalizedAuditInBatch,
} from './adminAuditInterceptor';
import type { HistoricalPricePoint } from '../types/domain';

export const INITIAL_HISTORICAL_PRICES: HistoricalPricePoint[] = [
  { id: '2025-12', month: 'Dec 25', sortOrder: 1, urea: 324, hdpe: 952, pp: 918, methanol: 292 },
  { id: '2026-01', month: 'Jan 26', sortOrder: 2, urea: 338, hdpe: 968, pp: 932, methanol: 306 },
  { id: '2026-02', month: 'Feb 26', sortOrder: 3, urea: 356, hdpe: 985, pp: 944, methanol: 318 },
  { id: '2026-03', month: 'Mar 26', sortOrder: 4, urea: 371, hdpe: 1012, pp: 968, methanol: 329 },
  { id: '2026-04', month: 'Apr 26', sortOrder: 5, urea: 348, hdpe: 1028, pp: 982, methanol: 315 },
  { id: '2026-05', month: 'May 26', sortOrder: 6, urea: 329, hdpe: 996, pp: 954, methanol: 298 },
  { id: '2026-06', month: 'Jun 26', sortOrder: 7, urea: 318, hdpe: 974, pp: 936, methanol: 289 },
  { id: '2026-07', month: 'Jul 26', sortOrder: 8, urea: 334, hdpe: 988, pp: 948, methanol: 304 },
  { id: '2026-08', month: 'Aug 26', sortOrder: 9, urea: 352, hdpe: 1018, pp: 975, methanol: 322 },
  { id: '2026-09', month: 'Sep 26', sortOrder: 10, urea: 368, hdpe: 1036, pp: 992, methanol: 338 },
  { id: '2026-10', month: 'Oct 26', sortOrder: 11, urea: 359, hdpe: 1014, pp: 978, methanol: 326 },
  { id: '2026-11', month: 'Nov 26', sortOrder: 12, urea: 374, hdpe: 1029, pp: 989, methanol: 335 },
];

export interface SeedResult {
  seeded: boolean;
  counts: {
    products: number;
    corridors: number;
    insights: number;
    historicalPrices: number;
    documentTemplates: number;
    settings: number;
  };
}

/**
 * One-time idempotent seed of the PetroTechnics operational catalog into Firestore.
 * Must be invoked by an authenticated Superadmin. If `platform_settings/global` already exists
 * and `force` is false, this is a safe no-op so admin edits are never overwritten.
 */
export async function seedInitialDatabase(force = false): Promise<SeedResult> {
  try {
    const settingsRef = doc(db, 'platform_settings', 'global');
    if (!force) {
      const existingSettings = await getDoc(settingsRef);
      if (existingSettings.exists()) {
        return {
          seeded: false,
          counts: {
            products: 0,
            corridors: 0,
            insights: 0,
            historicalPrices: 0,
            documentTemplates: 0,
            settings: 0,
          },
        };
      }
    }

    const batch = writeBatch(db);

    // 0. Seed all 4 built-in granular Role Definitions (Superadmin, Pricing Manager, Sales Lead, Read-Only Analyst)
    for (const roleDef of DEFAULT_ROLE_DEFINITIONS) {
      const roleRef = doc(db, 'role_definitions', roleDef.id);
      const existingRole = await getDoc(roleRef);
      if (!existingRole.exists()) {
        batch.set(roleRef, {
          id: roleDef.id,
          name: roleDef.name,
          description: roleDef.description,
          baseTier: roleDef.baseTier,
          isSystem: roleDef.isSystem,
          permissions: roleDef.permissions,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // 1. Ensure current superadmin is registered in admins/{uid} with granular permissions
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      const adminRef = doc(db, 'admins', currentUser.uid);
      const existingAdmin = await getDoc(adminRef);
      if (!existingAdmin.exists()) {
        batch.set(adminRef, {
          uid: currentUser.uid,
          email: currentUser.email.toLowerCase(),
          displayName: currentUser.displayName || 'PetroTechnics Superadmin',
          role: 'superadmin',
          roleId: 'superadmin',
          roleName: 'Superadmin',
          permissions: { ...FULL_PERMISSIONS },
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const data = existingAdmin.data();
        if (!data.roleId || !data.permissions) {
          batch.update(adminRef, {
            displayName: data.displayName || currentUser.displayName || 'PetroTechnics Superadmin',
            email: data.email || currentUser.email.toLowerCase(),
            role: 'superadmin',
            roleId: 'superadmin',
            roleName: 'Superadmin',
            permissions: { ...FULL_PERMISSIONS },
            status: 'active',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    // 2. Seed all 15 authentic PetroTechnics Products with live FOB USD/MT pricing
    for (const p of PRODUCTS_CATALOG) {
      batch.set(doc(db, 'products', p.slug), {
        slug: p.slug,
        category: p.category,
        shortName: p.shortName,
        formula: p.formula,
        casNumber: p.casNumber,
        hsCode: p.hsCode,
        moqMt: p.moqMt,
        fobUsdMt: PRODUCT_FOB_USD_MT[p.slug] ?? 650,
        image: p.image,
        featured: Boolean(p.featured),
        name: p.name,
        summary: p.summary,
        overview: p.overview,
        grades: p.grades,
        specs: p.specs,
        applications: p.applications,
        packaging: p.packaging,
        loadingPorts: p.loadingPorts,
        inspections: p.inspections,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Seed 7 Global Trade Corridors
    for (const c of TRADE_CORRIDORS) {
      batch.set(doc(db, 'trade_corridors', c.id), {
        id: c.id,
        modeCode: c.modeCode,
        region: c.region,
        mode: c.mode,
        loadingPorts: c.loadingPorts,
        destinations: c.destinations,
        transitDays: c.transitDays,
        commodities: c.commodities,
        summary: c.summary,
        originPoint: c.originPoint,
        targetPoint: c.targetPoint,
        curveControl: c.curveControl,
        updatedAt: serverTimestamp(),
      });
    }

    // 4. Seed 4 Trilingual Market Insights (published: true)
    for (const insight of MARKET_INSIGHTS) {
      batch.set(doc(db, 'market_insights', insight.slug), {
        slug: insight.slug,
        category: insight.category,
        categoryLabel: insight.categoryLabel,
        date: insight.date,
        readTimeMinutes: insight.readTimeMinutes,
        image: insight.image,
        title: insight.title,
        excerpt: insight.excerpt,
        sections: insight.sections,
        published: true,
        updatedAt: serverTimestamp(),
      });
    }

    // 5. Seed 12-Month Historical FOB Price Benchmark Series
    for (const pt of INITIAL_HISTORICAL_PRICES) {
      batch.set(doc(db, 'historical_prices', pt.id), {
        id: pt.id,
        month: pt.month,
        sortOrder: pt.sortOrder,
        urea: pt.urea,
        hdpe: pt.hdpe,
        pp: pt.pp,
        methanol: pt.methanol,
        updatedAt: serverTimestamp(),
      });
    }

    // 6. Seed 6 Institutional Document Hub Templates
    for (const tpl of TRADE_DOCUMENT_TEMPLATES) {
      batch.set(doc(db, 'document_templates', tpl.id), {
        id: tpl.id,
        code: tpl.code,
        category: tpl.category,
        revision: tpl.revision,
        sha256: tpl.sha256,
        stageRef: tpl.stageRef,
        issuer: tpl.issuer,
        title: tpl.title,
        summary: tpl.summary,
        documentTitleEn: tpl.documentTitleEn,
        subtitleEn: tpl.subtitleEn,
        metadata: tpl.metadata,
        tableHeaders: tpl.tableHeaders,
        lineItems: tpl.lineItems,
        clauses: tpl.clauses,
        signatory: tpl.signatory,
        updatedAt: serverTimestamp(),
      });
    }

    // 7. Seed Global Platform Commercial Settings (FX rates, Incoterms, Desks, FAQs)
    batch.set(settingsRef, {
      fxRates: { USD: 1, EUR: 0.92, AED: 3.6725 },
      incotermDeltas: { ...INCOTERM_FREIGHT_DELTA_USD_MT },
      regionalDesks: REGIONAL_DESKS,
      faqs: FAQ_ITEMS,
      updatedAt: serverTimestamp(),
    });

    const seedAuditEnvelope = queueNormalizedAuditInBatch(batch, {
      category: 'system',
      action: force ? 'system.catalog_reseeded' : 'system.catalog_seeded',
      severity: force ? 'warning' : 'info',
      targetType: 'database',
      targetId: 'petrotechnics-firestore',
      targetLabel: 'PetroTechnics Master Catalog',
      summary: `${force ? 'Re-seeded' : 'Initialized'} ${PRODUCTS_CATALOG.length} products, ${TRADE_CORRIDORS.length} corridors, ${INITIAL_HISTORICAL_PRICES.length} FOB benchmarks, ${TRADE_DOCUMENT_TEMPLATES.length} document templates, and 4 baseline roles`,
      changes: [
        { field: 'Products Seeded', before: '—', after: String(PRODUCTS_CATALOG.length) },
        { field: 'Corridors Seeded', before: '—', after: String(TRADE_CORRIDORS.length) },
        { field: 'Role Templates', before: '—', after: String(DEFAULT_ROLE_DEFINITIONS.length) },
      ],
    });

    await batch.commit();
    void dispatchSupabaseAuditEnvelope(seedAuditEnvelope);

    return {
      seeded: true,
      counts: {
        products: PRODUCTS_CATALOG.length,
        corridors: TRADE_CORRIDORS.length,
        insights: MARKET_INSIGHTS.length,
        historicalPrices: INITIAL_HISTORICAL_PRICES.length,
        documentTemplates: TRADE_DOCUMENT_TEMPLATES.length,
        settings: 1,
      },
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seedInitialDatabase');
  }
}

/**
 * Ensures the 4 baseline institutional Role Definitions exist in Firestore
 * (and upgrades the signed-in superadmin record if it predates granular permissions).
 * Safe to invoke on already-seeded databases without touching existing custom roles.
 */
export async function seedDefaultRoleDefinitionsIfEmpty(): Promise<number> {
  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const roleDef of DEFAULT_ROLE_DEFINITIONS) {
      const roleRef = doc(db, 'role_definitions', roleDef.id);
      const existing = await getDoc(roleRef);
      if (!existing.exists()) {
        batch.set(roleRef, {
          id: roleDef.id,
          name: roleDef.name,
          description: roleDef.description,
          baseTier: roleDef.baseTier,
          isSystem: roleDef.isSystem,
          permissions: roleDef.permissions,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        createdCount += 1;
      }
    }

    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      const adminRef = doc(db, 'admins', currentUser.uid);
      const existingAdmin = await getDoc(adminRef);
      if (!existingAdmin.exists()) {
        batch.set(adminRef, {
          uid: currentUser.uid,
          email: currentUser.email.toLowerCase(),
          displayName: currentUser.displayName || 'PetroTechnics Superadmin',
          role: 'superadmin',
          roleId: 'superadmin',
          roleName: 'Superadmin',
          permissions: { ...FULL_PERMISSIONS },
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        createdCount += 1;
      } else {
        const data = existingAdmin.data();
        if (!data.roleId || !data.permissions) {
          batch.update(adminRef, {
            displayName: data.displayName || currentUser.displayName || 'PetroTechnics Superadmin',
            email: data.email || currentUser.email.toLowerCase(),
            role: 'superadmin',
            roleId: 'superadmin',
            roleName: 'Superadmin',
            permissions: { ...FULL_PERMISSIONS },
            status: 'active',
            updatedAt: serverTimestamp(),
          });
          createdCount += 1;
        }
      }
    }

    if (createdCount > 0) {
      const rolesAuditEnvelope = queueNormalizedAuditInBatch(batch, {
        category: 'roles',
        action: 'system.roles_initialized',
        severity: 'info',
        targetType: 'role_definitions',
        targetId: 'baseline-roles',
        targetLabel: 'Institutional Role Templates',
        summary: `Initialized ${createdCount} baseline RBAC document${createdCount === 1 ? '' : 's'} (Superadmin, Pricing Manager, Sales Lead, Read-Only Analyst)`,
        changes: [
          { field: 'Baseline Templates', before: '0', after: String(DEFAULT_ROLE_DEFINITIONS.length) },
        ],
      });
      await batch.commit();
      void dispatchSupabaseAuditEnvelope(rolesAuditEnvelope);
    }
    return createdCount;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'role_definitions');
  }
}
