import { useState } from 'react';
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  HistoricalPricePoint,
  MarketInsight,
  TradeCorridor,
} from '../../types/domain';
import { IMG_HERO, IMG_LOGISTICS, IMG_POLYMER, IMG_UREA } from '../../data/catalog';
import {
  deleteHistoricalPrice,
  deleteInsight,
  sanitizeDocId,
  saveCorridor,
  saveHistoricalPrice,
  saveInsight,
} from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';

interface AdminMarketPanelProps {
  insights: MarketInsight[];
  historicalPrices: HistoricalPricePoint[];
  corridors: TradeCorridor[];
  canEdit: boolean;
  canDelete: boolean;
}

type MarketSubTab = 'insights' | 'prices' | 'corridors';

const CATEGORY_LABELS: Record<
  MarketInsight['category'],
  { en: string; fa: string; ar: string; img: string }
> = {
  fertilizers: { en: 'Fertilizers', fa: 'بازار کود', ar: 'سوق الأسمدة', img: IMG_UREA },
  polymers: { en: 'Polymers', fa: 'پلیمرها', ar: 'البوليمرات', img: IMG_POLYMER },
  finance: { en: 'Trade Finance', fa: 'مالی و بازرسی', ar: 'التمويل التجاري', img: IMG_HERO },
  logistics: { en: 'Logistics', fa: 'لجستیک و حمل', ar: 'اللوجستيات والشحن', img: IMG_LOGISTICS },
};

