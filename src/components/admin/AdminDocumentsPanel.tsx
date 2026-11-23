import { useState } from 'react';
import {
  Check,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { DocumentAccessLog } from '../../types/domain';
import type { TradeDocumentTemplate } from '../../data/documents';
import {
  saveDocumentTemplate,
  setDocumentAccessRevoked,
} from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';

interface AdminDocumentsPanelProps {
  templates: TradeDocumentTemplate[];
  accessLogs: DocumentAccessLog[];
  canManage: boolean;
}

export function AdminDocumentsPanel({
  templates,
  accessLogs,
  canManage,
}: AdminDocumentsPanelProps) {
  const [subTab, setSubTab] = useState<'logs' | 'templates'>('logs');
  const [editingTpl, setEditingTpl] = useState<TradeDocumentTemplate | null>(null);
  const [clausesText, setClausesText] = useState('');
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleToggleRevoke = async (log: DocumentAccessLog) => {
    setBusyToken(log.token);
    setErrorMsg(null);
    try {
      const nextRevoked = log.status !== 'revoked';
      await setDocumentAccessRevoked(log.token, nextRevoked, log.company);
      setSavedNotice(
        nextRevoked
          ? `Revoked vault clearance ${log.token}. Downloads are blocked immediately.`
          : `Restored vault clearance ${log.token}.`,
      );
      setTimeout(() => setSavedNotice(null), 2600);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setBusyToken(null);
    }
  };

  const openEditTemplate = (tpl: TradeDocumentTemplate) => {
    setEditingTpl(structuredClone(tpl));
    setClausesText(tpl.clauses.join('\n'));
    setErrorMsg(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTpl) return;
    setErrorMsg(null);
    const clauses = clausesText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);
    if (clauses.length === 0) {
      setErrorMsg('At least one standard clause is required.');
      return;
    }
    try {
      const prevTpl = templates.find((t) => t.id === editingTpl.id) ?? null;
      await saveDocumentTemplate(
        {
          ...editingTpl,
          clauses,
        },
        prevTpl,
      );
      setEditingTpl(null);
      setSavedNotice('Document template updated live in Document Hub.');
      setTimeout(() => setSavedNotice(null), 2400);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center border border-[#E5EBF0] rounded-lg bg-white p-1">
        <button
          type="button"
          onClick={() => setSubTab('logs')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            subTab === 'logs'
              ? 'bg-[#0B1520] text-white'
              : 'text-[#4A5B6C] hover:text-[#0B1520]'
          }`}
        >
          Buyer Vault Audit Logs ({accessLogs.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('templates')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            subTab === 'templates'
              ? 'bg-[#0B1520] text-white'
              : 'text-[#4A5B6C] hover:text-[#0B1520]'
          }`}
        >
          Trade Templates ({templates.length})
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}
      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 inline-flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {subTab === 'logs' && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                  <th className="py-2.5 px-4 text-start">Clearance Token</th>
                  <th className="py-2.5 px-3 text-start">Legal Entity</th>
                  <th className="py-2.5 px-3 text-start">Corporate Email</th>
                  <th className="py-2.5 px-3 text-start">Verified At</th>
                  <th className="py-2.5 px-3 text-start">Vault Status</th>
                  <th className="py-2.5 px-4 text-end">Enforcement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {accessLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 px-4 text-center text-[#708294]"
                    >
                      No buyer verification sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  accessLogs.map((log) => {
                    const revoked = log.status === 'revoked';
                    return (
                      <tr key={log.token} className="hover:bg-[#F7F9FB]/70">
                        <td className="py-2.5 px-4 font-mono-data font-semibold text-[#0B1520]">
                          {log.token}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#0B1520]">
                          {log.company}
                        </td>
                        <td className="py-2.5 px-3 font-mono-data text-[#4A5B6C]">
                          {log.email}
                        </td>
                        <td className="py-2.5 px-3 font-mono-data text-[#708294]">
                          {log.verifiedAt
                            ? new Date(log.verifiedAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${
                              revoked ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {revoked ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>{revoked ? 'Revoked' : 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-end">
                          {canManage ? (
                            <button
                              type="button"
                              disabled={busyToken === log.token}
                              onClick={() => void handleToggleRevoke(log)}
                              className={`px-3 py-1 text-[11px] font-semibold rounded cursor-pointer disabled:opacity-50 ${
                                revoked
                                  ? 'bg-[#F1F5F9] text-[#0B1520] hover:bg-[#E2E8F0]'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {revoked ? 'Restore Access' : 'Revoke Access'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">Read Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'templates' && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                <th className="py-2.5 px-4 text-start">Document Template</th>
                <th className="py-2.5 px-3 text-start">Code & Revision</th>
                <th className="py-2.5 px-3 text-start">Stage</th>
                <th className="py-2.5 px-3 text-start">SHA-256 Digest</th>
                <th className="py-2.5 px-4 text-end">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {templates.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-[#F7F9FB]/70">
                  <td className="py-3 px-4 font-semibold text-[#0B1520]">
                    {tpl.title.en}
                  </td>
                  <td className="py-3 px-3 font-mono-data text-[#4A5B6C]">
                    {tpl.code} · {tpl.revision}
                  </td>
                  <td className="py-3 px-3 text-[#4A5B6C]">{tpl.stageRef}</td>
                  <td className="py-3 px-3 font-mono-data text-[11px] text-[#708294]">
                    {tpl.sha256.slice(0, 14)}...
                  </td>
                  <td className="py-3 px-4 text-end">
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => openEditTemplate(tpl)}
                        className="p-1.5 text-[#4A5B6C] hover:text-[#0B1520] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
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

      {/* Template Editor Drawer */}
      {editingTpl && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5EBF0] pb-4">
              <h3 className="font-display text-lg font-bold text-[#0B1520]">
                Edit Template: {editingTpl.code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTpl(null)}
                className="p-2 text-[#4A5B6C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleSaveTemplate(e)}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Document Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTpl.code}
                    onChange={(e) =>
                      setEditingTpl({ ...editingTpl, code: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                    Revision
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTpl.revision}
                    onChange={(e) =>
                      setEditingTpl({ ...editingTpl, revision: e.target.value })
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
                  value={editingTpl.title.en}
                  onChange={(e) =>
                    setEditingTpl({
                      ...editingTpl,
                      title: { ...editingTpl.title, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Authorized Signatory Line
                </label>
                <input
                  type="text"
                  required
                  value={editingTpl.signatory}
                  onChange={(e) =>
                    setEditingTpl({ ...editingTpl, signatory: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A5B6C] mb-1">
                  Standard Commercial Clauses (one per line)
                </label>
                <textarea
                  rows={5}
                  required
                  value={clausesText}
                  onChange={(e) => setClausesText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5EBF0]">
                <button
                  type="button"
                  onClick={() => setEditingTpl(null)}
                  className="px-4 py-2 font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
