import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type {
  AppView,
  HistoricalPricePoint,
  Locale,
  LocalizedText,
} from '../types/domain';
import { usePlatformData } from '../context/PlatformDataContext';

interface MarketPriceDashboardProps {
  locale: Locale;
  onNavigate: (view: AppView) => void;
}

type CommodityKey = 'urea' | 'hdpe' | 'pp' | 'methanol';
type RangeOption = '6m' | '12m';
type ChartMetricMode = 'price' | 'volatility';

interface CommodityMeta {
  key: CommodityKey;
  label: LocalizedText;
  benchmark: string;
  color: string;
}

const COMMODITIES: CommodityMeta[] = [
  {
    key: 'urea',
    label: {
      en: 'Urea 46% Granular',
      fa: 'اوره ۴۶٪ گرانول',
      ar: 'يوريا ٤٦٪ محببة',
    },
    benchmark: 'FOB Persian Gulf',
    color: '#0E4D64',
  },
  {
    key: 'hdpe',
    label: {
      en: 'HDPE Film (EX5)',
      fa: 'پلی‌اتیلن سنگین فیلم',
      ar: 'بولي إيثيلين HDPE',
    },
    benchmark: 'FOB Bandar Abbas',
    color: '#0284C7',
  },
  {
    key: 'pp',
    label: {
      en: 'PP Raffia (HP500H)',
      fa: 'پلی‌پروپیلن رافیا',
      ar: 'بولي بروبيلين رافيا',
    },
    benchmark: 'FOB Bandar Abbas',
    color: '#D97706',
  },
  {
    key: 'methanol',
    label: {
      en: 'Methanol Grade AA',
      fa: 'متانول گرید AA',
      ar: 'ميثانول درجة AA',
    },
    benchmark: 'FOB Assaluyeh',
    color: '#0F766E',
  },
];

function computeMonthlyVolatility(series: HistoricalPricePoint[]) {
  return series.map((point, idx) => {
    if (idx === 0) {
      return {
        month: point.month,
        urea: 0,
        hdpe: 0,
        pp: 0,
        methanol: 0,
      };
    }
    const prev = series[idx - 1];
    const pct = (cur: number, old: number) =>
      old > 0 ? Number((((cur - old) / old) * 100).toFixed(2)) : 0;
    return {
      month: point.month,
      urea: pct(point.urea, prev.urea),
      hdpe: pct(point.hdpe, prev.hdpe),
      pp: pct(point.pp, prev.pp),
      methanol: pct(point.methanol, prev.methanol),
    };
  });
}

function computeStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Number(Math.sqrt(variance).toFixed(2));
}

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    priceMode: string;
    volatilityMode: string;
    range6m: string;
    range12m: string;
    momLabel: string;
    volatilityLabel: string;
    yAxisPrice: string;
    yAxisVol: string;
    footnote: string;
    requestQuote: string;
    activeToggleHint: string;
  }
> = {
  en: {
    eyebrow: 'FOB Middle East Commodity Benchmarks',
    title: 'Historical Price Trends & Monthly Market Volatility',
    subtitle:
      'Track indicative monthly FOB export pricing (USD/MT) and month-over-month percentage swings across flagship fertilizers, polyolefins, and methanol.',
    priceMode: 'FOB Price (USD/MT)',
    volatilityMode: 'Monthly Volatility (% MoM)',
    range6m: '6 Months',
    range12m: '12 Months',
    momLabel: 'MoM',
    volatilityLabel: 'Volatility σ',
    yAxisPrice: 'USD / MT',
    yAxisVol: '% MoM',
    footnote:
      'Indicative FOB Persian Gulf export benchmarks (USD/MT) compiled by the PetroTechnics Trading Desk. Firm FCO pricing depends on volume, grade, and laycan.',
    requestQuote: 'Request Firm FCO',
    activeToggleHint: 'Click any benchmark card below to toggle series visibility.',
  },
  fa: {
    eyebrow: 'شاخص‌های قیمت FOB خاورمیانه',
    title: 'روند تاریخی قیمت و نوسان ماهانه بازار',
    subtitle:
      'رصد قیمت‌های شاخص صادراتی FOB (دلار بر تن) و درصد نوسان ماه‌به‌ماه در محصولات کلیدی شامل اوره، پلیمرها و متانول.',
    priceMode: 'روند قیمت FOB (دلار/تن)',
    volatilityMode: 'نوسان ماهانه (% MoM)',
    range6m: '۶ ماهه',
    range12m: '۱۲ ماهه',
    momLabel: 'تغییر ماهانه',
    volatilityLabel: 'انحراف معیار σ',
    yAxisPrice: 'دلار / تن',
    yAxisVol: '٪ ماهانه',
    footnote:
      'قیمت‌های شاخص صادراتی FOB خلیج فارس بر حسب دلار در هر تن متریک. نرخ قطعی FCO بر اساس تناژ، گرید و بازه بارگیری تعیین می‌شود.',
    requestQuote: 'دریافت نرخ قطعی FCO',
    activeToggleHint: 'برای فعال یا غیرفعال کردن هر نمودار روی کارت محصول کلیک کنید.',
  },
  ar: {
    eyebrow: 'مؤشرات أسعار FOB في الشرق الأوسط',
    title: 'اتجاهات الأسعار التاريخية وتقلبات السوق الشهرية',
    subtitle:
      'تابع مؤشرات أسعار التصدير الشهرية FOB (دولار/طن) ونسبة التذبذب الشهري لأبرز الأسمدة والبوليمرات والميثانول.',
    priceMode: 'أسعار FOB (دولار/طن)',
    volatilityMode: 'التذبذب الشهري (% MoM)',
    range6m: '٦ أشهر',
    range12m: '١٢ شهراً',
    momLabel: 'شهرياً',
    volatilityLabel: 'التذبذب σ',
    yAxisPrice: 'دولار / طن',
    yAxisVol: '٪ شهرياً',
    footnote:
      'مؤشرات أسعار تصدير استرشادية FOB الخليج العربي بالدولار لكل طن متري. يعتمد السعر الرسمي (FCO) على الكمية والدرجة وموعد التحميل.',
    requestQuote: 'طلب عرض سعر رسمي',
    activeToggleHint: 'انقر على أي بطاقة سلعة أدناه لإظهار أو إخفاء خطها البياني.',
  },
};

