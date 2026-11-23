import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Mail,
  Phone,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type {
  OrderFulfillmentStage,
  RfqRecord,
  RfqStatus,
} from '../../types/domain';
import { formatMoney } from '../../data/currency';
import { deleteRfq, updateRfqStatusAndNotes } from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';

interface AdminRfqPanelProps {
  rfqs: RfqRecord[];
  canManage: boolean;
  canDelete: boolean;
}

const STATUS_OPTIONS: RfqStatus[] = [
  'received',
  'reviewing',
  'quoted',
  'contracted',
  'archived',
];

const STATUS_META: Record<
  RfqStatus,
  { label: string; colorClass: string }
> = {
  received: { label: 'Received', colorClass: 'text-amber-700' },
  reviewing: { label: 'Reviewing', colorClass: 'text-sky-700' },
  quoted: { label: 'Quoted (FCO)', colorClass: 'text-[#0E4D64]' },
  contracted: { label: 'Contracted', colorClass: 'text-emerald-700' },
  archived: { label: 'Archived', colorClass: 'text-[#708294]' },
};

const FULFILLMENT_STAGE_OPTIONS: {
  value: '' | OrderFulfillmentStage;
  label: string;
}[] = [
  { value: '', label: 'Not Yet Assigned (Pre-Contract)' },
  { value: 'allocation', label: '01 · Producer Allocation Confirmed' },
  { value: 'lc_opened', label: '02 · L/C Opened / Payment Settled' },
  { value: 'sgs_inspection', label: '03 · SGS / BV / Intertek Inspection' },
  { value: 'port_loading', label: '04 · Port Loading & B/L Issuance' },
  { value: 'in_transit', label: '05 · Vessel / TIR In Transit' },
  { value: 'delivered', label: '06 · Discharged at Destination' },
];

