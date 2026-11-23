import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { Locale } from '../src/types/domain.ts';

export type MarketNewsTopic =
  | 'all'
  | 'polymers'
  | 'urea'
  | 'methanol'
  | 'sulfur';

export interface MarketNewsHeadline {
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

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MarketIntelligenceResponse {
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

const MODEL_NAME = 'gemini-4-hydrogen';
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  data: Omit<MarketIntelligenceResponse, 'cached'>;
}

const intelligenceCache = new Map<string, CacheEntry>();

const TOPIC_QUERIES: Record<MarketNewsTopic, string> = {
  all: 'global petrochemical pricing news today including Urea 46% FOB Middle East, HDPE/PP polymer resin spot prices Asia Europe, Methanol FOB, Sulfur, and Naphtha/Ethylene feedstock benchmarks',
  polymers:
    'global polyolefin and polymer resin pricing news today: HDPE, LDPE, LLDPE, Polypropylene (PP), PVC spot prices, Middle East and Asian export offers, steam cracker run rates',
  urea: 'global urea 46% granular and prilled fertilizer pricing news today: FOB Middle East, India urea import tenders, China export quotas, Black Sea and Egypt benchmarks, ammonia feedstock',
  methanol:
    'global methanol, MEG, and aromatics petrochemical pricing news today: CFR China methanol, FOB Middle East, MTO plant operating rates, European spot prices',
  sulfur:
    'global granular sulfur, sulfuric acid, and bitumen pricing news today: Middle East FOB sulfur contracts, China port inventories, refinery turnaround supply impacts',
};

const LOCALE_LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  fa: 'Persian (Farsi)',
  ar: 'Arabic',
};

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Please add a valid Gemini API key in Settings > Secrets.',
    );
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractGroundingSources(response: unknown): GroundingSource[] {
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  const candidates = (
    response as {
      candidates?: Array<{
        groundingMetadata?: {
          groundingChunks?: Array<{
            web?: { uri?: string; title?: string };
          }>;
        };
      }>;
    }
  )?.candidates;

  const chunks = candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri?.trim();
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    const title = chunk?.web?.title?.trim() || uri;
    sources.push({ title, uri });
  }
  return sources.slice(0, 8);
}

function parseJsonPayload(rawText: string): {
  executiveBrief: string;
  marketTone: 'bullish' | 'bearish' | 'mixed' | 'neutral';
  marketToneLabel: string;
  headlines: MarketNewsHeadline[];
} {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as {
    executiveBrief?: string;
    marketTone?: string;
    marketToneLabel?: string;
    headlines?: Array<Partial<MarketNewsHeadline>>;
  };

  const allowedTones = new Set(['bullish', 'bearish', 'mixed', 'neutral']);
  const tone = allowedTones.has(String(parsed.marketTone))
    ? (parsed.marketTone as 'bullish' | 'bearish' | 'mixed' | 'neutral')
    : 'mixed';

  const allowedSignals = new Set(['up', 'down', 'stable']);

  const headlines: MarketNewsHeadline[] = Array.isArray(parsed.headlines)
    ? parsed.headlines
        .filter((h) => h && h.headline && h.summary)
        .slice(0, 6)
        .map((h, idx) => ({
          id: `mi-${Date.now()}-${idx}`,
          headline: String(h.headline).trim(),
          summary: String(h.summary).trim(),
          commodity: String(h.commodity || 'Petrochemicals').trim(),
          region: String(h.region || 'Global').trim(),
          priceSignal: allowedSignals.has(String(h.priceSignal))
            ? (h.priceSignal as 'up' | 'down' | 'stable')
            : 'stable',
          priceImpactNote: String(
            h.priceImpactNote || 'Monitor spot FOB offers',
          ).trim(),
          sourceName: String(h.sourceName || 'Industry Wire').trim(),
          publishedDate: String(
            h.publishedDate || new Date().toISOString().slice(0, 10),
          ).trim(),
        }))
    : [];

  if (!parsed.executiveBrief || headlines.length === 0) {
    throw new Error('Gemini returned an incomplete market intelligence payload.');
  }

  return {
    executiveBrief: String(parsed.executiveBrief).trim(),
    marketTone: tone,
    marketToneLabel: String(parsed.marketToneLabel || tone).trim(),
    headlines,
  };
}

