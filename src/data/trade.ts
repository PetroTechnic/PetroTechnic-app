import type {
  ExportDocumentItem,
  FaqItem,
  IncotermItem,
  MarketInsight,
  Testimonial,
  TradeCorridor,
  TradeStep,
} from '../types/domain';
import { IMG_HERO, IMG_LOGISTICS, IMG_POLYMER, IMG_UREA } from './catalog';

export const TRADE_CORRIDORS: TradeCorridor[] = [
  {
    id: 'south-asia',
    modeCode: 'maritime',
    region: {
      en: 'South Asia Maritime',
      fa: 'مسیر دریایی جنوب آسیا',
      ar: 'الممر البحري لجنوب آسيا',
    },
    mode: {
      en: 'Container & Bulk Vessel',
      fa: 'کانتینری و کشتی فله‌بر',
      ar: 'حاويات وسفن شحن سائب',
    },
    loadingPorts: ['Bandar Abbas', 'Assaluyeh', 'Bandar Imam Khomeini'],
    destinations: [
      { en: 'Nhava Sheva & Mundra (India)', fa: 'ناواشوا و موندرا (هند)', ar: 'نافا شيفا وموندرا (الهند)' },
      { en: 'Karachi & Port Qasim (Pakistan)', fa: 'کراچی و پورت قاسم (پاکستان)', ar: 'كراتشي وميناء قاسم (باكستان)' },
      { en: 'Colombo (Sri Lanka) & Chittagong', fa: 'کلمبو (سریلانکا) و چیتاگونگ', ar: 'كولومبو وشيتاغونغ' },
    ],
    transitDays: '5–11',
    commodities: ['Urea 46% N', 'Granular Sulfur', 'Bitumen 60/70', 'Methanol AA', 'HDPE', 'PP'],
    summary: {
      en: 'High-frequency feeder and Handymax bulk sailings serving Indian subcontinent fertilizer blenders, infrastructure contractors, and plastic converters.',
      fa: 'سرویس‌های منظم کانتینری و فله‌بر هندیمکس برای تامین کارخانه‌های کود، پیمانکاران راهسازی و تولیدکنندگان پلاستیک شبه‌قاره هند.',
      ar: 'رحلات بحرية منتظمة للحاويات والشحن السائب لخدمة مصانع الأسمدة ومقاولي البنية التحتية ومصنعي البلاستيك في جنوب آسيا.',
    },
    originPoint: { x: 565, y: 218 },
    targetPoint: { x: 650, y: 268 },
    curveControl: { x: 615, y: 262 },
  },
  {
    id: 'east-asia',
    modeCode: 'maritime',
    region: {
      en: 'China & East Asia',
      fa: 'چین و شرق آسیا',
      ar: 'الصين وشرق آسيا',
    },
    mode: {
      en: 'Chemical Parcel Tanker & Bulk',
      fa: 'تانکر شیمیایی و کانتینر',
      ar: 'ناقلات كيماويات وشحن بحري',
    },
    loadingPorts: ['Assaluyeh', 'Bandar Abbas', 'Bandar Imam Khomeini'],
    destinations: [
      { en: 'Qingdao, Ningbo & Shanghai (China)', fa: 'چینگدائو، نینگبو و شانگهای (چین)', ar: 'تشينغداو ونينغبو وشنغهاي (الصين)' },
      { en: 'Ho Chi Minh & Haiphong (Vietnam)', fa: 'هوشی‌مین و هایفونگ (ویتنام)', ar: 'هو تشي منه وهايفونغ (فيتنام)' },
      { en: 'Jakarta (Indonesia) & Port Klang', fa: 'جاکارتا (اندونزی) و پورت کلانگ', ar: 'جاكرتا وميناء كلانج' },
    ],
    transitDays: '16–24',
    commodities: ['Methanol AA', 'MEG / DEG', 'HDPE / LDPE', 'Granular Sulfur', 'Ammonia'],
    summary: {
      en: 'Dedicated chemical parcel tankers and 40ft High-Cube polymer allocations feeding East Asian MTO plants, polyester lines, and industrial resin distributors.',
      fa: 'تانکرهای اختصاصی مواد شیمیایی و تخصیص مستمر کانتینرهای پلیمری برای واحدهای MTO، خطوط پلی‌استر و توزیع‌کنندگان رزین شرق آسیا.',
      ar: 'ناقلات كيماويات مخصصة وحاويات بوليمر مستمرة لتزويد مصانع الأوليفينات وخطوط البوليستر وموزعي الراتنجات في شرق آسيا.',
    },
    originPoint: { x: 565, y: 218 },
    targetPoint: { x: 760, y: 212 },
    curveControl: { x: 685, y: 300 },
  },
  {
    id: 'cis-caspian',
    modeCode: 'caspian',
    region: {
      en: 'CIS & Caspian Sea',
      fa: 'کریدور شمال (CIS و دریای خزر)',
      ar: 'رابطة الدول المستقلة وبحر قزوين',
    },
    mode: {
      en: 'Caspian Ro-Ro, Rail & Truck',
      fa: 'دریایی خزر، ریلی و جاده‌ای',
      ar: 'شحن بحر قزوين والسكك الحديدية والشاحنات',
    },
    loadingPorts: ['Amirabad Caspian', 'Bandar Anzali', 'Sarakhs Rail Border'],
    destinations: [
      { en: 'Aktau & Almaty (Kazakhstan)', fa: 'آکتائو و آلماتی (قزاقستان)', ar: 'أكتاو وألماتي (كازاخستان)' },
      { en: 'Tashkent (Uzbekistan) & Ashgabat', fa: 'تاشکند (ازبکستان) و عشق‌آباد', ar: 'طشقند (أوزبكستان) وعشق آباد' },
      { en: 'Baku (Azerbaijan), Yerevan & Tbilisi', fa: 'باکو، ایروان و تفلیس', ar: 'باكو ويريفان وتبليسي' },
    ],
    transitDays: '4–9',
    commodities: ['PP Raffia', 'HDPE / LDPE', 'PVC S65', 'PET Bottle', 'Caustic Soda 98%'],
    summary: {
      en: 'Northern multimodal corridor utilizing Caspian sea vessels, TIR trucking, and Sarakhs/Incheh Borun rail wagons for door-to-border DAP/CPT deliveries.',
      fa: 'کریدور ترکیبی شمال با بهره‌گیری از شناورهای دریای خزر، کامیون‌های TIR و واگن‌های ریلی سرخس برای تحویل مستقیم مرزی DAP و CPT.',
      ar: 'الممر الشمالي متعدد الوسائط عبر سفن بحر قزوين وشاحنات TIR والسكك الحديدية لتسليمات DAP وCPT المباشرة.',
    },
    originPoint: { x: 552, y: 185 },
    targetPoint: { x: 595, y: 132 },
    curveControl: { x: 572, y: 152 },
  },
  {
    id: 'turkey-europe',
    modeCode: 'overland',
    region: {
      en: 'Turkey & Eastern Europe',
      fa: 'کریدور غرب (ترکیه و اروپای شرقی)',
      ar: 'تركيا وأوروبا الشرقية',
    },
    mode: {
      en: 'Direct Overland TIR & Med Feeder',
      fa: 'ترانزیت جاده‌ای TIR و دریایی مدیترانه',
      ar: 'النقل البري TIR والبحري المتوسطي',
    },
    loadingPorts: ['Bazargan / Tabriz Desk', 'Bandar Abbas → Mersin'],
    destinations: [
      { en: 'Istanbul, Izmir & Mersin (Turkey)', fa: 'استانبول، ازمیر و مرسین (ترکیه)', ar: 'إسطنبول وإزمير ومرسين (تركيا)' },
      { en: 'Constanta (Romania) & Varna (Bulgaria)', fa: 'کنستانتا (رومانی) و وارنا (بلغارستان)', ar: 'كونستانتا (رومانيا) وفارنا (بلغاريا)' },
      { en: 'Belgrade & Central Balkan Hubs', fa: 'بلگراد و هاب‌های بالکان', ar: 'بلغراد ومراكز البلقان' },
    ],
    transitDays: '4–12',
    commodities: ['HDPE Film', 'LDPE', 'PP Copolymer', 'PVC', 'PET', 'Urea 46% N'],
    summary: {
      en: 'Fast overland 24 MT TIR truck dispatches through Bazargan border alongside Mersin maritime transshipment for Turkish and Balkan converters.',
      fa: 'اعزام سریع کامیون‌های ۲۴ تنی TIR از مرز بازرگان به همراه ترانشیپ دریایی مرسین برای کارخانه‌های ترکیه و بالکان.',
      ar: 'شحن بري سريع عبر شاحنات TIR بحمولة ٢٤ طن مع الشحن البحري عبر ميناء مرسين لمصنعي تركيا والبلقان.',
    },
    originPoint: { x: 525, y: 185 },
    targetPoint: { x: 458, y: 162 },
    curveControl: { x: 492, y: 162 },
  },
  {
    id: 'gulf-hub',
    modeCode: 'gulf',
    region: {
      en: 'Gulf Re-Export & GCC Hub',
      fa: 'هاب خلیج فارس و شورای همکاری',
      ar: 'مركز إعادة التصدير في الخليج العربي',
    },
    mode: {
      en: 'Cross-Gulf Feeder & Bonded Warehousing',
      fa: 'فیدر خلیج فارس و انبارداری گمرکی',
      ar: 'سفن التغذية الخليجية والمستودعات الجمركية',
    },
    loadingPorts: ['Bandar Abbas', 'Sharjah (Hamriyah)', 'Jebel Ali', 'Sohar'],
    destinations: [
      { en: 'Jebel Ali & Hamriyah Free Zone (UAE)', fa: 'جبل علی و منطقه آزاد حمریا (امارات)', ar: 'جبل علي والمنطقة الحرة بالحمرية (الإمارات)' },
      { en: 'Sohar & Muscat (Oman)', fa: 'صحار و مسقط (عمان)', ar: 'صحار ومسقط (عمان)' },
      { en: 'Umm Qasr (Iraq) & Shuwaikh', fa: 'ام‌قصر (عراق) و شویخ', ar: 'أم قصر (العراق) والشويخ' },
    ],
    transitDays: '2–5',
    commodities: ['Bitumen 60/70', 'Caustic Soda', 'Polymers', 'Urea 46% N', 'MEG / DEG'],
    summary: {
      en: 'Rapid cross-Gulf shuttle consolidation and bonded free-zone warehousing in Sharjah and Oman for flexible mixed-grade dispatch and L/C re-invoicing.',
      fa: 'سرویس‌های سریع خلیج فارس و انبارداری در مناطق آزاد شارجه و عمان جهت ارسال ترکیبی گریدها و تسهیل اسناد اعتباری.',
      ar: 'شحن سريع عبر الخليج وتخزين في المناطق الحرة بالشارقة وعمان لتجميع الدرجات المتنوعة وتسهيل الاعتمادات المستندية.',
    },
    originPoint: { x: 565, y: 218 },
    targetPoint: { x: 548, y: 236 },
    curveControl: { x: 566, y: 234 },
  },
  {
    id: 'africa',
    modeCode: 'maritime',
    region: {
      en: 'East & West Africa',
      fa: 'شرق و غرب آفریقا',
      ar: 'شرق وغرب أفريقيا',
    },
    mode: {
      en: 'Ocean Container & Breakbulk',
      fa: 'کانتینر اقیانوسی و بریک‌بالک',
      ar: 'حاويات محيطية وشحن بضائع مجزأة',
    },
    loadingPorts: ['Bandar Abbas', 'Jebel Ali Hub', 'Assaluyeh'],
    destinations: [
      { en: 'Mombasa (Kenya) & Dar es Salaam', fa: 'مومباسا (کنیا) و دارالسلام (تانزانیا)', ar: 'مومباسا (كينيا) ودار السلام (تنزانيا)' },
      { en: 'Durban (South Africa) & Beira', fa: 'دوربان (آفریقای جنوبی) و بیرا', ar: 'ديربان (جنوب أفريقيا) وبيرا' },
      { en: 'Lagos (Nigeria) & Tema (Ghana)', fa: 'لاگوس (نیجریه) و تما (غنا)', ar: 'لاغوس (نيجيريا) وتيما (غانا)' },
    ],
    transitDays: '14–28',
    commodities: ['Bitumen 60/70', 'Urea 46% N', 'HDPE / LLDPE', 'PVC S65', 'Caustic Soda'],
    summary: {
      en: 'Reliable CIF container and bulk vessel allocations supporting African road infrastructure, agricultural co-operatives, and regional packaging plants.',
      fa: 'تامین مطمئن CIF کانتینری و فله برای پروژه‌های راه‌سازی، تعاونی‌های کشاورزی و کارخانه‌های بسته‌بندی شرق و غرب آفریقا.',
      ar: 'توريد منتظم بنظام CIF للحاويات والسفن السائبة لدعم مشاريع الطرق والتعاونيات الزراعية ومصانع التغليف الأفريقية.',
    },
    originPoint: { x: 565, y: 218 },
    targetPoint: { x: 478, y: 325 },
    curveControl: { x: 552, y: 295 },
  },
  {
    id: 'south-america',
    modeCode: 'maritime',
    region: {
      en: 'South America Bulk',
      fa: 'آمریکای جنوبی (فله دریایی)',
      ar: 'أمريكا الجنوبية (الشحن السائب)',
    },
    mode: {
      en: 'Supramax / Handymax Bulk Charter',
      fa: 'چارتر کشتی فله‌بر سوپرامکس و هندیمکس',
      ar: 'تأجير سفن شحن سائب سوبراماكس وهانديماكس',
    },
    loadingPorts: ['Assaluyeh (Pars Port)', 'Bandar Imam Khomeini'],
    destinations: [
      { en: 'Paranagua & Santos (Brazil)', fa: 'پارانگوا و سانتوس (برزیل)', ar: 'باراناغوا وسانتوس (البرازيل)' },
      { en: 'San Lorenzo (Argentina) & Montevideo', fa: 'سن لورنزو (آرژانتین) و مونته‌ویدئو', ar: 'سان لورينزو (الأرجنتين) ومونتيفيديو' },
      { en: 'Callao (Peru) & Guayaquil', fa: 'کالائو (پرو) و گوایاکیل', ar: 'كالاو (بيرو) وغواياكيل' },
    ],
    transitDays: '30–38',
    commodities: ['Urea 46% Granular', 'Granular Sulfur', 'Methanol AA', 'PET Resin'],
    summary: {
      en: 'Full and part-cargo charter executions for South American agribusiness importers backed by independent draft survey and SGS load-port quality certificates.',
      fa: 'اجرای چارتر کامل و بخشی کشتی برای واردکنندگان بزرگ کشاورزی آمریکای جنوبی با بازرسی درفت‌سروی و گواهی کیفیت SGS در بندر بارگیری.',
      ar: 'تنفيذ شحنات كاملة وجزئية لمستوردي القطاع الزراعي في أمريكا الجنوبية مدعومة بمسح الغاطس وشهادات جودة SGS.',
    },
    originPoint: { x: 565, y: 218 },
    targetPoint: { x: 268, y: 365 },
    curveControl: { x: 410, y: 392 },
  },
];

