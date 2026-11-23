import type { Locale, LocalizedText } from '../types/domain';

export type TradeDocumentCategory = 'commercial' | 'shipping' | 'inspection';

export interface DocumentFieldRow {
  label: string;
  value: string;
}

export interface DocumentLineItem {
  item: string;
  spec: string;
  quantity: string;
  unitPriceOrResult: string;
  totalOrMethod: string;
}

export interface TradeDocumentTemplate {
  id: string;
  code: string;
  category: TradeDocumentCategory;
  revision: string;
  sha256: string;
  stageRef: string;
  issuer: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  documentTitleEn: string;
  subtitleEn: string;
  metadata: DocumentFieldRow[];
  tableHeaders: [string, string, string, string, string];
  lineItems: DocumentLineItem[];
  clauses: string[];
  signatory: string;
}

export const TRADE_DOCUMENT_TEMPLATES: TradeDocumentTemplate[] = [
  {
    id: 'proforma-invoice',
    code: 'PT-PI-2026-0418',
    category: 'commercial',
    revision: 'Rev 2026.2',
    sha256: '8f4c29a1e7b03d94c118e42f9a6d50b2',
    stageRef: 'Stage 03 · SPA & PI',
    issuer: {
      en: 'PetroTechnics Commercial Desk',
      fa: 'میز بازرگانی پتروتکنیکس',
      ar: 'المكتب التجاري لبتروتيكنيكس',
    },
    title: {
      en: 'Pro-forma Invoice (PI) Sample',
      fa: 'نمونه پیش‌فاکتور رسمی (Pro-forma Invoice)',
      ar: 'نموذج الفاتورة المبدئية (Pro-forma Invoice)',
    },
    summary: {
      en: 'Standard bank-ready Pro-forma Invoice structured for Irrevocable L/C at Sight or 30/70 TT settlement with HS code, tolerance, and laycan terms.',
      fa: 'نمونه استاندارد پیش‌فاکتور بانکی برای گشایش اعتبار اسنادی دیداری (L/C) یا تسویه ۳۰/۷۰ حواله شامل کد HS و بازه بارگیری.',
      ar: 'نموذج فاتورة مبدئية معتمدة بنكياً للاعتماد المستندي عند الاطلاع أو التحويل البنكي ٣٠/٧٠ مع رمز HS وجدول التحميل.',
    },
    documentTitleEn: 'PRO-FORMA INVOICE',
    subtitleEn: 'Commercial Export Allocation · Incoterms 2020 Compliant',
    metadata: [
      { label: 'Invoice No.', value: 'PT-PI-2026-0418' },
      { label: 'Issue Date', value: '2026-11-18' },
      { label: 'Seller', value: 'PetroTechnics International Trading (petrotechnic.co)' },
      { label: 'Buyer / Consignee', value: '[Verified Counterparty Legal Entity]' },
      { label: 'Incoterm 2020', value: 'CFR Mundra Port, India (Bulk Vessel)' },
      { label: 'Loading Port', value: 'Assaluyeh (Pars Port), Iran' },
      { label: 'Payment Terms', value: '100% Irrevocable L/C at Sight (or 30% TT / 70% vs B/L)' },
      { label: 'Inspection', value: 'SGS Load-Port Quality, Quantity & Draft Survey' },
    ],
    tableHeaders: ['Commodity & Grade', 'HS Code', 'Quantity', 'Unit Price', 'Total (USD)'],
    lineItems: [
      {
        item: 'Urea 46% Nitrogen — Granular (2.0–4.0 mm, Biuret ≤ 1.0%)',
        spec: '3102.10',
        quantity: '10,000 MT (±5%)',
        unitPriceOrResult: '$374.00 / MT',
        totalOrMethod: '$3,740,000.00',
      },
      {
        item: 'Bulk Vessel Freight & Load-Port SGS Q&Q Certification',
        spec: 'CFR Included',
        quantity: '1 Handymax Lot',
        unitPriceOrResult: 'Included',
        totalOrMethod: 'Included',
      },
    ],
    clauses: [
      'Quantity & value tolerance of ±5% at seller option to match vessel stowage factor.',
      'Shipment laycan: 15–25 days from receipt of operative Irrevocable L/C or 30% TT deposit.',
      'Quality & weight determined at load port by SGS certificate shall be final and binding.',
      'Full 3/3 Original Clean On-Board Bill of Lading, COO, COA, Invoice, and Packing List presented within 48 hours of sailing.',
    ],
    signatory: 'Authorized Signatory — PetroTechnics Trading Desk (Sharjah / Tehran)',
  },
  {
    id: 'bill-of-lading',
    code: 'PT-BL-2026-0892',
    category: 'shipping',
    revision: 'Rev 2026.1',
    sha256: '3d91b7e4c520a88f64b19c07e3d4a210',
    stageRef: 'Stage 07 · Loading & B/L',
    issuer: {
      en: 'Ocean Carrier / Maritime Ops',
      fa: 'خط کشتیرانی و عملیات دریایی',
      ar: 'الخط الملاحي والعمليات البحرية',
    },
    title: {
      en: 'Clean On-Board Bill of Lading (B/L) Sample',
      fa: 'نمونه بارنامه دریایی تمیز (Clean On-Board B/L)',
      ar: 'نموذج بوليصة الشحن البحري النظيفة (B/L)',
    },
    summary: {
      en: 'Non-negotiable ocean Bill of Lading template showing containerized HDPE polymer stuffing, container/seal roster, net/gross tonnage, and freight endorsement.',
      fa: 'نمونه بارنامه دریایی کانتینری برای صادرات پلی‌اتیلن سنگین (HDPE) شامل شماره کانتینر و پلمب، وزن خالص و ناخالص و شرح کرایه.',
      ar: 'نموذج بوليصة شحن بحري للحاويات يوضح تعبئة بوليمر HDPE وأرقام الحاويات والأختام والوزن الصافي والإجمالي.',
    },
    documentTitleEn: 'OCEAN BILL OF LADING — SAMPLE TEMPLATE',
    subtitleEn: 'Clean Shipped On Board · Freight Prepaid (CFR / CIF)',
    metadata: [
      { label: 'B/L Reference', value: 'PT-BL-2026-0892 (3/3 Originals Issued)' },
      { label: 'Shipper', value: 'PetroTechnics International Trading' },
      { label: 'Consignee', value: 'TO THE ORDER OF [ISSUING BANK / BUYER]' },
      { label: 'Vessel / Voyage', value: 'M/V PERSIAN HORIZON · Voy. 2611E' },
      { label: 'Port of Loading', value: 'Shahid Rajaee Port, Bandar Abbas' },
      { label: 'Port of Discharge', value: 'Nhava Sheva (JNPT), India' },
      { label: 'Freight Payable', value: 'FREIGHT PREPAID · 14 Days Free Detention' },
      { label: 'On-Board Date', value: '2026-11-16 (Clean On Board)' },
    ],
    tableHeaders: ['Container / Seal', 'Packages', 'Description of Goods', 'Net Weight', 'Gross Weight'],
    lineItems: [
      {
        item: 'MSCU 482910-4 · Seal #SGS-99104',
        spec: '18 Pallets (990 Bags)',
        quantity: 'HDPE Film Grade EX5 · 25kg FFS Bags · HS 3901.20',
        unitPriceOrResult: '24,750 kg',
        totalOrMethod: '25,210 kg',
      },
      {
        item: 'MSCU 482914-9 · Seal #SGS-99105',
        spec: '18 Pallets (990 Bags)',
        quantity: 'HDPE Film Grade EX5 · 25kg FFS Bags · HS 3901.20',
        unitPriceOrResult: '24,750 kg',
        totalOrMethod: '25,210 kg',
      },
      {
        item: 'Total Lot (10 × 40ft High-Cube)',
        spec: '180 ISPM-15 Pallets',
        quantity: 'Virgin Prime High-Density Polyethylene (Batch #EX5-2611)',
        unitPriceOrResult: '247,500 kg',
        totalOrMethod: '252,100 kg',
      },
    ],
    clauses: [
      'Shipped on board in apparent good order and condition; shrink-wrapped moisture-barrier palletization verified.',
      'Telex Release available within 24 hours upon bank/seller settlement confirmation.',
      'Container detention free-time of 14 calendar days negotiated at Port of Discharge.',
    ],
    signatory: 'Master / Carrier Agent — Bandar Abbas Maritime Terminal',
  },
  {
    id: 'sgs-inspection-report',
    code: 'SGS-IR-2026-7741',
    category: 'inspection',
    revision: 'Rev 2026.3',
    sha256: 'a91e6f40b82d17c5e23094fb61c82d7a',
    stageRef: 'Stage 06 · Q&Q Inspection',
    issuer: {
      en: 'Independent Surveyor (SGS / BV / Intertek)',
      fa: 'بازرس مستقل (SGS / بورو وریتاس / اینترتک)',
      ar: 'جهة الفحص المستقلة (SGS / BV / Intertek)',
    },
    title: {
      en: 'SGS Quality & Quantity Inspection Report Sample',
      fa: 'نمونه گزارش بازرسی کمیت و کیفیت SGS',
      ar: 'نموذج تقرير فحص الجودة والكمية (SGS)',
    },
    summary: {
      en: 'Load-port third-party laboratory assay and draft survey certificate sample for 99.9% Bright Yellow Granular Sulfur confirming full contractual compliance.',
      fa: 'نمونه گواهی آزمایشگاهی و درفت‌سروی مستقل در بندر بارگیری برای گوگرد گرانول ۹۹.۹٪ با تایید کامل انطباق قراردادی.',
      ar: 'نموذج شهادة التحليل المخبري ومسح الغاطس في ميناء التحميل للكبريت المحبب ٩٩.٩٪ لتأكيد المطابقة الكاملة.',
    },
    documentTitleEn: 'CERTIFICATE OF QUALITY, QUANTITY & DRAFT SURVEY',
    subtitleEn: 'Independent Load-Port Inspection Sample · ASTM / SUDIC Standards',
    metadata: [
      { label: 'Report Reference', value: 'SGS-IR-2026-7741 (Sample Template)' },
      { label: 'Inspection Location', value: 'Bandar Abbas Bulk Export Terminal' },
      { label: 'Commodity', value: 'Bright Yellow Granular Sulfur (2.0–6.0 mm)' },
      { label: 'Contract Ref.', value: 'PT-SPA-2026-0309' },
      { label: 'Draft Survey Net', value: '15,042.600 Metric Tons (Dry Basis)' },
      { label: 'Sampling Method', value: 'ISO 8213 Continuous Belt Composite Sampling' },
      { label: 'Hold Cleanliness', value: 'Holds 1–4 Inspected, Dry & Free of Contaminants' },
      { label: 'Compliance Status', value: 'CONFORMING TO CONTRACT SPECIFICATION' },
    ],
    tableHeaders: ['Test Parameter', 'Contract Spec', 'Lab Result', 'Unit', 'Test Method'],
    lineItems: [
      {
        item: 'Sulfur Purity (Dry Basis)',
        spec: '99.90 min',
        quantity: '99.94',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'ASTM D4045',
      },
      {
        item: 'Ash Content',
        spec: '0.030 max',
        quantity: '0.018',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'ASTM D482',
      },
      {
        item: 'Organic Carbon Matter',
        spec: '0.050 max',
        quantity: '0.024',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'Combustion',
      },
      {
        item: 'Acidity (as H2SO4)',
        spec: '0.010 max',
        quantity: '0.004',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'Titration',
      },
      {
        item: 'Moisture Content',
        spec: '0.50 max',
        quantity: '0.28',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'Oven Dry 80°C',
      },
    ],
    clauses: [
      'Composite samples sealed in triplicate: 1 Buyer Retention, 1 Seller Retention, 1 Umpire Lab (90 days).',
      'Initial and final vessel draft readings witnessed jointly with Chief Officer prior to hatch sealing.',
      'Visual color confirmed Bright Yellow with free-flowing formed granules and minimal dust generation.',
    ],
    signatory: 'Senior Marine & Chemical Surveyor — Accredited Inspection Laboratory',
  },
  {
    id: 'full-corporate-offer',
    code: 'PT-FCO-2026-1104',
    category: 'commercial',
    revision: 'Rev 2026.2',
    sha256: '5c08d3f2a419e7b6820d4a11f9e6c301',
    stageRef: 'Stage 02 · Commercial FCO',
    issuer: {
      en: 'PetroTechnics Trading Desk',
      fa: 'واحد قیمت‌گذاری و فروش پتروتکنیکس',
      ar: 'مكتب التسعير والمبيعات في بتروتيكنيكس',
    },
    title: {
      en: 'Full Corporate Offer (FCO) Template',
      fa: 'نمونه پیشنهاد تجاری رسمی (FCO)',
      ar: 'نموذج العرض التجاري الرسمي (FCO)',
    },
    summary: {
      en: 'Formal binding quotation template for overland TIR polymer deliveries (PP Raffia HP500H, DAP Istanbul) detailing validity window and payment milestones.',
      fa: 'نمونه پیشنهاد رسمی برای ارسال زمینی پلیمر (PP رافیا، DAP استانبول) شامل مدت اعتبار قیمت و شرایط پرداخت.',
      ar: 'نموذج عرض تجاري رسمي للشحن البري للبوليمرات (PP رافيا، DAP إسطنبول) موضحاً فترة الصلاحية وشروط الدفع.',
    },
    documentTitleEn: 'FULL CORPORATE OFFER (FCO)',
    subtitleEn: 'Binding Export Quotation · Validity 72 Business Hours',
    metadata: [
      { label: 'Offer Ref.', value: 'PT-FCO-2026-1104' },
      { label: 'Validity', value: '72 Hours from Issue Timestamp' },
      { label: 'Product', value: 'Polypropylene Homopolymer — Raffia Grade HP500H' },
      { label: 'Delivery Term', value: 'DAP Istanbul Customs Terminal, Türkiye' },
      { label: 'Transport Mode', value: 'Direct Overland TIR Trucks (20 × 24.75 MT)' },
      { label: 'Transit Time', value: '5–7 Calendar Days via Bazargan Border' },
    ],
    tableHeaders: ['Grade', 'MFR (230°C)', 'Volume', 'DAP Price', 'Packaging'],
    lineItems: [
      {
        item: 'PP HP500H (Virgin Prime)',
        spec: '3.0 g/10min',
        quantity: '495 MT (20 Trucks)',
        unitPriceOrResult: '$1,045.00 / MT',
        totalOrMethod: '25kg FFS Bags on ISPM-15 Pallets',
      },
    ],
    clauses: [
      'Origin batch COA and SGS pre-dispatch truck sealing report provided per TIR consignment.',
      'Buyer acceptance via countersigned FCO triggers Sales Contract (SPA) & PI issuance within 24 hours.',
    ],
    signatory: 'Director of Polymer Exports — PetroTechnics Istanbul / Tehran Desk',
  },
  {
    id: 'certificate-of-origin',
    code: 'COO-CC-2026-5520',
    category: 'shipping',
    revision: 'Rev 2026.1',
    sha256: 'e14b90c6f3728d51a044bc89e271f60d',
    stageRef: 'Stage 08 · Final Shipping Docs',
    issuer: {
      en: 'Chamber of Commerce',
      fa: 'اتاق بازرگانی و صنایع',
      ar: 'غرفة التجارة والصناعة',
    },
    title: {
      en: 'Chamber of Commerce Certificate of Origin (COO)',
      fa: 'نمونه گواهی مبدأ اتاق بازرگانی (COO)',
      ar: 'نموذج شهادة المنشأ من غرفة التجارة (COO)',
    },
    summary: {
      en: 'Chamber-authenticated Certificate of Origin sample aligning exporter, consignee, HS tariff code, vessel name, and net/gross weight for destination customs.',
      fa: 'نمونه گواهی مبدأ اتاق بازرگانی شامل اطلاعات صادرکننده، گیرنده، کد تعرفه HS، نام کشتی و وزن محموله برای ترخیص گمرکی.',
      ar: 'نموذج شهادة منشأ موثقة من غرفة التجارة تطابق بيانات المصدر والمستلم ورمز HS واسم السفينة للتخليص الجمركي.',
    },
    documentTitleEn: 'CERTIFICATE OF ORIGIN — SAMPLE FORMAT',
    subtitleEn: 'Authenticated for Destination Import Customs Clearance',
    metadata: [
      { label: 'Certificate No.', value: 'COO-CC-2026-5520' },
      { label: 'Exporter', value: 'PetroTechnics International Trading' },
      { label: 'Consignee', value: '[Designated Importer / Bank Order]' },
      { label: 'Country of Origin', value: 'Islamic Republic of Iran (Petrochemical Complex)' },
      { label: 'Transport Details', value: 'By Sea · Port of Loading: Assaluyeh' },
      { label: 'Invoice Reference', value: 'PT-CI-2026-0418' },
    ],
    tableHeaders: ['Marks & Nos.', 'HS Tariff', 'Goods Description', 'Gross Weight', 'Net Weight'],
    lineItems: [
      {
        item: 'IN BULK / N.M.',
        spec: '3102.10',
        quantity: 'Granular Urea 46% Nitrogen, Agricultural Grade',
        unitPriceOrResult: '10,000.00 MT',
        totalOrMethod: '10,000.00 MT',
      },
    ],
    clauses: [
      'Chamber of Commerce hereby certifies that the goods described above originate in the stated country.',
      'Legalization via destination embassy / consulate available upon buyer L/C instruction.',
    ],
    signatory: 'Authorized Chamber Certification Officer · QR Verification Enabled',
  },
  {
    id: 'manufacturer-coa',
    code: 'COA-LAB-2026-3319',
    category: 'inspection',
    revision: 'Rev 2026.2',
    sha256: '71a9c408e5f23b16d9470ac3b28e5f99',
    stageRef: 'Stage 05 · Batch Allocation',
    issuer: {
      en: 'Producing Complex QC Lab',
      fa: 'آزمایشگاه کنترل کیفیت مجتمع تولیدی',
      ar: 'مختبر مراقبة الجودة بالمجمع المنتج',
    },
    title: {
      en: 'Manufacturer Certificate of Analysis (COA) Sample',
      fa: 'نمونه گواهی آنالیز آزمایشگاهی کارخانه (COA)',
      ar: 'نموذج شهادة التحليل المخبري من المصنع (COA)',
    },
    summary: {
      en: 'IMPCA-compliant batch laboratory Certificate of Analysis sample for Methanol Grade AA (99.85% min purity) issued directly by plant quality control.',
      fa: 'نمونه گواهی آنالیز آزمایشگاهی کارخانه مطابق استاندارد IMPCA برای متانول گرید AA با خلوص حداقل ۹۹.۸۵٪.',
      ar: 'نموذج شهادة تحليل مخبري مصنعية مطابقة لمعيار IMPCA للميثانول درجة AA بنقاء ٩٩.٨٥٪ كحد أدنى.',
    },
    documentTitleEn: 'MANUFACTURER CERTIFICATE OF ANALYSIS (COA)',
    subtitleEn: 'IMPCA Grade AA Methanol · Batch Laboratory Release',
    metadata: [
      { label: 'COA Number', value: 'COA-LAB-2026-3319' },
      { label: 'Product', value: 'Methanol Grade AA (CH3OH · CAS 67-56-1)' },
      { label: 'Tank / Batch ID', value: 'TK-402 / Lot #MEOH-2611-A' },
      { label: 'Production Date', value: '2026-11-14' },
      { label: 'Standard Reference', value: 'IMPCA Methanol Reference Specification' },
      { label: 'Quality Release', value: 'APPROVED FOR EXPORT PARCEL LOADING' },
    ],
    tableHeaders: ['Parameter', 'IMPCA Limit', 'Batch Result', 'Unit', 'Method'],
    lineItems: [
      {
        item: 'Purity (Dry Basis)',
        spec: '99.85 min',
        quantity: '99.89',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'IMPCA 001',
      },
      {
        item: 'Water Content',
        spec: '0.10 max',
        quantity: '0.042',
        unitPriceOrResult: '% wt',
        totalOrMethod: 'ASTM E1064',
      },
      {
        item: 'Ethanol Content',
        spec: '50 max',
        quantity: '14',
        unitPriceOrResult: 'mg/kg',
        totalOrMethod: 'IMPCA 001',
      },
      {
        item: 'Permanganate Time (15°C)',
        spec: '60 min',
        quantity: '> 75',
        unitPriceOrResult: 'min',
        totalOrMethod: 'ASTM D1363',
      },
      {
        item: 'Color (Pt-Co)',
        spec: '5 max',
        quantity: '2',
        unitPriceOrResult: 'APHA',
        totalOrMethod: 'ASTM D1209',
      },
    ],
    clauses: [
      'Batch conforms to IMPCA Grade AA chemical purity criteria for MTO, formaldehyde, and acetic acid units.',
      'Shore-tank composite and vessel manifold sample cross-verified prior to loading arm disconnection.',
    ],
    signatory: 'Chief Quality Control Chemist — Coastal Petrochemical Complex',
  },
];

