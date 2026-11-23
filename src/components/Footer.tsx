import { Lock } from 'lucide-react';
import type { AppView, Locale } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { usePlatformData } from '../context/PlatformDataContext';

interface FooterProps {
  locale: Locale;
  onNavigate: (view: AppView) => void;
  onOpenDocumentHub: () => void;
  onSelectProduct: (slug: string) => void;
  onChangeLocale: (locale: Locale) => void;
  onOpenRustModal: () => void;
  onOpenAdmin: () => void;
}

export function Footer({
  locale,
  onNavigate,
  onOpenDocumentHub,
  onSelectProduct,
  onChangeLocale,
  onOpenRustModal,
  onOpenAdmin,
}: FooterProps) {
  const t = UI_STRINGS[locale];
  const { products, regionalDesks } = usePlatformData();

  const featuredLinks = products.slice(0, 6);

  return (
    <footer className="bg-[#F7F9FB] border-t border-[#E5EBF0] mt-24">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[#E5EBF0]">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-display text-2xl font-bold tracking-[-0.03em] text-[#0B1520] cursor-pointer"
            >
              PetroTechnics
            </button>
            <p className="text-sm text-[#4A5B6C] leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#708294]">
              <button
                type="button"
                onClick={() => onChangeLocale('en')}
                className={`cursor-pointer hover:text-[#0E4D64] ${
                  locale === 'en' ? 'text-[#0E4D64] font-semibold' : ''
                }`}
              >
                English
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onChangeLocale('fa')}
                className={`cursor-pointer hover:text-[#0E4D64] ${
                  locale === 'fa' ? 'text-[#0E4D64] font-semibold' : ''
                }`}
              >
                فارسی
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onChangeLocale('ar')}
                className={`cursor-pointer hover:text-[#0E4D64] ${
                  locale === 'ar' ? 'text-[#0E4D64] font-semibold' : ''
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="text-xs font-semibold text-[#0B1520]">
              {t.footer.navigationTitle}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#4A5B6C]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.products}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('process')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.process}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenDocumentHub}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {locale === 'fa'
                    ? 'مرکز اسناد امن'
                    : locale === 'ar'
                      ? 'مركز المستندات الآمن'
                      : 'Document Hub'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('markets')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.markets}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('insights')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.insights}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('portal')}
                  className="hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  {t.nav.portal}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="hover:text-[#0E4D64] transition-colors font-semibold text-[#0E4D64] cursor-pointer"
                >
                  {t.nav.requestQuote}
                </button>
              </li>
            </ul>
          </div>

          {/* Flagship Products (Live from Firestore) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-semibold text-[#0B1520]">
              {t.footer.productsTitle}
            </h3>
            {featuredLinks.length > 0 ? (
              <ul className="space-y-2.5 text-sm text-[#4A5B6C]">
                {featuredLinks.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(item.slug)}
                      className="hover:text-[#0E4D64] transition-colors cursor-pointer text-start"
                    >
                      {item.shortName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#708294]">
                Catalog syncing with live database.
              </p>
            )}
          </div>

          {/* Commercial Desks (Live from Firestore platform_settings/global) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-semibold text-[#0B1520]">
              {t.footer.contactTitle}
            </h3>
            {regionalDesks.length > 0 ? (
              <div className="space-y-3.5 text-sm text-[#4A5B6C]">
                {regionalDesks.map((desk) => (
                  <div key={desk.email} className="space-y-0.5">
                    <div className="font-semibold text-[#0B1520]">
                      {desk.city[locale]}
                    </div>
                    <div className="text-xs font-mono-data text-[#4A5B6C]" dir="ltr">
                      {desk.phone} · {desk.email}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#708294]">
                Commercial desks managed via Admin Console.
              </p>
            )}
          </div>
        </div>

        {/* Quiet Legal, Superadmin Console Sign-In & Rust Backend Export Row */}
        <div className="pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#708294]">
          <span>{t.footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[#4A5B6C] hover:text-[#0E4D64] transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {locale === 'fa'
                  ? 'کنسول مدیریت ارشد'
                  : locale === 'ar'
                    ? 'لوحة الإدارة العليا'
                    : 'Admin Console'}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenRustModal}
              className="text-[#4A5B6C] hover:text-[#0E4D64] underline underline-offset-4 transition-colors cursor-pointer"
            >
              {t.footer.rustLink}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
