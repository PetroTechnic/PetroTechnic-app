export type Locale = 'en' | 'fa' | 'ar';

export type CurrencyCode = 'USD' | 'EUR' | 'AED';

export interface LocalizedText {
  en: string;
  fa: string;
  ar: string;
}

export type ProductCategory = 'polymers' | 'fertilizers' | 'chemicals';

export type Incoterm = 'FOB' | 'CFR' | 'CIF' | 'FCA' | 'CPT' | 'DAP';

export type InspectionAgency = 'SGS' | 'Bureau Veritas' | 'Intertek';

export type AdminRole = 'superadmin' | 'editor' | 'desk_agent' | 'analyst';

export type PermissionKey =
  | 'viewOverview'
  | 'viewProducts'
  | 'editProductsPricing'
  | 'viewRfqs'
  | 'manageRfqs'
  | 'viewMarket'
  | 'editMarket'
  | 'viewDocuments'
  | 'manageDocuments'
  | 'editSettings'
  | 'manageRoles'
  | 'deleteRecords';

export type AdminPermissions = Record<PermissionKey, boolean>;

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  baseTier: AdminRole;
  isSystem: boolean;
  permissions: AdminPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export type RfqStatus =
  | 'received'
  | 'reviewing'
  | 'quoted'
  | 'contracted'
  | 'archived';

export interface ProductGrade {
  code: string;
  application: LocalizedText;
  keyMetric: string;
}

export interface SpecRow {
  parameter: LocalizedText;
  value: string;
  unit: string;
  method: string;
}

export interface Product {
  slug: string;
  category: ProductCategory;
  name: LocalizedText;
  shortName: string;
  formula: string;
  casNumber: string;
  hsCode: string;
  summary: LocalizedText;
  overview: LocalizedText;
  image: string;
  moqMt: number;
  fobUsdMt?: number;
  grades: ProductGrade[];
  specs: SpecRow[];
  applications: LocalizedText[];
  packaging: LocalizedText[];
  loadingPorts: string[];
  inspections: InspectionAgency[];
  featured?: boolean;
  updatedAt?: string;
}

export interface TradeCorridor {
  id: string;
  region: LocalizedText;
  mode: LocalizedText;
  modeCode: 'maritime' | 'caspian' | 'overland' | 'gulf';
  loadingPorts: string[];
  destinations: LocalizedText[];
  transitDays: string;
  commodities: string[];
  summary: LocalizedText;
  originPoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
  curveControl: { x: number; y: number };
  updatedAt?: string;
}

export interface TradeStep {
  stepNumber: string;
  title: LocalizedText;
  summary: LocalizedText;
  buyerAction: LocalizedText;
  petroTechnicsAction: LocalizedText;
  documents: string[];
  timeline: LocalizedText;
}

export interface IncotermItem {
  code: Incoterm;
  name: LocalizedText;
  mode: LocalizedText;
  sellerObligation: LocalizedText;
  riskTransfer: LocalizedText;
}

export interface ExportDocumentItem {
  code: string;
  title: LocalizedText;
  issuer: LocalizedText;
  purpose: LocalizedText;
}

export interface MarketInsight {
  slug: string;
  category: 'fertilizers' | 'polymers' | 'logistics' | 'finance';
  categoryLabel: LocalizedText;
  date: string;
  readTimeMinutes: number;
  title: LocalizedText;
  excerpt: LocalizedText;
  image: string;
  published?: boolean;
  sections: {
    heading: LocalizedText;
    body: LocalizedText;
  }[];
  updatedAt?: string;
}

export interface HistoricalPricePoint {
  id: string;
  month: string;
  sortOrder: number;
  urea: number;
  hdpe: number;
  pp: number;
  methanol: number;
  updatedAt?: string;
}

export interface FaqItem {
  id: string;
  category: 'commercial' | 'logistics' | 'quality' | 'payment';
  question: LocalizedText;
  answer: LocalizedText;
}

export interface RegionalDesk {
  city: LocalizedText;
  role: LocalizedText;
  address: LocalizedText;
  phone: string;
  email: string;
}

export interface PlatformSettings {
  fxRates: Record<CurrencyCode, number>;
  incotermDeltas: Record<Incoterm, number>;
  regionalDesks: RegionalDesk[];
  faqs: FaqItem[];
  updatedAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  roleId: string;
  roleName: string;
  permissions: AdminPermissions;
  status: 'active' | 'disabled';
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentAccessLog {
  token: string;
  company: string;
  email: string;
  status: 'active' | 'revoked';
  verifiedAt?: string;
  updatedAt?: string;
}

export type AuditCategory =
  | 'pricing'
  | 'catalog'
  | 'rfq'
  | 'market'
  | 'documents'
  | 'roles'
  | 'settings'
  | 'system';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditChangeDiff {
  field: string;
  before: string;
  after: string;
}

export interface SystemAuditLog {
  id: string;
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  targetType: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  changes: AuditChangeDiff[];
  actorUid: string;
  actorEmail: string;
  actorName: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: LocalizedText;
  company: string;
  country: LocalizedText;
  quote: LocalizedText;
  metric: LocalizedText;
}

export type OrderFulfillmentStage =
  | 'allocation'
  | 'lc_opened'
  | 'sgs_inspection'
  | 'port_loading'
  | 'in_transit'
  | 'delivered';

export interface BuyerProfile {
  uid: string;
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  country: string;
  preferredPort: string;
  taxOrRegId: string;
  preferredCurrency: CurrencyCode;
  createdAt?: string;
  updatedAt?: string;
}

export interface RfqPayload {
  productSlug: string;
  productName: string;
  grade: string;
  quantityMt: number;
  destination: string;
  incoterm: Incoterm;
  packaging: string;
  inspection: InspectionAgency;
  currency?: CurrencyCode;
  estimatedUnitPrice?: number;
  estimatedTotal?: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  notes?: string;
  buyerUid?: string;
}

export interface RfqRecord extends RfqPayload {
  referenceId: string;
  createdAt: string;
  updatedAt?: string;
  status: RfqStatus;
  deskNotes?: string;
  fulfillmentStage?: OrderFulfillmentStage;
  vesselName?: string;
  blNumber?: string;
  portOfLoading?: string;
  etaDate?: string;
  buyerNotice?: string;
}

export interface RustBackendFile {
  path: string;
  language: 'toml' | 'rust' | 'markdown';
  description: string;
  content: string;
}

export type AppView =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'process'
  | 'markets'
  | 'insights'
  | 'about'
  | 'rfq'
  | 'portal'
  | 'admin';
