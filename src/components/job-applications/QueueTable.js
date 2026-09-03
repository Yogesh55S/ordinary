'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  RotateCcw,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Sent', label: 'Sent' },
  { key: 'Failed', label: 'Failed' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25, 'All'];

function StatusBadge({ status }) {
  const map = {
    Pending: {
      icon: Clock,
      cls: 'bg-[#CBDDE9]/25 dark:bg-black text-black dark:text-[#CBDDE9] border-[#CBDDE9] dark:border-[#2A72A1]/40',
    },
    Sent: {
      icon: CheckCircle2,
      cls: 'bg-[#CBDDE9]/40 dark:bg-black text-[#2A72A1] dark:text-[#CBDDE9] border-[#2A72A1]',
    },
    Failed: {
      icon: XCircle,
      cls: 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white',
    },
  };
  const { icon: Icon, cls } = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border shrink-0 whitespace-nowrap ${cls}`}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </span>
  );
}

export default function QueueTable({ contacts, loading, onDelete, onRetry, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ hr_name: '', hr_email: '', company_name: '' });
  const [editError, setEditError] = useState(null);

  // Filtered contacts based on search and status
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q
        || c.hr_email.toLowerCase().includes(q)
        || (c.hr_name || '').toLowerCase().includes(q)
        || (c.company_name || '').toLowerCase().includes(q)
        || (c.job_profiles?.title || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [contacts, statusFilter, search]);

  // Reset to page 1 on search or filter changes
  const effectivePageSize = pageSize === 'All' ? Math.max(filtered.length, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const displayed = useMemo(() => {
    if (pageSize === 'All') return filtered;
    const start = (safeCurrentPage - 1) * effectivePageSize;
    return filtered.slice(start, start + effectivePageSize);
  }, [filtered, pageSize, safeCurrentPage, effectivePageSize]);

  const handleDelete = async (contact) => {
    if (!confirm(`Remove ${contact.hr_email} from history/queue?`)) return;
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
    <div className="bg-white dark:bg-black rounded-lg border border-[#CBDDE9] dark:border-[#2A72A1]/40 shadow-xs overflow-hidden transition-colors w-full">
      {/* Header & Controls */}
      <div className="p-3.5 sm:p-4 border-b border-[#CBDDE9] dark:border-[#2A72A1]/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-black dark:text-white">Recent Outreach History</h2>
            <p className="text-xs text-black/60 dark:text-[#CBDDE9]">
              Showing {displayed.length} of {filtered.length} applications ({contacts.length} total)
            </p>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center space-x-1.5 text-xs text-black dark:text-white">
            <SlidersHorizontal className="h-3 w-3 text-[#2A72A1]" />
            <span className="hidden sm:inline">Rows:</span>
            <div className="flex items-center bg-[#CBDDE9]/25 dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 rounded-md p-0.5">
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setPageSize(opt);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    pageSize === opt
                      ? 'bg-[#2A72A1] text-white shadow-xs'
                      : 'text-black dark:text-[#CBDDE9] hover:bg-[#CBDDE9]/25'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#2A72A1] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search email, company..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-[#2A72A1] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border shrink-0 transition-all ${
                  statusFilter === f.key
                    ? 'bg-[#2A72A1] text-white border-[#2A72A1]'
                    : 'text-black dark:text-[#CBDDE9] border-[#CBDDE9] dark:border-[#2A72A1]/40 hover:bg-[#CBDDE9]/25 bg-white dark:bg-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-[#2A72A1] font-semibold flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading outreach history...</span>
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className="p-8 text-center text-xs text-black/60 dark:text-[#CBDDE9]/70">
          {contacts.length === 0 ? 'No HR contacts queued yet.' : 'No contacts match your current filter.'}
        </div>
      )}

      {/* Desktop / Tablet Table View (Hidden on mobile) */}
      {!loading && displayed.length > 0 && (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#CBDDE9] dark:border-[#2A72A1]/30 bg-[#CBDDE9]/15 dark:bg-black text-left text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
                  <th className="px-4 py-2.5">HR Contact</th>
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-4 py-2.5">Job Profile</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBDDE9] dark:divide-[#2A72A1]/20">
                {displayed.map((c) => {
                  const isEditing = editingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-[#CBDDE9]/15 dark:hover:bg-[#2A72A1]/10 transition-colors">
                      {isEditing ? (
                        <>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={editForm.hr_name}
                              onChange={(e) => setEditForm((f) => ({ ...f, hr_name: e.target.value }))}
                              placeholder="HR name"
                              className="w-full mb-1 px-2 py-1 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                            />
                            <input
                              type="email"
                              value={editForm.hr_email}
                              onChange={(e) => setEditForm((f) => ({ ...f, hr_email: e.target.value }))}
                              placeholder="HR email"
                              className="w-full px-2 py-1 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={editForm.company_name}
                              onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                              placeholder="Company"
                              className="w-full px-2 py-1 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-black dark:text-white">{c.job_profiles?.title || '—'}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={c.status} />
                            {editError && <p className="text-[10px] text-black dark:text-white mt-1 max-w-xs">{editError}</p>}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => saveEdit(c)}
                                disabled={busyId === c.id}
                                className="p-1.5 rounded-md text-[#2A72A1] hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
                                aria-label={`Save changes for ${c.hr_email}`}
                              >
                                {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={busyId === c.id}
                                className="p-1.5 rounded-md text-black dark:text-white hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
                                aria-label="Cancel editing"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5">
                            <p className="font-semibold text-black dark:text-white">{c.hr_name || '—'}</p>
                            <p className="text-[11px] text-black/70 dark:text-[#CBDDE9] truncate max-w-[180px]" title={c.hr_email}>
                              {c.hr_email}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-black dark:text-white truncate max-w-[120px]" title={c.company_name || ''}>
                            {c.company_name || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-black dark:text-white truncate max-w-[120px]" title={c.job_profiles?.title || ''}>
                            {c.job_profiles?.title || '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={c.status} />
                            {c.status === 'Failed' && c.error_message && (
                              <p className="text-[10px] text-black dark:text-white mt-0.5 max-w-xs truncate" title={c.error_message}>
                                {c.error_message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => startEdit(c)}
                                disabled={busyId === c.id}
                                className="p-1.5 rounded-md text-[#2A72A1] hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
                                aria-label={`Edit ${c.hr_email}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {c.status === 'Failed' && (
                                <button
                                  onClick={() => handleRetry(c)}
                                  disabled={busyId === c.id}
                                  className="p-1.5 rounded-md text-[#2A72A1] hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
                                  aria-label={`Retry ${c.hr_email}`}
                                >
                                  {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(c)}
                                disabled={busyId === c.id}
                                className="p-1.5 rounded-md text-black dark:text-white hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
                                aria-label={`Remove ${c.hr_email}`}
                              >
                                {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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

          {/* Mobile Card List View (Visible ONLY on mobile screens < 640px) */}
          <div className="block sm:hidden divide-y divide-[#CBDDE9] dark:divide-[#2A72A1]/20">
            {displayed.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <div key={c.id} className="p-3 space-y-2 hover:bg-[#CBDDE9]/15 dark:hover:bg-[#2A72A1]/10 transition-colors">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.hr_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, hr_name: e.target.value }))}
                        placeholder="HR name"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                      />
                      <input
                        type="email"
                        value={editForm.hr_email}
                        onChange={(e) => setEditForm((f) => ({ ...f, hr_email: e.target.value }))}
                        placeholder="HR email"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                      />
                      <input
                        type="text"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                        placeholder="Company"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#2A72A1]"
                      />
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-xs rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 text-black dark:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(c)}
                          disabled={busyId === c.id}
                          className="px-3 py-1 text-xs rounded-md bg-[#2A72A1] text-white font-semibold"
                        >
                          {busyId === c.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-black dark:text-white truncate">{c.hr_name || c.hr_email}</p>
                          <p className="text-[11px] text-black/70 dark:text-[#CBDDE9] truncate">{c.hr_email}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-black/80 dark:text-[#CBDDE9] pt-1">
                        <div>
                          <span className="font-semibold">{c.company_name || 'No Company'}</span>
                          {c.job_profiles?.title && (
                            <span className="ml-1.5 text-[#2A72A1]">({c.job_profiles.title})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1 rounded text-[#2A72A1] hover:bg-[#CBDDE9]/25"
                            aria-label="Edit contact"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {c.status === 'Failed' && (
                            <button
                              onClick={() => handleRetry(c)}
                              className="p-1 rounded text-[#2A72A1] hover:bg-[#CBDDE9]/25"
                              aria-label="Retry contact"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1 rounded text-black dark:text-white hover:bg-[#CBDDE9]/25"
                            aria-label="Delete contact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pageSize !== 'All' && totalPages > 1 && (
            <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#CBDDE9] dark:border-[#2A72A1]/30 bg-[#CBDDE9]/10 dark:bg-black text-xs">
              <span className="text-black/70 dark:text-[#CBDDE9]">
                Page <span className="font-bold text-black dark:text-white">{safeCurrentPage}</span> of {totalPages}
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white disabled:opacity-40 hover:bg-[#CBDDE9]/25 transition-all"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-[#CBDDE9] dark:border-[#2A72A1]/40 bg-white dark:bg-black text-black dark:text-white disabled:opacity-40 hover:bg-[#CBDDE9]/25 transition-all"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
