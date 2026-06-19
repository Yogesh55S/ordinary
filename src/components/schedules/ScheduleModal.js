import { useState, useEffect, useMemo } from 'react';
import { X, Paperclip, RefreshCw, Search, Users, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ScheduleModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  clients,
  templates,
  schedules = [],
  onTemplateChange,
  formErrors,
  editingSchedule,
  
  // Attachments props
  uploadingFile,
  uploadError,
  onFileUpload,
  onRemoveAttachment
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [scheduleStateFilter, setScheduleStateFilter] = useState('All');
  // 'All' | 'no_pending' (no pending schedule) | 'has_pending' (already has pending)
  // | 'never_sent' (never had a Sent schedule) | 'already_sent' (has at least one Sent)

  // Hard reset ALL filters every time modal opens — prevents stale filter context
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setCategoryFilter('All');
      setScheduleStateFilter('All');
    }
  }, [isOpen]);

  // Extract unique categories for filtering
  const uniqueCategories = useMemo(() => {
    return [...new Set((clients || []).map(c => c.category).filter(Boolean))];
  }, [clients]);

  // Precompute client schedule states for smart filtering
  // This gives us a clear picture per client: do they have a Pending schedule? A Sent one?
  const clientScheduleState = useMemo(() => {
    const state = {};
    (schedules || []).forEach((s) => {
      if (!state[s.client_id]) {
        state[s.client_id] = { hasPending: false, hasSent: false };
      }
      if (s.status === 'Pending' || s.status === 'Scheduled') {
        state[s.client_id].hasPending = true;
      }
      if (s.status === 'Sent') {
        state[s.client_id].hasSent = true;
      }
    });
    return state;
  }, [schedules]);

  // Apply filters to clients dropdown list
  const filteredClientsForDropdown = useMemo(() => {
    return (clients || []).filter((client) => {
      // Exclude if already added to schedule (has any pending or sent schedule)
      const state = clientScheduleState[client.id] || { hasPending: false, hasSent: false };
      const hasBeenScheduledOrSent = state.hasPending || state.hasSent || client.status === 'Archived';
      
      // Keep if it is the currently selected client in the form (so editing/viewing still works)
      const isCurrentlySelected = formData.client_id === client.id;

      if (hasBeenScheduledOrSent && !isCurrentlySelected) {
        return false;
      }

      // 1. Search Query filter (Business Name, Owner Name, Contact details)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (client.business_name || '').toLowerCase().includes(q);
        const ownerMatch = (client.owner_name || '').toLowerCase().includes(q);
        const phoneMatch = (client.phone_number || '').toLowerCase().includes(q);
        const emailMatch = (client.email || '').toLowerCase().includes(q);
        if (!nameMatch && !ownerMatch && !phoneMatch && !emailMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter !== 'All' && client.category !== categoryFilter) {
        return false;
      }

      // 3. Schedule state filter — smart scoped filtering
      switch (scheduleStateFilter) {
        case 'no_pending':
          // Clients WITHOUT any pending/scheduled outreach
          if (state.hasPending) return false;
          break;
        case 'has_pending':
          // Clients that ALREADY have a pending schedule (to avoid duplicates)
          if (!state.hasPending) return false;
          break;
        case 'never_sent':
          // Clients who have NEVER been sent a message (brand new targets)
          if (state.hasSent || client.status === 'Archived') return false;
          break;
        case 'already_sent':
          // Clients who have received at least one Sent message
          if (!state.hasSent && client.status !== 'Archived') return false;
          break;
        default:
          break;
      }

      return true;
    });
  }, [clients, searchQuery, categoryFilter, scheduleStateFilter, clientScheduleState, formData.client_id]);

  // Count how many are in each filter bucket (for the badges)
  const filterCounts = useMemo(() => {
    const counts = { all: (clients || []).length, no_pending: 0, has_pending: 0, never_sent: 0, already_sent: 0 };
    (clients || []).forEach((client) => {
      // Apply category filter first
      if (categoryFilter !== 'All' && client.category !== categoryFilter) return;
      
      const state = clientScheduleState[client.id] || { hasPending: false, hasSent: false };
      if (!state.hasPending) counts.no_pending++;
      if (state.hasPending) counts.has_pending++;
      if (!state.hasSent && client.status !== 'Archived') counts.never_sent++;
      if (state.hasSent || client.status === 'Archived') counts.already_sent++;
    });
    return counts;
  }, [clients, clientScheduleState, categoryFilter]);

  // Build visual indicator for selected client
  const selectedClient = formData.client_id ? (clients || []).find(c => c.id === formData.client_id) : null;
  const selectedClientState = selectedClient ? (clientScheduleState[selectedClient.id] || { hasPending: false, hasSent: false }) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#111625] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {editingSchedule ? 'Edit Schedule Event' : 'Create New Outreach Schedule'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Target Client selector section with nested search & filters */}
          <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-455 uppercase tracking-wider block">Target Client Recipient *</label>
              <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500">
                {filteredClientsForDropdown.length} matching clients
              </span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name / phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-850 dark:text-slate-300"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {/* Category selector */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-850 dark:text-slate-300"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Schedule State Filter — the key improvement */}
              <div>
                <select
                  value={scheduleStateFilter}
                  onChange={(e) => setScheduleStateFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-850 dark:text-slate-300"
                >
                  <option value="All">All Clients</option>
                  <option value="no_pending">📭 No Pending Schedule ({filterCounts.no_pending})</option>
                  <option value="has_pending">📬 Already in Queue ({filterCounts.has_pending})</option>
                  <option value="never_sent">🆕 Never Contacted ({filterCounts.never_sent})</option>
                  <option value="already_sent">✔️ Previously Sent ({filterCounts.already_sent})</option>
                </select>
              </div>
            </div>

            {/* Target Client Selection List */}
            <div className={`border rounded-xl overflow-hidden bg-white dark:bg-[#0e1320] ${
              formErrors.client_id 
                ? 'border-rose-300 dark:border-rose-900/50' 
                : 'border-slate-200 dark:border-slate-800/80'
            }`}>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {filteredClientsForDropdown.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No clients found matching the filters.
                  </div>
                ) : (
                  filteredClientsForDropdown.map((client) => {
                    const state = clientScheduleState[client.id] || { hasPending: false, hasSent: false };
                    const isSelected = formData.client_id === client.id;
                    
                    let statusLabel = '';
                    let statusColor = '';
                    if (state.hasPending) {
                      statusLabel = 'In Queue';
                      statusColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
                    } else if (state.hasSent || client.status === 'Archived') {
                      statusLabel = 'Sent Before';
                      statusColor = 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
                    } else {
                      statusLabel = 'New Target';
                      statusColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30';
                    }

                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, client_id: client.id })}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-xs ${
                          isSelected 
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/15 border-l-2 border-indigo-600' 
                            : 'border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${isSelected ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {client.business_name}
                            </span>
                            {client.category && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                {client.category}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-450 mt-1 flex items-center space-x-1.5 truncate">
                            <span>{client.owner_name}</span>
                            <span>•</span>
                            <span className="font-mono">{client.phone_number || client.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shrink-0 font-bold text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            {formErrors.client_id && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block mt-1">{formErrors.client_id}</span>
            )}

            {/* Selected client info card — shows clearly who is selected */}
            {selectedClient && (
              <div className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                selectedClientState?.hasPending 
                  ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30' 
                  : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30'
              }`}>
                {selectedClientState?.hasPending ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Selected: {selectedClient.business_name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {selectedClient.owner_name} • {selectedClient.phone_number || selectedClient.email}
                    {selectedClient.category ? ` • ${selectedClient.category}` : ''}
                  </span>
                  {selectedClientState?.hasPending && !editingSchedule && (
                    <span className="block mt-1 font-semibold text-amber-700 dark:text-amber-400">
                      ⚠ This client already has a pending schedule in the queue
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Predefined Template (Optional)</label>
              <select
                value={formData.template_id}
                onChange={onTemplateChange}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-850 dark:text-slate-300"
              >
                <option value="" className="dark:bg-[#111625]">-- Custom Message (No Template) --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} className="dark:bg-[#111625]">
                    {tpl.template_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outreach Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Outreach Channel *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-850 dark:text-slate-300"
              >
                <option value="whatsapp" className="dark:bg-[#111625]">WhatsApp Business Link</option>
                <option value="email" className="dark:bg-[#111625]">Email (SMTP Server)</option>
              </select>
            </div>

            {/* Email Subject Line (Conditional) */}
            {formData.channel === 'email' && (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Email Subject Line *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-slate-100 dark:bg-[#0e1320] ${
                    formErrors.subject 
                      ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="Demo Idea for your business"
                />
                {formErrors.subject && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.subject}</span>
                )}
              </div>
            )}

            {/* Date picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Schedule Date *</label>
              <input
                type="date"
                value={formData.schedule_date}
                onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.schedule_date 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {formErrors.schedule_date && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.schedule_date}</span>
              )}
            </div>

            {/* Time picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Schedule Time *</label>
              <input
                type="time"
                value={formData.schedule_time}
                onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-slate-100 dark:bg-[#0e1320] ${
                  formErrors.schedule_time 
                    ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {formErrors.schedule_time && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.schedule_time}</span>
              )}
            </div>
          </div>

          {/* Message content editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase">Message Content *</label>
            <textarea
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              rows={5}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 dark:text-slate-100 dark:bg-[#0e1320] font-mono ${
                formErrors.custom_message 
                  ? 'border-rose-300 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Insert custom content or load a template above..."
            />
            {formErrors.custom_message && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">{formErrors.custom_message}</span>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase block font-bold">Outreach Attachments</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 dark:bg-[#0e1320] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-colors">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
              {uploadingFile && (
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading files to cloud...</span>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-xs text-rose-600 font-bold mt-1">{uploadError}</p>
            )}

            {/* Attached Files List */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {formData.attachments.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-705 dark:text-slate-350"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-750 dark:text-slate-305" title={file.file_name}>{file.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(file.id)}
                      className="ml-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1 leading-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111625]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFile}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {editingSchedule ? 'Save Changes' : 'Schedule Outreach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
