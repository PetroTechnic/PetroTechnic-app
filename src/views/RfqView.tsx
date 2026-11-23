import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Download } from 'lucide-react';
import type {
  CurrencyCode,
  Incoterm,
  InspectionAgency,
  Locale,
  Product,
  RfqPayload,
  RfqRecord,
} from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import {
  convertFromUsd,
  CURRENCY_COPY,
  formatMoney,
  getIndicativeUnitUsd,
} from '../data/currency';
import { usePlatformData } from '../context/PlatformDataContext';
import { createRfqInquiry } from '../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../lib/firebase';
import { LanguageSwitch } from '../components/LanguageSwitch';

export interface RfqPrefill {
  productSlug?: string;
  grade?: string;
  packaging?: string;
  destination?: string;
}

interface RfqViewProps {
  locale: Locale;
  currency: CurrencyCode;
  products: Product[];
  prefill: RfqPrefill | null;
  onChangeLocale: (locale: Locale) => void;
  onOpenPortal: () => void;
}

const INCOTERMS: Incoterm[] = ['FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'DAP'];
const INSPECTORS: InspectionAgency[] = ['SGS', 'Bureau Veritas', 'Intertek'];

export function RfqView({
  locale,
  currency,
  products,
  prefill,
  onChangeLocale,
  onOpenPortal,
}: RfqViewProps) {
  const t = UI_STRINGS[locale].rfq;
  const curCopy = CURRENCY_COPY[locale];
  const { fxRates, incotermDeltas, regionalDesks, authUser, buyerProfile } =
    usePlatformData();

  const initialProduct =
    products.find((p) => p.slug === prefill?.productSlug) || products[0];

  const [productSlug, setProductSlug] = useState(initialProduct?.slug || '');
  const [grade, setGrade] = useState(
    prefill?.grade || initialProduct?.grades[0]?.code || '',
  );
  const [quantityMt, setQuantityMt] = useState(
    String(initialProduct?.moqMt || 500),
  );
  const [destination, setDestination] = useState(prefill?.destination || '');
  const [incoterm, setIncoterm] = useState<Incoterm>('CFR');
  const [packaging, setPackaging] = useState(
    prefill?.packaging ||
      initialProduct?.packaging[0]?.en ||
      'Standard Export Packaging',
  );
  const [inspection, setInspection] = useState<InspectionAgency>('SGS');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<RfqRecord | null>(null);
  const [sessionRfqs, setSessionRfqs] = useState<RfqRecord[]>([]);

  const selectedProduct =
    products.find((p) => p.slug === productSlug) || products[0];

  // Hydrate initial defaults once Firestore products arrive
  useEffect(() => {
    if (!productSlug && products.length > 0) {
      const first =
        products.find((p) => p.slug === prefill?.productSlug) || products[0];
      setProductSlug(first.slug);
      setGrade(prefill?.grade || first.grades[0]?.code || '');
      setQuantityMt(String(first.moqMt));
      setPackaging(
        prefill?.packaging ||
          first.packaging[0]?.en ||
          'Standard Export Packaging',
      );
    }
  }, [products, productSlug, prefill]);

  useEffect(() => {
    if (!prefill) return;
    const matched = products.find((p) => p.slug === prefill.productSlug);
    if (matched) {
      setProductSlug(matched.slug);
      setGrade(prefill.grade || matched.grades[0]?.code || '');
      setQuantityMt(String(matched.moqMt));
      setPackaging(
        prefill.packaging ||
          matched.packaging[0]?.en ||
          'Standard Export Packaging',
      );
    }
    if (prefill.destination) {
      setDestination(prefill.destination);
    }
  }, [prefill, products]);

  // Auto-prefill registered buyer counterparty fields when signed in
  useEffect(() => {
    if (buyerProfile) {
      setCompanyName((prev) => prev || buyerProfile.companyName);
      setContactName((prev) => prev || buyerProfile.contactName);
      setEmail((prev) => prev || buyerProfile.email);
      setPhone((prev) => prev || buyerProfile.phone);
      setDestination((prev) => prev || buyerProfile.preferredPort);
    } else if (authUser) {
      setContactName((prev) => prev || authUser.displayName || '');
      setEmail((prev) => prev || authUser.email || '');
    }
  }, [buyerProfile, authUser]);

  const numericQty = Number(quantityMt);
  const safeQty = Number.isFinite(numericQty) && numericQty > 0 ? numericQty : 0;
  const indicativeUnitUsd = selectedProduct
    ? getIndicativeUnitUsd(selectedProduct, incoterm, incotermDeltas)
    : 0;
  const convertedUnitPrice = convertFromUsd(
    indicativeUnitUsd,
    currency,
    fxRates,
  );
  const convertedLotTotal = convertedUnitPrice * safeQty;

  const handleProductChange = (newSlug: string) => {
    setProductSlug(newSlug);
    const nextProd = products.find((p) => p.slug === newSlug);
    if (nextProd) {
      setGrade(nextProd.grades[0]?.code || '');
      setQuantityMt(String(nextProd.moqMt));
      setPackaging(nextProd.packaging[0]?.en || 'Standard Export Packaging');
    }
  };

  const handleDownloadReceipt = (record: RfqRecord) => {
    const lines = [
      `PETROTECHNICS (petrotechnic.co) — COMMERCIAL RFQ RECEIPT`,
      `====================================================================`,
      `Reference ID:   ${record.referenceId}`,
      `Submitted At:   ${record.createdAt}`,
      `Product:        ${record.productName}`,
      `Grade:          ${record.grade}`,
      `Quantity:       ${record.quantityMt.toLocaleString()} MT`,
      `Destination:    ${record.destination}`,
      `Incoterm 2020:  ${record.incoterm}`,
      `Packaging:      ${record.packaging}`,
      `Inspection:     ${record.inspection}`,
      record.currency && record.estimatedTotal
        ? `Indicative Val: ${formatMoney(record.estimatedTotal, record.currency)} (${formatMoney(record.estimatedUnitPrice || 0, record.currency)}/MT · ${record.currency})`
        : '',
      ``,
      `BUYER COUNTERPARTY`,
      `--------------------------------------------------------------------`,
      `Company:        ${record.companyName}`,
      `Contact:        ${record.contactName}`,
      `Email:          ${record.email}`,
      `Phone:          ${record.phone}`,
      record.notes ? `Notes:          ${record.notes}` : '',
      ``,
      `Commercial Desk: trade@petrotechnic.co · SLA < 24 Business Hours`,
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.referenceId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number(quantityMt);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (
      !selectedProduct ||
      !grade.trim() ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      !destination.trim() ||
      !companyName.trim() ||
      !contactName.trim() ||
      !emailValid ||
      !phone.trim()
    ) {
      setError(t.validationError);
      return;
    }

    const payload: RfqPayload = {
      productSlug: selectedProduct.slug,
      productName: selectedProduct.name.en,
      grade: grade.trim(),
      quantityMt: qty,
      destination: destination.trim(),
      incoterm,
      packaging: packaging.trim(),
      inspection,
      currency,
      estimatedUnitPrice: convertedUnitPrice,
      estimatedTotal: convertedUnitPrice * qty,
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    };

    setSubmitting(true);
    try {
      const created = await createRfqInquiry(payload);
      setSubmittedRecord(created);
      setSessionRfqs((prev) => [created, ...prev]);
    } catch (err) {
      setError(formatFirestoreErrorMessage(err) || t.validationError);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClasses =
    'w-full px-4 py-3 text-sm bg-[#F7F9FB] border border-[#E5EBF0] rounded-xl text-[#0B1520] placeholder:text-[#708294] focus:outline-none focus:border-[#0E4D64] focus:bg-white transition-colors';

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            {UI_STRINGS[locale].utility.responseSla}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0B1520]">
            {t.title}
          </h1>
          <p className="text-base text-[#4A5B6C] leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Commercial Deal Desk Form */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E5EBF0] p-7 sm:p-10 shadow-[0_24px_60px_-30px_rgba(11,21,32,0.12)]">
          {submittedRecord ? (
            <div className="space-y-7">
              <div className="flex items-start gap-4 pb-6 border-b border-[#E5EBF0]">
                <CheckCircle2 className="w-7 h-7 text-[#0E4D64] shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl font-bold text-[#0B1520]">
                    {t.successTitle}
                  </h2>
                  <p className="text-sm text-[#4A5B6C] leading-relaxed">
                    {t.successDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#F7F9FB] border border-[#E5EBF0] rounded-2xl p-6 text-sm">
                <div>
                  <div className="text-xs text-[#708294]">{t.refIdLabel}</div>
                  <div className="mt-1 font-mono-data font-bold text-[#0E4D64]" dir="ltr">
                    {submittedRecord.referenceId}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#708294]">{t.productLabel}</div>
                  <div className="mt-1 font-semibold text-[#0B1520]">
                    {submittedRecord.productName} ({submittedRecord.grade})
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#708294]">{t.quantityLabel}</div>
                  <div className="mt-1 font-mono-data font-semibold text-[#0B1520] tabular-nums">
                    {submittedRecord.quantityMt.toLocaleString()} MT · {submittedRecord.incoterm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#708294]">{t.destinationLabel}</div>
                  <div className="mt-1 font-medium text-[#0B1520]">
                    {submittedRecord.destination}
                  </div>
                </div>
                {submittedRecord.currency && submittedRecord.estimatedTotal && (
                  <div className="sm:col-span-2 pt-3 border-t border-[#E5EBF0] flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs text-[#708294]">
                      {curCopy.lotEstimate} ({submittedRecord.currency})
                    </span>
                    <span
                      className="font-mono-data text-base font-bold text-[#0E4D64] tabular-nums"
                      dir="ltr"
                    >
                      {formatMoney(
                        submittedRecord.estimatedTotal,
                        submittedRecord.currency,
                      )}{' '}
                      ·{' '}
                      {formatMoney(
                        submittedRecord.estimatedUnitPrice || 0,
                        submittedRecord.currency,
                      )}{' '}
                      / MT
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0E4D64] hover:bg-[#0B1520] rounded-full transition-colors cursor-pointer"
                >
                  <span>
                    {locale === 'fa'
                      ? 'پیگیری در پورتال مشتریان'
                      : locale === 'ar'
                        ? 'تتبع في بوابة العملاء'
                        : 'Track in Client Portal'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(submittedRecord)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadReceipt}
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedRecord(null)}
                  className="px-6 py-3 text-sm font-medium text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64] rounded-full transition-colors cursor-pointer"
                >
                  {t.newInquiry}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              {error && (
                <div
                  role="alert"
                  className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-200 rounded-xl"
                >
                  {error}
                </div>
              )}

              {/* Commodity Specification Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="rfq-product" className="block text-xs font-semibold text-[#0B1520]">
                    {t.productLabel} *
                  </label>
                  <select
                    id="rfq-product"
                    value={productSlug}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className={fieldClasses}
                  >
                    {products.map((prod) => (
                      <option key={prod.slug} value={prod.slug}>
                        {prod.name[locale]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-grade" className="block text-xs font-semibold text-[#0B1520]">
                    {t.gradeLabel} *
                  </label>
                  <select
                    id="rfq-grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className={fieldClasses}
                  >
                    {selectedProduct?.grades.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-qty" className="block text-xs font-semibold text-[#0B1520]">
                    {t.quantityLabel} *
                  </label>
                  <input
                    id="rfq-qty"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantityMt}
                    onChange={(e) => setQuantityMt(e.target.value)}
                    className={`${fieldClasses} font-mono-data`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-dest" className="block text-xs font-semibold text-[#0B1520]">
                    {t.destinationLabel} *
                  </label>
                  <input
                    id="rfq-dest"
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={t.destinationPlaceholder}
                    className={fieldClasses}
                  />
                </div>
              </div>

              {/* Incoterm, Packaging & Inspection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="rfq-incoterm" className="block text-xs font-semibold text-[#0B1520]">
                    {t.incotermLabel} *
                  </label>
                  <select
                    id="rfq-incoterm"
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                    className={`${fieldClasses} font-mono-data`}
                  >
                    {INCOTERMS.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-packaging" className="block text-xs font-semibold text-[#0B1520]">
                    {t.packagingLabel}
                  </label>
                  <select
                    id="rfq-packaging"
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value)}
                    className={fieldClasses}
                  >
                    {selectedProduct?.packaging.map((pack) => (
                      <option key={pack.en} value={pack.en}>
                        {pack[locale]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-inspector" className="block text-xs font-semibold text-[#0B1520]">
                    {t.inspectionLabel}
                  </label>
                  <select
                    id="rfq-inspector"
                    value={inspection}
                    onChange={(e) =>
                      setInspection(e.target.value as InspectionAgency)
                    }
                    className={fieldClasses}
                  >
                    {INSPECTORS.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Currency-Aware Indicative Valuation Panel (Live Firestore FOB & FX Rates) */}
              <div className="rounded-2xl bg-[#061E29] text-white p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-sky-200">
                    {curCopy.rfqValuationHeading}
                  </span>
                  <span className="font-mono-data text-slate-300" dir="ltr">
                    {currency} · 1 USD = {fxRates[currency]} {currency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <div className="text-[11px] text-slate-300">
                      {curCopy.unitEstimate} ({incoterm})
                    </div>
                    <div
                      className="mt-1 font-mono-data text-xl font-bold text-white tabular-nums"
                      dir="ltr"
                    >
                      {formatMoney(convertedUnitPrice, currency)} / MT
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <div className="text-[11px] text-slate-300">
                      {curCopy.lotEstimate} ({safeQty.toLocaleString()} MT)
                    </div>
                    <div
                      className="mt-1 font-mono-data text-xl font-bold text-sky-300 tabular-nums"
                      dir="ltr"
                    >
                      {formatMoney(convertedLotTotal, currency)}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {curCopy.rfqValuationNote}
                </p>
              </div>

              {/* Counterparty Details */}
              <div className="pt-7 border-t border-[#E5EBF0] grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="rfq-company" className="block text-xs font-semibold text-[#0B1520]">
                    {t.companyLabel} *
                  </label>
                  <input
                    id="rfq-company"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.companyPlaceholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-contact" className="block text-xs font-semibold text-[#0B1520]">
                    {t.contactLabel} *
                  </label>
                  <input
                    id="rfq-contact"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t.contactPlaceholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-email" className="block text-xs font-semibold text-[#0B1520]">
                    {t.emailLabel} *
                  </label>
                  <input
                    id="rfq-email"
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rfq-phone" className="block text-xs font-semibold text-[#0B1520]">
                    {t.phoneLabel} *
                  </label>
                  <input
                    id="rfq-phone"
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className={`${fieldClasses} font-mono-data`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rfq-notes" className="block text-xs font-semibold text-[#0B1520]">
                  {t.notesLabel}
                </label>
                <textarea
                  id="rfq-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className={fieldClasses}
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#708294]">{t.slaNote}</p>
                <button
                  type="submit"
                  disabled={submitting || products.length === 0}
                  className="px-7 py-3.5 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] disabled:opacity-60 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {submitting ? t.submitting : t.submitButton}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Sidebar: Live Commercial Desks & Session RFQ Receipts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-[#061E29] text-white p-7 space-y-5">
            <h2 className="font-display text-lg font-bold text-white">
              {UI_STRINGS[locale].footer.contactTitle}
            </h2>
            <div className="divide-y divide-white/10">
              {regionalDesks.map((desk) => (
                <div key={desk.email} className="py-4 first:pt-0 last:pb-0 space-y-1">
                  <div className="text-sm font-semibold text-white">
                    {desk.city[locale]}
                  </div>
                  <div className="text-xs text-slate-400">{desk.role[locale]}</div>
                  <div className="text-xs font-mono-data text-sky-300" dir="ltr">
                    {desk.phone} · {desk.email}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-7 space-y-4">
            <h2 className="font-display text-base font-bold text-[#0B1520]">
              {t.recentTitle}
            </h2>
            {sessionRfqs.length === 0 ? (
              <p className="text-xs text-[#708294]">{t.recentEmpty}</p>
            ) : (
              <div className="divide-y divide-[#E5EBF0]">
                {sessionRfqs.slice(0, 5).map((item) => (
                  <div key={item.referenceId} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono-data font-semibold text-[#0E4D64]" dir="ltr">
                        {item.referenceId}
                      </span>
                      <span className="font-mono-data text-[#708294] tabular-nums">
                        {item.quantityMt.toLocaleString()} MT · {item.incoterm}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#0B1520] truncate">
                      {item.productName} ({item.grade})
                    </div>
                    <div className="text-xs text-[#708294] truncate">
                      {item.companyName} · {item.destination}
                      {item.currency && item.estimatedTotal
                        ? ` · ${formatMoney(item.estimatedTotal, item.currency)}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
