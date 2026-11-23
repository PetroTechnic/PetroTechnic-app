import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Copy,
  Database,
  DollarSign,
  Download,
  FileText,
  Info,
  Lock,
  Package,
  Search,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  AuditCategory,
  AuditSeverity,
  SystemAuditLog,
} from '../../types/domain';
import { toSupabaseAuditRow } from '../../lib/adminAuditInterceptor';

interface AdminAuditLogsPanelProps {
  auditLogs: SystemAuditLog[];
}

const CATEGORY_META: Record<
  AuditCategory,
  { label: string; icon: typeof Package; colorClass: string }
> = {
  pricing: {
    label: 'FOB Pricing',
    icon: DollarSign,
    colorClass: 'text-[#0E4D64]',
  },
  catalog: {
    label: 'Catalog',
    icon: Package,
    colorClass: 'text-[#0B1520]',
  },
  rfq: {
    label: 'RFQ Deal Desk',
    icon: ClipboardList,
    colorClass: 'text-sky-700',
  },
  roles: {
    label: 'Role Governance',
    icon: ShieldCheck,
    colorClass: 'text-indigo-700',
  },
  documents: {
    label: 'Document Vault',
    icon: FileText,
    colorClass: 'text-teal-700',
  },
  market: {
    label: 'Market & Map',
    icon: BarChart3,
    colorClass: 'text-cyan-800',
  },
  settings: {
    label: 'Commercial Settings',
    icon: Settings,
    colorClass: 'text-slate-700',
  },
  system: {
    label: 'System',
    icon: Database,
    colorClass: 'text-[#4A5B6C]',
  },
};

const SEVERITY_META: Record<
  AuditSeverity,
  { label: string; icon: typeof Info; colorClass: string }
> = {
  info: {
    label: 'Info',
    icon: Info,
    colorClass: 'text-[#4A5B6C]',
  },
  warning: {
    label: 'Elevated',
    icon: AlertTriangle,
    colorClass: 'text-amber-700',
  },
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    colorClass: 'text-rose-700',
  },
};

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

function formatAuditTimestamp(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return { date: iso, time: '' };
  }
  const date = dt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = dt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return { date, time };
}