export function AdminMarketPanel({
  insights,
  historicalPrices,
  corridors,
  canEdit,
  canDelete,
}: AdminMarketPanelProps) {
  const [subTab, setSubTab] = useState<MarketSubTab>('insights');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Insights editor state
  const [editingInsight, setEditingInsight] = useState<MarketInsight | null>(null);
  const [isNewInsight, setIsNewInsight] = useState(false);

  // Historical price draft map
  const [priceDrafts, setPriceDrafts] = useState<
    Record<string, Partial<HistoricalPricePoint>>
  >({});
  const [newMonth, setNewMonth] = useState({
    id: '',
    month: '',
    urea: 380,
    hdpe: 1040,
    pp: 995,
    methanol: 340,
  });

  // Corridor editor state
  const [editingCorridor, setEditingCorridor] = useState<TradeCorridor | null>(null);
  const [corridorPortsText, setCorridorPortsText] = useState('');
  const [corridorCommText, setCorridorCommText] = useState('');

  const flashSaved = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 2200);
  };

  // --- Insights Handlers ---
  const openNewInsight = () => {
    setIsNewInsight(true);
    setEditingInsight({
      slug: '',
      category: 'fertilizers',
      categoryLabel: { en: 'Fertilizers', fa: 'بازار کود', ar: 'سوق الأسمدة' },
      date: new Date().toISOString().slice(0, 10),
      readTimeMinutes: 4,
      image: IMG_UREA,
      published: true,
      title: { en: '', fa: '', ar: '' },
      excerpt: { en: '', fa: '', ar: '' },
      sections: [
        {
          heading: { en: 'Market Overview', fa: 'تحلیل بازار', ar: 'نظرة عامة' },
          body: { en: '', fa: '', ar: '' },
        },
      ],
    });
    setErrorMsg(null);
  };

  const handleSaveInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsight) return;
    setErrorMsg(null);
    const slug = sanitizeDocId(editingInsight.slug || editingInsight.title.en);
    if (!slug || !editingInsight.title.en.trim()) {
      setErrorMsg('Insight slug and English title are required.');
      return;
    }
    const meta = CATEGORY_LABELS[editingInsight.category];
    const titleEn = editingInsight.title.en.trim();
    const excerptEn = editingInsight.excerpt.en.trim() || titleEn;
    const secHeadingEn =
      editingInsight.sections[0]?.heading.en.trim() || 'Desk Commentary';
    const secBodyEn =
      editingInsight.sections[0]?.body.en.trim() || excerptEn;

    try {
      const prevInsight = isNewInsight
        ? null
        : (insights.find((i) => i.slug === slug) ?? null);
      await saveInsight(
        {
          ...editingInsight,
          slug,
          categoryLabel: { en: meta.en, fa: meta.fa, ar: meta.ar },
          image: editingInsight.image.trim() || meta.img,
          title: {
            en: titleEn,
            fa: editingInsight.title.fa.trim() || titleEn,
            ar: editingInsight.title.ar.trim() || titleEn,
          },
          excerpt: {
            en: excerptEn,
            fa: editingInsight.excerpt.fa.trim() || excerptEn,
            ar: editingInsight.excerpt.ar.trim() || excerptEn,
          },
          sections: editingInsight.sections.map((s, idx) => ({
            heading: {
              en: idx === 0 ? secHeadingEn : s.heading.en.trim() || 'Analysis',
              fa: s.heading.fa.trim() || (idx === 0 ? secHeadingEn : s.heading.en),
              ar: s.heading.ar.trim() || (idx === 0 ? secHeadingEn : s.heading.en),
            },
            body: {
              en: idx === 0 ? secBodyEn : s.body.en.trim() || excerptEn,
              fa: s.body.fa.trim() || (idx === 0 ? secBodyEn : s.body.en),
              ar: s.body.ar.trim() || (idx === 0 ? secBodyEn : s.body.en),
            },
          })),
        },
        prevInsight,
      );
      setEditingInsight(null);
      flashSaved('Market insight saved to Firestore.');
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  const toggleInsightPublish = async (insight: MarketInsight) => {
    setErrorMsg(null);
    try {
      await saveInsight({ ...insight, published: !insight.published }, insight);
      flashSaved(
        insight.published ? 'Insight moved to Draft.' : 'Insight published live.',
      );
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  // --- Historical Prices Handlers ---
  const handleSavePriceRow = async (pt: HistoricalPricePoint) => {
    setErrorMsg(null);
    const merged: HistoricalPricePoint = {
      ...pt,
      ...(priceDrafts[pt.id] ?? {}),
    };
    try {
      await saveHistoricalPrice(merged, pt);
      setPriceDrafts((prev) => {
        const copy = { ...prev };
        delete copy[pt.id];
        return copy;
      });
      flashSaved(`Updated ${merged.month} benchmark prices.`);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  const handleAddPriceMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const id = sanitizeDocId(newMonth.id || newMonth.month);
    if (!id || !newMonth.month.trim()) {
      setErrorMsg('Provide both an ID (e.g. 2026-12) and display month (e.g. Dec 26).');
      return;
    }
    const maxSort = historicalPrices.reduce(
      (max, p) => Math.max(max, p.sortOrder),
      0,
    );
    try {
      await saveHistoricalPrice({
        id,
        month: newMonth.month.trim(),
        sortOrder: maxSort + 1,
        urea: Number(newMonth.urea),
        hdpe: Number(newMonth.hdpe),
        pp: Number(newMonth.pp),
        methanol: Number(newMonth.methanol),
      });
      setNewMonth({
        id: '',
        month: '',
        urea: 380,
        hdpe: 1040,
        pp: 995,
        methanol: 340,
      });
      flashSaved('Added monthly benchmark point to live chart.');
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  // --- Corridors Handlers ---
  const openEditCorridor = (c: TradeCorridor) => {
    setEditingCorridor(structuredClone(c));
    setCorridorPortsText(c.loadingPorts.join(', '));
    setCorridorCommText(c.commodities.join(', '));
    setErrorMsg(null);
  };

  const handleSaveCorridor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCorridor) return;
    setErrorMsg(null);
    const loadingPorts = corridorPortsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const commodities = corridorCommText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (loadingPorts.length === 0 || commodities.length === 0) {
      setErrorMsg('Loading ports and commodities cannot be empty.');
      return;
    }
    try {
      const prevCorridor =
        corridors.find((c) => c.id === editingCorridor.id) ?? null;
      await saveCorridor(
        {
          ...editingCorridor,
          loadingPorts,
          commodities,
        },
        prevCorridor,
      );
      setEditingCorridor(null);
      flashSaved('Trade corridor updated on live logistics map.');
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center border border-[#E5EBF0] rounded-lg bg-white p-1">
          {(
            [
              { id: 'insights', label: `Market Insights (${insights.length})` },
              {
                id: 'prices',
                label: `FOB Price Series (${historicalPrices.length})`,
              },
              { id: 'corridors', label: `Trade Corridors (${corridors.length})` },
            ] as { id: MarketSubTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#0B1520] text-white'
                  : 'text-[#4A5B6C] hover:text-[#0B1520]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {subTab === 'insights' && canEdit && (
          <button
            type="button"
            onClick={openNewInsight}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Insight</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}
      {savedBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 inline-flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* SUBTAB 1: INSIGHTS */}
      {subTab === 'insights' && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Article</th>
                <th className="py-2.5 px-3 text-start">Category</th>
                <th className="py-2.5 px-3 text-start">Date</th>
                <th className="py-2.5 px-3 text-start">Visibility</th>
                <th className="py-2.5 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {insights.map((ins) => (
                <tr key={ins.slug} className="hover:bg-[#F7F9FB]/70">
                  <td className="py-3 px-4 max-w-md">
                    <div className="font-semibold text-[#0B1520] line-clamp-1">
                      {ins.title.en}
                    </div>
                    <div className="text-[11px] font-mono-data text-[#708294]">
                      {ins.slug}
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize text-[#4A5B6C]">
                    {ins.category}
                  </td>
                  <td className="py-3 px-3 font-mono-data text-[#4A5B6C]">
                    {ins.date}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => canEdit && void toggleInsightPublish(ins)}
                      className={`inline-flex items-center gap-1.5 font-semibold ${canEdit ? 'cursor-pointer' : 'cursor-default'} ${
                        ins.published ? 'text-emerald-700' : 'text-[#708294]'
                      }`}
                    >
                      {ins.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <div className="inline-flex items-center gap-1.5">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewInsight(false);
                            setEditingInsight(structuredClone(ins));
                          }}
                          className="p-1.5 text-[#4A5B6C] hover:text-[#0B1520] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">Read Only</span>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void deleteInsight(ins.slug, ins.title.en)}
                          className="p-1.5 text-[#708294] hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: HISTORICAL FOB PRICE SERIES */}
      {subTab === 'prices' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    <th className="py-2.5 px-4 text-start">Month</th>
                    <th className="py-2.5 px-3 text-start">Urea 46% ($/MT)</th>
                    <th className="py-2.5 px-3 text-start">HDPE ($/MT)</th>
                    <th className="py-2.5 px-3 text-start">PP Raffia ($/MT)</th>
                    <th className="py-2.5 px-3 text-start">Methanol ($/MT)</th>
                    <th className="py-2.5 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF0]">
                  {historicalPrices.map((pt) => {
                    const draft = priceDrafts[pt.id];
                    const val = (k: 'urea' | 'hdpe' | 'pp' | 'methanol') =>
                      draft?.[k] ?? pt[k];
                    const dirty = Boolean(draft);
                    return (
                      <tr key={pt.id} className="hover:bg-[#F7F9FB]/70">
                        <td className="py-2 px-4 font-mono-data font-semibold text-[#0B1520]">
                          {pt.month}
                        </td>
                        {(['urea', 'hdpe', 'pp', 'methanol'] as const).map(
                          (field) => (
                            <td key={field} className="py-2 px-3">
                              <input
                                type="number"
                                min={1}
                                disabled={!canEdit}
                                value={val(field)}
                                onChange={(e) =>
                                  setPriceDrafts((prev) => ({
                                    ...prev,
                                    [pt.id]: {
                                      ...(prev[pt.id] ?? {}),
                                      [field]: Number(e.target.value),
                                    },
                                  }))
                                }
                                className="w-24 px-2 py-1 text-xs font-mono-data tabular-nums border border-[#CBD5E1] rounded disabled:bg-[#F7F9FB]"
                              />
                            </td>
                          ),
                        )}
                        <td className="py-2 px-4 text-end">
                          <div className="inline-flex items-center gap-1.5">
                            {canEdit ? (
                              <button
                                type="button"
                                disabled={!dirty}
                                onClick={() => void handleSavePriceRow(pt)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded inline-flex items-center gap-1 cursor-pointer ${
                                  dirty
                                    ? 'bg-[#0E4D64] text-white'
                                    : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                                }`}
                              >
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8]">Read Only</span>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  void deleteHistoricalPrice(pt.id, pt.month)
                                }
                                className="p-1 text-[#708294] hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Month Row */}
          {canEdit && (
          <form
            onSubmit={(e) => void handleAddPriceMonth(e)}
            className="bg-white border border-[#E5EBF0] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-7 gap-3 items-end text-xs"
          >
            <div>
              <label className="block text-[11px] text-[#708294] mb-1">
                Doc ID
              </label>
              <input
                type="text"
                placeholder="2026-12"
                value={newMonth.id}
                onChange={(e) =>
                  setNewMonth({ ...newMonth, id: e.target.value })
                }
                className="w-full px-2.5 py-1.5 font-mono-data border border-[#CBD5E1] rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#708294] mb-1">
                Month Label
              </label>
              <input
                type="text"
                placeholder="Dec 26"
                value={newMonth.month}
                onChange={(e) =>
                  setNewMonth({ ...newMonth, month: e.target.value })
                }
                className="w-full px-2.5 py-1.5 font-mono-data border border-[#CBD5E1] rounded"
              />
            </div>
            {(['urea', 'hdpe', 'pp', 'methanol'] as const).map((field) => (
              <div key={field}>
                <label className="block text-[11px] text-[#708294] mb-1 uppercase">
                  {field}
                </label>
                <input
                  type="number"
                  min={1}
                  value={newMonth[field]}
                  onChange={(e) =>
                    setNewMonth({
                      ...newMonth,
                      [field]: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 font-mono-data border border-[#CBD5E1] rounded"
                />
              </div>
            ))}
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#0B1520] hover:bg-[#0E4D64] text-white font-semibold rounded-lg cursor-pointer"
            >
              Add Month
            </button>
          </form>
          )}
        </div>
      )}

      {/* SUBTAB 3: TRADE CORRIDORS */}
      {subTab === 'corridors' && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Corridor Region</th>
                <th className="py-2.5 px-3 text-start">Mode</th>
                <th className="py-2.5 px-3 text-start">Transit Window</th>
                <th className="py-2.5 px-3 text-start">Loading Ports</th>
                <th className="py-2.5 px-4 text-end">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {corridors.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F9FB]/70">
                  <td className="py-3 px-4 font-semibold text-[#0B1520]">
                    {c.region.en}
                  </td>
                  <td className="py-3 px-3 text-[#4A5B6C]">{c.mode.en}</td>
                  <td className="py-3 px-3 font-mono-data text-[#0E4D64] font-semibold">
                    {c.transitDays} days
                  </td>
                  <td className="py-3 px-3 text-[#4A5B6C]">
                    {c.loadingPorts.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-end">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => openEditCorridor(c)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0E4D64] hover:bg-[#0E4D64]/10 rounded cursor-pointer"
                      >
                        Edit Route
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8]">Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insight Editor Drawer */}
      {editingInsight && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5EBF0] pb-4">
              <h3 className="font-display text-lg font-bold text-[#0B1520]">
                {isNewInsight ? 'Create Market Insight' : 'Edit Market Insight'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingInsight(null)}
                className="p-2 text-[#4A5B6C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleSaveInsight(e)}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNewInsight}
                    value={editingInsight.slug}
                    onChange={(e) =>
                      setEditingInsight({
                        ...editingInsight,
                        slug: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Category
                  </label>
                  <select
                    value={editingInsight.category}
                    onChange={(e) =>
                      setEditingInsight({
                        ...editingInsight,
                        category: e.target.value as MarketInsight['category'],
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="fertilizers">Fertilizers</option>
                    <option value="polymers">Polymers</option>
                    <option value="finance">Trade Finance</option>
                    <option value="logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={editingInsight.date}
                    onChange={(e) =>
                      setEditingInsight({
                        ...editingInsight,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Read Time (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editingInsight.readTimeMinutes}
                    onChange={(e) =>
                      setEditingInsight({
                        ...editingInsight,
                        readTimeMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Title (EN)
                </label>
                <input
                  type="text"
                  required
                  value={editingInsight.title.en}
                  onChange={(e) =>
                    setEditingInsight({
                      ...editingInsight,
                      title: { ...editingInsight.title, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Excerpt (EN)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingInsight.excerpt.en}
                  onChange={(e) =>
                    setEditingInsight({
                      ...editingInsight,
                      excerpt: { ...editingInsight.excerpt, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Primary Section Body (EN)
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingInsight.sections[0]?.body.en ?? ''}
                  onChange={(e) => {
                    const next = [...editingInsight.sections];
                    next[0] = {
                      ...next[0],
                      body: { ...next[0].body, en: e.target.value },
                    };
                    setEditingInsight({ ...editingInsight, sections: next });
                  }}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5EBF0]">
                <button
                  type="button"
                  onClick={() => setEditingInsight(null)}
                  className="px-4 py-2 font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
                >
                  Save Insight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corridor Editor Drawer */}
      {editingCorridor && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5EBF0] pb-4">
              <h3 className="font-display text-lg font-bold text-[#0B1520]">
                Edit Corridor: {editingCorridor.region.en}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCorridor(null)}
                className="p-2 text-[#4A5B6C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleSaveCorridor(e)}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Transit Days Window
                </label>
                <input
                  type="text"
                  required
                  value={editingCorridor.transitDays}
                  onChange={(e) =>
                    setEditingCorridor({
                      ...editingCorridor,
                      transitDays: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Loading Ports (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={corridorPortsText}
                  onChange={(e) => setCorridorPortsText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Primary Commodities (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={corridorCommText}
                  onChange={(e) => setCorridorCommText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Route Summary (EN)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingCorridor.summary.en}
                  onChange={(e) =>
                    setEditingCorridor({
                      ...editingCorridor,
                      summary: {
                        ...editingCorridor.summary,
                        en: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5EBF0]">
                <button
                  type="button"
                  onClick={() => setEditingCorridor(null)}
                  className="px-4 py-2 font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
                >
                  Save Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