export const TRADE_STEPS: TradeStep[] = [
  {
    stepNumber: '01',
    title: {
      en: 'Commercial Inquiry / LOI',
      fa: 'ثبت استعلام رسمی یا LOI',
      ar: 'تقديم الاستفسار الرسمي أو LOI',
    },
    summary: {
      en: 'Buyer submits product grade, tonnage, destination port, packaging, and preferred Incoterm.',
      fa: 'خریدار گرید محصول، تناژ، بندر مقصد، نوع بسته‌بندی و اینکوترم مورد نظر را اعلام می‌کند.',
      ar: 'يقدم المشتري درجة المنتج والكمية وميناء الوصول والتغليف والإنكوتيرم المطلوب.',
    },
    buyerAction: {
      en: 'Submit online RFQ or signed Letter of Intent (LOI) with target shipment window and discharge port.',
      fa: 'ارسال فرم استعلام قیمت یا نامه رسمی اعلام نیاز (LOI) شامل زمان تحویل و بندر تخلیه.',
      ar: 'إرسال طلب عرض السعر عبر المنصة أو خطاب النية (LOI) محدداً نافذة الشحن وميناء التفريغ.',
    },
    petroTechnicsAction: {
      en: 'Desk assigns a dedicated commodity trader, verifies plant availability, and validates freight rates.',
      fa: 'تخصیص کارشناس اختصاصی کالا، بررسی موجودی کارخانه و استعلام دقیق نرخ حمل دریایی یا جاده‌ای.',
      ar: 'تخصيص مسؤول مبيعات للسلعة والتحقق من توفر المصنع وتسعير الشحن البحري أو البري.',
    },
    documents: ['RFQ / LOI', 'Company Profile'],
    timeline: { en: 'Within 4–12 hours', fa: 'ظرف ۴ تا ۱۲ ساعت', ar: 'خلال ٤ إلى ١٢ ساعة' },
  },
  {
    stepNumber: '02',
    title: {
      en: 'Full Corporate Offer (FCO)',
      fa: 'صدور پیشنهاد تجاری رسمی (FCO)',
      ar: 'إصدار العرض التجاري الرسمي (FCO)',
    },
    summary: {
      en: 'PetroTechnics issues a binding commercial quotation with technical specs, validity, and delivery schedule.',
      fa: 'صدور پیشنهاد رسمی شامل قیمت دقیق، آنالیز فنی، مهلت اعتبار نرخ و برنامه زمان‌بندی تحویل.',
      ar: 'إصدار عرض تجاري رسمي يتضمن السعر والمواصفات الفنية وفترة الصلاحية وجدول التسليم.',
    },
    buyerAction: {
      en: 'Review grade COA, pricing basis (FOB/CFR/CIF/DAP), payment structure, and issue acceptance.',
      fa: 'بررسی آنالیز گرید، ساختار قیمت (FOB/CFR/CIF/DAP) و شرایط پرداخت و اعلام تایید.',
      ar: 'مراجعة شهادة التحليل وهيكل التسعير وشروط الدفع وإرسال الموافقة.',
    },
    petroTechnicsAction: {
      en: 'Issue formal FCO with typical Technical Data Sheet (TDS), packaging specs, and laycan options.',
      fa: 'ارائه FCO رسمی به همراه دیتاشیت فنی (TDS)، جزئیات بسته‌بندی و بازه بارگیری.',
      ar: 'إصدار العرض الرسمي مع ورقة البيانات الفنية ومواصفات التعبئة ومواعيد التحميل.',
    },
    documents: ['FCO', 'Technical Data Sheet (TDS)', 'Typical COA'],
    timeline: { en: 'Under 24 hours', fa: 'کمتر از ۲۴ ساعت', ar: 'أقل من ٢٤ ساعة' },
  },
  {
    stepNumber: '03',
    title: {
      en: 'Sales Contract & Proforma Invoice',
      fa: 'عقد قرارداد فروش و صدور PI',
      ar: 'توقيع عقد البيع والفاتورة المبدئية (PI)',
    },
    summary: {
      en: 'Both parties execute the Sales & Purchase Agreement (SPA) and countersigned Proforma Invoice.',
      fa: 'امضای قرارداد فروش (SPA) و پیش‌فاکتور رسمی (PI) با قید دقیق شرایط بازرسی و تحویل.',
      ar: 'توقيع عقد البيع والشراء والفاتورة المبدئية متضمنة شروط الفحص والتسليم بدقة.',
    },
    buyerAction: {
      en: 'Countersign SPA/PI and confirm consignee, notify party, and documentary requirements for customs.',
      fa: 'تایید و امضای قرارداد و PI و اعلام مشخصات گیرنده بار و الزامات گمرکی مقصد.',
      ar: 'توقيع العقد والفاتورة وتأكيد بيانات المستلم ومتطلبات التخليص الجمركي.',
    },
    petroTechnicsAction: {
      en: 'Lock plant quota, reserve vessel/container space, and issue countersigned commercial contract.',
      fa: 'تثبیت سهمیه تولید کارخانه، رزرو فضای کشتی یا کانتینر و صدور قرارداد نهایی.',
      ar: 'تثبيت حصة المصنع وحجز مساحة السفينة أو الحاويات وإصدار العقد النهائي.',
    },
    documents: ['Sales Contract (SPA)', 'Proforma Invoice (PI)'],
    timeline: { en: '1–2 business days', fa: '۱ تا ۲ روز کاری', ar: '١ إلى ٢ يوم عمل' },
  },
  {
    stepNumber: '04',
    title: {
      en: 'Payment Instrument (L/C or TT)',
      fa: 'گشایش اعتبار اسنادی (L/C) یا پیش‌پرداخت TT',
      ar: 'إصدار الاعتماد المستندي (L/C) أو الدفعة المقدمة',
    },
    summary: {
      en: 'Buyer opens an Irrevocable L/C at sight or remits agreed TT advance (typically 30%) to activate allocation.',
      fa: 'خریدار اعتبار اسنادی غیرقابل برگشت (L/C) را گشایش کرده یا پیش‌پرداخت توافقی (معمولاً ۳۰٪) را واریز می‌کند.',
      ar: 'يفتح المشتري اعتماداً مستندياً غير قابل للإلغاء أو يحول الدفعة المقدمة المتفق عليها (عادة ٣٠٪).',
    },
    buyerAction: {
      en: 'Submit draft L/C text for review or execute bank TT deposit per Proforma Invoice milestones.',
      fa: 'ارسال پیش‌نویس L/C جهت تایید بانکی یا انجام حواله پیش‌پرداخت مطابق پیش‌فاکتور.',
      ar: 'إرسال مسودة الاعتماد للمراجعة أو تنفيذ التحويل البنكي وفقاً للفاتورة المبدئية.',
    },
    petroTechnicsAction: {
      en: 'Verify documentary credit compliance with trade finance desk and trigger plant lift order.',
      fa: 'تایید انطباق متن اعتبار اسنادی توسط میز مالی و صدور حواله برداشت از مجتمع تولیدی.',
      ar: 'مراجعة مطابقة الاعتماد المستندي مع قسم التمويل التجاري وإصدار أمر السحب من المصنع.',
    },
    documents: ['Irrevocable L/C Draft & SWIFT', 'TT Bank Receipt'],
    timeline: { en: '2–5 business days', fa: '۲ تا ۵ روز کاری', ar: '٢ إلى ٥ أيام عمل' },
  },
  {
    stepNumber: '05',
    title: {
      en: 'Plant Sourcing & Batch Allocation',
      fa: 'تامین از مجتمع و آماده‌سازی محموله',
      ar: 'التوريد من المصنع وتجهيز الدفعة',
    },
    summary: {
      en: 'Cargo is lifted from the petrochemical unit, palletized or bagged per buyer markings, and moved to port terminal.',
      fa: 'بارگیری از مجتمع تولیدی، بسته‌بندی و پالت‌بندی طبق مشخصات خریدار و انتقال به ترمینال بندری.',
      ar: 'سحب البضاعة من المجمع البتروكيماوي وتعبئتها وفق علامات المشتري ونقلها إلى الميناء.',
    },
    buyerAction: {
      en: 'Approve neutral or custom bag markings and confirm nominated third-party inspector.',
      fa: 'تایید طرح چاپ یا بسته‌بندی بدون نشان و تایید شرکت بازرسی مستقل.',
      ar: 'اعتماد علامات التغليف أو التغليف المحايد وتأكيد شركة الفحص المستقلة.',
    },
    petroTechnicsAction: {
      en: 'Coordinate factory quality release, moisture-proof pallet wrapping, and port customs entry.',
      fa: 'هماهنگی کنترل کیفیت کارخانه، شرینک ضد رطوبت پالت‌ها و اظهار صادراتی گمرک بندر.',
      ar: 'تنسيق إفراج الجودة بالمصنع والتغليف المقاوم للرطوبة وإدخال البضاعة للجمارك.',
    },
    documents: ['Factory Batch COA', 'Warehouse Receipt', 'Export Customs Declaration'],
    timeline: { en: '5–10 business days', fa: '۵ تا ۱۰ روز کاری', ar: '٥ إلى ١٠ أيام عمل' },
  },
  {
    stepNumber: '06',
    title: {
      en: 'SGS / Bureau Veritas / Intertek Inspection',
      fa: 'بازرسی مستقل SGS / BV / Intertek',
      ar: 'الفحص المستقل (SGS / BV / Intertek)',
    },
    summary: {
      en: 'Independent surveyors verify net weight, packaging integrity, chemical assay, and container sealing at load port.',
      fa: 'بازرسان مستقل وزن خالص، سلامت بسته‌بندی، آنالیز آزمایشگاهی و پلمب کانتینر را در بندر بارگیری تایید می‌کنند.',
      ar: 'يتحقق المفتشون المستقلون من الوزن الصافي وسلامة التعبئة والتحليل الكيميائي وختم الحاويات في ميناء التحميل.',
    },
    buyerAction: {
      en: 'Receive live inspection photos, container seal numbers, and laboratory quality/quantity report.',
      fa: 'دریافت گزارش تصویری بازرسی، شماره پلمب کانتینرها و گواهی کیفیت و کمیت آزمایشگاهی.',
      ar: 'استلام صور الفحص وأرقام أختام الحاويات وتقرير الجودة والكمية المخبري.',
    },
    petroTechnicsAction: {
      en: 'Facilitate unrestricted terminal sampling, draft survey for bulk vessels, and seal verification.',
      fa: 'تسهیل نمونه‌برداری کامل در ترمینال، درفت‌سروی کشتی‌های فله و تایید پلمب نهایی.',
      ar: 'تسهيل أخذ العينات في المحطة ومسح الغاطس للسفن السائبة وتوثيق الأختام.',
    },
    documents: ['SGS / BV / Intertek Q&Q Certificate', 'Stuffing & Seal Report'],
    timeline: { en: '1–3 business days', fa: '۱ تا ۳ روز کاری', ar: '١ إلى ٣ أيام عمل' },
  },
  {
    stepNumber: '07',
    title: {
      en: 'Port Loading & Vessel Dispatch',
      fa: 'بارگیری روی کشتی و اعزام محموله',
      ar: 'التحميل على السفينة وإبحار الشحنة',
    },
    summary: {
      en: 'Cargo is loaded onboard the nominated vessel or TIR fleet; Bill of Lading / CMR and vessel tracking are issued.',
      fa: 'بارگیری روی کشتی یا ناوگان جاده‌ای TIR انجام شده و بارنامه دریایی (B/L) یا CMR صادر می‌شود.',
      ar: 'تحميل البضاعة على السفينة أو شاحنات TIR وإصدار بوليصة الشحن البحرية وتتبع الرحلة.',
    },
    buyerAction: {
      en: 'Approve draft Bill of Lading (B/L) within 24 hours to guarantee error-free destination clearance.',
      fa: 'تایید پیش‌نویس بارنامه (Draft B/L) ظرف ۲۴ ساعت جهت ترخیص بی‌نقص در بندر مقصد.',
      ar: 'اعتماد مسودة بوليصة الشحن خلال ٢٤ ساعة لضمان تخليص سلس في ميناء الوصول.',
    },
    petroTechnicsAction: {
      en: 'Complete terminal loading, secure clean On-Board B/L, and share real-time ETA milestone updates.',
      fa: 'اتمام بارگیری بندری، اخذ بارنامه تمیز (Clean On-Board B/L) و ارائه گزارش زمان تقریبی رسیدن (ETA).',
      ar: 'إتمام التحميل وإصدار بوليصة شحن نظيفة ومشاركة تحديثات موعد الوصول المتوقع.',
    },
    documents: ['Clean On-Board Bill of Lading (B/L)', 'CMR (Overland)', 'Marine Insurance (CIF)'],
    timeline: { en: '2–4 business days', fa: '۲ تا ۴ روز کاری', ar: '٢ إلى ٤ أيام عمل' },
  },
  {
    stepNumber: '08',
    title: {
      en: 'Final Shipping Docs & Settlement',
      fa: 'تحویل اسناد نهایی حمل و تسویه',
      ar: 'تسليم مستندات الشحن النهائية والتسوية',
    },
    summary: {
      en: 'Complete legalized document set is presented via bank/courier or Telex Release upon balance settlement.',
      fa: 'مجموعه کامل اسناد حمل پس از تسویه مانده حساب، از طریق بانک، کوریر بین‌المللی یا تلکس ریلیز تحویل می‌شود.',
      ar: 'تسليم مجموعة المستندات الكاملة عبر البنك أو البريد السريع أو الإفراج التلكسي فور سداد الرصيد.',
    },
    buyerAction: {
      en: 'Settle balance against scanned B/L & SGS certificates or honor L/C bank presentation.',
      fa: 'تسویه مانده حساب در برابر اسکن بارنامه و گواهی SGS یا تسویه اسنادی بانکی.',
      ar: 'سداد الرصيد مقابل نسخة بوليصة الشحن وشهادات SGS أو تسوية الاعتماد عبر البنك.',
    },
    petroTechnicsAction: {
      en: 'Dispatch original B/L, Chamber of Commerce COO, COA, Invoice & Packing List (or execute Telex Release).',
      fa: 'ارسال اصل بارنامه، گواهی مبدأ اتاق بازرگانی، COA، فاکتور و لیست عدل‌بندی یا صدور تلکس ریلیز فوری.',
      ar: 'إرسال أصل بوليصة الشحن وشهادة المنشأ وشهادة التحليل والفاتورة وقائمة التعبئة أو إصدار إفراج تلكسي.',
    },
    documents: ['3/3 Original B/L or Telex Release', 'Certificate of Origin (COO)', 'Commercial Invoice', 'Packing List'],
    timeline: { en: 'Within 48 hours of sailing', fa: 'ظرف ۴۸ ساعت پس از حرکت کشتی', ar: 'خلال ٤٨ ساعة من الإبحار' },
  },
];

