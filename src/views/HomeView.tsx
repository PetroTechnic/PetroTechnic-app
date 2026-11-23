import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, FileText, ShieldCheck } from 'lucide-react';
import type { AppView, Locale, Product, ProductCategory, TradeCorridor } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { IMG_HERO } from '../data/catalog';
import { TRADE_STEPS } from '../data/trade';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { TradeCorridorMap } from '../components/TradeCorridorMap';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface HomeViewProps {
  locale: Locale;
  products: Product[];
  corridors: TradeCorridor[];
  onChangeLocale: (locale: Locale) => void;
  onNavigate: (view: AppView) => void;
  onOpenDocumentHub: () => void;
  onSelectProduct: (slug: string) => void;
}

type HomePortfolioFilter = 'featured' | ProductCategory;

export function HomeView({
  locale,
  products,
  corridors,
  onChangeLocale,
  onNavigate,
  onOpenDocumentHub,
  onSelectProduct,
}: HomeViewProps) {
  const t = UI_STRINGS[locale];
  const [portfolioTab, setPortfolioTab] = useState<HomePortfolioFilter>('featured');
  const [selectedCorridorId, setSelectedCorridorId] = useState(
    corridors[0]?.id || 'south-asia',
  );
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const visibleProducts =
    portfolioTab === 'featured'
      ? products.filter((p) => p.featured).slice(0, 5)
      : products.filter((p) => p.category === portfolioTab).slice(0, 6);

  const activeCorridor =
    corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  const currentStep = TRADE_STEPS[activeStepIdx] || TRADE_STEPS[0];

  const metrics = [
    { value: t.metrics.yearsValue, label: t.metrics.yearsLabel },
    { value: t.metrics.countriesValue, label: t.metrics.countriesLabel },
    { value: t.metrics.capacityValue, label: t.metrics.capacityLabel },
    { value: t.metrics.slaValue, label: t.metrics.slaLabel },
  ];

  const portfolioTabs: { id: HomePortfolioFilter; label: string }[] = [
    {
      id: 'featured',
      label:
        locale === 'fa' ? 'منتخب صادراتی' : locale === 'ar' ? 'المنتجات الرئيسية' : 'Flagship',
    },
    { id: 'polymers', label: t.catalog.polymers },
    { id: 'fertilizers', label: t.catalog.fertilizers },
    { id: 'chemicals', label: t.catalog.chemicals },
  ];

  const allProductsLabel =
    locale === 'fa'
      ? `مشاهده همه ${products.length} خط محصول`
      : locale === 'ar'
        ? `عرض جميع خطوط المنتجات (${products.length})`
        : `Explore All ${products.length} Product Lines`;

  const heroQuickProducts = products.filter((p) => p.featured).slice(0, 4);

  const heroPanelLabel =
    locale === 'fa'
      ? 'تخصیص‌های فعال صادراتی'
      : locale === 'ar'
        ? 'تخصيصات التصدير النشطة'
        : 'Active Export Allocations';

  const heroPanelAction =
    locale === 'fa'
      ? 'مشاهده همه'
      : locale === 'ar'
        ? 'عرض الكل'
        : 'Full Catalog';

  return (
    <div>
      {/* 1. GLASSMORPHISM ARCHITECTURAL HERO */}
      <section className="relative min-h-[82vh] flex flex-col justify-between overflow-hidden bg-[#04161F]">
        {/* Full-bleed Coastal Terminal Background with Subtle Optical Blur & Layered Atmospheric Overlays */}
        <div className="absolute inset-0">
          <ArchitecturalImage
            src={IMG_HERO}
            alt={t.hero.imageCaption}
            className="w-full h-full object-cover object-center scale-[1.04] blur-[2px] brightness-[0.82]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#041821]/88 via-[#072836]/72 to-[#041821]/80"
          />
          {/* Subtle Blurred Atmospheric Light Pools Behind Glass Panels */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 start-[-8%] w-[520px] h-[520px] rounded-full bg-[#0EA5E9]/20 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-18%] end-[-6%] w-[560px] h-[560px] rounded-full bg-[#0E4D64]/45 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[30%] end-[28%] w-[340px] h-[340px] rounded-full bg-amber-400/10 blur-[100px]"
          />
        </div>

        {/* Hero Inner Container */}
        <div className="relative z-10 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-10 pt-7 pb-10 sm:pt-9 sm:pb-14 flex-1 flex flex-col justify-between gap-8 lg:gap-10">
          {/* Top Bar: Quiet Trust Context + Frosted Trilingual Switch */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-sky-100/85">
              <span className="text-white font-semibold tracking-wide">
                {t.hero.eyebrow}
              </span>
              <span aria-hidden="true" className="text-white/35">
                ·
              </span>
              <span className="hidden sm:inline text-slate-200/80">
                {t.utility.corridorSummary}
              </span>
            </div>
            <LanguageSwitch
              locale={locale}
              onChangeLocale={onChangeLocale}
              variant="dark"
            />
          </div>

          {/* Centerpiece Balanced 2-Column Glass Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
            {/* Primary Frosted Glass Editorial Card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 shadow-[0_32px_80px_-28px_rgba(2,14,20,0.75)] overflow-hidden"
            >
              {/* Delicate Top Specular Glass Reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />

              <div className="space-y-5">
                <p className="text-xs font-mono-data tracking-wide text-sky-200/90">
                  {t.utility.responseSla}
                </p>
                <h1 className="font-display text-[clamp(2.35rem,4.5vw,4.15rem)] font-bold tracking-[-0.038em] leading-[1.03] text-white">
                  {t.hero.headline}
                </h1>
                <p className="text-[15px] sm:text-[17px] text-slate-100/88 leading-[1.68] max-w-[54ch]">
                  {t.hero.subheadline}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#051B24] bg-white hover:bg-sky-50 rounded-full transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5)]"
                >
                  {t.hero.primaryCta}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/25 hover:border-white/45 backdrop-blur-md rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.hero.secondaryCta}
                  <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                </button>
              </div>
            </motion.div>

            {/* Secondary Frosted Glass Flagship Allocations Panel */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative rounded-3xl bg-[#051A24]/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_32px_80px_-28px_rgba(2,14,20,0.75)] overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/12">
                  <span className="text-xs font-semibold text-sky-200 tracking-wide">
                    {heroPanelLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('products')}
                    className="text-xs font-medium text-white/75 hover:text-white transition-colors cursor-pointer"
                  >
                    {heroPanelAction}
                  </button>
                </div>

                <div className="divide-y divide-white/10">
                  {heroQuickProducts.map((prod) => (
                    <button
                      key={prod.slug}
                      type="button"
                      onClick={() => onSelectProduct(prod.slug)}
                      className="group w-full py-3.5 first:pt-1 last:pb-1 text-start flex items-center justify-between gap-4 hover:bg-white/[0.04] rounded-xl px-2.5 -mx-2.5 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-sky-200 transition-colors truncate">
                          {prod.name[locale]}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-300/80 flex items-center gap-2 truncate">
                          <span className="font-mono-data" dir="ltr">
                            {prod.formula}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{prod.loadingPorts[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-data text-xs font-medium text-sky-200 tabular-nums">
                          {prod.moqMt.toLocaleString()} MT
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors rtl:-scale-x-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/12 flex items-center justify-between gap-3 text-xs text-slate-300/85">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
                  <span>SGS · Bureau Veritas · Intertek</span>
                </span>
                <span className="font-mono-data text-white/70">Incoterms 2020</span>
              </div>
            </motion.div>
          </div>

          {/* Full-Width Frosted Glass 4-Column Quantified Proof Strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x rtl:divide-x-reverse divide-white/12"
          >
            {metrics.map((metric) => (
              <div key={metric.label} className="py-5 px-6 sm:py-6 sm:px-7">
                <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs sm:text-[13px] text-slate-200/85">
                  {metric.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. INTERACTIVE EXPORT PORTFOLIO SHOWCASE */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
                01. {t.nav.products}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0B1520]">
                {t.home.portfolioTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#4A5B6C] leading-relaxed">
                {t.home.portfolioSubtitle}
              </p>
            </div>

            {/* Interactive Category Switcher with Spring Active Slider */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex flex-wrap items-center p-1 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full">
                {portfolioTabs.map((tab) => {
                  const active = portfolioTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPortfolioTab(tab.id)}
                      className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="home-portfolio-tab"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-0 bg-[#0B1520] rounded-full"
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Asymmetric Editorial Photo Bento */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
          >
            {visibleProducts.map((product, index) => {
              const isHeroTile = portfolioTab === 'featured' && index < 2;
              return (
                <motion.article
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectProduct(product.slug)}
                  className={`group relative rounded-2xl overflow-hidden bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64]/40 hover:shadow-[0_24px_60px_-24px_rgba(14,77,100,0.22)] transition-all duration-200 flex flex-col cursor-pointer ${
                    isHeroTile ? 'lg:col-span-3' : 'lg:col-span-2'
                  }`}
                >
                  {/* Full-bleed Photo Stage */}
                  <div
                    className={`relative overflow-hidden bg-[#061E29] ${
                      isHeroTile ? 'aspect-[16/10]' : 'aspect-[4/3]'
                    }`}
                  >
                    <ArchitecturalImage
                      src={product.image}
                      alt={product.name[locale]}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#061E29]/85 via-[#061E29]/20 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-mono-data text-sky-200/90" dir="ltr">
                          {product.formula} · CAS {product.casNumber}
                        </div>
                        <h3 className="mt-1 font-display text-lg sm:text-xl font-bold text-white leading-snug">
                          {product.name[locale]}
                        </h3>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:bg-white group-hover:text-[#061E29] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                        <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                      </span>
                    </div>
                  </div>

                  {/* Clean Minimalist Technical Footer */}
                  <div className="p-5 sm:p-6 bg-white flex-1 flex flex-col justify-between gap-4">
                    <p className="text-sm text-[#4A5B6C] leading-relaxed line-clamp-2">
                      {product.summary[locale]}
                    </p>
                    <div className="pt-4 border-t border-[#E5EBF0] flex items-center justify-between text-xs text-[#708294]">
                      <span className="font-mono-data text-[#0B1520] font-medium tabular-nums">
                        {t.catalog.moqLabel} {product.moqMt.toLocaleString()} MT
                      </span>
                      <span className="tabular-nums">
                        {product.grades.length} {t.catalog.gradesCount} · HS {product.hsCode}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E4D64] hover:text-[#0B1520] transition-colors cursor-pointer"
            >
              {allProductsLabel}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. WHY PETROTECHNICS — SCULPTURAL ASYMMETRIC EDITORIAL SPLIT */}
      <section className="bg-[#F7F9FB] border-y border-[#E5EBF0] py-20 sm:py-28">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
              <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
                02. {locale === 'fa' ? 'مزیت رقابتی' : locale === 'ar' ? 'الميزة التنافسية' : 'Institutional Standard'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.1] text-[#0B1520]">
                {t.home.whyTitle}
              </h2>
              <p className="text-base text-[#4A5B6C] leading-relaxed">
                {t.home.whySubtitle}
              </p>
              <div className="pt-3 flex items-center gap-3 text-xs font-medium text-[#0E4D64]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>SGS · Bureau Veritas · Intertek · Incoterms 2020</span>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#E5EBF0]">
              {t.whyItems.map((item) => (
                <div
                  key={item.num}
                  className="group py-7 first:pt-0 last:pb-0 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                    <span className="sm:col-span-2 font-mono-data text-sm font-semibold text-[#0E4D64]">
                      {item.num}
                    </span>
                    <div className="sm:col-span-10 space-y-2.5">
                      <h3 className="font-display text-xl font-bold text-[#0B1520] group-hover:text-[#0E4D64] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-[15px] text-[#4A5B6C] leading-relaxed">
                        {item.desc}
                      </p>
                      <p className="text-xs font-mono-data font-medium text-[#0E4D64] pt-1">
                        {item.proof}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DARK DEEP-PETROL GLOBAL CORRIDOR INTELLIGENCE BAND */}
      <section className="bg-[#061E29] text-white py-20 sm:py-28 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-sky-300">
                03. {t.nav.markets}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
                {t.home.corridorsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t.home.corridorsSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('markets')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.home.exploreLogistics}
              <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>

          {/* Interactive Corridor Selector Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {corridors.map((c) => {
              const active = c.id === selectedCorridorId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#061E29] border-white'
                      : 'bg-white/[0.04] text-slate-300 border-white/15 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {c.region[locale]}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <TradeCorridorMap
                corridors={corridors}
                selectedId={selectedCorridorId}
                locale={locale}
                onSelect={setSelectedCorridorId}
              />
            </div>

            {activeCorridor && (
              <div className="lg:col-span-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCorridor.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between text-xs text-sky-300">
                      <span>{activeCorridor.mode[locale]}</span>
                      <span className="font-mono-data font-semibold text-amber-400">
                        {activeCorridor.transitDays} {t.markets.daysUnit}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white">
                      {activeCorridor.region[locale]}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {activeCorridor.summary[locale]}
                    </p>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          {t.markets.originPorts}
                        </div>
                        <p className="mt-1 text-sm text-white">
                          {activeCorridor.loadingPorts.join(' · ')}
                        </p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          {t.markets.destinations}
                        </div>
                        <ul className="mt-1 space-y-1 text-sm text-slate-200">
                          {activeCorridor.destinations.map((dest) => (
                            <li key={dest.en}>{dest[locale]}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          {t.markets.activeCommodities}
                        </div>
                        <p className="mt-1 text-xs font-mono-data text-sky-200">
                          {activeCorridor.commodities.join(' · ')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold text-[#061E29] bg-white hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
                >
                  {t.markets.requestRouteQuote}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE 8-STEP EXECUTION RAIL */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
                04. {t.nav.process}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0B1520]">
                {t.home.processPreviewTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#4A5B6C] leading-relaxed">
                {t.home.processPreviewSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('process')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E4D64] hover:text-[#0B1520] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.home.viewFullProcess}
              <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>

          {/* Horizontal 8-Stage Progress Rail */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {TRADE_STEPS.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                const isPast = idx < activeStepIdx;
                return (
                  <button
                    key={step.stepNumber}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`text-start p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1520] text-white border-[#0B1520] shadow-[0_12px_28px_-12px_rgba(11,21,32,0.45)]'
                        : isPast
                          ? 'bg-[#EDF5F8] text-[#0E4D64] border-[#0E4D64]/20 hover:border-[#0E4D64]/50'
                          : 'bg-[#F7F9FB] text-[#4A5B6C] border-[#E5EBF0] hover:bg-white hover:text-[#0B1520]'
                    }`}
                  >
                    <div
                      className={`font-mono-data text-xs font-semibold ${
                        isActive ? 'text-sky-300' : 'text-[#0E4D64]'
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

            {/* Active Stage Inspector Panel */}
            <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-7 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.stepNumber}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#708294]">
                      <span className="font-mono-data font-semibold text-[#0E4D64]">
                        {t.process.stepLabel} {currentStep.stepNumber} / 08
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{currentStep.timeline[locale]}</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1520]">
                      {currentStep.title[locale]}
                    </h3>
                    <p className="text-sm sm:text-base text-[#4A5B6C] leading-relaxed">
                      {currentStep.summary[locale]}
                    </p>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:ps-6 lg:border-s border-[#E5EBF0]">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-[#0B1520]">
                        {t.process.buyerActionLabel}
                      </div>
                      <p className="text-sm text-[#4A5B6C] leading-relaxed">
                        {currentStep.buyerAction[locale]}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-[#0E4D64]">
                        {t.process.sellerActionLabel}
                      </div>
                      <p className="text-sm text-[#4A5B6C] leading-relaxed">
                        {currentStep.petroTechnicsAction[locale]}
                      </p>
                    </div>
                    <div className="sm:col-span-2 pt-4 border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono-data text-[#4A5B6C]">
                        <FileText className="w-4 h-4 text-[#0E4D64] shrink-0" />
                        <span>{currentStep.documents.join(' · ')}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={onOpenDocumentHub}
                          className="text-xs font-semibold text-[#0E4D64] hover:text-[#0B1520] underline underline-offset-4 cursor-pointer"
                        >
                          {locale === 'fa'
                            ? 'مرکز اسناد امن (PI · B/L · SGS)'
                            : locale === 'ar'
                              ? 'مركز المستندات الآمن (PI · B/L · SGS)'
                              : 'Secure Document Hub (PI · B/L · SGS)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('process')}
                          className="text-xs font-semibold text-[#4A5B6C] hover:text-[#0B1520] underline underline-offset-4 cursor-pointer"
                        >
                          {t.process.incotermsTitle}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SCULPTURAL CONVERSION FINISH */}
      <section className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 pb-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#061E29] via-[#0B3445] to-[#0E4D64] px-8 py-14 sm:px-14 sm:py-16 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -end-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl"
          />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
                {t.home.ctaTitle}
              </h2>
              <p className="text-sm sm:text-base text-sky-100/85 leading-relaxed">
                {t.home.ctaSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('rfq')}
              className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-semibold text-[#061E29] bg-white hover:bg-sky-50 rounded-full transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
            >
              {t.home.ctaButton}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
