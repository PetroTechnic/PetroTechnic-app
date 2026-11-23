import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import type { AppView, Locale } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { EXPORT_DOCUMENTS, INCOTERMS_LIST, TRADE_STEPS } from '../data/trade';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { DocumentHub } from '../components/DocumentHub';

interface TradeProcessViewProps {
  locale: Locale;
  initialDocumentId?: string | null;
  onChangeLocale: (locale: Locale) => void;
  onNavigate: (view: AppView) => void;
}

export function TradeProcessView({
  locale,
  initialDocumentId,
  onChangeLocale,
  onNavigate,
}: TradeProcessViewProps) {
  const t = UI_STRINGS[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const currentStep = TRADE_STEPS[activeIndex];

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            L/C · TT · SGS · Bureau Veritas · Intertek
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0B1520]">
            {t.process.title}
          </h1>
          <p className="text-base text-[#4A5B6C] leading-relaxed">
            {t.process.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('document-hub')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0E4D64] bg-[#EDF5F8] hover:bg-[#DCECF2] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {locale === 'fa'
              ? 'مرکز اسناد امن (نمونه PI، B/L و SGS)'
              : locale === 'ar'
                ? 'مركز المستندات الآمن (PI و B/L و SGS)'
                : 'Secure Document Hub (PI · B/L · SGS)'}
          </button>
          <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
        </div>
      </div>

      {/* Interactive 8-Step Horizontal Execution Rail + Animated Detail Stage */}
      <section className="space-y-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {TRADE_STEPS.map((step, index) => {
            const active = index === activeIndex;
            const past = index < activeIndex;
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`text-start p-4 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#061E29] text-white border-[#061E29] shadow-[0_16px_36px_-16px_rgba(6,30,41,0.5)]'
                    : past
                      ? 'bg-[#EDF5F8] text-[#0E4D64] border-[#0E4D64]/20 hover:border-[#0E4D64]/50'
                      : 'bg-[#F7F9FB] text-[#4A5B6C] border-[#E5EBF0] hover:bg-white hover:text-[#0B1520]'
                }`}
              >
                <div
                  className={`font-mono-data text-xs font-semibold ${
                    active ? 'text-sky-300' : 'text-[#0E4D64]'
                  }`}
                >
                  {step.stepNumber}
                </div>
                <div className="mt-1.5 text-xs font-semibold leading-snug line-clamp-2">
                  {step.title[locale]}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-7 sm:p-11">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.stepNumber}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="space-y-8"
            >
              <div className="space-y-3 pb-7 border-b border-[#E5EBF0]">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#708294]">
                  <span className="font-mono-data font-semibold text-[#0E4D64]">
                    {t.process.stepLabel} {currentStep.stepNumber} / 08
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.process.timelineLabel}: {currentStep.timeline[locale]}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1520]">
                  {currentStep.title[locale]}
                </h2>
                <p className="text-base text-[#4A5B6C] leading-relaxed max-w-3xl">
                  {currentStep.summary[locale]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#0B1520]">
                    {t.process.buyerActionLabel}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#4A5B6C] leading-relaxed">
                    {currentStep.buyerAction[locale]}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#0E4D64]">
                    {t.process.sellerActionLabel}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#4A5B6C] leading-relaxed">
                    {currentStep.petroTechnicsAction[locale]}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5EBF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs font-mono-data text-[#4A5B6C]">
                  <FileText className="w-4 h-4 text-[#0E4D64] shrink-0" />
                  <span>{currentStep.documents.join(' · ')}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.nav.requestQuote}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Incoterms 2020 Matrix */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
            {t.process.incotermsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#4A5B6C]">
            {t.process.incotermsSubtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5EBF0] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-xs font-semibold text-[#4A5B6C]">
                  <th className="text-start py-4 px-6">Incoterm</th>
                  <th className="text-start py-4 px-6">{t.process.modeLabel}</th>
                  <th className="text-start py-4 px-6">{t.process.obligationLabel}</th>
                  <th className="text-start py-4 px-6">{t.process.riskLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {INCOTERMS_LIST.map((term) => (
                  <tr key={term.code} className="hover:bg-[#F7F9FB]/80 transition-colors">
                    <td className="py-4 px-6 align-top whitespace-nowrap">
                      <div className="font-mono-data font-bold text-[#0E4D64]">
                        {term.code}
                      </div>
                      <div className="text-xs text-[#708294] mt-0.5">
                        {term.name[locale]}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-xs text-[#4A5B6C]">
                      {term.mode[locale]}
                    </td>
                    <td className="py-4 px-6 align-top text-sm text-[#0B1520] max-w-md">
                      {term.sellerObligation[locale]}
                    </td>
                    <td className="py-4 px-6 align-top text-xs text-[#4A5B6C] max-w-xs">
                      {term.riskTransfer[locale]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Export Documentation Pack */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
            {t.process.docsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#4A5B6C]">
            {t.process.docsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPORT_DOCUMENTS.map((doc) => (
            <div
              key={doc.code}
              className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] hover:bg-white hover:border-[#0E4D64]/35 transition-all p-7 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-[#708294]">
                <span className="font-mono-data font-semibold text-[#0E4D64]" dir="ltr">
                  {doc.code}
                </span>
                <span>{doc.issuer[locale]}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1520]">
                {doc.title[locale]}
              </h3>
              <p className="text-sm text-[#4A5B6C] leading-relaxed">
                {doc.purpose[locale]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Secure Document Hub — Interactive Verified Templates Vault */}
      <DocumentHub locale={locale} initialDocumentId={initialDocumentId} />
    </div>
  );
}
