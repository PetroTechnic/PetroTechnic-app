import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  Play,
  RefreshCw,
  Search,
  Server,
  Terminal,
} from 'lucide-react';
import type { Product, RustBackendFile } from '../../types/domain';
import {
  buildAllTypeScriptInterfaces,
  buildCurlSnippet,
  buildOpenApiSpec,
  buildSamplePayloadForStruct,
  buildTypeScriptFetchSnippet,
  buildTypeScriptInterface,
  parseRustAxumBackend,
  resolveEndpointUrl,
  resolveFlattenedFields,
  type HttpMethod,
  type ParsedAxumEndpoint,
  type ParsedRustAxumSpec,
} from '../../lib/rustAxumParser';
import cargoTomlRaw from '../../../backend-rust/Cargo.toml?raw';
import mainRsRaw from '../../../backend-rust/src/main.rs?raw';
import handlersRsRaw from '../../../backend-rust/src/handlers.rs?raw';
import modelsRsRaw from '../../../backend-rust/src/models.rs?raw';
import dataRsRaw from '../../../backend-rust/src/data.rs?raw';
import readmeMdRaw from '../../../backend-rust/README.md?raw';

interface AdminApiReferencePanelProps {
  products: Product[];
}

type ReferenceTab = 'endpoints' | 'schemas' | 'infrastructure';
type SnippetMode = 'typescript' | 'curl' | 'rust';

interface LiveResponseState {
  status: number;
  statusText: string;
  ok: boolean;
  durationMs: number;
  contentType: string;
  sizeBytes: number;
  url: string;
  bodyText: string;
  error?: string;
}

const BUNDLED_FALLBACK_FILES: RustBackendFile[] = [
  {
    path: 'backend-rust/Cargo.toml',
    language: 'toml',
    description:
      'Crate manifest with Axum 0.7, Tokio async runtime, Serde, Chrono, and Tower-HTTP CORS.',
    content: cargoTomlRaw,
  },
  {
    path: 'backend-rust/src/main.rs',
    language: 'rust',
    description:
      'Async Tokio entrypoint, Axum REST router, CORS middleware, and TCP server binding.',
    content: mainRsRaw,
  },
  {
    path: 'backend-rust/src/models.rs',
    language: 'rust',
    description:
      'Strictly typed Serde DTOs for trilingual products, trade corridors, and commercial RFQs.',
    content: modelsRsRaw,
  },
  {
    path: 'backend-rust/src/handlers.rs',
    language: 'rust',
    description:
      'REST handlers with Incoterms 2020 validation, thread-safe RwLock state, and JSON persistence.',
    content: handlersRsRaw,
  },
  {
    path: 'backend-rust/src/data.rs',
    language: 'rust',
    description:
      'Embedded seed catalog of core petrochemical grades and export corridors.',
    content: dataRsRaw,
  },
  {
    path: 'backend-rust/README.md',
    language: 'markdown',
    description:
      'Build, cargo run --release deployment, and reverse-proxy configuration guide.',
    content: readmeMdRaw,
  },
];

