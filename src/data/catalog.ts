import type { Product } from '../types/domain';

export const IMG_HERO = '/src/assets/images/hero_petrochemical_terminal_1795165232738.jpg';
export const IMG_POLYMER = '/src/assets/images/product_polymer_pellets_1795165235424.jpg';
export const IMG_UREA = '/src/assets/images/product_urea_fertilizer_1795165232731.jpg';
export const IMG_SULFUR = '/src/assets/images/product_sulfur_granules_1795165233067.jpg';
export const IMG_LOGISTICS = '/src/assets/images/logistics_bulk_vessel_1795165233554.jpg';

export const PRODUCTS_CATALOG: Product[] = [
  {
    slug: 'urea-46',
    category: 'fertilizers',
    shortName: 'Urea 46% N',
    formula: 'CO(NH2)2',
    casNumber: '57-13-6',
    hsCode: '3102.10',
    featured: true,
    moqMt: 500,
    image: IMG_UREA,
    name: {
      en: 'Urea 46% Nitrogen (Prilled & Granular)',
      fa: 'اوره ۴۶٪ نیتروژن (پریل و گرانول)',
      ar: 'يوريا ٤٦٪ نيتروجين (محببة وبريل)',
    },
    summary: {
      en: 'High-nitrogen agricultural and industrial grade urea sourced from coastal petrochemical complexes with anti-caking treatment.',
      fa: 'اوره کشاورزی و صنعتی با خلوص ۴۶ درصد نیتروژن، تامین مستقیم از مجتمع‌های پتروشیمی ساحلی با تیمار ضدکلوخه.',
      ar: 'يوريا زراعية وصناعية عالية النيتروجين بنسبة ٤٦٪ من المجمعات البتروكيماوية الساحلية مع معالجة مضادة للتكتل.',
    },
    overview: {
      en: 'PetroTechnics supplies free-flowing, low-biuret Prilled and Granular Urea 46% N directly from major Persian Gulf producers. Available in bulk vessel lots and jumbo/50kg woven bags with full SGS weight and nitrogen assay certification at load port.',
      fa: 'پتروتکنیکس اوره پریل و گرانول ۴۶٪ با بیورت پایین و جریان‌پذیری یکنواخت را مستقیماً از تولیدکنندگان عمده خلیج فارس تامین می‌کند. عرضه به صورت فله کشتی، جامبوبگ و کیسه ۵۰ کیلویی با گواهی وزن و آنالیز SGS در بندر بارگیری انجام می‌شود.',
      ar: 'تورد بتروتيكنيكس اليوريا المحببة والبريل بنسبة ٤٦٪ نيتروجين ومنخفضة البيوريت مباشرة من كبار منتجي الخليج العربي، سواء بالشحن السائب أو بأكياس جامبو و٥٠ كجم مع شهادة فحص SGS في ميناء التحميل.',
    },
    grades: [
      {
        code: 'Urea 46% Granular',
        application: {
          en: 'Broad-acre mechanical spreading & bulk blending (2.0–4.0 mm)',
          fa: 'کودپاشی مکانیزه مزارع وسیع و ترکیب فله (۲ تا ۴ میلی‌متر)',
          ar: 'التسميد الآلي للمساحات الواسعة والخلط السائب (٢–٤ مم)',
        },
        keyMetric: 'N ≥ 46.0% · Biuret ≤ 1.0%',
      },
      {
        code: 'Urea 46% Prilled',
        application: {
          en: 'Direct soil application, fertigation & resin synthesis (1.0–2.8 mm)',
          fa: 'کاربرد مستقیم خاکی، کودآبیاری و تولید رزین (۱ تا ۲.۸ میلی‌متر)',
          ar: 'التطبيق المباشر للتربة والتسميد المائي وصناعة الراتنجات (١–٢.٨ مم)',
        },
        keyMetric: 'N ≥ 46.0% · Moisture ≤ 0.5%',
      },
      {
        code: 'Technical Grade Urea',
        application: {
          en: 'AdBlue / DEF production, melamine & urea-formaldehyde resins',
          fa: 'تولید ادبلو، ملامین و رزین‌های اوره‌فرمالدهید',
          ar: 'إنتاج AdBlue والميلامين وراتنجات اليوريا فورمالدهايد',
        },
        keyMetric: 'Uncoated · Biuret ≤ 0.8%',
      },
    ],
    specs: [
      { parameter: { en: 'Total Nitrogen (Dry Basis)', fa: 'نیتروژن کل (پایه خشک)', ar: 'النيتروجين الكلي (أساس جاف)' }, value: '46.0 min', unit: '% wt', method: 'AOAC 955.04' },
      { parameter: { en: 'Biuret Content', fa: 'میزان بیورت', ar: 'محتوى البيوريت' }, value: '1.0 max', unit: '% wt', method: 'ISO 2754' },
      { parameter: { en: 'Moisture (Karl Fischer)', fa: 'رطوبت', ar: 'الرطوبة' }, value: '0.5 max', unit: '% wt', method: 'ISO 2753' },
      { parameter: { en: 'Granulometry (2.0–4.0 mm)', fa: 'دانه‌بندی (گرانول)', ar: 'التدرج الحبيبي (٢–٤ مم)' }, value: '90.0 min', unit: '%', method: 'Sieve Analysis' },
      { parameter: { en: 'Crushing Strength (2.0 mm)', fa: 'مقاومت فشاری دانه', ar: 'قوة السحق الحبيبي' }, value: '2.5 min', unit: 'kgf', method: 'ASTM D4179' },
      { parameter: { en: 'Formaldehyde (Anti-caking)', fa: 'فرمالدهید (ضدکلوخه)', ar: 'فورمالدهايد (مضاد تكتل)' }, value: '0.35–0.55', unit: '% wt', method: 'Colorimetric' },
    ],
    applications: [
      { en: 'Nitrogen-rich fertilizer for cereal, sugarcane, rice, and oilseed crops', fa: 'کود ازته غنی برای غلات، نیشکر، برنج و دانه‌های روغنی', ar: 'سماد غني بالنيتروجين لمحاصيل الحبوب والأرز وقصب السكر' },
      { en: 'Feedstock for urea-formaldehyde adhesives and melamine panels', fa: 'خوراک تولید چسب‌های اوره‌فرمالدهید و پنل‌های ملامین', ar: 'مادة خام لإنتاج لواصق اليوريا فورمالدهايد وألواح الميلامين' },
      { en: 'Diesel Exhaust Fluid (DEF / AdBlue) emissions reduction', fa: 'تولید محلول کاهش آلایندگی دیزل (ادبلو)', ar: 'إنتاج سائل عادم الديزل (AdBlue) لخفض الانبعاثات' },
    ],
    packaging: [
      { en: 'Bulk in vessel holds (5,000–35,000 MT)', fa: 'فله در انبار کشتی (۵٬۰۰۰ تا ۳۵٬۰۰۰ تن)', ar: 'سائب في عنابر السفن (٥٬٠٠٠–٣٥٬٠٠٠ طن)' },
      { en: '1,000 kg / 1,250 kg UV-stabilized Jumbo Bags', fa: 'جامبوبگ ۱٬۰۰۰ و ۱٬۲۵۰ کیلویی مقاوم در برابر UV', ar: 'أكياس جامبو ١٬٠٠٠ و ١٬٢٥٠ كجم مقاومة للأشعة' },
      { en: '50 kg PP woven bags with PE inner liner', fa: 'کیسه ۵۰ کیلویی پلی‌پروپیلن با لایه داخلی PE', ar: 'أكياس بولي بروبيلين ٥٠ كجم مبطنة بـ PE' },
    ],
    loadingPorts: ['Assaluyeh (Pars Port)', 'Bandar Imam Khomeini', 'Bandar Abbas'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'granular-sulfur',
    category: 'fertilizers',
    shortName: 'Sulfur 99.9%',
    formula: 'S8',
    casNumber: '7704-34-9',
    hsCode: '2503.00',
    featured: true,
    moqMt: 500,
    image: IMG_SULFUR,
    name: {
      en: 'Granular & Lump Sulfur 99.9%',
      fa: 'گوگرد گرانول و کلوخه ۹۹.۹٪',
      ar: 'الكبريت المحبب والكتلي ٩٩.٩٪',
    },
    summary: {
      en: 'Bright yellow formed granular sulfur with 99.9% purity on dry basis, engineered for dust-free bulk maritime handling.',
      fa: 'گوگرد گرانول زرد روشن با خلوص ۹۹.۹٪ بر پایه خشک، مناسب بارگیری دریایی فله با کمترین گردوغبار.',
      ar: 'كبريت محبب أصفر ساطع بنقاء ٩٩.٩٪ على الأساس الجاف، مصمم للشحن البحري السائب بأقل نسبة غبار.',
    },
    overview: {
      en: 'Recovered from sweetening of natural gas streams across South Pars and refinery complexes, our bright yellow granular sulfur delivers ultra-low ash and hydrocarbon impurities for sulfuric acid, phosphate fertilizer (DAP/MAP), and caprolactam manufacturing.',
      fa: 'گوگرد گرانول پتروتکنیکس از پالایشگاه‌های گاز پارس جنوبی با خاکستر و هیدروکربن بسیار پایین تولید شده و گزینه‌ای ایده‌آل برای تولید اسید سولفوریک، کودهای فسفاته (DAP/MAP) و کاپرولاکتام است.',
      ar: 'كبريت محبب أصفر مستخلص من معامل معالجة الغاز الطبيعي بنسب منخفضة جداً من الرماد والهيدروكربونات، مثالي لصناعة حمض الكبريتيك والأسمدة الفوسفاتية.',
    },
    grades: [
      {
        code: 'Bright Yellow Granular (2–6 mm)',
        application: {
          en: 'Sulfuric acid plants, DAP/MAP phosphate fertilizer complexes',
          fa: 'واحدهای اسید سولفوریک و مجتمع‌های کود فسفاته DAP/MAP',
          ar: 'مصانع حمض الكبريتيك ومجمعات الأسمدة الفوسفاتية',
        },
        keyMetric: 'Purity ≥ 99.9% · Ash ≤ 0.03%',
      },
      {
        code: 'Crushed Lump Sulfur',
        application: {
          en: 'Regional overland acid units and chemical processing',
          fa: 'واحدهای تولید اسید منطقه‌ای و فرآوری شیمیایی',
          ar: 'وحدات إنتاج الحمض الإقليمية والمعالجة الكيميائية',
        },
        keyMetric: 'Purity ≥ 99.5% · Organic C ≤ 0.15%',
      },
    ],
    specs: [
      { parameter: { en: 'Purity (Dry Basis)', fa: 'خلوص (پایه خشک)', ar: 'النقاء (أساس جاف)' }, value: '99.9 min', unit: '% wt', method: 'ASTM D4045' },
      { parameter: { en: 'Ash Content', fa: 'میزان خاکستر', ar: 'محتوى الرماد' }, value: '0.03 max', unit: '% wt', method: 'ASTM D482' },
      { parameter: { en: 'Organic Matter / Carbon', fa: 'مواد آلی و کربن', ar: 'المواد العضوية والكربون' }, value: '0.05 max', unit: '% wt', method: 'Combustion' },
      { parameter: { en: 'Acidity (as H2SO4)', fa: 'اسیدیته (بر حسب H2SO4)', ar: 'الحموضة (كـ H2SO4)' }, value: '0.01 max', unit: '% wt', method: 'Titration' },
      { parameter: { en: 'Moisture', fa: 'رطوبت', ar: 'الرطوبة' }, value: '0.5 max', unit: '% wt', method: 'Oven Dry' },
      { parameter: { en: 'Color', fa: 'رنگ ظاهری', ar: 'اللون' }, value: 'Bright Yellow', unit: 'Visual', method: 'SUDIC' },
    ],
    applications: [
      { en: 'Sulfuric acid manufacturing for phosphate fertilizers and leaching', fa: 'تولید اسید سولفوریک برای کودهای فسفاته و لیچینگ معادن', ar: 'صناعة حمض الكبريتيك للأسمدة الفوسفاتية والتعدين' },
      { en: 'Soil pH conditioning and sulfur bentonite formulations', fa: 'اصلاح pH خاک و تولید کودهای گوگرد بنتونیت‌دار', ar: 'تعديل حموضة التربة وتركيبات الكبريت البنتونيتي' },
      { en: 'Rubber vulcanization, pulp processing, and carbon disulfide', fa: 'ولکانیزاسیون لاستیک، کاغذسازی و دی‌سولفید کربن', ar: 'فلكنة المطاط ومعالجة اللب وثاني كبريتيد الكربون' },
    ],
    packaging: [
      { en: 'Bulk vessel shipment (10,000–50,000 MT)', fa: 'حمل فله با کشتی (۱۰٬۰۰۰ تا ۵۰٬۰۰۰ تن)', ar: 'شحن سائب بالسفن (١٠٬٠٠٠–٥٠٬٠٠٠ طن)' },
      { en: '1,000 kg / 1,250 kg Jumbo Bags in 20ft containers', fa: 'جامبوبگ ۱٬۰۰۰ و ۱٬۲۵۰ کیلویی در کانتینر ۲۰ فوت', ar: 'أكياس جامبو ١٬٠٠٠ و ١٬٢٥٠ كجم في حاويات ٢٠ قدماً' },
      { en: '50 kg laminated PP bags', fa: 'کیسه ۵۰ کیلویی پلی‌پروپیلن لمینت‌شده', ar: 'أكياس بولي بروبيلين ٥٠ كجم مغلفة' },
    ],
    loadingPorts: ['Bandar Abbas (Shahid Rajaee)', 'Assaluyeh', 'Bandar Imam Khomeini'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'anhydrous-ammonia',
    category: 'fertilizers',
    shortName: 'Ammonia 99.8%',
    formula: 'NH3',
    casNumber: '7664-41-7',
    hsCode: '2814.10',
    moqMt: 3000,
    image: IMG_HERO,
    name: {
      en: 'Anhydrous Liquid Ammonia 99.8%',
      fa: 'آمونیاک مایع بی‌آب ۹۹.۸٪',
      ar: 'الأمونيا السائلة اللامائية ٩٩.٨٪',
    },
    summary: {
      en: 'Refrigerated commercial-grade anhydrous liquid ammonia loaded directly via dedicated deep-water marine terminals.',
      fa: 'آمونیاک مایع بی‌آب تبریدی با خلوص تجاری، بارگیری مستقیم از ترمینال‌های اختصاصی دریایی آب‌های عمیق.',
      ar: 'أمونيا سائلة لامائية مبردة بدرجة تجارية تُحمّل مباشرة عبر المحطات البحرية المتخصصة.',
    },
    overview: {
      en: 'Supplied via dedicated refrigerated marine loading arms at -33°C, PetroTechnics anhydrous ammonia meets strict low-oil and low-water specifications required by DAP/MAP/NPK fertilizer complexes and nitric acid producers across South Asia and the Mediterranean.',
      fa: 'آمونیاک بی‌آب پتروتکنیکس از طریق بازوهای بارگیری تبریدی در دمای منفی ۳۳ درجه سانتی‌گراد بارگیری شده و پاسخگوی استانداردهای سخت‌گیرانه کارخانه‌های DAP/MAP/NPK و اسید نیتریک در جنوب آسیا و مدیترانه است.',
      ar: 'تُورد عبر أذرع التحميل البحرية المبردة عند درجة -٣٣ مئوية وتلبي أدق معايير انخفاض الزيت والرطوبة لمصانع الأسمدة المركبة وحمض النيتريك.',
    },
    grades: [
      {
        code: 'Commercial Liquid NH3',
        application: {
          en: 'Phosphate & compound fertilizer synthesis (DAP, MAP, NPK)',
          fa: 'تولید کودهای فسفاته و مرکب (DAP، MAP، NPK)',
          ar: 'تصنيع الأسمدة الفوسفاتية والمركبة (DAP, MAP, NPK)',
        },
        keyMetric: 'NH3 ≥ 99.8% · Oil ≤ 5 ppm',
      },
      {
        code: 'Refrigeration / Industrial NH3',
        application: {
          en: 'Industrial cold-storage circuits, acrylonitrile & nitric acid',
          fa: 'سیکل‌های برودتی صنعتی، اکریلونیتریل و اسید نیتریک',
          ar: 'دوائر التبريد الصناعي والأكريلونيتريل وحمض النيتريك',
        },
        keyMetric: 'NH3 ≥ 99.9% · Water ≤ 0.1%',
      },
    ],
    specs: [
      { parameter: { en: 'Ammonia Purity', fa: 'خلوص آمونیاک', ar: 'نقاء الأمونيا' }, value: '99.8 min', unit: '% wt', method: 'ASTM E1899' },
      { parameter: { en: 'Water Content', fa: 'محتوای آب', ar: 'محتوى الماء' }, value: '0.2 max', unit: '% wt', method: 'Gravimetric' },
      { parameter: { en: 'Oil Content', fa: 'میزان روغن', ar: 'محتوى الزيت' }, value: '5.0 max', unit: 'ppm', method: 'IR Spectroscopy' },
      { parameter: { en: 'Loading Temperature', fa: 'دمای بارگیری', ar: 'درجة حرارة التحميل' }, value: '-33.0', unit: '°C', method: 'Terminal Gauge' },
      { parameter: { en: 'Iron (Fe)', fa: 'میزان آهن', ar: 'محتوى الحديد' }, value: '1.0 max', unit: 'ppm', method: 'ICP-OES' },
    ],
    applications: [
      { en: 'Primary feedstock for DAP, MAP, ammonium nitrate, and NPK production', fa: 'خوراک اصلی تولید کودهای DAP، MAP، نیترات آمونیوم و NPK', ar: 'مادة خام أساسية لإنتاج DAP وMAP ونترات الأمونيوم' },
      { en: 'Industrial refrigerant and NOx flue-gas abatement (SCR)', fa: 'مبرد صنعتی و کاهش اکسیدهای نیتروژن دودکش‌ها', ar: 'وسيط تبريد صناعي ومعالجة أكاسيد النيتروجين الصناعية' },
    ],
    packaging: [
      { en: 'Refrigerated LPG / Ammonia gas carriers (5,000–25,000 MT)', fa: 'کشتی‌های تبریدی حمل گاز آمونیاک (۵٬۰۰۰ تا ۲۵٬۰۰۰ تن)', ar: 'ناقلات الغاز المبردة للأمونيا (٥٬٠٠٠–٢٥٬٠٠٠ طن)' },
      { en: 'Pressurized ISO Tank Containers (T50) for regional lots', fa: 'ایزوتانک تحت فشار (T50) برای محموله‌های منطقه‌ای', ar: 'حاويات خزانات ISO مضغوطة (T50) للشحنات الإقليمية' },
    ],
    loadingPorts: ['Assaluyeh (Pars Port)', 'Bandar Imam Khomeini'],
    inspections: ['SGS', 'Intertek'],
  },
  {
    slug: 'hdpe',
    category: 'polymers',
    shortName: 'HDPE',
    formula: '(C2H4)n',
    casNumber: '9002-88-4',
    hsCode: '3901.20',
    featured: true,
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'High-Density Polyethylene (HDPE)',
      fa: 'پلی‌اتیلن سنگین (HDPE)',
      ar: 'بولي إيثيلين عالي الكثافة (HDPE)',
    },
    summary: {
      en: 'Full portfolio of film, blow molding, injection molding, and bimodal PE100 pipe extrusion grades.',
      fa: 'سبد کامل گریدهای فیلم، بادی، تزریقی و لوله PE100 بایمودال با یکنواختی پایدار تولید.',
      ar: 'مجموعة متكاملة من درجات الأفلام والنفخ والحقن وأنابيب PE100 ثنائية النسق.',
    },
    overview: {
      en: 'PetroTechnics exports virgin prime HDPE resins sourced from Tier-1 petrochemical units. Each lot ships with manufacturer COA, batch traceability, and SGS loading supervision for converters in Asia, CIS, Turkey, and Africa.',
      fa: 'پتروتکنیکس رزین‌های پلی‌اتیلن سنگین گرید اول را از واحدهای پیشرو پتروشیمی تامین می‌کند. هر محموله همراه با COA کارخانه، قابلیت ردیابی بچ تولید و نظارت بارگیری SGS برای تولیدکنندگان آسیا، CIS، ترکیه و آفریقا ارسال می‌شود.',
      ar: 'تصدر بتروتيكنيكس راتنجات HDPE البكر من الدرجة الأولى مع شهادة تحليل المصنع وإشراف التحميل من SGS للمصنعين في آسيا ورابطة الدول المستقلة وتركيا وأفريقيا.',
    },
    grades: [
      {
        code: 'HDPE EX5 / F7000 (Film)',
        application: {
          en: 'High-strength shopping bags, thin-gauge liners & industrial film',
          fa: 'کیسه‌های فروشگاهی مستحکم، فیلم‌های نازک و لاینر صنعتی',
          ar: 'أكياس تسوق عالية المتانة وأفلام رقيقة صناعية',
        },
        keyMetric: 'MFI 0.04–0.07 (2.16kg) · ρ 0.949',
      },
      {
        code: 'HDPE BL3 (Blow Molding)',
        application: {
          en: 'Jerrycans, detergent bottles, lube oil & chemical drums up to 20L',
          fa: 'گالن، بطری شوینده، ظروف روغن موتور و بشکه شیمیایی تا ۲۰ لیتر',
          ar: 'عبوات المنظفات وزيت المحركات والبراميل الكيميائية حتى ٢٠ لتر',
        },
        keyMetric: 'MFI 1.2 (5kg) · ESCR > 40h',
      },
      {
        code: 'HDPE 52518 / I4 (Injection)',
        application: {
          en: 'Beverage crates, industrial pails, caps & rigid housewares',
          fa: 'جعبه نوشابه، سطل صنعتی، درب بطری و لوازم خانگی مستحکم',
          ar: 'صناديق المشروبات والدلاء الصناعية والأغطية الصلبة',
        },
        keyMetric: 'MFI 18 g/10min · ρ 0.953',
      },
      {
        code: 'HDPE CRP100 / EX3 (Pipe)',
        application: {
          en: 'PE100 & PE80 pressurized water and gas distribution pipelines',
          fa: 'لوله‌های تحت فشار آبرسانی و گازرسانی PE100 و PE80',
          ar: 'أنابيب توزيع المياه والغاز المضغوطة PE100 وPE80',
        },
        keyMetric: 'MRS 10 MPa · Carbon Black 2.25%',
      },
    ],
    specs: [
      { parameter: { en: 'Density (23°C)', fa: 'دانسیته (۲۳ درجه)', ar: 'الكثافة (٢٣ مئوية)' }, value: '0.948–0.960', unit: 'g/cm³', method: 'ISO 1183' },
      { parameter: { en: 'Melt Flow Index (190°C / 2.16kg)', fa: 'شاخص جریان مذاب (MFI)', ar: 'مؤشر تدفق الذوبان (MFI)' }, value: '0.04–18.0', unit: 'g/10min', method: 'ISO 1133' },
      { parameter: { en: 'Tensile Stress at Yield', fa: 'تنش کششی در نقطه تسلیم', ar: 'إجهاد الشد عند الخضوع' }, value: '24–28', unit: 'MPa', method: 'ISO 527-2' },
      { parameter: { en: 'Vicat Softening Temp (A50)', fa: 'دمای نرمی ویکات', ar: 'حرارة التليين فيكات' }, value: '124–129', unit: '°C', method: 'ISO 306' },
      { parameter: { en: 'Ash Content', fa: 'محتوای خاکستر', ar: 'نسبة الرماد' }, value: '≤ 0.05', unit: '% wt', method: 'ISO 3451' },
    ],
    applications: [
      { en: 'Blown packaging film, shopping bags, and barrier liners', fa: 'فیلم‌های بسته‌بندی، کیسه‌های فروشگاهی و لاینرهای محافظ', ar: 'أفلام التغليف بالنفخ وأكياس التسوق والبطانات العازلة' },
      { en: 'Rigid chemical containers, automotive fuel tanks, and IBC drums', fa: 'ظروف سخت شیمیایی، باک خودرو و مخازن IBC', ar: 'الحاويات الكيميائية الصلبة وخزانات الوقود والبراميل' },
      { en: 'Municipal pressure water pipes, gas mains, and conduit tubing', fa: 'لوله‌های تحت فشار آب شهری، شبکه‌های گاز و داکت کابل', ar: 'أنابيب المياه المضغوطة وشبكات الغاز وقنوات الكابلات' },
    ],
    packaging: [
      { en: '25 kg FFS heavy-duty PE bags on 1,375 kg shrink-wrapped pallets', fa: 'کیسه ۲۵ کیلویی FFS روی پالت ۱٬۳۷۵ کیلویی با شرینک', ar: 'أكياس ٢٥ كجم FFS على طبليات ١٬٣٧٥ كجم مغلفة حرارياً' },
      { en: '24.75 MT payload per 40ft High-Cube container (18 pallets)', fa: 'بارگیری ۲۴.۷۵ تن در هر کانتینر ۴۰ فوت های‌کیوب', ar: 'حمولة ٢٤.٧٥ طن لكل حاوية ٤٠ قدماً عالية' },
    ],
    loadingPorts: ['Bandar Abbas', 'Assaluyeh', 'Bandar Imam Khomeini', 'Bazargan Overland'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'ldpe',
    category: 'polymers',
    shortName: 'LDPE',
    formula: '(C2H4)n',
    casNumber: '9002-88-4',
    hsCode: '3901.10',
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'Low-Density Polyethylene (LDPE)',
      fa: 'پلی‌اتیلن سبک (LDPE)',
      ar: 'بولي إيثيلين منخفض الكثافة (LDPE)',
    },
    summary: {
      en: 'High-clarity tubular and autoclave LDPE grades tailored for heavy-duty shrink film, lamination, and cable jacketing.',
      fa: 'گریدهای پلی‌اتیلن سبک توبولار و اتوکلاو با شفافیت بالا برای فیلم شرینک سنگین، لمینیشن و روکش کابل.',
      ar: 'درجات بولي إيثيلين منخفض الكثافة عالية الشفافية لأفلام الانكماش الثقيلة والتغليف وعزل الكابلات.',
    },
    overview: {
      en: 'Engineered for high optical clarity, low gel counts, and balanced machine/transverse drawability, our LDPE export portfolio covers heavy-duty shrink hoods, agricultural greenhouse films, extrusion coating, and wire & cable sheathing.',
      fa: 'پلی‌اتیلن سبک صادراتی ما با شفافیت نوری عالی، میزان ژل بسیار پایین و کشش‌پذیری متوازن، نیاز صنایع فیلم شرینک سنگین، فیلم گلخانه‌ای، پوشش‌دهی اکستروژن و روکش سیم و کابل را پوشش می‌دهد.',
      ar: 'يتميز بشفافية بصرية عالية وانخفاض شوائب الجل وقابلية سحب متوازنة لأفلام الصوب الزراعية والانكماش الثقيل وعزل الأسلاك والكابلات.',
    },
    grades: [
      {
        code: 'LDPE 2420H / 2420K',
        application: {
          en: 'Heavy-duty sacks, shrink hoods & agricultural greenhouse film',
          fa: 'کیسه‌های سنگین، فیلم شرینک و نایلون گلخانه‌ای',
          ar: 'الأكياس الثقيلة وأغطية الانكماش وأفلام الصوب الزراعية',
        },
        keyMetric: 'MFI 1.9 / 4.0 · ρ 0.923',
      },
      {
        code: 'LDPE 0075 / 0200',
        application: {
          en: 'High-impact thick films, industrial liners & cable insulation',
          fa: 'فیلم‌های ضخیم مقاوم به ضربه، لاینر صنعتی و عایق کابل',
          ar: 'أفلام سميكة مقاومة للصدمات وعزل الكابلات',
        },
        keyMetric: 'MFI 0.75–2.0 · High Melt Strength',
      },
      {
        code: 'LDPE 2102TX00 (Film)',
        application: {
          en: 'High-gloss packaging film with slip and anti-block additives',
          fa: 'فیلم بسته‌بندی براق حاوی افزودنی اسلیپ و آنتی‌بلاک',
          ar: 'أفلام تغليف عالية اللمعان مع إضافات الانزلاق ومضاد الالتصاق',
        },
        keyMetric: 'MFI 2.0 · Optical Haze < 7%',
      },
    ],
    specs: [
      { parameter: { en: 'Density (23°C)', fa: 'دانسیته (۲۳ درجه)', ar: 'الكثافة (٢٣ مئوية)' }, value: '0.920–0.925', unit: 'g/cm³', method: 'ISO 1183' },
      { parameter: { en: 'Melt Flow Index (190°C / 2.16kg)', fa: 'شاخص جریان مذاب', ar: 'مؤشر تدفق الذوبان' }, value: '0.3–4.0', unit: 'g/10min', method: 'ISO 1133' },
      { parameter: { en: 'Dart Drop Impact', fa: 'مقاومت ضربه دارت', ar: 'مقاومة الصدم' }, value: '120–210', unit: 'g', method: 'ASTM D1709' },
      { parameter: { en: 'Vicat Softening Point', fa: 'نقطه نرمی ویکات', ar: 'نقطة التليين فيكات' }, value: '93–98', unit: '°C', method: 'ISO 306' },
      { parameter: { en: 'Melting Temperature', fa: 'دمای ذوب', ar: 'درجة الانصهار' }, value: '110–113', unit: '°C', method: 'DSC' },
    ],
    applications: [
      { en: 'Collation shrink wrap, pallet hoods, and flexible food packaging', fa: 'فیلم شرینک بسته‌بندی، روکش پالت و بسته‌بندی انعطاف‌پذیر غذایی', ar: 'أفلام الانكماش وأغطية الطبليات وتغليف الأغذية المرن' },
      { en: 'Extrusion coating for liquid cartons and aluminum foil lamination', fa: 'پوشش‌دهی کارتن‌های مایعات و لمینیشن فویل آلومینیوم', ar: 'الطلاء بالبثق لكراتين السوائل وتصفيح رقائق الألومنيوم' },
      { en: 'Telecommunication and medium-voltage cable insulation', fa: 'عایق کابل‌های مخابراتی و فشار متوسط', ar: 'عزل كابلات الاتصالات والجهد المتوسط' },
    ],
    packaging: [
      { en: '25 kg PE bags on palletized 1,375 kg units (24.75 MT / 40ft HC)', fa: 'کیسه ۲۵ کیلویی روی پالت ۱٬۳۷۵ کیلویی (۲۴.۷۵ تن در کانتینر ۴۰ فوت)', ar: 'أكياس ٢٥ كجم على طبليات ١٬٣٧٥ كجم (٢٤.٧٥ طن لكل حاوية ٤٠ قدماً)' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bandar Imam Khomeini', 'Assaluyeh', 'Amirabad Caspian'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'lldpe',
    category: 'polymers',
    shortName: 'LLDPE',
    formula: '(C2H4)n',
    casNumber: '25087-34-7',
    hsCode: '3901.10',
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'Linear Low-Density Polyethylene (LLDPE)',
      fa: 'پلی‌اتیلن سبک خطی (LLDPE)',
      ar: 'بولي إيثيلين منخفض الكثافة الخطي (LLDPE)',
    },
    summary: {
      en: 'Butene and hexene co-monomer LLDPE resins engineered for high-puncture stretch film and rotational molding.',
      fa: 'رزین‌های پلی‌اتیلن سبک خطی با کوپلیمر بوتن و هگزن برای فیلم استرچ مقاوم به سوراخ‌شدگی و قالب‌گیری چرخشی.',
      ar: 'راتنجات LLDPE مصممة لأفلام التمدد المقاومة للثقب والقولبة الدورانية للخزانات.',
    },
    overview: {
      en: 'With superior puncture resistance, tear strength, and environmental stress crack resistance, PetroTechnics LLDPE grades serve cast/blown pallet stretch film lines, multilayer co-extrusion converters, and rotomolded water tank manufacturers.',
      fa: 'پلی‌اتیلن سبک خطی پتروتکنیکس با مقاومت برتر در برابر پارگی، سوراخ‌شدگی و تنش محیطی، خطوط فیلم استرچ پالت، اکستروژن چندلایه و تولیدکنندگان مخازن روتومولدینگ را تغذیه می‌کند.',
      ar: 'بفضل مقاومتها الفائقة للثقب والتمزق، تخدم درجات LLDPE خطوط أفلام التمدد والتغليف متعدد الطبقات ومصنعي خزانات المياه بالقولبة الدورانية.',
    },
    grades: [
      {
        code: 'LLDPE 0209AA / 0209KJ',
        application: {
          en: 'Blown general film, heavy-duty liners & multilayer lamination',
          fa: 'فیلم دمشی عمومی، لاینر سنگین و لمینیشن چندلایه',
          ar: 'أفلام النفخ العامة والبطانات الثقيلة والتغليف متعدد الطبقات',
        },
        keyMetric: 'MFI 0.9 · ρ 0.920 (Butene)',
      },
      {
        code: 'LLDPE 0220AA (Stretch)',
        application: {
          en: 'Cast pallet stretch wrap & cling film with high elongation',
          fa: 'فیلم استرچ پالت کست با کشش‌پذیری بالا',
          ar: 'أفلام تمدد الطبليات ذات الاستطالة العالية',
        },
        keyMetric: 'MFI 2.0 · Elongation > 650%',
      },
      {
        code: 'LLDPE 3840UA (Rotomolding)',
        application: {
          en: 'UV-stabilized water storage tanks, kayaks & agricultural bins',
          fa: 'مخازن ذخیره آب مقاوم به UV، قایق و وان‌های کشاورزی',
          ar: 'خزانات المياه المقاومة للأشعة فوق البنفسجية والحاويات الزراعية',
        },
        keyMetric: 'MFI 4.0 · ρ 0.938 · UV-8',
      },
    ],
    specs: [
      { parameter: { en: 'Density (23°C)', fa: 'دانسیته', ar: 'الكثافة' }, value: '0.918–0.938', unit: 'g/cm³', method: 'ASTM D1505' },
      { parameter: { en: 'Melt Flow Index (190°C / 2.16kg)', fa: 'شاخص جریان مذاب', ar: 'مؤشر تدفق الذوبان' }, value: '0.9–4.0', unit: 'g/10min', method: 'ASTM D1238' },
      { parameter: { en: 'Tensile Strength at Break', fa: 'استحکام کششی در شکست', ar: 'قوة الشد عند الكسر' }, value: '32–40', unit: 'MPa', method: 'ASTM D882' },
      { parameter: { en: 'Elongation at Break', fa: 'ازدیاد طول در شکست', ar: 'الاستطالة عند الكسر' }, value: '600–750', unit: '%', method: 'ASTM D882' },
      { parameter: { en: 'Elmendorf Tear Strength (MD)', fa: 'مقاومت پارگی المندورف', ar: 'مقاومة التمزق' }, value: '140–220', unit: 'g/mil', method: 'ASTM D1922' },
    ],
    applications: [
      { en: 'Pallet stretch wrap, silage wrap, and agricultural mulch film', fa: 'استرچ پالت، فیلم سیلاژ و نایلون مالچ کشاورزی', ar: 'أفلام تمدد الطبليات وتغطية السيلاج والملش الزراعي' },
      { en: 'Rotational molded water tanks and chemical storage vessels', fa: 'مخازن آب و ظروف شیمیایی تولیدشده به روش روتومولدینگ', ar: 'خزانات المياه والمواد الكيميائية بالقولبة الدورانية' },
    ],
    packaging: [
      { en: '25 kg FFS PE bags on shrink-wrapped pallets (24.75 MT / 40ft HC)', fa: 'کیسه ۲۵ کیلویی روی پالت با شرینک (۲۴.۷۵ تن در کانتینر ۴۰ فوت)', ar: 'أكياس ٢٥ كجم على طبليات (٢٤.٧٥ طن لكل حاوية ٤٠ قدماً)' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bandar Imam Khomeini', 'Amirabad Caspian'],
    inspections: ['SGS', 'Bureau Veritas'],
  },
  {
    slug: 'pp',
    category: 'polymers',
    shortName: 'PP',
    formula: '(C3H6)n',
    casNumber: '9003-07-0',
    hsCode: '3902.10',
    featured: true,
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'Polypropylene (PP Homo & Copolymer)',
      fa: 'پلی‌پروپیلن (PP هموپلیمر و کوپلیمر)',
      ar: 'بولي بروبيلين (متجانس وكوبوليمر)',
    },
    summary: {
      en: 'Versatile homopolymer, random, and impact copolymer PP grades for raffia woven sacks, BOPP film, BCF yarn, and automotive parts.',
      fa: 'گریدهای متنوع هموپلیمر، رندوم و ایمپکت کوپلیمر PP برای گونی بافی رافیا، فیلم BOPP، نخ BCF و قطعات خودرو.',
      ar: 'درجات متعددة من البولي بروبيلين المتجانس والعشوائي والمقاوم للصدمات لأكياس الرافيا وأفلام BOPP وقطع السيارات.',
    },
    overview: {
      en: 'PetroTechnics supplies consistent, low-ash Polypropylene across textile, woven packaging, thermoforming, BOPP flexible film, and rigid automotive/appliance compounding applications with guaranteed continuous quarterly allocation.',
      fa: 'پتروتکنیکس پلی‌پروپیلن با خاکستر پایین و کیفیت یکنواخت را در حوزه‌های نساجی، کیسه‌بافی، ترموفرمینگ، فیلم BOPP و کامپاندینگ قطعات خودرو با تخصیص فصلی پایدار عرضه می‌کند.',
      ar: 'تورد بتروتيكنيكس البولي بروبيلين منخفض الرماد لتطبيقات الغزل والنسيج وتصنيع الأكياس المنسوجة وأفلام BOPP وقطع السيارات بتخصيصات ربع سنوية منتظمة.',
    },
    grades: [
      {
        code: 'PP HP500H / Z30S (Raffia & Yarn)',
        application: {
          en: 'Woven FIBC jumbo bags, fertilizer sacks & carpet backing yarn',
          fa: 'جامبوبگ، کیسه‌های گونی‌بافی کود و نخ پشت فرش',
          ar: 'أكياس الجامبو المنسوجة وأكياس الأسمدة وخيوط السجاد',
        },
        keyMetric: 'MFI 3.0 / 25.0 · Homo',
      },
      {
        code: 'PP HP525J (BOPP Film)',
        application: {
          en: 'Biaxially oriented packaging films for food & tobacco',
          fa: 'فیلم‌های بسته‌بندی BOPP برای صنایع غذایی',
          ar: 'أفلام BOPP الموجهة ثنائياً لتغليف الأغذية',
        },
        keyMetric: 'MFI 3.2 · Low Ash',
      },
      {
        code: 'PP EP440G / EP548R (Impact Copolymer)',
        application: {
          en: 'Automotive bumpers, battery casings, pails & cold-chain crates',
          fa: 'سپر خودرو، بدنه باتری، سطل صنعتی و جعبه‌های سردخانه‌ای',
          ar: 'مصدات السيارات وهياكل البطاريات وصناديق التبريد',
        },
        keyMetric: 'Izod Impact > 10 kJ/m²',
      },
      {
        code: 'PP RP340N (Random Copolymer)',
        application: {
          en: 'High-transparency food containers, medical syringes & PPR pipes',
          fa: 'ظروف شفاف غذایی، سرنگ پزشکی و لوله‌های PPR',
          ar: 'عبوات الأغذية الشفافة والحقن الطبية وأنابيب PPR',
        },
        keyMetric: 'MFI 11.0 · High Clarity',
      },
    ],
    specs: [
      { parameter: { en: 'Melt Flow Rate (230°C / 2.16kg)', fa: 'شاخص جریان مذاب (۲۳۰ درجه)', ar: 'معدل تدفق الذوبان' }, value: '1.8–35.0', unit: 'g/10min', method: 'ISO 1133' },
      { parameter: { en: 'Density', fa: 'دانسیته', ar: 'الكثافة' }, value: '0.900–0.905', unit: 'g/cm³', method: 'ISO 1183' },
      { parameter: { en: 'Flexural Modulus', fa: 'مدول خمشی', ar: 'معامل الانحناء' }, value: '1,250–1,650', unit: 'MPa', method: 'ISO 178' },
      { parameter: { en: 'Notched Izod Impact (23°C)', fa: 'مقاومت ضربه آیزود', ar: 'مقاومة الصدم إيزود' }, value: '3.5–12.0', unit: 'kJ/m²', method: 'ISO 180' },
      { parameter: { en: 'Heat Deflection Temp (0.45 MPa)', fa: 'دمای تغییر شکل حرارتی', ar: 'حرارة التشوه الحراري' }, value: '88–105', unit: '°C', method: 'ISO 75' },
    ],
    applications: [
      { en: 'Woven polypropylene FIBC jumbo bags and agricultural sacks', fa: 'گونی‌های پلی‌پروپیلن، جامبوبگ و کیسه‌های کشاورزی', ar: 'أكياس البولي بروبيلين المنسوجة وأكياس الجامبو الزراعية' },
      { en: 'BCF carpet yarn, spunbond non-woven fabrics, and technical fibers', fa: 'نخ فرش BCF، منسوجات بی‌بافت اسپان‌باند و الیاف فنی', ar: 'خيوط السجاد والأقمشة غير المنسوجة والألياف التقنية' },
      { en: 'Automotive interiors, battery housings, and PPR hot-water pipes', fa: 'قطعات داخلی خودرو، بدنه باتری و لوله‌های آب گرم PPR', ar: 'الأجزاء الداخلية للسيارات وهياكل البطاريات وأنابيب PPR' },
    ],
    packaging: [
      { en: '25 kg PP/PE bags on pallets or loose stuffed (24.75–26 MT / 40ft HC)', fa: 'کیسه ۲۵ کیلویی پالت‌بندی یا فله کانتینری (۲۴.۷۵ تا ۲۶ تن)', ar: 'أكياس ٢٥ كجم على طبليات أو شحن مباشر (٢٤.٧٥–٢٦ طن)' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bandar Imam Khomeini', 'Bazargan Overland', 'Sharjah Hub'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'pvc',
    category: 'polymers',
    shortName: 'PVC',
    formula: '(C2H3Cl)n',
    casNumber: '9002-86-2',
    hsCode: '3904.10',
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'Polyvinyl Chloride (PVC Suspension Resin)',
      fa: 'پلی‌وینیل کلراید (PVC سوسپانسیونی)',
      ar: 'بولي فينيل كلورايد (PVC معلق)',
    },
    summary: {
      en: 'White free-flowing suspension PVC resins (K-Value 57 to 70) for uPVC window profiles, pressure pipes, and flexible cables.',
      fa: 'رزین پودری سفید PVC سوسپانسیونی با K-Value ۵۷ تا ۷۰ برای پروفیل پنجره uPVC، لوله تحت فشار و روکش کابل.',
      ar: 'راتنج PVC معلق أبيض بقيمة K بين ٥٧ و٧٠ لبروفيلات النوافذ والأنابيب المضغوطة والكابلات المرنة.',
    },
    overview: {
      en: 'Our suspension PVC portfolio (S6558, S6532, S6058, S7054) delivers tight particle size distribution, rapid plasticizer absorption, and low residual VCM (<1 ppm) for pipe, profile, flooring, and wire & cable extruders.',
      fa: 'رزین‌های PVC سوسپانسیونی ما (S6558، S6532، S6058، S7054) دارای توزیع اندازه ذرات یکنواخت، جذب سریع نرم‌کننده و VCM باقی‌مانده کمتر از ۱ ppm برای تولید لوله، پروفیل، کفپوش و سیم و کابل هستند.',
      ar: 'توفر درجات PVC المعلق توزيعاً دقيقاً لحجم الجزيئات وامتصاصاً سريعاً للملدنات ومحتوى VCM متبقي أقل من ١ جزء في المليون.',
    },
    grades: [
      {
        code: 'PVC S6558 / S65 (K-65)',
        application: {
          en: 'Rigid uPVC pressure pipes, window/door profiles & conduit fittings',
          fa: 'لوله‌های سخت uPVC، پروفیل در و پنجره و اتصالات',
          ar: 'أنابيب uPVC الصلبة وبروفيلات الأبواب والنوافذ',
        },
        keyMetric: 'K-Value 65–67 · Bulk ρ 0.54',
      },
      {
        code: 'PVC S7054 (K-70)',
        application: {
          en: 'Flexible wire & cable insulation, hoses, films & artificial leather',
          fa: 'عایق سیم و کابل انعطاف‌پذیر، شیلنگ و چرم مصنوعی',
          ar: 'عزل الأسلاك والكابلات المرنة والخراطيم والجلد الصناعي',
        },
        keyMetric: 'K-Value 69–71 · High Plasticizer Uptake',
      },
      {
        code: 'PVC S6058 (K-60)',
        application: {
          en: 'Injection molded pipe fittings, blister sheets & rigid packaging',
          fa: 'اتصالات تزریقی لوله، ورق بلیستر و بسته‌بندی سخت',
          ar: 'وصلات الأنابيب بالحقن وألواح التغليف الدوائي الصلب',
        },
        keyMetric: 'K-Value 59–61 · Easy Flow',
      },
    ],
    specs: [
      { parameter: { en: 'K-Value', fa: 'مقدار K', ar: 'قيمة K' }, value: '59–71', unit: '—', method: 'ISO 1628-2' },
      { parameter: { en: 'Bulk Density', fa: 'دانسیته توده', ar: 'الكثافة الظاهرية' }, value: '0.49–0.57', unit: 'g/cm³', method: 'ISO 60' },
      { parameter: { en: 'Volatile Matter (Moisture)', fa: 'مواد فرار و رطوبت', ar: 'المواد المتطايرة والرطوبة' }, value: '≤ 0.30', unit: '% wt', method: 'ISO 1269' },
      { parameter: { en: 'Residual VCM', fa: 'مونومر باقی‌مانده VCM', ar: 'مونومر VCM المتبقي' }, value: '≤ 1.0', unit: 'ppm', method: 'GC Headspace' },
      { parameter: { en: 'Particle Size (< 63 μm)', fa: 'ذرات ریزتر از ۶۳ میکرون', ar: 'حجم الجسيمات (< ٦٣ ميكرون)' }, value: '≤ 5.0', unit: '%', method: 'ISO 4610' },
    ],
    applications: [
      { en: 'Drainage, potable water pipes, and architectural uPVC window frames', fa: 'لوله‌های فاضلاب و آب شرب و پروفیل پنجره دوجداره uPVC', ar: 'أنابيب الصرف ومياه الشرب وإطارات نوافذ uPVC' },
      { en: 'Electrical cable jacketing, medical tubing, and vinyl flooring', fa: 'روکش کابل برق، شیلنگ‌های پزشکی و کفپوش وینیل', ar: 'تغليف الكابلات الكهربائية والأنابيب الطبية وأرضيات الفينيل' },
    ],
    packaging: [
      { en: '25 kg multi-ply kraft/PP bags or 1,200 kg FIBC jumbo bags', fa: 'کیسه ۲۵ کیلویی چندلایه کرافت/PP یا جامبوبگ ۱٬۲۰۰ کیلویی', ar: 'أكياس ٢٥ كجم متعددة الطبقات أو أكياس جامبو ١٬٢٠٠ كجم' },
    ],
    loadingPorts: ['Bandar Imam Khomeini', 'Bandar Abbas', 'Bazargan Overland'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'pet',
    category: 'polymers',
    shortName: 'PET',
    formula: '(C10H8O4)n',
    casNumber: '25038-59-9',
    hsCode: '3907.61',
    moqMt: 22,
    image: IMG_POLYMER,
    name: {
      en: 'Polyethylene Terephthalate (PET Resin)',
      fa: 'پلی‌اتیلن ترفتالات (PET بطری و نساجی)',
      ar: 'بولي إيثيلين تيريفثاليت (PET)',
    },
    summary: {
      en: 'Food-contact approved bottle grade PET (IV 0.80–0.84) with ultra-low acetaldehyde and bright textile chip grades.',
      fa: 'گرید بطری خوراکی PET با ویسکوزیته ذاتی ۰.۸۰ تا ۰.۸۴ و استالدهید بسیار پایین، به همراه گرید نساجی.',
      ar: 'راتنج PET للعبوات الغذائية بلزوجة ذاتية ٠.٨٠–٠.٨٤ ومحتوى أسيتالديهيد منخفض جداً بالإضافة لدرجات النسيج.',
    },
    overview: {
      en: 'Manufactured via continuous solid-state polycondensation (SSP), PetroTechnics PET bottle resins offer crystal transparency, minimal acetaldehyde (<1 ppm), and rapid reheat behavior for mineral water, CSD, and edible oil preforms.',
      fa: 'رزین‌های بطری PET پتروتکنیکس با فرآیند پلیمریزاسیون حالت جامد (SSP) تولید شده و دارای شفافیت کریستالی، استالدهید کمتر از ۱ ppm و گرمایش مجدد سریع برای پریفرم آب معدنی، نوشابه و روغن خوراکی هستند.',
      ar: 'تُنتج عبر البلمرة الصلبة المستمرة وتمنح شفافية فائقة وأسيتالديهيد أقل من ١ جزء بالمليون لقوالب عبوات المياه والمشروبات الغازية والزيوت.',
    },
    grades: [
      {
        code: 'PET BG-821 (Water & Oil)',
        application: {
          en: 'Still water bottles, edible oil jars & thermoformed trays',
          fa: 'بطری آب معدنی، ظروف روغن خوراکی و ظروف ترموفرمینگ',
          ar: 'عبوات المياه المعدنية وزيوت الطعام وصواني التشكيل الحراري',
        },
        keyMetric: 'IV 0.80 ± 0.02 · AA < 1.0 ppm',
      },
      {
        code: 'PET BG-825 (CSD Carbonated)',
        application: {
          en: 'Pressurized carbonated soft drink & hot-fill beverage preforms',
          fa: 'پریفرم نوشابه‌های گازدار تحت فشار و پرکن داغ',
          ar: 'قوالب المشروبات الغازية المضغوطة والتعبئة الساخنة',
        },
        keyMetric: 'IV 0.84 ± 0.02 · High Barrier',
      },
      {
        code: 'PET TG-641 (Textile Bright/Semi-Dull)',
        application: {
          en: 'POY, FDY polyester filament yarn & staple fibers',
          fa: 'نخ فیلامنت پلی‌استر POY و FDY و الیاف استیپل',
          ar: 'خيوط البوليستر المستمرة POY وFDY والألياف القصيرة',
        },
        keyMetric: 'IV 0.64 ± 0.015 · TiO2 0.3%',
      },
    ],
    specs: [
      { parameter: { en: 'Intrinsic Viscosity (IV)', fa: 'ویسکوزیته ذاتی (IV)', ar: 'اللزوجة الذاتية (IV)' }, value: '0.64 / 0.80 / 0.84', unit: 'dL/g', method: 'ASTM D4603' },
      { parameter: { en: 'Acetaldehyde (AA)', fa: 'میزان استالدهید', ar: 'محتوى الأسيتالديهيد' }, value: '≤ 1.0', unit: 'ppm', method: 'GC' },
      { parameter: { en: 'Color b-value', fa: 'شاخص رنگ b', ar: 'مؤشر اللون b' }, value: '≤ 1.5', unit: 'CIE Lab', method: 'Spectrophotometer' },
      { parameter: { en: 'Moisture Content', fa: 'رطوبت', ar: 'الرطوبة' }, value: '≤ 0.20', unit: '% wt', method: 'Karl Fischer' },
      { parameter: { en: 'Melting Point', fa: 'نقطه ذوب', ar: 'نقطة الانصهار' }, value: '248 ± 3', unit: '°C', method: 'DSC' },
    ],
    applications: [
      { en: 'Mineral water, carbonated beverages, and edible oil PET preforms', fa: 'پریفرم بطری آب معدنی، نوشابه گازدار و روغن خوراکی', ar: 'قوالب عبوات المياه والمشروبات الغازية والزيوت النباتية' },
      { en: 'Polyester textile yarns, strapping tapes, and APET food sheets', fa: 'نخ‌های نساجی پلی‌استر، تسمه بسته‌بندی و ورق APET غذایی', ar: 'خيوط البوليستر النسيجية وأشرطة الربط وألواح APET' },
    ],
    packaging: [
      { en: '1,100 kg moisture-barrier lined Jumbo Bags (22 MT / 20ft container)', fa: 'جامبوبگ ۱٬۱۰۰ کیلویی با لاینر ضد رطوبت (۲۲ تن در کانتینر ۲۰ فوت)', ar: 'أكياس جامبو ١٬١٠٠ كجم مبطنة ضد الرطوبة (٢٢ طن في حاوية ٢٠ قدماً)' },
    ],
    loadingPorts: ['Bandar Imam Khomeini', 'Bandar Abbas', 'Bazargan Overland'],
    inspections: ['SGS', 'Bureau Veritas'],
  },
  {
    slug: 'ps',
    category: 'polymers',
    shortName: 'GPPS / HIPS',
    formula: '(C8H8)n',
    casNumber: '9003-53-6',
    hsCode: '3903.19',
    moqMt: 24,
    image: IMG_POLYMER,
    name: {
      en: 'Polystyrene (GPPS & HIPS)',
      fa: 'پلی‌استایرن معمولی و مقاوم (GPPS / HIPS)',
      ar: 'بولي ستايرين (GPPS و HIPS)',
    },
    summary: {
      en: 'Optical crystal GPPS and high-impact HIPS resins engineered for thermoformed food packaging, refrigerator liners, and electronics.',
      fa: 'پلی‌استایرن کریستال شفاف و مقاوم به ضربه برای ظروف یکبارمصرف ترموفرمینگ، بدنه یخچال و قطعات الکترونیکی.',
      ar: 'بولي ستايرين شفاف وعالي الصدم للتغليف الحراري الغذائي وبطانات الثلاجات والقطع الإلكترونية.',
    },
    overview: {
      en: 'Available in general-purpose crystal (GPPS 1540 / 1160) and high-impact rubber-modified (HIPS 7240) variants, offering low residual styrene monomer (<400 ppm) and reliable dimensional stability in high-speed thermoforming and injection lines.',
      fa: 'در گریدهای کریستال عمومی (GPPS 1540 و 1160) و مقاوم به ضربه (HIPS 7240) با مونومر استایرن باقی‌مانده کمتر از ۴۰۰ ppm و پایداری ابعادی عالی برای خطوط سریع ترموفرمینگ و تزریق.',
      ar: 'متوفر بدرجات الكريستال العام والمقاوم للصدمات بنسبة مونومر متبقي أقل من ٤٠٠ جزء بالمليون وثبات أبعاد ممتاز لخطوط الحقن والتشكيل الحراري.',
    },
    grades: [
      {
        code: 'GPPS 1540 (High Heat Extrusion)',
        application: {
          en: 'XPS insulation foam, rigid crystal sheets & glossy food trays',
          fa: 'فوم عایق XPS، ورق شفاف و ظروف غذایی کریستالی',
          ar: 'ألواح العزل XPS والألواح الشفافة وصواني الأغذية',
        },
        keyMetric: 'MFI 11.0 · Vicat 101°C',
      },
      {
        code: 'HIPS 7240 (High Impact)',
        application: {
          en: 'Dairy cups, refrigerator inner liners & appliance housings',
          fa: 'ظروف لبنیات، بدنه داخلی یخچال و قاب لوازم خانگی',
          ar: 'عبوات الألبان وبطانات الثلاجات الداخلية وهياكل الأجهزة',
        },
        keyMetric: 'MFI 4.5 · Izod 9.5 kJ/m²',
      },
    ],
    specs: [
      { parameter: { en: 'Melt Flow Index (200°C / 5kg)', fa: 'شاخص جریان مذاب', ar: 'مؤشر تدفق الذوبان' }, value: '4.5–11.0', unit: 'g/10min', method: 'ISO 1133' },
      { parameter: { en: 'Vicat Softening Temp (B50)', fa: 'دمای نرمی ویکات', ar: 'حرارة التليين فيكات' }, value: '89–101', unit: '°C', method: 'ISO 306' },
      { parameter: { en: 'Residual Styrene Monomer', fa: 'مونومر استایرن باقی‌مانده', ar: 'مونومر الستايرين المتبقي' }, value: '≤ 400', unit: 'ppm', method: 'GC' },
      { parameter: { en: 'Specific Gravity', fa: 'وزن مخصوص', ar: 'الوزن النوعي' }, value: '1.04–1.05', unit: 'g/cm³', method: 'ISO 1183' },
    ],
    applications: [
      { en: 'Thermoformed dairy cups, disposable cutlery, and clear display sheets', fa: 'ظروف لبنیات ترموفرمینگ، ظروف یکبارمصرف و ورق‌های شفاف', ar: 'عبوات الألبان وأدوات المائدة والألواح الشفافة' },
      { en: 'Refrigerator door liners, TV housings, and XPS thermal insulation', fa: 'لاینر داخلی یخچال، بدنه لوازم برقی و فوم عایق حرارتی XPS', ar: 'بطانات أبواب الثلاجات وهياكل الأجهزة والعزل الحراري XPS' },
    ],
    packaging: [
      { en: '25 kg laminated woven bags or 1,000 kg jumbo bags', fa: 'کیسه ۲۵ کیلویی لمینت‌شده یا جامبوبگ ۱٬۰۰۰ کیلویی', ar: 'أكياس ٢٥ كجم مغلفة أو أكياس جامبو ١٬٠٠٠ كجم' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bazargan Overland', 'Bandar Imam Khomeini'],
    inspections: ['SGS', 'Intertek'],
  },
  {
    slug: 'abs-pc',
    category: 'polymers',
    shortName: 'ABS & PC',
    formula: 'Engineering',
    casNumber: '9003-56-9',
    hsCode: '3903.30',
    moqMt: 20,
    image: IMG_POLYMER,
    name: {
      en: 'ABS & Polycarbonate (Engineering Polymers)',
      fa: 'پلیمرهای مهندسی (ABS و پلی‌کربنات PC)',
      ar: 'البوليمرات الهندسية (ABS والبولي كربونات PC)',
    },
    summary: {
      en: 'High-gloss injection ABS (SD0150) and optical-clarity polycarbonate resins for automotive, appliances, and glazing sheets.',
      fa: 'ABS تزریقی با براقیت بالا و پلی‌کربنات نوری برای قطعات خودرو، لوازم خانگی و ورق‌های چندجداره.',
      ar: 'راتنجات ABS عالية اللمعان والبولي كربونات البصري لقطع السيارات والأجهزة الكهربائية وألواح التسقيف.',
    },
    overview: {
      en: 'Designed for demanding mechanical, thermal, and surface-finish standards, our ABS and Polycarbonate engineering grades deliver balanced stiffness, impact resistance, and dimensional stability for OEM molding and sheet extrusion.',
      fa: 'پلیمرهای مهندسی ABS و پلی‌کربنات ما برای استانداردهای سخت‌گیرانه مکانیکی، حرارتی و کیفیت سطح طراحی شده و استحکام، ضربه‌پذیری و ثبات ابعادی ایده‌آلی در تزریق و اکستروژن ورق ارائه می‌دهند.',
      ar: 'مصممة لتلبية أعلى المعايير الميكانيكية والحرارية والجمالية لقطاعات السيارات والأجهزة المنزلية وبثق الألواح المقاومة للصدمات.',
    },
    grades: [
      {
        code: 'ABS SD0150 (High Gloss Injection)',
        application: {
          en: 'Home appliances, automotive trims, luggage shells & consumer electronics',
          fa: 'لوازم خانگی، قطعات تزئینی خودرو، بدنه چمدان و الکترونیک',
          ar: 'الأجهزة المنزلية وديكور السيارات وهياكل الحقائب والإلكترونيات',
        },
        keyMetric: 'MFI 18 (220°C/10kg) · Izod 20 kJ/m²',
      },
      {
        code: 'PC 1110 / 1210 (Optical & Sheet)',
        application: {
          en: 'Multi-wall greenhouse panels, LED diffusers & safety helmets',
          fa: 'ورق‌های چندجداره گلخانه، دیفیوزر LED و کلاه ایمنی',
          ar: 'ألواح الصوب متعددة الجدران وناشرات الإضاءة والخوذات الواقية',
        },
        keyMetric: 'Light Transmittance 89% · MFR 10',
      },
    ],
    specs: [
      { parameter: { en: 'Melt Flow Rate', fa: 'شاخص جریان مذاب', ar: 'معدل تدفق الذوبان' }, value: '10–18', unit: 'g/10min', method: 'ISO 1133' },
      { parameter: { en: 'Notched Izod Impact (23°C)', fa: 'ضربه‌پذیری آیزود', ar: 'مقاومة الصدم إيزود' }, value: '20–65', unit: 'kJ/m²', method: 'ISO 180' },
      { parameter: { en: 'Heat Deflection Temp (1.8 MPa)', fa: 'دمای تغییر شکل حرارتی', ar: 'حرارة التشوه الحراري' }, value: '86 (ABS) / 132 (PC)', unit: '°C', method: 'ISO 75' },
      { parameter: { en: 'Tensile Strength', fa: 'استحکام کششی', ar: 'قوة الشد' }, value: '44–62', unit: 'MPa', method: 'ISO 527' },
    ],
    applications: [
      { en: 'OEM automotive dashboards, grilles, and impact-resistant appliance bodies', fa: 'داشبورد و جلوپنجره خودرو و بدنه مقاوم لوازم خانگی', ar: 'لوحات قيادة السيارات وهياكل الأجهزة المنزلية المقاومة للصدمات' },
      { en: 'Architectural polycarbonate glazing, safety visors, and optical lenses', fa: 'پوشش‌های معماری پلی‌کربنات، شیلد ایمنی و لنزهای نوری', ar: 'ألواح التسقيف المعمارية والدروع الواقية والعدسات البصرية' },
    ],
    packaging: [
      { en: '25 kg moisture-proof aluminum-lined bags (20–24 MT / 40ft HC)', fa: 'کیسه ۲۵ کیلویی لمینت آلومینیومی ضد رطوبت (۲۰ تا ۲۴ تن)', ar: 'أكياس ٢٥ كجم مبطنة بالألمنيوم ضد الرطوبة (٢٠–٢٤ طن)' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bandar Imam Khomeini', 'Bazargan Overland'],
    inspections: ['SGS', 'Bureau Veritas'],
  },
  {
    slug: 'methanol',
    category: 'chemicals',
    shortName: 'Methanol AA',
    formula: 'CH3OH',
    casNumber: '67-56-1',
    hsCode: '2905.11',
    featured: true,
    moqMt: 500,
    image: IMG_LOGISTICS,
    name: {
      en: 'Methanol Grade AA (99.85% Purity)',
      fa: 'متانول گرید AA (خلوص ۹۹.۸۵٪)',
      ar: 'ميثانول درجة AA (نقاء ٩٩.٨٥٪)',
    },
    summary: {
      en: 'IMPCA-specification Grade AA Methanol shipped via chemical parcel tankers and ISO tanks for MTO, formaldehyde, and acetic acid.',
      fa: 'متانول گرید AA مطابق استاندارد IMPCA قابل حمل با کشتی‌های شیمیایی‌بر و ایزوتانک برای صنایع MTO، فرمالدهید و اسید استیک.',
      ar: 'ميثانول درجة AA مطابق لمواصفات IMPCA يُشحن عبر ناقلات الكيماويات وخزانات ISO لصناعات الفورمالدهايد وحمض الأسيتيك.',
    },
    overview: {
      en: 'Sourced directly from world-scale natural-gas-fed methanol complexes in Assaluyeh and Mahshahr, our Methanol Grade AA strictly satisfies IMPCA purity, permanganate time, and low-ethanol criteria for chemical synthesis and marine bunker blending.',
      fa: 'متانول گرید AA پتروتکنیکس مستقیماً از مجتمع‌های مقیاس جهانی عسلویه و ماهشهر تامین شده و تمام پارامترهای استاندارد IMPCA از جمله زمان پرمنگنات و اتانول پایین را تضمین می‌کند.',
      ar: 'يُورد مباشرة من مجمعات الميثانول العملاقة ويلبي بالكامل معايير IMPCA للنقاء وزمن البرمنغنات وانخفاض الإيثانول.',
    },
    grades: [
      {
        code: 'IMPCA Grade AA (Bulk Tanker)',
        application: {
          en: 'MTO olefin units, acetic acid, MTBE & formaldehyde plants',
          fa: 'واحدهای MTO، اسید استیک، MTBE و فرمالدهید',
          ar: 'وحدات الأوليفينات وحمض الأسيتيك وMTBE والفورمالدهايد',
        },
        keyMetric: 'Purity ≥ 99.85% · Water ≤ 0.1%',
      },
      {
        code: 'ISO Tank & Drummed Methanol',
        application: {
          en: 'Regional biodiesel transesterification, solvents & wastewater denitrification',
          fa: 'تولید بیودیزل، حلال‌های صنعتی و تصفیه فاضلاب',
          ar: 'إنتاج الديزل الحيوي والمذيبات ومعالجة المياه الصناعية',
        },
        keyMetric: '20ft ISO Tank (20 MT) / 163kg Drums',
      },
    ],
    specs: [
      { parameter: { en: 'Purity (Dry Basis)', fa: 'خلوص (پایه خشک)', ar: 'النقاء (أساس جاف)' }, value: '99.85 min', unit: '% wt', method: 'IMPCA 001' },
      { parameter: { en: 'Water Content', fa: 'محتوای آب', ar: 'محتوى الماء' }, value: '0.10 max', unit: '% wt', method: 'ASTM E1064' },
      { parameter: { en: 'Ethanol', fa: 'میزان اتانول', ar: 'محتوى الإيثانول' }, value: '50 max', unit: 'mg/kg', method: 'IMPCA 001' },
      { parameter: { en: 'Permanganate Time (15°C)', fa: 'زمان پرمنگنات', ar: 'زمن البرمنغنات' }, value: '60 min', unit: 'min', method: 'ASTM D1363' },
      { parameter: { en: 'Color (Pt-Co)', fa: 'رنگ (Pt-Co)', ar: 'اللون (Pt-Co)' }, value: '5 max', unit: 'APHA', method: 'ASTM D1209' },
      { parameter: { en: 'Specific Gravity (20/20°C)', fa: 'وزن مخصوص', ar: 'الوزن النوعي' }, value: '0.791–0.793', unit: '—', method: 'ASTM D4052' },
    ],
    applications: [
      { en: 'Methanol-to-Olefins (MTO), formaldehyde resins, and acetic acid', fa: 'تبدیل متانول به الفین (MTO)، رزین فرمالدهید و اسید استیک', ar: 'تحويل الميثانول إلى أوليفينات وراتنجات الفورمالدهايد وحمض الأسيتيك' },
      { en: 'MTBE fuel oxygenate, biodiesel production, and clean marine fuel', fa: 'افزودنی سوخت MTBE، بیودیزل و سوخت پاک دریایی', ar: 'إضافات الوقود MTBE والديزل الحيوي والوقود البحري النظيف' },
    ],
    packaging: [
      { en: 'Bulk chemical parcel tankers (3,000–40,000 MT)', fa: 'کشتی‌های تانکر شیمیایی فله (۳٬۰۰۰ تا ۴۰٬۰۰۰ تن)', ar: 'ناقلات الكيماويات السائبة (٣٬٠٠٠–٤٠٬٠٠٠ طن)' },
      { en: '20ft ISO Tank Containers (20 MT) or 163 kg steel drums', fa: 'ایزوتانک ۲۰ فوت (۲۰ تن) یا بشکه فلزی ۱۶۳ کیلویی', ar: 'خزانات ISO ٢٠ قدماً (٢٠ طن) أو براميل فولاذية ١٦٣ كجم' },
    ],
    loadingPorts: ['Assaluyeh (Pars Port)', 'Bandar Imam Khomeini', 'Kharg Terminal'],
    inspections: ['SGS', 'Intertek'],
  },
  {
    slug: 'meg-deg',
    category: 'chemicals',
    shortName: 'MEG / DEG',
    formula: 'C2H6O2',
    casNumber: '107-21-1',
    hsCode: '2905.31',
    moqMt: 20,
    image: IMG_LOGISTICS,
    name: {
      en: 'Mono & Di-Ethylene Glycol (MEG / DEG)',
      fa: 'منو و دی اتیلن گلایکول (MEG / DEG)',
      ar: 'أحادي وثنائي إيثيلين جلايكول (MEG / DEG)',
    },
    summary: {
      en: 'Fiber-grade MEG (99.8% min) for polyester & PET polymerization and technical DEG for unsaturated polyester resins.',
      fa: 'منو اتیلن گلایکول گرید الیاف (خلوص ۹۹.۸٪) برای تولید پلی‌استر و PET و دی‌اتیلن گلایکول برای رزین‌های غیراشباع.',
      ar: 'أحادي إيثيلين جلايكول بدرجة الألياف (٩٩.٨٪) لإنتاج البوليستر وPET، وثنائي إيثيلين جلايكول للراتنجات الصناعية.',
    },
    overview: {
      en: 'Meeting high UV transmittance and ultra-low aldehyde specifications, PetroTechnics fiber-grade MEG and industrial DEG are dispatched in stainless steel ISO tanks, flexitanks, and 225 kg drums with full load-port assay.',
      fa: 'منو اتیلن گلایکول گرید الیاف و DEG صنعتی پتروتکنیکس با عبور نور UV بالا و آلدهید بسیار ناچیز در ایزوتانک استیل، فلکسی‌تانک و بشکه‌های ۲۲۵ کیلویی همراه با آنالیز کامل ارسال می‌شوند.',
      ar: 'يتميز بنفاذية عالية للأشعة فوق البنفسجية ونسب ضئيلة جداً من الألدهيدات، ويُشحن في خزانات ISO وفلكسي تانك وبراميل ٢٢٥ كجم.',
    },
    grades: [
      {
        code: 'MEG Fiber Grade (99.8%)',
        application: {
          en: 'PET bottle resin, polyester fibers & automotive coolants',
          fa: 'رزین بطری PET، الیاف پلی‌استر و ضدیخ خودرو',
          ar: 'راتنج PET للعبوات وألياف البوليستر وسوائل تبريد المحركات',
        },
        keyMetric: 'UV220nm ≥ 75% · Water ≤ 0.08%',
      },
      {
        code: 'DEG Technical Grade (99.5%)',
        application: {
          en: 'Unsaturated polyester resins (UPR), polyurethanes & gas dehydration',
          fa: 'رزین پلی‌استر غیراشباع (UPR)، پلی‌یورتان و نم‌زدایی گاز',
          ar: 'راتنجات البوليستر غير المشبع والبولي يوريثان وتجفيف الغاز',
        },
        keyMetric: 'Purity ≥ 99.5% · Color ≤ 10 APHA',
      },
    ],
    specs: [
      { parameter: { en: 'Purity (MEG)', fa: 'خلوص (MEG)', ar: 'النقاء (MEG)' }, value: '99.80 min', unit: '% wt', method: 'ASTM E202' },
      { parameter: { en: 'Water Content', fa: 'رطوبت', ar: 'محتوى الماء' }, value: '0.08 max', unit: '% wt', method: 'ASTM E203' },
      { parameter: { en: 'UV Transmittance @ 220 nm', fa: 'عبور UV در ۲۲۰ نانومتر', ar: 'نفاذية UV عند ٢٢٠ نانومتر' }, value: '75.0 min', unit: '%', method: 'ASTM E2193' },
      { parameter: { en: 'Aldehydes (as Acetaldehyde)', fa: 'میزان آلدهید', ar: 'محتوى الألدهيدات' }, value: '8.0 max', unit: 'ppm', method: 'Colorimetric' },
      { parameter: { en: 'Color (Pt-Co)', fa: 'رنگ (Pt-Co)', ar: 'اللون (Pt-Co)' }, value: '5 max', unit: 'APHA', method: 'ASTM D1209' },
    ],
    applications: [
      { en: 'Polyester fiber, PET packaging resin, and antifreeze formulations', fa: 'الیاف پلی‌استر، رزین PET و فرمولاسیون ضدیخ', ar: 'ألياف البوليستر وراتنج PET وتركيبات مانع التجمد' },
      { en: 'UPR fiberglass resins, brake fluids, and natural gas dehydration', fa: 'رزین فایبرگلاس، روغن ترمز و نم‌زدایی گاز طبیعی', ar: 'راتنجات الألياف الزجاجية وسوائل الفرامل وتجفيف الغاز الطبيعي' },
    ],
    packaging: [
      { en: 'ISO Tanks (22 MT), Flexitanks (22 MT), or 225 kg steel/HDPE drums', fa: 'ایزوتانک (۲۲ تن)، فلکسی‌تانک (۲۲ تن) یا بشکه ۲۲۵ کیلویی', ar: 'خزانات ISO (٢٢ طن) وفلكسي تانك أو براميل ٢٢٥ كجم' },
    ],
    loadingPorts: ['Assaluyeh', 'Bandar Imam Khomeini', 'Bandar Abbas'],
    inspections: ['SGS', 'Bureau Veritas'],
  },
  {
    slug: 'caustic-soda',
    category: 'chemicals',
    shortName: 'NaOH 98%',
    formula: 'NaOH',
    casNumber: '1310-73-2',
    hsCode: '2815.11',
    moqMt: 25,
    image: IMG_UREA,
    name: {
      en: 'Caustic Soda Flakes 98% (Sodium Hydroxide)',
      fa: 'سود پرک ۹۸٪ (هیدروکسید سدیم)',
      ar: 'الصودا الكاوية القشرية ٩٨٪ (هيدروكسيد الصوديوم)',
    },
    summary: {
      en: 'Membrane-cell grade 98%+ NaOH flakes with ultra-low iron and carbonate for alumina, pulp & paper, textiles, and detergents.',
      fa: 'سود پرک ممبرانی با خلوص بالای ۹۸٪ و آهن و کربنات بسیار پایین برای آلومینا، کاغذسازی، نساجی و شوینده‌ها.',
      ar: 'قشور الصودا الكاوية بدرجة الأغشية ونقاء ٩٨٪ فأكثر ومنخفضة الحديد لصناعة الألومينا والورق والنسيج والمنظفات.',
    },
    overview: {
      en: 'Produced exclusively via mercury-free membrane cell electrolysis, PetroTechnics Caustic Soda Flakes 98% deliver crisp white uniformity and rapid dissolution in moisture-sealed palletized export bags.',
      fa: 'سود پرک ۹۸٪ پتروتکنیکس به روش الکترولیز ممبرانی بدون جیوه تولید شده و با سفیدی یکنواخت و انحلال سریع در کیسه‌های ضد رطوبت پالت‌بندی‌شده صادر می‌شود.',
      ar: 'تُنتج بتقنية الخلايا الغشائية الخالية من الزئبق، وتتميز ببياض نقي وسرعة ذوبان عالية ضمن أكياس تصدير محكمة الإغلاق.',
    },
    grades: [
      {
        code: 'Caustic Soda Flakes 98% Min',
        application: {
          en: 'Alumina refining, detergent saponification, textiles & water treatment',
          fa: 'پالایش آلومینا، تولید شوینده، نساجی و تصفیه آب',
          ar: 'تكرير الألومينا وصناعة المنظفات والنسيج ومعالجة المياه',
        },
        keyMetric: 'NaOH ≥ 98.0% · Fe ≤ 20 ppm',
      },
      {
        code: 'Caustic Soda Pearls 99%',
        application: {
          en: 'Precision chemical dosing, pharma intermediates & oilfield drilling',
          fa: 'دوزینگ دقیق شیمیایی، واسطه‌های دارویی و حفاری نفت',
          ar: 'الجرعات الكيميائية الدقيقة والوسائط الدوائية وحفر الآبار',
        },
        keyMetric: 'NaOH ≥ 99.0% · Dust-Free Prills',
      },
    ],
    specs: [
      { parameter: { en: 'Sodium Hydroxide (NaOH)', fa: 'هیدروکسید سدیم (NaOH)', ar: 'هيدروكسيد الصوديوم (NaOH)' }, value: '98.0 min', unit: '% wt', method: 'ASTM E291' },
      { parameter: { en: 'Sodium Carbonate (Na2CO3)', fa: 'کربنات سدیم', ar: 'كربونات الصوديوم' }, value: '0.8 max', unit: '% wt', method: 'Titration' },
      { parameter: { en: 'Sodium Chloride (NaCl)', fa: 'کلرید سدیم', ar: 'كلوريد الصوديوم' }, value: '0.05 max', unit: '% wt', method: 'Argentometric' },
      { parameter: { en: 'Iron (as Fe2O3)', fa: 'میزان آهن', ar: 'أكسيد الحديد' }, value: '0.002 max', unit: '% wt', method: 'ICP-OES' },
    ],
    applications: [
      { en: 'Pulp & paper bleaching, textile mercerization, and soap manufacturing', fa: 'رنگ‌بری خمیر کاغذ، مرسریزه نساجی و تولید صابون و شوینده', ar: 'تبييض لب الورق ومعالجة المنسوجات وصناعة الصابون والمنظفات' },
      { en: 'Oil refinery sweetening, drilling mud pH control, and mineral leaching', fa: 'شیرین‌سازی پالایشگاهی، کنترل pH گل حفاری و فرآوری معادن', ar: 'تحلية المنتجات النفطية وضبط حموضة سوائل الحفر ومعالجة المعادن' },
    ],
    packaging: [
      { en: '25 kg laminated PP/PE bags on heat-treated wooden pallets (25 MT / 20ft)', fa: 'کیسه ۲۵ کیلویی لمینت روی پالت چوبی تیمار حرارتی (۲۵ تن در ۲۰ فوت)', ar: 'أكياس ٢٥ كجم مغلفة على طبليات خشبية معالجة حرارياً (٢٥ طن)' },
      { en: '1,000 kg Jumbo Bags with double inner PE liner', fa: 'جامبوبگ ۱٬۰۰۰ کیلویی با دو لایه داخلی PE', ar: 'أكياس جامبو ١٬٠٠٠ كجم ببطانة PE مزدوجة' },
    ],
    loadingPorts: ['Bandar Abbas', 'Bandar Imam Khomeini', 'Bazargan Overland'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
  {
    slug: 'bitumen',
    category: 'chemicals',
    shortName: 'Bitumen 60/70',
    formula: 'Asphalt',
    casNumber: '8052-42-4',
    hsCode: '2713.20',
    moqMt: 100,
    image: IMG_LOGISTICS,
    name: {
      en: 'Penetration Grade Bitumen (60/70 & 80/100)',
      fa: 'قیر نفوذی صادراتی (۶۰/۷۰ و ۸۰/۱۰۰)',
      ar: 'البيتومين النفوذي (٦٠/٧٠ و ٨٠/١٠٠)',
    },
    summary: {
      en: 'Vacuum-bottom refined paving grade bitumen (60/70, 80/100, VG30) supplied in new steel drums, jumbo bags, and bulk bitumen tankers.',
      fa: 'قیر راهسازی پالایشگاهی (۶۰/۷۰، ۸۰/۱۰۰ و VG30) در بشکه نو، جامبوبگ و کشتی حمل قیر فله.',
      ar: 'بيتومين رصف طرق بدرجات (٦٠/٧٠ و ٨٠/١٠٠ و VG30) في براميل فولاذية جديدة وأكياس جامبو وناقلات سائبة.',
    },
    overview: {
      en: 'Refined from selected heavy vacuum bottom feedstock, PetroTechnics Penetration Grade Bitumen meets ASTM D946 and IS 73 (VG30/VG40) specifications for highway asphalt concrete, airport runways, and waterproofing membranes.',
      fa: 'قیر نفوذی پتروتکنیکس از خوراک منتخب وکیوم باتوم پالایشگاهی تولید شده و مطابق استاندارد ASTM D946 و IS 73 برای آسفالت بزرگراه‌ها، باند فرودگاه و عایق‌های رطوبتی عرضه می‌گردد.',
      ar: 'مكرر من أثقل خامات التقطير الفراغي ومطابق لمواصفات ASTM D946 وIS 73 لرصف الطرق السريعة ومدارج المطارات وأغشية العزل المائي.',
    },
    grades: [
      {
        code: 'Bitumen 60/70 (ASTM D946)',
        application: {
          en: 'Heavy-traffic highways, hot-mix asphalt & tropical climates',
          fa: 'بزرگراه‌های پرتردد، آسفالت گرم و اقلیم‌های گرمسیری',
          ar: 'الطرق السريعة ذات الكثافة المرورية العالية والمناخات الحارة',
        },
        keyMetric: 'Pen 60–70 dmm · Softening 49–56°C',
      },
      {
        code: 'Bitumen 80/100',
        application: {
          en: 'Moderate/cold climate paving, surface dressing & emulsions',
          fa: 'راهسازی مناطق معتدل و سردسیر و تولید قیر امولسیون',
          ar: 'رصف الطرق في المناخات المعتدلة والباردة والمستحلبات',
        },
        keyMetric: 'Pen 80–100 dmm · Softening 45–52°C',
      },
      {
        code: 'Bitumen VG30 / VG40',
        application: {
          en: 'Indian & South Asian highway specifications (IS 73:2013)',
          fa: 'استاندارد بزرگراه‌های هند و جنوب آسیا (IS 73)',
          ar: 'مواصفات الطرق السريعة في الهند وجنوب آسيا (IS 73)',
        },
        keyMetric: 'Abs. Viscosity ≥ 2,400 Poise',
      },
    ],
    specs: [
      { parameter: { en: 'Penetration @ 25°C', fa: 'درجه نفوذ در ۲۵ درجه', ar: 'درجة الاختراق عند ٢٥ مئوية' }, value: '60–70 / 80–100', unit: '0.1 mm', method: 'ASTM D5' },
      { parameter: { en: 'Softening Point (Ring & Ball)', fa: 'نقطه نرمی', ar: 'نقطة التليين' }, value: '49–56', unit: '°C', method: 'ASTM D36' },
      { parameter: { en: 'Ductility @ 25°C', fa: 'انگمی (کشش‌پذیری)', ar: 'الليونة عند ٢٥ مئوية' }, value: '100 min', unit: 'cm', method: 'ASTM D113' },
      { parameter: { en: 'Flash Point (Cleveland Open Cup)', fa: 'نقطه اشتعال', ar: 'نقطة الوميض' }, value: '250 min', unit: '°C', method: 'ASTM D92' },
      { parameter: { en: 'Solubility in TCE', fa: 'حلالیت در TCE', ar: 'الذوبان في TCE' }, value: '99.5 min', unit: '% wt', method: 'ASTM D2042' },
    ],
    applications: [
      { en: 'Highway construction, airport runways, and port container yards', fa: 'ساخت بزرگراه‌ها، باند فرودگاه و محوطه‌های کانتینری بنادر', ar: 'إنشاء الطرق السريعة ومدارج المطارات وساحات الحاويات' },
      { en: 'Polymer-modified bitumen (PMB) and SBS waterproofing membranes', fa: 'قیر اصلاح‌شده با پلیمر (PMB) و ایزوگام و عایق‌های SBS', ar: 'البيتومين المعدل بالبوليمر وأغشية العزل المائي SBS' },
    ],
    packaging: [
      { en: '180 kg new embossed steel drums (110 drums / 20ft container)', fa: 'بشکه فلزی نو ۱۸۰ کیلویی (۱۱۰ بشکه در کانتینر ۲۰ فوت)', ar: 'براميل فولاذية جديدة ١٨٠ كجم (١١٠ برميلاً لكل حاوية ٢٠ قدماً)' },
      { en: '300 kg / 1,000 kg Polybag Jumbo Bags or Bulk Bitumen Tanker', fa: 'جامبوبگ ۳۰۰ و ۱٬۰۰۰ کیلویی یا کشتی فله‌بر قیر', ar: 'أكياس جامبو ٣٠٠ و ١٬٠٠٠ كجم أو ناقلات البيتومين السائبة' },
    ],
    loadingPorts: ['Bandar Abbas', 'Jebel Ali / Sharjah Hub'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  },
];
