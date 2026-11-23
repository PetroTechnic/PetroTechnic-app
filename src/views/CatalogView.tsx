import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Search } from 'lucide-react';
import type {
  CurrencyCode,
  Locale,
  ProductCategory,
} from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import {
  CURRENCY_COPY,
  formatUnitPrice,
  getProductFobUsd,
} from '../data/currency';
import { usePlatformData } from '../context/PlatformDataContext';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface CatalogViewProps {
  locale: Locale;
  currency: CurrencyCode;
  onChangeLocale: (locale: Locale) => void;
  onSelectProduct: (slug: string) => void;
}

type FilterCategory = 'all' | ProductCategory;

export function CatalogView({
  locale,
  currency,
  onChangeLocale,
  onSelectProduct,
}: CatalogViewProps) {
  const t = UI_STRINGS[locale].catalog;
  const curCopy = CURRENCY_COPY[locale];
  const { products: liveProducts, fxRates, loading, error } = usePlatformData();
  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const products = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return liveProducts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const haystack = [
        p.slug,
        p.shortName,
        p.formula,
        p.casNumber,
        p.hsCode,
        p.name.en,
        p.name.fa,
        p.name.ar,
        p.summary.en,
        p.summary.fa,
        p.summary.ar,
        ...p.grades.map((g) => g.code),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [liveProducts, category, searchQuery]);

  const categories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: t.all },
    { id: 'polymers', label: t.polymers },
    { id: 'fertilizers', label: t.fertilizers },
    { id: 'chemicals', label: t.chemicals },
  ];

  const categoryLabelMap: Record<ProductCategory, string> = {
    polymers: t.polymers,
    fertilizers: t.fertilizers,
    chemicals: t.chemicals,
  };

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-12">
      {/* Editorial Page Header with Live FX Rate & Language Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            {UI_STRINGS[locale].utility.corridorSummary}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0B1520]">
            {t.title}
          </h1>
          <p className="text-base text-[#4A5B6C] leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="text-xs text-[#4A5B6C]" dir="ltr">
            <span className="font-semibold text-[#0E4D64]">{currency}</span>
            <span className="mx-1.5 text-[#CBD5E1]">·</span>
            <span className="font-mono-data text-[#708294]">
              1 USD = {fxRates[currency]} {currency}
            </span>
          </div>
          <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
        </div>
      </div>

      {/* Sleek Filter & Search Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        <div
          className="inline-flex flex-wrap items-center p-1 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full"
          role="tablist"
          aria-label="Product Category Filter"
        >
          {categories.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat.id)}
                className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="catalog-filter-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 bg-[#0B1520] rounded-full"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 lg:max-w-md">
          <Search className="w-4 h-4 text-[#708294] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-11 pe-5 py-3 text-sm bg-[#F7F9FB] border border-[#E5EBF0] rounded-full text-[#0B1520] placeholder:text-[#708294] focus:outline-none focus:border-[#0E4D64] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* States & Photo-Forward Architectural Grid */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center space-y-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-sm text-[#4A5B6C]">{t.loading}</div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-14 text-center space-y-3">
          <h2 className="font-display text-xl font-bold text-[#0B1520]">
            {t.emptyTitle}
          </h2>
          <p className="text-sm text-[#4A5B6C] max-w-md mx-auto">{t.emptyDesc}</p>
          {(category !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0E4D64] hover:bg-[#093647] rounded-full cursor-pointer"
            >
              {t.resetFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((product) => (
            <article
              key={product.slug}
              onClick={() => onSelectProduct(product.slug)}
              className="group rounded-2xl overflow-hidden bg-white border border-[#E5EBF0] hover:border-[#0E4D64]/40 hover:shadow-[0_24px_60px_-24px_rgba(14,77,100,0.2)] transition-all duration-200 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[4/3] bg-[#061E29] overflow-hidden">
                <ArchitecturalImage
                  src={product.image}
                  alt={product.name[locale]}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#061E29]/80 via-[#061E29]/15 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium text-sky-200">
                      {categoryLabelMap[product.category]} · {product.formula}
                    </div>
                    <h2 className="mt-0.5 font-display text-lg font-bold text-white leading-snug">
                      {product.name[locale]}
                    </h2>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:text-[#061E29]">
                    <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <p className="text-sm text-[#4A5B6C] leading-relaxed line-clamp-2">
                  {product.summary[locale]}
                </p>

                <div className="pt-4 border-t border-[#E5EBF0] space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#708294]">
                      {curCopy.indicativeFob}
                    </span>
                    <span
                      className="font-mono-data text-base font-bold text-[#0B1520] tabular-nums"
                      dir="ltr"
                    >
                      {formatUnitPrice(
                        getProductFobUsd(product),
                        currency,
                        fxRates,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#708294]">
                    <span className="font-mono-data" dir="ltr">
                      CAS {product.casNumber} · HS {product.hsCode}
                    </span>
                    <span className="tabular-nums">
                      {product.grades.length} {t.gradesCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4A5B6C] truncate max-w-[65%]">
                      {product.loadingPorts.slice(0, 2).join(' · ')}
                    </span>
                    <span className="font-mono-data font-semibold text-[#0E4D64] tabular-nums shrink-0">
                      {t.moqLabel} {product.moqMt.toLocaleString()} MT
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
