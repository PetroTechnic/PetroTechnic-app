import { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type {
  InspectionAgency,
  Product,
  ProductCategory,
} from '../../types/domain';
import { IMG_POLYMER, IMG_SULFUR, IMG_UREA } from '../../data/catalog';
import {
  deleteProduct,
  sanitizeDocId,
  saveProduct,
} from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';

interface AdminProductsPanelProps {
  products: Product[];
  canEdit: boolean;
  canDelete: boolean;
}

const DEFAULT_IMAGE_BY_CATEGORY: Record<ProductCategory, string> = {
  polymers: IMG_POLYMER,
  fertilizers: IMG_UREA,
  chemicals: IMG_SULFUR,
};

function createBlankProduct(): Product {
  return {
    slug: '',
    category: 'polymers',
    shortName: '',
    formula: '',
    casNumber: '',
    hsCode: '',
    moqMt: 25,
    fobUsdMt: 950,
    image: IMG_POLYMER,
    featured: false,
    name: { en: '', fa: '', ar: '' },
    summary: { en: '', fa: '', ar: '' },
    overview: { en: '', fa: '', ar: '' },
    grades: [
      {
        code: 'Standard Export Grade',
        application: {
          en: 'Industrial conversion & export allocation',
          fa: 'کاربرد صنعتی و تخصیص صادراتی',
          ar: 'التحويل الصناعي والتخصيص التصديري',
        },
        keyMetric: 'Prime Virgin Grade',
      },
    ],
    specs: [
      {
        parameter: { en: 'Purity / Assay', fa: 'خلوص', ar: 'النقاء' },
        value: '99.0 min',
        unit: '% wt',
        method: 'ASTM',
      },
    ],
    applications: [
      {
        en: 'Industrial manufacturing & packaging',
        fa: 'تولید صنعتی و بسته‌بندی',
        ar: 'التصنيع الصناعي والتغليف',
      },
    ],
    packaging: [
      {
        en: '25 kg export bags on ISPM-15 pallets',
        fa: 'کیسه صادراتی ۲۵ کیلویی روی پالت ISPM-15',
        ar: 'أكياس تصدير ٢٥ كجم على طبليات ISPM-15',
      },
    ],
    loadingPorts: ['Bandar Abbas', 'Assaluyeh'],
    inspections: ['SGS', 'Bureau Veritas', 'Intertek'],
  };
}

export function AdminProductsPanel({
  products,
  canEdit,
  canDelete,
}: AdminProductsPanelProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [inlinePrices, setInlinePrices] = useState<Record<string, string>>({});
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [portsText, setPortsText] = useState('');
  const [gradesText, setGradesText] = useState('');
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.shortName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.hsCode.toLowerCase().includes(q) ||
        p.casNumber.toLowerCase().includes(q)
      );
    });
  }, [products, search, categoryFilter]);

  const openNewDrawer = () => {
    const blank = createBlankProduct();
    setEditing(blank);
    setIsNew(true);
    setPortsText(blank.loadingPorts.join(', '));
    setGradesText(blank.grades.map((g) => `${g.code} | ${g.keyMetric}`).join('\n'));
    setErrorMsg(null);
  };

  const openEditDrawer = (product: Product) => {
    setEditing(structuredClone(product));
    setIsNew(false);
    setPortsText(product.loadingPorts.join(', '));
    setGradesText(
      product.grades.map((g) => `${g.code} | ${g.keyMetric}`).join('\n'),
    );
    setErrorMsg(null);
  };

  const handleQuickSavePrice = async (product: Product) => {
    const rawVal = inlinePrices[product.slug];
    const parsed = Number(rawVal);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100000) {
      setErrorMsg('FOB price must be a positive number under 100,000 USD/MT.');
      return;
    }
    setErrorMsg(null);
    setSavingSlug(product.slug);
    try {
      await saveProduct({ ...product, fobUsdMt: parsed }, product);
      setSavedSlug(product.slug);
      setTimeout(() => {
        setSavedSlug((cur) => (cur === product.slug ? null : cur));
      }, 1800);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setSavingSlug(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setSavingSlug(product.slug);
    setErrorMsg(null);
    try {
      await saveProduct({ ...product, featured: !product.featured }, product);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setSavingSlug(null);
    }
  };

  const handleSaveDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setErrorMsg(null);

    const slug = sanitizeDocId(editing.slug || editing.shortName);
    if (!slug) {
      setErrorMsg('Please enter a valid slug or short name.');
      return;
    }
    if (!editing.name.en.trim()) {
      setErrorMsg('English product name is required.');
      return;
    }

    const loadingPorts = portsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (loadingPorts.length === 0) {
      setErrorMsg('At least one loading port is required.');
      return;
    }

    const parsedGrades = gradesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const [codePart, metricPart] = line.split('|').map((s) => s.trim());
        const existing = editing.grades[idx];
        return {
          code: codePart || `Grade ${idx + 1}`,
          keyMetric: metricPart || existing?.keyMetric || 'Export Standard',
          application: existing?.application ?? {
            en: 'Commercial export allocation',
            fa: 'تخصیص صادراتی',
            ar: 'تخصيص تصديري',
          },
        };
      });

    if (parsedGrades.length === 0) {
      setErrorMsg('At least one export grade is required.');
      return;
    }

    const fallbackName = editing.name.en.trim();
    const fallbackSummary =
      editing.summary.en.trim() || `${fallbackName} export supply from PetroTechnics.`;
    const fallbackOverview = editing.overview.en.trim() || fallbackSummary;

    const payload: Product = {
      ...editing,
      slug,
      shortName: editing.shortName.trim() || fallbackName.slice(0, 40),
      formula: editing.formula.trim() || 'N/A',
      casNumber: editing.casNumber.trim() || 'N/A',
      hsCode: editing.hsCode.trim() || '3901.10',
      moqMt: Math.max(1, Number(editing.moqMt) || 25),
      fobUsdMt: Math.max(1, Number(editing.fobUsdMt) || 500),
      image:
        editing.image.trim() || DEFAULT_IMAGE_BY_CATEGORY[editing.category],
      name: {
        en: fallbackName,
        fa: editing.name.fa.trim() || fallbackName,
        ar: editing.name.ar.trim() || fallbackName,
      },
      summary: {
        en: fallbackSummary,
        fa: editing.summary.fa.trim() || fallbackSummary,
        ar: editing.summary.ar.trim() || fallbackSummary,
      },
      overview: {
        en: fallbackOverview,
        fa: editing.overview.fa.trim() || fallbackOverview,
        ar: editing.overview.ar.trim() || fallbackOverview,
      },
      loadingPorts,
      grades: parsedGrades,
      inspections:
        editing.inspections.length > 0
          ? editing.inspections
          : (['SGS'] as InspectionAgency[]),
    };

    setDrawerSaving(true);
    try {
      const previousProduct = isNew
        ? null
        : (products.find((p) => p.slug === payload.slug) ?? null);
      await saveProduct(payload, previousProduct);
      setEditing(null);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setDrawerSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    setErrorMsg(null);
    const target = products.find((p) => p.slug === slug);
    try {
      await deleteProduct(slug, target?.shortName);
      setConfirmDeleteSlug(null);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#708294] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by product, HS code, CAS..."
              className="ps-9 pe-3.5 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg w-64 text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
            />
          </div>
          <div className="inline-flex items-center border border-[#E5EBF0] rounded-lg bg-white p-0.5">
            {(['all', 'fertilizers', 'polymers', 'chemicals'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#0B1520] text-white'
                      : 'text-[#4A5B6C] hover:text-[#0B1520]'
                  }`}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openNewDrawer}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commodity</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}

      {/* High-Density Product Table */}
      <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Commodity</th>
                <th className="py-2.5 px-3 text-start">Category</th>
                <th className="py-2.5 px-3 text-start">HS / CAS</th>
                <th className="py-2.5 px-3 text-end">MOQ (MT)</th>
                <th className="py-2.5 px-3 text-start">Live FOB (USD/MT)</th>
                <th className="py-2.5 px-3 text-center">Featured</th>
                <th className="py-2.5 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-4 text-center text-[#708294]"
                  >
                    No products found in Firestore matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const currentInput =
                    inlinePrices[product.slug] ??
                    String(product.fobUsdMt ?? 650);
                  const isDirty =
                    inlinePrices[product.slug] !== undefined &&
                    Number(inlinePrices[product.slug]) !== product.fobUsdMt;
                  return (
                    <tr
                      key={product.slug}
                      className="hover:bg-[#F7F9FB]/70 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#0B1520]">
                          {product.shortName}
                        </div>
                        <div className="text-[11px] text-[#708294] font-mono-data">
                          {product.slug} · {product.grades.length} grades
                        </div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-[#4A5B6C]">
                        {product.category}
                      </td>
                      <td className="py-2.5 px-3 font-mono-data text-[11px] text-[#4A5B6C] tabular-nums">
                        <div>HS {product.hsCode}</div>
                        <div className="text-[#708294]">CAS {product.casNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono-data tabular-nums text-[#0B1520]">
                        {product.moqMt.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#708294] font-mono-data">$</span>
                          <input
                            type="number"
                            min={1}
                            max={100000}
                            disabled={!canEdit}
                            value={currentInput}
                            onChange={(e) =>
                              setInlinePrices((prev) => ({
                                ...prev,
                                [product.slug]: e.target.value,
                              }))
                            }
                            className="w-24 px-2 py-1 text-xs font-mono-data tabular-nums bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0E4D64] disabled:bg-[#F7F9FB] disabled:text-[#4A5B6C]"
                          />
                          {canEdit && (
                            <button
                              type="button"
                              disabled={!isDirty || savingSlug === product.slug}
                              onClick={() => void handleQuickSavePrice(product)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                savedSlug === product.slug
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isDirty
                                    ? 'bg-[#0E4D64] text-white hover:bg-[#0B1520]'
                                    : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                              }`}
                            >
                              {savedSlug === product.slug ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3 h-3" />
                                  <span>Update</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => canEdit && void handleToggleFeatured(product)}
                          disabled={!canEdit || savingSlug === product.slug}
                          title="Toggle homepage featured status"
                          className={`p-1.5 rounded-md transition-colors ${canEdit ? 'cursor-pointer' : 'cursor-default'} ${
                            product.featured
                              ? 'text-[#D97706] bg-amber-50'
                              : 'text-[#94A3B8] hover:text-[#4A5B6C]'
                          }`}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={product.featured ? 'currentColor' : 'none'}
                          />
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(product)}
                              className="p-1.5 text-[#4A5B6C] hover:text-[#0B1520] hover:bg-[#F1F5F9] rounded-md cursor-pointer"
                              title="Edit full product specifications"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">Read Only</span>
                          )}
                          {canDelete && (
                            <>
                              {confirmDeleteSlug === product.slug ? (
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(product.slug)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded cursor-pointer"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteSlug(product.slug)
                                  }
                                  className="p-1.5 text-[#708294] hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Editor Slide-Over Drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  {isNew ? 'Add New Commodity Line' : `Edit ${editing.shortName}`}
                </h3>
                <p className="text-xs text-[#708294]">
                  Updates persist immediately to Firestore and live catalog pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleSaveDrawer(e)}
              className="p-6 space-y-5 flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Document Slug
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNew}
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    placeholder="e.g. urea-46"
                    className="w-full px-3 py-2 text-xs font-mono-data border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Category
                  </label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="fertilizers">Fertilizers</option>
                    <option value="polymers">Polymers</option>
                    <option value="chemicals">Industrial Chemicals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Short Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.shortName}
                    onChange={(e) =>
                      setEditing({ ...editing, shortName: e.target.value })
                    }
                    placeholder="e.g. HDPE"
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Live FOB Price (USD/MT)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editing.fobUsdMt ?? 650}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        fobUsdMt: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-data tabular-nums border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    MOQ (Metric Tons)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editing.moqMt}
                    onChange={(e) =>
                      setEditing({ ...editing, moqMt: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-data tabular-nums border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    HS Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.hsCode}
                    onChange={(e) =>
                      setEditing({ ...editing, hsCode: e.target.value })
                    }
                    placeholder="3901.20"
                    className="w-full px-3 py-2 text-xs font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    CAS Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.casNumber}
                    onChange={(e) =>
                      setEditing({ ...editing, casNumber: e.target.value })
                    }
                    placeholder="9002-88-4"
                    className="w-full px-3 py-2 text-xs font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Chemical Formula
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.formula}
                    onChange={(e) =>
                      setEditing({ ...editing, formula: e.target.value })
                    }
                    placeholder="(C2H4)n"
                    className="w-full px-3 py-2 text-xs font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>

              {/* Trilingual Titles */}
              <div className="space-y-3 pt-2 border-t border-[#E5EBF0]">
                <div className="text-xs font-semibold text-[#0B1520]">
                  Localized Commodity Names
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    required
                    value={editing.name.en}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: { ...editing.name, en: e.target.value },
                      })
                    }
                    placeholder="English Name"
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={editing.name.fa}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: { ...editing.name, fa: e.target.value },
                      })
                    }
                    placeholder="نام فارسی محصول"
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={editing.name.ar}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: { ...editing.name, ar: e.target.value },
                      })
                    }
                    placeholder="الاسم العربي للمنتج"
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>

              {/* Summaries */}
              <div className="space-y-3 pt-2 border-t border-[#E5EBF0]">
                <div className="text-xs font-semibold text-[#0B1520]">
                  English Summary & Technical Overview
                </div>
                <textarea
                  rows={2}
                  required
                  value={editing.summary.en}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      summary: { ...editing.summary, en: e.target.value },
                    })
                  }
                  placeholder="Short catalog summary (EN)"
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                />
                <textarea
                  rows={3}
                  required
                  value={editing.overview.en}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      overview: { ...editing.overview, en: e.target.value },
                    })
                  }
                  placeholder="Detailed technical overview (EN)"
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                />
              </div>

              {/* Ports & Grades */}
              <div className="space-y-3 pt-2 border-t border-[#E5EBF0]">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Loading Ports (comma separated)
                  </label>
                  <input
                    type="text"
                    value={portsText}
                    onChange={(e) => setPortsText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Available Export Grades (one per line: Code | Key Metric)
                  </label>
                  <textarea
                    rows={4}
                    value={gradesText}
                    onChange={(e) => setGradesText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-[#E5EBF0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={drawerSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {drawerSaving ? 'Saving to Firestore...' : 'Save Commodity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
