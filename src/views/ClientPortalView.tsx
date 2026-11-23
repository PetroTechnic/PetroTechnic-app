import { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Lock,
  LogOut,
  Package,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Ship,
  X,
} from 'lucide-react';
import type {
  AppView,
  CurrencyCode,
  Locale,
  OrderFulfillmentStage,
  Product,
  RfqRecord,
  RfqStatus,
} from '../types/domain';
import {
  renderTemplatePlainText,
  renderTemplatePrintableHtml,
} from '../data/documents';
import { formatMoney } from '../data/currency';
import { usePlatformData } from '../context/PlatformDataContext';
import {
  saveBuyerProfile,
  subscribeBuyerRfqs,
} from '../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../lib/firebase';
import {
  buildAccountCustomDocuments,
  buildBuyerAccountIdentity,
} from '../lib/clientDocumentBuilder';
import { LanguageSwitch } from '../components/LanguageSwitch';

interface ClientPortalViewProps {
  locale: Locale;
  currency: CurrencyCode;
  products: Product[];
  onChangeLocale: (locale: Locale) => void;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onNavigate: (view: AppView) => void;
}

type PortalTab = 'rfqs' | 'orders' | 'documents' | 'profile';

const FULFILLMENT_STAGES: {
  id: OrderFulfillmentStage;
  step: string;
  label: Record<Locale, string>;
}[] = [
  {
    id: 'allocation',
    step: '01',
    label: {
      en: 'Producer Allocation',
      fa: 'تخصیص کارخانه‌ای',
      ar: 'تخصيص المصنع',
    },
  },
  {
    id: 'lc_opened',
    step: '02',
    label: {
      en: 'L/C & Settlement',
      fa: 'گشایش L/C و تسویه',
      ar: 'الاعتماد والتسوية',
    },
  },
  {
    id: 'sgs_inspection',
    step: '03',
    label: {
      en: 'Q&Q Inspection',
      fa: 'بازرسی Q&Q',
      ar: 'فحص الجودة والكمية',
    },
  },
  {
    id: 'port_loading',
    step: '04',
    label: {
      en: 'Port Loading & B/L',
      fa: 'بارگیری و بارنامه',
      ar: 'التحميل والبوليصة',
    },
  },
  {
    id: 'in_transit',
    step: '05',
    label: {
      en: 'Vessel / Transit',
      fa: 'در مسیر حمل',
      ar: 'قيد الشحن',
    },
  },
  {
    id: 'delivered',
    step: '06',
    label: {
      en: 'Discharged',
      fa: 'تحویل در مقصد',
      ar: 'تم التفريغ والتسليم',
    },
  },
];

const RFQ_STATUS_LABELS: Record<
  RfqStatus,
  { label: Record<Locale, string>; colorClass: string }
> = {
  received: {
    label: { en: 'Received', fa: 'ثبت‌شده', ar: 'مستلم' },
    colorClass: 'text-amber-700',
  },
  reviewing: {
    label: { en: 'Under Review', fa: 'در حال بررسی', ar: 'قيد المراجعة' },
    colorClass: 'text-sky-700',
  },
  quoted: {
    label: { en: 'Quoted (FCO)', fa: 'پیشنهاد صادر شد', ar: 'تم التسعير (FCO)' },
    colorClass: 'text-[#0E4D64]',
  },
  contracted: {
    label: { en: 'Contracted', fa: 'قرارداد فعال', ar: 'متعاقد عليه' },
    colorClass: 'text-emerald-700',
  },
  archived: {
    label: { en: 'Archived', fa: 'بایگانی‌شده', ar: 'مؤرشف' },
    colorClass: 'text-[#708294]',
  },
};

const PORTAL_COPY: Record<
  Locale,
  {
    eyebrow: string;
    gateTitle: string;
    gateSubtitle: string;
    gateSignInTitle: string;
    gateSignInDesc: string;
    signInBtn: string;
    signingIn: string;
    submitGuestRfq: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    portalTitle: string;
    newRfqBtn: string;
    signOutBtn: string;
    completeProfileBanner: string;
    completeProfileCta: string;
    kpiTotalRfqs: string;
    kpiActiveOrders: string;
    kpiCommittedVol: string;
    kpiDocsReady: string;
    tabRfqs: string;
    tabOrders: string;
    tabDocuments: string;
    tabProfile: string;
    searchPlaceholder: string;
    noRfqsTitle: string;
    noRfqsDesc: string;
    submitFirstRfq: string;
    noOrdersTitle: string;
    noOrdersDesc: string;
    docsOrderSelect: string;
    docsGeneralOption: string;
    downloadHtml: string;
    downloadTxt: string;
    copyHash: string;
    copiedHash: string;
    profileTitle: string;
    profileSubtitle: string;
    saveProfile: string;
    savingProfile: string;
    profileSaved: string;
    deskNoticeTitle: string;
    openCustomDocs: string;
  }
