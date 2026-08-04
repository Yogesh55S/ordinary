'use client';

import { useState } from 'react';
import { Search, Trash2, RotateCcw, Loader2, Clock, CheckCircle2, XCircle, Pencil, Check, X } from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Sent', label: 'Sent' },
  { key: 'Failed', label: 'Failed' },
];

function StatusBadge({ status }) {
  const map = {
    Pending: { icon: Clock, cls: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' },
    Sent: { icon: CheckCircle2, cls: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' },
    Failed: { icon: XCircle, cls: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' },
  };
  const { icon: Icon, cls } = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold border shrink-0 whitespace-nowrap ${cls}`}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </span>
  );
}

export default function QueueTable({ contacts, loading, onDelete, onRetry, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ hr_name: '', hr_email: '', company_name: '' });
  const [editError, setEditError] = useState(null);

  const filtered = contacts.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || c.hr_email.toLowerCase().includes(q)
      || (c.hr_name || '').toLowerCase().includes(q)
      || (c.company_name || '').toLowerCase().includes(q)
      || (c.job_profiles?.title || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (contact) => {
    if (!confirm(`Remove ${contact.hr_email} from the queue?`)) return;
    setBusyId(contact.id);
    try {
      await onDelete(contact.id);
    } finally {
      setBusyId(null);
    }
  };

  const handleRetry = async (contact) => {
    setBusyId(contact.id);
    try {
      await onRetry(contact.id);
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setEditError(null);
    setEditForm({
      hr_name: contact.hr_name || '',
      hr_email: contact.hr_email || '',
      company_name: contact.company_name || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async (contact) => {
    if (!editForm.hr_email.trim()) {
      setEditError('HR email is required.');
      return;
    }
    setBusyId(contact.id);
    setEditError(null);
    try {
      await onUpdate(contact.id, {
        hr_name: editForm.hr_name.trim() || null,
        hr_email: editForm.hr_email.trim(),
        company_name: editForm.company_name.trim() || null,
      });
      setEditingId(null);
    } catch (err) {
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, company..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex items-center space-x-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                statusFilter === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-[#111625]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">Loading queue...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
          {contacts.length === 0 ? 'No HR contacts queued yet.' : 'No contacts match your filters.'}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-4 py-3 font-semibold">HR Contact</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Job Profile</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    {isEditing ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editForm.hr_name}
                            onChange={(e) => setEditForm((f) => ({ ...f, hr_name: e.target.value }))}
                            placeholder="HR name"
                            className="w-full mb-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                          />
                          <input
                            type="email"
                            value={editForm.hr_email}
                            onChange={(e) => setEditForm((f) => ({ ...f, hr_email: e.target.value }))}
                            placeholder="HR email"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editForm.company_name}
                            onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                            placeholder="Company"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.job_profiles?.title || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                          {editError && <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 max-w-xs">{editError}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => saveEdit(c)}
                              disabled={busyId === c.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all disabled:opacity-50"
                              aria-label={`Save changes for ${c.hr_email}`}
                            >
                              {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={busyId === c.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                              aria-label="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{c.hr_name || '—'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{c.hr_email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.company_name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.job_profiles?.title || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                          {c.status === 'Failed' && c.error_message && (
                            <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 max-w-xs truncate" title={c.error_message}>{c.error_message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => startEdit(c)}
                              disabled={busyId === c.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all disabled:opacity-50"
                              aria-label={`Edit ${c.hr_email}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {c.status === 'Failed' && (
                              <button
                                onClick={() => handleRetry(c)}
                                disabled={busyId === c.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all disabled:opacity-50"
                                aria-label={`Retry ${c.hr_email}`}
                              >
                                {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={busyId === c.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-50"
                              aria-label={`Remove ${c.hr_email}`}
                            >
                              {busyId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
