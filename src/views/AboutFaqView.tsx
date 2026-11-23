import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search } from 'lucide-react';
import type { FaqItem, Locale } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';
import { CLIENT_TESTIMONIALS } from '../data/trade';
import { IMG_HERO } from '../data/catalog';
import { usePlatformData } from '../context/PlatformDataContext';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface AboutFaqViewProps {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
}

type FaqFilter = 'all' | FaqItem['category'];

export function AboutFaqView({ locale, onChangeLocale }: AboutFaqViewProps) {
  const t = UI_STRINGS[locale].about;
  const { faqs, regionalDesks } = usePlatformData();
  const [faqCategory, setFaqCategory] = useState<FaqFilter>('all');
  const [faqQuery, setFaqQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string>('moq');

  const filteredFaqs = faqs.filter((item) => {
    const catOk = faqCategory === 'all' || item.category === faqCategory;
    if (!catOk) return false;
    const q = faqQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.question[locale].toLowerCase().includes(q) ||
      item.answer[locale].toLowerCase().includes(q) ||
      item.question.en.toLowerCase().includes(q)
    );
  });

  const faqTabs: { id: FaqFilter; label: string }[] = [
    { id: 'all', label: t.faqCategories.all },
    { id: 'commercial', label: t.faqCategories.commercial },
    { id: 'logistics', label: t.faqCategories.logistics },
    { id: 'quality', label: t.faqCategories.quality },
    { id: 'payment', label: t.faqCategories.payment },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
            petrotechnic.co · Est. 2010
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

      {/* Corporate Profile Editorial Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-5 py-2">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1520]">
            {t.profileTitle}
          </h2>
          <p className="text-base text-[#4A5B6C] leading-relaxed">
            {t.profileBody1}
          </p>
          <p className="text-base text-[#4A5B6C] leading-relaxed">
            {t.profileBody2}
          </p>
        </div>
        <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#061E29] min-h-[290px] shadow-[0_24px_60px_-24px_rgba(11,21,32,0.2)]">
          <ArchitecturalImage
            src={IMG_HERO}
            alt="PetroTechnics Export Operations"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Operating Principles — Clean Hairline Columns */}
      <section className="space-y-8 pt-6 border-t border-[#E5EBF0]">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
          {t.pillarsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.pillars.map((pillar, index) => (
            <div key={pillar.title} className="space-y-3">
              <span className="font-mono-data text-sm font-semibold text-[#0E4D64]">
                0{index + 1}.
              </span>
              <h3 className="font-display text-xl font-bold text-[#0B1520]">
                {pillar.title}
              </h3>
              <p className="text-sm sm:text-[15px] text-[#4A5B6C] leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Regional Commercial Desks */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
          {t.desksTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regionalDesks.map((desk) => (
            <div
              key={desk.email}
              className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-7 space-y-3"
            >
              <div className="text-xs font-semibold text-[#0E4D64]">
                {desk.role[locale]}
              </div>
              <h3 className="font-display text-xl font-bold text-[#0B1520]">
                {desk.city[locale]}
              </h3>
              <p className="text-sm text-[#4A5B6C] leading-relaxed">
                {desk.address[locale]}
              </p>
              <div
                className="pt-4 border-t border-[#E5EBF0] text-xs font-mono-data text-[#4A5B6C] space-y-1"
                dir="ltr"
              >
                <div>{desk.phone}</div>
                <div className="text-[#0E4D64] font-semibold">{desk.email}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Attributable Counterparty Testimonials */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1520]">
          {t.testimonialsTitle}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CLIENT_TESTIMONIALS.map((item) => (
            <blockquote
              key={item.id}
              className="rounded-2xl bg-white border border-[#E5EBF0] p-7 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="text-xs font-mono-data font-semibold text-[#0E4D64]">
                  {item.metric[locale]}
                </div>
                <p className="text-sm sm:text-[15px] text-[#0B1520] leading-relaxed">
                  “{item.quote[locale]}”
                </p>
              </div>
              <footer className="pt-5 border-t border-[#E5EBF0] space-y-0.5">
                <div className="text-sm font-bold text-[#0B1520]">
                  {item.name}
                </div>
                <div className="text-xs text-[#708294]">
                  {item.role[locale]} · {item.company} · {item.country[locale]}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Searchable Categorized FAQ Accordion */}
      <section className="space-y-8 pt-10 border-t border-[#E5EBF0]">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1520]">
            {t.faqTitle}
          </h2>
          <p className="text-base text-[#4A5B6C]">{t.faqSubtitle}</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center p-1 bg-[#F7F9FB] border border-[#E5EBF0] rounded-full">
            {faqTabs.map((tab) => {
              const active = faqCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFaqCategory(tab.id)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-white' : 'text-[#4A5B6C] hover:text-[#0B1520]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="faq-filter-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 bg-[#0B1520] rounded-full"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 lg:max-w-sm">
            <Search className="w-4 h-4 text-[#708294] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
            <input
              type="search"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder={t.faqSearchPlaceholder}
              className="w-full ps-11 pe-5 py-2.5 text-sm bg-[#F7F9FB] border border-[#E5EBF0] rounded-full text-[#0B1520] placeholder:text-[#708294] focus:outline-none focus:border-[#0E4D64] focus:bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-[#E5EBF0] border-y border-[#E5EBF0]">
          {filteredFaqs.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                  aria-expanded={isOpen}
                  className="w-full py-6 text-start flex items-center justify-between gap-4 hover:text-[#0E4D64] transition-colors cursor-pointer"
                >
                  <span className="font-display text-base sm:text-lg font-semibold text-[#0B1520]">
                    {item.question[locale]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#708294] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0E4D64]' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-sm sm:text-[15px] text-[#4A5B6C] leading-relaxed max-w-4xl">
                        {item.answer[locale]}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
