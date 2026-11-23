import type {
  AdminPermissions,
  AdminRole,
  PermissionKey,
  RoleDefinition,
} from '../types/domain';

export const PERMISSION_KEYS: PermissionKey[] = [
  'viewOverview',
  'viewProducts',
  'editProductsPricing',
  'viewRfqs',
  'manageRfqs',
  'viewMarket',
  'editMarket',
  'viewDocuments',
  'manageDocuments',
  'editSettings',
  'manageRoles',
  'deleteRecords',
];

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  shortLabel: string;
  description: string;
  level: 'read' | 'write' | 'governance';
}

export interface PermissionModuleGroup {
  id: string;
  title: string;
  subtitle: string;
  items: PermissionMeta[];
}

export const PERMISSION_MODULES: PermissionModuleGroup[] = [
  {
    id: 'overview',
    title: 'Command Overview',
    subtitle: 'Executive KPIs & live commercial telemetry',
    items: [
      {
        key: 'viewOverview',
        label: 'View Operations Overview',
        shortLabel: 'Overview',
        description: 'Access executive KPI strip, active pipeline USD valuation, and incoming RFQ feed.',
        level: 'read',
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & FOB Pricing',
    subtitle: 'Petrochemical catalog, grades, HS codes & live USD/MT pricing',
    items: [
      {
        key: 'viewProducts',
        label: 'View Catalog & FOB Pricing',
        shortLabel: 'Read Catalog',
        description: 'Inspect all polymer, fertilizer, and industrial chemical lines and export grades.',
        level: 'read',
      },
      {
        key: 'editProductsPricing',
        label: 'Edit Products & Live FOB Pricing',
        shortLabel: 'Edit Pricing',
        description: 'Create or edit commodities, update inline FOB USD/MT prices, and toggle featured listings.',
        level: 'write',
      },
    ],
  },
  {
    id: 'rfqs',
    title: 'RFQ Deal Desk',
    subtitle: 'Confidential buyer inquiries, tonnage & FCO quoting workflow',
    items: [
      {
        key: 'viewRfqs',
        label: 'View Buyer RFQs',
        shortLabel: 'Read RFQs',
        description: 'Inspect incoming buyer RFQ records, requested volumes, destinations, and contact details.',
        level: 'read',
      },
      {
        key: 'manageRfqs',
        label: 'Manage RFQ Pipeline & Desk Notes',
        shortLabel: 'Manage RFQs',
        description: 'Transition RFQ stages (Received → Quoted → Contracted) and record confidential desk notes.',
        level: 'write',
      },
    ],
  },
  {
    id: 'market',
    title: 'Market & Trade Corridors',
    subtitle: 'Trilingual research briefs, FOB benchmark charts & shipping lanes',
    items: [
      {
        key: 'viewMarket',
        label: 'View Market Intelligence & Corridors',
        shortLabel: 'Read Market',
        description: 'Access all published and draft insights, 12-month FOB series, and export corridors.',
        level: 'read',
      },
      {
        key: 'editMarket',
        label: 'Edit Insights, Benchmarks & Corridors',
        shortLabel: 'Edit Market',
        description: 'Publish/unpublish articles, update monthly Recharts FOB benchmarks, and edit corridor routes.',
        level: 'write',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Document Vault & Compliance',
    subtitle: 'Trade templates (PI, B/L, SGS, FCO, COO, COA) & buyer clearances',
    items: [
      {
        key: 'viewDocuments',
        label: 'View Templates & Vault Audit Logs',
        shortLabel: 'Read Vault',
        description: 'Inspect institutional document templates and verified buyer access token logs.',
        level: 'read',
      },
      {
        key: 'manageDocuments',
        label: 'Edit Templates & Revoke Clearances',
        shortLabel: 'Manage Vault',
        description: 'Modify standard clauses/revisions and instantly revoke or restore buyer vault tokens.',
        level: 'write',
      },
    ],
  },
  {
    id: 'governance',
    title: 'Commercial Settings & Governance',
    subtitle: 'FX rates, Incoterms deltas, role templates & destructive actions',
    items: [
      {
        key: 'editSettings',
        label: 'Edit FX Rates, Incoterms & Desks',
        shortLabel: 'Commercial Settings',
        description: 'Update USD/EUR/AED conversion rates, Incoterms 2020 freight allowances, and desk contacts.',
        level: 'governance',
      },
      {
        key: 'manageRoles',
        label: 'Manage Roles & Team Access',
        shortLabel: 'Role Management',
        description: 'Define custom access levels, edit permission matrices, and onboard/revoke team operators.',
        level: 'governance',
      },
      {
        key: 'deleteRecords',
        label: 'Delete Operational Records',
        shortLabel: 'Delete Records',
        description: 'Permanently delete products, RFQ inquiries, insights, or benchmark rows from Firestore.',
        level: 'governance',
      },
    ],
  },
];

export const EMPTY_PERMISSIONS: AdminPermissions = {
  viewOverview: false,
  viewProducts: false,
  editProductsPricing: false,
  viewRfqs: false,
  manageRfqs: false,
  viewMarket: false,
  editMarket: false,
  viewDocuments: false,
  manageDocuments: false,
  editSettings: false,
  manageRoles: false,
  deleteRecords: false,
};

export const FULL_PERMISSIONS: AdminPermissions = {
  viewOverview: true,
  viewProducts: true,
  editProductsPricing: true,
  viewRfqs: true,
  manageRfqs: true,
  viewMarket: true,
  editMarket: true,
  viewDocuments: true,
  manageDocuments: true,
  editSettings: true,
  manageRoles: true,
  deleteRecords: true,
};

export const DEFAULT_ROLE_DEFINITIONS: Omit<RoleDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'superadmin',
    name: 'Superadmin',
    description:
      'Unrestricted governance across live FOB pricing, RFQ deal desk, document vault clearances, FX settings, destructive deletes, and RBAC role management.',
    baseTier: 'superadmin',
    isSystem: true,
    permissions: { ...FULL_PERMISSIONS },
  },
  {
    id: 'pricing-manager',
    name: 'Pricing Manager',
    description:
      'Controls live FOB USD/MT benchmark pricing, catalog specifications, monthly FOB price series, trade corridors, FX conversion rates, and Incoterms freight deltas.',
    baseTier: 'editor',
    isSystem: false,
    permissions: {
      viewOverview: true,
      viewProducts: true,
      editProductsPricing: true,
      viewRfqs: true,
      manageRfqs: false,
      viewMarket: true,
      editMarket: true,
      viewDocuments: true,
      manageDocuments: false,
      editSettings: true,
      manageRoles: false,
      deleteRecords: false,
    },
  },
  {
    id: 'sales-lead',
    name: 'Sales Lead',
    description:
      'Leads the commercial RFQ deal desk, transitions buyer inquiry pipelines, maintains confidential desk notes, and oversees Document Hub buyer clearances.',
    baseTier: 'desk_agent',
    isSystem: false,
    permissions: {
      viewOverview: true,
      viewProducts: true,
      editProductsPricing: false,
      viewRfqs: true,
      manageRfqs: true,
      viewMarket: true,
      editMarket: false,
      viewDocuments: true,
      manageDocuments: true,
      editSettings: false,
      manageRoles: false,
      deleteRecords: false,
    },
  },
  {
    id: 'read-only-analyst',
    name: 'Read-Only Analyst',
    description:
      'Audit and commercial intelligence view across live pricing, RFQ pipeline, market benchmarks, and vault logs with all write and administrative mutations disabled.',
    baseTier: 'analyst',
    isSystem: false,
    permissions: {
      viewOverview: true,
      viewProducts: true,
      editProductsPricing: false,
      viewRfqs: true,
      manageRfqs: false,
      viewMarket: true,
      editMarket: false,
      viewDocuments: true,
      manageDocuments: false,
      editSettings: false,
      manageRoles: false,
      deleteRecords: false,
    },
  },
];

export function getDefaultPermissionsForTier(tier: AdminRole): AdminPermissions {
  if (tier === 'superadmin') {
    return { ...DEFAULT_ROLE_DEFINITIONS[0].permissions };
  }
  if (tier === 'editor') {
    return { ...DEFAULT_ROLE_DEFINITIONS[1].permissions };
  }
  if (tier === 'desk_agent') {
    return { ...DEFAULT_ROLE_DEFINITIONS[2].permissions };
  }
  return { ...DEFAULT_ROLE_DEFINITIONS[3].permissions };
}

export function getDefaultRoleMetaForTier(tier: AdminRole): {
  roleId: string;
  roleName: string;
} {
  if (tier === 'superadmin') return { roleId: 'superadmin', roleName: 'Superadmin' };
  if (tier === 'editor') return { roleId: 'pricing-manager', roleName: 'Pricing Manager' };
  if (tier === 'desk_agent') return { roleId: 'sales-lead', roleName: 'Sales Lead' };
  return { roleId: 'read-only-analyst', roleName: 'Read-Only Analyst' };
}

export function normalizePermissions(
  raw?: Partial<Record<string, unknown>> | null,
  fallbackTier?: AdminRole,
): AdminPermissions {
  if (!raw || typeof raw !== 'object') {
    return fallbackTier
      ? getDefaultPermissionsForTier(fallbackTier)
      : { ...EMPTY_PERMISSIONS };
  }
  const base = fallbackTier
    ? getDefaultPermissionsForTier(fallbackTier)
    : { ...EMPTY_PERMISSIONS };
  const result = { ...EMPTY_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    result[key] = typeof raw[key] === 'boolean' ? (raw[key] as boolean) : base[key];
  }
  return result;
}

export function countEnabledPermissions(perms: AdminPermissions): number {
  return PERMISSION_KEYS.reduce((sum, key) => sum + (perms[key] ? 1 : 0), 0);
}

export function deriveBaseTierFromPermissions(perms: AdminPermissions): AdminRole {
  if (perms.manageRoles) return 'superadmin';
  if (perms.editProductsPricing || perms.editMarket || perms.editSettings) {
    return 'editor';
  }
  if (perms.manageRfqs || perms.manageDocuments) {
    return 'desk_agent';
  }
  return 'analyst';
}

export function hasAnyConsolePermission(perms: AdminPermissions): boolean {
  return PERMISSION_KEYS.some((key) => perms[key]);
}
