use crate::models::{LocalizedText, Product, ProductGrade, SpecRow, TradeCorridorSummary};

fn loc(en: &str, fa: &str, ar: &str) -> LocalizedText {
    LocalizedText {
        en: en.to_string(),
        fa: fa.to_string(),
        ar: ar.to_string(),
    }
}

pub fn seed_products() -> Vec<Product> {
    vec![
        Product {
            slug: "urea-46".into(),
            category: "fertilizers".into(),
            short_name: "Urea 46% N".into(),
            formula: "CO(NH2)2".into(),
            cas_number: "57-13-6".into(),
            hs_code: "3102.10".into(),
            moq_mt: 500,
            name: loc(
                "Urea 46% Nitrogen (Prilled & Granular)",
                "اوره ۴۶٪ نیتروژن (پریل و گرانول)",
                "يوريا ٤٦٪ نيتروجين (محببة وبريل)",
            ),
            summary: loc(
                "High-nitrogen agricultural and industrial grade urea with anti-caking treatment.",
                "اوره کشاورزی و صنعتی با خلوص ۴۶٪ نیتروژن و تیمار ضدکلوخه.",
                "يوريا زراعية وصناعية عالية النيتروجين مع معالجة مضادة للتكتل.",
            ),
            loading_ports: vec![
                "Assaluyeh (Pars Port)".into(),
                "Bandar Imam Khomeini".into(),
                "Bandar Abbas".into(),
            ],
            inspections: vec!["SGS".into(), "Bureau Veritas".into(), "Intertek".into()],
            grades: vec![
                ProductGrade {
                    code: "Urea 46% Granular".into(),
                    application: loc(
                        "Broad-acre spreading & bulk blending (2.0-4.0 mm)",
                        "کودپاشی مکانیزه و ترکیب فله",
                        "التسميد الآلي والخلط السائب",
                    ),
                    key_metric: "N >= 46.0% · Biuret <= 1.0%".into(),
                },
                ProductGrade {
                    code: "Urea 46% Prilled".into(),
                    application: loc(
                        "Direct soil application & resin synthesis (1.0-2.8 mm)",
                        "کاربرد مستقیم خاکی و تولید رزین",
                        "التطبيق المباشر للتربة وصناعة الراتنجات",
                    ),
                    key_metric: "N >= 46.0% · Moisture <= 0.5%".into(),
                },
            ],
            specs: vec![
                SpecRow {
                    parameter: loc("Total Nitrogen", "نیتروژن کل", "النيتروجين الكلي"),
                    value: "46.0 min".into(),
                    unit: "% wt".into(),
                    method: "AOAC 955.04".into(),
                },
                SpecRow {
                    parameter: loc("Biuret Content", "میزان بیورت", "محتوى البيوريت"),
                    value: "1.0 max".into(),
                    unit: "% wt".into(),
                    method: "ISO 2754".into(),
                },
            ],
        },
        Product {
            slug: "granular-sulfur".into(),
            category: "fertilizers".into(),
            short_name: "Sulfur 99.9%".into(),
            formula: "S8".into(),
            cas_number: "7704-34-9".into(),
            hs_code: "2503.00".into(),
            moq_mt: 500,
            name: loc(
                "Granular & Lump Sulfur 99.9%",
                "گوگرد گرانول و کلوخه ۹۹.۹٪",
                "الكبريت المحبب والكتلي ٩٩.٩٪",
            ),
            summary: loc(
                "Bright yellow formed granular sulfur engineered for dust-free bulk export.",
                "گوگرد گرانول زرد روشن با خلوص ۹۹.۹٪ مناسب حمل دریایی فله.",
                "كبريت محبب أصفر بنقاء ٩٩.٩٪ مخصص للشحن البحري السائب.",
            ),
            loading_ports: vec!["Bandar Abbas".into(), "Assaluyeh".into()],
            inspections: vec!["SGS".into(), "Bureau Veritas".into(), "Intertek".into()],
            grades: vec![ProductGrade {
                code: "Bright Yellow Granular (2-6 mm)".into(),
                application: loc(
                    "Sulfuric acid & DAP/MAP phosphate plants",
                    "واحدهای اسید سولفوریک و کود فسفاته",
                    "مصانع حمض الكبريتيك والأسمدة الفوسفاتية",
                ),
                key_metric: "Purity >= 99.9% · Ash <= 0.03%".into(),
            }],
            specs: vec![SpecRow {
                parameter: loc("Purity (Dry Basis)", "خلوص (پایه خشک)", "النقاء (أساس جاف)"),
                value: "99.9 min".into(),
                unit: "% wt".into(),
                method: "ASTM D4045".into(),
            }],
        },
        Product {
            slug: "hdpe".into(),
            category: "polymers".into(),
            short_name: "HDPE".into(),
            formula: "(C2H4)n".into(),
            cas_number: "9002-88-4".into(),
            hs_code: "3901.20".into(),
            moq_mt: 24,
            name: loc(
                "High-Density Polyethylene (HDPE)",
                "پلی‌اتیلن سنگین (HDPE)",
                "بولي إيثيلين عالي الكثافة (HDPE)",
            ),
            summary: loc(
                "Film, blow molding, injection molding, and bimodal PE100 pipe grades.",
                "گریدهای فیلم، بادی، تزریقی و لوله PE100 بایمودال.",
                "درجات الأفلام والنفخ والحقن وأنابيب PE100.",
            ),
            loading_ports: vec![
                "Bandar Abbas".into(),
                "Assaluyeh".into(),
                "Bazargan Overland".into(),
            ],
            inspections: vec!["SGS".into(), "Bureau Veritas".into(), "Intertek".into()],
            grades: vec![
                ProductGrade {
                    code: "HDPE EX5 / F7000 (Film)".into(),
                    application: loc("High-strength shopping bags & thin film", "فیلم نازک و کیسه‌های مستحکم", "أفلام رقيقة وأكياس متينة"),
                    key_metric: "MFI 0.04-0.07 · Density 0.949".into(),
                },
                ProductGrade {
                    code: "HDPE BL3 (Blow Molding)".into(),
                    application: loc("Jerrycans, detergent bottles & drums", "گالن و ظروف شوینده و شیمیایی", "عبوات المنظفات والبراميل"),
                    key_metric: "MFI 1.2 (5kg) · ESCR > 40h".into(),
                },
            ],
            specs: vec![SpecRow {
                parameter: loc("Density (23C)", "دانسیته", "الكثافة"),
                value: "0.948-0.960".into(),
                unit: "g/cm3".into(),
                method: "ISO 1183".into(),
            }],
        },
        Product {
            slug: "methanol".into(),
            category: "chemicals".into(),
            short_name: "Methanol AA".into(),
            formula: "CH3OH".into(),
            cas_number: "67-56-1".into(),
            hs_code: "2905.11".into(),
            moq_mt: 500,
            name: loc(
                "Methanol Grade AA (99.85% Purity)",
                "متانول گرید AA (خلوص ۹۹.۸۵٪)",
                "ميثانول درجة AA (نقاء ٩٩.٨٥٪)",
            ),
            summary: loc(
                "IMPCA-specification Grade AA Methanol for chemical tankers and ISO tanks.",
                "متانول گرید AA مطابق استاندارد IMPCA برای کشتی تانکر و ایزوتانک.",
                "ميثانول مطابق لمواصفات IMPCA للشحن بالناقلات وخزانات ISO.",
            ),
            loading_ports: vec!["Assaluyeh (Pars Port)".into(), "Bandar Imam Khomeini".into()],
            inspections: vec!["SGS".into(), "Intertek".into()],
            grades: vec![ProductGrade {
                code: "IMPCA Grade AA".into(),
                application: loc("MTO olefin, formaldehyde & acetic acid", "واحدهای MTO، فرمالدهید و اسید استیک", "وحدات الأوليفينات والفورمالدهايد"),
                key_metric: "Purity >= 99.85% · Water <= 0.1%".into(),
            }],
            specs: vec![SpecRow {
                parameter: loc("Purity (Dry Basis)", "خلوص", "النقاء"),
                value: "99.85 min".into(),
                unit: "% wt".into(),
                method: "IMPCA 001".into(),
            }],
        },
    ]
}

