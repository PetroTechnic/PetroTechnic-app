import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { Locale } from '../types/domain';
import {
  DOC_HUB_COPY,
  renderTemplatePlainText,
  renderTemplatePrintableHtml,
  type TradeDocumentCategory,
  type TradeDocumentTemplate,
} from '../data/documents';
import { usePlatformData } from '../context/PlatformDataContext';
import {
  createDocumentAccessLog,
  isVaultTokenRevoked,
} from '../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../lib/firebase';

interface DocumentHubProps {
  locale: Locale;
  initialDocumentId?: string | null;
}

interface VerifiedSession {
  company: string;
  email: string;
  token: string;
  verifiedAt: string;
}

type HubFilter = 'all' | TradeDocumentCategory;

export function DocumentHub({ locale, initialDocumentId }: DocumentHubProps) {
  const c = DOC_HUB_COPY[locale];
  const { documentTemplates, loading } = usePlatformData();
  const [filter, setFilter] = useState<HubFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(initialDocumentId || '');
  const [session, setSession] = useState<VerifiedSession | null>(null);

  useEffect(() => {
    if (documentTemplates.length === 0) return;
    if (
      initialDocumentId &&
      documentTemplates.some((d) => d.id === initialDocumentId)
    ) {
      setFilter('all');
      setSelectedId(initialDocumentId);
      return;
    }
    if (!selectedId || !documentTemplates.some((d) => d.id === selectedId)) {
      setSelectedId(documentTemplates[0].id);
    }
  }, [initialDocumentId, documentTemplates, selectedId]);

  const [companyInput, setCompanyInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [revokedError, setRevokedError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDocs =
    filter === 'all'
      ? documentTemplates
      : documentTemplates.filter((d) => d.category === filter);

  const activeDoc: TradeDocumentTemplate | undefined =
    filteredDocs.find((d) => d.id === selectedId) ||
    filteredDocs[0] ||
    documentTemplates[0];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setRevokedError(null);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    if (!companyInput.trim() || !emailOk || !ndaAccepted) {
      setVerifyError(c.unlockError);
      return;
    }

    setVerifying(true);
    try {
      const log = await createDocumentAccessLog(
        companyInput.trim(),
        emailInput.trim(),
      );
      setSession({
        company: log.company,
        email: log.email,
        token: log.token,
        verifiedAt: log.verifiedAt ?? new Date().toISOString(),
      });
    } catch (err) {
      setVerifyError(formatFirestoreErrorMessage(err) || c.unlockError);
    } finally {
      setVerifying(false);
    }
  };

  const triggerDownload = async (format: 'html' | 'txt') => {
    if (!session || !activeDoc) return;
    setRevokedError(null);

    // Live Superadmin revocation enforcement check against Firestore vault_revocations
    try {
      const revoked = await isVaultTokenRevoked(session.token);
      if (revoked) {
        setSession(null);
        setRevokedError(
          'Your document clearance token has been revoked by PetroTechnics Compliance. Please re-verify or contact trade@petrotechnic.co.',
        );
        return;
      }
    } catch {
      // Allow render if transient network blip while checking revocation
    }

    const watermark = {
      company: session.company,
      email: session.email,
      token: session.token,
    };

    const mime =
      format === 'html'
        ? 'text/html;charset=utf-8'
        : 'text/plain;charset=utf-8';
    const filename = `${activeDoc.code}-${activeDoc.id}.${format}`;

    const content =
      format === 'html'
        ? renderTemplatePrintableHtml(activeDoc, watermark)
        : renderTemplatePlainText(activeDoc, watermark);

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = async () => {
    if (!activeDoc) return;
    try {
      await navigator.clipboard.writeText(activeDoc.sha256);
      setCopiedId(activeDoc.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard fallback ignored safely
    }
  };

  const tabs: { id: HubFilter; label: string }[] = [
    { id: 'all', label: c.allTab },
    { id: 'commercial', label: c.commercialTab },
    { id: 'shipping', label: c.shippingTab },
    { id: 'inspection', label: c.inspectionTab },
  ];

  return (
    <section
      id="document-hub"
      className="scroll-mt-24 rounded-3xl overflow-hidden border border-[#E5EBF0] bg-white shadow-[0_28px_70px_-34px_rgba(11,21,32,0.16)]"
    >
      {/* Top Dark Deep-Petrol Secure Vault Header & Verification Gate */}
      <div className="bg-[#061E29] text-white p-7 sm:p-10 space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <p className="text-xs font-mono-data text-sky-300 tracking-wide">
              {c.eyebrow}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
              {c.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {c.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-end text-xs">
            {session ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.08] border border-sky-300/30 px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
                <div>
                  <div className="font-semibold text-white">
                    {session.company} ·{' '}
                    <span className="font-mono-data text-sky-300" dir="ltr">
                      {session.token}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">{c.verifiedState}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSession(null)}
                  className="ms-2 text-xs text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  {c.revokeAccess}
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-amber-200 bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{c.lockedState}</span>
              </div>
            )}
          </div>
        </div>

        {revokedError && (
          <div
            role="alert"
            className="flex items-center gap-2.5 text-xs font-medium text-rose-200 bg-rose-950/60 border border-rose-400/30 rounded-xl px-4 py-3"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{revokedError}</span>
          </div>
        )}

        {!session && (
          <form
            onSubmit={handleVerify}
            noValidate
            className="rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md p-5 sm:p-6 space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                {c.unlockHeading}
              </h3>
              <p className="text-xs text-slate-300">{c.unlockSub}</p>
            </div>

            {verifyError && (
              <div
                role="alert"
                className="text-xs font-medium text-amber-200 bg-amber-950/50 border border-amber-400/30 rounded-lg px-3.5 py-2.5"
              >
                {verifyError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder={c.companyPlaceholder}
                aria-label={c.companyPlaceholder}
                className="md:col-span-4 px-4 py-2.5 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-300"
              />
              <input
                type="email"
                dir="ltr"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={c.emailPlaceholder}
                aria-label={c.emailPlaceholder}
                className="md:col-span-5 px-4 py-2.5 text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-300"
              />
              <button
                type="submit"
                disabled={verifying}
                className="md:col-span-3 px-5 py-2.5 text-xs font-semibold text-[#061E29] bg-white hover:bg-sky-50 disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {verifying ? c.unlocking : c.unlockBtn}
              </button>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ndaAccepted}
                onChange={(e) => setNdaAccepted(e.target.checked)}
                className="mt-0.5 rounded border-white/30 accent-sky-400"
              />
              <span>{c.ndaLabel}</span>
            </label>
          </form>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[#4A5B6C]">
          Loading trade templates from live database...
        </div>
      ) : !activeDoc ? (
        <div className="p-12 text-center text-sm text-[#708294]">
          No trade document templates published yet. Initialize the catalog in the Admin Console.
        </div>
      ) : (
        <>
          {/* Category Filter Toolbar */}
          <div className="px-6 sm:px-9 py-4 bg-[#F7F9FB] border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex flex-wrap items-center p-1 bg-white border border-[#E5EBF0] rounded-full">
              {tabs.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFilter(tab.id);
                      const nextFirst =
                        tab.id === 'all'
                          ? documentTemplates[0]
                          : documentTemplates.find((d) => d.category === tab.id);
                      if (nextFirst) setSelectedId(nextFirst.id);
                    }}
                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="doc-hub-tab"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 bg-[#0B1520] rounded-full"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono-data text-[#708294]" dir="ltr">
              {activeDoc.code} · {activeDoc.revision}
            </div>
          </div>

          {/* Main Split: Template Roster (Left) + Institutional Document Sheet Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-e border-[#E5EBF0] divide-y divide-[#E5EBF0] bg-[#F7F9FB]/50">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedId(doc.id)}
                    className={`w-full text-start p-5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#0B1520]'
                        : 'hover:bg-white/70 text-[#4A5B6C]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className="font-mono-data font-semibold text-[#0E4D64]"
                        dir="ltr"
                      >
                        {doc.code}
                      </span>
                      <span className="text-[11px] text-[#708294]">
                        {doc.stageRef}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                      <h3 className="text-sm font-semibold text-[#0B1520] leading-snug">
                        {doc.title[locale]}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs text-[#4A5B6C] line-clamp-2 leading-relaxed">
                      {doc.summary[locale]}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 p-6 sm:p-9 space-y-6 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5EBF0]">
                <div className="space-y-0.5">
                  <div className="text-xs text-[#708294]">
                    {activeDoc.issuer[locale]}
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0B1520]">
                    {activeDoc.title[locale]}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#4A5B6C] bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64] rounded-full transition-colors cursor-pointer"
                  >
                    {copiedId === activeDoc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0E4D64]" />
                        {c.copiedHash}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {c.copyHash}
                      </>
                    )}
                  </button>

                  {session ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void triggerDownload('html')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {c.downloadHtml}
                      </button>
                      <button
                        type="button"
                        onClick={() => void triggerDownload('txt')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0E4D64] bg-[#EDF5F8] hover:bg-[#DCECF2] rounded-full transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        {c.downloadTxt}
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#708294] bg-[#F7F9FB] border border-[#E5EBF0] rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      {c.verifyToUnlock}
                    </span>
                  )}
                </div>
              </div>

              <div
                dir="ltr"
                className="rounded-2xl border border-[#CBD5E1] bg-[#FCFDFE] p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-[#0E4D64]">
                  <div>
                    <div className="font-display text-lg font-bold tracking-tight text-[#0B1520]">
                      PetroTechnics
                    </div>
                    <div className="text-[11px] text-[#4A5B6C]">
                      International Petrochemical Trading House · petrotechnic.co
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-sm font-bold tracking-wide text-[#0E4D64]">
                      {activeDoc.documentTitleEn}
                    </div>
                    <div className="text-[11px] text-[#708294] mt-0.5">
                      {activeDoc.subtitleEn}
                    </div>
                    <div className="text-[11px] font-mono-data text-[#4A5B6C] mt-1">
                      {activeDoc.code} · {c.checksumLabel}{' '}
                      {activeDoc.sha256.slice(0, 14)}…
                    </div>
                  </div>
                </div>

                {session && (
                  <div className="px-4 py-2.5 rounded-lg bg-[#EDF5F8] border border-[#CBD5E1] text-[11px] font-mono-data text-[#0E4D64] flex flex-wrap items-center justify-between gap-2">
                    <span>
                      VERIFIED COPY · {session.company} ({session.email})
                    </span>
                    <span>
                      {c.clearanceLabel}: {session.token}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {activeDoc.metadata.map((row) => (
                    <div
                      key={row.label}
                      className="pb-2 border-b border-[#E5EBF0] flex flex-col"
                    >
                      <span className="text-[11px] text-[#708294]">
                        {row.label}
                      </span>
                      <span className="font-semibold text-[#0B1520] mt-0.5">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative overflow-x-auto rounded-xl border border-[#E5EBF0] bg-white">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-[#4A5B6C]">
                        {activeDoc.tableHeaders.map((h) => (
                          <th
                            key={h}
                            className="text-left py-2.5 px-3 font-semibold"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y divide-[#E5EBF0] ${
                        !session ? 'select-none blur-[2.5px] opacity-65' : ''
                      }`}
                    >
                      {activeDoc.lineItems.map((row) => (
                        <tr key={row.item}>
                          <td className="py-2.5 px-3 font-medium text-[#0B1520]">
                            {row.item}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                            {row.spec}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#0B1520] tabular-nums">
                            {row.quantity}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#0E4D64] font-semibold tabular-nums">
                            {row.unitPriceOrResult}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C] tabular-nums">
                            {row.totalOrMethod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!session && (
                    <div className="px-4 py-3 bg-[#F7F9FB]/95 border-t border-[#E5EBF0] text-[11px] font-medium text-[#0E4D64] flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{c.redactedNotice}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-[#4A5B6C]">
                  <ol className="list-decimal ps-5 space-y-1">
                    {activeDoc.clauses.map((clause) => (
                      <li key={clause}>{clause}</li>
                    ))}
                  </ol>
                  <div className="pt-4 mt-4 border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#708294]">
                    <span className="font-medium text-[#0B1520]">
                      {activeDoc.signatory}
                    </span>
                    <span className="font-mono-data">petrotechnic.co</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
