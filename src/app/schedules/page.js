'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, AlertCircle, Calendar, RefreshCw, Search, X, Filter } from 'lucide-react';
import { uploadAttachment } from '@/lib/media';

// Import modular schedules subcomponents
import ScheduleTable from '@/components/schedules/ScheduleTable';
import ScheduleModal from '@/components/schedules/ScheduleModal';
import ViewMessageModal from '@/components/schedules/ViewMessageModal';

// Default empty form state — used as a single source of truth for resetting
const EMPTY_FORM = {
  client_id: '',
  template_id: '',
  custom_message: '',
  schedule_date: '',
  schedule_time: '',
  channel: 'whatsapp',
  subject: '',
  attachments: [],
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Category filter state (main page level)
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Queue table search & date filter
  const [queueSearch, setQueueSearch] = useState('');
  const [queueDateFilter, setQueueDateFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const [formErrors, setFormErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [clientsRes, templatesRes, schedulesRes, mediaRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id, business_name, owner_name, phone_number, email, category, status')
          .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
          .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
          .neq('business_name', 'SYSTEM_EXCEL_SYNC')
          .order('business_name'),
        supabase
          .from('templates')
          .select('id, template_name, message_content, attachments')
          .order('template_name'),
        supabase
          .from('outreach_schedules')
          .select(`
            id,
            client_id,
            template_id,
            custom_message,
            attachments,
            schedule_date,
            schedule_time,
            status,
            created_at,
            clients ( business_name, owner_name, phone_number, email, category, status ),
            templates ( template_name )
          `)
          .order('schedule_date', { ascending: true })
          .order('schedule_time', { ascending: true }),
        supabase
          .from('media')
          .select('*')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (templatesRes.error) throw templatesRes.error;
      if (schedulesRes.error) throw schedulesRes.error;
      if (mediaRes.error) throw mediaRes.error;

      // Create lookup map for media assets
      const mediaMap = {};
      (mediaRes.data || []).forEach((m) => {
        mediaMap[m.id] = m;
      });

      const scheduleData = (schedulesRes.data || []).map((item) => {
        // Resolve attachment UUID array to actual media objects
        const resolved = (item.attachments || [])
          .map((uuid) => mediaMap[uuid])
          .filter(Boolean);
        
        return {
          ...item,
          resolvedAttachments: resolved
        };
      });

      setClients(clientsRes.data || []);
      setTemplates(templatesRes.data || []);
      setSchedules(scheduleData);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules data:', err);
      setError('Failed to load scheduler records. Check database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute categories dynamically
  const uniqueCategories = ['All', ...new Set(clients.map(c => c.category).filter(Boolean))];

  // Category Filtered Schedules
  const categoryFilteredSchedules = schedules.filter((item) => {
    if (categoryFilter === 'All') return true;
    return item.clients?.category === categoryFilter;
  });

  // Split into Active (Pending/Scheduled)
  const pendingSchedules = categoryFilteredSchedules.filter(
    (item) => item.status === 'Pending' || item.status === 'Scheduled'
  );

  // Apply queue search & date filter on top of pending schedules
  const displayedSchedules = useMemo(() => {
    return pendingSchedules.filter((item) => {
      // Text search — matches client name, owner, phone, email, template name
      if (queueSearch.trim()) {
        const q = queueSearch.toLowerCase();
        const fields = [
          item.clients?.business_name,
          item.clients?.owner_name,
          item.clients?.phone_number,
          item.clients?.email,
          item.templates?.template_name,
        ];
        const matches = fields.some((f) => (f || '').toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Date filter
      if (queueDateFilter && item.schedule_date !== queueDateFilter) {
        return false;
      }

      return true;
    });
  }, [pendingSchedules, queueSearch, queueDateFilter]);

  // Compute status counts for the selected category
  const counts = { Pending: 0 };
  categoryFilteredSchedules.forEach((item) => {
    if (item.status === 'Pending' || item.status === 'Scheduled') {
      counts.Pending += 1;
    }
  });

  // Hard reset form to empty — clears ALL previous client data completely
  const resetFormToEmpty = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    setFormData({
      ...EMPTY_FORM,
      schedule_date: todayStr,
      schedule_time: timeStr,
    });
    setFormErrors({});
    setUploadError(null);
  }, []);

  const handleAddClick = () => {
    setEditingSchedule(null);
    resetFormToEmpty();
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingSchedule(item);
    
    let channel = 'whatsapp';
    let subject = '';
    let body = item.custom_message || '';
    
    if (body.startsWith('[EMAIL]\nSubject:')) {
      channel = 'email';
      const parts = body.split('---');
      const header = parts[0] || '';
      body = parts.slice(1).join('---').trim();
      
      const subjectLine = header.split('\n')[1] || '';
      subject = subjectLine.replace('Subject:', '').trim();
    }

    setFormData({
      client_id: item.client_id || '',
      template_id: item.template_id || '',
      custom_message: body,
      schedule_date: item.schedule_date || '',
      schedule_time: item.schedule_time ? item.schedule_time.substring(0, 5) : '',
      channel,
      subject,
      attachments: item.resolvedAttachments || [],
    });
    
    setFormErrors({});
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      const isEmail = template.message_content?.startsWith('[EMAIL]\nSubject:');
      let subject = '';
      let body = template.message_content || '';
      let channel = 'whatsapp';
      
      if (isEmail) {
        channel = 'email';
        const parts = body.split('---');
        const header = parts[0] || '';
        body = parts.slice(1).join('---').trim();
        
        const subjectLine = header.split('\n')[1] || '';
        subject = subjectLine.replace('Subject:', '').trim();
      }
      
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        custom_message: body,
        channel,
        subject,
        attachments: template.attachments || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        template_id: '',
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);
    setUploadError(null);
    try {
      const uploadedRows = [];
      for (const file of files) {
        const mediaRow = await uploadAttachment(file);
        uploadedRows.push({
          id: mediaRow.id,
          file_name: mediaRow.file_name,
          file_size: mediaRow.file_size,
          file_type: mediaRow.file_type,
          file_url: mediaRow.file_url,
        });
      }
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...uploadedRows]
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== id)
    }));
  };

  const handleSendNow = async (item) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { error: updateError } = await supabase
        .from('outreach_schedules')
        .update({
          schedule_date: today,
          schedule_time: '00:00:00',
          status: 'Pending'
        })
        .eq('id', item.id);
        
      if (updateError) throw updateError;

      // Add log
      await supabase.from('activity_logs').insert({
        action_type: 'Outreach Forced',
        details: `Requested immediate dispatch of outreach message to "${item.clients?.business_name}".`
      });

      fetchData();
    } catch (err) {
      console.error('Error forcing dispatch:', err);
      alert('Failed to schedule immediately.');
      setLoading(false);
    }
  };

  const handleDeleteClick = async (item) => {
    if (!confirm(`Are you sure you want to cancel and delete this schedule?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('outreach_schedules')
        .delete()
        .eq('id', item.id);
        
      if (deleteError) throw deleteError;

      await supabase.from('activity_logs').insert({
        action_type: 'Cancelled Schedule',
        details: `Deleted scheduled outreach for client "${item.clients?.business_name}".`
      });

      fetchData();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule.');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.client_id) {
      errors.client_id = 'Recipient client is required';
    }
    if (!formData.custom_message.trim()) {
      errors.custom_message = 'Outreach message content is required';
    }
    if (formData.channel === 'email' && !formData.subject.trim()) {
      errors.subject = 'Email subject line is required';
    }
    if (!formData.schedule_date) {
      errors.schedule_date = 'Schedule date is required';
    }
    if (!formData.schedule_time) {
      errors.schedule_time = 'Schedule time is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Compile message text if using Email channel
    let compileMessage = formData.custom_message.trim();
    if (formData.channel === 'email') {
      compileMessage = `[EMAIL]\nSubject: ${formData.subject.trim()}\n---\n${compileMessage}`;
    }

    const payload = {
      client_id: formData.client_id,
      template_id: formData.template_id || null,
      custom_message: compileMessage,
      attachments: (formData.attachments || []).map((a) => a.id),
      schedule_date: formData.schedule_date,
      schedule_time: formData.schedule_time + ':00',
      status: 'Pending',
    };

    try {
      setLoading(true);
      if (editingSchedule) {
        const { error: updateError } = await supabase
          .from('outreach_schedules')
          .update(payload)
          .eq('id', editingSchedule.id);
          
        if (updateError) throw updateError;

        await supabase.from('activity_logs').insert({
          action_type: 'Updated Schedule',
          details: `Updated queue schedule details for client "${clients.find(c => c.id === payload.client_id)?.business_name}".`
        });
      } else {
        const { error: insertError } = await supabase
          .from('outreach_schedules')
          .insert(payload);
          
        if (insertError) throw insertError;

        await supabase.from('activity_logs').insert({
          action_type: 'Scheduled Outreach',
          details: `Scheduled new ${formData.channel === 'email' ? 'Email' : 'WhatsApp'} outreach for client "${clients.find(c => c.id === payload.client_id)?.business_name}".`
        });
      }

      setIsModalOpen(false);
      // Hard reset form after successful save — prevents data bleed
      resetFormToEmpty();
      fetchData();
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule: ' + err.message);
      setLoading(false);
    }
  };

  // Close modal handler — also resets form
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    // Reset form on close to prevent stale data from leaking into next open
    setTimeout(() => resetFormToEmpty(), 150);
  }, [resetFormToEmpty]);

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Sent':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
      case 'Failed':
        return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
      case 'Pending':
      case 'Scheduled':
      default:
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
    }
  };

  const hasActiveFilters = queueSearch.trim() || queueDateFilter;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Outreach Queue</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Schedule message broadcasts, manage delivery dates, and execute outreach queues.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all space-x-2"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Schedule</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filters and Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-6">
          {/* Category Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Client Category Filter</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300 min-w-[180px]"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-center space-x-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-500 dark:text-slate-400">Pending / Scheduled:</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{counts.Pending}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden lg:block">
          Worker polls queue updates every 30s
        </div>
      </div>

      {/* Active Queue Table Component (Full Width) */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          {/* Title row */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Active Outreach Queue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pending and scheduled messages waiting for automatic dispatch</p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={() => { setQueueSearch(''); setQueueDateFilter(''); }}
                  className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span>Clear Filters</span>
                </button>
              )}
              <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                {displayedSchedules.length}{hasActiveFilters ? ` / ${pendingSchedules.length}` : ''} Active
              </span>
            </div>
          </div>

          {/* Queue search & date filter row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by client name, phone, email, template..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {queueSearch && (
                <button
                  onClick={() => setQueueSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="date"
                value={queueDateFilter}
                onChange={(e) => setQueueDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-300"
              />
              {queueDateFilter && (
                <button
                  onClick={() => setQueueDateFilter('')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <ScheduleTable
          schedules={displayedSchedules}
          loading={loading}
          onView={(item) => {
            setSelectedSchedule(item);
            setIsViewOpen(true);
          }}
          onSendNow={handleSendNow}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          getStatusBadgeStyles={getStatusBadgeStyles}
          isHistory={false}
        />
      </div>

      {/* Add/Edit Modal Component */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        clients={clients}
        templates={templates}
        schedules={schedules}
        onTemplateChange={handleTemplateChange}
        formErrors={formErrors}
        editingSchedule={editingSchedule}
        
        // Attachments & Uploading
        uploadingFile={uploadingFile}
        uploadError={uploadError}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={handleRemoveAttachment}
      />

      {/* View Message Modal Component */}
      <ViewMessageModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        schedule={selectedSchedule}
        getStatusBadgeStyles={getStatusBadgeStyles}
      />
    </div>
  );
}
