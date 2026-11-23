import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Download,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import type {
  CurrencyCode,
  Incoterm,
  PlatformSettings,
  RegionalDesk,
} from '../../types/domain';
import { savePlatformSettings } from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';
import vercelConfigRaw from '../../../vercel.json?raw';
import supabaseSqlRaw from '../../../supabase/schema_and_rls.sql?raw';
import supabaseRlsMigrationRaw from '../../../supabase/migrations/20261120_rbac_rls_policies.sql?raw';

interface AdminSettingsPanelProps {
  settings: PlatformSettings | null;
  canEditSettings: boolean;
  canManageRoles: boolean;
  isSuperAdmin: boolean;
  roleCount: number;
  operatorCount: number;
  onOpenRoleManagement: () => void;
  onReseed: () => Promise<void>;
  seeding: boolean;
}

interface SupabaseRlsRow {
  table: string;
  publicRole: string;
  buyerRole: string;
  adminMutationRule: string;
  deleteRule: string;
}

const SUPABASE_RLS_MATRIX: SupabaseRlsRow[] = [
  {
    table: 'public.products',
    publicRole: 'SELECT only',
    buyerRole: 'SELECT only',
    adminMutationRule: "INSERT/UPDATE: has_admin_permission('editProductsPricing')",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.historical_prices',
    publicRole: 'SELECT only',
    buyerRole: 'SELECT only',
    adminMutationRule: "INSERT/UPDATE: editMarket or editProductsPricing",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.platform_settings',
    publicRole: "SELECT ('global')",
    buyerRole: "SELECT ('global')",
    adminMutationRule: "INSERT/UPDATE: has_admin_permission('editSettings')",
    deleteRule: 'Denied (immutable singleton)',
  },
  {
    table: 'public.market_insights',
    publicRole: 'SELECT published',
    buyerRole: 'SELECT published',
    adminMutationRule: "Draft SELECT: viewMarket · Write: editMarket",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.trade_corridors',
    publicRole: 'SELECT only',
    buyerRole: 'SELECT only',
    adminMutationRule: "INSERT/UPDATE: has_admin_permission('editMarket')",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.document_templates',
    publicRole: 'SELECT only',
    buyerRole: 'SELECT only',
    adminMutationRule: "INSERT/UPDATE: has_admin_permission('manageDocuments')",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.rfq_inquiries',
    publicRole: 'Validated INSERT',
    buyerRole: 'SELECT own email/UID',
    adminMutationRule: "SELECT: viewRfqs · UPDATE: manageRfqs",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.buyer_profiles',
    publicRole: 'Denied',
    buyerRole: 'SELECT/INSERT/UPDATE own UID',
    adminMutationRule: "SELECT: has_admin_permission('viewRfqs')",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.document_access_logs',
    publicRole: 'INSERT (active)',
    buyerRole: 'INSERT (active)',
    adminMutationRule: "SELECT: viewDocuments · UPDATE: manageDocuments",
    deleteRule: "has_admin_permission('deleteRecords')",
  },
  {
    table: 'public.vault_revocations',
    publicRole: 'SELECT only',
    buyerRole: 'SELECT only',
    adminMutationRule: "INSERT/UPDATE: manageDocuments",
    deleteRule: "has_admin_permission('manageDocuments')",
  },
  {
    table: 'public.role_definitions',
    publicRole: 'Denied',
    buyerRole: 'Denied',
    adminMutationRule: "SELECT: is_active_admin() · Write: manageRoles",
    deleteRule: 'manageRoles (non-system only)',
  },
  {
    table: 'public.admins',
    publicRole: 'Denied',
    buyerRole: 'Denied',
    adminMutationRule: 'SELECT own row · Write: manageRoles (no self-lockout)',
    deleteRule: 'manageRoles (uid <> auth.uid())',
  },
  {
    table: 'public.system_audit_logs',
    publicRole: 'Denied',
    buyerRole: 'Denied',
    adminMutationRule: 'Append-only INSERT: active admin + verified actor_email',
    deleteRule: 'Denied (RLS + trigger immutable)',
  },
];

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminSettingsPanel({
  settings,
  canEditSettings,
  canManageRoles,
  isSuperAdmin,
  roleCount,
  operatorCount,
  onOpenRoleManagement,
  onReseed,
  seeding,
}: AdminSettingsPanelProps) {
  const [fxDraft, setFxDraft] = useState<Record<CurrencyCode, number>>(
    settings?.fxRates ?? { USD: 1, EUR: 0.92, AED: 3.6725 },
  );
  const [incotermDraft, setIncotermDraft] = useState<Record<Incoterm, number>>(
    settings?.incotermDeltas ?? {
      FOB: 0,
      FCA: 0,
      CFR: 28,
      CIF: 34,
      CPT: 42,
      DAP: 58,
    },
  );
  const [desksDraft, setDesksDraft] = useState<RegionalDesk[]>(
    settings?.regionalDesks ?? [],
  );

  const [savingSettings, setSavingSettings] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRlsSql, setShowRlsSql] = useState(false);
  const [copiedRlsSql, setCopiedRlsSql] = useState(false);

  useEffect(() => {
    if (settings) {
      setFxDraft(settings.fxRates);
      setIncotermDraft(settings.incotermDeltas);
      setDesksDraft(settings.regionalDesks);
    }
  }, [settings]);

  const flashSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const handleSaveCommercialSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !canEditSettings) return;
    setSavingSettings(true);
    setErrorMsg(null);
    try {
      await savePlatformSettings(
        {
          fxRates: fxDraft,
          incotermDeltas: incotermDraft,
          regionalDesks: desksDraft,
          faqs: settings.faqs,
        },
        settings,
      );
      flashSaved('FX rates, Incoterm allowances, and regional desks updated live.');
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopyRlsSql = async () => {
    try {
      await navigator.clipboard.writeText(supabaseRlsMigrationRaw);
      setCopiedRlsSql(true);
      setTimeout(() => setCopiedRlsSql(false), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}
      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 inline-flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. FX Rates, Incoterms & Desks */}
      <form
        onSubmit={(e) => void handleSaveCommercialSettings(e)}
        className="bg-white border border-[#E5EBF0] rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5EBF0]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0B1520]">
              Live FX Conversion & Incoterms Freight Allowances
            </h3>
            <p className="text-xs text-[#708294]">
              Changes sync immediately to the Navbar currency toggle, Catalog cards, and RFQ estimator.
            </p>
          </div>
          {canEditSettings && (
            <button
              type="submit"
              disabled={savingSettings || !settings}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Commercial Settings'}</span>
            </button>
          )}
        </div>

        {/* FX Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['USD', 'EUR', 'AED'] as CurrencyCode[]).map((code) => (
            <div
              key={code}
              className="p-3.5 rounded-lg bg-[#F7F9FB] border border-[#E5EBF0]"
            >
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                1 USD → {code}
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.01"
                disabled={!canEditSettings || code === 'USD'}
                value={fxDraft[code]}
                onChange={(e) =>
                  setFxDraft({ ...fxDraft, [code]: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 text-sm font-mono-data tabular-nums bg-white border border-[#CBD5E1] rounded disabled:bg-[#F1F5F9]"
              />
            </div>
          ))}
        </div>

        {/* Incoterm Freight Deltas */}
        <div>
          <div className="text-xs font-semibold text-[#0B1520] mb-2.5">
            Indicative Incoterms 2020 Freight & Insurance Delta (USD / MT)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {(['FOB', 'FCA', 'CFR', 'CIF', 'CPT', 'DAP'] as Incoterm[]).map(
              (term) => (
                <div key={term}>
                  <label className="block text-[11px] font-mono-data text-[#708294] mb-1">
                    {term} (+$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEditSettings}
                    value={incotermDraft[term]}
                    onChange={(e) =>
                      setIncotermDraft({
                        ...incotermDraft,
                        [term]: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono-data tabular-nums border border-[#CBD5E1] rounded disabled:bg-[#F7F9FB]"
                  />
                </div>
              ),
            )}
          </div>
        </div>

        {/* Regional Desks */}
        <div className="pt-4 border-t border-[#E5EBF0] space-y-3">
          <div className="text-xs font-semibold text-[#0B1520]">
            Regional Commercial Desks (Footer & RFQ Routing)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {desksDraft.map((desk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-[#E5EBF0] space-y-2 text-xs"
              >
                <div className="font-semibold text-[#0B1520]">{desk.city.en}</div>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  value={desk.phone}
                  onChange={(e) => {
                    const next = [...desksDraft];
                    next[idx] = { ...next[idx], phone: e.target.value };
                    setDesksDraft(next);
                  }}
                  className="w-full px-2.5 py-1.5 font-mono-data border border-[#CBD5E1] rounded disabled:bg-[#F7F9FB]"
                  placeholder="Phone"
                />
                <input
                  type="email"
                  disabled={!canEditSettings}
                  value={desk.email}
                  onChange={(e) => {
                    const next = [...desksDraft];
                    next[idx] = { ...next[idx], email: e.target.value };
                    setDesksDraft(next);
                  }}
                  className="w-full px-2.5 py-1.5 font-mono-data border border-[#CBD5E1] rounded disabled:bg-[#F7F9FB]"
                  placeholder="Desk email"
                />
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* 2. Role Management Handoff Card */}
      {canManageRoles && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-[#0B1520] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0E4D64]" />
              <span>Granular Role Management & Team Access</span>
            </h3>
            <p className="text-xs text-[#708294]">
              Configure custom permission matrices ({roleCount} defined roles) and assign granular access levels across {operatorCount} internal team operator{operatorCount === 1 ? '' : 's'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRoleManagement}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span>Open Role Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Supabase Row-Level Security (RLS) Policy Matrix & Vercel Deployment Pack */}
      <div className="bg-white border border-[#E5EBF0] rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5EBF0]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0B1520] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0E4D64]" />
              <span>Supabase Row-Level Security (RLS) & Vercel Deployment Pack</span>
            </h3>
            <p className="text-xs text-[#708294] mt-1">
              Hardened PostgreSQL RLS policies across all 13 tables: regular users (anon &amp; authenticated buyers) are strictly read-only on catalog pricing, benchmarks, and settings; only verified active admins with explicit RBAC permissions can mutate records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'vercel.json',
                  vercelConfigRaw,
                  'application/json',
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B1520] border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>vercel.json</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  '20261120_rbac_rls_policies.sql',
                  supabaseRlsMigrationRaw,
                  'text/sql',
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B1520] border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>RLS Migration Only (.sql)</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'supabase_schema_and_rls.sql',
                  supabaseSqlRaw,
                  'text/sql',
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0E4D64] hover:bg-[#0B1520] rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Schema + RLS (.sql)</span>
            </button>
          </div>
        </div>

        {/* Role-Based RLS Enforcement Matrix */}
        <div className="overflow-x-auto border border-[#E5EBF0] rounded-lg">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-3 text-start">Supabase Table</th>
                <th className="py-2.5 px-3 text-start">Public / Anon</th>
                <th className="py-2.5 px-3 text-start">Regular Buyer</th>
                <th className="py-2.5 px-3 text-start">Authenticated Admin Rule</th>
                <th className="py-2.5 px-3 text-start">Delete Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {SUPABASE_RLS_MATRIX.map((row) => (
                <tr key={row.table} className="hover:bg-[#F7F9FB]">
                  <td className="py-2 px-3 font-mono-data font-semibold text-[#0B1520] whitespace-nowrap">
                    {row.table}
                  </td>
                  <td className="py-2 px-3 text-[#4A5B6C] whitespace-nowrap">
                    {row.publicRole}
                  </td>
                  <td className="py-2 px-3 text-[#4A5B6C] whitespace-nowrap">
                    {row.buyerRole}
                  </td>
                  <td className="py-2 px-3 font-mono-data text-[11px] text-[#0E4D64]">
                    {row.adminMutationRule}
                  </td>
                  <td className="py-2 px-3 font-mono-data text-[11px] text-[#4A5B6C]">
                    {row.deleteRule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Toggleable SQL Inspector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowRlsSql((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64] hover:text-[#0B1520] cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>
              {showRlsSql
                ? 'Hide RLS Policy Migration SQL'
                : 'Inspect RLS Policy Migration SQL'}
            </span>
          </button>
          {showRlsSql && (
            <button
              type="button"
              onClick={() => void handleCopyRlsSql()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:border-[#0E4D64] rounded-lg cursor-pointer"
            >
              {copiedRlsSql ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedRlsSql ? 'Copied SQL' : 'Copy RLS SQL'}</span>
            </button>
          )}
        </div>

        {showRlsSql && (
          <pre className="max-h-80 overflow-auto rounded-lg bg-[#061E29] text-slate-200 p-4 text-[11px] font-mono-data leading-relaxed">
            <code>{supabaseRlsMigrationRaw}</code>
          </pre>
        )}

        {isSuperAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E5EBF0]">
            <p className="text-xs text-[#4A5B6C]">
              Restore or re-initialize the baseline PetroTechnics 15-product catalog, 7 corridors, 12-month benchmarks, 6 document templates, and 4 institutional role definitions in Firestore.
            </p>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void onReseed()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`}
              />
              <span>
                {seeding ? 'Syncing Seed Data...' : 'Re-seed Baseline Catalog'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
