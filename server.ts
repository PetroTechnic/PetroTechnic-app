import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  fetchMarketIntelligence,
  normalizeGeminiError,
  type MarketNewsTopic,
} from './server/geminiIntelligence.ts';
import { PRODUCTS_CATALOG } from './src/data/catalog.ts';
import {
  renderTemplatePlainText,
  renderTemplatePrintableHtml,
  TRADE_DOCUMENT_TEMPLATES,
} from './src/data/documents.ts';
import { MARKET_INSIGHTS, TRADE_CORRIDORS } from './src/data/trade.ts';
import type {
  CurrencyCode,
  Incoterm,
  Locale,
  RfqPayload,
  RfqRecord,
  RustBackendFile,
} from './src/types/domain.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(__dirname, 'data');
const RFQ_STORE_PATH = path.join(DATA_DIR, 'rfqs.json');
const DOC_ACCESS_LOG_PATH = path.join(DATA_DIR, 'document-access.json');
const RUST_BACKEND_DIR = path.resolve(__dirname, 'backend-rust');

const VALID_INCOTERMS = new Set<Incoterm>(['FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'DAP']);

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readRfqs(): RfqRecord[] {
  try {
    if (!fs.existsSync(RFQ_STORE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(RFQ_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRfqs(records: RfqRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(RFQ_STORE_PATH, JSON.stringify(records, null, 2), 'utf-8');
}

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PT-RFQ-${year}-${suffix}`;
}

interface DocumentAccessRecord {
  company: string;
  email: string;
  token: string;
  verifiedAt: string;
}

function generateDocumentClearanceToken(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PT-DOC-${year}-${suffix}`;
}

function appendDocumentAccessLog(entry: DocumentAccessRecord): void {
  try {
    ensureDataDir();
    let existing: DocumentAccessRecord[] = [];
    if (fs.existsSync(DOC_ACCESS_LOG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DOC_ACCESS_LOG_PATH, 'utf-8'));
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    }
    const updated = [entry, ...existing].slice(0, 200);
    fs.writeFileSync(DOC_ACCESS_LOG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Non-blocking audit log write
  }
}

function loadRustBackendFiles(): RustBackendFile[] {
  const manifest: { rel: string; language: RustBackendFile['language']; description: string }[] = [
    {
      rel: 'Cargo.toml',
      language: 'toml',
      description: 'Crate manifest with Axum 0.7, Tokio async runtime, Serde, Chrono, and Tower-HTTP CORS.',
    },
    {
      rel: 'src/main.rs',
      language: 'rust',
      description: 'Async Tokio entrypoint, Axum REST router, CORS middleware, and TCP server binding.',
    },
    {
      rel: 'src/models.rs',
      language: 'rust',
      description: 'Strictly typed Serde DTOs for trilingual products, trade corridors, and commercial RFQs.',
    },
    {
      rel: 'src/handlers.rs',
      language: 'rust',
      description: 'REST handlers with Incoterms 2020 validation, thread-safe RwLock state, and JSON persistence.',
    },
    {
      rel: 'src/data.rs',
      language: 'rust',
      description: 'Embedded seed catalog of core petrochemical grades and export corridors.',
    },
    {
      rel: 'README.md',
      language: 'markdown',
      description: 'Build, cargo run --release deployment, and reverse-proxy configuration guide.',
    },
  ];

  return manifest
    .map((item) => {
      const fullPath = path.join(RUST_BACKEND_DIR, item.rel);
      if (!fs.existsSync(fullPath)) {
        return null;
      }
      return {
        path: `backend-rust/${item.rel}`,
        language: item.language,
        description: item.description,
        content: fs.readFileSync(fullPath, 'utf-8'),
      };
    })
    .filter((entry): entry is RustBackendFile => entry !== null);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'petrotechnics-api',
      runtime: 'node-express-mirror',
      rustParity: true,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/products', (req, res) => {
    const category = String(req.query.category || '').trim().toLowerCase();
    const q = String(req.query.q || '').trim().toLowerCase();

    const filtered = PRODUCTS_CATALOG.filter((product) => {
      const categoryOk = !category || category === 'all' || product.category === category;
      if (!categoryOk) return false;
      if (!q) return true;

      return (
        product.name.en.toLowerCase().includes(q) ||
        product.name.fa.toLowerCase().includes(q) ||
        product.name.ar.toLowerCase().includes(q) ||
        product.shortName.toLowerCase().includes(q) ||
        product.casNumber.toLowerCase().includes(q) ||
        product.hsCode.toLowerCase().includes(q) ||
        product.summary.en.toLowerCase().includes(q) ||
        product.grades.some(
          (g) =>
            g.code.toLowerCase().includes(q) ||
            g.application.en.toLowerCase().includes(q) ||
            g.application.fa.toLowerCase().includes(q) ||
            g.application.ar.toLowerCase().includes(q),
        )
      );
    });

    res.json(filtered);
  });

  app.get('/api/products/:slug', (req, res) => {
    const product = PRODUCTS_CATALOG.find((item) => item.slug === req.params.slug);
    if (!product) {
      res.status(404).json({ error: `Product '${req.params.slug}' not found` });
      return;
    }
    res.json(product);
  });

  app.get('/api/corridors', (_req, res) => {
    res.json(TRADE_CORRIDORS);
  });

  app.get('/api/insights', (_req, res) => {
    res.json(MARKET_INSIGHTS);
  });

  const VALID_NEWS_TOPICS = new Set<MarketNewsTopic>([
    'all',
    'polymers',
    'urea',
    'methanol',
    'sulfur',
  ]);
  const VALID_LOCALES = new Set<Locale>(['en', 'fa', 'ar']);

  const handleMarketIntelligence = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const rawTopic = String(
      req.query.topic ?? req.body?.topic ?? 'all',
    )
      .trim()
      .toLowerCase();
    const rawLocale = String(
      req.query.locale ?? req.body?.locale ?? 'en',
    )
      .trim()
      .toLowerCase();
    const forceRefresh =
      String(req.query.refresh ?? req.body?.refresh ?? '').toLowerCase() ===
      'true';

    const topic: MarketNewsTopic = VALID_NEWS_TOPICS.has(
      rawTopic as MarketNewsTopic,
    )
      ? (rawTopic as MarketNewsTopic)
      : 'all';
    const locale: Locale = VALID_LOCALES.has(rawLocale as Locale)
      ? (rawLocale as Locale)
      : 'en';

    try {
      const payload = await fetchMarketIntelligence({
        topic,
        locale,
        forceRefresh,
      });
      res.json(payload);
    } catch (err) {
      const normalized = normalizeGeminiError(err);
      res.status(normalized.status).json({ error: normalized.message });
    }
  };

  app.get('/api/market-intelligence', handleMarketIntelligence);
  app.post('/api/market-intelligence', handleMarketIntelligence);

  app.get('/api/rfq', (_req, res) => {
    const records = readRfqs();
    res.json(records.slice(0, 20));
  });

  app.post('/api/rfq', (req, res) => {
    const body = req.body as Partial<RfqPayload>;
    const quantityMt = Number(body.quantityMt);
    const email = String(body.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !body.productName ||
      !body.grade ||
      !body.destination ||
      !body.companyName ||
      !body.contactName ||
      !body.phone ||
      !emailRegex.test(email) ||
      !Number.isFinite(quantityMt) ||
      quantityMt <= 0 ||
      !body.incoterm ||
      !VALID_INCOTERMS.has(body.incoterm as Incoterm)
    ) {
      res.status(400).json({
        error:
          'Invalid commercial RFQ submission. Please verify corporate email, positive tonnage (MT), destination, and Incoterm 2020.',
      });
      return;
    }

    const validCurrencies = new Set<CurrencyCode>(['USD', 'EUR', 'AED']);
    const currency: CurrencyCode = validCurrencies.has(
      body.currency as CurrencyCode,
    )
      ? (body.currency as CurrencyCode)
      : 'USD';
    const estimatedUnitPrice = Number(body.estimatedUnitPrice);
    const estimatedTotal = Number(body.estimatedTotal);

    const record: RfqRecord = {
      referenceId: generateReferenceId(),
      createdAt: new Date().toISOString(),
      status: 'received',
      productSlug: String(body.productSlug || ''),
      productName: String(body.productName).trim(),
      grade: String(body.grade).trim(),
      quantityMt,
      destination: String(body.destination).trim(),
      incoterm: body.incoterm as Incoterm,
      packaging: String(body.packaging || 'Standard Export Packaging').trim(),
      inspection: (body.inspection || 'SGS') as RfqRecord['inspection'],
      currency,
      ...(Number.isFinite(estimatedUnitPrice) && estimatedUnitPrice > 0
        ? { estimatedUnitPrice }
        : {}),
      ...(Number.isFinite(estimatedTotal) && estimatedTotal > 0
        ? { estimatedTotal }
        : {}),
      companyName: String(body.companyName).trim(),
      contactName: String(body.contactName).trim(),
      email,
      phone: String(body.phone).trim(),
      notes: body.notes ? String(body.notes).trim() : '',
    };

    const existing = readRfqs();
    const updated = [record, ...existing].slice(0, 100);
    writeRfqs(updated);

    res.status(201).json(record);
  });

  app.get('/api/documents', (req, res) => {
    const category = String(req.query.category || '').trim().toLowerCase();
    const filtered =
      !category || category === 'all'
        ? TRADE_DOCUMENT_TEMPLATES
        : TRADE_DOCUMENT_TEMPLATES.filter((doc) => doc.category === category);
    res.json(filtered);
  });

  app.post('/api/documents/verify', (req, res) => {
    const body = req.body as {
      company?: string;
      email?: string;
      ndaAccepted?: boolean;
    };
    const company = String(body.company || '').trim();
    const email = String(body.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!company || !emailRegex.test(email) || body.ndaAccepted !== true) {
      res.status(400).json({
        error:
          'Please provide a valid company name, corporate email address, and accept the evaluation acknowledgment.',
      });
      return;
    }

    const record: DocumentAccessRecord = {
      company,
      email,
      token: generateDocumentClearanceToken(),
      verifiedAt: new Date().toISOString(),
    };
    appendDocumentAccessLog(record);
    res.status(200).json(record);
  });

  app.get('/api/documents/:id/download', (req, res) => {
    const doc = TRADE_DOCUMENT_TEMPLATES.find((item) => item.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: `Document template '${req.params.id}' not found` });
      return;
    }

    const format = String(req.query.format || 'html').toLowerCase() === 'txt' ? 'txt' : 'html';
    const company = String(req.query.company || '').trim();
    const email = String(req.query.email || '').trim();
    const token = String(req.query.token || '').trim();
    const watermark =
      company && email && token ? { company, email, token } : undefined;

    const payload =
      format === 'txt'
        ? renderTemplatePlainText(doc, watermark)
        : renderTemplatePrintableHtml(doc, watermark);

    const contentType =
      format === 'txt' ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8';
    const filename = `${doc.code}-${doc.id}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(payload);
  });

  app.get('/api/rust-backend', (_req, res) => {
    res.json({
      packageName: 'petrotechnics-api',
      framework: 'Axum 0.7 + Tokio + Serde',
      scannedAt: new Date().toISOString(),
      files: loadRustBackendFiles(),
    });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PetroTechnics server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PetroTechnics server:', err);
  process.exit(1);
});
