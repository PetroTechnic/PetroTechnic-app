import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  Package,
  Search,
  X,
} from 'lucide-react';
import type { Locale, Product } from '../types/domain';
import { EXPORT_DOCUMENTS, INCOTERMS_LIST } from '../data/trade';
import { usePlatformData } from '../context/PlatformDataContext';

export type SearchScope = 'all' | 'products' | 'insights' | 'docs';

interface SearchResultItem {
  id: string;
  scope: Exclude<SearchScope, 'all'>;
  title: string;
  subtitle: string;
  meta: string;
  searchHaystack: string;
  onSelect: () => void;
}

interface GlobalSearchProps {
  locale: Locale;
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onSelectInsight: (slug: string) => void;
  onOpenDocumentHub: (docId?: string) => void;
  onOpenProcess: () => void;
  onOpenRfq: () => void;
}

const SEARCH_COPY: Record<
  Locale,
  {
    triggerLabel: string;
    placeholder: string;
    allTab: string;
    productsTab: string;
    insightsTab: string;
    docsTab: string;
    quickAccess: string;
    resultsLabel: string;
    noResultsTitle: string;
    noResultsSub: string;
    requestCustomGrade: string;
    escHint: string;
    navHint: string;
    enterHint: string;
    closeLabel: string;
    incotermTag: string;
    exportDocTag: string;
    templateTag: string;
  }
> = {
  en: {
    triggerLabel: 'Search',
    placeholder: 'Search products, CAS / HS codes, insights, PI, B/L, SGS...',
    allTab: 'All',
    productsTab: 'Products',
    insightsTab: 'Market Insights',
    docsTab: 'Documentation',
    quickAccess: 'Quick Access',
    resultsLabel: 'Matching Results',
    noResultsTitle: 'No matching records found',
    noResultsSub:
      'Try searching by polymer grade (HDPE, PP, Urea), HS/CAS code, Incoterm, or trade document (PI, B/L, SGS).',
    requestCustomGrade: 'Request Custom Grade via RFQ',
    escHint: 'ESC to close',
    navHint: '↑↓ Navigate',
    enterHint: '↵ Open',
    closeLabel: 'Close global search',
    incotermTag: 'Incoterms 2020',
    exportDocTag: 'Export Document',
    templateTag: 'Document Hub Template',
  },
  fa: {
    triggerLabel: 'جستجو',
    placeholder: 'جستجوی محصولات، کد HS / CAS، تحلیل بازار، PI، بارنامه، SGS...',
    allTab: 'همه',
    productsTab: 'محصولات',
    insightsTab: 'تحلیل بازار',
    docsTab: 'اسناد و مدارک',
    quickAccess: 'دسترسی سریع',
    resultsLabel: 'نتایج جستجو',
    noResultsTitle: 'موردی یافت نشد',
    noResultsSub:
      'می‌توانید بر اساس گرید محصول (اوره، HDPE، متانول)، کد HS یا نوع سند (PI، B/L، SGS) جستجو کنید.',
    requestCustomGrade: 'ثبت درخواست گرید سفارشی (RFQ)',
    escHint: 'ESC بستن',
    navHint: '↑↓ جابجایی',
    enterHint: '↵ باز کردن',
    closeLabel: 'بستن جستجوی سراسری',
    incotermTag: 'اینکوترمز ۲۰۲۰',
    exportDocTag: 'سند صادراتی',
    templateTag: 'قالب مرکز اسناد',
  },
  ar: {
    triggerLabel: 'بحث',
    placeholder: 'ابحث عن المنتجات، رموز HS / CAS، التحليلات، PI، بوليصة الشحن، SGS...',
    allTab: 'الكل',
    productsTab: 'المنتجات',
    insightsTab: 'رؤى السوق',
    docsTab: 'المستندات',
    quickAccess: 'وصول سريع',
    resultsLabel: 'نتائج البحث',
    noResultsTitle: 'لم يتم العثور على نتائج مطابقة',
    noResultsSub:
      'جرّب البحث باسم المنتج أو الدرجة (اليوريا، HDPE، الميثانول)، رمز HS، أو المستندات (PI، B/L، SGS).',
    requestCustomGrade: 'طلب درجة مخصصة عبر RFQ',
    escHint: 'ESC إغلاق',
    navHint: '↑↓ تنقّل',
    enterHint: '↵ فتح',
    closeLabel: 'إغلاق البحث الشامل',
    incotermTag: 'إنكوترمز ٢٠٢٠',
    exportDocTag: 'مستند تصدير',
    templateTag: 'نموذج مركز المستندات',
  },
};

