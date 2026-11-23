import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Code2,
  Database,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePlatformData } from '../context/PlatformDataContext';
import {
  subscribeAdmins,
  subscribeAllInsights,
  subscribeDocumentAccessLogs,
  subscribeRfqs,
  subscribeRoleDefinitions,
  subscribeSystemAuditLogs,
} from '../lib/firestoreRepo';
import { seedDefaultRoleDefinitionsIfEmpty } from '../lib/seedDatabase';
import { formatFirestoreErrorMessage } from '../lib/firebase';
import { formatMoney } from '../data/currency';
import type {
  AdminUser,
  AppView,
  DocumentAccessLog,
  MarketInsight,
  PermissionKey,
  RfqRecord,
  RoleDefinition,
  SystemAuditLog,
} from '../types/domain';
import { AdminProductsPanel } from '../components/admin/AdminProductsPanel';
import { AdminRfqPanel } from '../components/admin/AdminRfqPanel';
import { AdminMarketPanel } from '../components/admin/AdminMarketPanel';
import { AdminDocumentsPanel } from '../components/admin/AdminDocumentsPanel';
import { AdminRolesPanel } from '../components/admin/AdminRolesPanel';
import { AdminAuditLogsPanel } from '../components/admin/AdminAuditLogsPanel';
import { AdminSettingsPanel } from '../components/admin/AdminSettingsPanel';
import { AdminApiReferencePanel } from '../components/admin/AdminApiReferencePanel';

interface AdminDashboardViewProps {
  onExitAdmin: (targetView?: AppView) => void;
}

type AdminSection =
  | 'overview'
  | 'products'
  | 'rfqs'
  | 'market'
  | 'documents'
  | 'roles'
  | 'audit'
  | 'api-reference'
  | 'settings';

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  breadcrumb: string;
  icon: typeof LayoutDashboard;
  requiredPermission: PermissionKey;
}[] = [
  {
    id: 'overview',
    label: 'Command Overview',
    breadcrumb: 'Operations Overview',
    icon: LayoutDashboard,
    requiredPermission: 'viewOverview',
  },
  {
    id: 'products',
    label: 'Products & FOB Pricing',
    breadcrumb: 'Catalog & Live FOB Pricing',
    icon: Package,
    requiredPermission: 'viewProducts',
  },
  {
    id: 'rfqs',
    label: 'RFQ Deal Desk',
    breadcrumb: 'Buyer RFQ Pipeline',
    icon: ClipboardList,
    requiredPermission: 'viewRfqs',
  },
  {
    id: 'market',
    label: 'Market & Corridors',
    breadcrumb: 'Insights, Benchmarks & Logistics',
    icon: BarChart3,
    requiredPermission: 'viewMarket',
  },
  {
    id: 'documents',
    label: 'Document Vault',
    breadcrumb: 'Trade Templates & Audit Logs',
    icon: FileText,
    requiredPermission: 'viewDocuments',
  },
  {
    id: 'roles',
    label: 'Role Management',
    breadcrumb: 'Role Definitions & Team Access',
    icon: ShieldCheck,
    requiredPermission: 'manageRoles',
  },
  {
    id: 'audit',
    label: 'System Audit Logs',
    breadcrumb: 'Immutable Administrative Audit Trail',
    icon: ScrollText,
    requiredPermission: 'manageRoles',
  },
  {
    id: 'api-reference',
    label: 'API Reference',
    breadcrumb: 'Rust Axum API Reference',
    icon: Code2,
    requiredPermission: 'viewOverview',
  },
  {
    id: 'settings',
    label: 'Commercial Settings',
    breadcrumb: 'FX Rates, Desks & Deployment',
    icon: Settings,
    requiredPermission: 'editSettings',
  },
];

