import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import type { AppView, CurrencyCode, Locale, Product } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { CURRENCIES } from '../data/currency';
import { GlobalSearch } from './GlobalSearch';

interface NavbarProps {
  activeView: AppView;
  locale: Locale;
  currency: CurrencyCode;
  products: Product[];
  onChangeCurrency: (currency: CurrencyCode) => void;
  onNavigate: (view: AppView) => void;
  onSelectProduct: (slug: string) => void;
  onSelectInsight: (slug: string) => void;
  onOpenDocumentHub: (docId?: string) => void;
}

export function Navbar({
  activeView,
  locale,
  currency,
  products,
  onChangeCurrency,
  onNavigate,
  onSelectProduct,
  onSelectInsight,
  onOpenDocumentHub,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = UI_STRINGS[locale].nav;

  const navItems: { view: AppView; label: string }[] = [
    { view: 'products', label: t.products },
    { view: 'process', label: t.process },
    { view: 'markets', label: t.markets },
    { view: 'insights', label: t.insights },
    { view: 'about', label: t.about },
    { view: 'portal', label: t.portal },
  ];

  const handleNav = (view: AppView) => {
    setMobileOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E5EBF0]/80">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 h-[72px] flex items-center justify-between gap-4 lg:gap-6">
        {/* Zone 1: Single-line editorial Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-[22px] font-bold tracking-[-0.03em] text-[#0B1520] hover:text-[#0E4D64] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E4D64]"
        >
          PetroTechnics
        </button>

        {/* Zone 2: Clean single-line navigation links with fluid motion underline */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13.5px] font-medium"
        >
          {navItems.map((item) => {
            const isActive =
              activeView === item.view ||
              (item.view === 'products' && activeView === 'product-detail');
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNav(item.view)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E4D64] ${
                  isActive
                    ? 'text-[#0B1520] font-semibold'
                    : 'text-[#4A5B6C] hover:text-[#0B1520]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-[2px] bg-[#0E4D64]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Currency Toggle + Global Search + Single Decisive Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Compact USD / EUR / AED Segmented Currency Toggle */}
          <div
            role="group"
            aria-label="Settlement Currency"
            dir="ltr"
            className="hidden md:inline-flex items-center p-0.5 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full shrink-0"
          >
            {CURRENCIES.map((code) => {
              const active = currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeCurrency(code)}
                  aria-pressed={active}
                  className={`relative px-2.5 py-1.5 text-[11px] font-mono-data font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="navbar-currency-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      className="absolute inset-0 bg-[#0B1520] rounded-full"
                    />
                  )}
                  <span className="relative z-10">{code}</span>
                </button>
              );
            })}
          </div>

          <GlobalSearch
            locale={locale}
            products={products}
            onSelectProduct={(slug) => {
              setMobileOpen(false);
              onSelectProduct(slug);
            }}
            onSelectInsight={(slug) => {
              setMobileOpen(false);
              onSelectInsight(slug);
            }}
            onOpenDocumentHub={(docId) => {
              setMobileOpen(false);
              onOpenDocumentHub(docId);
            }}
            onOpenProcess={() => handleNav('process')}
            onOpenRfq={() => handleNav('rfq')}
          />

          <button
            type="button"
            onClick={() => handleNav('rfq')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 xl:px-5 py-2.5 text-[13px] font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E4D64]"
          >
            {t.requestQuote}
            <ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#0B1520] border border-[#E5EBF0] rounded-full hover:bg-[#F7F9FB] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-[#E5EBF0] bg-white px-5 py-5 space-y-1 shadow-lg"
          >
            {navItems.map((item) => {
              const isActive =
                activeView === item.view ||
                (item.view === 'products' && activeView === 'product-detail');
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleNav(item.view)}
                  className={`w-full text-start px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EDF5F8] text-[#0E4D64] font-semibold'
                      : 'text-[#4A5B6C] hover:bg-[#F7F9FB] hover:text-[#0B1520]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-3 mt-2 border-t border-[#E5EBF0] space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-[#708294]">
                  {locale === 'fa'
                    ? 'ارز تسویه'
                    : locale === 'ar'
                      ? 'عملة التسوية'
                      : 'Currency'}
                </span>
                <div
                  role="group"
                  aria-label="Settlement Currency"
                  dir="ltr"
                  className="inline-flex items-center p-0.5 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full"
                >
                  {CURRENCIES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onChangeCurrency(code)}
                      className={`px-3 py-1 text-xs font-mono-data font-semibold rounded-full transition-colors cursor-pointer ${
                        currency === code
                          ? 'bg-[#0B1520] text-white'
                          : 'text-[#4A5B6C]'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleNav('rfq')}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
              >
                {t.requestQuote}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
