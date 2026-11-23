import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download } from 'lucide-react';
import type { CurrencyCode, Locale, Product } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import {
  CURRENCY_COPY,
  formatUnitPrice,
  getProductFobUsd,
} from '../data/currency';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { usePlatformData } from '../context/PlatformDataContext';

interface ProductDetailViewProps {
  locale: Locale;
  currency: CurrencyCode;
  product: Product;
  onChangeLocale: (locale: Locale) => void;
  onBack: () => void;
  onRequestQuote: (product: Product, grade: string, packaging: string) => void;
}

export function ProductDetailView({
  locale,
  currency,
  product,
  onChangeLocale,
  onBack,
  onRequestQuote,
}: ProductDetailViewProps) {
  const t = UI_STRINGS[locale].productDetail;
  const curCopy = CURRENCY_COPY[locale];
  const { fxRates } = usePlatformData();
  const indicativeFobLabel = formatUnitPrice(
    getProductFobUsd(product),
    currency,
    fxRates,
  );
  const [selectedGrade, setSelectedGrade] = useState(product.grades[0]?.code || '');

  useEffect(() => {
    setSelectedGrade(product.grades[0]?.code || '');
  }, [product]);

  const handleDownloadTds = () => {
    const lines = [
      `PETROTECHNICS (petrotechnic.co) — TECHNICAL DATA SHEET`,
      `====================================================================`,
      `Product:        ${product.name.en}`,
      `Selected Grade: ${selectedGrade}`,
      `Formula:        ${product.formula}`,
      `CAS Registry:   ${product.casNumber}`,
      `HS Code:        ${product.hsCode}`,
      `Indicative FOB: ${indicativeFobLabel}`,
      `Minimum Order:  ${product.moqMt} MT`,
      `Loading Ports:  ${product.loadingPorts.join(', ')}`,
      `Inspection:     ${product.inspections.join(', ')}`,
      ``,
      `COMMERCIAL GRADES`,
      `--------------------------------------------------------------------`,
      ...product.grades.map(
        (g) => `- ${g.code} | ${g.keyMetric} | ${g.application.en}`,
      ),
      ``,
      `TYPICAL LABORATORY SPECIFICATIONS`,
      `--------------------------------------------------------------------`,
      ...product.specs.map(
        (s) =>
          `${s.parameter.en.padEnd(34)} ${s.value.padEnd(16)} ${s.unit.padEnd(10)} (${s.method})`,
      ),
      ``,
      `EXPORT PACKAGING`,
      `--------------------------------------------------------------------`,
      ...product.packaging.map((p) => `- ${p.en}`),
      ``,
      `Commercial Inquiries: trade@petrotechnic.co | https://petrotechnic.co`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PetroTechnics-TDS-${product.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14 space-y-16">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5B6C] hover:text-[#0E4D64] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t.backToCatalog}
        </button>
        <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
      </div>

      {/* Editorial Product Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#061E29] min-h-[320px] shadow-[0_24px_60px_-24px_rgba(11,21,32,0.2)]">
          <ArchitecturalImage
            src={product.image}
            alt={product.name[locale]}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between gap-8 py-2">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-data text-[#0E4D64]" dir="ltr">
              <span>{product.formula}</span>
              <span aria-hidden="true">·</span>
              <span>CAS {product.casNumber}</span>
              <span aria-hidden="true">·</span>
              <span>HS {product.hsCode}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.035em] leading-[1.08] text-[#0B1520]">
              {product.name[locale]}
            </h1>
            <p className="text-base text-[#4A5B6C] leading-relaxed max-w-2xl">
              {product.overview[locale]}
            </p>
          </div>

          {/* Sleek Key Identifiers Band */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 py-6 border-y border-[#E5EBF0]">
            <div>
              <div className="text-xs text-[#708294]">{curCopy.indicativeFob}</div>
              <div
                className="mt-1 font-mono-data text-sm font-bold text-[#0E4D64] tabular-nums"
                dir="ltr"
              >
                {indicativeFobLabel}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#708294]">{t.formulaLabel}</div>
              <div className="mt-1 font-mono-data text-sm font-semibold text-[#0B1520]" dir="ltr">
                {product.formula}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#708294]">{t.casLabel}</div>
              <div className="mt-1 font-mono-data text-sm font-semibold text-[#0B1520]" dir="ltr">
                {product.casNumber}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#708294]">{t.hsLabel}</div>
              <div className="mt-1 font-mono-data text-sm font-semibold text-[#0B1520]" dir="ltr">
                {product.hsCode}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#708294]">{t.moqLabel}</div>
              <div className="mt-1 font-mono-data text-sm font-bold text-[#0E4D64] tabular-nums">
                {product.moqMt.toLocaleString()} MT
              </div>
            </div>
          </div>

          {/* Primary & TDS Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                onRequestQuote(
                  product,
                  selectedGrade,
                  product.packaging[0]?.en || 'Standard Export Packaging',
                )
              }
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.requestGradeQuote}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={handleDownloadTds}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t.downloadTds}
            </button>
          </div>
        </div>
      </div>

      {/* Commercial Grades Selector Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
              {t.gradesHeading}
            </h2>
            <p className="text-sm text-[#4A5B6C] mt-1">{t.gradesHint}</p>
          </div>
          <div className="text-xs text-[#708294]">
            {t.selectedGradeLabel}:{' '}
            <span className="font-mono-data font-semibold text-[#0E4D64]" dir="ltr">
              {selectedGrade}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {product.grades.map((grade) => {
            const active = selectedGrade === grade.code;
            return (
              <button
                key={grade.code}
                type="button"
                onClick={() => setSelectedGrade(grade.code)}
                className={`text-start p-6 rounded-2xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#061E29] text-white border-[#061E29] shadow-[0_18px_40px_-18px_rgba(6,30,41,0.5)]'
                    : 'bg-[#F7F9FB] text-[#0B1520] border-[#E5EBF0] hover:bg-white hover:border-[#0E4D64]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold font-mono-data" dir="ltr">
                    {grade.code}
                  </span>
                  {active && <Check className="w-4 h-4 text-sky-300 shrink-0" />}
                </div>
                <p
                  className={`mt-2.5 text-xs leading-relaxed ${
                    active ? 'text-slate-300' : 'text-[#4A5B6C]'
                  }`}
                >
                  {grade.application[locale]}
                </p>
                <div
                  className={`mt-4 pt-3.5 border-t text-xs font-mono-data ${
                    active
                      ? 'border-white/15 text-sky-300'
                      : 'border-[#E5EBF0] text-[#0E4D64]'
                  }`}
                  dir="ltr"
                >
                  {grade.keyMetric}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ASTM / ISO Technical Specification Table */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
          {t.specsHeading}
        </h2>
        <div className="rounded-2xl border border-[#E5EBF0] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-xs font-semibold text-[#4A5B6C]">
                  <th className="text-start py-4 px-6">{t.paramCol}</th>
                  <th className="text-start py-4 px-6">{t.valueCol}</th>
                  <th className="text-start py-4 px-6">{t.unitCol}</th>
                  <th className="text-start py-4 px-6">{t.methodCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {product.specs.map((row) => (
                  <tr key={row.parameter.en} className="hover:bg-[#F7F9FB]/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-[#0B1520]">
                      {row.parameter[locale]}
                    </td>
                    <td className="py-4 px-6 font-mono-data font-semibold text-[#0E4D64] tabular-nums" dir="ltr">
                      {row.value}
                    </td>
                    <td className="py-4 px-6 font-mono-data text-[#4A5B6C]" dir="ltr">
                      {row.unit}
                    </td>
                    <td className="py-4 px-6 font-mono-data text-xs text-[#708294]" dir="ltr">
                      {row.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Applications & Export Logistics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[#E5EBF0]">
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-display text-xl font-bold text-[#0B1520]">
            {t.applicationsHeading}
          </h3>
          <ul className="space-y-3 text-sm sm:text-[15px] text-[#4A5B6C]">
            {product.applications.map((app) => (
              <li key={app.en} className="flex items-start gap-3">
                <span aria-hidden="true" className="text-[#0E4D64] font-bold">
                  –
                </span>
                <span>{app[locale]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-7 space-y-6">
          <div className="space-y-3">
            <h3 className="font-display text-xl font-bold text-[#0B1520]">
              {t.packagingHeading}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#4A5B6C]">
              {product.packaging.map((pack) => (
                <li key={pack.en} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="text-[#0E4D64] font-bold">
                    –
                  </span>
                  <span>{pack[locale]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-5 border-t border-[#E5EBF0] grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-semibold text-[#0B1520]">
                {t.portsHeading}
              </h4>
              <p className="mt-1.5 text-sm text-[#4A5B6C]">
                {product.loadingPorts.join(' · ')}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#0B1520]">
                {t.inspectionHeading}
              </h4>
              <p className="mt-1.5 text-sm text-[#4A5B6C]">
                {product.inspections.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
