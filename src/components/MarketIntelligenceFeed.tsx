import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ExternalLink,
  Globe2,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { Locale } from '../types/domain';

type MarketNewsTopic = 'all' | 'polymers' | 'urea' | 'methanol' | 'sulfur';

interface MarketNewsHeadline {
  id: string;
  headline: string;
  summary: string;
  commodity: string;
  region: string;
  priceSignal: 'up' | 'down' | 'stable';
  priceImpactNote: string;
  sourceName: string;
  publishedDate: string;
}

interface GroundingSource {
  title: string;
  uri: string;
}

interface MarketIntelligencePayload {
  generatedAt: string;
  topic: MarketNewsTopic;
  locale: Locale;
  model: string;
  executiveBrief: string;
  marketTone: 'bullish' | 'bearish' | 'mixed' | 'neutral';
  marketToneLabel: string;
  headlines: MarketNewsHeadline[];
  groundingSources: GroundingSource[];
  cached: boolean;
}

interface MarketIntelligenceFeedProps {
  locale: Locale;
}

const FEED_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    refreshBtn: string;
    refreshing: string;
    dailySynthesis: string;
    updatedLabel: string;
    sourcesTitle: string;
    loadingText: string;
    retryBtn: string;
    signalUp: string;
    signalDown: string;
    signalStable: string;
    topics: Record<MarketNewsTopic, string>;
  }
> = {
  en: {
    eyebrow: 'Daily Global Pricing Feed · Search-Grounded Synthesis',
    title: 'Market Intelligence',
    subtitle:
      'Daily global petrochemical pricing headlines summarized across polyolefins, nitrogen fertilizers, methanol, and sulfur benchmarks with live source verification.',
    refreshBtn: 'Refresh Daily Brief',
    refreshing: 'Synthesizing Headlines...',
    dailySynthesis: 'Daily Desk Synthesis',
    updatedLabel: 'Updated',
    sourcesTitle: 'Verified News Sources',
    loadingText: 'Gathering and summarizing global petrochemical pricing headlines...',
    retryBtn: 'Retry Fetch',
    signalUp: 'Firming',
    signalDown: 'Softening',
    signalStable: 'Steady',
    topics: {
      all: 'All Petrochemicals',
      polymers: 'Polymers (PE / PP)',
      urea: 'Urea & Fertilizers',
      methanol: 'Methanol & Aromatics',
      sulfur: 'Sulfur & Bitumen',
    },
  },
  fa: {
    eyebrow: 'خوراک روزانه قیمت‌گذاری جهانی · خلاصه‌سازی مستند',
    title: 'هوش بازار و اخبار قیمت‌گذاری',
    subtitle:
      'خلاصه روزانه مهم‌ترین تیترهای جهانی قیمت‌گذاری محصولات پتروشیمی در حوزه‌های پلی‌الفین، اوره، متانول و گوگرد همراه با ارجاع به منابع معتبر.',
    refreshBtn: 'بروزرسانی گزارش روزانه',
    refreshing: 'در حال تحلیل تیترها...',
    dailySynthesis: 'جمع‌بندی روزانه میز بازرگانی',
    updatedLabel: 'بروزرسانی',
    sourcesTitle: 'منابع خبری استنادشده',
    loadingText: 'در حال گردآوری و خلاصه‌سازی تازه‌ترین اخبار قیمت‌گذاری پتروشیمی...',
    retryBtn: 'تلاش مجدد',
    signalUp: 'صعودی',
    signalDown: 'نزولی',
    signalStable: 'باثبات',
    topics: {
      all: 'همه محصولات پتروشیمی',
      polymers: 'پلیمرها (PE / PP)',
      urea: 'اوره و کودهای شیمیایی',
      methanol: 'متانول و آروماتیک‌ها',
      sulfur: 'گوگرد و قیر',
    },
  },
  ar: {
    eyebrow: 'موجز التسعير العالمي اليومي · ملخصات موثقة بالمصادر',
    title: 'ذكاء السوق وأخبار التسعير',
    subtitle:
      'ملخص يومي لأبرز العناوين العالمية لتسعير البتروكيماويات عبر البولي أوليفينات واليوريا والميثانول والكبريت مع توثيق المصادر المباشرة.',
    refreshBtn: 'تحديث الموجز اليومي',
    refreshing: 'جاري تلخيص العناوين...',
    dailySynthesis: 'ملخص المكتب التجاري اليومي',
    updatedLabel: 'آخر تحديث',
    sourcesTitle: 'المصادر الإخبارية الموثقة',
    loadingText: 'جاري جمع وتلخيص أحدث أخبار تسعير البتروكيماويات العالمية...',
    retryBtn: 'إعادة المحاولة',
    signalUp: 'صاعد',
    signalDown: 'هابط',
    signalStable: 'مستقر',
    topics: {
      all: 'جميع البتروكيماويات',
      polymers: 'البوليمرات (PE / PP)',
      urea: 'اليوريا والأسمدة',
      methanol: 'الميثانول والعطريات',
      sulfur: 'الكبريت والبيتومين',
    },
  },
};

const TOPIC_ORDER: MarketNewsTopic[] = [
  'all',
  'polymers',
  'urea',
  'methanol',
  'sulfur',
];

