import { useState } from 'react';
import { Ship } from 'lucide-react';

interface ArchitecturalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ArchitecturalImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: ArchitecturalImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFF6F8] to-[#E2E8F0] text-[#0E4D64] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Ship className="w-8 h-8 mb-2 opacity-70" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#475569] text-center">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
