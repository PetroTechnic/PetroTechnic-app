import { useEffect, useState } from 'react';
import { Check, Copy, Download, FileCode2, X } from 'lucide-react';
import type { Locale, RustBackendFile } from '../types/domain';
import { UI_STRINGS } from '../data/i18n';

interface RustBackendModalProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
}

export function RustBackendModal({ open, locale, onClose }: RustBackendModalProps) {
  const t = UI_STRINGS[locale].rustModal;
  const [files, setFiles] = useState<RustBackendFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetch('/api/rust-backend')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Rust backend files');
        return res.json();
      })
      .then((data: { files: RustBackendFile[] }) => {
        if (active) {
          setFiles(data.files || []);
          setSelectedIndex(0);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load source files');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const activeFile = files[selectedIndex];

  const handleCopy = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Clipboard fallback ignored safely
    }
  };

  const handleDownloadBundle = () => {
    if (!files.length) return;
    const combined = files
      .map(
        (file) =>
          `================================================================================\nFILE: ${file.path}\n================================================================================\n\n${file.content}\n`,
      )
      .join('\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'petrotechnics-rust-axum-backend.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-[2px] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rust-backend-modal-title"
    >
      <div className="bg-white border border-[#E2E8F0] rounded-lg w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="rust-backend-modal-title"
              className="text-lg font-semibold text-[#0F172A]"
            >
              {t.title}
            </h2>
            <p className="text-sm text-[#475569] max-w-2xl">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {loading ? (
            <div className="md:col-span-12 p-10 text-sm text-[#475569] text-center">
              {t.loading}
            </div>
          ) : error ? (
            <div className="md:col-span-12 p-10 text-sm text-red-700 text-center">
              {error}
            </div>
          ) : (
            <>
              {/* Sidebar file list */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-e border-[#E2E8F0] bg-[#F8FAFC] p-4 overflow-y-auto space-y-1.5">
                {files.map((file, idx) => {
                  const selected = idx === selectedIndex;
                  return (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full text-start px-3.5 py-3 rounded-md border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-white border-[#0E4D64] text-[#0F172A]'
                          : 'bg-transparent border-transparent text-[#475569] hover:bg-white hover:border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-mono-data font-medium text-[#0E4D64]" dir="ltr">
                        <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#64748B] line-clamp-2">
                        {file.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Code viewer */}
              <div className="md:col-span-8 flex flex-col min-h-0 bg-[#0F172A] text-[#F8FAFC]" dir="ltr">
                {activeFile && (
                  <>
                    <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900">
                      <span className="text-xs font-mono-data text-slate-300 truncate">
                        {activeFile.path}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copiedPath === activeFile.path ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {t.copyFile}
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="flex-1 p-5 overflow-auto text-xs leading-relaxed font-mono-data text-slate-200">
                      <code>{activeFile.content}</code>
                    </pre>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#64748B] font-mono-data" dir="ltr">
            cargo run --release · Axum 0.7 · Tokio · Serde
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadBundle}
              disabled={!files.length}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0E4D64] hover:bg-[#0A394B] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {t.downloadBundle}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:text-[#0F172A] rounded-md transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