export function GlobalSearch({
  locale,
  products,
  onSelectProduct,
  onSelectInsight,
  onOpenDocumentHub,
  onOpenProcess,
  onOpenRfq,
}: GlobalSearchProps) {
  const c = SEARCH_COPY[locale];
  const { insights, documentTemplates } = usePlatformData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-focus input & lock background scroll when open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(timer);
    };
  }, [open]);

  const closeAndReset = () => {
    setOpen(false);
    setQuery('');
    setScope('all');
    setActiveIndex(0);
  };

  // Build unified platform search index across Products, Market Insights, and Documentation
  const allItems = useMemo<SearchResultItem[]>(() => {
    const productItems: SearchResultItem[] = products.map((product) => {
      const gradeCodes = product.grades.map((g) => g.code).join(' ');
      const gradeApps = product.grades
        .map((g) => `${g.application.en} ${g.application.fa} ${g.application.ar}`)
        .join(' ');
      return {
        id: `prod-${product.slug}`,
        scope: 'products',
        title: product.name[locale],
        subtitle: product.summary[locale],
        meta: `HS ${product.hsCode} · CAS ${product.casNumber}`,
        searchHaystack: [
          product.name.en,
          product.name.fa,
          product.name.ar,
          product.shortName,
          product.category,
          product.hsCode,
          product.casNumber,
          product.summary.en,
          product.summary.fa,
          product.summary.ar,
          product.formula,
          product.loadingPorts.join(' '),
          gradeCodes,
          gradeApps,
        ]
          .join(' ')
          .toLowerCase(),
        onSelect: () => {
          closeAndReset();
          onSelectProduct(product.slug);
        },
      };
    });

    const insightItems: SearchResultItem[] = insights.map((article) => ({
      id: `insight-${article.slug}`,
      scope: 'insights',
      title: article.title[locale],
      subtitle: article.excerpt[locale],
      meta: `${article.categoryLabel[locale]} · ${article.date}`,
      searchHaystack: [
        article.title.en,
        article.title.fa,
        article.title.ar,
        article.excerpt.en,
        article.excerpt.fa,
        article.excerpt.ar,
        article.category,
        article.categoryLabel.en,
        article.categoryLabel.fa,
        article.categoryLabel.ar,
        ...article.sections.map((s) => `${s.heading.en} ${s.heading.fa} ${s.heading.ar}`),
      ]
        .join(' ')
        .toLowerCase(),
      onSelect: () => {
        closeAndReset();
        onSelectInsight(article.slug);
      },
    }));

    const templateDocItems: SearchResultItem[] = documentTemplates.map(
      (doc) => ({
        id: `doc-tpl-${doc.id}`,
        scope: 'docs',
        title: doc.title[locale],
        subtitle: doc.summary[locale],
        meta: `${doc.code} · ${c.templateTag}`,
        searchHaystack: [
          doc.id,
          doc.code,
          doc.category,
          doc.stageRef,
          doc.documentTitleEn,
          doc.title.en,
          doc.title.fa,
          doc.title.ar,
          doc.summary.en,
          doc.summary.fa,
          doc.summary.ar,
          doc.issuer.en,
        ]
          .join(' ')
          .toLowerCase(),
        onSelect: () => {
          closeAndReset();
          onOpenDocumentHub(doc.id);
        },
      }),
    );

    const exportDocItems: SearchResultItem[] = EXPORT_DOCUMENTS.map((doc) => ({
      id: `doc-exp-${doc.code}`,
      scope: 'docs',
      title: `${doc.title[locale]} (${doc.code})`,
      subtitle: doc.purpose[locale],
      meta: `${doc.issuer[locale]} · ${c.exportDocTag}`,
      searchHaystack: [
        doc.code,
        doc.title.en,
        doc.title.fa,
        doc.title.ar,
        doc.purpose.en,
        doc.purpose.fa,
        doc.purpose.ar,
        doc.issuer.en,
      ]
        .join(' ')
        .toLowerCase(),
      onSelect: () => {
        closeAndReset();
        onOpenProcess();
      },
    }));

    const incotermItems: SearchResultItem[] = INCOTERMS_LIST.map((term) => ({
      id: `doc-inco-${term.code}`,
      scope: 'docs',
      title: `${term.code} — ${term.name[locale]}`,
      subtitle: term.sellerObligation[locale],
      meta: `${c.incotermTag} · ${term.mode[locale]}`,
      searchHaystack: [
        'incoterm',
        'incoterms',
        term.code,
        term.name.en,
        term.name.fa,
        term.name.ar,
        term.sellerObligation.en,
        term.mode.en,
      ]
        .join(' ')
        .toLowerCase(),
      onSelect: () => {
        closeAndReset();
        onOpenProcess();
      },
    }));

    return [
      ...productItems,
      ...insightItems,
      ...templateDocItems,
      ...exportDocItems,
      ...incotermItems,
    ];
  }, [
    products,
    insights,
    documentTemplates,
    locale,
    c.templateTag,
    c.exportDocTag,
    c.incotermTag,
    onSelectProduct,
    onSelectInsight,
    onOpenDocumentHub,
    onOpenProcess,
  ]);

  const normalizedQuery = query.trim().toLowerCase();

  const matchingByQuery = useMemo(() => {
    if (!normalizedQuery) {
      // Curated default quick-access shortlist across all 3 domains
      const defaults = [
        allItems.find((i) => i.id === 'prod-urea-46'),
        allItems.find((i) => i.id === 'prod-hdpe'),
        allItems.find((i) => i.id === 'doc-tpl-proforma-invoice'),
        allItems.find((i) => i.id === 'doc-tpl-bill-of-lading'),
        allItems.find((i) => i.id === 'doc-tpl-sgs-inspection-report'),
        allItems.find((i) => i.scope === 'insights'),
      ].filter((item): item is SearchResultItem => Boolean(item));
      return defaults;
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return allItems.filter((item) =>
      tokens.every((tok) => item.searchHaystack.includes(tok)),
    );
  }, [allItems, normalizedQuery]);

  const visibleResults = useMemo(() => {
    if (scope === 'all') return matchingByQuery.slice(0, 12);
    return matchingByQuery.filter((i) => i.scope === scope).slice(0, 12);
  }, [matchingByQuery, scope]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, scope]);

  const counts = useMemo(
    () => ({
      all: matchingByQuery.length,
      products: matchingByQuery.filter((i) => i.scope === 'products').length,
      insights: matchingByQuery.filter((i) => i.scope === 'insights').length,
      docs: matchingByQuery.filter((i) => i.scope === 'docs').length,
    }),
    [matchingByQuery],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        visibleResults.length > 0 ? (prev + 1) % visibleResults.length : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        visibleResults.length > 0
          ? (prev - 1 + visibleResults.length) % visibleResults.length
          : 0,
      );
    } else if (e.key === 'Enter' && visibleResults[activeIndex]) {
      e.preventDefault();
      visibleResults[activeIndex].onSelect();
    }
  };

  const renderScopeIcon = (itemScope: SearchResultItem['scope']) => {
    if (itemScope === 'products') {
      return <Package className="w-4 h-4 text-[#0E4D64] shrink-0" />;
    }
    if (itemScope === 'insights') {
      return <BookOpen className="w-4 h-4 text-[#0E4D64] shrink-0" />;
    }
    return <FileCheck2 className="w-4 h-4 text-[#0E4D64] shrink-0" />;
  };

  const scopeTabs: { id: SearchScope; label: string; count: number }[] = [
    { id: 'all', label: c.allTab, count: counts.all },
    { id: 'products', label: c.productsTab, count: counts.products },
    { id: 'insights', label: c.insightsTab, count: counts.insights },
    { id: 'docs', label: c.docsTab, count: counts.docs },
  ];

  return (
    <>
      {/* Sleek Navbar Search Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={c.triggerLabel}
        className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-3.5 text-[13px] font-medium text-[#4A5B6C] hover:text-[#0B1520] bg-[#F7F9FB] hover:bg-[#EDF5F8] border border-[#E5EBF0] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E4D64]"
      >
        <Search className="w-4 h-4 text-[#0E4D64] shrink-0" />
        <span className="hidden md:inline">{c.triggerLabel}</span>
        <kbd
          dir="ltr"
          className="hidden xl:inline-flex items-center text-[10px] font-mono-data text-[#708294] px-1.5 py-0.5 rounded bg-white border border-[#E5EBF0]"
        >
          ⌘K
        </kbd>
      </button>

      {/* Command-Palette Global Search Modal */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
            role="dialog"
            aria-modal="true"
            aria-label={c.triggerLabel}
          >
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              onClick={closeAndReset}
              className="fixed inset-0 bg-[#061E29]/55 backdrop-blur-sm"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-2xl rounded-2xl bg-white border border-[#E5EBF0] shadow-[0_32px_90px_-20px_rgba(6,30,41,0.5)] overflow-hidden flex flex-col max-h-[78vh]"
            >
              {/* Search Input Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5EBF0]">
                <Search className="w-5 h-5 text-[#0E4D64] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={c.placeholder}
                  className="flex-1 bg-transparent text-sm sm:text-base text-[#0B1520] placeholder:text-[#708294] focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search query"
                    className="p-1 text-[#708294] hover:text-[#0B1520] rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeAndReset}
                  aria-label={c.closeLabel}
                  className="px-2.5 py-1 text-[11px] font-mono-data text-[#708294] hover:text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg transition-colors cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Scope Filter Bar */}
              <div className="px-5 py-2.5 bg-[#F7F9FB] border-b border-[#E5EBF0] flex flex-wrap items-center gap-1.5">
                {scopeTabs.map((tab) => {
                  const active = scope === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setScope(tab.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0B1520] text-white'
                          : 'text-[#4A5B6C] hover:text-[#0B1520] hover:bg-white'
                      }`}
                    >
                      {tab.label}{' '}
                      <span
                        className={`font-mono-data text-[11px] ${
                          active ? 'text-sky-300' : 'text-[#708294]'
                        }`}
                      >
                        ({tab.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Results List */}
              <div className="overflow-y-auto divide-y divide-[#E5EBF0]">
                {visibleResults.length > 0 ? (
                  <>
                    <div className="px-5 py-2 text-[11px] font-semibold text-[#708294] bg-white">
                      {normalizedQuery ? c.resultsLabel : c.quickAccess}
                    </div>
                    {visibleResults.map((item, idx) => {
                      const highlighted = idx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={item.onSelect}
                          className={`w-full text-start px-5 py-3.5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                            highlighted ? 'bg-[#EDF5F8]/80' : 'bg-white hover:bg-[#F7F9FB]'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F7F9FB] border border-[#E5EBF0] flex items-center justify-center shrink-0 mt-0.5">
                              {renderScopeIcon(item.scope)}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="text-sm font-semibold text-[#0B1520] truncate">
                                {item.title}
                              </div>
                              <p className="text-xs text-[#4A5B6C] line-clamp-1">
                                {item.subtitle}
                              </p>
                              <div className="text-[11px] font-mono-data text-[#708294] truncate">
                                {item.meta}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#0E4D64] shrink-0 mt-2 rtl:rotate-180" />
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-6 py-12 text-center space-y-3">
                    <p className="font-display text-base font-bold text-[#0B1520]">
                      {c.noResultsTitle}
                    </p>
                    <p className="text-xs text-[#4A5B6C] max-w-md mx-auto leading-relaxed">
                      {c.noResultsSub}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        closeAndReset();
                        onOpenRfq();
                      }}
                      className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
                    >
                      <span>{c.requestCustomGrade}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quiet Keyboard Hint Footer */}
              <div className="px-5 py-2.5 bg-[#F7F9FB] border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-data text-[#708294]">
                <div className="flex items-center gap-3">
                  <span>{c.navHint}</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.enterHint}</span>
                </div>
                <span>{c.escHint}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
