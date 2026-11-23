import type { CurrencyCode, Incoterm, Locale, Product } from '../types/domain';

export const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'AED'];

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateFromUsd: number;
  label: string;
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    rateFromUsd: 1,
    label: 'US Dollar',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rateFromUsd: 0.92,
    label: 'Euro',
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    rateFromUsd: 3.6725,
    label: 'UAE Dirham',
  },
};

/**
 * Initial seed FOB benchmark prices (USD / MT) used exclusively by the one-time database seeder.
 * Runtime pricing is read live from each Firestore Product document (`product.fobUsdMt`).
 */
export const PRODUCT_FOB_USD_MT: Record<string, number> = {
  'urea-46': 374,
  'granular-sulfur': 168,
  'anhydrous-ammonia': 445,
  hdpe: 1040,
  ldpe: 1145,
  lldpe: 1020,
  pp: 990,
  pvc: 815,
  pet: 945,
  ps: 1260,
  'abs-pc': 1480,
  methanol: 342,
  'meg-deg': 555,
  'caustic-soda': 490,
  bitumen: 365,
};

/**
 * Initial seed Incoterm freight/insurance deltas per MT (USD) for one-time database seed.
 * Runtime deltas are read live from Firestore `platform_settings/global`.
 */
export const INCOTERM_FREIGHT_DELTA_USD_MT: Record<Incoterm, number> = {
  FOB: 0,
  FCA: 0,
  CFR: 28,
  CIF: 34,
  CPT: 42,
  DAP: 58,
};

export function getProductFobUsd(productOrSlug: Product | string): number {
  if (typeof productOrSlug !== 'string') {
    if (typeof productOrSlug.fobUsdMt === 'number' && productOrSlug.fobUsdMt > 0) {
      return productOrSlug.fobUsdMt;
    }
    return PRODUCT_FOB_USD_MT[productOrSlug.slug] ?? 650;
  }
  return PRODUCT_FOB_USD_MT[productOrSlug] ?? 650;
}

export function getIndicativeUnitUsd(
  productOrSlug: Product | string,
  incoterm: Incoterm,
  incotermDeltas?: Record<Incoterm, number>,
): number {
  const deltaMap = incotermDeltas ?? INCOTERM_FREIGHT_DELTA_USD_MT;
  return getProductFobUsd(productOrSlug) + (deltaMap[incoterm] ?? 0);
}

export function convertFromUsd(
  usdAmount: number,
  currency: CurrencyCode,
  fxRates?: Record<CurrencyCode, number>,
): number {
  const rate = fxRates?.[currency] ?? CURRENCY_CONFIG[currency].rateFromUsd;
  return Math.round(usdAmount * rate);
}

export function formatMoney(amountInCurrency: number, currency: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[currency];
  return `${cfg.symbol}${Math.round(amountInCurrency).toLocaleString('en-US')}`;
}

export function formatUsdAsCurrency(
  usdAmount: number,
  currency: CurrencyCode,
  fxRates?: Record<CurrencyCode, number>,
): string {
  return formatMoney(convertFromUsd(usdAmount, currency, fxRates), currency);
}

export function formatUnitPrice(
  usdPerMt: number,
  currency: CurrencyCode,
  fxRates?: Record<CurrencyCode, number>,
): string {
  return `${formatUsdAsCurrency(usdPerMt, currency, fxRates)} / MT`;
}

export const CURRENCY_COPY: Record<
  Locale,
  {
    indicativeFob: string;
    settlementCurrency: string;
    fxBasis: string;
    unitEstimate: string;
    lotEstimate: string;
    rfqValuationHeading: string;
    rfqValuationNote: string;
    freightBasis: string;
  }
> = {
  en: {
    indicativeFob: 'Indicative FOB',
    settlementCurrency: 'Settlement Currency',
    fxBasis: 'FX Reference',
    unitEstimate: 'Indicative Unit Rate',
    lotEstimate: 'Estimated Lot Value',
    rfqValuationHeading: 'Indicative Commercial Valuation',
    rfqValuationNote:
      'Live estimate updates with currency, tonnage, and Incoterm 2020. Binding offer issued in FCO/PI.',
    freightBasis: 'Includes indicative freight/insurance allowance for',
  },
  fa: {
    indicativeFob: 'قیمت تقریبی FOB',
    settlementCurrency: 'ارز تسویه',
    fxBasis: 'نرخ مرجع تبدیل',
    unitEstimate: 'نرخ تقریبی هر تن',
    lotEstimate: 'ارزش کل تخمینی محموله',
    rfqValuationHeading: 'برآورد ارزش تجاری محموله',
    rfqValuationNote:
      'برآورد زنده بر اساس ارز انتخابی، تناژ و اینکوترم ۲۰۲۰ محاسبه می‌شود. قیمت قطعی در FCO/PI اعلام می‌گردد.',
    freightBasis: 'شامل برآورد حمل و بیمه برای ترم',
  },
  ar: {
    indicativeFob: 'سعر FOB استرشادي',
    settlementCurrency: 'عملة التسوية',
    fxBasis: 'سعر الصرف المرجعي',
    unitEstimate: 'السعر الاسترشادي للطن',
    lotEstimate: 'القيمة التقديرية للشحنة',
    rfqValuationHeading: 'التقييم التجاري الاسترشادي',
    rfqValuationNote:
      'يتحدث التقدير فورياً مع العملة والكمية وإنكوترمز ٢٠٢٠. يُثبّت السعر النهائي في FCO/PI.',
    freightBasis: 'يشمل بدل الشحن والتأمين التقديري لشرط',
  },
};