export const INCOTERMS_LIST: IncotermItem[] = [
  {
    code: 'FOB',
    name: { en: 'Free On Board', fa: 'تحویل روی عرشه کشتی (FOB)', ar: 'التسليم على ظهر السفينة (FOB)' },
    mode: { en: 'Maritime Bulk & Container', fa: 'حمل دریایی فله و کانتینر', ar: 'شحن بحري سائب وحاويات' },
    sellerObligation: {
      en: 'Export clearance, port handling, SGS load-port inspection, and loading onboard buyer-nominated vessel.',
      fa: 'ترخیص صادراتی، هزینه‌های بندری، بازرسی SGS و بارگیری روی کشتی معرفی‌شده توسط خریدار.',
      ar: 'التخليص التصديري ومناولة الميناء وفحص SGS والتحميل على سفينة المشتري.',
    },
    riskTransfer: {
      en: 'When cargo is placed onboard vessel at load port.',
      fa: 'به محض قرارگیری کالا روی عرشه کشتی در بندر مبدأ.',
      ar: 'عند وضع البضاعة على متن السفينة في ميناء التحميل.',
    },
  },
  {
    code: 'CFR',
    name: { en: 'Cost and Freight', fa: 'قیمت کالا و کرایه حمل دریایی (CFR)', ar: 'التكلفة والشحن البحري (CFR)' },
    mode: { en: 'Maritime Bulk & Container', fa: 'حمل دریایی فله و کانتینر', ar: 'شحن بحري سائب وحاويات' },
    sellerObligation: {
      en: 'All FOB obligations plus main ocean freight paid to the named destination port.',
      fa: 'تمام تعهدات FOB به اضافه پرداخت کرایه حمل دریایی تا بندر مقصد توافق‌شده.',
      ar: 'جميع التزامات FOB بالإضافة إلى دفع أجور الشحن البحري حتى ميناء الوصول.',
    },
    riskTransfer: {
      en: 'Onboard vessel at load port; freight paid to destination.',
      fa: 'روی کشتی در بندر مبدأ؛ کرایه حمل تا مقصد بر عهده فروشنده.',
      ar: 'على متن السفينة في ميناء التحميل مع دفع الشحن حتى الوجهة.',
    },
  },
  {
    code: 'CIF',
    name: { en: 'Cost, Insurance & Freight', fa: 'قیمت کالا، بیمه و کرایه حمل (CIF)', ar: 'التكلفة والتأمين والشحن (CIF)' },
    mode: { en: 'Maritime Bulk & Container', fa: 'حمل دریایی فله و کانتینر', ar: 'شحن بحري سائب وحاويات' },
    sellerObligation: {
      en: 'All CFR obligations plus marine cargo insurance (Institute Cargo Clauses A/C) to destination port.',
      fa: 'تمام تعهدات CFR به اضافه بیمه‌نامه باربری دریایی تا بندر تخلیه.',
      ar: 'جميع التزامات CFR بالإضافة إلى التأمين البحري على البضاعة حتى ميناء التفريغ.',
    },
    riskTransfer: {
      en: 'Onboard vessel at load port with marine policy assigned to buyer.',
      fa: 'روی کشتی در بندر مبدأ همراه با واگذاری بیمه‌نامه به خریدار.',
      ar: 'على متن السفينة مع تحويل وثيقة التأمين لصالح المشتري.',
    },
  },
  {
    code: 'FCA',
    name: { en: 'Free Carrier', fa: 'تحویل به حمل‌کننده در مبدأ (FCA)', ar: 'التسليم للناقل (FCA)' },
    mode: { en: 'Multimodal / Overland / Rail', fa: 'ترکیبی، جاده‌ای و ریلی', ar: 'متعدد الوسائط / بري / سكك حديدية' },
    sellerObligation: {
      en: 'Export clearance and delivery onto buyer-nominated TIR truck, rail wagon, or terminal carrier.',
      fa: 'ترخیص صادراتی و تحویل کالا روی کامیون TIR یا واگن ریلی معرفی‌شده توسط خریدار.',
      ar: 'التخليص التصديري وتسليم البضاعة إلى الناقل المحدد من قبل المشتري.',
    },
    riskTransfer: {
      en: 'Upon handover to first carrier at named plant or terminal.',
      fa: 'در لحظه تحویل به اولین حمل‌کننده در کارخانه یا ترمینال توافق‌شده.',
      ar: 'عند التسليم للناقل الأول في المصنع أو المحطة المتفق عليها.',
    },
  },
  {
    code: 'CPT',
    name: { en: 'Carriage Paid To', fa: 'کرایه حمل پرداخت‌شده تا مقصد (CPT)', ar: 'أجور النقل مدفوعة حتى الوجهة (CPT)' },
    mode: { en: 'Overland TIR & CIS Rail', fa: 'حمل جاده‌ای TIR و ریلی CIS', ar: 'النقل البري TIR والسكك الحديدية' },
    sellerObligation: {
      en: 'Export clearance and overland/rail carriage paid to named border or inland customs terminal.',
      fa: 'ترخیص صادراتی و پرداخت کرایه حمل جاده‌ای یا ریلی تا گمرک مرزی یا مقصد داخلی.',
      ar: 'التخليص التصديري ودفع أجور النقل البري أو السككي حتى المحطة الجمركية المتفق عليها.',
    },
    riskTransfer: {
      en: 'When goods are handed over to first carrier.',
      fa: 'در زمان تحویل کالا به حمل‌کننده اول.',
      ar: 'عند تسليم البضاعة إلى الناقل الأول.',
    },
  },
  {
    code: 'DAP',
    name: { en: 'Delivered at Place', fa: 'تحویل در محل مقصد (DAP)', ar: 'التسليم في المكان المتفق عليه (DAP)' },
    mode: { en: 'Overland Turkey / CIS / Iraq', fa: 'زمینی ترکیه، CIS و عراق', ar: 'الشحن البري إلى تركيا وCIS والعراق' },
    sellerObligation: {
      en: 'Full transport and transit risk up to buyer named border terminal or warehouse, ready for unloading.',
      fa: 'حمل کامل و پذیرش ریسک مسیر تا مرز یا انبار مقصد خریدار (آماده تخلیه، بدون عوارض واردات).',
      ar: 'النقل الكامل وتحمل مخاطر الطريق حتى نقطة الوصول المتفق عليها جاهزة للتفريغ.',
    },
    riskTransfer: {
      en: 'Upon arrival at buyer named destination before import customs.',
      fa: 'پس از رسیدن محموله به مقصد تعیین‌شده قبل از ترخیص واردات.',
      ar: 'عند وصول الشحنة إلى الوجهة المحددة قبل التخليص الاستيرادي.',
    },
  },
];

