import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import type { Locale } from '../types/domain';

interface ScrollToTopButtonProps {
  locale: Locale;
}

const LABELS: Record<Locale, string> = {
  en: 'Return to top',
  fa: 'بازگشت به بالا',
  ar: 'العودة إلى الأعلى',
};

const RING_SIZE = 56;
const STROKE_WIDTH = 2.5;
const RADIUS = (RING_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollToTopButton({ locale }: ScrollToTopButtonProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      rafId = 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setProgress(ratio);
      setVisible(scrollTop > 140);
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const percent = Math.round(progress * 100);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const label = LABELS[locale];

  const handleReturnToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleReturnToTop}
          aria-label={`${label} (${percent}%)`}
          title={`${label} · ${percent}%`}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-white/92 hover:bg-[#061E29] text-[#0B1520] hover:text-white backdrop-blur-xl shadow-[0_18px_42px_-16px_rgba(6,30,41,0.34)] transition-colors duration-200 flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E4D64]"
        >
          {/* SVG Circular Scroll Progress Track & Active Ring */}
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            aria-hidden="true"
            className="absolute inset-0 -rotate-90 pointer-events-none"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="text-[#E5EBF0] group-hover:text-white/15 transition-colors"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="text-[#0E4D64] group-hover:text-sky-300 transition-[stroke-dashoffset,color] duration-75"
            />
          </svg>

          {/* Center Arrow & Live Percentage Readout */}
          <span className="relative z-10 flex flex-col items-center justify-center leading-none">
            <ArrowUp className="w-4 h-4 transition-transform duration-150 group-hover:-translate-y-0.5" />
            <span
              dir="ltr"
              className="mt-0.5 font-mono-data text-[9px] font-semibold tabular-nums text-[#4A5B6C] group-hover:text-sky-200 transition-colors"
            >
              {percent}%
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
