import type { TradeDocumentTemplate } from '../data/documents';
import { formatMoney } from '../data/currency';
import type {
  BuyerProfile,
  CurrencyCode,
  Product,
  RfqRecord,
} from '../types/domain';

export interface BuyerAccountIdentity {
  uid: string;
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  country: string;
  preferredPort: string;
  taxOrRegId: string;
  clearanceToken: string;
}

export function buildBuyerAccountIdentity(
  uid: string,
  email: string,
  displayName: string,
  profile: BuyerProfile | null,
  fallbackRfq?: RfqRecord | null,
): BuyerAccountIdentity {
  const companyName =
    profile?.companyName?.trim() ||
    fallbackRfq?.companyName?.trim() ||
    `${displayName || email.split('@')[0]} Trading Account`;
  const contactName =
    profile?.contactName?.trim() ||
    fallbackRfq?.contactName?.trim() ||
    displayName ||
    email.split('@')[0];

  return {
    uid,
    email: email.toLowerCase(),
    companyName,
    contactName,
    phone: profile?.phone?.trim() || fallbackRfq?.phone?.trim() || 'On file',
    country: profile?.country?.trim() || 'International Counterparty',
    preferredPort:
      profile?.preferredPort?.trim() ||
      fallbackRfq?.destination?.trim() ||
      'Destination Port (TBD)',
    taxOrRegId: profile?.taxOrRegId?.trim() || 'Pending KYC Filing',
    clearanceToken: `PT-ACC-${uid.slice(0, 8).toUpperCase()}`,
  };
}