function methodColorClass(method: HttpMethod): string {
  switch (method) {
    case 'GET':
      return 'text-emerald-700';
    case 'POST':
      return 'text-[#0E4D64]';
    case 'PUT':
    case 'PATCH':
      return 'text-amber-700';
    case 'DELETE':
      return 'text-rose-700';
    default:
      return 'text-[#4A5B6C]';
  }
}

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminApiReferencePanel({
  products,
}: AdminApiReferencePanelProps) {
  const [files, setFiles] = useState<RustBackendFile[]>([]);
  const [sourceOrigin, setSourceOrigin] = useState<'live-api' | 'bundled'>(
    'live-api',
  );
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ReferenceTab>('endpoints');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');

  // Target upstream base URL ('' = same-origin /api/* parity mirror)
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [requestBodyJson, setRequestBodyJson] = useState<string>('');
  const [snippetMode, setSnippetMode] = useState<SnippetMode>('typescript');

  const [sendingRequest, setSendingRequest] = useState(false);
  const [liveResponse, setLiveResponse] = useState<LiveResponseState | null>(
    null,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);

  const loadRustSources = useCallback(async () => {
    setLoading(true);
    setScanNotice(null);
    try {
      const res = await fetch('/api/rust-backend', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        files?: RustBackendFile[];
        scannedAt?: string;
      };
      if (Array.isArray(data.files) && data.files.length > 0) {
        setFiles(data.files);
        setSourceOrigin('live-api');
        setScannedAt(data.scannedAt || new Date().toISOString());
      } else {
        setFiles(BUNDLED_FALLBACK_FILES);
        setSourceOrigin('bundled');
        setScannedAt(new Date().toISOString());
      }
    } catch {
      setFiles(BUNDLED_FALLBACK_FILES);
      setSourceOrigin('bundled');
      setScannedAt(new Date().toISOString());
      setScanNotice(
        'Live /api/rust-backend endpoint was unreachable; displaying parsed schema from bundled backend-rust workspace sources.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRustSources();
  }, [loadRustSources]);

  const spec: ParsedRustAxumSpec = useMemo(
    () => parseRustAxumBackend(files),
    [files],
  );

  const structMap = useMemo(
    () => new Map(spec.structs.map((s) => [s.name, s])),
    [spec.structs],
  );

  const availableMethods = useMemo(() => {
    const unique = Array.from(new Set(spec.endpoints.map((ep) => ep.method)));
    return unique;
  }, [spec.endpoints]);

  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return spec.endpoints.filter((ep) => {
      if (methodFilter !== 'ALL' && ep.method !== methodFilter) return false;
      if (!q) return true;
      return (
        ep.path.toLowerCase().includes(q) ||
        ep.handlerName.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.group.toLowerCase().includes(q) ||
        ep.responseType.toLowerCase().includes(q)
      );
    });
  }, [spec.endpoints, searchQuery, methodFilter]);

  const selectedEndpoint: ParsedAxumEndpoint | null = useMemo(() => {
    if (filteredEndpoints.length === 0) return null;
    return (
      filteredEndpoints.find((ep) => ep.id === selectedEndpointId) ??
      filteredEndpoints[0]
    );
  }, [filteredEndpoints, selectedEndpointId]);

  const sampleProductSlugs = useMemo(() => {
    const liveSlugs = products.map((p) => p.slug).filter(Boolean).slice(0, 5);
    return liveSlugs.length > 0
      ? liveSlugs
      : ['hdpe-pe100', 'urea-46-granular', 'methanol-grade-aa'];
  }, [products]);

  // Synchronize default path/query/body builder inputs when switching selected endpoint
  useEffect(() => {
    if (!selectedEndpoint) return;

    const nextPath: Record<string, string> = {};
    for (const p of selectedEndpoint.pathParams) {
      nextPath[p.name] =
        p.name === 'slug' ? sampleProductSlugs[0] || 'hdpe-pe100' : '';
    }
    setPathValues(nextPath);

    const nextQuery: Record<string, string> = {};
    if (
      selectedEndpoint.queryStructName &&
      structMap.has(selectedEndpoint.queryStructName)
    ) {
      for (const f of resolveFlattenedFields(
        selectedEndpoint.queryStructName,
        structMap,
      )) {
        nextQuery[f.jsonName] = '';
      }
    }
    setQueryValues(nextQuery);

    if (
      selectedEndpoint.requestBodyStructName &&
      structMap.has(selectedEndpoint.requestBodyStructName)
    ) {
      const sample = buildSamplePayloadForStruct(
        selectedEndpoint.requestBodyStructName,
        structMap,
      );
      setRequestBodyJson(JSON.stringify(sample, null, 2));
    } else {
      setRequestBodyJson('');
    }

    setLiveResponse(null);
  }, [selectedEndpoint, structMap, sampleProductSlugs]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleSendLiveRequest = async () => {
    if (!selectedEndpoint) return;
    setSendingRequest(true);
    setLiveResponse(null);

    const targetUrl = resolveEndpointUrl(
      baseUrl,
      selectedEndpoint,
      pathValues,
      queryValues,
    );

    const hasBody =
      selectedEndpoint.method === 'POST' ||
      selectedEndpoint.method === 'PUT' ||
      selectedEndpoint.method === 'PATCH';

    if (hasBody && requestBodyJson.trim()) {
      try {
        JSON.parse(requestBodyJson);
      } catch (err) {
        setLiveResponse({
          status: 0,
          statusText: 'Invalid JSON Payload',
          ok: false,
          durationMs: 0,
          contentType: 'text/plain',
          sizeBytes: 0,
          url: targetUrl,
          bodyText: '',
          error:
            err instanceof Error
              ? `Fix JSON syntax before sending: ${err.message}`
              : 'Request body is not valid JSON.',
        });
        setSendingRequest(false);
        return;
      }
    }

    const startedAt = performance.now();
    try {
      const res = await fetch(targetUrl, {
        method: selectedEndpoint.method,
        headers: {
          Accept: 'application/json',
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(hasBody ? { body: requestBodyJson.trim() || '{}' } : {}),
      });
      const elapsed = Math.round(performance.now() - startedAt);
      const rawText = await res.text();
      const contentType = res.headers.get('content-type') || 'application/json';
      let pretty = rawText;
      try {
        pretty = JSON.stringify(JSON.parse(rawText), null, 2);
      } catch {
        // Non-JSON response kept verbatim
      }

      setLiveResponse({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        ok: res.ok,
        durationMs: elapsed,
        contentType,
        sizeBytes: new Blob([rawText]).size,
        url: targetUrl,
        bodyText: pretty,
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - startedAt);
      const isLocalRust =
        baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost');
      setLiveResponse({
        status: 0,
        statusText: 'Network Error',
        ok: false,
        durationMs: elapsed,
        contentType: 'text/plain',
        sizeBytes: 0,
        url: targetUrl,
        bodyText: '',
        error: isLocalRust
          ? `Could not reach ${targetUrl}. Start the Rust Axum server locally with "cd backend-rust && PORT=8080 cargo run --release", or switch target to Same-Origin Mirror (/api/*).`
          : err instanceof Error
            ? err.message
            : 'Request failed due to a network or CORS error.',
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const activeSnippet = useMemo(() => {
    if (!selectedEndpoint) return '';
    if (snippetMode === 'curl') {
      return buildCurlSnippet(
        baseUrl,
        selectedEndpoint,
        pathValues,
        queryValues,
        requestBodyJson,
      );
    }
    if (snippetMode === 'rust') {
      return selectedEndpoint.handlerSource || '// Handler source unavailable';
    }
    return buildTypeScriptFetchSnippet(
      baseUrl,
      selectedEndpoint,
      pathValues,
      queryValues,
      requestBodyJson,
    );
  }, [
    selectedEndpoint,
    snippetMode,
    baseUrl,
    pathValues,
    queryValues,
    requestBodyJson,
  ]);

  const openApiDocument = useMemo(
    () =>
      buildOpenApiSpec(
        spec,
        baseUrl.trim() || 'http://127.0.0.1:8080',
      ),
    [spec, baseUrl],
  );

  const allTsInterfaces = useMemo(
    () => buildAllTypeScriptInterfaces(spec.structs),
    [spec.structs],
  );

  const axumVersion =
    spec.crateInfo.dependencies.find((d) => d.name === 'axum')?.version ??
    '0.7';
  const tokioVersion =
    spec.crateInfo.dependencies.find((d) => d.name === 'tokio')?.version ??
    '1.40';

  const viteProxySnippet = `// vite.config.ts — forward frontend /api/* calls to the Rust Axum upstream
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: '${baseUrl.trim() || 'http://127.0.0.1:8080'}',
        changeOrigin: true,
      },
    },
  },
});`;

  const nginxProxySnippet = `# Nginx reverse proxy for petrotechnic.co -> Rust Axum API
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`;

  const cargoRunSnippet = `cd backend-rust
PORT=8080 RFQ_STORE_PATH=./rfqs.json cargo run --release`;

  if (loading && files.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5EBF0] rounded-xl p-5 space-y-2.5 animate-pulse"
            >
              <div className="h-3 w-28 bg-[#E5EBF0] rounded" />
              <div className="h-7 w-20 bg-[#E5EBF0] rounded" />
              <div className="h-3 w-36 bg-[#F1F5F8] rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#E5EBF0] rounded-xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-48 bg-[#E5EBF0] rounded" />
          <div className="h-40 w-full bg-[#F7F9FB] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Top Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-[#0B1520]">
            Rust Axum API Reference
          </h1>
          <p className="text-xs text-[#4A5B6C] max-w-2xl leading-relaxed">
            Dynamically introspected from{' '}
            <span className="font-mono-data text-[#0B1520]">
              backend-rust/src/main.rs
            </span>
            ,{' '}
            <span className="font-mono-data text-[#0B1520]">handlers.rs</span>,
            and{' '}
            <span className="font-mono-data text-[#0B1520]">models.rs</span> to
            connect front-end services directly to the Rust Axum infrastructure.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#708294] pt-0.5">
            <span>
              {sourceOrigin === 'live-api'
                ? 'Source: Live /api/rust-backend scan'
                : 'Source: Bundled workspace snapshot'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-data tabular-nums">
              {spec.crateInfo.name} {spec.crateInfo.version}
            </span>
            {scannedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-data tabular-nums">
                  Scanned {new Date(scannedAt).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void loadRustSources()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1520] bg-white border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Rescan Rust Source</span>
          </button>
          <button
            type="button"
            onClick={() =>
              downloadJsonFile(
                `${spec.crateInfo.name}-openapi-3.1.json`,
                openApiDocument,
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export OpenAPI 3.1</span>
          </button>
        </div>
      </div>

      {scanNotice && (
        <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {scanNotice}
        </div>
      )}

      {/* 4-Column Flat Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-xs font-medium text-[#708294]">
            Discovered Endpoints
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
            {spec.endpoints.length}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C] font-mono-data tabular-nums">
            {availableMethods
              .map(
                (m) =>
                  `${spec.endpoints.filter((e) => e.method === m).length} ${m}`,
              )
              .join(' · ') || '0 routes'}
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-xs font-medium text-[#708294]">
            Serde Data Contracts
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0E4D64] tabular-nums">
            {spec.structs.length}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            JSON camelCase parity verified
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-xs font-medium text-[#708294]">
            Rust Runtime Stack
          </div>
          <div className="mt-2 font-display text-xl font-bold text-[#0B1520] tabular-nums">
            Axum {axumVersion} / Tokio {tokioVersion}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C] font-mono-data tabular-nums">
            Edition {spec.crateInfo.edition} ·{' '}
            {spec.crateInfo.dependencies.length} crates
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-xs font-medium text-[#708294]">
            Default Upstream Port
          </div>
          <div className="mt-2 font-display text-xl font-bold text-[#0B1520] font-mono-data tabular-nums">
            0.0.0.0:{spec.envVars.find((v) => v.name === 'PORT')?.defaultValue || '8080'}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            {spec.middlewares.length} Tower-HTTP middleware layers
          </div>
        </div>
      </div>

      {/* Navigation Tabs + Target Upstream Bar */}
      <div className="bg-white border border-[#E5EBF0] rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="API Reference Sections"
          className="inline-flex items-center gap-1 p-1 bg-[#F7F9FB] rounded-lg border border-[#E5EBF0] overflow-x-auto"
        >
          {(
            [
              {
                id: 'endpoints' as const,
                label: `Endpoints (${spec.endpoints.length})`,
                icon: Terminal,
              },
              {
                id: 'schemas' as const,
                label: `Serde Schemas (${spec.structs.length})`,
                icon: Code2,
              },
              {
                id: 'infrastructure' as const,
                label: 'Proxy & Rust Source',
                icon: Server,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#0B1520] shadow-xs border border-[#E5EBF0]'
                    : 'text-[#4A5B6C] hover:text-[#0B1520]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Upstream Target Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#708294] whitespace-nowrap">
            Target Base URL
          </span>
          <div className="inline-flex items-center gap-1 p-1 bg-[#F7F9FB] rounded-lg border border-[#E5EBF0]">
            <button
              type="button"
              onClick={() => setBaseUrl('')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseUrl === ''
                  ? 'bg-white text-[#0B1520] border border-[#E5EBF0]'
                  : 'text-[#4A5B6C] hover:text-[#0B1520]'
              }`}
            >
              Same-Origin (/api)
            </button>
            <button
              type="button"
              onClick={() => setBaseUrl('http://127.0.0.1:8080')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                baseUrl === 'http://127.0.0.1:8080'
                  ? 'bg-white text-[#0B1520] border border-[#E5EBF0]'
                  : 'text-[#4A5B6C] hover:text-[#0B1520]'
              }`}
            >
              Rust Local (:8080)
            </button>
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.petrotechnic.co"
            aria-label="Custom Rust Axum base URL"
            className="w-56 px-3 py-1.5 text-xs font-mono-data text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg focus:outline-none focus:border-[#0E4D64]"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: ENDPOINTS & LIVE REQUEST EXPLORER                            */}
      {/* =================================================================== */}
      {activeTab === 'endpoints' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Rail: Filterable Route List */}
          <div className="xl:col-span-4 bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#E5EBF0] space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#708294] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter path, handler, or DTO..."
                  className="w-full ps-8 pe-3 py-2 text-xs text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setMethodFilter('ALL')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    methodFilter === 'ALL'
                      ? 'bg-[#0B1520] text-white'
                      : 'text-[#4A5B6C] hover:bg-[#F7F9FB]'
                  }`}
                >
                  All ({spec.endpoints.length})
                </button>
                {availableMethods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethodFilter(m)}
                    className={`px-2.5 py-1 text-[11px] font-mono-data font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      methodFilter === m
                        ? 'bg-[#0E4D64] text-white'
                        : 'text-[#4A5B6C] hover:bg-[#F7F9FB]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {filteredEndpoints.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-[#708294]">
                  No Axum routes matched your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMethodFilter('ALL');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0E4D64] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E5EBF0]">
                {filteredEndpoints.map((ep) => {
                  const isSelected = selectedEndpoint?.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => setSelectedEndpointId(ep.id)}
                      className={`w-full text-start px-4 py-3.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0F7FA]'
                          : 'hover:bg-[#F7F9FB]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`font-mono-data text-[11px] font-bold w-11 shrink-0 ${methodColorClass(
                              ep.method,
                            )}`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono-data text-xs font-semibold text-[#0B1520] truncate">
                            {ep.path}
                          </span>
                        </div>
                        <span className="font-mono-data text-[11px] text-[#708294] tabular-nums shrink-0">
                          L{ep.routeLine}
                        </span>
                      </div>
                      <div className="mt-1 ps-13 text-[11px] text-[#4A5B6C] line-clamp-2">
                        {ep.summary}
                      </div>
                      <div className="mt-1 ps-13 flex items-center gap-1.5 text-[11px] text-[#708294] font-mono-data">
                        <span>{ep.handlerName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{ep.responseType}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Pane: Endpoint Contract, Live Tester & Code Snippets */}
          <div className="xl:col-span-8 space-y-6">
            {selectedEndpoint ? (
              <>
                {/* Endpoint Specification Surface */}
                <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E5EBF0] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono-data text-xs font-bold ${methodColorClass(
                            selectedEndpoint.method,
                          )}`}
                        >
                          {selectedEndpoint.method}
                        </span>
                        <h2 className="font-mono-data text-base font-bold text-[#0B1520] break-all">
                          {selectedEndpoint.path}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            `path-${selectedEndpoint.id}`,
                            resolveEndpointUrl(
                              baseUrl,
                              selectedEndpoint,
                              pathValues,
                              queryValues,
                            ),
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {copiedKey === `path-${selectedEndpoint.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedKey === `path-${selectedEndpoint.id}`
                            ? 'Copied URL'
                            : 'Copy URL'}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs text-[#4A5B6C] leading-relaxed">
                      {selectedEndpoint.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#708294] font-mono-data tabular-nums pt-1">
                      <span>{selectedEndpoint.group}</span>
                      <span aria-hidden="true">·</span>
                      <span>handlers::{selectedEndpoint.handlerName}</span>
                      <span aria-hidden="true">·</span>
                      <span>main.rs:{selectedEndpoint.routeLine}</span>
                      {selectedEndpoint.handlerLineStart && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            handlers.rs:{selectedEndpoint.handlerLineStart}–
                            {selectedEndpoint.handlerLineEnd}
                          </span>
                        </>
                      )}
                      {selectedEndpoint.usesAppState && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>State&lt;AppState&gt;</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Parameters, Request Schema & Response Matrix */}
                  <div className="divide-y divide-[#E5EBF0]">
                    {/* Path Parameters */}
                    {selectedEndpoint.pathParams.length > 0 && (
                      <div className="p-6 space-y-3">
                        <h3 className="text-xs font-semibold text-[#0B1520]">
                          Path Parameters (Axum Path Extractor)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-start border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[#E5EBF0] text-[11px] font-medium text-[#708294]">
                                <th className="py-2 pe-4 text-start">Name</th>
                                <th className="py-2 px-3 text-start">
                                  Rust Type
                                </th>
                                <th className="py-2 px-3 text-start">
                                  TypeScript
                                </th>
                                <th className="py-2 ps-3 text-end">
                                  Requirement
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5EBF0]">
                              {selectedEndpoint.pathParams.map((param) => (
                                <tr key={param.name}>
                                  <td className="py-2.5 pe-4 font-mono-data font-semibold text-[#0B1520]">
                                    :{param.name}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                                    {param.rustType}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono-data text-[#0E4D64]">
                                    {param.tsType}
                                  </td>
                                  <td className="py-2.5 ps-3 text-end text-[#0B1520] font-medium">
                                    Required
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Query Parameters */}
                    {selectedEndpoint.queryStructName &&
                      structMap.has(selectedEndpoint.queryStructName) && (
                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs font-semibold text-[#0B1520]">
                              Query Parameters
                            </h3>
                            <span className="text-[11px] font-mono-data text-[#708294]">
                              Query&lt;{selectedEndpoint.queryStructName}&gt;
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-start border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-[#E5EBF0] text-[11px] font-medium text-[#708294]">
                                  <th className="py-2 pe-4 text-start">
                                    Query Key
                                  </th>
                                  <th className="py-2 px-3 text-start">
                                    Rust Field & Type
                                  </th>
                                  <th className="py-2 px-3 text-start">
                                    TypeScript
                                  </th>
                                  <th className="py-2 ps-3 text-end">
                                    Requirement
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E5EBF0]">
                                {resolveFlattenedFields(
                                  selectedEndpoint.queryStructName,
                                  structMap,
                                ).map((field) => (
                                  <tr key={field.rustName}>
                                    <td className="py-2.5 pe-4 font-mono-data font-semibold text-[#0B1520]">
                                      {field.jsonName}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                                      {field.rustName}: {field.rustType}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono-data text-[#0E4D64]">
                                      {field.tsType}
                                    </td>
                                    <td className="py-2.5 ps-3 text-end text-[#708294]">
                                      {field.optional ? 'Optional' : 'Required'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    {/* JSON Request Body */}
                    {selectedEndpoint.requestBodyStructName &&
                      structMap.has(selectedEndpoint.requestBodyStructName) && (
                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs font-semibold text-[#0B1520]">
                              JSON Request Body Schema
                            </h3>
                            <span className="text-[11px] font-mono-data text-[#708294]">
                              Json&lt;{selectedEndpoint.requestBodyStructName}
                              &gt; · application/json
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-start border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-[#E5EBF0] text-[11px] font-medium text-[#708294]">
                                  <th className="py-2 pe-4 text-start">
                                    JSON Property
                                  </th>
                                  <th className="py-2 px-3 text-start">
                                    Rust Field
                                  </th>
                                  <th className="py-2 px-3 text-start">
                                    TypeScript
                                  </th>
                                  <th className="py-2 ps-3 text-end">
                                    Requirement
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E5EBF0]">
                                {resolveFlattenedFields(
                                  selectedEndpoint.requestBodyStructName,
                                  structMap,
                                ).map((field) => (
                                  <tr key={field.rustName}>
                                    <td className="py-2.5 pe-4 font-mono-data font-semibold text-[#0B1520]">
                                      {field.jsonName}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                                      {field.rustName}: {field.rustType}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono-data text-[#0E4D64]">
                                      {field.tsType}
                                    </td>
                                    <td className="py-2.5 ps-3 text-end text-[#4A5B6C]">
                                      {field.optional ? 'Optional' : 'Required'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {selectedEndpoint.validationHints.length > 0 && (
                            <div className="pt-2 space-y-1 text-xs text-[#4A5B6C]">
                              <div className="font-semibold text-[#0B1520]">
                                Handler Validation Rules
                              </div>
                              <ul className="list-disc ps-5 space-y-1">
                                {selectedEndpoint.validationHints.map(
                                  (hint) => (
                                    <li key={hint}>{hint}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Response & Error Status Outcomes */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold text-[#0B1520]">
                          HTTP Responses & Serde Contract
                        </h3>
                        <span className="text-[11px] font-mono-data text-[#708294]">
                          Returns {selectedEndpoint.responseType}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#E5EBF0] text-[11px] font-medium text-[#708294]">
                              <th className="py-2 pe-4 text-start">Status</th>
                              <th className="py-2 px-3 text-start">
                                Condition
                              </th>
                              <th className="py-2 ps-3 text-end">
                                Rust Serde DTO
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5EBF0]">
                            {selectedEndpoint.statuses.map((st) => (
                              <tr key={`${st.code}-${st.dtoType}`}>
                                <td
                                  className={`py-2.5 pe-4 font-mono-data font-bold tabular-nums ${
                                    st.isError
                                      ? 'text-rose-700'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {st.code}
                                </td>
                                <td className="py-2.5 px-3 text-[#4A5B6C]">
                                  {st.label}
                                </td>
                                <td className="py-2.5 ps-3 text-end font-mono-data text-[#0B1520]">
                                  Json&lt;{st.dtoType}&gt;
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {selectedEndpoint.responseStructName &&
                        structMap.has(selectedEndpoint.responseStructName) && (
                          <div className="pt-2 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium text-[#708294]">
                                Wire-Format Response TypeScript Shape (
                                {selectedEndpoint.responseIsArray
                                  ? `${selectedEndpoint.responseStructName}[]`
                                  : selectedEndpoint.responseStructName}
                                )
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const structDef = structMap.get(
                                    selectedEndpoint.responseStructName!,
                                  );
                                  if (structDef) {
                                    void handleCopy(
                                      `resp-ts-${structDef.name}`,
                                      buildTypeScriptInterface(
                                        structDef,
                                        structMap,
                                      ),
                                    );
                                  }
                                }}
                                className="text-[11px] font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                              >
                                {copiedKey ===
                                `resp-ts-${selectedEndpoint.responseStructName}`
                                  ? 'Copied Type'
                                  : 'Copy Interface'}
                              </button>
                            </div>
                            <pre className="p-4 rounded-lg bg-[#061E29] text-slate-100 text-[11px] font-mono-data overflow-x-auto leading-relaxed">
                              {buildTypeScriptInterface(
                                structMap.get(
                                  selectedEndpoint.responseStructName,
                                )!,
                                structMap,
                              )}
                            </pre>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Live Endpoint Request Tester */}
                <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#0B1520]">
                        Live Endpoint Explorer
                      </h3>
                      <p className="text-xs text-[#708294] font-mono-data break-all mt-0.5">
                        {selectedEndpoint.method}{' '}
                        {resolveEndpointUrl(
                          baseUrl,
                          selectedEndpoint,
                          pathValues,
                          queryValues,
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={sendingRequest}
                      onClick={() => void handleSendLiveRequest()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E4D64] hover:bg-[#0B1520] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>
                        {sendingRequest ? 'Sending...' : 'Send Live Request'}
                      </span>
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Path Param Inputs */}
                    {selectedEndpoint.pathParams.length > 0 && (
                      <div className="space-y-3">
                        {selectedEndpoint.pathParams.map((p) => (
                          <div key={p.name} className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-xs font-medium text-[#0B1520] font-mono-data">
                                :{p.name}
                              </label>
                              {p.name === 'slug' && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="text-[#708294]">
                                    Catalog slugs:
                                  </span>
                                  {sampleProductSlugs.map((slug) => (
                                    <button
                                      key={slug}
                                      type="button"
                                      onClick={() =>
                                        setPathValues((prev) => ({
                                          ...prev,
                                          [p.name]: slug,
                                        }))
                                      }
                                      className="font-mono-data text-[#0E4D64] hover:underline cursor-pointer"
                                    >
                                      {slug}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <input
                              type="text"
                              value={pathValues[p.name] ?? ''}
                              onChange={(e) =>
                                setPathValues((prev) => ({
                                  ...prev,
                                  [p.name]: e.target.value,
                                }))
                              }
                              placeholder={`Enter ${p.name}`}
                              className="w-full px-3 py-2 text-xs font-mono-data text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Query Param Inputs */}
                    {selectedEndpoint.queryStructName &&
                      structMap.has(selectedEndpoint.queryStructName) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {resolveFlattenedFields(
                            selectedEndpoint.queryStructName,
                            structMap,
                          ).map((field) => (
                            <div key={field.jsonName} className="space-y-1.5">
                              <label className="text-xs font-medium text-[#0B1520] font-mono-data">
                                ?{field.jsonName}
                              </label>
                              <input
                                type="text"
                                value={queryValues[field.jsonName] ?? ''}
                                onChange={(e) =>
                                  setQueryValues((prev) => ({
                                    ...prev,
                                    [field.jsonName]: e.target.value,
                                  }))
                                }
                                placeholder={
                                  field.jsonName === 'category'
                                    ? 'polymers | fertilizers | chemicals'
                                    : field.jsonName === 'q'
                                      ? 'Search grade, CAS, or name'
                                      : `Optional ${field.tsType}`
                                }
                                className="w-full px-3 py-2 text-xs font-mono-data text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Request Body JSON Editor */}
                    {selectedEndpoint.requestBodyStructName && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-medium text-[#0B1520]">
                            Request Body (JSON · Writes to target API store)
                          </label>
                          <div className="flex items-center gap-3 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  selectedEndpoint.requestBodyStructName &&
                                  structMap.has(
                                    selectedEndpoint.requestBodyStructName,
                                  )
                                ) {
                                  const sample = buildSamplePayloadForStruct(
                                    selectedEndpoint.requestBodyStructName,
                                    structMap,
                                  );
                                  setRequestBodyJson(
                                    JSON.stringify(sample, null, 2),
                                  );
                                }
                              }}
                              className="font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                            >
                              Reset Sample
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const parsed = JSON.parse(requestBodyJson);
                                  setRequestBodyJson(
                                    JSON.stringify(parsed, null, 2),
                                  );
                                } catch {
                                  // Keep current text if invalid JSON
                                }
                              }}
                              className="font-semibold text-[#4A5B6C] hover:text-[#0B1520] cursor-pointer"
                            >
                              Format JSON
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={12}
                          value={requestBodyJson}
                          onChange={(e) => setRequestBodyJson(e.target.value)}
                          spellCheck={false}
                          className="w-full p-3.5 text-xs font-mono-data text-[#0B1520] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg focus:outline-none focus:border-[#0E4D64] leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Live Response Output */}
                    {liveResponse && (
                      <div className="pt-2 border-t border-[#E5EBF0] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2 font-mono-data tabular-nums">
                            <span
                              className={`font-bold ${
                                liveResponse.ok
                                  ? 'text-emerald-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {liveResponse.status > 0
                                ? `${liveResponse.status} ${liveResponse.statusText}`
                                : liveResponse.statusText}
                            </span>
                            <span aria-hidden="true" className="text-[#708294]">
                              ·
                            </span>
                            <span className="text-[#4A5B6C]">
                              {liveResponse.durationMs} ms
                            </span>
                            {liveResponse.sizeBytes > 0 && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="text-[#708294]"
                                >
                                  ·
                                </span>
                                <span className="text-[#4A5B6C]">
                                  {liveResponse.sizeBytes.toLocaleString()} bytes
                                </span>
                              </>
                            )}
                          </div>
                          {liveResponse.bodyText && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleCopy(
                                  'live-response-body',
                                  liveResponse.bodyText,
                                )
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                            >
                              {copiedKey === 'live-response-body' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {copiedKey === 'live-response-body'
                                  ? 'Copied'
                                  : 'Copy Response'}
                              </span>
                            </button>
                          )}
                        </div>

                        {liveResponse.error ? (
                          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                            {liveResponse.error}
                          </div>
                        ) : (
                          <pre className="p-4 rounded-lg bg-[#061E29] text-slate-100 text-[11px] font-mono-data max-h-80 overflow-auto leading-relaxed">
                            {liveResponse.bodyText}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Developer Integration Code Snippets */}
                <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1 p-1 bg-[#F7F9FB] rounded-lg border border-[#E5EBF0]">
                      {(
                        [
                          { id: 'typescript' as const, label: 'TypeScript Fetch' },
                          { id: 'curl' as const, label: 'cURL' },
                          { id: 'rust' as const, label: 'Rust Handler Source' },
                        ] as const
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSnippetMode(mode.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            snippetMode === mode.id
                              ? 'bg-white text-[#0B1520] border border-[#E5EBF0]'
                              : 'text-[#4A5B6C] hover:text-[#0B1520]'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(
                          `snippet-${snippetMode}-${selectedEndpoint.id}`,
                          activeSnippet,
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedKey ===
                      `snippet-${snippetMode}-${selectedEndpoint.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedKey ===
                        `snippet-${snippetMode}-${selectedEndpoint.id}`
                          ? 'Copied Snippet'
                          : 'Copy Code'}
                      </span>
                    </button>
                  </div>

                  <pre className="p-5 bg-[#061E29] text-slate-100 text-xs font-mono-data overflow-x-auto leading-relaxed">
                    {activeSnippet}
                  </pre>
                </div>
              </>
            ) : (
              <div className="bg-white border border-[#E5EBF0] rounded-xl p-10 text-center text-xs text-[#708294]">
                Select an endpoint from the left list to inspect its Axum contract and test live requests.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SERDE SCHEMAS & TYPESCRIPT CONTRACTS                         */}
      {/* =================================================================== */}
      {activeTab === 'schemas' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5EBF0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold text-[#0B1520]">
                Serde DTO Definitions & Wire-Format TypeScript Interfaces
              </h2>
              <p className="text-xs text-[#708294] mt-0.5">
                Parsed directly from backend-rust/src/models.rs with automatic{' '}
                <span className="font-mono-data text-[#0B1520]">
                  #[serde(rename_all = &quot;camelCase&quot;)]
                </span>{' '}
                and{' '}
                <span className="font-mono-data text-[#0B1520]">
                  #[serde(flatten)]
                </span>{' '}
                resolution.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleCopy('all-ts-dtos', allTsInterfaces)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedKey === 'all-ts-dtos' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedKey === 'all-ts-dtos'
                  ? 'Copied All Interfaces'
                  : 'Copy All TypeScript Interfaces'}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {spec.structs.map((def) => {
              const flattened = resolveFlattenedFields(def.name, structMap);
              const tsCode = buildTypeScriptInterface(def, structMap);
              return (
                <div
                  key={def.name}
                  className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-mono-data text-sm font-bold text-[#0B1520]">
                        struct {def.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-data text-[#708294] tabular-nums">
                        <span>
                          models.rs:{def.lineStart}–{def.lineEnd}
                        </span>
                        {def.renameAll && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>rename_all = &quot;{def.renameAll}&quot;</span>
                          </>
                        )}
                        {def.derives.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>derive({def.derives.join(', ')})</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(`ts-struct-${def.name}`, tsCode)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedKey === `ts-struct-${def.name}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedKey === `ts-struct-${def.name}`
                          ? 'Copied'
                          : 'Copy TypeScript'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5EBF0]">
                    <div className="lg:col-span-7 overflow-x-auto">
                      <table className="w-full text-start border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-medium text-[#708294]">
                            <th className="py-2.5 px-5 text-start">JSON Key</th>
                            <th className="py-2.5 px-3 text-start">
                              Rust Field
                            </th>
                            <th className="py-2.5 px-3 text-start">
                              Rust Type
                            </th>
                            <th className="py-2.5 px-5 text-end">TypeScript</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5EBF0]">
                          {flattened.map((field) => (
                            <tr key={`${def.name}-${field.jsonName}`}>
                              <td className="py-2.5 px-5 font-mono-data font-semibold text-[#0B1520]">
                                {field.jsonName}
                                {field.optional ? '?' : ''}
                              </td>
                              <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                                {field.rustName}
                              </td>
                              <td className="py-2.5 px-3 font-mono-data text-[#708294]">
                                {field.rustType}
                              </td>
                              <td className="py-2.5 px-5 text-end font-mono-data text-[#0E4D64]">
                                {field.tsType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="lg:col-span-5 bg-[#061E29] p-5">
                      <pre className="text-[11px] font-mono-data text-slate-100 overflow-x-auto leading-relaxed">
                        {tsCode}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PROXY, RUNTIME CONFIG & RAW RUST SOURCE                      */}
      {/* =================================================================== */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          {/* Runtime Environment, Middleware & Cargo Crates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5EBF0]">
                <h2 className="font-display text-sm font-bold text-[#0B1520]">
                  Environment Variables & Middleware
                </h2>
                <p className="text-xs text-[#708294] mt-0.5">
                  Extracted from backend-rust/src/main.rs startup configuration.
                </p>
              </div>
              <div className="p-6 space-y-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5EBF0] text-[11px] font-medium text-[#708294]">
                        <th className="py-2 pe-3 text-start">Variable</th>
                        <th className="py-2 px-3 text-start">Default Value</th>
                        <th className="py-2 ps-3 text-end">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EBF0]">
                      {spec.envVars.map((env) => (
                        <tr key={env.name}>
                          <td className="py-2.5 pe-3 font-mono-data font-semibold text-[#0B1520]">
                            {env.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#0E4D64]">
                            {env.defaultValue}
                          </td>
                          <td className="py-2.5 ps-3 text-end font-mono-data text-[#708294] tabular-nums">
                            main.rs:{env.sourceLine}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 border-t border-[#E5EBF0] space-y-2">
                  <div className="text-xs font-semibold text-[#0B1520]">
                    Active Tower-HTTP Layers
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono-data text-[#4A5B6C]">
                    {spec.middlewares.map((layer) => (
                      <li key={layer}>{layer}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#E5EBF0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0B1520]">
                      Launch Command
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy('cargo-run', cargoRunSnippet)
                      }
                      className="text-[11px] font-semibold text-[#0E4D64] hover:underline cursor-pointer"
                    >
                      {copiedKey === 'cargo-run' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-[#061E29] text-slate-100 text-[11px] font-mono-data overflow-x-auto">
                    {cargoRunSnippet}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5EBF0]">
                <h2 className="font-display text-sm font-bold text-[#0B1520]">
                  Cargo Crate Dependencies
                </h2>
                <p className="text-xs text-[#708294] mt-0.5">
                  Parsed from backend-rust/Cargo.toml ({spec.crateInfo.name}{' '}
                  {spec.crateInfo.version}).
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-medium text-[#708294]">
                      <th className="py-2.5 px-6 text-start">Crate</th>
                      <th className="py-2.5 px-3 text-start">Version</th>
                      <th className="py-2.5 px-6 text-end">Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EBF0]">
                    {spec.crateInfo.dependencies.map((dep) => (
                      <tr key={dep.name}>
                        <td className="py-2.5 px-6 font-mono-data font-semibold text-[#0B1520]">
                          {dep.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono-data text-[#0E4D64] tabular-nums">
                          {dep.version}
                        </td>
                        <td className="py-2.5 px-6 text-end font-mono-data text-[#708294]">
                          {dep.features.length > 0
                            ? dep.features.join(', ')
                            : 'default'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Frontend & Reverse Proxy Integration Guides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5EBF0] flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0B1520]">
                    Vite Dev Proxy Integration
                  </h3>
                  <p className="text-xs text-[#708294]">
                    Route local React /api/* calls straight to Axum.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy('vite-proxy', viteProxySnippet)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedKey === 'vite-proxy' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'vite-proxy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-5 bg-[#061E29] text-slate-100 text-[11px] font-mono-data overflow-x-auto leading-relaxed">
                {viteProxySnippet}
              </pre>
            </div>

            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5EBF0] flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0B1520]">
                    Production Nginx Upstream
                  </h3>
                  <p className="text-xs text-[#708294]">
                    Reverse proxy configuration for petrotechnic.co.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy('nginx-proxy', nginxProxySnippet)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedKey === 'nginx-proxy' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'nginx-proxy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-5 bg-[#061E29] text-slate-100 text-[11px] font-mono-data overflow-x-auto leading-relaxed">
                {nginxProxySnippet}
              </pre>
            </div>
          </div>

          {/* Complete Rust Source File Browser */}
          {spec.files.length > 0 && (
            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#0E4D64]" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#0B1520]">
                      Rust Workspace Source Files
                    </h3>
                    <p className="text-xs text-[#708294]">
                      {spec.files[selectedSourceIndex]?.description}
                    </p>
                  </div>
                </div>
                {spec.files[selectedSourceIndex] && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy(
                        `file-${spec.files[selectedSourceIndex].path}`,
                        spec.files[selectedSourceIndex].content,
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1520] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedKey ===
                    `file-${spec.files[selectedSourceIndex].path}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedKey ===
                      `file-${spec.files[selectedSourceIndex].path}`
                        ? 'Copied File'
                        : 'Copy File'}
                    </span>
                  </button>
                )}
              </div>

              <div className="px-4 py-2.5 border-b border-[#E5EBF0] bg-[#F7F9FB] flex items-center gap-1.5 overflow-x-auto">
                {spec.files.map((file, idx) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedSourceIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-mono-data rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedSourceIndex === idx
                        ? 'bg-white text-[#0B1520] font-semibold border border-[#E5EBF0]'
                        : 'text-[#4A5B6C] hover:text-[#0B1520]'
                    }`}
                  >
                    {file.path.replace(/^backend-rust\//, '')}
                  </button>
                ))}
              </div>

              <pre className="p-5 bg-[#061E29] text-slate-100 text-xs font-mono-data max-h-[480px] overflow-auto leading-relaxed">
                {spec.files[selectedSourceIndex]?.content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