export function AdminDashboardView({ onExitAdmin }: AdminDashboardViewProps) {
  const {
    products,
    corridors,
    insights: publicInsights,
    historicalPrices,
    documentTemplates,
    settings,
    fxRates,
    isDatabaseEmpty,
    authUser,
    authLoading,
    adminRole,
    adminRoleName,
    userPermissions,
    hasConsoleAccess,
    isSuperAdmin,
    seeding,
    authError,
    signInWithGoogle,
    signOutUser,
    triggerSeedDatabase,
  } = usePlatformData();

  const [section, setSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin-privileged live Firestore streams
  const [rfqs, setRfqs] = useState<RfqRecord[]>([]);
  const [allInsights, setAllInsights] = useState<MarketInsight[]>([]);
  const [accessLogs, setAccessLogs] = useState<DocumentAccessLog[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [initializingRoles, setInitializingRoles] = useState(false);
  const [adminStreamError, setAdminStreamError] = useState<string | null>(null);
  const autoRoleSeedAttemptedRef = useRef(false);

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => isSuperAdmin || userPermissions[item.requiredPermission],
      ),
    [isSuperAdmin, userPermissions],
  );

  // Keep selected section valid for the current operator's granular permissions
  useEffect(() => {
    if (
      visibleNavItems.length > 0 &&
      !visibleNavItems.some((item) => item.id === section)
    ) {
      setSection(visibleNavItems[0].id);
    }
  }, [visibleNavItems, section]);

  useEffect(() => {
    if (!hasConsoleAccess) {
      setRfqs([]);
      setAllInsights([]);
      setAccessLogs([]);
      setAdmins([]);
      setRoleDefinitions([]);
      setAuditLogs([]);
      setRolesLoaded(false);
      return;
    }

    const onErr = (err: Error) => {
      setAdminStreamError(formatFirestoreErrorMessage(err));
    };

    const unsubs: (() => void)[] = [];
    if (isSuperAdmin) {
      unsubs.push(subscribeRfqs(setRfqs, onErr));
      unsubs.push(subscribeAllInsights(setAllInsights, onErr));
      unsubs.push(subscribeDocumentAccessLogs(setAccessLogs, onErr));
      unsubs.push(subscribeAdmins(setAdmins, onErr));
      unsubs.push(subscribeSystemAuditLogs(setAuditLogs, onErr));
      unsubs.push(
        subscribeRoleDefinitions((roles) => {
          setRoleDefinitions(roles);
          setRolesLoaded(true);
        }, onErr),
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isSuperAdmin, hasConsoleAccess]);

  const handleInitializeDefaultRoles = useCallback(async () => {
    if (!isSuperAdmin) return;
    setInitializingRoles(true);
    setAdminStreamError(null);
    try {
      await seedDefaultRoleDefinitionsIfEmpty();
    } catch (err) {
      setAdminStreamError(formatFirestoreErrorMessage(err));
    } finally {
      setInitializingRoles(false);
    }
  }, [isSuperAdmin]);

  // Auto-initialize the 4 baseline role definitions once on already-seeded databases
  useEffect(() => {
    if (
      isSuperAdmin &&
      rolesLoaded &&
      roleDefinitions.length === 0 &&
      !initializingRoles &&
      !seeding &&
      !autoRoleSeedAttemptedRef.current
    ) {
      autoRoleSeedAttemptedRef.current = true;
      void handleInitializeDefaultRoles();
    }
  }, [
    isSuperAdmin,
    rolesLoaded,
    roleDefinitions.length,
    initializingRoles,
    seeding,
    handleInitializeDefaultRoles,
  ]);

  const openRfqs = useMemo(
    () =>
      rfqs.filter((r) => r.status === 'received' || r.status === 'reviewing'),
    [rfqs],
  );

  const estimatedPipelineUsd = useMemo(() => {
    return rfqs
      .filter((r) => r.status !== 'archived')
      .reduce((acc, r) => {
        const val = r.estimatedTotal ?? 0;
        const curr = r.currency ?? 'USD';
        const rate = fxRates[curr] || 1;
        return acc + val / rate;
      }, 0);
  }, [rfqs, fxRates]);

  const activeVaultClearances = useMemo(
    () => accessLogs.filter((l) => l.status === 'active').length,
    [accessLogs],
  );

  const activeNav =
    visibleNavItems.find((i) => i.id === section) ??
    visibleNavItems[0] ??
    NAV_ITEMS[0];

  // ---------------------------------------------------------------------------
  // 1. Auth Loading Gate
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div
        dir="ltr"
        className="min-h-screen bg-[#061E29] text-white flex items-center justify-center p-6"
      >
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          <span>Verifying PetroTechnics Admin session...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Unauthenticated Corporate Sign-In Gate
  // ---------------------------------------------------------------------------
  if (!authUser) {
    return (
      <div
        dir="ltr"
        className="min-h-screen bg-[#061E29] text-white flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-md bg-white text-[#0B1520] rounded-2xl p-8 border border-white/10 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E4D64] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>PetroTechnics Operations</span>
            </div>
            <button
              type="button"
              onClick={() => onExitAdmin('home')}
              className="text-xs font-medium text-[#708294] hover:text-[#0B1520] inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[#0B1520]">
              Superadmin Console Sign-In
            </h1>
            <p className="text-xs text-[#4A5B6C] leading-relaxed">
              Authenticate with your authorized Google corporate account to manage live FOB pricing, buyer RFQ pipelines, document clearances, and market intelligence.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-xl transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Continue with Google Workspace</span>
          </button>

          <p className="text-[11px] text-[#708294] text-center leading-relaxed">
            Role-based Firestore security rules enforce strict access control. Unauthorized accounts cannot read buyer PII or modify catalog records.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Authenticated but Unauthorized RBAC Gate
  // ---------------------------------------------------------------------------
  if (!hasConsoleAccess) {
    return (
      <div
        dir="ltr"
        className="min-h-screen bg-[#061E29] text-white flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-md bg-white text-[#0B1520] rounded-2xl p-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Access Restricted</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
            No Active Operator Role
          </h1>
          <p className="text-xs text-[#4A5B6C] leading-relaxed">
            You are signed in as{' '}
            <span className="font-mono-data font-semibold text-[#0B1520]">
              {authUser.email}
            </span>
            , which does not currently hold an active role in the PetroTechnics RBAC directory. Provide your Firebase UID below to a Superadmin for onboarding:
          </p>
          <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E5EBF0] font-mono-data text-[11px] text-[#0B1520] break-all">
            {authUser.uid}
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onExitAdmin('home')}
              className="px-4 py-2 text-xs font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
            >
              Return to Storefront
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Full-Screen Authenticated Superadmin Workspace
  // ---------------------------------------------------------------------------
  return (
    <div dir="ltr" className="min-h-screen bg-[#F7F9FB] text-[#0B1520] flex">
      {/* Fixed 260px Deep-Petrol Sidebar (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 bg-[#061E29] text-white border-r border-white/10 fixed inset-y-0 start-0 z-30">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0E4D64] border border-sky-400/30 flex items-center justify-center font-display font-bold text-xs text-white">
              PT
            </div>
            <div>
              <div className="font-display text-sm font-bold tracking-tight leading-none">
                PetroTechnics
              </div>
              <div className="text-[10px] font-mono-data text-sky-300/80 uppercase tracking-wider mt-0.5">
                Superadmin Console
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0E4D64] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'rfqs' && openRfqs.length > 0 && (
                  <span className="font-mono-data text-[11px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 tabular-nums">
                    {openRfqs.length}
                  </span>
                )}
                {item.id === 'roles' && roleDefinitions.length > 0 && (
                  <span className="font-mono-data text-[11px] font-semibold text-sky-300/80 tabular-nums">
                    {roleDefinitions.length}
                  </span>
                )}
                {item.id === 'audit' && auditLogs.length > 0 && (
                  <span className="font-mono-data text-[11px] font-semibold text-slate-300/80 tabular-nums">
                    {auditLogs.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px]">
            <div className="font-semibold text-white truncate">
              {authUser.displayName || 'Superadmin'}
            </div>
            <div className="text-slate-400 font-mono-data truncate">
              {authUser.email}
            </div>
            <div className="text-sky-300 font-mono-data uppercase text-[10px] mt-0.5">
              Role: {adminRoleName || adminRole}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onExitAdmin('home')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              title="Sign Out"
              className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-[260px] bg-[#061E29] text-white h-full flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-display font-bold text-sm">
                PetroTechnics Admin
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-4 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                      section === item.id
                        ? 'bg-[#0E4D64] text-white'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => onExitAdmin('home')}
              className="w-full py-2 text-xs font-semibold bg-white/10 rounded-lg cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Fluid Workspace */}
      <div className="flex-1 lg:ms-[260px] min-w-0 flex flex-col">
        {/* 64px Contextual Breadcrumb Top Header */}
        <header className="h-16 bg-white border-b border-[#E5EBF0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#708294] truncate">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-[#0B1520] truncate">
                {activeNav.breadcrumb}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono-data text-[#4A5B6C]">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firestore Live</span>
            </span>
            <button
              type="button"
              onClick={() => onExitAdmin('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
            >
              <span>Public Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Empty Database Seed Prompt */}
          {(isDatabaseEmpty || seeding) && isSuperAdmin && (
            <div className="p-5 rounded-xl bg-white border border-[#0E4D64]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#0E4D64]">
                  {seeding
                    ? 'Initializing PetroTechnics Firestore Database...'
                    : 'Database Ready for Initial Seeding'}
                </div>
                <p className="text-xs text-[#4A5B6C]">
                  Populate the 15-commodity PetroTechnics catalog, 7 trade corridors, 12-month FOB benchmarks, 6 document templates, and FX settings in one atomic write.
                </p>
              </div>
              <button
                type="button"
                disabled={seeding}
                onClick={() => void triggerSeedDatabase(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`}
                />
                <span>
                  {seeding ? 'Seeding...' : 'Seed PetroTechnics Catalog'}
                </span>
              </button>
            </div>
          )}

          {adminStreamError && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {adminStreamError}
            </div>
          )}

          {/* OVERVIEW MODULE */}
          {section === 'overview' && (
            <div className="space-y-6">
              {/* 4-Column Crisp KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    Active Catalog Lines
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
                    {products.length}
                  </div>
                  <div className="mt-1 text-xs text-[#4A5B6C]">
                    {corridors.length} live trade corridors
                  </div>
                </div>

                <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    Open Buyer RFQs
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#0E4D64] tabular-nums">
                    {openRfqs.length}
                  </div>
                  <div className="mt-1 text-xs text-[#4A5B6C]">
                    {rfqs.length} total recorded inquiries
                  </div>
                </div>

                <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    Active Pipeline (USD Eq.)
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
                    {formatMoney(estimatedPipelineUsd, 'USD')}
                  </div>
                  <div className="mt-1 text-xs text-[#4A5B6C]">
                    Live FX: 1 USD = {fxRates.EUR} EUR · {fxRates.AED} AED
                  </div>
                </div>

                <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    Active Vault Clearances
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
                    {activeVaultClearances}
                  </div>
                  <div className="mt-1 text-xs text-[#4A5B6C]">
                    {documentTemplates.length} trade templates published
                  </div>
                </div>
              </div>

              {/* Recent RFQs Quick View */}
              <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5EBF0] flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-sm font-bold text-[#0B1520]">
                      Latest Incoming Buyer RFQs
                    </h2>
                    <p className="text-xs text-[#708294]">
                      Real-time feed from the public RFQ submission engine.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSection('rfqs')}
                    className="text-xs font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                  >
                    Open Full Deal Desk →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                        <th className="py-2.5 px-5 text-start">Ref ID</th>
                        <th className="py-2.5 px-3 text-start">Buyer</th>
                        <th className="py-2.5 px-3 text-start">Commodity</th>
                        <th className="py-2.5 px-3 text-end">Volume</th>
                        <th className="py-2.5 px-5 text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EBF0]">
                      {rfqs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 px-5 text-center text-[#708294]"
                          >
                            No RFQs submitted yet. Submit a test inquiry from the public RFQ page to see it stream live here.
                          </td>
                        </tr>
                      ) : (
                        rfqs.slice(0, 6).map((rfq) => (
                          <tr
                            key={rfq.referenceId}
                            onClick={() => setSection('rfqs')}
                            className="hover:bg-[#F7F9FB] cursor-pointer"
                          >
                            <td className="py-2.5 px-5 font-mono-data font-semibold text-[#0B1520]">
                              {rfq.referenceId}
                            </td>
                            <td className="py-2.5 px-3">
                              {rfq.companyName} · {rfq.destination}
                            </td>
                            <td className="py-2.5 px-3">
                              {rfq.productName} ({rfq.incoterm})
                            </td>
                            <td className="py-2.5 px-3 text-end font-mono-data tabular-nums">
                              {rfq.quantityMt.toLocaleString()} MT
                            </td>
                            <td className="py-2.5 px-5 text-end capitalize font-semibold text-[#0E4D64]">
                              {rfq.status}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Administrative Audit Activity Preview */}
              {(isSuperAdmin || userPermissions.manageRoles) && (
                <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5EBF0] flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-sm font-bold text-[#0B1520]">
                        Recent Administrative Audit Trail
                      </h2>
                      <p className="text-xs text-[#708294]">
                        Live append-only record of pricing updates, RFQ status changes, and role modifications.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSection('audit')}
                      className="text-xs font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                    >
                      Open System Audit Logs →
                    </button>
                  </div>
                  <div className="divide-y divide-[#E5EBF0] text-xs">
                    {auditLogs.length === 0 ? (
                      <div className="py-8 px-5 text-center text-[#708294]">
                        No administrative mutations recorded yet. Price updates, RFQ changes, and role assignments will stream here automatically.
                      </div>
                    ) : (
                      auditLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          onClick={() => setSection('audit')}
                          className="px-5 py-3 hover:bg-[#F7F9FB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-[#0B1520] truncate">
                              {log.summary}
                            </div>
                            <div className="text-[11px] font-mono-data text-[#708294] mt-0.5">
                              {log.action} · {log.actorEmail}
                            </div>
                          </div>
                          <div className="text-[11px] font-mono-data text-[#708294] tabular-nums shrink-0">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS MODULE */}
          {section === 'products' && (
            <AdminProductsPanel
              products={products}
              canEdit={isSuperAdmin || userPermissions.editProductsPricing}
              canDelete={isSuperAdmin || userPermissions.deleteRecords}
            />
          )}

          {/* RFQ PIPELINE MODULE */}
          {section === 'rfqs' && (
            <AdminRfqPanel
              rfqs={rfqs}
              canManage={isSuperAdmin || userPermissions.manageRfqs}
              canDelete={isSuperAdmin || userPermissions.deleteRecords}
            />
          )}

          {/* MARKET INSIGHTS, PRICES & CORRIDORS MODULE */}
          {section === 'market' && (
            <AdminMarketPanel
              insights={allInsights.length > 0 ? allInsights : publicInsights}
              historicalPrices={historicalPrices}
              corridors={corridors}
              canEdit={isSuperAdmin || userPermissions.editMarket}
              canDelete={isSuperAdmin || userPermissions.deleteRecords}
            />
          )}

          {/* DOCUMENT HUB & VAULT AUDIT LOGS MODULE */}
          {section === 'documents' && (
            <AdminDocumentsPanel
              templates={documentTemplates}
              accessLogs={accessLogs}
              canManage={isSuperAdmin || userPermissions.manageDocuments}
            />
          )}

          {/* ROLE MANAGEMENT & GRANULAR ACCESS LEVELS MODULE */}
          {section === 'roles' && (
            <AdminRolesPanel
              roleDefinitions={roleDefinitions}
              admins={admins}
              currentUid={authUser.uid}
              canManageRoles={isSuperAdmin || userPermissions.manageRoles}
              onInitializeDefaultRoles={handleInitializeDefaultRoles}
              initializingRoles={initializingRoles}
            />
          )}

          {/* IMMUTABLE SYSTEM AUDIT LOGS MODULE */}
          {section === 'audit' && (
            <AdminAuditLogsPanel auditLogs={auditLogs} />
          )}

          {/* DYNAMIC RUST AXUM API REFERENCE MODULE */}
          {section === 'api-reference' && (
            <AdminApiReferencePanel products={products} />
          )}

          {/* COMMERCIAL SETTINGS, FX, DESKS & DEPLOYMENT PACK MODULE */}
          {section === 'settings' && (
            <AdminSettingsPanel
              settings={settings}
              canEditSettings={isSuperAdmin || userPermissions.editSettings}
              canManageRoles={isSuperAdmin || userPermissions.manageRoles}
              isSuperAdmin={isSuperAdmin}
              roleCount={roleDefinitions.length}
              operatorCount={admins.length}
              onOpenRoleManagement={() => setSection('roles')}
              onReseed={async () => {
                await triggerSeedDatabase(true);
              }}
              seeding={seeding}
            />
          )}
        </main>
      </div>
    </div>
  );
}
