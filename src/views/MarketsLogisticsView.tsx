import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { Locale, TradeCorridor } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { IMG_LOGISTICS } from '../data/catalog';
import { TradeCorridorMap } from '../components/TradeCorridorMap';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface MarketsLogisticsViewProps {
  locale: Locale;
  corridors: TradeCorridor[];
  onChangeLocale: (locale: Locale) => void;
  onRequestCorridorQuote: (destinationHint: string) => void;
}

type CorridorModeFilter = 'all' | TradeCorridor['modeCode'];

export function MarketsLogisticsView({
  locale,
  corridors,
  onChangeLocale,
  onRequestCorridorQuote,
}: MarketsLogisticsViewProps) {
  const t = UI_STRINGS[locale].markets;
  const [selectedId, setSelectedId] = useState(corridors[0]?.id || 'south-asia');
  const [modeFilter, setModeFilter] = useState<CorridorModeFilter>('all');

  const active = corridors.find((c) => c.id === selectedId) || corridors[0];

  const modeFilters: { id: CorridorModeFilter; label: string }[] = [
    {
      id: 'all',
      label:
        locale === 'fa'
          ? 'همه ۷ کریدور'
          : locale === 'ar'
            ? 'جميع الممرات (٧)'
            : 'All 7 Corridors',
    },
    {
      id: 'maritime',
      label:
        locale === 'fa'
          ? 'دریایی اقیانوسی'
          : locale === 'ar'
            ? 'الشحن البحري'
            : 'Ocean Maritime',
    },
    {
      id: 'caspian',
      label:
        locale === 'fa'
          ? 'خزر و CIS'
          : locale === 'ar'
            ? 'قزوين وCIS'
            : 'Caspian & CIS',
    },
    {
      id: 'overland',
      label:
        locale === 'fa'
          ? 'زمینی TIR'
          : locale === 'ar'
            ? 'النقل البري TIR'
            : 'Overland TIR',
    },
    {
      id: 'gulf',
      label:
        locale === 'fa'
          ? 'هاب خلیج فارس'
          : locale === 'ar'
            ? 'مركز الخليج'
            : 'Gulf Re-Export',
    },
  ];

  const handleModeFilterChange = (nextMode: CorridorModeFilter) => {
    setModeFilter(nextMode);
    if (nextMode !== 'all') {
      const firstMatch = corridors.find((c) => c.modeCode === nextMode);
      if (firstMatch) {
        setSelectedId(firstMatch.id);
      }
    }
  };

  return (
    <div>
      {/* Editorial Header */}
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 pt-12 sm:pt-16 pb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            Bandar Abbas · Assaluyeh · Amirabad · Bazargan · Sharjah
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

      {/* Full-Width Dark Deep-Petrol D3 Geodesic Console */}
      <section className="bg-[#061E29] text-white py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 space-y-6">
          {/* Transport Mode Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex flex-wrap items-center p-1 bg-white/[0.06] border border-white/12 rounded-full">
              {modeFilters.map((tab) => {
                const isCurrent = modeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleModeFilterChange(tab.id)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCurrent ? 'text-[#061E29]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {isCurrent && (
                      <motion.span
                        layoutId="corridor-mode-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 bg-white rounded-full"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-mono-data text-sky-300/90 tabular-nums">
              7 Active Corridors · 32+ Countries
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <TradeCorridorMap
                corridors={corridors}
                selectedId={selectedId}
                locale={locale}
                onSelect={setSelectedId}
                highlightedMode={modeFilter}
              />

              {/* Active Corridor Detail Glass Panel */}
              {active && (
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md p-7 sm:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-sky-300">
                            <span>{active.mode[locale]}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-data font-semibold text-amber-400">
                              {active.transitDays} {t.daysUnit}
                            </span>
                          </div>
                          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                            {active.region[locale]}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onRequestCorridorQuote(
                              active.destinations[0]?.en || active.region.en,
                            )
                          }
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#061E29] bg-white hover:bg-sky-50 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {t.requestRouteQuote}
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </button>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {active.summary[locale]}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-slate-400">
                            {t.originPorts}
                          </h3>
                          <ul className="space-y-1 text-sm text-white">
                            {active.loadingPorts.map((port) => (
                              <li key={port}>{port}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-slate-400">
                            {t.destinations}
                          </h3>
                          <ul className="space-y-1 text-sm text-slate-200">
                            {active.destinations.map((dest) => (
                              <li key={dest.en}>{dest[locale]}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-slate-400">
                            {t.activeCommodities}
                          </h3>
                          <p className="text-xs font-mono-data text-sky-200 leading-relaxed">
                            {active.commodities.join(' · ')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Dark Directory Sidebar */}
            <div className="lg:col-span-4 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-xs font-semibold text-sky-300">
                  {t.corridorListTitle}
                </h2>
              </div>
              <div className="divide-y divide-white/10">
                {corridors.map((corridor, idx) => {
                  const isSelected = corridor.id === selectedId;
                  const dimmed =
                    modeFilter !== 'all' && corridor.modeCode !== modeFilter;
                  return (
                    <button
                      key={corridor.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(corridor.id);
                        if (dimmed) setModeFilter('all');
                      }}
                      className={`w-full text-start px-6 py-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#061E29]'
                          : dimmed
                            ? 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                            : 'text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          <span
                            className={`font-mono-data text-xs me-2 ${
                              isSelected ? 'text-[#0E4D64]' : 'text-sky-300'
                            }`}
                          >
                            0{idx + 1}.
                          </span>
                          {corridor.region[locale]}
                        </span>
                        <span
                          className={`font-mono-data text-xs whitespace-nowrap shrink-0 ${
                            isSelected ? 'text-[#0E4D64] font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {corridor.transitDays}d
                        </span>
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          isSelected ? 'text-[#4A5B6C]' : 'text-slate-400'
                        }`}
                      >
                        {corridor.mode[locale]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Strategic Export Gateways Split */}
      <section className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#061E29] min-h-[320px] shadow-[0_24px_60px_-24px_rgba(11,21,32,0.2)]">
            <ArchitecturalImage
              src={IMG_LOGISTICS}
              alt={t.logisticsBannerTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-6">
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1520]">
                {t.logisticsBannerTitle}
              </h2>
              <p className="text-base text-[#4A5B6C] leading-relaxed">
                {t.logisticsBannerDesc}
              </p>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              <div className="py-5 space-y-1.5">
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  <span className="font-mono-data text-sm text-[#0E4D64] me-2">01.</span>
                  {t.southernTitle}
                </h3>
                <p className="text-sm text-[#4A5B6C] leading-relaxed">
                  {t.southernDesc}
                </p>
              </div>
              <div className="py-5 space-y-1.5">
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  <span className="font-mono-data text-sm text-[#0E4D64] me-2">02.</span>
                  {t.northernTitle}
                </h3>
                <p className="text-sm text-[#4A5B6C] leading-relaxed">
                  {t.northernDesc}
                </p>
              </div>
              <div className="pt-5 space-y-1.5">
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  <span className="font-mono-data text-sm text-[#0E4D64] me-2">03.</span>
                  {t.westernTitle}
                </h3>
                <p className="text-sm text-[#4A5B6C] leading-relaxed">
                  {t.westernDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
