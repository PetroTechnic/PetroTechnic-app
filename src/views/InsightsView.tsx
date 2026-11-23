import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { AppView, Locale, MarketInsight } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { usePlatformData } from '../context/PlatformDataContext';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { MarketPriceDashboard } from '../components/MarketPriceDashboard';
import { MarketIntelligenceFeed } from '../components/MarketIntelligenceFeed';

interface InsightsViewProps {
  locale: Locale;
  initialArticleSlug?: string | null;
  onClearInitialArticle?: () => void;
  onChangeLocale: (locale: Locale) => void;
  onNavigate: (view: AppView) => void;
}

type InsightFilter = 'all' | MarketInsight['category'];

export function InsightsView({
  locale,
  initialArticleSlug,
  onClearInitialArticle,
  onChangeLocale,
  onNavigate,
}: InsightsViewProps) {
  const t = UI_STRINGS[locale].insights;
  const { insights, loading } = usePlatformData();
  const [filter, setFilter] = useState<InsightFilter>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialArticleSlug ?? null,
  );

  useEffect(() => {
    if (initialArticleSlug) {
      setSelectedSlug(initialArticleSlug);
    }
  }, [initialArticleSlug]);

  const selectedArticle = selectedSlug
    ? insights.find((item) => item.slug === selectedSlug) || null
    : null;

  const filtered =
    filter === 'all'
      ? insights
      : insights.filter((item) => item.category === filter);

  if (selectedArticle) {
    return (
      <article className="max-w-[920px] mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedSlug(null);
              onClearInitialArticle?.();
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5B6C] hover:text-[#0E4D64] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t.backToInsights}
          </button>
          <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#708294]">
            <span className="font-semibold text-[#0E4D64]">
              {selectedArticle.categoryLabel[locale]}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-data">{selectedArticle.date}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {selectedArticle.readTimeMinutes} {t.minRead}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#0B1520] leading-[1.08]">
            {selectedArticle.title[locale]}
          </h1>
          <p className="text-lg text-[#4A5B6C] leading-relaxed">
            {selectedArticle.excerpt[locale]}
          </p>
        </header>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#061E29] shadow-[0_24px_60px_-24px_rgba(11,21,32,0.2)]">
          <ArchitecturalImage
            src={selectedArticle.image}
            alt={selectedArticle.title[locale]}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-10 pt-2">
          {selectedArticle.sections.map((section) => (
            <section key={section.heading.en} className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-[#0B1520]">
                {section.heading[locale]}
              </h2>
              <p className="text-base text-[#4A5B6C] leading-[1.8]">
                {section.body[locale]}
              </p>
            </section>
          ))}

          <div className="pt-8 border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-[#708294]">
              PetroTechnics Commodity Research Desk · petrotechnic.co
            </span>
            <button
              type="button"
              onClick={() => onNavigate('rfq')}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
            >
              {t.relatedCta}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  const filterTabs: { id: InsightFilter; label: string }[] = [
    { id: 'all', label: t.all },
    {
      id: 'fertilizers',
      label:
        locale === 'fa' ? 'بازار کود' : locale === 'ar' ? 'سوق الأسمدة' : 'Fertilizers',
    },
    {
      id: 'polymers',
      label:
        locale === 'fa' ? 'پلیمرها' : locale === 'ar' ? 'البوليمرات' : 'Polymers',
    },
    {
      id: 'finance',
      label:
        locale === 'fa'
          ? 'مالی و بازرسی'
          : locale === 'ar'
            ? 'التمويل التجاري'
            : 'Trade Finance',
    },
    {
      id: 'logistics',
      label:
        locale === 'fa'
          ? 'لجستیک و حمل'
          : locale === 'ar'
            ? 'اللوجستيات والشحن'
            : 'Logistics',
    },
  ];

  const leadArticle = filtered[0];
  const secondaryArticles = filtered.slice(1);

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            PetroTechnics Commodity Research
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

      {/* Historical Price Trends & Monthly Volatility Dashboard (Recharts) */}
      <MarketPriceDashboard locale={locale} onNavigate={onNavigate} />

      {/* Daily Global Petrochemical Pricing News — Gemini API Market Intelligence */}
      <MarketIntelligenceFeed locale={locale} />

      {/* Animated Category Filter */}
      <div className="inline-flex flex-wrap items-center p-1 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="insights-filter-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 bg-[#0B1520] rounded-full"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Empty / Loading Research State */}
      {loading && insights.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#4A5B6C]">
          Loading published market research...
        </div>
      ) : !leadArticle ? (
        <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-12 text-center text-sm text-[#708294]">
          No published market insights in this category yet.
        </div>
      ) : null}

      {/* Magazine-Style Featured Lead Story */}
      {leadArticle && (
        <article
          onClick={() => setSelectedSlug(leadArticle.slug)}
          className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl overflow-hidden bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64]/40 transition-all cursor-pointer"
        >
          <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-[#061E29] overflow-hidden">
            <ArchitecturalImage
              src={leadArticle.image}
              alt={leadArticle.title[locale]}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>
          <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#708294]">
                <span className="font-semibold text-[#0E4D64]">
                  {leadArticle.categoryLabel[locale]}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-data">{leadArticle.date}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {leadArticle.readTimeMinutes} {t.minRead}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1520] group-hover:text-[#0E4D64] transition-colors leading-tight">
                {leadArticle.title[locale]}
              </h2>
              <p className="text-sm sm:text-base text-[#4A5B6C] leading-relaxed">
                {leadArticle.excerpt[locale]}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E4D64]">
              {t.readArticle}
              <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </div>
          </div>
        </article>
      )}

      {/* Secondary Briefs Grid */}
      {secondaryArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {secondaryArticles.map((article) => (
            <article
              key={article.slug}
              onClick={() => setSelectedSlug(article.slug)}
              className="group rounded-2xl overflow-hidden bg-white border border-[#E5EBF0] hover:border-[#0E4D64]/40 hover:shadow-[0_24px_60px_-24px_rgba(14,77,100,0.18)] transition-all flex flex-col cursor-pointer"
            >
              <div className="aspect-[16/10] bg-[#061E29] overflow-hidden">
                <ArchitecturalImage
                  src={article.image}
                  alt={article.title[locale]}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#708294]">
                    <span className="font-semibold text-[#0E4D64]">
                      {article.categoryLabel[locale]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-data">{article.date}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0B1520] group-hover:text-[#0E4D64] transition-colors leading-snug">
                    {article.title[locale]}
                  </h3>
                  <p className="text-sm text-[#4A5B6C] leading-relaxed line-clamp-2">
                    {article.excerpt[locale]}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5EBF0] flex items-center justify-between text-xs text-[#708294]">
                  <span className="tabular-nums">
                    {article.readTimeMinutes} {t.minRead}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0E4D64]">
                    {t.readArticle}
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