export function MarketPriceDashboard({
  locale,
  onNavigate,
}: MarketPriceDashboardProps) {
  const c = COPY[locale];
  const { historicalPrices, loading } = usePlatformData();
  const [range, setRange] = useState<RangeOption>('12m');
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('price');
  const [activeKeys, setActiveKeys] = useState<CommodityKey[]>([
    'urea',
    'hdpe',
    'pp',
    'methanol',
  ]);

  const volatilitySeries = useMemo(
    () => computeMonthlyVolatility(historicalPrices),
    [historicalPrices],
  );

  const chartData = useMemo(() => {
    const source = metricMode === 'price' ? historicalPrices : volatilitySeries;
    return range === '6m' ? source.slice(-6) : source;
  }, [metricMode, range, historicalPrices, volatilitySeries]);

  const stats = useMemo(() => {
    if (historicalPrices.length === 0) return [];
    const latest = historicalPrices[historicalPrices.length - 1];
    const previous =
      historicalPrices[historicalPrices.length - 2] ?? latest;
    const windowVol =
      range === '6m' ? volatilitySeries.slice(-6) : volatilitySeries.slice(1);

    return COMMODITIES.map((item) => {
      const latestVal = latest[item.key];
      const prevVal = previous[item.key];
      const momPct =
        prevVal > 0
          ? Number((((latestVal - prevVal) / prevVal) * 100).toFixed(1))
          : 0;
      const sigma = computeStdDev(windowVol.map((row) => row[item.key]));
      return {
        ...item,
        latestVal,
        momPct,
        sigma,
      };
    });
  }, [historicalPrices, range, volatilitySeries]);

  const toggleSeries = (key: CommodityKey) => {
    setActiveKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  return (
    <section className="rounded-3xl bg-[#F7F9FB] border border-[#E5EBF0] p-6 sm:p-9 lg:p-10 space-y-8">
      {/* Dashboard Header + Mode / Range Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            {c.eyebrow}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#0B1520]">
            {c.title}
          </h2>
          <p className="text-sm text-[#4A5B6C] leading-relaxed">{c.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center p-1 bg-white border border-[#E5EBF0] rounded-full">
            {(
              [
                { id: 'price', label: c.priceMode },
                { id: 'volatility', label: c.volatilityMode },
              ] as { id: ChartMetricMode; label: string }[]
            ).map((opt) => {
              const active = metricMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMetricMode(opt.id)}
                  className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="chart-metric-mode"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 bg-[#0B1520] rounded-full"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center p-1 bg-white border border-[#E5EBF0] rounded-full">
            {(
              [
                { id: '6m', label: c.range6m },
                { id: '12m', label: c.range12m },
              ] as { id: RangeOption; label: string }[]
            ).map((opt) => {
              const active = range === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRange(opt.id)}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="chart-range-mode"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 bg-[#0E4D64] rounded-full"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#4A5B6C]">
          Syncing live FOB price benchmarks...
        </div>
      ) : historicalPrices.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#E5EBF0] p-10 text-center text-sm text-[#708294]">
          No historical FOB benchmark records published yet. Initialize or add monthly benchmarks in the Admin Console.
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            <p className="text-xs text-[#708294]">{c.activeToggleHint}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((item) => {
                const isSelected = activeKeys.includes(item.key);
                const isUp = item.momPct >= 0;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleSeries(item.key)}
                    aria-pressed={isSelected}
                    className={`text-start rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#CBD5E1] shadow-[0_12px_32px_-20px_rgba(11,21,32,0.18)]'
                        : 'bg-white/50 border-[#E5EBF0] opacity-55 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className="w-3 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold text-[#0B1520] truncate">
                          {item.label[locale]}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-mono-data font-semibold tabular-nums shrink-0 ${
                          isUp ? 'text-[#0E7490]' : 'text-[#B45309]'
                        }`}
                        dir="ltr"
                      >
                        {isUp ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {isUp ? '+' : ''}
                        {item.momPct}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <div
                        className="font-display text-2xl font-bold tracking-tight text-[#0B1520] tabular-nums"
                        dir="ltr"
                      >
                        ${item.latestVal.toLocaleString()}
                        <span className="text-xs font-sans font-normal text-[#708294] ms-1">
                          /MT
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-data text-[#4A5B6C] tabular-nums">
                        {c.volatilityLabel}: ±{item.sigma}%
                      </div>
                    </div>

                    <div className="mt-1.5 text-[11px] text-[#708294]">
                      {item.benchmark} · {c.momLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-2xl bg-white border border-[#E5EBF0] p-4 sm:p-6"
            dir="ltr"
          >
            <div className="flex items-center justify-between gap-3 mb-4 text-xs text-[#708294]">
              <span className="font-mono-data font-medium text-[#0B1520]">
                {metricMode === 'price' ? c.yAxisPrice : c.yAxisVol}
              </span>
              <span className="font-mono-data">
                {chartData[0]?.month} – {chartData[chartData.length - 1]?.month}
              </span>
            </div>

            <div className="w-full h-[340px] sm:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 18, left: 4, bottom: 6 }}
                >
                  <CartesianGrid
                    stroke="#E5EBF0"
                    strokeDasharray="3 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={{ stroke: '#E5EBF0' }}
                    tickLine={false}
                    tick={{
                      fill: '#4A5B6C',
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={58}
                    tick={{
                      fill: '#4A5B6C',
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    tickFormatter={(val: number) =>
                      metricMode === 'price'
                        ? `$${val}`
                        : `${val > 0 ? '+' : ''}${val}%`
                    }
                    domain={
                      metricMode === 'price' ? ['auto', 'auto'] : [-8, 8]
                    }
                  />
                  {metricMode === 'volatility' && (
                    <ReferenceLine
                      y={0}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                    />
                  )}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0)
                        return null;
                      return (
                        <div className="rounded-xl bg-[#061E29]/95 backdrop-blur-md border border-white/15 px-4 py-3 text-white shadow-xl min-w-[200px]">
                          <div className="text-xs font-mono-data text-sky-300 pb-2 mb-2 border-b border-white/10">
                            {label}
                          </div>
                          <div className="space-y-1.5">
                            {payload.map((entry) => {
                              const meta = COMMODITIES.find(
                                (m) => m.key === entry.dataKey,
                              );
                              const val = Number(entry.value ?? 0);
                              return (
                                <div
                                  key={String(entry.dataKey)}
                                  className="flex items-center justify-between gap-4 text-xs"
                                >
                                  <span className="inline-flex items-center gap-2 text-slate-200">
                                    <span
                                      className="w-2.5 h-1 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span>
                                      {meta ? meta.label[locale] : entry.name}
                                    </span>
                                  </span>
                                  <span className="font-mono-data font-semibold tabular-nums text-white">
                                    {metricMode === 'price'
                                      ? `$${val.toLocaleString()}/MT`
                                      : `${val > 0 ? '+' : ''}${val}%`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }}
                  />

                  {COMMODITIES.map((item) => {
                    if (!activeKeys.includes(item.key)) return null;
                    return (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label[locale]}
                        stroke={item.color}
                        strokeWidth={2.4}
                        dot={{
                          r: 3.5,
                          fill: '#FFFFFF',
                          stroke: item.color,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 5.5,
                          fill: item.color,
                          stroke: '#FFFFFF',
                          strokeWidth: 2,
                        }}
                        isAnimationActive={true}
                        animationDuration={450}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E5EBF0]">
        <p className="text-xs text-[#708294] max-w-2xl leading-relaxed">
          {c.footnote}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('rfq')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {c.requestQuote}
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
