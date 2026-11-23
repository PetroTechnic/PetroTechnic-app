import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Lock } from 'lucide-react';
import type { AppView, CurrencyCode, Locale, Product } from './types/domain';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  PlatformDataProvider,
  usePlatformData,
} from './context/PlatformDataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RustBackendModal } from './components/RustBackendModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { TradeProcessView } from './views/TradeProcessView';
import { MarketsLogisticsView } from './views/MarketsLogisticsView';
import { InsightsView } from './views/InsightsView';
import { AboutFaqView } from './views/AboutFaqView';
import { RfqView, type RfqPrefill } from './views/RfqView';
import { ClientPortalView } from './views/ClientPortalView';
import { AdminDashboardView } from './views/AdminDashboardView';

function PetroTechnicsShell() {
  const { products, corridors, isDatabaseEmpty, loading } = usePlatformData();
  const [locale, setLocale] = useState<Locale>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (window.location.pathname.startsWith('/admin')) return 'admin';
    if (window.location.pathname.startsWith('/portal')) return 'portal';
    return 'home';
  });
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [selectedInsightSlug, setSelectedInsightSlug] = useState<string | null>(
    null,
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [rfqPrefill, setRfqPrefill] = useState<RfqPrefill | null>(null);
  const [rustModalOpen, setRustModalOpen] = useState(false);

  // Sync HTML lang and dir attributes for seamless English (LTR) / Persian & Arabic (RTL) switching
  useEffect(() => {
    const isRtl = activeView !== 'admin' && (locale === 'fa' || locale === 'ar');
    document.documentElement.lang = activeView === 'admin' ? 'en' : locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [locale, activeView]);

  // Keep selectedProductSlug synced when Firestore products load
  useEffect(() => {
    if (products.length > 0 && !selectedProductSlug) {
      setSelectedProductSlug(products[0].slug);
    }
  }, [products, selectedProductSlug]);

  const navigate = (view: AppView) => {
    if (view !== 'insights') {
      setSelectedInsightSlug(null);
    }
    setActiveView(view);
    if (view === 'admin') {
      window.history.replaceState(null, '', '/admin');
    } else if (view === 'portal') {
      window.history.replaceState(null, '', '/portal');
    } else if (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/portal')
    ) {
      window.history.replaceState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocumentHub = (docId?: string) => {
    if (docId) {
      setSelectedDocumentId(docId);
    }
    setActiveView('process');
    setTimeout(() => {
      document
        .getElementById('document-hub')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 160);
  };

  const handleSelectInsight = (slug: string) => {
    setSelectedInsightSlug(slug);
    setActiveView('insights');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    navigate('product-detail');
  };

  const handleRequestProductQuote = (
    product: Product,
    grade: string,
    packaging: string,
  ) => {
    setRfqPrefill({
      productSlug: product.slug,
      grade,
      packaging,
    });
    navigate('rfq');
  };

  const handleRequestCorridorQuote = (destinationHint: string) => {
    setRfqPrefill({
      destination: destinationHint,
    });
    navigate('rfq');
  };

  // Dedicated Full-Screen Superadmin Operations Console
  if (activeView === 'admin') {
    return (
      <AdminDashboardView
        onExitAdmin={(target = 'home') => navigate(target)}
      />
    );
  }

  const selectedProduct =
    products.find((p) => p.slug === selectedProductSlug) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0B1520]">
      <Navbar
        activeView={activeView}
        locale={locale}
        currency={currency}
        products={products}
        onChangeCurrency={setCurrency}
        onNavigate={navigate}
        onSelectProduct={handleSelectProduct}
        onSelectInsight={handleSelectInsight}
        onOpenDocumentHub={handleOpenDocumentHub}
      />

      {/* First-Boot Real-Database Initialization Notice (Only shown when Firestore is empty) */}
      {!loading && isDatabaseEmpty && (
        <div className="bg-[#061E29] text-white border-b border-white/10">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-2 text-slate-200">
              <Database className="w-4 h-4 text-sky-300 shrink-0" />
              <span>
                Live Firestore database is connected and empty. Sign in to the Superadmin Console to run the one-time PetroTechnics catalog seed.
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-[#061E29] bg-white hover:bg-sky-50 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Open Admin Console</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeView}-${activeView === 'product-detail' ? selectedProductSlug : ''}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeView === 'home' && (
              <HomeView
                locale={locale}
                products={products}
                corridors={corridors}
                onChangeLocale={setLocale}
                onNavigate={navigate}
                onOpenDocumentHub={handleOpenDocumentHub}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {activeView === 'products' && (
              <CatalogView
                locale={locale}
                currency={currency}
                onChangeLocale={setLocale}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {activeView === 'product-detail' && selectedProduct && (
              <ProductDetailView
                locale={locale}
                currency={currency}
                product={selectedProduct}
                onChangeLocale={setLocale}
                onBack={() => navigate('products')}
                onRequestQuote={handleRequestProductQuote}
              />
            )}

            {activeView === 'process' && (
              <TradeProcessView
                locale={locale}
                initialDocumentId={selectedDocumentId}
                onChangeLocale={setLocale}
                onNavigate={navigate}
              />
            )}

            {activeView === 'markets' && (
              <MarketsLogisticsView
                locale={locale}
                corridors={corridors}
                onChangeLocale={setLocale}
                onRequestCorridorQuote={handleRequestCorridorQuote}
              />
            )}

            {activeView === 'insights' && (
              <InsightsView
                locale={locale}
                initialArticleSlug={selectedInsightSlug}
                onClearInitialArticle={() => setSelectedInsightSlug(null)}
                onChangeLocale={setLocale}
                onNavigate={navigate}
              />
            )}

            {activeView === 'about' && (
              <AboutFaqView locale={locale} onChangeLocale={setLocale} />
            )}

            {activeView === 'rfq' && (
              <RfqView
                locale={locale}
                currency={currency}
                products={products}
                prefill={rfqPrefill}
                onChangeLocale={setLocale}
                onOpenPortal={() => navigate('portal')}
              />
            )}

            {activeView === 'portal' && (
              <ClientPortalView
                locale={locale}
                currency={currency}
                products={products}
                onChangeLocale={setLocale}
                onChangeCurrency={setCurrency}
                onNavigate={navigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer
        locale={locale}
        onNavigate={navigate}
        onOpenDocumentHub={handleOpenDocumentHub}
        onSelectProduct={handleSelectProduct}
        onChangeLocale={setLocale}
        onOpenRustModal={() => setRustModalOpen(true)}
        onOpenAdmin={() => navigate('admin')}
      />

      <RustBackendModal
        open={rustModalOpen}
        locale={locale}
        onClose={() => setRustModalOpen(false)}
      />

      <ScrollToTopButton locale={locale} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PlatformDataProvider>
        <PetroTechnicsShell />
      </PlatformDataProvider>
    </ErrorBoundary>
  );
}