export function AdminAuditLogsPanel({ auditLogs }: AdminAuditLogsPanelProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AuditCategory>(
    'all',
  );
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>(
    'all',
  );
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [selected, setSelected] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pricingAndCommercialCount = useMemo(
    () =>
      auditLogs.filter(
        (l) =>
          l.category === 'pricing' ||
          l.category === 'rfq' ||
          l.category === 'settings',
      ).length,
    [auditLogs],
  );

  const governanceAndCriticalCount = useMemo(
    () =>
      auditLogs.filter(
        (l) => l.category === 'roles' || l.severity === 'critical',
      ).length,
    [auditLogs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) {
        return false;
      }
      if (severityFilter !== 'all' && log.severity !== severityFilter) {
        return false;
      }
      if (!q) return true;
      const inChanges = log.changes.some(
        (c) =>
          c.field.toLowerCase().includes(q) ||
          c.before.toLowerCase().includes(q) ||
          c.after.toLowerCase().includes(q),
      );
      return (
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        log.targetLabel.toLowerCase().includes(q) ||
        inChanges
      );
    });
  }, [auditLogs, search, categoryFilter, severityFilter]);

  const visibleRows = useMemo(
    () => filtered.slice(0, visibleLimit),
    [filtered, visibleLimit],
  );

  const handleCopyText = (key: string, value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopiedId(key);
    setTimeout(() => setCopiedId((cur) => (cur === key ? null : cur)), 1600);
  };

  const handleExportCsv = () => {
    const header = [
      'Event ID',
      'Timestamp (UTC ISO)',
      'Category',
      'Action',
      'Severity',
      'Actor Name',
      'Actor Email',
      'Actor UID',
      'Target Type',
      'Target ID',
      'Target Label',
      'Summary',
      'Field Changes',
    ];
    const rows = filtered.map((log) => {
      const diffSummary = log.changes
        .map((c) => `${c.field}: ${c.before} -> ${c.after}`)
        .join(' | ');
      return [
        log.id,
        log.createdAt,
        log.category,
        log.action,
        log.severity,
        log.actorName,
        log.actorEmail,
        log.actorUid,
        log.targetType,
        log.targetId,
        log.targetLabel,
        log.summary,
        diffSummary,
      ]
        .map(escapeCsvCell)
        .join(',');
    });

    const csvContent = [header.map(escapeCsvCell).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petrotechnics-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSupabaseJson = () => {
    const supabaseRows = filtered.map((log) =>
      toSupabaseAuditRow({
        id: log.id,
        category: log.category,
        action: log.action,
        severity: log.severity,
        targetType: log.targetType,
        targetId: log.targetId,
        targetLabel: log.targetLabel,
        summary: log.summary,
        changes: log.changes,
        actorUid: log.actorUid,
        actorEmail: log.actorEmail,
        actorName: log.actorName,
        createdAtIso: log.createdAt,
      }),
    );
    const blob = new Blob([JSON.stringify(supabaseRows, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-system_audit_logs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 3-Column Audit Telemetry Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Recorded Audit Events
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
            {auditLogs.length.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Centralized interceptor → Firestore &amp; Supabase <code className="font-mono-data">system_audit_logs</code>
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Pricing & Deal Desk Actions
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0E4D64] tabular-nums">
            {pricingAndCommercialCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Live FOB price edits, RFQ transitions & FX updates
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Governance & Critical Events
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
            {governanceAndCriticalCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Role modifications, vault revocations & record deletions
          </div>
        </div>
      </div>

      {/* Filter & Compliance Export Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#708294] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleLimit(50);
              }}
              placeholder="Search action, actor, target, diff..."
              className="ps-9 pe-3.5 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg w-64 text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as 'all' | AuditCategory);
              setVisibleLimit(50);
            }}
            className="px-3 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
          >
            <option value="all">All Categories ({auditLogs.length})</option>
            {(Object.keys(CATEGORY_META) as AuditCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].label}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value as 'all' | AuditSeverity);
              setVisibleLimit(50);
            }}
            className="px-3 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Elevated</option>
            <option value="critical">Critical</option>
          </select>

          {(search || categoryFilter !== 'all' || severityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setSeverityFilter('all');
                setVisibleLimit(50);
              }}
              className="px-2.5 py-2 text-xs font-medium text-[#4A5B6C] hover:text-[#0B1520] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <span className="text-[11px] font-mono-data text-[#708294] tabular-nums">
            Showing {visibleRows.length} of {filtered.length}
          </span>
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={handleExportSupabaseJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0E4D64] bg-white border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Supabase JSON</span>
          </button>
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1520] bg-white border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-Density Real-Time Audit Stream Table */}
      <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Timestamp</th>
                <th className="py-2.5 px-3 text-start">Category & Action</th>
                <th className="py-2.5 px-3 text-start">Operator</th>
                <th className="py-2.5 px-3 text-start">Target</th>
                <th className="py-2.5 px-3 text-start">Change Summary</th>
                <th className="py-2.5 px-3 text-start">Severity</th>
                <th className="py-2.5 px-4 text-end">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-14 px-6 text-center text-[#708294]"
                  >
                    {auditLogs.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-1.5">
                        <div className="font-semibold text-[#0B1520]">
                          Immutable Audit Stream Active — No Administrative Mutations Logged Yet
                        </div>
                        <p className="text-xs leading-relaxed">
                          Every FOB price adjustment, RFQ status transition, role assignment, vault revocation, or commercial setting change is written atomically to Firestore and streams here in real time.
                        </p>
                      </div>
                    ) : (
                      <span>
                        No audit events match the current search and filter criteria.
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map((log) => {
                  const catMeta =
                    CATEGORY_META[log.category] ?? CATEGORY_META.system;
                  const CatIcon = catMeta.icon;
                  const sevMeta =
                    SEVERITY_META[log.severity] ?? SEVERITY_META.info;
                  const SevIcon = sevMeta.icon;
                  const ts = formatAuditTimestamp(log.createdAt);
                  const firstDiff = log.changes[0];

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelected(log)}
                      className="hover:bg-[#F7F9FB] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-mono-data tabular-nums">
                        <div className="text-[#0B1520] font-medium">
                          {ts.date}
                        </div>
                        <div className="text-[11px] text-[#708294]">
                          {ts.time}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 font-semibold ${catMeta.colorClass}`}
                        >
                          <CatIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{catMeta.label}</span>
                        </div>
                        <div className="text-[11px] font-mono-data text-[#708294] mt-0.5">
                          {log.action}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#0B1520] max-w-[160px] truncate">
                          {log.actorName}
                        </div>
                        <div className="text-[11px] font-mono-data text-[#708294] max-w-[180px] truncate">
                          {log.actorEmail}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#0B1520] max-w-[180px] truncate">
                          {log.targetLabel}
                        </div>
                        <div className="text-[11px] font-mono-data text-[#708294] max-w-[180px] truncate">
                          {log.targetType}:{log.targetId}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="text-[#0B1520] line-clamp-1">
                          {log.summary}
                        </div>
                        {firstDiff && (
                          <div className="text-[11px] font-mono-data text-[#4A5B6C] mt-0.5 flex items-center gap-1 truncate tabular-nums">
                            <span className="text-[#708294]">
                              {firstDiff.field}:
                            </span>
                            <span className="line-through text-[#94A3B8] truncate max-w-[90px]">
                              {firstDiff.before}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[#0E4D64] shrink-0" />
                            <span className="font-semibold text-[#0B1520] truncate max-w-[110px]">
                              {firstDiff.after}
                            </span>
                            {log.changes.length > 1 && (
                              <span className="text-[#708294] shrink-0">
                                +{log.changes.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${sevMeta.colorClass}`}
                        >
                          <SevIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{sevMeta.label}</span>
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-end whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(log)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#0E4D64] hover:bg-[#0E4D64]/10 rounded cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > visibleLimit && (
          <div className="px-5 py-3 border-t border-[#E5EBF0] bg-[#F7F9FB] flex items-center justify-between text-xs">
            <span className="text-[#708294] font-mono-data tabular-nums">
              Displaying {visibleRows.length} of {filtered.length} matching events
            </span>
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 50)}
              className="font-semibold text-[#0E4D64] hover:underline cursor-pointer"
            >
              Load 50 More Events
            </button>
          </div>
        )}
      </div>

      {/* Forensic Event Slide-Over Inspector */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-data font-semibold text-[#0E4D64]">
                    {selected.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('eventId', selected.id)}
                    title="Copy Audit Event ID"
                    className="p-1 text-[#708294] hover:text-[#0B1520] cursor-pointer"
                  >
                    {copiedId === 'eventId' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <h3 className="font-display text-lg font-bold text-[#0B1520] truncate">
                  {selected.action}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#E5EBF0] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    Event Summary
                  </span>
                  {(() => {
                    const sev =
                      SEVERITY_META[selected.severity] ?? SEVERITY_META.info;
                    const SevIcon = sev.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 font-semibold ${sev.colorClass}`}
                      >
                        <SevIcon className="w-3.5 h-3.5" />
                        <span>{sev.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <p className="text-sm font-medium text-[#0B1520] leading-relaxed">
                  {selected.summary}
                </p>
              </div>

              {/* Structured Event Metadata */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#E5EBF0]">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Server Timestamp (UTC)
                  </dt>
                  <dd className="font-mono-data text-[#0B1520] font-medium mt-1 tabular-nums">
                    {selected.createdAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Category
                  </dt>
                  <dd className="font-semibold text-[#0B1520] mt-1">
                    {CATEGORY_META[selected.category]?.label ?? selected.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Target Resource
                  </dt>
                  <dd className="font-semibold text-[#0B1520] mt-1">
                    {selected.targetLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Document Reference
                  </dt>
                  <dd className="font-mono-data text-[#4A5B6C] mt-1 break-all">
                    {selected.targetType}/{selected.targetId}
                  </dd>
                </div>
              </dl>

              {/* Verified Operator Identity */}
              <div className="pb-5 border-b border-[#E5EBF0] space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                  Authenticated Operator
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg p-3.5">
                  <div>
                    <div className="font-semibold text-[#0B1520]">
                      {selected.actorName}
                    </div>
                    <div className="font-mono-data text-[#4A5B6C] mt-0.5 break-all">
                      {selected.actorEmail}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#708294]">
                      Firebase Auth UID
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <code className="font-mono-data text-[11px] text-[#0B1520] break-all">
                        {selected.actorUid}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyText('actorUid', selected.actorUid)}
                        className="p-1 text-[#708294] hover:text-[#0B1520] shrink-0 cursor-pointer"
                      >
                        {copiedId === 'actorUid' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Changes Diff Table */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                  Recorded Field Diffs ({selected.changes.length})
                </div>
                {selected.changes.length === 0 ? (
                  <div className="p-4 rounded-lg border border-[#E5EBF0] text-[#708294]">
                    No field-level deltas recorded for this administrative event.
                  </div>
                ) : (
                  <div className="border border-[#E5EBF0] rounded-lg overflow-hidden">
                    <table className="w-full text-start border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-[10px] font-semibold uppercase tracking-wider text-[#708294]">
                          <th className="py-2 px-3 text-start">Field</th>
                          <th className="py-2 px-3 text-start">Before</th>
                          <th className="py-2 px-3 text-start">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5EBF0] font-mono-data tabular-nums">
                        {selected.changes.map((diff, idx) => (
                          <tr key={`${diff.field}-${idx}`}>
                            <td className="py-2.5 px-3 font-sans font-medium text-[#0B1520]">
                              {diff.field}
                            </td>
                            <td className="py-2.5 px-3 text-[#708294] break-words max-w-[160px]">
                              {diff.before}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#0E4D64] break-words max-w-[180px]">
                              {diff.after}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Immutability Assurance Footer */}
              <div className="p-3.5 rounded-lg bg-[#F7F9FB] border border-[#E5EBF0] flex items-start gap-2.5 text-[11px] text-[#4A5B6C]">
                <Lock className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Centralized write interceptor: committed atomically to{' '}
                  <code className="font-mono-data text-[#0B1520]">
                    /system_audit_logs
                  </code>{' '}
                  and mirrored to Supabase{' '}
                  <code className="font-mono-data text-[#0B1520]">
                    public.system_audit_logs
                  </code>{' '}
                  (protected by RLS &amp; append-only triggers blocking all updates and deletes).
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-[#E5EBF0] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    'supabaseRow',
                    JSON.stringify(
                      toSupabaseAuditRow({
                        id: selected.id,
                        category: selected.category,
                        action: selected.action,
                        severity: selected.severity,
                        targetType: selected.targetType,
                        targetId: selected.targetId,
                        targetLabel: selected.targetLabel,
                        summary: selected.summary,
                        changes: selected.changes,
                        actorUid: selected.actorUid,
                        actorEmail: selected.actorEmail,
                        actorName: selected.actorName,
                        createdAtIso: selected.createdAt,
                      }),
                      null,
                      2,
                    ),
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0E4D64] border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
              >
                {copiedId === 'supabaseRow' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>
                  {copiedId === 'supabaseRow'
                    ? 'Copied Supabase JSON'
                    : 'Copy Supabase Row JSON'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-xs font-semibold text-[#0B1520] border border-[#CBD5E1] hover:bg-[#F7F9FB] rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