> = {
  en: {
    eyebrow: 'Registered Buyer Workspace · Verified Counterparty Isolation',
    gateTitle: 'PetroTechnics Client Portal',
    gateSubtitle:
      'Sign in with your verified corporate Google account to track live RFQ status, monitor active vessel and shipment milestones, and download trade documentation customized to your legal entity.',
    gateSignInTitle: 'Counterparty Sign-In',
    gateSignInDesc:
      'Your portal automatically links every RFQ submitted under your verified email address and isolates all order records strictly to your account.',
    signInBtn: 'Sign in with Google Account',
    signingIn: 'Authenticating...',
    submitGuestRfq: 'Submit New Commercial RFQ',
    feature1Title: 'Real-Time RFQ Status Tracking',
    feature1Desc:
      'Follow every inquiry from Desk Receipt and Commercial Review through Formal FCO Quotation and Contract Execution.',
    feature2Title: '6-Stage Active Order Progress',
    feature2Desc:
      'Monitor producer allocation, L/C opening, SGS Q&Q assay, port loading, assigned B/L number, vessel name, and live ETA.',
    feature3Title: 'Account-Customized Trade Documentation',
    feature3Desc:
      'Generate and download bank-ready PI, FCO, Bill of Lading, Batch COA, and Certificate of Origin bound to your entity and active orders.',
    portalTitle: 'Client Operations Portal',
    newRfqBtn: 'New RFQ',
    signOutBtn: 'Sign Out',
    completeProfileBanner:
      'Complete your Corporate Legal Profile (Entity Name, Tax/Reg ID, Discharge Port) so every downloaded PI, FCO, B/L, and COO binds automatically to your registered entity.',
    completeProfileCta: 'Complete Profile',
    kpiTotalRfqs: 'Logged RFQs',
    kpiActiveOrders: 'Quoted & Contracted',
    kpiCommittedVol: 'Active Volume',
    kpiDocsReady: 'Account Docs Ready',
    tabRfqs: 'RFQ Status Tracker',
    tabOrders: 'Active Order Progress',
    tabDocuments: 'Account Trade Documents',
    tabProfile: 'Corporate Profile',
    searchPlaceholder: 'Search reference ID, commodity, grade, port...',
    noRfqsTitle: 'No commercial RFQs linked to this email yet',
    noRfqsDesc:
      'Any quotation request submitted using your signed-in email appears here in real time.',
    submitFirstRfq: 'Submit Commercial RFQ',
    noOrdersTitle: 'No active shipment orders yet',
    noOrdersDesc:
      'Once our commercial desk quotes (FCO) or contracts your RFQ and assigns a fulfillment stage, live 6-stage shipment tracking appears here.',
    docsOrderSelect: 'Bind documents to RFQ / Order',
    docsGeneralOption: 'General Registered Account Profile (No Order Selected)',
    downloadHtml: 'Download Printable Sheet (.html)',
    downloadTxt: 'Download Plain Text (.txt)',
    copyHash: 'Copy SHA-256',
    copiedHash: 'Copied',
    profileTitle: 'Registered Buyer Corporate Profile',
    profileSubtitle:
      'Persisted securely to your account. Auto-fills new RFQs and populates Consignee, Tax/Reg ID, and Discharge Port across your customized trade documents.',
    saveProfile: 'Save Corporate Profile',
    savingProfile: 'Saving...',
    profileSaved: 'Corporate profile saved and synced to your account documents.',
    deskNoticeTitle: 'Commercial Desk Update',
    openCustomDocs: 'Open Customized Docs',
  },
  fa: {
    eyebrow: 'فضای کاری خریداران ثبت‌نام‌شده · تفکیک امن حساب',
    gateTitle: 'پورتال مشتریان پتروتکنیکس',
    gateSubtitle:
      'با حساب تاییدشده گوگل وارد شوید تا وضعیت لحظه‌ای استعلام‌ها (RFQ)، مراحل ۶گانه پیشرفت سفارش و حمل را رصد کرده و اسناد بازرگانی اختصاصی شرکت خود را دانلود کنید.',
    gateSignInTitle: 'ورود خریدار سازمانی',
    gateSignInDesc:
      'پورتال به صورت خودکار تمامی استعلام‌های ثبت‌شده با ایمیل تاییدشده شما را متصل کرده و اطلاعات سفارش شما را کاملاً اختصاصی نمایش می‌دهد.',
    signInBtn: 'ورود با حساب گوگل',
    signingIn: 'در حال احراز هویت...',
    submitGuestRfq: 'ثبت استعلام قیمت جدید',
    feature1Title: 'پیگیری زنده وضعیت استعلام‌ها (RFQ)',
    feature1Desc:
      'مشاهده وضعیت هر استعلام از ثبت اولیه و بررسی فنی تا صدور پیشنهاد رسمی FCO و عقد قرارداد.',
    feature2Title: 'رصد ۶ مرحله‌ای پیشرفت سفارش و حمل',
    feature2Desc:
      'پیگیری تخصیص کارخانه، گشایش L/C، بازرسی SGS، بارگیری بندری، شماره بارنامه، نام کشتی و تاریخ ورود (ETA).',
    feature3Title: 'اسناد بازرگانی اختصاصی حساب شما',
    feature3Desc:
      'تولید و دانلود پیش‌فاکتور (PI)، پیشنهاد رسمی (FCO)، بارنامه، آنالیز COA و گواهی مبدأ با مشخصات رسمی شرکت شما.',
    portalTitle: 'پورتال عملیات مشتریان',
    newRfqBtn: 'ثبت RFQ جدید',
    signOutBtn: 'خروج',
    completeProfileBanner:
      'پروفایل حقوقی شرکت (نام رسمی، شناسه ثبت/مالیاتی و بندر مقصد) را تکمیل کنید تا تمامی اسناد PI، FCO، B/L و COO به نام شرکت شما صادر شود.',
    completeProfileCta: 'تکمیل پروفایل',
    kpiTotalRfqs: 'کل استعلام‌ها',
    kpiActiveOrders: 'پیشنهاد و قرارداد فعال',
    kpiCommittedVol: 'حجم فعال',
    kpiDocsReady: 'اسناد اختصاصی آماده',
    tabRfqs: 'پیگیری استعلام‌ها',
    tabOrders: 'پیشرفت سفارش‌های فعال',
    tabDocuments: 'اسناد بازرگانی اختصاصی',
    tabProfile: 'پروفایل شرکت',
    searchPlaceholder: 'جستجو با کد پیگیری، محصول، گرید یا بندر...',
    noRfqsTitle: 'هنوز استعلامی با این ایمیل ثبت نشده است',
    noRfqsDesc:
      'هر استعلام قیمتی که با ایمیل حساب واردشده ثبت شود بلافاصله در این جدول نمایش داده می‌شود.',
    submitFirstRfq: 'ثبت اولین استعلام قیمت',
    noOrdersTitle: 'هنوز سفارش فعالی در مرحله اجرا نیست',
    noOrdersDesc:
      'به محض صدور پیشنهاد رسمی (FCO) یا عقد قرارداد توسط میز بازرگانی، خط زمان ۶ مرحله‌ای حمل اینجا فعال می‌شود.',
    docsOrderSelect: 'اتصال اسناد به سفارش / استعلام',
    docsGeneralOption: 'پروفایل عمومی حساب (بدون انتخاب سفارش)',
    downloadHtml: 'دانلود نسخه چاپی (.html)',
    downloadTxt: 'دانلود متن ساده (.txt)',
    copyHash: 'کپی SHA-256',
    copiedHash: 'کپی شد',
    profileTitle: 'پروفایل حقوقی خریدار سازمانی',
    profileSubtitle:
      'ذخیره‌شده به‌صورت امن در حساب شما. فرم‌های RFQ را به‌طور خودکار پر کرده و اطلاعات گیرنده را در اسناد بازرگانی درج می‌کند.',
    saveProfile: 'ذخیره پروفایل شرکت',
    savingProfile: 'در حال ذخیره...',
    profileSaved: 'پروفایل شرکت ذخیره و با اسناد اختصاصی شما همگام شد.',
    deskNoticeTitle: 'اطلاعیه میز بازرگانی',
    openCustomDocs: 'مشاهده اسناد اختصاصی',
  },
  ar: {
    eyebrow: 'مساحة عمل المشترين المسجلين · عزل آمن للحسابات',
    gateTitle: 'بوابة عملاء بتروتيكنيكس',
    gateSubtitle:
      'سجّل الدخول بحساب Google الموثّق لتتبع حالة طلبات الأسعار (RFQ) ومراقبة مراحل شحن الطلبات النشطة وتحميل المستندات التجارية المخصصة لشركتك.',
    gateSignInTitle: 'تسجيل دخول المشتري المؤسسي',
    gateSignInDesc:
      'تربط البوابة تلقائياً جميع طلبات الأسعار المسجلة ببريدك الموثّق وتعزل بيانات طلباتك ومستنداتك بشكل كامل لحسابك.',
    signInBtn: 'تسجيل الدخول عبر Google',
    signingIn: 'جارٍ التحقق...',
    submitGuestRfq: 'تقديم طلب عرض سعر جديد',
    feature1Title: 'تتبع مباشر لحالة طلبات الأسعار',
    feature1Desc:
      'تابع كل طلب منذ الاستلام والمراجعة الفنية وحتى إصدار العرض الرسمي (FCO) وتنفيذ العقد.',
    feature2Title: 'تقدم الشحنة عبر ٦ مراحل تنفيذية',
    feature2Desc:
      'راقب تخصيص المصنع وفتح الاعتماد المستندي وفحص SGS والتحميل ورقم بوليصة الشحن واسم السفينة والوصول المتوقع.',
    feature3Title: 'مستندات تجارية مخصصة لحسابك',
    feature3Desc:
      'حمّل الفاتورة المبدئية (PI) والعرض الرسمي (FCO) وبوليصة الشحن وشهادة التحليل والمنشأ باسم شركتك وطلباتك.',
    portalTitle: 'بوابة عمليات العملاء',
    newRfqBtn: 'طلب RFQ جديد',
    signOutBtn: 'تسجيل الخروج',
    completeProfileBanner:
      'أكمل ملف شركتك القانوني (الاسم الرسمي والرقم الضريبي وميناء الوصول) لتخصيص جميع مستندات PI و FCO و B/L و COO تلقائياً.',
    completeProfileCta: 'إكمال الملف',
    kpiTotalRfqs: 'إجمالي الطلبات',
    kpiActiveOrders: 'مسعّرة ومتعاقد عليها',
    kpiCommittedVol: 'الحجم النشط',
    kpiDocsReady: 'مستندات مخصصة جاهزة',
    tabRfqs: 'تتبع طلبات الأسعار',
    tabOrders: 'تقدم الطلبات النشطة',
    tabDocuments: 'المستندات المخصصة',
    tabProfile: 'ملف الشركة',
    searchPlaceholder: 'ابحث بالرقم المرجعي أو المنتج أو الميناء...',
    noRfqsTitle: 'لا توجد طلبات أسعار مرتبطة بهذا البريد بعد',
    noRfqsDesc:
      'أي طلب عرض سعر يتم تقديمه ببريدك المسجل يظهر هنا بشكل فوري ومباشر.',
    submitFirstRfq: 'تقديم أول طلب عرض سعر',
    noOrdersTitle: 'لا توجد طلبات شحن نشطة حالياً',
    noOrdersDesc:
      'بمجرد تسعير طلبك أو التعاقد عليه وتحديث مرحلة التنفيذ من مكتب العمليات، سيظهر مسار الشحن هنا.',
    docsOrderSelect: 'ربط المستندات بطلب / شحنة',
    docsGeneralOption: 'ملف الحساب العام (بدون طلب محدد)',
    downloadHtml: 'تحميل نسخة للطباعة (.html)',
    downloadTxt: 'تحميل نص عادي (.txt)',
    copyHash: 'نسخ SHA-256',
    copiedHash: 'تم النسخ',
    profileTitle: 'ملف المشتري المؤسسي المسجل',
    profileSubtitle:
      'محفوظ بأمان لحسابك. يعبئ نماذج RFQ تلقائياً ويدرج بيانات المستلم والرقم الضريبي في مستنداتك المخصصة.',
    saveProfile: 'حفظ ملف الشركة',
    savingProfile: 'جارٍ الحفظ...',
    profileSaved: 'تم حفظ ملف الشركة ومزامنته مع مستندات حسابك.',
    deskNoticeTitle: 'تحديث مكتب العمليات التجارية',
    openCustomDocs: 'فتح المستندات المخصصة',
  },
};

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ClientPortalView({
  locale,
  currency,
  products,
  onChangeLocale,
  onChangeCurrency,
  onNavigate,
}: ClientPortalViewProps) {
  const copy = PORTAL_COPY[locale];
  const {
    authUser,
    authLoading,
    authError,
    buyerProfile,
    signInWithGoogle,
    signOutUser,
  } = usePlatformData();

  const [activeTab, setActiveTab] = useState<PortalTab>('rfqs');
  const [buyerRfqs, setBuyerRfqs] = useState<RfqRecord[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // RFQ Tracker UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RfqStatus>('all');
  const [inspectedRfq, setInspectedRfq] = useState<RfqRecord | null>(null);

  // Customized Documents state
  const [docRfqId, setDocRfqId] = useState<string>('');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  // Corporate Profile Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [preferredPort, setPreferredPort] = useState('');
  const [taxOrRegId, setTaxOrRegId] = useState('');
  const [preferredCurrency, setPreferredCurrency] =
    useState<CurrencyCode>(currency);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Subscribe live to signed-in buyer's own RFQs in Firestore
  useEffect(() => {
    if (!authUser?.email || !authUser.emailVerified) {
      setBuyerRfqs([]);
      setRfqsLoading(false);
      return;
    }
    setRfqsLoading(true);
    setPortalError(null);
    const unsub = subscribeBuyerRfqs(
      authUser.email,
      (rows) => {
        setBuyerRfqs(rows);
        setRfqsLoading(false);
      },
      (err) => {
        setPortalError(formatFirestoreErrorMessage(err));
        setRfqsLoading(false);
      },
    );
    return () => unsub();
  }, [authUser]);

  // Keep inspected RFQ synced with live Firestore stream
  useEffect(() => {
    if (!inspectedRfq) return;
    const latest = buyerRfqs.find(
      (r) => r.referenceId === inspectedRfq.referenceId,
    );
    if (latest) {
      setInspectedRfq(latest);
    }
  }, [buyerRfqs, inspectedRfq]);

  // Default document binding to the buyer's most recent active RFQ once loaded
  useEffect(() => {
    if (!docRfqId && buyerRfqs.length > 0) {
      const preferred =
        buyerRfqs.find((r) => r.status === 'contracted') ||
        buyerRfqs.find((r) => r.status === 'quoted') ||
        buyerRfqs[0];
      setDocRfqId(preferred.referenceId);
    }
  }, [buyerRfqs, docRfqId]);

  // Hydrate corporate profile editor from Firestore buyerProfile (or authUser/latest RFQ)
  useEffect(() => {
    if (buyerProfile) {
      setCompanyName(buyerProfile.companyName);
      setContactName(buyerProfile.contactName);
      setPhone(buyerProfile.phone);
      setCountry(buyerProfile.country);
      setPreferredPort(buyerProfile.preferredPort);
      setTaxOrRegId(buyerProfile.taxOrRegId);
      setPreferredCurrency(buyerProfile.preferredCurrency);
    } else if (authUser) {
      const latestRfq = buyerRfqs[0];
      setCompanyName((prev) => prev || latestRfq?.companyName || '');
      setContactName(
        (prev) => prev || latestRfq?.contactName || authUser.displayName || '',
      );
      setPhone((prev) => prev || latestRfq?.phone || '');
      setPreferredPort((prev) => prev || latestRfq?.destination || '');
      setPreferredCurrency(currency);
    }
  }, [buyerProfile, authUser, buyerRfqs, currency]);

  const activeOrders = useMemo(
    () =>
      buyerRfqs.filter(
        (r) =>
          r.status === 'contracted' ||
          r.status === 'quoted' ||
          Boolean(r.fulfillmentStage),
      ),
    [buyerRfqs],
  );

  const filteredRfqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return buyerRfqs.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.referenceId.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q)
      );
    });
  }, [buyerRfqs, search, statusFilter]);

  const totalActiveTonnes = useMemo(
    () => activeOrders.reduce((acc, r) => acc + Number(r.quantityMt || 0), 0),
    [activeOrders],
  );

  const accountIdentity = useMemo(() => {
    if (!authUser?.email) return null;
    return buildBuyerAccountIdentity(
      authUser.uid,
      authUser.email,
      authUser.displayName || '',
      buyerProfile,
      buyerRfqs[0] ?? null,
    );
  }, [authUser, buyerProfile, buyerRfqs]);

  const boundRfq = useMemo(
    () => buyerRfqs.find((r) => r.referenceId === docRfqId) ?? null,
    [buyerRfqs, docRfqId],
  );

  const boundProduct = useMemo(() => {
    if (boundRfq) {
      return products.find((p) => p.slug === boundRfq.productSlug) ?? null;
    }
    return products[0] ?? null;
  }, [boundRfq, products]);

  const customDocuments = useMemo(() => {
    if (!accountIdentity) return [];
    return buildAccountCustomDocuments(
      accountIdentity,
      boundRfq,
      boundProduct,
      buyerProfile?.preferredCurrency ?? currency,
    );
  }, [accountIdentity, boundRfq, boundProduct, buyerProfile, currency]);

  const activeDoc = customDocuments[selectedDocIndex] ?? customDocuments[0] ?? null;

  const openDocsForRfq = (referenceId: string) => {
    setDocRfqId(referenceId);
    setSelectedDocIndex(0);
    setInspectedRfq(null);
    setActiveTab('documents');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.email) return;
    setProfileError(null);
    setProfileSavedNotice(false);

    if (
      companyName.trim().length < 2 ||
      contactName.trim().length < 2 ||
      phone.trim().length < 4 ||
      country.trim().length < 2
    ) {
      setProfileError(
        locale === 'fa'
          ? 'لطفاً نام شرکت، نام نماینده، تلفن و کشور را به صورت کامل وارد کنید.'
          : locale === 'ar'
            ? 'يرجى إدخال اسم الشركة واسم المسؤول ورقم الهاتف والدولة بشكل كامل.'
            : 'Please complete Legal Entity Name, Primary Contact, Phone, and Country.',
      );
      return;
    }

    setSavingProfile(true);
    try {
      await saveBuyerProfile(
        {
          uid: authUser.uid,
          email: authUser.email,
          companyName,
          contactName,
          phone,
          country,
          preferredPort,
          taxOrRegId,
          preferredCurrency,
        },
        Boolean(buyerProfile),
      );
      onChangeCurrency(preferredCurrency);
      setProfileSavedNotice(true);
    } catch (err) {
      setProfileError(formatFirestoreErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  // ---------------------------------------------------------------------------
  // State 1: Unauthenticated Sign-In Gate
  // ---------------------------------------------------------------------------
  if (!authUser) {
    return (
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5EBF0]">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#0E4D64]">
              {copy.eyebrow}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0B1520]">
              {copy.gateTitle}
            </h1>
            <p className="text-base text-[#4A5B6C] leading-relaxed">
              {copy.gateSubtitle}
            </p>
          </div>
          <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Institutional Portal Capabilities */}
          <div className="lg:col-span-7 divide-y divide-[#E5EBF0] border-t border-b border-[#E5EBF0]">
            {[
              {
                num: '01.',
                icon: FileCheck2,
                title: copy.feature1Title,
                desc: copy.feature1Desc,
              },
              {
                num: '02.',
                icon: Ship,
                title: copy.feature2Title,
                desc: copy.feature2Desc,
              },
              {
                num: '03.',
                icon: FileText,
                title: copy.feature3Title,
                desc: copy.feature3Desc,
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.num} className="py-6 flex items-start gap-5">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF5F8] text-[#0E4D64] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-data font-semibold text-[#0E4D64]">
                        {feat.num}
                      </span>
                      <h2 className="font-display text-lg font-bold text-[#0B1520]">
                        {feat.title}
                      </h2>
                    </div>
                    <p className="text-sm text-[#4A5B6C] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Authenticated Google Sign-In Card */}
          <div className="lg:col-span-5 rounded-2xl bg-[#061E29] text-white p-7 sm:p-9 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {copy.gateSignInTitle}
                </h2>
                <p className="text-xs text-slate-300">
                  petrotechnic.co · Verified Buyer Access
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {copy.gateSignInDesc}
            </p>

            {authError && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-100">
                {authError}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void signInWithGoogle()}
                className="w-full py-3.5 px-5 text-sm font-semibold text-[#061E29] bg-white hover:bg-sky-50 disabled:opacity-60 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#0E4D64]" />
                <span>{authLoading ? copy.signingIn : copy.signInBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('rfq')}
                className="w-full py-3 px-5 text-xs font-semibold text-slate-200 border border-white/15 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                {copy.submitGuestRfq}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // State 2: Authenticated Registered Buyer Workspace
  // ---------------------------------------------------------------------------
  const watermark = accountIdentity
    ? {
        company: accountIdentity.companyName,
        email: accountIdentity.email,
        token: accountIdentity.clearanceToken,
      }
    : undefined;

  const fieldClasses =
    'w-full px-4 py-2.5 text-sm bg-[#F7F9FB] border border-[#E5EBF0] rounded-xl text-[#0B1520] placeholder:text-[#708294] focus:outline-none focus:border-[#0E4D64] focus:bg-white transition-colors';

  return (
    <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14 space-y-8">
      {/* Top Buyer Identity Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-[#E5EBF0]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-data text-[#0E4D64]">
            <span className="font-semibold">
              {accountIdentity?.clearanceToken}
            </span>
            <span className="text-[#CBD5E1]" aria-hidden="true">
              ·
            </span>
            <span dir="ltr">{authUser.email}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0B1520]">
            {accountIdentity?.companyName || copy.portalTitle}
          </h1>
          <p className="text-sm text-[#4A5B6C]">
            {copy.portalTitle}
            {buyerProfile?.country ? ` · ${buyerProfile.country}` : ''}
            {buyerProfile?.preferredPort
              ? ` · ${buyerProfile.preferredPort}`
              : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitch locale={locale} onChangeLocale={onChangeLocale} />
          <button
            type="button"
            onClick={() => onNavigate('rfq')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{copy.newRfqBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#4A5B6C] border border-[#E5EBF0] hover:text-[#0B1520] hover:border-[#CBD5E1] rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{copy.signOutBtn}</span>
          </button>
        </div>
      </div>

      {/* Corporate Profile Completion Prompt (shown only until profile is saved) */}
      {!buyerProfile && (
        <div className="rounded-2xl bg-[#EDF5F8] border border-[#0E4D64]/20 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-xs text-[#0B1520]">
            <Building2 className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{copy.completeProfileBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E4D64] hover:bg-[#0B1520] rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <span>{copy.completeProfileCta}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
          </button>
        </div>
      )}

      {portalError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {portalError}
        </div>
      )}

      {/* 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: copy.kpiTotalRfqs,
            value: String(buyerRfqs.length),
            sub: rfqsLoading ? 'Syncing...' : 'Firestore live',
          },
          {
            label: copy.kpiActiveOrders,
            value: String(activeOrders.length),
            sub: `${buyerRfqs.filter((r) => r.status === 'contracted').length} contracted`,
          },
          {
            label: copy.kpiCommittedVol,
            value: `${totalActiveTonnes.toLocaleString()} MT`,
            sub: 'Quoted & active lots',
          },
          {
            label: copy.kpiDocsReady,
            value: String(customDocuments.length),
            sub: 'PI · FCO · B/L · COA · COO',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-[#F7F9FB] border border-[#E5EBF0] px-5 py-4 space-y-1"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
              {kpi.label}
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#0B1520] tabular-nums">
              {kpi.value}
            </div>
            <div className="text-[11px] font-mono-data text-[#4A5B6C]">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Portal Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E5EBF0]">
        {(
          [
            { id: 'rfqs', label: copy.tabRfqs, count: buyerRfqs.length },
            { id: 'orders', label: copy.tabOrders, count: activeOrders.length },
            {
              id: 'documents',
              label: copy.tabDocuments,
              count: customDocuments.length,
            },
            { id: 'profile', label: copy.tabProfile },
          ] as { id: PortalTab; label: string; count?: number }[]
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'text-[#0B1520] font-semibold'
                  : 'text-[#4A5B6C] hover:text-[#0B1520]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="ms-1.5 text-xs font-mono-data text-[#708294] tabular-nums">
                  ({tab.count})
                </span>
              )}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0E4D64]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: RFQ STATUS TRACKER                                           */}
      {/* =================================================================== */}
      {activeTab === 'rfqs' && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 border border-[#E5EBF0] rounded-lg bg-white p-1">
              {(
                [
                  'all',
                  'received',
                  'reviewing',
                  'quoted',
                  'contracted',
                  'archived',
                ] as const
              ).map((st) => {
                const count =
                  st === 'all'
                    ? buyerRfqs.length
                    : buyerRfqs.filter((r) => r.status === st).length;
                const label =
                  st === 'all'
                    ? locale === 'fa'
                      ? 'همه'
                      : locale === 'ar'
                        ? 'الكل'
                        : 'All'
                    : RFQ_STATUS_LABELS[st].label[locale];
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#0B1520] text-white'
                        : 'text-[#4A5B6C] hover:text-[#0B1520]'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="ms-1.5 font-mono-data opacity-75 tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#708294] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="ps-9 pe-3.5 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg w-full sm:w-72 text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
              />
            </div>
          </div>

          {buyerRfqs.length === 0 && !rfqsLoading ? (
            <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-12 text-center space-y-4">
              <Package className="w-8 h-8 text-[#0E4D64] mx-auto" />
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="font-display text-lg font-bold text-[#0B1520]">
                  {copy.noRfqsTitle}
                </h2>
                <p className="text-xs text-[#4A5B6C] leading-relaxed">
                  {copy.noRfqsDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('rfq')}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{copy.submitFirstRfq}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                      <th className="py-3 px-4 text-start">Reference</th>
                      <th className="py-3 px-3 text-start">Commodity & Grade</th>
                      <th className="py-3 px-3 text-start">Destination & Term</th>
                      <th className="py-3 px-3 text-end">Volume</th>
                      <th className="py-3 px-3 text-end">Est. Value</th>
                      <th className="py-3 px-3 text-start">Status</th>
                      <th className="py-3 px-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EBF0] text-xs">
                    {filteredRfqs.map((rfq) => {
                      const st =
                        RFQ_STATUS_LABELS[rfq.status] ??
                        RFQ_STATUS_LABELS.received;
                      const curr = rfq.currency ?? 'USD';
                      return (
                        <tr
                          key={rfq.referenceId}
                          onClick={() => setInspectedRfq(rfq)}
                          className="hover:bg-[#F7F9FB] transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div
                              className="font-mono-data font-semibold text-[#0B1520]"
                              dir="ltr"
                            >
                              {rfq.referenceId}
                            </div>
                            <div
                              className="text-[11px] text-[#708294] font-mono-data tabular-nums"
                              dir="ltr"
                            >
                              {new Date(rfq.createdAt).toLocaleDateString(
                                'en-GB',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#0B1520]">
                              {rfq.productName}
                            </div>
                            <div className="text-[11px] text-[#708294]">
                              {rfq.grade} · {rfq.inspection}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-[#0B1520]">
                              {rfq.destination}
                            </div>
                            <div className="text-[11px] font-mono-data text-[#708294]">
                              {rfq.incoterm} · {rfq.packaging}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-end font-mono-data tabular-nums text-[#0B1520]">
                            {rfq.quantityMt.toLocaleString()} MT
                          </td>
                          <td
                            className="py-3 px-3 text-end font-mono-data font-semibold tabular-nums text-[#0B1520]"
                            dir="ltr"
                          >
                            {rfq.estimatedTotal
                              ? formatMoney(rfq.estimatedTotal, curr)
                              : '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 font-semibold ${st.colorClass}`}
                            >
                              {rfq.status === 'contracted' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              <span>{st.label[locale]}</span>
                            </span>
                          </td>
                          <td
                            className="py-3 px-4 text-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectedRfq(rfq)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#0B1520] hover:bg-[#E5EBF0]/70 rounded cursor-pointer"
                              >
                                {locale === 'fa'
                                  ? 'جزئیات'
                                  : locale === 'ar'
                                    ? 'التفاصيل'
                                    : 'Inspect'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDocsForRfq(rfq.referenceId)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#0E4D64] hover:bg-[#0E4D64]/10 rounded cursor-pointer"
                              >
                                {locale === 'fa'
                                  ? 'اسناد'
                                  : locale === 'ar'
                                    ? 'المستندات'
                                    : 'Docs'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ACTIVE ORDER PROGRESS (6-STAGE SHIPMENT MILESTONE TRACKER)   */}
      {/* =================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {activeOrders.length === 0 ? (
            <div className="rounded-2xl bg-[#F7F9FB] border border-[#E5EBF0] p-12 text-center space-y-4">
              <Ship className="w-8 h-8 text-[#0E4D64] mx-auto" />
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h2 className="font-display text-lg font-bold text-[#0B1520]">
                  {copy.noOrdersTitle}
                </h2>
                <p className="text-xs text-[#4A5B6C] leading-relaxed">
                  {copy.noOrdersDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('rfq')}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{copy.newRfqBtn}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeOrders.map((order) => {
                const currentStage: OrderFulfillmentStage =
                  order.fulfillmentStage ??
                  (order.status === 'contracted' ? 'lc_opened' : 'allocation');
                const stageIdx = FULFILLMENT_STAGES.findIndex(
                  (s) => s.id === currentStage,
                );
                const curr = order.currency ?? 'USD';
                const statusMeta =
                  RFQ_STATUS_LABELS[order.status] ?? RFQ_STATUS_LABELS.quoted;

                return (
                  <div
                    key={order.referenceId}
                    className="rounded-2xl bg-white border border-[#E5EBF0] overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="px-6 py-5 bg-[#F7F9FB] border-b border-[#E5EBF0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                          <span
                            className="font-mono-data font-bold text-[#0E4D64]"
                            dir="ltr"
                          >
                            {order.referenceId}
                          </span>
                          <span className="text-[#CBD5E1]" aria-hidden="true">
                            ·
                          </span>
                          <span
                            className={`font-semibold ${statusMeta.colorClass}`}
                          >
                            {statusMeta.label[locale]}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#0B1520]">
                          {order.productName} ({order.grade})
                        </h3>
                        <p className="text-xs text-[#4A5B6C] font-mono-data tabular-nums">
                          {order.quantityMt.toLocaleString()} MT ·{' '}
                          {order.incoterm} {order.destination}
                          {order.estimatedTotal
                            ? ` · ${formatMoney(order.estimatedTotal, curr)}`
                            : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openDocsForRfq(order.referenceId)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer shrink-0 self-start lg:self-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{copy.openCustomDocs}</span>
                      </button>
                    </div>

                    {/* 6-Stage Shipment Progress Rail */}
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {FULFILLMENT_STAGES.map((st, idx) => {
                          const completed = idx < stageIdx;
                          const isCurrent = idx === stageIdx;
                          return (
                            <div
                              key={st.id}
                              className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
                                isCurrent
                                  ? 'bg-[#061E29] border-[#061E29] text-white'
                                  : completed
                                    ? 'bg-[#EDF5F8] border-[#0E4D64]/30 text-[#0B1520]'
                                    : 'bg-[#F7F9FB] border-[#E5EBF0] text-[#708294]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-mono-data">
                                <span
                                  className={
                                    isCurrent
                                      ? 'text-sky-300 font-semibold'
                                      : completed
                                        ? 'text-[#0E4D64] font-semibold'
                                        : 'text-[#708294]'
                                  }
                                >
                                  {st.step}
                                </span>
                                {completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0E4D64]" />
                                ) : isCurrent ? (
                                  <Anchor className="w-3.5 h-3.5 text-sky-300" />
                                ) : null}
                              </div>
                              <div className="text-xs font-semibold leading-snug">
                                {st.label[locale]}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Vessel, Port, B/L & ETA Telemetry Grid */}
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#E5EBF0] text-xs">
                        <div>
                          <dt className="text-[#708294]">Port of Loading</dt>
                          <dd className="font-semibold text-[#0B1520] mt-0.5">
                            {order.portOfLoading || 'Assigned upon Laycan'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#708294]">Vessel / Carrier</dt>
                          <dd className="font-semibold text-[#0B1520] mt-0.5">
                            {order.vesselName || 'Nomination in Progress'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#708294]">B/L Reference</dt>
                          <dd
                            className="font-mono-data font-semibold text-[#0E4D64] mt-0.5"
                            dir="ltr"
                          >
                            {order.blNumber || 'Pending On-Board Issue'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#708294]">Estimated Arrival (ETA)</dt>
                          <dd
                            className="font-mono-data font-semibold text-[#0B1520] tabular-nums mt-0.5"
                            dir="ltr"
                          >
                            {order.etaDate || 'Pending Sailing Schedule'}
                          </dd>
                        </div>
                      </dl>

                      {/* Buyer-Facing Commercial Operations Desk Notice */}
                      {order.buyerNotice && (
                        <div className="rounded-xl bg-[#EDF5F8] border border-[#0E4D64]/20 p-4 space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0E4D64]">
                            {copy.deskNoticeTitle}
                          </div>
                          <p className="text-xs text-[#0B1520] leading-relaxed">
                            {order.buyerNotice}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: ACCOUNT-CUSTOMIZED TRADE DOCUMENTATION                       */}
      {/* =================================================================== */}
      {activeTab === 'documents' && activeDoc && (
        <div className="space-y-6">
          {/* Order Binding Bar */}
          <div className="rounded-xl bg-[#F7F9FB] border border-[#E5EBF0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label
                htmlFor="portal-doc-rfq"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                {copy.docsOrderSelect}
              </label>
              <p className="text-[11px] text-[#708294]">
                {accountIdentity?.companyName} · {accountIdentity?.clearanceToken}
              </p>
            </div>
            <select
              id="portal-doc-rfq"
              value={docRfqId}
              onChange={(e) => setDocRfqId(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium bg-white border border-[#CBD5E1] rounded-lg text-[#0B1520] sm:min-w-[320px] focus:outline-none focus:border-[#0E4D64]"
            >
              <option value="">{copy.docsGeneralOption}</option>
              {buyerRfqs.map((r) => (
                <option key={r.referenceId} value={r.referenceId}>
                  {r.referenceId} — {r.productName} ({r.quantityMt.toLocaleString()} MT · {r.incoterm})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Document Selector List */}
            <div className="lg:col-span-4 space-y-2.5">
              {customDocuments.map((docItem, idx) => {
                const selected = idx === selectedDocIndex;
                return (
                  <button
                    key={docItem.id}
                    type="button"
                    onClick={() => setSelectedDocIndex(idx)}
                    className={`w-full text-start p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      selected
                        ? 'bg-[#061E29] border-[#061E29] text-white'
                        : 'bg-white border-[#E5EBF0] hover:border-[#0E4D64] text-[#0B1520]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono-data">
                      <span
                        className={selected ? 'text-sky-300' : 'text-[#0E4D64]'}
                        dir="ltr"
                      >
                        {docItem.code}
                      </span>
                      <span
                        className={
                          selected ? 'text-slate-300' : 'text-[#708294]'
                        }
                      >
                        {docItem.stageRef}
                      </span>
                    </div>
                    <div className="text-sm font-semibold leading-snug">
                      {docItem.title[locale]}
                    </div>
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        selected ? 'text-slate-300' : 'text-[#4A5B6C]'
                      }`}
                    >
                      {docItem.summary[locale]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Live Account Document Sheet Preview & Downloads */}
            <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E5EBF0] overflow-hidden">
              {/* Action Bar */}
              <div className="px-6 py-4 bg-[#F7F9FB] border-b border-[#E5EBF0] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono-data text-[#4A5B6C]" dir="ltr">
                  <span className="font-semibold text-[#0B1520]">
                    {activeDoc.code}
                  </span>{' '}
                  · {activeDoc.revision}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyHash(activeDoc.sha256)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A5B6C] bg-white border border-[#E5EBF0] hover:border-[#0E4D64] rounded-lg cursor-pointer"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedHash ? copy.copiedHash : copy.copyHash}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        `${activeDoc.code}.txt`,
                        renderTemplatePlainText(activeDoc, watermark),
                        'text/plain;charset=utf-8',
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0B1520] bg-white border border-[#CBD5E1] hover:border-[#0E4D64] rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{copy.downloadTxt}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        `${activeDoc.code}.html`,
                        renderTemplatePrintableHtml(activeDoc, watermark),
                        'text/html;charset=utf-8',
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{copy.downloadHtml}</span>
                  </button>
                </div>
              </div>

              {/* Unredacted Institutional Document Sheet */}
              <div className="p-6 sm:p-8 space-y-6" dir="ltr">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-[#0E4D64]">
                  <div>
                    <div className="font-display text-xl font-bold text-[#0B1520]">
                      PetroTechnics
                    </div>
                    <div className="text-xs text-[#4A5B6C]">
                      International Petrochemical Trading House · petrotechnic.co
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="font-display text-base font-bold text-[#0E4D64]">
                      {activeDoc.documentTitleEn}
                    </div>
                    <div className="text-[11px] text-[#4A5B6C]">
                      {activeDoc.subtitleEn}
                    </div>
                    <div className="text-[10px] font-mono-data text-[#708294] mt-1">
                      SHA-256: {activeDoc.sha256}
                    </div>
                  </div>
                </div>

                {/* Account Watermark Strip */}
                {watermark && (
                  <div className="px-4 py-2.5 rounded-lg bg-[#EDF5F8] border border-[#CBD5E1] text-[11px] font-mono-data text-[#0E4D64]">
                    VERIFIED ACCOUNT COPY · Issued to {watermark.company} (
                    {watermark.email}) · Clearance {watermark.token}
                  </div>
                )}

                {/* Document Metadata Grid */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {activeDoc.metadata.map((m) => (
                    <div
                      key={m.label}
                      className="pb-2 border-b border-[#E5EBF0]"
                    >
                      <dt className="text-[11px] text-[#708294]">{m.label}</dt>
                      <dd className="font-semibold text-[#0B1520] mt-0.5">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Line Items Table */}
                <div className="overflow-x-auto border border-[#E5EBF0] rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F9FB] border-b border-[#E5EBF0] text-[11px] text-[#4A5B6C]">
                        {activeDoc.tableHeaders.map((h) => (
                          <th key={h} className="py-2.5 px-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EBF0]">
                      {activeDoc.lineItems.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="py-2.5 px-3 font-semibold text-[#0B1520]">
                            {row.item}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                            {row.spec}
                          </td>
                          <td className="py-2.5 px-3 text-[#0B1520] tabular-nums">
                            {row.quantity}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data text-[#0B1520] tabular-nums">
                            {row.unitPriceOrResult}
                          </td>
                          <td className="py-2.5 px-3 font-mono-data font-semibold text-[#0B1520] tabular-nums">
                            {row.totalOrMethod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Clauses */}
                <div className="rounded-xl bg-[#F7F9FB] border border-[#E5EBF0] p-4 space-y-2 text-xs text-[#4A5B6C]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0B1520]">
                    Commercial & Compliance Clauses
                  </div>
                  <ol className="list-decimal list-inside space-y-1">
                    {activeDoc.clauses.map((clause, cIdx) => (
                      <li key={cIdx}>{clause}</li>
                    ))}
                  </ol>
                </div>

                <div className="pt-3 border-t border-[#E5EBF0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#708294]">
                  <span>{activeDoc.signatory}</span>
                  <span className="font-mono-data">
                    petrotechnic.co · trade@petrotechnic.co
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: REGISTERED BUYER CORPORATE PROFILE                           */}
      {/* =================================================================== */}
      {activeTab === 'profile' && (
        <form
          onSubmit={(e) => void handleSaveProfile(e)}
          className="max-w-3xl rounded-2xl bg-white border border-[#E5EBF0] p-7 sm:p-9 space-y-6"
        >
          <div className="space-y-1.5 pb-5 border-b border-[#E5EBF0]">
            <h2 className="font-display text-xl font-bold text-[#0B1520]">
              {copy.profileTitle}
            </h2>
            <p className="text-xs text-[#4A5B6C] leading-relaxed">
              {copy.profileSubtitle}
            </p>
          </div>

          {profileError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {profileError}
            </div>
          )}

          {profileSavedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{copy.profileSaved}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="bp-company"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Legal Entity / Company Name *
              </label>
              <input
                id="bp-company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Anatolia Polymer Converters A.Ş."
                className={fieldClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-contact"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Primary Procurement Contact *
              </label>
              <input
                id="bp-contact"
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name & title"
                className={fieldClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-email"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Verified Account Email (Immutable)
              </label>
              <input
                id="bp-email"
                type="email"
                disabled
                dir="ltr"
                value={authUser.email || ''}
                className={`${fieldClasses} opacity-75 font-mono-data`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-phone"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Direct Phone / WhatsApp *
              </label>
              <input
                id="bp-phone"
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 000 0000"
                className={`${fieldClasses} font-mono-data`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-country"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Country of Registration *
              </label>
              <input
                id="bp-country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Türkiye, India, UAE, Kenya"
                className={fieldClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-port"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Preferred Discharge Port / Terminal
              </label>
              <input
                id="bp-port"
                type="text"
                value={preferredPort}
                onChange={(e) => setPreferredPort(e.target.value)}
                placeholder="e.g. Mundra Port, Nhava Sheva, Mersin"
                className={fieldClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-tax"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Commercial Registration / Tax / VAT ID
              </label>
              <input
                id="bp-tax"
                type="text"
                dir="ltr"
                value={taxOrRegId}
                onChange={(e) => setTaxOrRegId(e.target.value)}
                placeholder="e.g. TR-4810293847 / GSTIN"
                className={`${fieldClasses} font-mono-data`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bp-currency"
                className="block text-xs font-semibold text-[#0B1520]"
              >
                Preferred Settlement Currency
              </label>
              <select
                id="bp-currency"
                value={preferredCurrency}
                onChange={(e) =>
                  setPreferredCurrency(e.target.value as CurrencyCode)
                }
                className={`${fieldClasses} font-mono-data`}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] disabled:opacity-50 rounded-full transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {savingProfile ? copy.savingProfile : copy.saveProfile}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* BUYER RFQ SLIDE-OVER INSPECTOR (NEVER EXPOSES INTERNAL deskNotes)   */}
      {/* =================================================================== */}
      {inspectedRfq && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div>
                <div
                  className="text-xs font-mono-data font-semibold text-[#0E4D64]"
                  dir="ltr"
                >
                  {inspectedRfq.referenceId}
                </div>
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  {inspectedRfq.productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRfq(null)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5EBF0]">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Current Status
                  </div>
                  <div
                    className={`mt-1 text-sm font-bold ${
                      (
                        RFQ_STATUS_LABELS[inspectedRfq.status] ??
                        RFQ_STATUS_LABELS.received
                      ).colorClass
                    }`}
                  >
                    {
                      (
                        RFQ_STATUS_LABELS[inspectedRfq.status] ??
                        RFQ_STATUS_LABELS.received
                      ).label[locale]
                    }
                  </div>
                </div>
                <div className="text-end" dir="ltr">
                  <div className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Indicative Value
                  </div>
                  <div className="mt-1 font-display text-xl font-bold text-[#0B1520] tabular-nums">
                    {inspectedRfq.estimatedTotal
                      ? formatMoney(
                          inspectedRfq.estimatedTotal,
                          inspectedRfq.currency ?? 'USD',
                        )
                      : 'Custom FCO'}
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-4 pb-5 border-b border-[#E5EBF0]">
                <div>
                  <dt className="text-[#708294]">Grade</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {inspectedRfq.grade}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Quantity</dt>
                  <dd className="font-mono-data font-semibold text-[#0B1520] tabular-nums mt-0.5">
                    {inspectedRfq.quantityMt.toLocaleString()} MT
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Destination</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {inspectedRfq.destination}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Incoterm / Inspection</dt>
                  <dd className="font-mono-data font-semibold text-[#0B1520] mt-0.5">
                    {inspectedRfq.incoterm} · {inspectedRfq.inspection}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Packaging</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {inspectedRfq.packaging}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Submitted</dt>
                  <dd
                    className="font-mono-data text-[#0B1520] tabular-nums mt-0.5"
                    dir="ltr"
                  >
                    {new Date(inspectedRfq.createdAt).toLocaleDateString(
                      'en-GB',
                    )}
                  </dd>
                </div>
              </dl>

              {inspectedRfq.buyerNotice && (
                <div className="rounded-xl bg-[#EDF5F8] border border-[#0E4D64]/20 p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0E4D64]">
                    {copy.deskNoticeTitle}
                  </div>
                  <p className="text-[#0B1520] leading-relaxed">
                    {inspectedRfq.buyerNotice}
                  </p>
                </div>
              )}

              {inspectedRfq.notes && (
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-[#708294]">
                    Your Submitted Notes
                  </div>
                  <p className="text-[#4A5B6C] bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg p-3 leading-relaxed">
                    {inspectedRfq.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInspectedRfq(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openDocsForRfq(inspectedRfq.referenceId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{copy.openCustomDocs}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