function deterministicDigest(seed: string): string {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${partA}${partB}${partA.split('').reverse().join('')}${partB.split('').reverse().join('')}`;
}

/**
 * Generates 5 live, account-customized trade documents bound to the signed-in buyer's
 * corporate profile and selected RFQ/active order (with real Firestore product specs).
 */
export function buildAccountCustomDocuments(
  account: BuyerAccountIdentity,
  selectedRfq: RfqRecord | null,
  matchedProduct: Product | null,
  fallbackCurrency: CurrencyCode,
): TradeDocumentTemplate[] {
  const issueDate = new Date().toISOString().slice(0, 10);
  const refSuffix = selectedRfq
    ? selectedRfq.referenceId.replace(/^PT-/, '')
    : account.uid.slice(0, 6).toUpperCase();

  const commodityName =
    selectedRfq?.productName ||
    matchedProduct?.name.en ||
    'Petrochemical Export Allocation';
  const gradeCode =
    selectedRfq?.grade || matchedProduct?.grades[0]?.code || 'Prime Virgin Grade';
  const hsCode = matchedProduct?.hsCode || '3901.20';
  const casNumber = matchedProduct?.casNumber || 'On Producer COA';
  const qtyMt = selectedRfq?.quantityMt ?? matchedProduct?.moqMt ?? 500;
  const incoterm = selectedRfq?.incoterm ?? 'CFR';
  const packaging =
    selectedRfq?.packaging ||
    matchedProduct?.packaging[0]?.en ||
    'Standard Export Packaging';
  const inspection = selectedRfq?.inspection ?? 'SGS';
  const currency: CurrencyCode = selectedRfq?.currency ?? fallbackCurrency;
  const unitPrice = selectedRfq?.estimatedUnitPrice ?? 0;
  const totalVal = selectedRfq?.estimatedTotal ?? 0;
  const loadPort =
    selectedRfq?.portOfLoading?.trim() ||
    matchedProduct?.loadingPorts[0] ||
    'Bandar Abbas / Assaluyeh, Iran';
  const dischargePort =
    selectedRfq?.destination?.trim() || account.preferredPort;
  const vessel =
    selectedRfq?.vesselName?.trim() || 'Vessel Nomination Pending Laycan';
  const blRef =
    selectedRfq?.blNumber?.trim() || `PT-BL-${refSuffix}`;
  const etaLabel = selectedRfq?.etaDate?.trim() || 'Confirmed Upon Laycan';
  const consigneeLine = `${account.companyName}${
    account.taxOrRegId !== 'Pending KYC Filing'
      ? ` (Reg/Tax ID: ${account.taxOrRegId})`
      : ''
  }`;

  const unitPriceText =
    unitPrice > 0 ? `${formatMoney(unitPrice, currency)} / MT` : 'Per Firm FCO';
  const totalText =
    totalVal > 0 ? formatMoney(totalVal, currency) : 'Per Firm FCO';

  const productSpecRows =
    matchedProduct && matchedProduct.specs.length > 0
      ? matchedProduct.specs.slice(0, 6).map((s) => ({
          item: s.parameter.en,
          spec: s.value,
          quantity: s.value,
          unitPriceOrResult: s.unit,
          totalOrMethod: s.method,
        }))
      : [
          {
            item: 'Commercial Grade Purity / Assay',
            spec: `${gradeCode} Prime Virgin`,
            quantity: 'Conforming',
            unitPriceOrResult: 'Pass',
            totalOrMethod: 'ASTM / ISO',
          },
          {
            item: 'Moisture & Contamination',
            spec: 'Export Dry Standard',
            quantity: 'Conforming',
            unitPriceOrResult: 'Pass',
            totalOrMethod: `${inspection} Load-Port Lab`,
          },
        ];

  const orderTag = selectedRfq ? selectedRfq.referenceId : 'ACCOUNT-PROFILE';

  // 1. Account-Customized Pro-forma Invoice (PI)
  const piDoc: TradeDocumentTemplate = {
    id: `custom-pi-${orderTag}`,
    code: `PT-PI-${refSuffix}`,
    category: 'commercial',
    revision: `Account Issue · ${issueDate}`,
    sha256: deterministicDigest(`PI:${account.uid}:${orderTag}:${totalVal}`),
    stageRef: selectedRfq
      ? `Order ${selectedRfq.referenceId} · Pro-forma Invoice`
      : 'Account Pro-forma Draft',
    issuer: {
      en: 'PetroTechnics Commercial Desk',
      fa: 'میز بازرگانی پتروتکنیکس',
      ar: 'المكتب التجاري لبتروتيكنيكس',
    },
    title: {
      en: `Pro-forma Invoice — ${commodityName}`,
      fa: `پیش‌فاکتور اختصاصی (PI) — ${commodityName}`,
      ar: `فاتورة مبدئية مخصصة (PI) — ${commodityName}`,
    },
    summary: {
      en: `Account-bound Pro-forma Invoice issued for ${account.companyName} covering ${qtyMt.toLocaleString()} MT (${incoterm} ${dischargePort}) in ${currency}.`,
      fa: `پیش‌فاکتور اختصاصی صادرشده برای ${account.companyName} بابت ${qtyMt.toLocaleString()} تن (${incoterm} ${dischargePort}) با ارز ${currency}.`,
      ar: `فاتورة مبدئية مخصصة لشركة ${account.companyName} لكمية ${qtyMt.toLocaleString()} طن متري (${incoterm} ${dischargePort}) بعملة ${currency}.`,
    },
    documentTitleEn: 'PRO-FORMA INVOICE (ACCOUNT COPY)',
    subtitleEn: `Issued to ${account.companyName} · Reference ${orderTag} · Incoterms 2020`,
    metadata: [
      { label: 'Invoice No.', value: `PT-PI-${refSuffix}` },
      { label: 'Issue Date', value: issueDate },
      { label: 'RFQ / Order Ref.', value: orderTag },
      { label: 'Buyer / Consignee', value: consigneeLine },
      { label: 'Buyer Contact', value: `${account.contactName} · ${account.email}` },
      { label: 'Delivery Term', value: `${incoterm} ${dischargePort}` },
      { label: 'Loading Terminal', value: loadPort },
      { label: 'Inspection Agency', value: `${inspection} Load-Port Q&Q Verification` },
    ],
    tableHeaders: [
      'Commodity & Grade',
      'HS Code',
      'Quantity',
      `Unit Price (${currency})`,
      `Total (${currency})`,
    ],
    lineItems: [
      {
        item: `${commodityName} — Grade ${gradeCode}`,
        spec: hsCode,
        quantity: `${qtyMt.toLocaleString()} MT (±5%)`,
        unitPriceOrResult: unitPriceText,
        totalOrMethod: totalText,
      },
      {
        item: `Export Packaging (${packaging}) & ${inspection} Load-Port Certification`,
        spec: `${incoterm} Scope`,
        quantity: '1 Consignment',
        unitPriceOrResult: 'Included',
        totalOrMethod: 'Included',
      },
    ],
    clauses: [
      `Prepared specifically for verified PetroTechnics account ${account.companyName} (${account.clearanceToken}).`,
      `Payment instrument: 100% Irrevocable L/C at Sight or 30% TT deposit / 70% against copy of Clean On-Board B/L.`,
      `Quantity & value tolerance of ±5% at seller option to match vessel/container stowage.`,
      `Quality and weight ascertained at ${loadPort} by ${inspection} shall be final and binding.`,
    ],
    signatory: 'Authorized Commercial Signatory — PetroTechnics International Trading',
  };

  // 2. Account-Customized Full Corporate Offer (FCO)
  const fcoDoc: TradeDocumentTemplate = {
    id: `custom-fco-${orderTag}`,
    code: `PT-FCO-${refSuffix}`,
    category: 'commercial',
    revision: `Account Issue · ${issueDate}`,
    sha256: deterministicDigest(`FCO:${account.uid}:${orderTag}:${gradeCode}`),
    stageRef: selectedRfq
      ? `Order ${selectedRfq.referenceId} · Commercial FCO`
      : 'Account FCO Schedule',
    issuer: {
      en: 'PetroTechnics Trading Desk',
      fa: 'واحد قیمت‌گذاری و فروش پتروتکنیکس',
      ar: 'مكتب التسعير والمبيعات في بتروتيكنيكس',
    },
    title: {
      en: `Full Corporate Offer (FCO) — ${gradeCode}`,
      fa: `پیشنهاد تجاری رسمی (FCO) — ${gradeCode}`,
      ar: `العرض التجاري الرسمي (FCO) — ${gradeCode}`,
    },
    summary: {
      en: `Structured FCO binding sheet aligned to ${account.companyName}, detailing allocation terms, 72-hour validity, and ${incoterm} delivery schedule.`,
      fa: `پیشنهاد تجاری رسمی منطبق بر حساب ${account.companyName} شامل شرایط تخصیص، اعتبار ۷۲ ساعته و برنامه تحویل ${incoterm}.`,
      ar: `عرض تجاري رسمي مرتبط بحساب ${account.companyName} يوضح شروط التخصيص وصلاحية ٧٢ ساعة وجدول التسليم ${incoterm}.`,
    },
    documentTitleEn: 'FULL CORPORATE OFFER (FCO)',
    subtitleEn: `Counterparty Allocation · ${account.companyName} · Validity 72 Business Hours`,
    metadata: [
      { label: 'Offer Reference', value: `PT-FCO-${refSuffix}` },
      { label: 'Linked RFQ', value: orderTag },
      { label: 'Counterparty', value: consigneeLine },
      { label: 'Jurisdiction / Phone', value: `${account.country} · ${account.phone}` },
      { label: 'Product & Grade', value: `${commodityName} (${gradeCode})` },
      { label: 'Delivery Basis', value: `${incoterm} ${dischargePort} from ${loadPort}` },
    ],
    tableHeaders: ['Grade / Spec', 'CAS / HS', 'Volume', `Rate (${currency})`, 'Packaging'],
    lineItems: [
      {
        item: `${commodityName} · ${gradeCode}`,
        spec: `${casNumber} / HS ${hsCode}`,
        quantity: `${qtyMt.toLocaleString()} MT`,
        unitPriceOrResult: unitPriceText,
        totalOrMethod: packaging,
      },
    ],
    clauses: [
      `This FCO reflects inquiry ${orderTag} submitted by ${account.contactName} (${account.email}).`,
      `Countersigned acceptance initiates formal Sales & Purchase Agreement (SPA) and operative banking instructions within 24 hours.`,
      `Independent ${inspection} load-port sampling and manufacturer batch COA are supplied with the shipping set.`,
    ],
    signatory: 'Director of Commodity Exports — PetroTechnics Commercial Desk',
  };

  // 3. Account Shipment Bill of Lading (B/L)
  const blDoc: TradeDocumentTemplate = {
    id: `custom-bl-${orderTag}`,
    code: blRef,
    category: 'shipping',
    revision: `Shipment Record · ${issueDate}`,
    sha256: deterministicDigest(`BL:${account.uid}:${blRef}:${vessel}`),
    stageRef: selectedRfq?.blNumber
      ? `Assigned B/L · ${selectedRfq.blNumber}`
      : 'Shipment B/L Draft',
    issuer: {
      en: 'Maritime Operations & Carrier Agent',
      fa: 'عملیات دریایی و خط کشتیرانی',
      ar: 'العمليات البحرية والخط الملاحي',
    },
    title: {
      en: `Clean On-Board Bill of Lading (${blRef})`,
      fa: `بارنامه دریایی (B/L) — ${blRef}`,
      ar: `بوليصة الشحن البحري النظيفة — ${blRef}`,
    },
    summary: {
      en: `Consignee-specific non-negotiable Bill of Lading copy detailing vessel ${vessel}, port of loading ${loadPort}, and discharge port ${dischargePort}.`,
      fa: `نسخه بارنامه اختصاصی به نام ${account.companyName} با جزئیات شناور ${vessel} و بندر مقصد ${dischargePort}.`,
      ar: `نسخة بوليصة الشحن المخصصة لشركة ${account.companyName} موضحة السفينة ${vessel} وميناء التفريغ ${dischargePort}.`,
    },
    documentTitleEn: 'OCEAN BILL OF LADING — CLIENT PORTAL COPY',
    subtitleEn: `Non-Negotiable Counterparty Copy · ${incoterm} · ETA ${etaLabel}`,
    metadata: [
      { label: 'B/L Reference', value: `${blRef} (3/3 Originals Protocol)` },
      { label: 'Shipper', value: 'PetroTechnics International Trading (petrotechnic.co)' },
      { label: 'Consignee / Notify', value: consigneeLine },
      { label: 'Vessel / Carrier', value: vessel },
      { label: 'Port of Loading', value: loadPort },
      { label: 'Port of Discharge', value: dischargePort },
      { label: 'Estimated Arrival', value: etaLabel },
      { label: 'Order Reference', value: orderTag },
    ],
    tableHeaders: ['Order / Lot', 'Packaging', 'Description of Goods', 'Net Weight', 'Gross Weight'],
    lineItems: [
      {
        item: orderTag,
        spec: packaging,
        quantity: `${commodityName} · Grade ${gradeCode} · HS ${hsCode}`,
        unitPriceOrResult: `${(qtyMt * 1000).toLocaleString()} kg`,
        totalOrMethod: `${Math.round(qtyMt * 1018).toLocaleString()} kg`,
      },
    ],
    clauses: [
      `Shipped on board in apparent good order and condition for consignee ${account.companyName}.`,
      `3/3 Original Clean On-Board Bills of Lading released via L/C bank channel or Telex Release upon final settlement.`,
      `Independent ${inspection} seal integrity and weight verification attached to cargo manifest.`,
    ],
    signatory: 'Master / Carrier Operations Desk — PetroTechnics Maritime Logistics',
  };

  // 4. Inspection Report & Manufacturer Batch COA
  const coaDoc: TradeDocumentTemplate = {
    id: `custom-coa-${orderTag}`,
    code: `COA-${inspection.slice(0, 3).toUpperCase()}-${refSuffix}`,
    category: 'inspection',
    revision: `Quality Dossier · ${issueDate}`,
    sha256: deterministicDigest(`COA:${account.uid}:${orderTag}:${hsCode}`),
    stageRef: `${inspection} Q&Q & Factory COA`,
    issuer: {
      en: `${inspection} & Producing Complex QC Lab`,
      fa: `${inspection} و آزمایشگاه کنترل کیفیت مجتمع`,
      ar: `${inspection} ومختبر الجودة بالمجمع المنتج`,
    },
    title: {
      en: `${inspection} Inspection & Batch COA — ${gradeCode}`,
      fa: `گزارش بازرسی ${inspection} و گواهی آنالیز (COA) — ${gradeCode}`,
      ar: `تقرير فحص ${inspection} وشهادة التحليل (COA) — ${gradeCode}`,
    },
    summary: {
      en: `Technical assay and ${inspection} load-port quality dossier compiled from live specification parameters for ${commodityName} (${gradeCode}).`,
      fa: `پرونده آنالیز فنی و بازرسی ${inspection} مبتنی بر پارامترهای زنده مشخصات فنی ${commodityName} (${gradeCode}).`,
      ar: `ملف التحليل الفني وفحص ${inspection} المعد من المواصفات المخبرية الحية لمنتج ${commodityName} (${gradeCode}).`,
    },
    documentTitleEn: `CERTIFICATE OF ANALYSIS & ${inspection.toUpperCase()} QUALITY DOSSIER`,
    subtitleEn: `Account Counterparty Quality Record · ${commodityName} (${gradeCode})`,
    metadata: [
      { label: 'Dossier Ref.', value: `COA-${inspection.slice(0, 3).toUpperCase()}-${refSuffix}` },
      { label: 'Consignee Account', value: consigneeLine },
      { label: 'Commodity & Grade', value: `${commodityName} · ${gradeCode}` },
      { label: 'CAS / HS Registry', value: `${casNumber} · HS ${hsCode}` },
      { label: 'Allocated Volume', value: `${qtyMt.toLocaleString()} MT` },
      { label: 'Inspection Terminal', value: loadPort },
      { label: 'Surveyor', value: `${inspection} Accredited Load-Port Lab` },
      { label: 'Order Reference', value: orderTag },
    ],
    tableHeaders: ['Test Parameter', 'Contract Spec', 'Target / Assay', 'Unit', 'Test Method'],
    lineItems: productSpecRows,
    clauses: [
      `Composite load-port samples retained in triplicate (Buyer, Seller, Umpire Laboratory) for 90 calendar days.`,
      `Batch conforms to prime virgin export specifications verified under ASTM/ISO methods.`,
      `Final signed wet-stamp original issued immediately upon completion of loading at ${loadPort}.`,
    ],
    signatory: `Quality Control & ${inspection} Marine Survey Desk`,
  };

  // 5. Chamber of Commerce Certificate of Origin (COO)
  const cooDoc: TradeDocumentTemplate = {
    id: `custom-coo-${orderTag}`,
    code: `COO-${refSuffix}`,
    category: 'shipping',
    revision: `Customs Copy · ${issueDate}`,
    sha256: deterministicDigest(`COO:${account.uid}:${orderTag}:${dischargePort}`),
    stageRef: 'Customs & Chamber COO',
    issuer: {
      en: 'Chamber of Commerce & Export Desk',
      fa: 'اتاق بازرگانی و واحد اسناد صادرات',
      ar: 'غرفة التجارة ومكتب مستندات التصدير',
    },
    title: {
      en: `Certificate of Origin (COO) — ${account.companyName}`,
      fa: `گواهی مبدأ گمرکی (COO) — ${account.companyName}`,
      ar: `شهادة المنشأ الجمركية (COO) — ${account.companyName}`,
    },
    summary: {
      en: `Destination customs Certificate of Origin aligned to consignee ${account.companyName}, HS code ${hsCode}, and invoice PT-PI-${refSuffix}.`,
      fa: `گواهی مبدأ برای ترخیص گمرکی به نام ${account.companyName} با کد تعرفه ${hsCode} و شماره فاکتور PT-PI-${refSuffix}.`,
      ar: `شهادة منشأ للتخليص الجمركي مطابقة لبيانات ${account.companyName} ورمز ${hsCode} والفاتورة PT-PI-${refSuffix}.`,
    },
    documentTitleEn: 'CERTIFICATE OF ORIGIN — ACCOUNT SHIPPING COPY',
    subtitleEn: `Aligned for Destination Customs Clearance · ${dischargePort}`,
    metadata: [
      { label: 'Certificate No.', value: `COO-${refSuffix}` },
      { label: 'Exporter', value: 'PetroTechnics International Trading (petrotechnic.co)' },
      { label: 'Consignee', value: consigneeLine },
      { label: 'Destination', value: `${dischargePort} (${account.country})` },
      { label: 'Transport / Vessel', value: `${vessel} · Loading: ${loadPort}` },
      { label: 'Invoice Ref.', value: `PT-PI-${refSuffix}` },
    ],
    tableHeaders: ['Marks & Nos.', 'HS Tariff', 'Goods Description', 'Gross Weight', 'Net Weight'],
    lineItems: [
      {
        item: `${orderTag} / ${account.clearanceToken}`,
        spec: hsCode,
        quantity: `${commodityName} (${gradeCode}) · ${packaging}`,
        unitPriceOrResult: `${Math.round(qtyMt * 1.018).toLocaleString()} MT`,
        totalOrMethod: `${qtyMt.toLocaleString()} MT`,
      },
    ],
    clauses: [
      `Certifies petrochemical origin at designated Persian Gulf coastal producing complex for destination import clearance.`,
      `Embassy / consulate legalization coordinated upon consignee L/C instruction prior to courier dispatch.`,
    ],
    signatory: 'Authorized Chamber Certification Desk · QR Verification Enabled',
  };

  return [piDoc, fcoDoc, blDoc, coaDoc, cooDoc];
}