pub fn seed_corridors() -> Vec<TradeCorridorSummary> {
    vec![
        TradeCorridorSummary {
            id: "south-asia".into(),
            region: loc("South Asia Maritime", "مسیر دریایی جنوب آسیا", "الممر البحري لجنوب آسيا"),
            mode: "maritime".into(),
            transit_days: "5-11".into(),
            loading_ports: vec!["Bandar Abbas".into(), "Assaluyeh".into()],
            commodities: vec!["Urea 46% N".into(), "Granular Sulfur".into(), "HDPE".into(), "Bitumen 60/70".into()],
        },
        TradeCorridorSummary {
            id: "east-asia".into(),
            region: loc("China & East Asia", "چین و شرق آسیا", "الصين وشرق آسيا"),
            mode: "maritime".into(),
            transit_days: "16-24".into(),
            loading_ports: vec!["Assaluyeh".into(), "Bandar Imam Khomeini".into()],
            commodities: vec!["Methanol AA".into(), "MEG / DEG".into(), "HDPE / LDPE".into()],
        },
        TradeCorridorSummary {
            id: "cis-caspian".into(),
            region: loc("CIS & Caspian Sea", "کریدور شمال (CIS و خزر)", "رابطة الدول المستقلة وقزوين"),
            mode: "caspian".into(),
            transit_days: "4-9".into(),
            loading_ports: vec!["Amirabad Caspian".into(), "Sarakhs Rail Border".into()],
            commodities: vec!["PP Raffia".into(), "HDPE".into(), "PVC S65".into()],
        },
        TradeCorridorSummary {
            id: "turkey-europe".into(),
            region: loc("Turkey & Eastern Europe", "کریدور غرب (ترکیه و اروپا)", "تركيا وأوروبا الشرقية"),
            mode: "overland".into(),
            transit_days: "4-12".into(),
            loading_ports: vec!["Bazargan / Tabriz Desk".into(), "Bandar Abbas -> Mersin".into()],
            commodities: vec!["HDPE Film".into(), "LDPE".into(), "PET".into(), "Urea 46% N".into()],
        },
    ]
}