export const EXPORT_DOCUMENTS: ExportDocumentItem[] = [
  {
    code: 'B/L · CMR',
    title: { en: 'Clean On-Board Bill of Lading / CMR', fa: 'بارنامه دریایی (B/L) یا جاده‌ای (CMR)', ar: 'بوليصة الشحن البحري (B/L) أو البري (CMR)' },
    issuer: { en: 'Ocean Carrier / Licensed TIR Forwarder', fa: 'خط کشتیرانی یا شرکت حمل بین‌المللی', ar: 'الخط الملاحي أو شركة الشحن الدولية' },
    purpose: {
      en: 'Document of title confirming clean loading, container/hold numbers, gross/net weight, and freight status.',
      fa: 'سند مالکیت کالا، تایید بارگیری سالم، شماره کانتینر و پلمب، وزن و وضعیت کرایه حمل.',
      ar: 'سند ملكية البضاعة وتأكيد التحميل السليم وأرقام الحاويات والوزن وحالة الشحن.',
    },
  },
  {
    code: 'COO',
    title: { en: 'Certificate of Origin', fa: 'گواهی مبدأ اتاق بازرگانی (COO)', ar: 'شهادة المنشأ (COO)' },
    issuer: { en: 'Chamber of Commerce', fa: 'اتاق بازرگانی و صنایع', ar: 'غرفة التجارة والصناعة' },
    purpose: {
      en: 'Certifies manufacturing country of origin for destination import customs clearance and preferential duties.',
      fa: 'تایید رسمی کشور تولیدکننده کالا جهت ترخیص در گمرک مقصد و بهره‌مندی از تعرفه‌های قانونی.',
      ar: 'توثيق بلد المنشأ للتخليص الجمركي في ميناء الوصول والاستفادة من التعريفات التفضيلية.',
    },
  },
  {
    code: 'SGS · BV',
    title: { en: 'Third-Party Q&Q Inspection Certificate', fa: 'گواهی بازرسی کیفیت و کمیت (SGS / BV / Intertek)', ar: 'شهادة الفحص المستقل للجودة والكمية' },
    issuer: { en: 'SGS, Bureau Veritas, or Intertek', fa: 'SGS، بورو وریتاس یا اینترتک', ar: 'SGS أو بيرو فيريتاس أو إنترتك' },
    purpose: {
      en: 'Independent load-port laboratory verification of purity, MFI, moisture, net weight, and vessel draft survey.',
      fa: 'تایید آزمایشگاهی مستقل خلوص، MFI، رطوبت، وزن خالص و درفت‌سروی کشتی در بندر بارگیری.',
      ar: 'تحقق مخبري مستقل في ميناء التحميل من النقاء والرطوبة والوزن الصافي ومسح غاطس السفينة.',
    },
  },
  {
    code: 'COA',
    title: { en: 'Manufacturer Certificate of Analysis', fa: 'گواهی آنالیز آزمایشگاهی کارخانه (COA)', ar: 'شهادة التحليل المخبري من المصنع (COA)' },
    issuer: { en: 'Producing Petrochemical Complex', fa: 'آزمایشگاه کنترل کیفیت مجتمع پتروشیمی', ar: 'مختبر الجودة بالمجمع البتروكيماوي' },
    purpose: {
      en: 'Batch-specific ASTM/ISO test results guaranteeing conformity with contracted grade specifications.',
      fa: 'گزارش آزمون‌های ASTM/ISO مخصوص هر بچ تولید جهت تضمین انطباق دقیق با گرید قراردادی.',
      ar: 'نتائج اختبارات ASTM/ISO الخاصة بكل دفعة إنتاج لضمان مطابقة الدرجة المتعاقد عليها.',
    },
  },
  {
    code: 'CI · PL',
    title: { en: 'Commercial Invoice & Packing List', fa: 'فاکتور تجاری و لیست عدل‌بندی (CI & PL)', ar: 'الفاتورة التجارية وقائمة التعبئة' },
    issuer: { en: 'PetroTechnics Trading Desk', fa: 'واحد بازرگانی پتروتکنیکس', ar: 'المكتب التجاري لبتروتيكنيكس' },
    purpose: {
      en: 'Itemized HS code, unit value, Incoterm breakdown, bag/pallet count, and net/gross tonnage.',
      fa: 'درج کد تعرفه HS، ارزش واحد، شرح اینکوترم، تعداد کیسه یا پالت و وزن خالص و ناخالص.',
      ar: 'تفاصيل رمز النظام المنسق HS والقيمة والإنكوتيرم وعدد الأكياس والطبليات والوزن الصافي والإجمالي.',
    },
  },
  {
    code: 'MSDS',
    title: { en: 'Material Safety Data Sheet & IMDG Docs', fa: 'برگه اطلاعات ایمنی (MSDS) و اسناد IMDG', ar: 'صحيفة بيانات السلامة (MSDS) ووثائق IMDG' },
    issuer: { en: 'HSE & Regulatory Compliance', fa: 'واحد ایمنی و انطباق مقرراتی', ar: 'قسم السلامة والامتثال التنظيمي' },
    purpose: {
      en: 'Mandatory handling, storage, and maritime hazardous cargo compliance for methanol, ammonia, sulfur, and NaOH.',
      fa: 'الزامات ایمنی جابه‌جایی، انبارداری و حمل دریایی کالاهای شیمیایی برای متانول، آمونیاک، گوگرد و سود پرک.',
      ar: 'متطلبات المناولة والتخزين والشحن البحري الآمن للميثانول والأمونيا والكبريت والصودا الكاوية.',
    },
  },
];