export function renderTemplatePlainText(
  doc: TradeDocumentTemplate,
  watermark?: { company: string; email: string; token: string },
): string {
  const divider = '================================================================================';
  const subDivider = '--------------------------------------------------------------------------------';
  const lines = [
    divider,
    `PETROTECHNICS INTERNATIONAL TRADING (petrotechnic.co)`,
    `${doc.documentTitleEn}`,
    `${doc.subtitleEn}`,
    divider,
    `Template Code:   ${doc.code} (${doc.revision})`,
    `SHA-256 Digest:  ${doc.sha256}`,
    watermark
      ? `Verified Access: ${watermark.company} (${watermark.email}) · Clearance ${watermark.token}`
      : `Access Status:   Standard Sample Template`,
    `Generated UTC:   ${new Date().toISOString()}`,
    '',
    'DOCUMENT METADATA',
    subDivider,
    ...doc.metadata.map((row) => `${row.label.padEnd(22)} : ${row.value}`),
    '',
    'SCHEDULE / SPECIFICATION ITEMS',
    subDivider,
    doc.tableHeaders.join(' | '),
    subDivider,
    ...doc.lineItems.map(
      (row) =>
        `${row.item} | ${row.spec} | ${row.quantity} | ${row.unitPriceOrResult} | ${row.totalOrMethod}`,
    ),
    '',
    'STANDARD COMMERCIAL & COMPLIANCE CLAUSES',
    subDivider,
    ...doc.clauses.map((clause, i) => `${i + 1}. ${clause}`),
    '',
    subDivider,
    `Signatory: ${doc.signatory}`,
    `Notice: Sample institutional template for counterparty review. Binding terms are governed solely by countersigned SPA.`,
    divider,
  ];
  return lines.join('\n');
}