export function AdminRfqPanel({ rfqs, canManage, canDelete }: AdminRfqPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | RfqStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RfqRecord | null>(null);
  const [draftStatus, setDraftStatus] = useState<RfqStatus>('received');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftStage, setDraftStage] = useState<'' | OrderFulfillmentStage>('');
  const [draftPortOfLoading, setDraftPortOfLoading] = useState('');
  const [draftVesselName, setDraftVesselName] = useState('');
  const [draftBlNumber, setDraftBlNumber] = useState('');
  const [draftEtaDate, setDraftEtaDate] = useState('');
  const [draftBuyerNotice, setDraftBuyerNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rfqs.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.referenceId.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
      );
    });
  }, [rfqs, statusFilter, search]);

  const openInspector = (rfq: RfqRecord) => {
    setSelected(rfq);
    setDraftStatus(rfq.status);
    setDraftNotes(rfq.deskNotes ?? '');
    setDraftStage(rfq.fulfillmentStage ?? '');
    setDraftPortOfLoading(rfq.portOfLoading ?? '');
    setDraftVesselName(rfq.vesselName ?? '');
    setDraftBlNumber(rfq.blNumber ?? '');
    setDraftEtaDate(rfq.etaDate ?? '');
    setDraftBuyerNotice(rfq.buyerNotice ?? '');
    setSavedNotice(false);
    setErrorMsg(null);
  };

  const handleSaveUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setErrorMsg(null);
    setSavedNotice(false);
    try {
      await updateRfqStatusAndNotes(
        selected.referenceId,
        draftStatus,
        draftNotes,
        selected,
        {
          fulfillmentStage: draftStage,
          portOfLoading: draftPortOfLoading,
          vesselName: draftVesselName,
          blNumber: draftBlNumber,
          etaDate: draftEtaDate,
          buyerNotice: draftBuyerNotice,
        },
      );
      setSelected({
        ...selected,
        status: draftStatus,
        deskNotes: draftNotes,
        fulfillmentStage: draftStage || undefined,
        portOfLoading: draftPortOfLoading.trim(),
        vesselName: draftVesselName.trim(),
        blNumber: draftBlNumber.trim(),
        etaDate: draftEtaDate.trim(),
        buyerNotice: draftBuyerNotice.trim(),
      });
      setSavedNotice(true);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (referenceId: string) => {
    setErrorMsg(null);
    const target = rfqs.find((r) => r.referenceId === referenceId);
    try {
      await deleteRfq(referenceId, target?.companyName);
      setConfirmDeleteId(null);
      if (selected?.referenceId === referenceId) setSelected(null);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 border border-[#E5EBF0] rounded-lg bg-white p-1">
          {(['all', ...STATUS_OPTIONS] as const).map((st) => {
            const count =
              st === 'all'
                ? rfqs.length
                : rfqs.filter((r) => r.status === st).length;
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
                <span className="capitalize">{st}</span>
                <span className="ms-1.5 font-mono-data opacity-75">
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
            placeholder="Search reference ID, buyer, port..."
            className="ps-9 pe-3.5 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg w-64 text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}

      {/* High-Density RFQ Table */}
      <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Reference</th>
                <th className="py-2.5 px-3 text-start">Counterparty</th>
                <th className="py-2.5 px-3 text-start">Commodity & Grade</th>
                <th className="py-2.5 px-3 text-end">Volume</th>
                <th className="py-2.5 px-3 text-end">Est. Value</th>
                <th className="py-2.5 px-3 text-start">Status</th>
                <th className="py-2.5 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 px-4 text-center text-[#708294]"
                  >
                    No live buyer RFQ inquiries match this filter yet.
                  </td>
                </tr>
              ) : (
                filtered.map((rfq) => {
                  const stMeta = STATUS_META[rfq.status] ?? STATUS_META.received;
                  const curr = rfq.currency ?? 'USD';
                  return (
                    <tr
                      key={rfq.referenceId}
                      onClick={() => openInspector(rfq)}
                      className="hover:bg-[#F7F9FB] transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-mono-data font-semibold text-[#0B1520]">
                          {rfq.referenceId}
                        </div>
                        <div className="text-[11px] text-[#708294] font-mono-data">
                          {new Date(rfq.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#0B1520]">
                          {rfq.companyName}
                        </div>
                        <div className="text-[11px] text-[#708294]">
                          {rfq.contactName} · {rfq.destination}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#0B1520]">
                          {rfq.productName}
                        </div>
                        <div className="text-[11px] text-[#708294]">
                          {rfq.grade} · {rfq.incoterm} · {rfq.inspection}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono-data tabular-nums text-[#0B1520]">
                        {rfq.quantityMt.toLocaleString()} MT
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono-data font-semibold tabular-nums text-[#0B1520]">
                        {rfq.estimatedTotal
                          ? formatMoney(rfq.estimatedTotal, curr)
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${stMeta.colorClass}`}
                        >
                          {rfq.status === 'contracted' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{stMeta.label}</span>
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-4 text-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openInspector(rfq)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#0E4D64] hover:bg-[#0E4D64]/10 rounded cursor-pointer"
                          >
                            Inspect
                          </button>
                          {canDelete &&
                            (confirmDeleteId === rfq.referenceId ? (
                              <button
                                type="button"
                                onClick={() => void handleDelete(rfq.referenceId)}
                                className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded cursor-pointer"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteId(rfq.referenceId)
                                }
                                className="p-1 text-[#708294] hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ))}
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

      {/* RFQ Slide-Over Inspector */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono-data text-[#0E4D64] font-semibold">
                  {selected.referenceId}
                </div>
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  {selected.companyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Buyer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#E5EBF0]">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#708294] mb-1">
                    Buyer Representative
                  </div>
                  <div className="font-semibold text-[#0B1520]">
                    {selected.contactName}
                  </div>
                  <div className="mt-1.5 space-y-1 text-[#4A5B6C]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0E4D64]" />
                      <span className="font-mono-data">{selected.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0E4D64]" />
                      <span className="font-mono-data">{selected.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#708294] mb-1">
                    Commercial Valuation
                  </div>
                  <div className="font-display text-2xl font-bold text-[#0B1520] tabular-nums">
                    {selected.estimatedTotal
                      ? formatMoney(
                          selected.estimatedTotal,
                          selected.currency ?? 'USD',
                        )
                      : 'N/A'}
                  </div>
                  <div className="text-[11px] text-[#708294] font-mono-data mt-0.5">
                    {selected.quantityMt.toLocaleString()} MT ·{' '}
                    {selected.estimatedUnitPrice
                      ? `${formatMoney(selected.estimatedUnitPrice, selected.currency ?? 'USD')}/MT`
                      : 'Custom'}{' '}
                    ({selected.incoterm})
                  </div>
                </div>
              </div>

              {/* Specification Summary */}
              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 pb-5 border-b border-[#E5EBF0]">
                <div>
                  <dt className="text-[#708294]">Commodity</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {selected.productName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Grade</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {selected.grade}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Destination</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {selected.destination}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Packaging</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {selected.packaging}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Inspection Agency</dt>
                  <dd className="font-semibold text-[#0B1520] mt-0.5">
                    {selected.inspection}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#708294]">Submitted</dt>
                  <dd className="font-mono-data text-[#0B1520] mt-0.5">
                    {new Date(selected.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {selected.notes && (
                <div className="pb-5 border-b border-[#E5EBF0]">
                  <div className="text-[11px] uppercase tracking-wider text-[#708294] mb-1.5">
                    Buyer Commercial Notes
                  </div>
                  <p className="text-[#4A5B6C] leading-relaxed bg-[#F7F9FB] border border-[#E5EBF0] rounded-lg p-3">
                    {selected.notes}
                  </p>
                </div>
              )}

              {/* Deal Desk Workflow Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1.5">
                    Deal Desk Pipeline Status
                  </label>
                  <select
                    disabled={!canManage}
                    value={draftStatus}
                    onChange={(e) =>
                      setDraftStatus(e.target.value as RfqStatus)
                    }
                    className="w-full px-3 py-2 text-xs font-medium border border-[#CBD5E1] rounded-lg bg-white disabled:bg-[#F7F9FB]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_META[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1.5">
                    Internal Commercial Desk Notes (Confidential — Hidden from Buyer)
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canManage}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Record allocation producer, freight charter quote, FCO validity, or L/C issuing bank details..."
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                  />
                </div>

                {/* Client Portal Shipment Fulfillment & Buyer Notice */}
                <div className="pt-4 border-t border-[#E5EBF0] space-y-3.5">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0E4D64]">
                      Client Portal Order Progress & Shipment Telemetry
                    </div>
                    <p className="text-[11px] text-[#708294] mt-0.5">
                      Streams live to the registered buyer&apos;s Client Portal and populates their customized B/L &amp; COO downloads.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                      Active Order Fulfillment Milestone
                    </label>
                    <select
                      disabled={!canManage}
                      value={draftStage}
                      onChange={(e) =>
                        setDraftStage(
                          e.target.value as '' | OrderFulfillmentStage,
                        )
                      }
                      className="w-full px-3 py-2 text-xs font-medium border border-[#CBD5E1] rounded-lg bg-white disabled:bg-[#F7F9FB]"
                    >
                      {FULFILLMENT_STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value || 'none'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                        Port of Loading
                      </label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={draftPortOfLoading}
                        onChange={(e) => setDraftPortOfLoading(e.target.value)}
                        placeholder="e.g. Shahid Rajaee, Bandar Abbas"
                        className="w-full px-3 py-1.5 text-xs border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                        Vessel / Carrier Name
                      </label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={draftVesselName}
                        onChange={(e) => setDraftVesselName(e.target.value)}
                        placeholder="e.g. M/V PERSIAN HORIZON"
                        className="w-full px-3 py-1.5 text-xs border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                        Bill of Lading (B/L) Number
                      </label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={draftBlNumber}
                        onChange={(e) => setDraftBlNumber(e.target.value)}
                        placeholder="e.g. PT-BL-2026-0892"
                        className="w-full px-3 py-1.5 text-xs font-mono-data border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                        Estimated Arrival (ETA)
                      </label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={draftEtaDate}
                        onChange={(e) => setDraftEtaDate(e.target.value)}
                        placeholder="e.g. 2026-12-14"
                        className="w-full px-3 py-1.5 text-xs font-mono-data border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                      Buyer-Visible Operations Desk Update
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canManage}
                      value={draftBuyerNotice}
                      onChange={(e) => setDraftBuyerNotice(e.target.value)}
                      placeholder="Message visible to buyer in Client Portal (e.g. SGS composite assay passed, vessel berthing scheduled for Nov 28)..."
                      className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                    />
                  </div>
                </div>

                {savedNotice && (
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Pipeline, fulfillment progress &amp; portal updates saved to Firestore.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                  >
                    Close
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSaveUpdate()}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Updating...' : 'Save Pipeline Update'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