export const MARKET_INSIGHTS: MarketInsight[] = [
  {
    slug: 'urea-global-supply-q4-outlook',
    category: 'fertilizers',
    categoryLabel: { en: 'Fertilizers', fa: 'بازار کود', ar: 'سوق الأسمدة' },
    date: '2026-11-12',
    readTimeMinutes: 5,
    image: IMG_UREA,
    title: {
      en: 'Persian Gulf Granular Urea 46% Export Dynamics Ahead of South Asian & Brazilian Tenders',
      fa: 'چشم‌انداز صادرات اوره گرانول ۴۶٪ خلیج فارس در آستانه مناقصه‌های جنوب آسیا و برزیل',
      ar: 'ديناميكيات تصدير اليوريا المحببة ٤٦٪ من الخليج العربي قبيل مناقصات جنوب آسيا والبرازيل',
    },
    excerpt: {
      en: 'How seasonal Indian RCF/IPL procurement tenders and Brazilian safrinha planting windows shape FOB Middle East urea netbacks and Handymax charter rates.',
      fa: 'تحلیل تاثیر مناقصه‌های فصلی هند و فصل کشت دوم برزیل بر قیمت‌های FOB خاورمیانه و نرخ چارتر کشتی‌های فله‌بر.',
      ar: 'كيف تؤثر المناقصات الهندية الموسمية ومواسم الزراعة البرازيلية على أسعار FOB الشرق الأوسط وتكاليف استئجار السفن.',
    },
    sections: [
      {
        heading: { en: 'Regional Demand Anchors', fa: 'محرک‌های تقاضای منطقه‌ای', ar: 'محركات الطلب الإقليمي' },
        body: {
          en: 'Import demand across India, Brazil, and East Africa continues to anchor Persian Gulf granular urea off-take. Buyers prioritizing low-biuret (<1.0%) and consistent 2–4 mm granulometry are locking multi-shipment term contracts 45 days ahead of peak planting windows to hedge spot freight volatility.',
          fa: 'تقاضای واردات در هند، برزیل و شرق آفریقا همچنان ستون اصلی صادرات اوره گرانول خلیج فارس است. خریدارانی که به دنبال بیورت کمتر از ۱٪ و دانه‌بندی یکنواخت ۲ تا ۴ میلی‌متر هستند، قراردادهای چندمحموله‌ای خود را ۴۵ روز پیش از اوج فصل کشت تثبیت می‌کنند.',
          ar: 'يواصل الطلب الاستيرادي في الهند والبرازيل وشرق أفريقيا قيادة صادرات اليوريا المحببة من الخليج العربي، مع توجه المشترين لعقود متعددة الشحنات قبل ذروة المواسم الزراعية بـ ٤٥ يوماً.',
        },
      },
      {
        heading: { en: 'Execution & Port Load-Rate Considerations', fa: 'نکات اجرایی و سرعت بارگیری بندری', ar: 'اعتبارات التنفيذ ومعدل التحميل المينائي' },
        body: {
          en: 'At deep-water coastal terminals, high-capacity conveyor shiploaders enable 7,000–10,000 MT/day loading rates for bulk vessels. Coordinating SGS draft survey and moisture certification prior to hatch closing eliminates discharge disputes at Paranagua and Mundra.',
          fa: 'در ترمینال‌های ساحلی آب‌های عمیق، نوار نقاله‌های پرظرفیت امکان بارگیری ۷ تا ۱۰ هزار تن در روز را فراهم می‌کنند. هماهنگی بازرسی SGS و تایید رطوبت پیش از بستن انبار کشتی، ریسک اختلافات بندر تخلیه را حذف می‌کند.',
          ar: 'في المحطات البحرية العميقة، تتيح السيور عالية القدرة تحميل ٧ إلى ١٠ آلاف طن يومياً مع توثيق فحص SGS ومسح الغاطس قبل إغلاق العنابر.',
        },
      },
    ],
  },
  {
    slug: 'polyolefin-grades-turkey-cis-corridor',
    category: 'polymers',
    categoryLabel: { en: 'Polymers', fa: 'پلیمرها', ar: 'البوليمرات' },
    date: '2026-11-04',
    readTimeMinutes: 4,
    image: IMG_POLYMER,
    title: {
      en: 'Optimizing HDPE Film & PP Raffia Procurement Across Overland Turkey and CIS Corridors',
      fa: 'بهینه‌سازی تامین HDPE فیلم و PP رافیا در کریدورهای زمینی ترکیه و کشورهای CIS',
      ar: 'تحسين توريد درجات HDPE للأفلام وPP للرافيا عبر ممرات تركيا ورابطة الدول المستقلة',
    },
    excerpt: {
      en: 'Why regional converters are shifting from 30-day ocean lead times to 6-day DAP/CPT TIR truck deliveries for inventory agility.',
      fa: 'چرا کارخانه‌های تبدیلی منطقه برای چابکی موجودی، از حمل دریایی ۳۰ روزه به تحویل ۶ روزه جاده‌ای DAP و CPT روی آورده‌اند.',
      ar: 'لماذا يتجه المصنعون الإقليميون من الشحن البحري الطويل إلى التسليم البري السريع خلال ٦ أيام لتعزيز مرونة المخزون.',
    },
    sections: [
      {
        heading: { en: 'Working Capital Advantage of Overland Dispatch', fa: 'مزیت سرمایه در گردش در ارسال زمینی', ar: 'ميزة رأس المال العامل في الشحن البري' },
        body: {
          en: 'For plastic converters in Istanbul, Gaziantep, Tashkent, and Almaty, carrying 45 days of polymer buffer inventory strains working capital. Direct 24.75 MT palletized truck dispatches through Bazargan and Caspian multimodal gateways cut lead times to under one week while preserving factory-sealed batch traceability.',
          fa: 'برای واحدهای تولیدی در استانبول، غازی‌عنتاب، تاشکند و آلماتی، نگهداری ۴۵ روز موجودی احتیاطی فشار سنگینی به سرمایه در گردش وارد می‌کند. ارسال مستقیم کامیون‌های ۲۴.۷۵ تنی پالت‌بندی‌شده از مرز بازرگان و مسیرهای خزر زمان تامین را به کمتر از یک هفته کاهش می‌دهد.',
          ar: 'يخفف الشحن البري المباشر بحمولة ٢٤.٧٥ طن للطبليات المغلفة عبر معبر بازركان وممر قزوين من أعباء المخزون ويقلص زمن التوريد إلى أقل من أسبوع.',
        },
      },
    ],
  },
  {
    slug: 'sgs-inspection-lc-compliance-guide',
    category: 'finance',
    categoryLabel: { en: 'Trade Finance', fa: 'مالی و بازرسی', ar: 'التمويل التجاري' },
    date: '2026-10-24',
    readTimeMinutes: 6,
    image: IMG_HERO,
    title: {
      en: 'Structuring Clean L/C Documentary Clauses with SGS & Bureau Veritas Load-Port Verification',
      fa: 'تدوین شروط دقیق اعتبار اسنادی (L/C) همراه با بازرسی SGS و بورو وریتاس در بندر بارگیری',
      ar: 'هيكلة بنود الاعتمادات المستندية النظيفة مع فحص SGS وبيرو فيريتاس في ميناء التحميل',
    },
    excerpt: {
      en: 'A practical checklist for commodity procurement teams to eliminate documentary discrepancies and accelerate Bill of Lading negotiation.',
      fa: 'چک‌لیست عملی برای تیم‌های بازرگانی جهت حذف مغایرت‌های اسنادی و تسریع فرآیند تحویل بارنامه و ترخیص کالا.',
      ar: 'قائمة تحقق عملية لفرق المشتريات لتجنب الفروقات المستندية وتسريع تداول بوالص الشحن والتخليص الجمركي.',
    },
    sections: [
      {
        heading: { en: 'Preventing Bank Discrepancies Before Loading', fa: 'جلوگیری از مغایرت بانکی پیش از بارگیری', ar: 'تجنب الفروقات البنكية قبل التحميل' },
        body: {
          en: 'Over 60% of documentary credit delays stem from minor wording mismatches between the Proforma Invoice, Certificate of Origin, and SGS Quality Certificate. Reviewing draft L/C clauses alongside the commodity desk before opening ensures alignment on tolerance (±5% or ±10%), partial shipment permissions, and acceptable inspection agencies.',
          fa: 'بیش از ۶۰ درصد تاخیرهای اعتبار اسنادی ناشی از ناهماهنگی جزئی متنی بین پیش‌فاکتور، گواهی مبدأ و گزارش SGS است. بررسی مشترک پیش‌نویس L/C پیش از گشایش، تلورانس وزنی و شرایط حمل جزئی را به طور دقیق همسو می‌کند.',
          ar: 'تنشأ أكثر من ٦٠٪ من تأخيرات الاعتمادات المستندية بسبب فروقات صياغة طفيفة بين الفاتورة وشهادة المنشأ وتقرير SGS؛ لذا فإن مراجعة المسودة مسبقاً تضمن تطابقاً كاملاً.',
        },
      },
    ],
  },
  {
    slug: 'iso-tank-vs-drum-chemical-logistics',
    category: 'logistics',
    categoryLabel: { en: 'Logistics', fa: 'لجستیک و حمل', ar: 'اللوجستيات والشحن' },
    date: '2026-10-15',
    readTimeMinutes: 4,
    image: IMG_LOGISTICS,
    title: {
      en: 'ISO Tank vs. Flexitank vs. Steel Drums: Cost-Per-Ton Economics for MEG and Methanol',
      fa: 'مقایسه اقتصادی ایزوتانک، فلکسی‌تانک و بشکه فلزی در صادرات MEG و متانول',
      ar: 'اقتصاديات الشحن بين خزانات ISO وفلكسي تانك والبراميل الفولاذية لـ MEG والميثانول',
    },
    excerpt: {
      en: 'Comparing net payload efficiency, IMDG safety classification, and destination handling costs for liquid petrochemical parcels.',
      fa: 'مقایسه ظرفیت خالص بارگیری، الزامات ایمنی IMDG و هزینه تخلیه در مقصد برای محموله‌های مایع پتروشیمی.',
      ar: 'مقارنة كفاءة الحمولة الصافية وتصنيف السلامة البحرية IMDG وتكاليف المناولة للشحنات الكيميائية السائلة.',
    },
    sections: [
      {
        heading: { en: 'Selecting the Right Liquid Packaging Mode', fa: 'انتخاب شیوه بهینه بسته‌بندی مایعات شیمیایی', ar: 'اختيار وسيلة التعبئة المثلى للكيماويات السائلة' },
        body: {
          en: 'While non-hazardous fiber-grade MEG achieves maximum per-ton savings in 22 MT single-use flexitanks inside 20ft dry containers, Class 3 flammable Methanol requires UN-certified T11 ISO tanks or 163 kg UN-approved steel drums. PetroTechnics logistics engineers calculate full landed CIF economics for every quotation.',
          fa: 'در حالی که منو اتیلن گلایکول غیرخطرناک بیشترین صرفه‌جویی را در فلکسی‌تانک‌های ۲۲ تنی دارد، متانول اشتعال‌پذیر کلاس ۳ نیازمند ایزوتانک استاندارد T11 یا بشکه‌های فلزی تاییدشده است. تیم لجستیک پتروتکنیکس هزینه تمام‌شده CIF هر گزینه را در پیشنهاد قیمت ارائه می‌دهد.',
          ar: 'بينما يحقق MEG أعلى وفورات في فلكسي تانك بسعة ٢٢ طن، يتطلب الميثانول القابل للاشتعال خزانات ISO معتمدة من فئة T11 أو براميل فولاذية مطابقة لمعايير الأمم المتحدة.',
        },
      },
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'moq',
    category: 'commercial',
    question: {
      en: 'What is the Minimum Order Quantity (MOQ) for polymers, fertilizers, and chemicals?',
      fa: 'حداقل مقدار سفارش (MOQ) برای پلیمرها، کودها و مواد شیمیایی چقدر است؟',
      ar: 'ما هو الحد الأدنى لكمية الطلب (MOQ) للبوليمرات والأسمدة والكيماويات؟',
    },
    answer: {
      en: 'For bagged polymers (HDPE, LDPE, LLDPE, PP, PVC, PET, PS, ABS) and Caustic Soda, the standard MOQ is one full container load or truckload (22–25 MT). For bulk Urea 46% N and Granular Sulfur, containerized jumbo-bag shipments start at 500 MT while bulk vessel parcels start at 5,000 MT. Liquid Methanol and MEG start at one 20ft ISO tank (20–22 MT) or 3,000 MT for bulk chemical tankers.',
      fa: 'برای پلیمرهای کیسه‌ای (HDPE، LDPE، PP، PVC، PET و ...) و سود پرک، حداقل سفارش یک کانتینر یا یک کامیون کامل (۲۲ تا ۲۵ تن) است. برای اوره ۴۶٪ و گوگرد گرانول در قالب جامبوبگ کانتینری حداقل ۵۰۰ تن و برای کشتی فله‌بر از ۵٬۰۰۰ تن آغاز می‌شود. متانول و MEG نیز از یک ایزوتانک (۲۰ تا ۲۲ تن) یا ۳٬۰۰۰ تن فله کشتی قابل تامین است.',
      ar: 'بالنسبة للبوليمرات المعبأة والصودا الكاوية، الحد الأدنى هو حمولة حاوية أو شاحنة كاملة (٢٢–٢٥ طن). أما اليوريا والكبريت في أكياس جامبو فتبدأ من ٥٠٠ طن وللسفن السائبة من ٥٬٠٠٠ طن. والميثانول وMEG تبدأ من خزان ISO واحد (٢٠–٢٢ طن).',
    },
  },
  {
    id: 'response-sla',
    category: 'commercial',
    question: {
      en: 'How quickly does PetroTechnics issue an official FCO or commercial quotation?',
      fa: 'زمان پاسخ‌دهی پتروتکنیکس برای صدور استعلام قیمت و FCO رسمی چقدر است؟',
      ar: 'كم يستغرق إصدار عرض السعر الرسمي (FCO) من بتروتيكنيكس؟',
    },
    answer: {
      en: 'All complete RFQs specifying product grade, quantity, destination port, and Incoterm receive an initial desk acknowledgment within 4 hours and a formal Full Corporate Offer (FCO) within 24 business hours.',
      fa: 'تمامی استعلام‌های کامل شامل گرید محصول، تناژ، مقصد و اینکوترم ظرف ۴ ساعت تایید دریافت شده و پیشنهاد رسمی (FCO) حداکثر ظرف ۲۴ ساعت کاری صادر می‌گردد.',
      ar: 'تتلقى جميع طلبات عروض الأسعار المكتملة تأكيداً أولياً خلال ٤ ساعات وعرضاً تجارياً رسمياً (FCO) خلال ٢٤ ساعة عمل كحد أقصى.',
    },
  },
  {
    id: 'inspection',
    category: 'quality',
    question: {
      en: 'Can buyers appoint independent SGS, Bureau Veritas, or Intertek inspection before shipment?',
      fa: 'آیا امکان بازرسی مستقل SGS، بورو وریتاس یا اینترتک پیش از بارگیری وجود دارد؟',
      ar: 'هل يمكن للمشتري تعيين شركة فحص مستقلة مثل SGS أو بيرو فيريتاس أو إنترتك قبل الشحن؟',
    },
    answer: {
      en: 'Yes. Every PetroTechnics export contract supports mandatory or buyer-nominated third-party Quality & Quantity (Q&Q) inspection at the load port by SGS, Bureau Veritas, or Intertek, including laboratory assay, bag weight verification, container stuffing photos, and seal reporting.',
      fa: 'بله. تمام قراردادهای صادراتی پتروتکنیکس امکان بازرسی کامل کمیت و کیفیت (Q&Q) در بندر بارگیری توسط SGS، بورو وریتاس یا اینترتک شامل آنالیز آزمایشگاهی، کنترل وزن، گزارش تصویری بارگیری و ثبت شماره پلمب را پوشش می‌دهند.',
      ar: 'نعم، تدعم جميع عقود التصدير لدينا فحص الجودة والكمية في ميناء التحميل عبر SGS أو بيرو فيريتاس أو إنترتك شاملاً التحليل المخبري وتوثيق الوزن وأرقام الأختام.',
    },
  },
  {
    id: 'payment-terms',
    category: 'payment',
    question: {
      en: 'What payment instruments are accepted for international shipments?',
      fa: 'چه روش‌های پرداختی برای معاملات صادراتی پذیرفته می‌شود؟',
      ar: 'ما هي وسائل الدفع المقبولة للشحنات الدولية؟',
    },
    answer: {
      en: 'Standard terms include Irrevocable Documentary Letter of Credit (L/C at sight) issued by an approved prime bank, or Bank Telegraphic Transfer (TT) structured as 30% advance upon Proforma Invoice execution and 70% balance against scanned Clean On-Board Bill of Lading and SGS Q&Q certificates.',
      fa: 'روش‌های استاندارد شامل اعتبار اسنادی غیرقابل برگشت دیداری (L/C at sight) یا حواله بانکی (TT) به صورت ۳۰٪ پیش‌پرداخت پس از امضای PI و ۷۰٪ مانده در برابر اسکن بارنامه تمیز (B/L) و گواهی بازرسی SGS است.',
      ar: 'تشمل الشروط القياسية الاعتماد المستندي غير القابل للإلغاء عند الاطلاع (L/C) أو التحويل البنكي (TT) بنسبة ٣٠٪ مقدماً عند توقيع الفاتورة المبدئية و٧٠٪ مقابل نسخة بوليصة الشحن وتقرير SGS.',
    },
  },
  {
    id: 'documents',
    category: 'logistics',
    question: {
      en: 'Which standard export documents accompany every shipment?',
      fa: 'چه اسناد صادراتی به همراه هر محموله ارائه می‌شود؟',
      ar: 'ما هي مستندات التصدير القياسية التي ترافق كل شحنة؟',
    },
    answer: {
      en: 'Every shipment includes 3/3 Original Clean On-Board Bill of Lading (or CMR for overland), Chamber of Commerce Certificate of Origin (COO), Factory Certificate of Analysis (COA), Third-Party Inspection Certificate (SGS/BV/Intertek), Commercial Invoice, Packing List, and MSDS (plus Marine Insurance Policy for CIF orders).',
      fa: 'هر محموله شامل ۳ نسخه اصل بارنامه دریایی (یا CMR جاده‌ای)، گواهی مبدأ اتاق بازرگانی (COO)، آنالیز کارخانه (COA)، گواهی بازرسی مستقل، فاکتور تجاری، لیست عدل‌بندی، برگه ایمنی MSDS و در قراردادهای CIF بیمه‌نامه دریایی است.',
      ar: 'تتضمن كل شحنة ٣ نسخ أصلية من بوليصة الشحن وشهادة المنشأ وشهادة التحليل وشهادة الفحص المستقل والفاتورة التجارية وقائمة التعبئة وصحيفة السلامة MSDS ووثيقة التأمين لشحنات CIF.',
    },
  },
  {
    id: 'packaging',
    category: 'quality',
    question: {
      en: 'Are neutral export bags, custom buyer markings, and moisture-proof palletization available?',
      fa: 'آیا امکان بسته‌بندی با کیسه بدون نشان، چاپ اختصاصی خریدار و پالت‌بندی ضد رطوبت وجود دارد؟',
      ar: 'هل تتوفر أكياس محايدة أو طباعة مخصصة للمشتري وطبليات مقاومة للرطوبة؟',
    },
    answer: {
      en: 'Yes. Polymers can be shipped in original producer 25 kg FFS bags or neutral export bags on heat-treated ISPM-15 shrink-wrapped pallets. Urea, Sulfur, and Caustic Soda are available in 50 kg / 25 kg bags or 1,000–1,250 kg UV-stabilized jumbo bags with custom shipping marks.',
      fa: 'بله. پلیمرها هم در کیسه اصلی کارخانه و هم در بسته‌بندی خنثی روی پالت‌های چوبی حرارت‌دیده ISPM-15 با شرینک ضد رطوبت قابل ارسال هستند. اوره، گوگرد و سود پرک نیز در کیسه‌های ۲۵ و ۵۰ کیلویی یا جامبوبگ با مارکینگ اختصاصی خریدار عرضه می‌شوند.',
      ar: 'نعم، تتوفر البوليمرات في أكياس المصنع الأصلية أو أكياس محايدة على طبليات معالجة حرارياً ISPM-15، كما تتوفر الأسمدة والكبريت في أكياس ٥٠ كجم أو جامبو بعلامات شحن مخصصة.',
    },
  },
  {
    id: 'mixed-containers',
    category: 'logistics',
    question: {
      en: 'Can we consolidate multiple polymer grades in a single 40ft container or overland truck?',
      fa: 'آیا امکان ترکیب چند گرید پلیمری در یک کانتینر ۴۰ فوت یا کامیون وجود دارد؟',
      ar: 'هل يمكن تجميع عدة درجات بوليمر في حاوية ٤٠ قدماً أو شاحنة واحدة؟',
    },
    answer: {
      en: 'Yes. Through our bonded consolidation yards near Bandar Abbas, Tabriz, and Sharjah, buyers can combine up to 3 compatible polymer grades (e.g., HDPE Film + LDPE + PP Raffia) within one 24.75 MT load, with each lot accompanied by its individual batch COA.',
      fa: 'بله. از طریق انبارهای تجمیع ما در بندرعباس، تبریز و شارجه، خریداران می‌توانند تا ۳ گرید سازگار پلیمری را در یک محموله ۲۴.۷۵ تنی ترکیب کنند و برای هر گرید COA جداگانه دریافت نمایند.',
      ar: 'نعم، عبر ساحات التجميع التابعة لنا في بندر عباس وتبريز والشارقة يمكن دمج حتى ٣ درجات بوليمر متوافقة ضمن شحنة واحدة مع شهادة تحليل مستقلة لكل دفعة.',
    },
  },
  {
    id: 'samples',
    category: 'quality',
    question: {
      en: 'How can new industrial buyers evaluate resin samples prior to bulk contracting?',
      fa: 'خریداران صنعتی جدید چگونه می‌توانند پیش از قرارداد عمده، نمونه آزمایشگاهی دریافت کنند؟',
      ar: 'كيف يمكن للمشترين الصناعيين الجدد طلب عينات مخبرية قبل التعاقد؟',
    },
    answer: {
      en: 'Verified industrial converters may request 2–5 kg sealed laboratory sample lots via courier (DHL/Aramex) alongside the batch Technical Data Sheet before placing a trial container order.',
      fa: 'تولیدکنندگان صنعتی احراز هویت‌شده می‌توانند پیش از سفارش کانتینر آزمایشی، نمونه پلمب‌شده ۲ تا ۵ کیلویی را به همراه دیتاشیت فنی از طریق پست سریع بین‌المللی دریافت نمایند.',
      ar: 'يمكن للمصنعين المعتمدين طلب عينات مخبرية مختومة بوزن ٢ إلى ٥ كجم عبر البريد السريع الدولي مع ورقة البيانات الفنية قبل طلب حاوية تجريبية.',
    },
  },
];

export const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Rajeshwari Deshmukh',
    role: { en: 'VP Procurement', fa: 'معاون تدارکات و بازرگانی', ar: 'نائب الرئيس للمشتريات' },
    company: 'Deccan Agro-Chem Inputs Pvt. Ltd.',
    country: { en: 'Mumbai, India', fa: 'بمبئی، هند', ar: 'مومباي، الهند' },
    quote: {
      en: 'Before working with PetroTechnics, moisture variance and delayed B/L release cost us demurrage at Mundra. Over the past 14 months, six consecutive granular urea and sulfur shipments cleared within 48 hours with zero SGS assay deviations.',
      fa: 'پیش از همکاری با پتروتکنیکس، نوسان رطوبت و تاخیر اسناد بارنامه باعث دموراژ در بندر موندرا می‌شد. طی ۱۴ ماه گذشته، شش محموله متوالی اوره گرانول و گوگرد با صفر انحراف آنالیز SGS ظرف ۴۸ ساعت ترخیص شدند.',
      ar: 'خلال الأربعة عشر شهراً الماضية، تم تخليص ست شحنات متتالية من اليوريا المحببة والكبريت في ميناء موندرا خلال ٤٨ ساعة دون أي انحراف في نتائج فحص SGS.',
    },
    metric: {
      en: '6 Consecutive Bulk Lots · 0% Assay Variance',
      fa: '۶ محموله فله متوالی · ۰٪ انحراف آنالیز',
      ar: '٦ شحنات سائبة متتالية · ٠٪ انحراف مخبري',
    },
  },
  {
    id: 't2',
    name: 'Mehmet Karahan',
    role: { en: 'Supply Chain Director', fa: 'مدیر زنجیره تامین', ar: 'مدير سلسلة الإمداد' },
    company: 'Anatolia Flexible Packaging A.Ş.',
    country: { en: 'Gaziantep, Turkey', fa: 'غازی‌عنتاب، ترکیه', ar: 'غازي عنتاب، تركيا' },
    quote: {
      en: 'Switching our HDPE EX5 and PP Raffia supply to PetroTechnics overland TIR corridor cut our replenishment lead time from 28 days to 6 days, freeing significant working capital across our extrusion lines.',
      fa: 'انتقال تامین HDPE EX5 و PP رافیا به کریدور جاده‌ای TIR پتروتکنیکس زمان تامین ما را از ۲۸ روز به ۶ روز کاهش داد و سرمایه در گردش قابل‌توجهی در خطوط اکستروژن آزاد کرد.',
      ar: 'أدى التحول إلى ممر الشحن البري TIR مع بتروتيكنيكس لتوريد HDPE وPP إلى تقليص زمن التوريد من ٢٨ يوماً إلى ٦ أيام فقط.',
    },
    metric: {
      en: '28 Days → 6 Days Replenishment Lead Time',
      fa: 'کاهش زمان تامین از ۲۸ روز به ۶ روز',
      ar: 'تقليص زمن التوريد من ٢٨ إلى ٦ أيام',
    },
  },
  {
    id: 't3',
    name: 'Nurlan Bekturov',
    role: { en: 'Managing Director', fa: 'مدیرعامل', ar: 'المدير العام' },
    company: 'Steppe Polymer & Pipe Systems LLP',
    country: { en: 'Almaty, Kazakhstan', fa: 'آلماتی، قزاقستان', ar: 'ألماتي، كازاخستان' },
    quote: {
      en: 'Their Caspian and rail allocation desk handles PVC S6558 and PE100 pipe grades with institutional transparency—exact batch COAs arrive days before the rail wagons reach the border.',
      fa: 'میز لجستیک خزر و ریلی پتروتکنیکس محموله‌های PVC S6558 و لوله PE100 را با شفافیت کامل مدیریت می‌کند و آنالیز دقیق هر بچ پیش از رسیدن واگن‌ها به مرز در اختیار ماست.',
      ar: 'يدير مكتب قزوين والسكك الحديدية شحنات PVC وPE100 بشفافية مؤسسية كاملة مع تسليم شهادات التحليل قبل وصول الشحنة للحدود.',
    },
    metric: {
      en: '1,800+ MT Annual Polymer Supply via CIS Corridor',
      fa: 'بیش از ۱٬۸۰۰ تن تامین سالانه پلیمر در کریدور CIS',
      ar: 'أكثر من ١٬٨٠٠ طن سنوياً عبر ممر CIS',
    },
  },
];