export function normalizeGeminiError(err: unknown): {
  status: number;
  message: string;
} {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const explicitStatus = (err as { statusCode?: number; status?: number })
    ?.statusCode ?? (err as { status?: number })?.status;

  if (explicitStatus === 503) {
    return { status: 503, message: rawMessage };
  }
  if (
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('PERMISSION_DENIED') ||
    explicitStatus === 403
  ) {
    return {
      status: 403,
      message:
        'Gemini API authentication failed. Please verify your API key in Settings > Secrets.',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || explicitStatus === 429) {
    return {
      status: 429,
      message:
        'Gemini API quota temporarily reached. Please retry shortly or check billing in Settings > Secrets.',
    };
  }
  if (rawMessage.includes('NOT_FOUND') || explicitStatus === 404) {
    return {
      status: 502,
      message: `Model '${MODEL_NAME}' was not found or is currently unavailable.`,
    };
  }
  return {
    status: 502,
    message: rawMessage || 'Unable to fetch daily petrochemical market intelligence.',
  };
}

export async function fetchMarketIntelligence(params: {
  topic: MarketNewsTopic;
  locale: Locale;
  forceRefresh?: boolean;
}): Promise<MarketIntelligenceResponse> {
  const { topic, locale, forceRefresh = false } = params;
  const cacheKey = `${topic}:${locale}`;

  if (!forceRefresh) {
    const cached = intelligenceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.data, cached: true };
    }
  }

  const ai = createGeminiClient();
  const todayIso = new Date().toISOString().slice(0, 10);
  const targetLanguage = LOCALE_LANGUAGE_NAMES[locale];
  const topicInstruction = TOPIC_QUERIES[topic];

  const prompt = [
    `Date reference: ${todayIso}.`,
    `Search the web for the latest global petrochemical pricing and commodity market news focused on: ${topicInstruction}.`,
    `Synthesize a concise daily institutional trading-desk briefing written in ${targetLanguage} (keep standard chemical symbols, port names, Incoterms like FOB/CFR, and USD/MT figures clear).`,
    `Return ONLY valid JSON matching the requested schema with 5 distinct, recent industry headlines grounded in search results, each with a concise 2-sentence pricing summary, affected commodity, key region, priceSignal ("up", "down", or "stable"), a short priceImpactNote (e.g. "+$10–15/MT CFR India" or "Steady FOB Middle East"), sourceName, and publishedDate (YYYY-MM-DD or recent date string).`,
  ].join('\n');

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior petrochemical pricing analyst at PetroTechnics Commodity Research. Produce crisp, factual, grounded daily market intelligence summaries for bulk polymer, fertilizer, methanol, and sulfur traders. Never invent unverified price numbers; reflect current search findings accurately.',
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveBrief: {
                type: Type.STRING,
                description:
                  'A 2-3 sentence executive synthesis of today’s global petrochemical pricing drivers.',
              },
              marketTone: {
                type: Type.STRING,
                description: 'One of: bullish, bearish, mixed, neutral',
              },
              marketToneLabel: {
                type: Type.STRING,
                description:
                  'Short localized market tone label (2-4 words) in the requested output language.',
              },
              headlines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    commodity: { type: Type.STRING },
                    region: { type: Type.STRING },
                    priceSignal: {
                      type: Type.STRING,
                      description: 'One of: up, down, stable',
                    },
                    priceImpactNote: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                    publishedDate: { type: Type.STRING },
                  },
                  required: [
                    'headline',
                    'summary',
                    'commodity',
                    'region',
                    'priceSignal',
                    'priceImpactNote',
                    'sourceName',
                    'publishedDate',
                  ],
                },
              },
            },
            required: [
              'executiveBrief',
              'marketTone',
              'marketToneLabel',
              'headlines',
            ],
          },
        },
      });

      const rawText = response.text ?? '';
      const parsed = parseJsonPayload(rawText);
      const groundingSources = extractGroundingSources(response);

      const data: Omit<MarketIntelligenceResponse, 'cached'> = {
        generatedAt: new Date().toISOString(),
        topic,
        locale,
        model: MODEL_NAME,
        executiveBrief: parsed.executiveBrief,
        marketTone: parsed.marketTone,
        marketToneLabel: parsed.marketToneLabel,
        headlines: parsed.headlines,
        groundingSources,
      };

      intelligenceCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data,
      });

      return { ...data, cached: false };
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      // Do not retry non-transient auth/quota/client errors
      if (status && status >= 400 && status < 500 && status !== 429) {
        break;
      }
      if (attempt < 2) {
        await sleep(600 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}