function formatTimestamp(iso: string, locale: Locale): string {
  try {
    const date = new Date(iso);
    const intlLocale =
      locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar-AE' : 'en-GB';
    return new Intl.DateTimeFormat(intlLocale, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

export function MarketIntelligenceFeed({ locale }: MarketIntelligenceFeedProps) {
  const c = FEED_COPY[locale];
  const [topic, setTopic] = useState<MarketNewsTopic>('all');
  const [data, setData] = useState<MarketIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(
    async (
      targetTopic: MarketNewsTopic,
      targetLocale: Locale,
      refresh = false,
      signal?: AbortSignal,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          topic: targetTopic,
          locale: targetLocale,
          ...(refresh ? { refresh: 'true' } : {}),
        });
        const res = await fetch(`/api/market-intelligence?${query.toString()}`, {
          signal,
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(
            body?.error || 'Unable to load daily petrochemical market intelligence.',
          );
        }
        setData(body as MarketIntelligencePayload);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load daily petrochemical market intelligence.',
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadFeed(topic, locale, false, controller.signal);
    return () => controller.abort();
  }, [topic, locale, loadFeed]);

  const renderSignal = (signal: MarketNewsHeadline['priceSignal']) => {
    if (signal === 'up') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E6A50]">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>{c.signalUp}</span>
        </span>
      );
    }
    if (signal === 'down') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A63A3A]">
          <TrendingDown className="w-3.5 h-3.5 shrink-0" />
          <span>{c.signalDown}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A5B6C]">
        <Minus className="w-3.5 h-3.5 shrink-0" />
        <span>{c.signalStable}</span>
      </span>
    );
  };

  const renderToneIcon = (tone: MarketIntelligencePayload['marketTone']) => {
    if (tone === 'bullish') {
      return <TrendingUp className="w-4 h-4 text-emerald-300 shrink-0" />;
    }
    if (tone === 'bearish') {
      return <TrendingDown className="w-4 h-4 text-rose-300 shrink-0" />;
    }
    return <Globe2 className="w-4 h-4 text-sky-300 shrink-0" />;
  };

  return (
    <section
      id="market-intelligence"
      className="rounded-3xl overflow-hidden border border-[#E5EBF0] bg-white shadow-[0_24px_64px_-32px_rgba(11,21,32,0.14)]"
    >
      {/* Top Deep-Petrol Executive Masthead */}
      <div className="bg-[#061E29] text-white p-7 sm:p-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
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

          <button
            type="button"
            disabled={loading}
            onClick={() => loadFeed(topic, locale, true)}
            className="inline-flex items-center gap-2 self-start lg:self-end px-5 py-2.5 text-xs font-semibold text-[#061E29] bg-white hover:bg-sky-50 disabled:opacity-60 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? c.refreshing : c.refreshBtn}</span>
          </button>
        </div>

        {/* Executive Daily Brief Summary Box */}
        {data && !error && (
          <div className="rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="inline-flex items-center gap-2 font-semibold text-sky-200">
                {renderToneIcon(data.marketTone)}
                <span>
                  {c.dailySynthesis} · {data.marketToneLabel}
                </span>
              </div>
              <span className="font-mono-data text-slate-300 tabular-nums">
                {c.updatedLabel}: {formatTimestamp(data.generatedAt, locale)}
              </span>
            </div>
            <p className="text-sm sm:text-[15px] text-slate-100 leading-relaxed">
              {data.executiveBrief}
            </p>
          </div>
        )}
      </div>

      {/* Topic Selector Toolbar */}
      <div className="px-6 sm:px-9 py-4 bg-[#F7F9FB] border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center p-1 bg-white border border-[#E5EBF0] rounded-full">
          {TOPIC_ORDER.map((tKey) => {
            const active = topic === tKey;
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => setTopic(tKey)}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="market-intel-topic"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 bg-[#0B1520] rounded-full"
                  />
                )}
                <span className="relative z-10">{c.topics[tKey]}</span>
              </button>
            );
          })}
        </div>

        {data && !loading && (
          <span className="text-xs font-mono-data text-[#708294]" dir="ltr">
            {data.headlines.length} briefs · {data.groundingSources.length} sources
          </span>
        )}
      </div>

      {/* Main Feed Body */}
      <div className="p-6 sm:p-9 space-y-8">
        {loading && (
          <div className="space-y-6">
            <div className="text-xs font-medium text-[#4A5B6C]">
              {c.loadingText}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E5EBF0] bg-[#F7F9FB] p-6 space-y-3 animate-pulse"
                >
                  <div className="h-3 w-36 bg-[#DCE5EC] rounded" />
                  <div className="h-5 w-4/5 bg-[#DCE5EC] rounded" />
                  <div className="h-4 w-full bg-[#E5EBF0] rounded" />
                  <div className="h-4 w-5/6 bg-[#E5EBF0] rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0B1520]">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadFeed(topic, locale, true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {c.retryBtn}
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.headlines.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] hover:bg-white hover:border-[#0E4D64]/35 transition-all p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2 text-[#708294]">
                        <span className="font-semibold text-[#0E4D64]">
                          {item.commodity}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.region}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-data" dir="ltr">
                          {item.publishedDate}
                        </span>
                      </div>
                      {renderSignal(item.priceSignal)}
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#0B1520] leading-snug">
                      {item.headline}
                    </h3>

                    <p className="text-sm text-[#4A5B6C] leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono-data font-medium text-[#0E4D64]">
                      {item.priceImpactNote}
                    </span>
                    <span className="text-[#708294]">{item.sourceName}</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Verified Grounding Sources */}
            {data.groundingSources.length > 0 && (
              <div className="pt-6 border-t border-[#E5EBF0] space-y-3">
                <h3 className="text-xs font-semibold text-[#0B1520]">
                  {c.sourcesTitle}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {data.groundingSources.map((src) => (
                    <a
                      key={src.uri}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#4A5B6C] hover:text-[#0E4D64] underline underline-offset-4 transition-colors max-w-xs truncate"
                      title={src.title}
                    >
                      <span className="truncate">{src.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
