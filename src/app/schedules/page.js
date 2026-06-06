'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, AlertCircle } from 'lucide-react';
import { uploadAttachment } from '@/lib/media';

// Import modular schedules subcomponents
import StatusFilters from '@/components/schedules/StatusFilters';
import ScheduleTable from '@/components/schedules/ScheduleTable';
import ScheduleModal from '@/components/schedules/ScheduleModal';
import ViewMessageModal from '@/components/schedules/ViewMessageModal';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Queue stats
  const [counts, setCounts] = useState({
    Pending: 0,
    Sent: 0,
    Failed: 0,
  });

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    template_id: '',
    custom_message: '',
    schedule_date: '',
    schedule_time: '',
    channel: 'whatsapp', // 'whatsapp' | 'email'
    subject: '', // For email subject
    attachments: [], // For attached files metadata
  });

  const [formErrors, setFormErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [clientsRes, templatesRes, schedulesRes, mediaRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id, business_name, owner_name, phone_number, email')
          .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
          .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
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
            clients ( business_name, owner_name, phone_number, email ),
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

      // Compute status count chips
      const c = { Pending: 0, Sent: 0, Failed: 0 };
      scheduleData.forEach((item) => {
        if (item.status === 'Pending' || item.status === 'Scheduled') {
          c.Pending += 1;
        } else if (item.status === 'Sent') {
          c.Sent += 1;
        } else if (item.status === 'Failed') {
          c.Failed += 1;
        }
      });
      setCounts(c);
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

  const filteredSchedules = schedules.filter((item) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return item.status === 'Pending' || item.status === 'Scheduled';
    return item.status === statusFilter;
  });

  const handleAddClick = () => {
    setEditingSchedule(null);
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    setFormData({
      client_id: '',
      template_id: '',
      custom_message: '',
      schedule_date: todayStr,
      schedule_time: timeStr,
      channel: 'whatsapp',
      subject: '',
      attachments: [],
    });
    setFormErrors({});
    setUploadError(null);
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
        template_id: templateId,
        // Keep other values but remove template association
        template_id: ''
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
      fetchData();
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule: ' + err.message);
      setLoading(false);
    }
  };

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
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-905/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-850 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Status Counters Component */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <StatusFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          counts={counts}
        />
        <div className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
          Worker polls updates every 30s
        </div>
      </div>

      {/* Main Outreach Table Component */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
        <ScheduleTable
          schedules={filteredSchedules}
          loading={loading}
          onView={(item) => {
            setSelectedSchedule(item);
            setIsViewOpen(true);
          }}
          onSendNow={handleSendNow}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          getStatusBadgeStyles={getStatusBadgeStyles}
        />
      </div>

      {/* Add/Edit Modal Component */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        clients={clients}
        templates={templates}
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
