import { motion } from 'motion/react';
import type { Locale } from '../types/domain';

interface LanguageSwitchProps {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  variant?: 'light' | 'dark';
}

const LOCALE_OPTIONS: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fa', label: 'فارسی' },
  { code: 'ar', label: 'العربية' },
];

export function LanguageSwitch({
  locale,
  onChangeLocale,
  variant = 'light',
}: LanguageSwitchProps) {
  const isDark = variant === 'dark';

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`inline-flex items-center p-1 rounded-full border ${
        isDark
          ? 'bg-white/10 border-white/15 backdrop-blur-md'
          : 'bg-[#F7F9FB] border-[#E5EBF0]'
      }`}
    >
      {LOCALE_OPTIONS.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => onChangeLocale(opt.code)}
            aria-pressed={active}
            className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0E4D64] ${
              active
                ? isDark
                  ? 'text-[#061E29]'
                  : 'text-white'
                : isDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-[#4A5B6C] hover:text-[#0B1520]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${variant}`}
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                className={`absolute inset-0 rounded-full ${
                  isDark ? 'bg-white' : 'bg-[#0E4D64]'
                }`}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