export const REGIONAL_DESKS = [
  {
    city: { en: 'Tehran & Bandar Abbas', fa: 'تهران و بندرعباس', ar: 'طهران وبندر عباس' },
    role: { en: 'Sourcing & Port Operations', fa: 'تامین مستقیم و عملیات بندری', ar: 'التوريد والعمليات المينائية' },
    address: {
      en: 'Unit 14, No. 82 Africa Blvd., Tehran · Shahid Rajaee Port Logistics Desk',
      fa: 'تهران، بلوار آفریقا، پلاک ۸۲، واحد ۱۴ · دفتر عملیات بندر شهید رجایی',
      ar: 'شارع أفريقيا ٨٢، طهران · مكتب عمليات ميناء الشهيد رجائي',
    },
    phone: '+98 21 8879 4410',
    email: 'ops@petrotechnic.co',
  },
  {
    city: { en: 'Sharjah & Dubai (UAE)', fa: 'شارجه و دبی (امارات)', ar: 'الشارقة ودبي (الإمارات)' },
    role: { en: 'Gulf Commercial & Trade Finance Desk', fa: 'میز بازرگانی خلیج فارس و مالی', ar: 'المكتب التجاري والتمويل الخليجي' },
    address: {
      en: 'Hamriyah Free Zone Authority, Office E-214, Sharjah, United Arab Emirates',
      fa: 'منطقه آزاد حمریا، دفتر E-214، شارجه، امارات متحده عربی',
      ar: 'المنطقة الحرة بالحمرية، مكتب E-214، الشارقة، الإمارات العربية المتحدة',
    },
    phone: '+971 6 526 8940',
    email: 'trade@petrotechnic.co',
  },
  {
    city: { en: 'Istanbul (Turkey)', fa: 'استانبول (ترکیه)', ar: 'إسطنبول (تركيا)' },
    role: { en: 'Western Corridor & European Liaison', fa: 'نمایندگی کریدور غرب و اروپا', ar: 'مكتب الممر الغربي وأوروبا' },
    address: {
      en: 'Levent Business Plaza, Floor 9, Beşiktaş, Istanbul, Türkiye',
      fa: 'برج تجاری لونت، طبقه ۹، بشیکتاش، استانبول، ترکیه',
      ar: 'ليفنت بيزنس بلازا، الطابق ٩، بشيكتاش، إسطنبول، تركيا',
    },
    phone: '+90 212 319 7250',
    email: 'europe@petrotechnic.co',
  },
];