export function renderTemplatePrintableHtml(
  doc: TradeDocumentTemplate,
  watermark?: { company: string; email: string; token: string },
): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(doc.code)} — ${esc(doc.documentTitleEn)} | PetroTechnics</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0B1520; margin: 40px auto; max-width: 860px; padding: 0 24px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0E4D64; padding-bottom: 18px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #0B1520; }
    .sub { font-size: 12px; color: #4A5B6C; margin-top: 2px; }
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 18px; margin: 0; color: #0E4D64; letter-spacing: 0.02em; }
    .doc-title p { font-size: 11px; color: #4A5B6C; margin: 4px 0 0; font-family: monospace; }
    .watermark { background: #EDF5F8; border: 1px solid #CBD5E1; padding: 10px 14px; font-size: 11px; color: #0E4D64; margin-bottom: 22px; font-family: monospace; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 24px; margin-bottom: 26px; font-size: 13px; }
    .meta-row { border-bottom: 1px solid #E5EBF0; padding-bottom: 6px; }
    .meta-label { font-size: 11px; color: #708294; display: block; }
    .meta-val { font-weight: 600; color: #0B1520; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 26px; font-size: 12.5px; }
    th { background: #F7F9FB; text-align: left; padding: 10px 12px; border-bottom: 1px solid #CBD5E1; font-size: 11px; color: #4A5B6C; }
    td { padding: 10px 12px; border-bottom: 1px solid #E5EBF0; vertical-align: top; }
    .clauses { background: #F7F9FB; padding: 16px 20px; border: 1px solid #E5EBF0; margin-bottom: 26px; font-size: 12px; color: #334155; }
    .clauses h2 { font-size: 12px; margin: 0 0 8px; color: #0B1520; text-transform: uppercase; letter-spacing: 0.04em; }
    .clauses ol { margin: 0; padding-left: 18px; }
    .clauses li { margin-bottom: 4px; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid #CBD5E1; padding-top: 14px; font-size: 11px; color: #64748B; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">PetroTechnics</div>
      <div class="sub">International Petrochemical Trading House · petrotechnic.co</div>
      <div class="sub">Tehran · Bandar Abbas · Sharjah · Istanbul</div>
    </div>
    <div class="doc-title">
      <h1>${esc(doc.documentTitleEn)}</h1>
      <p>${esc(doc.code)} · ${esc(doc.revision)}</p>
      <p>SHA-256: ${esc(doc.sha256)}</p>
    </div>
  </div>
  ${
    watermark
      ? `<div class="watermark">VERIFIED BUYER COPY · Issued to ${esc(watermark.company)} (${esc(watermark.email)}) · Clearance ID: ${esc(watermark.token)}</div>`
      : ''
  }
  <div class="meta-grid">
    ${doc.metadata
      .map(
        (m) =>
          `<div class="meta-row"><span class="meta-label">${esc(m.label)}</span><span class="meta-val">${esc(m.value)}</span></div>`,
      )
      .join('')}
  </div>
  <table>
    <thead>
      <tr>${doc.tableHeaders.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${doc.lineItems
        .map(
          (row) =>
            `<tr><td><strong>${esc(row.item)}</strong></td><td>${esc(row.spec)}</td><td>${esc(row.quantity)}</td><td>${esc(row.unitPriceOrResult)}</td><td>${esc(row.totalOrMethod)}</td></tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <div class="clauses">
    <h2>Standard Commercial &amp; Inspection Clauses</h2>
    <ol>${doc.clauses.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
  </div>
  <div class="footer">
    <span>${esc(doc.signatory)}</span>
    <span>petrotechnic.co · trade@petrotechnic.co</span>
  </div>
</body>
</html>`;
}

export const DOC_HUB_COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    lockedState: string;
    verifiedState: string;
    unlockHeading: string;
    unlockSub: string;
    companyPlaceholder: string;
    emailPlaceholder: string;
    ndaLabel: string;
    unlockBtn: string;
    unlocking: string;
    unlockError: string;
    revokeAccess: string;
    allTab: string;
    commercialTab: string;
    shippingTab: string;
    inspectionTab: string;
    downloadHtml: string;
    downloadTxt: string;
    copyHash: string;
    copiedHash: string;
    redactedNotice: string;
    verifyToUnlock: string;
    checksumLabel: string;
    clearanceLabel: string;
  }
> = {
  en: {
    eyebrow: 'Verified Counterparty Vault · SHA-256 Indexed',
    title: 'Secure Document Hub & Trade Templates',
    subtitle:
      'Inspect and download institutional PetroTechnics trade templates—including Pro-forma Invoices, Clean On-Board Bills of Lading, SGS Q&Q Inspection Reports, FCOs, COOs, and Factory COAs.',
    lockedState: 'Standard Sample Preview · Corporate Verification Required for Downloads',
    verifiedState: 'Verified Counterparty Session Active · Watermarked Downloads Enabled',
    unlockHeading: 'Verify Corporate Access to Unlock Unredacted Downloads',
    unlockSub:
      'Enter your corporate entity and business email to generate a watermarked, audit-stamped template download session.',
    companyPlaceholder: 'Company legal name (e.g. Anatolia Packaging A.Ş.)',
    emailPlaceholder: 'Corporate email (e.g. trade@company.com)',
    ndaLabel:
      'I confirm these sample templates are strictly for commercial evaluation and trade finance alignment with PetroTechnics.',
    unlockBtn: 'Verify & Unlock Vault',
    unlocking: 'Verifying...',
    unlockError: 'Please enter a valid company name, corporate email, and accept the evaluation acknowledgment.',
    revokeAccess: 'Lock Vault',
    allTab: 'All Templates (6)',
    commercialTab: 'Commercial & PI',
    shippingTab: 'B/L & Customs',
    inspectionTab: 'SGS & COA',
    downloadHtml: 'Download Printable Sheet (.html)',
    downloadTxt: 'Download Plain Text (.txt)',
    copyHash: 'Copy SHA-256',
    copiedHash: 'Copied',
    redactedNotice: 'Full commercial schedule & watermarked downloads unlock immediately after corporate verification above.',
    verifyToUnlock: 'Verify Corporate Access Above to Download',
    checksumLabel: 'SHA-256',
    clearanceLabel: 'Clearance ID',
  },
  fa: {
    eyebrow: 'مخزن امن اسناد بازرگانی · دارای کد اصالت SHA-256',
    title: 'مرکز امن اسناد و نمونه‌فرم‌های صادراتی',
    subtitle:
      'مشاهده و دانلود نمونه‌اسناد رسمی پتروتکنیکس شامل پیش‌فاکتور (PI)، بارنامه دریایی (B/L)، گزارش بازرسی SGS، پیشنهاد رسمی (FCO)، گواهی مبدأ (COO) و آنالیز کارخانه (COA).',
    lockedState: 'پیش‌نمایش محدود · برای دانلود نسخه کامل احراز سازمانی انجام دهید',
    verifiedState: 'دسترسی سازمانی تایید شد · دانلود نسخه‌های دارای واترمارک فعال است',
    unlockHeading: 'احراز دسترسی سازمانی برای باز کردن دانلود اسناد کامل',
    unlockSub:
      'نام شرکت و ایمیل سازمانی خود را وارد کنید تا نشست امن دانلود با کد رهگیری اختصاصی فعال شود.',
    companyPlaceholder: 'نام رسمی شرکت خریدار',
    emailPlaceholder: 'ایمیل سازمانی (مثلاً trade@company.com)',
    ndaLabel:
      'تایید می‌کنم این نمونه‌اسناد صرفاً جهت بررسی بازرگانی و هماهنگی اعتبار اسنادی با پتروتکنیکس استفاده می‌شود.',
    unlockBtn: 'تایید و باز کردن مخزن',
    unlocking: 'در حال بررسی...',
    unlockError: 'لطفاً نام شرکت، ایمیل سازمانی معتبر و تاییدیه محرمانگی را تکمیل کنید.',
    revokeAccess: 'قفل مجدد مخزن',
    allTab: 'همه اسناد (۶)',
    commercialTab: 'بازرگانی و PI',
    shippingTab: 'بارنامه و گمرک',
    inspectionTab: 'بازرسی SGS و COA',
    downloadHtml: 'دانلود نسخه چاپی (.html)',
    downloadTxt: 'دانلود متن ساده (.txt)',
    copyHash: 'کپی SHA-256',
    copiedHash: 'کپی شد',
    redactedNotice: 'جزئیات کامل جدول و امکان دانلود نسخه کامل بلافاصله پس از تایید سازمانی در بخش بالا فعال می‌شود.',
    verifyToUnlock: 'برای دانلود ابتدا دسترسی بالا را تایید کنید',
    checksumLabel: 'SHA-256',
    clearanceLabel: 'شناسه دسترسی',
  },
  ar: {
    eyebrow: 'خزنة المستندات التجارية الآمنة · موثقة بـ SHA-256',
    title: 'مركز المستندات الآمن ونماذج التداول القياسية',
    subtitle:
      'استعرض وحمّل النماذج التجارية الرسمية لبتروتيكنيكس بما في ذلك الفواتير المبدئية (PI) وبوالص الشحن البحري (B/L) وتقارير فحص SGS وشهادات المنشأ والتحليل.',
    lockedState: 'معاينة أولية · يتطلب التحقق المؤسسي لتفعيل التحميل الكامل',
    verifiedState: 'جلسة الشريك المعتمد نشطة · التحميل بعلامة مائية مفعّل',
    unlockHeading: 'توثيق الوصول المؤسسي لفتح تحميل النماذج الكاملة',
    unlockSub:
      'أدخل اسم الشركة والبريد الإلكتروني الرسمي لتوليد جلسة تحميل موثقة ومختومة برقم مرجعي.',
    companyPlaceholder: 'الاسم القانوني للشركة',
    emailPlaceholder: 'البريد الرسمي (مثال: trade@company.com)',
    ndaLabel:
      'أؤكد أن هذه النماذج مخصصة حصراً للتقييم التجاري ومواءمة الاعتمادات المستندية مع بتروتيكنيكس.',
    unlockBtn: 'التحقق وفتح الخزنة',
    unlocking: 'جارٍ التحقق...',
    unlockError: 'يرجى إدخال اسم الشركة وبريد رسمي صحيح والموافقة على إقرار السرية.',
    revokeAccess: 'إغلاق الخزنة',
    allTab: 'جميع النماذج (٦)',
    commercialTab: 'تجارية و PI',
    shippingTab: 'الشحن والجمارك',
    inspectionTab: 'فحص SGS و COA',
    downloadHtml: 'تحميل نسخة للطباعة (.html)',
    downloadTxt: 'تحميل نص عادي (.txt)',
    copyHash: 'نسخ SHA-256',
    copiedHash: 'تم النسخ',
    redactedNotice: 'يفتح الجدول التجاري الكامل وإمكانية التحميل فور إتمام التحقق المؤسسي أعلاه.',
    verifyToUnlock: 'وثّق الوصول المؤسسي أعلاه للتحميل',
    checksumLabel: 'SHA-256',
    clearanceLabel: 'معرّف التصريح',
  },
};
