import type { Locale } from '../types/domain';

export interface UiStrings {
  nav: {
    products: string;
    process: string;
    markets: string;
    insights: string;
    about: string;
    portal: string;
    requestQuote: string;
  };
  utility: {
    corridorSummary: string;
    responseSla: string;
    languageLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    imageCaption: string;
  };
  metrics: {
    yearsValue: string;
    yearsLabel: string;
    countriesValue: string;
    countriesLabel: string;
    capacityValue: string;
    capacityLabel: string;
    slaValue: string;
    slaLabel: string;
  };
  home: {
    portfolioTitle: string;
    portfolioSubtitle: string;
    viewAllProducts: string;
    whyTitle: string;
    whySubtitle: string;
    corridorsTitle: string;
    corridorsSubtitle: string;
    exploreLogistics: string;
    processPreviewTitle: string;
    processPreviewSubtitle: string;
    viewFullProcess: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
  whyItems: {
    num: string;
    title: string;
    desc: string;
    proof: string;
  }[];
  catalog: {
    title: string;
    subtitle: string;
    all: string;
    polymers: string;
    fertilizers: string;
    chemicals: string;
    searchPlaceholder: string;
    moqLabel: string;
    portsLabel: string;
    gradesCount: string;
    viewSpec: string;
    emptyTitle: string;
    emptyDesc: string;
    resetFilters: string;
    loading: string;
    error: string;
  };
  productDetail: {
    backToCatalog: string;
    casLabel: string;
    hsLabel: string;
    moqLabel: string;
    formulaLabel: string;
    gradesHeading: string;
    gradesHint: string;
    specsHeading: string;
    paramCol: string;
    valueCol: string;
    unitCol: string;
    methodCol: string;
    applicationsHeading: string;
    packagingHeading: string;
    portsHeading: string;
    inspectionHeading: string;
    requestGradeQuote: string;
    downloadTds: string;
    selectedGradeLabel: string;
  };
  process: {
    title: string;
    subtitle: string;
    stepLabel: string;
    buyerActionLabel: string;
    sellerActionLabel: string;
    documentsLabel: string;
    timelineLabel: string;
    incotermsTitle: string;
    incotermsSubtitle: string;
    docsTitle: string;
    docsSubtitle: string;
    issuerLabel: string;
    modeLabel: string;
    obligationLabel: string;
    riskLabel: string;
  };
  markets: {
    title: string;
    subtitle: string;
    corridorListTitle: string;
    originPorts: string;
    destinations: string;
    transitTime: string;
    daysUnit: string;
    activeCommodities: string;
    transportMode: string;
    requestRouteQuote: string;
    logisticsBannerTitle: string;
    logisticsBannerDesc: string;
    southernTitle: string;
    southernDesc: string;
    northernTitle: string;
    northernDesc: string;
    westernTitle: string;
    westernDesc: string;
  };
  insights: {
    title: string;
    subtitle: string;
    all: string;
    readArticle: string;
    minRead: string;
    backToInsights: string;
    relatedCta: string;
  };
  about: {
    title: string;
    subtitle: string;
    profileTitle: string;
    profileBody1: string;
    profileBody2: string;
    pillarsTitle: string;
    pillars: { title: string; desc: string }[];
    desksTitle: string;
    testimonialsTitle: string;
    faqTitle: string;
    faqSubtitle: string;
    faqSearchPlaceholder: string;
    faqCategories: {
      all: string;
      commercial: string;
      logistics: string;
      quality: string;
      payment: string;
    };
  };
  rfq: {
    title: string;
    subtitle: string;
    productLabel: string;
    gradeLabel: string;
    quantityLabel: string;
    destinationLabel: string;
    destinationPlaceholder: string;
    incotermLabel: string;
    packagingLabel: string;
    inspectionLabel: string;
    companyLabel: string;
    companyPlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitButton: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    refIdLabel: string;
    downloadReceipt: string;
    newInquiry: string;
    recentTitle: string;
    recentEmpty: string;
    validationError: string;
    slaNote: string;
  };
  footer: {
    tagline: string;
    navigationTitle: string;
    productsTitle: string;
    contactTitle: string;
    rustLink: string;
    copyright: string;
  };
  rustModal: {
    title: string;
    subtitle: string;
    copyFile: string;
    copied: string;
    downloadBundle: string;
    close: string;
    loading: string;
  };
}

export const UI_STRINGS: Record<Locale, UiStrings> = {
  en: {
    nav: {
      products: 'Products',
      process: 'Trade Process',
      markets: 'Markets & Logistics',
      insights: 'Insights',
      about: 'About & FAQ',
      portal: 'Client Portal',
      requestQuote: 'Request Quote',
    },
    utility: {
      corridorSummary: 'petrotechnic.co · Bandar Abbas · Sharjah · Istanbul',
      responseSla: 'Commercial FCO turnaround under 24 hours',
      languageLabel: 'Language',
    },
    hero: {
      eyebrow: 'International Petrochemical Trading House',
      headline: 'Direct petrochemical supply across seven global trade corridors.',
      subheadline:
        'PetroTechnics connects Tier-1 Persian Gulf polymer, urea, sulfur, and chemical complexes with industrial buyers in 32+ countries—backed by SGS load-port verification and structured L/C execution.',
      primaryCta: 'Request Commercial Quote',
      secondaryCta: 'Explore Product Catalog',
      imageCaption: 'Coastal Petrochemical Export Terminal · Bulk Vessel & ISO Tank Loading',
    },
    metrics: {
      yearsValue: '15+',
      yearsLabel: 'Years in Commodity Export',
      countriesValue: '32+',
      countriesLabel: 'Destination Countries Served',
      capacityValue: '500,000+ MT',
      capacityLabel: 'Annual Supply Capacity',
      slaValue: '< 24 hrs',
      slaLabel: 'Official FCO Turnaround',
    },
    home: {
      portfolioTitle: 'Core Export Portfolio',
      portfolioSubtitle:
        'Direct plant allocations across virgin polymers, nitrogen fertilizers, granular sulfur, and bulk liquid chemicals.',
      viewAllProducts: 'View All 12 Product Lines',
      whyTitle: 'Why Industrial Buyers Trade with PetroTechnics',
      whySubtitle:
        'Built for institutional procurement teams requiring batch consistency, transparent documentation, and dependable port execution.',
      corridorsTitle: 'Seven Active Export Corridors',
      corridorsSubtitle:
        'Maritime bulk charters, 40ft container feeders, Caspian multimodal vessels, and direct overland TIR trucks.',
      exploreLogistics: 'Open Interactive Corridor Map',
      processPreviewTitle: '8-Step L/C & SGS Execution Protocol',
      processPreviewSubtitle:
        'Every contract follows a documented commercial and banking pathway from initial LOI to Clean On-Board Bill of Lading.',
      viewFullProcess: 'Inspect Full 8-Step Workflow',
      ctaTitle: 'Ready to price your next cargo?',
      ctaSubtitle:
        'Specify product grade, tonnage, destination port, and preferred Incoterm to receive a firm quotation within 24 hours.',
      ctaButton: 'Open RFQ Desk',
    },
    whyItems: [
      {
        num: '01.',
        title: 'Direct Producer Allocation',
        desc: 'Contracted off-take from major coastal petrochemical complexes eliminates middleman markups and safeguards quarterly supply continuity.',
        proof: '15+ years direct liftings from Assaluyeh, Mahshahr & Bandar Abbas',
      },
      {
        num: '02.',
        title: 'SGS, Bureau Veritas & Intertek Verification',
        desc: 'Every bulk vessel and container lot is eligible for independent load-port assay, weight supervision, and draft survey certification.',
        proof: 'Batch-linked ASTM/ISO COA + third-party Q&Q report on every shipment',
      },
      {
        num: '03.',
        title: 'Multi-Corridor Maritime & Overland Reach',
        desc: 'Seamless execution across Southern Persian Gulf deep-water terminals, Northern Caspian/CIS rail corridors, and Western TIR routes to Turkey.',
        proof: '7 active trade lanes spanning 32+ destination markets',
      },
      {
        num: '04.',
        title: 'Structured Trade Finance & Clean Documentation',
        desc: 'Experienced banking desk managing Irrevocable L/Cs, TT milestones, Chamber of Commerce COOs, and discrepancy-free B/L releases.',
        proof: 'Under 24-hour FCO issuance and 48-hour post-sailing document dispatch',
      },
    ],
    catalog: {
      title: 'Petrochemical & Polymer Export Catalog',
      subtitle:
        'Inspect commercial grades, ASTM/ISO laboratory specifications, packaging configurations, and loading terminals across our active supply portfolio.',
      all: 'All Products',
      polymers: 'Polymers',
      fertilizers: 'Fertilizers & Sulfur',
      chemicals: 'Industrial Chemicals',
      searchPlaceholder: 'Search by product, grade (e.g. EX5, S6558, Urea), CAS, or application...',
      moqLabel: 'MOQ',
      portsLabel: 'Ports',
      gradesCount: 'grades',
      viewSpec: 'View Specification',
      emptyTitle: 'No matching commodities found',
      emptyDesc: 'Try adjusting the category filter or searching by a broader product name or grade code.',
      resetFilters: 'Reset Filters',
      loading: 'Loading export catalog...',
      error: 'Unable to load product catalog from server.',
    },
    productDetail: {
      backToCatalog: 'Back to Product Catalog',
      casLabel: 'CAS Registry',
      hsLabel: 'HS Tariff Code',
      moqLabel: 'Minimum Order',
      formulaLabel: 'Formula / Class',
      gradesHeading: 'Available Commercial Grades',
      gradesHint: 'Select a grade below to pre-fill your commercial quotation request.',
      specsHeading: 'Typical Technical Specifications',
      paramCol: 'Parameter',
      valueCol: 'Specification',
      unitCol: 'Unit',
      methodCol: 'Test Method',
      applicationsHeading: 'Primary Industrial Applications',
      packagingHeading: 'Export Packaging Options',
      portsHeading: 'Active Loading Terminals',
      inspectionHeading: 'Independent Pre-Shipment Inspection',
      requestGradeQuote: 'Request Quote for Selected Grade',
      downloadTds: 'Download Technical Data Sheet',
      selectedGradeLabel: 'Selected Grade',
    },
    process: {
      title: 'International Trade Execution & Export Documentation',
      subtitle:
        'An institutional 8-step execution standard combining irrevocable trade finance, plant traceability, and independent SGS/BV/Intertek inspection.',
      stepLabel: 'Stage',
      buyerActionLabel: 'Buyer Responsibilities',
      sellerActionLabel: 'PetroTechnics Execution',
      documentsLabel: 'Stage Documents',
      timelineLabel: 'Typical Window',
      incotermsTitle: 'Supported Incoterms 2020',
      incotermsSubtitle: 'Flexible delivery terms tailored to maritime bulk vessels, ocean containers, Caspian vessels, and overland TIR corridors.',
      docsTitle: 'Standard Export Documentation Pack',
      docsSubtitle: 'Complete bank-compliant shipping documentation issued within 48 hours of vessel departure.',
      issuerLabel: 'Issuer',
      modeLabel: 'Transport Mode',
      obligationLabel: 'Seller Scope',
      riskLabel: 'Risk Transfer',
    },
    markets: {
      title: 'Global Markets & Multimodal Logistics Corridors',
      subtitle:
        'Select any trade corridor on the map or directory to inspect loading terminals, destination hubs, transit times, and core exported commodities.',
      corridorListTitle: 'Active Trade Corridors',
      originPorts: 'Origin Loading Terminals',
      destinations: 'Primary Destination Hubs',
      transitTime: 'Estimated Transit Time',
      daysUnit: 'days',
      activeCommodities: 'Core Exported Commodities',
      transportMode: 'Transport Mode',
      requestRouteQuote: 'Request Quote on This Corridor',
      logisticsBannerTitle: 'Three Strategic Export Gateways',
      logisticsBannerDesc:
        'PetroTechnics operates integrated terminal dispatch desks across southern deep-water ports, northern Caspian/CIS rail crossings, and western overland routes.',
      southernTitle: 'Southern Maritime Gateway',
      southernDesc: 'Bandar Abbas, Assaluyeh & Bandar Imam Khomeini serving South Asia, China, Africa, and South America via bulk carriers and container lines.',
      northernTitle: 'Northern CIS & Caspian Corridor',
      northernDesc: 'Amirabad & Anzali Caspian shipping paired with Sarakhs rail and TIR trucks delivering DAP/CPT across Kazakhstan, Uzbekistan, Azerbaijan, and Armenia.',
      westernTitle: 'Western Overland & Gulf Hub',
      westernDesc: 'Direct 24 MT TIR dispatches via Bazargan to Turkey & Eastern Europe, plus Sharjah and Jebel Ali bonded consolidation hubs.',
    },
    insights: {
      title: 'Market Intelligence & Trade Briefs',
      subtitle:
        'Commercial analysis covering Persian Gulf fertilizer netbacks, regional polymer corridors, L/C compliance, and chemical shipping economics.',
      all: 'All Briefs',
      readArticle: 'Read Brief',
      minRead: 'min read',
      backToInsights: 'Back to All Briefs',
      relatedCta: 'Discuss Pricing with Trading Desk',
    },
    about: {
      title: 'About PetroTechnics',
      subtitle:
        'An independent international petrochemical trading house built on producer-direct sourcing, technical transparency, and disciplined execution.',
      profileTitle: 'Institutional Commodity Supply from Plant to Discharge Port',
      profileBody1:
        'Headquartered with operational desks spanning Tehran, Bandar Abbas, Sharjah, and Istanbul, PetroTechnics bridges world-scale Middle Eastern petrochemical and fertilizer production with industrial converters, agribusinesses, and distributors in more than 32 countries.',
      profileBody2:
        'Our commercial teams combine polymer engineering expertise with maritime chartering and documentary credit mastery—ensuring every metric ton ships on specification, on schedule, and backed by verifiable SGS, Bureau Veritas, or Intertek certification.',
      pillarsTitle: 'Operating Principles',
      pillars: [
        {
          title: 'Zero-Compromise Specification Integrity',
          desc: 'We trade prime virgin grades with verifiable factory batch COAs—never undocumented off-spec blends.',
        },
        {
          title: 'Transparent Commercial Ethics',
          desc: 'Clear Incoterms breakdowns, honest laycan schedules, and full pre-shipment inspection visibility for every buyer.',
        },
        {
          title: 'Resilient Multimodal Logistics',
          desc: 'Parallel maritime, Caspian, overland TIR, and Gulf bonded-warehouse options protect buyers from port congestion.',
        },
      ],
      desksTitle: 'Regional Commercial & Operations Desks',
      testimonialsTitle: 'Verified Industrial Counterparties',
      faqTitle: 'Frequently Asked Trade Questions',
      faqSubtitle: 'Direct answers regarding MOQs, payment instruments, SGS inspection, packaging, and transit execution.',
      faqSearchPlaceholder: 'Search FAQ (e.g. MOQ, SGS, L/C, sample, mixed container)...',
      faqCategories: {
        all: 'All Topics',
        commercial: 'Commercial & MOQ',
        logistics: 'Logistics & Docs',
        quality: 'Quality & Packaging',
        payment: 'Payment & L/C',
      },
    },
    rfq: {
      title: 'Commercial Request for Quotation (RFQ)',
      subtitle:
        'Submit exact product grade, tonnage, destination port, and Incoterm to receive an official Full Corporate Offer (FCO) within 24 hours.',
      productLabel: 'Product Family',
      gradeLabel: 'Specific Grade',
      quantityLabel: 'Quantity (Metric Tons)',
      destinationLabel: 'Destination Port / City & Country',
      destinationPlaceholder: 'e.g. Nhava Sheva, India or Istanbul, Turkey',
      incotermLabel: 'Preferred Incoterm 2020',
      packagingLabel: 'Packaging Format',
      inspectionLabel: 'Third-Party Inspector',
      companyLabel: 'Company Name',
      companyPlaceholder: 'Your legal entity name',
      contactLabel: 'Contact Person',
      contactPlaceholder: 'Full name & title',
      emailLabel: 'Corporate Email',
      emailPlaceholder: 'procurement@company.com',
      phoneLabel: 'Phone / WhatsApp',
      phonePlaceholder: '+971 50 000 0000',
      notesLabel: 'Additional Technical or Payment Notes (Optional)',
      notesPlaceholder: 'Target delivery window, L/C bank preference, or custom bag markings...',
      submitButton: 'Submit Official RFQ',
      submitting: 'Submitting Inquiry...',
      successTitle: 'RFQ Registered Successfully',
      successDesc:
        'Your commercial inquiry has been logged with the PetroTechnics trading desk. A dedicated commodity manager will issue your FCO within 24 business hours.',
      refIdLabel: 'Reference ID',
      downloadReceipt: 'Download RFQ Summary',
      newInquiry: 'Submit Another RFQ',
      recentTitle: 'Recently Logged Inquiries',
      recentEmpty: 'No inquiries submitted in this session yet.',
      validationError: 'Please complete all required commercial fields with a valid corporate email and positive tonnage.',
      slaNote: 'Guaranteed commercial acknowledgment within 4 hours · Official FCO under 24 hours.',
    },
    footer: {
      tagline: 'International petrochemical, polymer, fertilizer, and industrial chemical trading house serving 32+ global markets.',
      navigationTitle: 'Platform',
      productsTitle: 'Flagship Products',
      contactTitle: 'Commercial Desks',
      rustLink: 'Rust Axum Backend Package',
      copyright: '© 2026 PetroTechnics (petrotechnic.co). All rights reserved.',
    },
    rustModal: {
      title: 'Rust (Axum) Backend Architecture Package',
      subtitle:
        'Production-ready Rust Axum + Tokio + Serde backend mirroring every PetroTechnics REST endpoint, ready to compile and deploy via cargo run --release.',
      copyFile: 'Copy File',
      copied: 'Copied',
      downloadBundle: 'Download Rust Source Bundle',
      close: 'Close',
      loading: 'Loading Rust backend modules...',
    },
  },
  fa: {
    nav: {
      products: 'محصولات',
      process: 'روند معامله',
      markets: 'بازارها و لجستیک',
      insights: 'اخبار بازار',
      about: 'درباره ما و سوالات',
      portal: 'پورتال مشتریان',
      requestQuote: 'استعلام قیمت',
    },
    utility: {
      corridorSummary: 'petrotechnic.co · بندرعباس · شارجه · استانبول',
      responseSla: 'صدور پیشنهاد رسمی (FCO) در کمتر از ۲۴ ساعت',
      languageLabel: 'زبان',
    },
    hero: {
      eyebrow: 'خانه بازرگانی بین‌المللی پتروشیمی',
      headline: 'تامین مستقیم محصولات پتروشیمی در هفت کریدور صادراتی جهان.',
      subheadline:
        'پتروتکنیکس مجتمع‌های پیشرو پلیمر، اوره، گوگرد و مواد شیمیایی خلیج فارس را به خریداران صنعتی در بیش از ۳۲ کشور متصل می‌کند؛ همراه با بازرسی مستقل SGS و اجرای ساختاریافته اعتبار اسنادی (L/C).',
      primaryCta: 'درخواست استعلام قیمت',
      secondaryCta: 'مشاهده کاتالوگ محصولات',
      imageCaption: 'ترمینال ساحلی صادرات پتروشیمی · بارگیری کشتی فله‌بر و ایزوتانک',
    },
    metrics: {
      yearsValue: '+۱۵',
      yearsLabel: 'سال سابقه صادرات کالا',
      countriesValue: '+۳۲',
      countriesLabel: 'کشور مقصد صادراتی',
      capacityValue: '+۵۰۰٬۰۰۰ تن',
      capacityLabel: 'ظرفیت تامین سالانه',
      slaValue: 'کمتر از ۲۴ ساعت',
      slaLabel: 'زمان صدور پیشنهاد FCO',
    },
    home: {
      portfolioTitle: 'سبد محصولات صادراتی',
      portfolioSubtitle:
        'تخصیص مستقیم کارخانه‌ای در حوزه پلیمرهای گرید اول، کودهای ازته، گوگرد گرانول و مواد شیمیایی مایع.',
      viewAllProducts: 'مشاهده هر ۱۲ خط محصول',
      whyTitle: 'چرا خریداران صنعتی پتروتکنیکس را انتخاب می‌کنند',
      whySubtitle:
        'طراحی‌شده برای تیم‌های تدارکات بین‌المللی که به یکنواختی آنالیز، شفافیت اسنادی و تحویل دقیق بندری نیاز دارند.',
      corridorsTitle: 'هفت مسیر فعال صادراتی',
      corridorsSubtitle:
        'چارتر کشتی فله‌بر، خطوط کانتینری ۴۰ فوت، ناوگان ترکیبی دریای خزر و کامیون‌های جاده‌ای TIR.',
      exploreLogistics: 'مشاهده نقشه تعاملی مسیرها',
      processPreviewTitle: 'فرآیند ۸ مرحله‌ای معامله و بازرسی SGS',
      processPreviewSubtitle:
        'هر قرارداد صادراتی طبق مسیر شفاف بازرگانی و بانکی از ثبت LOI تا تحویل بارنامه تمیز (B/L) اجرا می‌شود.',
      viewFullProcess: 'بررسی کامل مراحل ۸گانه معامله',
      ctaTitle: 'آماده دریافت قیمت برای محموله بعدی هستید؟',
      ctaSubtitle:
        'گرید محصول، تناژ، بندر مقصد و اینکوترم مورد نظر را ثبت کنید تا پیشنهاد رسمی ظرف ۲۴ ساعت صادر شود.',
      ctaButton: 'ورود به میز استعلام قیمت',
    },
    whyItems: [
      {
        num: '۰۱.',
        title: 'تخصیص مستقیم از مجتمع‌های تولیدی',
        desc: 'قراردادهای مستقیم برداشت از مجتمع‌های بزرگ پتروشیمی، هزینه‌های واسطه‌گری را حذف کرده و پایداری تامین فصلی را تضمین می‌کند.',
        proof: 'بیش از ۱۵ سال برداشت مستقیم از عسلویه، ماهشهر و بندرعباس',
      },
      {
        num: '۰۲.',
        title: 'بازرسی مستقل SGS، بورو وریتاس و اینترتک',
        desc: 'تمامی محموله‌های فله و کانتینری با امکان آنالیز آزمایشگاهی مستقل، کنترل وزن و درفت‌سروی در بندر بارگیری عرضه می‌شوند.',
        proof: 'ارائه COA کارخانه‌ای مطابق ASTM/ISO و گزارش بازرسی Q&Q',
      },
      {
        num: '۰۳.',
        title: 'پوشش هم‌زمان کریدورهای دریایی و زمینی',
        desc: 'اجرای بی‌وقفه از بنادر عمیق جنوب، مسیرهای ریلی و دریایی خزر (CIS) و ترانزیت جاده‌ای غرب به ترکیه و اروپا.',
        proof: '۷ مسیر فعال تجاری در بیش از ۳۲ بازار بین‌المللی',
      },
      {
        num: '۰۴.',
        title: 'مدیریت حرفه‌ای اسناد حمل و L/C',
        desc: 'تیم مالی مسلط به اعتبارات اسنادی غیرقابل برگشت، گواهی مبدأ اتاق بازرگانی و صدور بدون مغایرت اسناد حمل.',
        proof: 'صدور FCO زیر ۲۴ ساعت و ارسال اسناد حمل ظرف ۴۸ ساعت پس از حرکت',
      },
    ],
    catalog: {
      title: 'کاتالوگ صادراتی پتروشیمی و پلیمر',
      subtitle:
        'مشاهده گریدهای تجاری، جدول مشخصات فنی ASTM/ISO، نوع بسته‌بندی و بنادر بارگیری برای تمامی محصولات قابل تامین.',
      all: 'همه محصولات',
      polymers: 'پلیمرها',
      fertilizers: 'کود و گوگرد',
      chemicals: 'مواد شیمیایی صنعتی',
      searchPlaceholder: 'جستجو بر اساس نام محصول، گرید (مثل EX5، S6558، اوره) یا کاربرد...',
      moqLabel: 'حداقل سفارش',
      portsLabel: 'بنادر',
      gradesCount: 'گرید',
      viewSpec: 'مشخصات فنی',
      emptyTitle: 'محصولی مطابق جستجو یافت نشد',
      emptyDesc: 'فیلتر دسته‌بندی را تغییر دهید یا با نام محصول یا کد گرید دیگری جستجو کنید.',
      resetFilters: 'پاک کردن فیلترها',
      loading: 'در حال بارگذاری کاتالوگ محصولات...',
      error: 'خطا در دریافت کاتالوگ محصولات از سرور.',
    },
    productDetail: {
      backToCatalog: 'بازگشت به کاتالوگ محصولات',
      casLabel: 'شماره CAS',
      hsLabel: 'کد تعرفه HS',
      moqLabel: 'حداقل سفارش',
      formulaLabel: 'فرمول / رده',
      gradesHeading: 'گریدهای تجاری قابل عرضه',
      gradesHint: 'با انتخاب هر گرید، فرم استعلام قیمت به طور خودکار با همان گرید پر می‌شود.',
      specsHeading: 'مشخصات فنی استاندارد',
      paramCol: 'پارامتر',
      valueCol: 'مقدار استاندارد',
      unitCol: 'واحد',
      methodCol: 'روش آزمون',
      applicationsHeading: 'کاربردهای اصلی صنعتی',
      packagingHeading: 'گزینه‌های بسته‌بندی صادراتی',
      portsHeading: 'بنادر و مبادی بارگیری',
      inspectionHeading: 'بازرسی مستقل پیش از حمل',
      requestGradeQuote: 'استعلام قیمت برای گرید انتخاب‌شده',
      downloadTds: 'دانلود دیتاشیت فنی (TDS)',
      selectedGradeLabel: 'گرید انتخاب‌شده',
    },
    process: {
      title: 'روند اجرای معامله و اسناد صادراتی',
      subtitle:
        'الگوی استاندارد ۸ مرحله‌ای صادرات بین‌المللی با ترکیب اعتبار اسنادی امن، تخصیص کارخانه‌ای و بازرسی مستقل SGS/BV/Intertek.',
      stepLabel: 'مرحله',
      buyerActionLabel: 'اقدامات خریدار',
      sellerActionLabel: 'تعهدات اجرایی پتروتکنیکس',
      documentsLabel: 'اسناد این مرحله',
      timelineLabel: 'بازه زمانی معمول',
      incotermsTitle: 'اینکوترم‌های پشتیبانی‌شده (Incoterms 2020)',
      incotermsSubtitle: 'شرایط تحویل منعطف متناسب با کشتی‌های فله‌بر، کانتینر دریایی، مسیر خزر و ترانزیت جاده‌ای TIR.',
      docsTitle: 'بسته استاندارد اسناد صادراتی',
      docsSubtitle: 'مجموعه کامل اسناد حمل مورد تایید بانک‌ها و گمرکات بین‌المللی ظرف ۴۸ ساعت پس از حرکت کشتی.',
      issuerLabel: 'مرجع صادرکننده',
      modeLabel: 'شیوه حمل',
      obligationLabel: 'محدوده تعهد فروشنده',
      riskLabel: 'نقطه انتقال ریسک',
    },
    markets: {
      title: 'بازارهای صادراتی و کریدورهای لجستیکی',
      subtitle:
        'هر مسیر را روی نقشه یا فهرست انتخاب کنید تا بنادر بارگیری، مقاصد کلیدی، زمان ترانزیت و کالاهای صادراتی را ببینید.',
      corridorListTitle: 'مسیرهای فعال صادراتی',
      originPorts: 'بنادر و مبادی بارگیری',
      destinations: 'مقاصد کلیدی',
      transitTime: 'زمان تقریبی حمل',
      daysUnit: 'روز',
      activeCommodities: 'محصولات اصلی این مسیر',
      transportMode: 'شیوه حمل',
      requestRouteQuote: 'استعلام قیمت در این مسیر',
      logisticsBannerTitle: 'سه دروازه راهبردی صادرات',
      logisticsBannerDesc:
        'پتروتکنیکس عملیات بارگیری یکپارچه را در بنادر عمیق جنوب، گذرگاه‌های ریلی و دریایی شمال (CIS) و مسیر زمینی غرب مدیریت می‌کند.',
      southernTitle: 'دروازه دریایی جنوب',
      southernDesc: 'بندرعباس، عسلویه و بندر امام خمینی برای پوشش جنوب آسیا، چین، شرق و غرب آفریقا و آمریکای جنوبی.',
      northernTitle: 'کریدور شمال (CIS و خزر)',
      northernDesc: 'حمل دریایی امیرآباد و انزلی در کنار ریل سرخس و ناوگان جاده‌ای برای تحویل DAP/CPT در قزاقستان، ازبکستان و قفقاز.',
      westernTitle: 'مسیر غرب و هاب خلیج فارس',
      westernDesc: 'اعزام مستقیم کامیون‌های ۲۴ تنی TIR از مرز بازرگان به ترکیه و اروپا به همراه هاب تجمیع شارجه و جبل علی.',
    },
    insights: {
      title: 'تحلیل بازار و گزارش‌های تجاری',
      subtitle:
        'گزارش‌های تخصصی درباره بازار جهانی اوره، مسیرهای صادرات پلیمر، استانداردهای اعتبار اسنادی و اقتصاد لجستیک شیمیایی.',
      all: 'همه گزارش‌ها',
      readArticle: 'مطالعه گزارش',
      minRead: 'دقیقه مطالعه',
      backToInsights: 'بازگشت به فهرست گزارش‌ها',
      relatedCta: 'گفتگو با میز بازرگانی درباره قیمت‌ها',
    },
    about: {
      title: 'درباره پتروتکنیکس',
      subtitle:
        'خانه بازرگانی مستقل صادرات پتروشیمی مبتنی بر تامین مستقیم کارخانه‌ای، شفافیت فنی و انضباط اجرایی.',
      profileTitle: 'تامین نهادی کالا از مجتمع تولیدی تا بندر مقصد',
      profileBody1:
        'پتروتکنیکس با دفاتر عملیاتی در تهران، بندرعباس، شارجه و استانبول، تولیدکنندگان بزرگ پتروشیمی و کود خاورمیانه را به صنایع تبدیلی، شرکت‌های کشاورزی و توزیع‌کنندگان بیش از ۳۲ کشور جهان متصل می‌کند.',
      profileBody2:
        'تیم بازرگانی ما تخصص مهندسی پلیمر و شیمی را با تجربه چارتر دریایی و اسناد بانکی ترکیب کرده تا هر تن محصول دقیقاً مطابق آنالیز، طبق زمان‌بندی و با گواهی معتبر SGS، بورو وریتاس یا اینترتک تحویل شود.',
      pillarsTitle: 'اصول حرفه‌ای و پایداری',
      pillars: [
        {
          title: 'تعهد مطلق به اصالت آنالیز',
          desc: 'عرضه انحصاری گریدهای درجه یک با COA معتبر کارخانه‌ای و قابلیت ردیابی کامل شماره بچ تولید.',
        },
        {
          title: 'اخلاق تجاری و شفافیت کامل',
          desc: 'تفکیک شفاف هزینه‌های اینکوترم، زمان‌بندی واقعی بارگیری و دسترسی آزاد به بازرسی پیش از حمل.',
        },
        {
          title: 'تاب‌آوری لجستیک چندمسیره',
          desc: 'پشتیبانی هم‌زمان از مسیرهای دریایی، خزر، زمینی و انبارهای منطقه آزاد جهت حذف ریسک ترافیک بندری.',
        },
      ],
      desksTitle: 'دفاتر بازرگانی و عملیات منطقه‌ای',
      testimonialsTitle: 'دیدگاه مشتریان بین‌المللی',
      faqTitle: 'سوالات متداول بازرگانی و صادرات',
      faqSubtitle: 'پاسخ‌های دقیق درباره حداقل سفارش، شرایط پرداخت، بازرسی SGS، بسته‌بندی و زمان تحویل.',
      faqSearchPlaceholder: 'جستجو در سوالات متداول (مثلاً MOQ، SGS، L/C، نمونه، کانتینر ترکیبی)...',
      faqCategories: {
        all: 'همه موضوعات',
        commercial: 'بازرگانی و MOQ',
        logistics: 'لجستیک و اسناد',
        quality: 'کیفیت و بسته‌بندی',
        payment: 'پرداخت و L/C',
      },
    },
    rfq: {
      title: 'فرم رسمی استعلام قیمت (RFQ)',
      subtitle:
        'نام محصول، گرید، مقدار، بندر مقصد و اینکوترم مورد نظر را وارد کنید تا پیشنهاد رسمی (FCO) ظرف ۲۴ ساعت ارسال شود.',
      productLabel: 'گروه و نام محصول',
      gradeLabel: 'گرید دقیق محصول',
      quantityLabel: 'مقدار سفارش (تن متریک)',
      destinationLabel: 'بندر یا شهر و کشور مقصد',
      destinationPlaceholder: 'مثلاً موندرا هند یا استانبول ترکیه',
      incotermLabel: 'اینکوترم مورد نظر (2020)',
      packagingLabel: 'نوع بسته‌بندی',
      inspectionLabel: 'شرکت بازرسی مستقل',
      companyLabel: 'نام شرکت',
      companyPlaceholder: 'نام رسمی شرکت یا مجموعه خریدار',
      contactLabel: 'نام و سمت متقاضی',
      contactPlaceholder: 'نام و نام خانوادگی',
      emailLabel: 'ایمیل سازمانی',
      emailPlaceholder: 'procurement@company.com',
      phoneLabel: 'تلفن / واتساپ',
      phonePlaceholder: '+98 912 000 0000',
      notesLabel: 'توضیحات تکمیلی فنی یا بانکی (اختیاری)',
      notesPlaceholder: 'زمان تحویل مدنظر، بانک گشایش‌کننده L/C یا مارکینگ اختصاصی کیسه...',
      submitButton: 'ثبت استعلام قیمت رسمی',
      submitting: 'در حال ثبت استعلام...',
      successTitle: 'استعلام قیمت با موفقیت ثبت شد',
      successDesc:
        'درخواست شما در میز بازرگانی پتروتکنیکس ثبت گردید. کارشناس تخصصی کالا ظرف ۲۴ ساعت کاری پیشنهاد رسمی (FCO) را ارسال خواهد کرد.',
      refIdLabel: 'کد پیگیری استعلام',
      downloadReceipt: 'دانلود خلاصه استعلام',
      newInquiry: 'ثبت استعلام جدید',
      recentTitle: 'استعلام‌های ثبت‌شده اخیر',
      recentEmpty: 'هنوز استعلامی در این نشست ثبت نشده است.',
      validationError: 'لطفاً تمام فیلدهای ضروری را با ایمیل معتبر و مقدار تناژ مثبت تکمیل نمایید.',
      slaNote: 'تایید دریافت استعلام ظرف ۴ ساعت · صدور پیشنهاد رسمی FCO کمتر از ۲۴ ساعت.',
    },
    footer: {
      tagline: 'خانه بازرگانی بین‌المللی صادرات پلیمر، کود، گوگرد و مواد شیمیایی صنعتی به بیش از ۳۲ بازار جهانی.',
      navigationTitle: 'بخش‌های سامانه',
      productsTitle: 'محصولات شاخص',
      contactTitle: 'دفاتر بازرگانی',
      rustLink: 'پکیج بک‌اند Rust (Axum)',
      copyright: '© ۲۰۲۶ پتروتکنیکس (petrotechnic.co). تمامی حقوق محفوظ است.',
    },
    rustModal: {
      title: 'معماری و سورس‌کد بک‌اند Rust (Axum)',
      subtitle:
        'کد کامل و آماده اجرای Rust با فریمورک Axum، Tokio و Serde منطبق بر تمامی مسیرهای API پتروتکنیکس، آماده استقرار با دستور cargo run --release.',
      copyFile: 'کپی فایل',
      copied: 'کپی شد',
      downloadBundle: 'دانلود مجموعه سورس Rust',
      close: 'بستن',
      loading: 'در حال بارگذاری ماژول‌های Rust...',
    },
  },
  ar: {
    nav: {
      products: 'المنتجات',
      process: 'آلية التداول',
      markets: 'الأسواق واللوجستيات',
      insights: 'تقارير السوق',
      about: 'عن الشركة والأسئلة',
      portal: 'بوابة العملاء',
      requestQuote: 'طلب عرض سعر',
    },
    utility: {
      corridorSummary: 'petrotechnic.co · بندر عباس · الشارقة · إسطنبول',
      responseSla: 'إصدار العرض التجاري الرسمي (FCO) خلال أقل من ٢٤ ساعة',
      languageLabel: 'اللغة',
    },
    hero: {
      eyebrow: 'دار تجارة دولية للبتروكيماويات',
      headline: 'توريد مباشر للبتروكيماويات عبر سبعة ممرات تجارية عالمية.',
      subheadline:
        'تربط بتروتيكنيكس كبرى مجمعات البوليمرات واليوريا والكبريت والكيماويات في الخليج العربي بالمشترين الصناعيين في أكثر من ٣٢ دولة مع فحص SGS وتنفيذ منضبط للاعتمادات المستندية.',
      primaryCta: 'طلب عرض سعر تجاري',
      secondaryCta: 'استعراض كتالوج المنتجات',
      imageCaption: 'محطة تصدير بتروكيماويات ساحلية · شحن السفن السائبة وخزانات ISO',
    },
    metrics: {
      yearsValue: '+١٥',
      yearsLabel: 'عاماً في تجارة السلع',
      countriesValue: '+٣٢',
      countriesLabel: 'دولة مستوردة نشطة',
      capacityValue: '+٥٠٠٬٠٠٠ طن',
      capacityLabel: 'القدرة التوريدية السنوية',
      slaValue: 'أقل من ٢٤ ساعة',
      slaLabel: 'زمن إصدار عرض FCO',
    },
    home: {
      portfolioTitle: 'محفظة التصدير الأساسية',
      portfolioSubtitle:
        'تخصيصات مباشرة من المصانع للبوليمرات البكر والأسمدة النيتروجينية والكبريت المحبب والكيماويات السائلة.',
      viewAllProducts: 'عرض جميع خطوط المنتجات (١٢)',
      whyTitle: 'لماذا يختار المشترون الصناعيون بتروتيكنيكس',
      whySubtitle:
        'مصممة لفرق المشتريات المؤسسية التي تتطلب ثبات المواصفات وشفافية المستندات ودقة الشحن المينائي.',
      corridorsTitle: 'سبعة ممرات تصدير نشطة',
      corridorsSubtitle:
        'ناقلات شحن سائب وحاويات ٤٠ قدماً وسفن بحر قزوين وشاحنات TIR البرية المباشرة.',
      exploreLogistics: 'فتح خريطة الممرات التفاعلية',
      processPreviewTitle: 'بروتوكول التنفيذ من ٨ مراحل (L/C و SGS)',
      processPreviewSubtitle:
        'يتبع كل عقد مساراً تجارياً وبنكياً موثقاً بدءاً من خطاب النية وحتى بوليصة الشحن النظيفة.',
      viewFullProcess: 'استعراض خطوات التداول الثماني',
      ctaTitle: 'هل أنت مستعد لتسعير شحنتك القادمة؟',
      ctaSubtitle:
        'حدد درجة المنتج والكمية وميناء الوصول والإنكوتيرم المطلوب لاستلام عرض سعر رسمي خلال ٢٤ ساعة.',
      ctaButton: 'فتح مكتب طلبات الأسعار',
    },
    whyItems: [
      {
        num: '٠١.',
        title: 'تخصيص مباشر من المجمعات المنتجة',
        desc: 'اتفاقيات سحب مباشرة من كبرى المجمعات البتروكيماوية الساحلية تلغي هوامش الوسطاء وتضمن استمرارية التوريد الفصلي.',
        proof: 'أكثر من ١٥ عاماً من التحميل المباشر في عسلوية وماهشهر وبندر عباس',
      },
      {
        num: '٠٢.',
        title: 'فحص مستقل عبر SGS وبيرو فيريتاس وإنترتك',
        desc: 'تخضع جميع الشحنات السائبة والحاويات لفحص الجودة والكمية المخبري ومراقبة الوزن ومسح الغاطس في ميناء التحميل.',
        proof: 'شهادة تحليل ASTM/ISO وتقرير فحص مستقل Q&Q لكل شحنة',
      },
      {
        num: '٠٣.',
        title: 'تغطية بحرية وبرية متعددة الممرات',
        desc: 'تنفيذ متكامل عبر موانئ الخليج العميقة وممر قزوين ورابطة الدول المستقلة والطرق البرية إلى تركيا وأوروبا.',
        proof: '٧ مسارات تجارية نشطة تغطي أكثر من ٣٢ سوقاً دولياً',
      },
      {
        num: '٠٤.',
        title: 'تمويل تجاري منظم ومستندات خالية من الأخطاء',
        desc: 'فريق مصرفي متخصص في الاعتمادات المستندية غير القابلة للإلغاء وشهادات المنشأ وتداول بوالص الشحن بسلاسة.',
        proof: 'إصدار FCO خلال ٢٤ ساعة وإرسال مستندات الشحن خلال ٤٨ ساعة من الإبحار',
      },
    ],
    catalog: {
      title: 'كتالوج تصدير البتروكيماويات والبوليمرات',
      subtitle:
        'استعرض الدرجات التجارية وجداول المواصفات المخبرية ASTM/ISO وخيارات التعبئة وموانئ التحميل.',
      all: 'جميع المنتجات',
      polymers: 'البوليمرات',
      fertilizers: 'الأسمدة والكبريت',
      chemicals: 'الكيماويات الصناعية',
      searchPlaceholder: 'ابحث بالمنتج أو الدرجة (مثل EX5، S6558، يوريا) أو رقم CAS...',
      moqLabel: 'الحد الأدنى',
      portsLabel: 'الموانئ',
      gradesCount: 'درجات',
      viewSpec: 'عرض المواصفات',
      emptyTitle: 'لم يتم العثور على منتجات مطابقة',
      emptyDesc: 'جرّب تغيير فئة التصفية أو البحث بكلمة أوسع أو رمز درجة آخر.',
      resetFilters: 'إعادة ضبط التصفية',
      loading: 'جارٍ تحميل كتالوج المنتجات...',
      error: 'تعذر تحميل كتالوج المنتجات من الخادم.',
    },
    productDetail: {
      backToCatalog: 'العودة إلى كتالوج المنتجات',
      casLabel: 'رقم CAS',
      hsLabel: 'رمز HS الجمركي',
      moqLabel: 'الحد الأدنى للطلب',
      formulaLabel: 'الصيغة / الفئة',
      gradesHeading: 'الدرجات التجارية المتاحة',
      gradesHint: 'اختر درجة أدناه لتعبئة طلب عرض السعر تلقائياً بهذه الدرجة.',
      specsHeading: 'المواصفات الفنية القياسية',
      paramCol: 'المعيار',
      valueCol: 'القيمة',
      unitCol: 'الوحدة',
      methodCol: 'طريقة الاختبار',
      applicationsHeading: 'التطبيقات الصناعية الرئيسية',
      packagingHeading: 'خيارات التعبئة للتصدير',
      portsHeading: 'موانئ التحميل النشطة',
      inspectionHeading: 'الفحص المستقل قبل الشحن',
      requestGradeQuote: 'طلب عرض سعر للدرجة المختارة',
      downloadTds: 'تحميل ورقة البيانات الفنية (TDS)',
      selectedGradeLabel: 'الدرجة المختارة',
    },
    process: {
      title: 'آلية تنفيذ الصفقات ومستندات التصدير',
      subtitle:
        'بروتوكول مؤسسي من ٨ خطوات يجمع بين الاعتمادات المستندية الآمنة والتوريد المصنعي والفحص المستقل SGS/BV/Intertek.',
      stepLabel: 'المرحلة',
      buyerActionLabel: 'مسؤوليات المشتري',
      sellerActionLabel: 'تنفيذ بتروتيكنيكس',
      documentsLabel: 'مستندات المرحلة',
      timelineLabel: 'الإطار الزمني المعتاد',
      incotermsTitle: 'شروط الإنكوتيرمز المدعومة (Incoterms 2020)',
      incotermsSubtitle: 'خيارات تسليم مرنة تناسب السفن السائبة والحاويات البحرية وممر قزوين والشاحنات البرية.',
      docsTitle: 'حزمة مستندات التصدير القياسية',
      docsSubtitle: 'مجموعة مستندات شحن مطابقة للاعتمادات البنكية تُصدر خلال ٤٨ ساعة من إبحار السفينة.',
      issuerLabel: 'الجهة المصدرة',
      modeLabel: 'وسيلة النقل',
      obligationLabel: 'نطاق التزام البائع',
      riskLabel: 'نقطة انتقال المخاطر',
    },
    markets: {
      title: 'الأسواق العالمية وممرات اللوجستيات',
      subtitle:
        'اختر أي ممر تجاري على الخريطة أو القائمة للاطلاع على موانئ التحميل والمقاصد ومدة العبور والسلع الرئيسية.',
      corridorListTitle: 'الممرات التجارية النشطة',
      originPorts: 'موانئ ومحطات التحميل',
      destinations: 'المراكز والموانئ المستوردة',
      transitTime: 'مدة العبور التقديرية',
      daysUnit: 'يوماً',
      activeCommodities: 'السلع الرئيسية المصدرة',
      transportMode: 'وسيلة النقل',
      requestRouteQuote: 'طلب تسعير عبر هذا الممر',
      logisticsBannerTitle: 'ثلاث بوابات تصدير استراتيجية',
      logisticsBannerDesc:
        'تدير بتروتيكنيكس مكاتب شحن متكاملة عبر الموانئ الجنوبية العميقة وممر قزوين الشمالي والطرق البرية الغربية.',
      southernTitle: 'البوابة البحرية الجنوبية',
      southernDesc: 'بندر عباس وعسلوية وبندر الإمام الخميني لخدمة جنوب آسيا والصين وأفريقيا وأمريكا الجنوبية.',
      northernTitle: 'ممر الشمال وبحر قزوين (CIS)',
      northernDesc: 'الشحن البحري عبر أمير آباد وأنزلي مع السكك الحديدية لتسليمات DAP/CPT في كازاخستان وأوزبكستان وأذربيجان.',
      westernTitle: 'الممر الغربي ومركز الخليج',
      westernDesc: 'شاحنات TIR مباشرة عبر معبر بازركان إلى تركيا وأوروبا الشرقية، بالإضافة إلى مراكز التجميع في الشارقة وجبل علي.',
    },
    insights: {
      title: 'تقارير السوق والنشرات التجارية',
      subtitle:
        'تحليلات تجارية تغطي أسواق اليوريا الخليجية وممرات البوليمرات الإقليمية وامتثال الاعتمادات المستندية ولوجستيات الكيماويات.',
      all: 'جميع التقارير',
      readArticle: 'قراءة التقرير',
      minRead: 'دقائق للقراءة',
      backToInsights: 'العودة إلى جميع التقارير',
      relatedCta: 'مناقشة الأسعار مع المكتب التجاري',
    },
    about: {
      title: 'عن بتروتيكنيكس',
      subtitle:
        'دار تجارة دولية مستقلة للبتروكيماويات قائمة على التوريد المباشر والشفافية الفنية والانضباط التنفيذي.',
      profileTitle: 'توريد مؤسسي للسلع من المصنع إلى ميناء التفريغ',
      profileBody1:
        'بمكاتب تشغيلية وتجارية في طهران وبندر عباس والشارقة وإسطنبول، تربط بتروتيكنيكس كبرى مجمعات البتروكيماويات والأسمدة في الشرق الأوسط بالمصنعين والموزعين في أكثر من ٣٢ دولة.',
      profileBody2:
        'تجمع فرقنا التجارية بين الخبرة الهندسية في البوليمرات والكيماويات وإدارة الشحن البحري والاعتمادات المستندية لضمان وصول كل شحنة مطابقة للمواصفات وفي موعدها المحدد.',
      pillarsTitle: 'مبادئ العمل والاستدامة',
      pillars: [
        {
          title: 'سلامة المواصفات دون تنازل',
          desc: 'توريد درجات بكر أصلية مرفقة بشهادات تحليل مصنعية قابلة للتتبع لكل دفعة إنتاج.',
        },
        {
          title: 'أخلاقيات تجارية وشفافية كاملة',
          desc: 'تفصيل واضح لشروط الإنكوتيرم وجداول تحميل واقعية وإتاحة كاملة للفحص المستقل قبل الشحن.',
        },
        {
          title: 'لوجستيات مرنة متعددة المسارات',
          desc: 'خيارات متوازية عبر الموانئ البحرية وقزوين والنقل البري والمناطق الحرة لتجنب اختناقات الموانئ.',
        },
      ],
      desksTitle: 'المكاتب التجارية والتشغيلية الإقليمية',
      testimonialsTitle: 'شهادات شركاء الصناعة الدوليين',
      faqTitle: 'الأسئلة الشائعة حول التصدير والتجارة',
      faqSubtitle: 'إجابات مباشرة حول الحد الأدنى للطلب ووسائل الدفع وفحص SGS والتعبئة ومواعيد التسليم.',
      faqSearchPlaceholder: 'ابحث في الأسئلة الشائعة (مثل MOQ، SGS، L/C، العينات)...',
      faqCategories: {
        all: 'جميع المواضيع',
        commercial: 'التجارة والحد الأدنى',
        logistics: 'اللوجستيات والمستندات',
        quality: 'الجودة والتعبئة',
        payment: 'الدفع والاعتمادات',
      },
    },
    rfq: {
      title: 'نموذج طلب عرض السعر الرسمي (RFQ)',
      subtitle:
        'أدخل درجة المنتج والكمية وميناء الوصول والإنكوتيرم المطلوب لاستلام العرض التجاري الرسمي (FCO) خلال ٢٤ ساعة.',
      productLabel: 'فئة واسم المنتج',
      gradeLabel: 'الدرجة المحددة',
      quantityLabel: 'الكمية (طن متري)',
      destinationLabel: 'ميناء أو مدينة وبلد الوصول',
      destinationPlaceholder: 'مثال: موندرا الهند أو إسطنبول تركيا',
      incotermLabel: 'الإنكوتيرم المفضل (2020)',
      packagingLabel: 'نوع التعبئة',
      inspectionLabel: 'جهة الفحص المستقلة',
      companyLabel: 'اسم الشركة',
      companyPlaceholder: 'الاسم القانوني للشركة المشترية',
      contactLabel: 'اسم مسؤول التواصل',
      contactPlaceholder: 'الاسم الكامل والمنصب',
      emailLabel: 'البريد الإلكتروني الرسمي',
      emailPlaceholder: 'procurement@company.com',
      phoneLabel: 'الهاتف / واتساب',
      phonePlaceholder: '+971 50 000 0000',
      notesLabel: 'ملاحظات فنية أو بنكية إضافية (اختياري)',
      notesPlaceholder: 'نافذة التسليم المستهدفة، تفضيل بنك الاعتماد أو علامات التغليف...',
      submitButton: 'إرسال طلب عرض السعر الرسمي',
      submitting: 'جارٍ تسجيل الطلب...',
      successTitle: 'تم تسجيل طلب عرض السعر بنجاح',
      successDesc:
        'تم قيد استفسارك التجاري لدى مكتب بتروتيكنيكس، وسيتواصل معك مسؤول السلعة لإصدار العرض الرسمي (FCO) خلال ٢٤ ساعة عمل.',
      refIdLabel: 'الرقم المرجعي للطلب',
      downloadReceipt: 'تحميل ملخص الطلب',
      newInquiry: 'تقديم طلب جديد',
      recentTitle: 'الاستفسارات المسجلة حديثاً',
      recentEmpty: 'لم يتم تسجيل أي استفسارات في هذه الجلسة بعد.',
      validationError: 'يرجى استكمال جميع الحقول التجارية المطلوبة ببريد رسمي صحيح وكمية موجبة.',
      slaNote: 'تأكيد استلام الطلب خلال ٤ ساعات · إصدار العرض الرسمي FCO في أقل من ٢٤ ساعة.',
    },
    footer: {
      tagline: 'دار تجارة دولية للبتروكيماويات والبوليمرات والأسمدة والكيماويات الصناعية تخدم أكثر من ٣٢ سوقاً عالمياً.',
      navigationTitle: 'أقسام المنصة',
      productsTitle: 'المنتجات الرئيسية',
      contactTitle: 'المكاتب التجارية',
      rustLink: 'حزمة خادم Rust (Axum)',
      copyright: '© ٢٠٢٦ بتروتيكنيكس (petrotechnic.co). جميع الحقوق محفوظة.',
    },
    rustModal: {
      title: 'حزمة الخادم الخلفي بلغة Rust (Axum)',
      subtitle:
        'شيفرة Rust متكاملة باستخدام Axum وTokio وSerde تطابق تماماً واجهة برمجة التطبيقات الحية وجاهزة للبناء عبر cargo run --release.',
      copyFile: 'نسخ الملف',
      copied: 'تم النسخ',
      downloadBundle: 'تحميل حزمة شيفرة Rust',
      close: 'إغلاق',
      loading: 'جارٍ تحميل وحدات Rust...',
    },
  },
};
