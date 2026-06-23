'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, AlertCircle, Upload, Download, FileSpreadsheet, Users } from 'lucide-react';

// Import modular clients subcomponents
import ClientTable from '@/components/clients/ClientTable';
import ClientModal from '@/components/clients/ClientModal';
import ClientDrawer from '@/components/clients/ClientDrawer';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientImportModal from '@/components/clients/ClientImportModal';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Checkbox Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Pagination & Infinite Scroll State
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef(null);
  const PAGE_SIZE = 20;
  
  // Form State
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone_number: '',
    email: '',
    website: '',
    city: '',
    category: '',
    tagsString: '',
    notes: '',
    status: 'New',
  });

  const [formErrors, setFormErrors] = useState({});

  // Reset selection when search or filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('category')
        .not('category', 'is', null)
        .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
        .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
        .neq('business_name', 'SYSTEM_EXCEL_SYNC');
      if (error) throw error;
      
      const uniqueCats = Array.from(
        new Set(data.map((c) => c.category).filter((cat) => cat && cat.trim() !== ''))
      );
      setCategories(uniqueCats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchClients = async (pageNum = 0) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setError(null);
      } else {
        setIsFetchingMore(true);
      }
      
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
        .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
        .neq('business_name', 'SYSTEM_EXCEL_SYNC');

      // Apply Search Term
      if (searchTerm.trim() !== '') {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(`business_name.ilike.${term},owner_name.ilike.${term},phone_number.ilike.${term},city.ilike.${term}`);
      }

      // Apply Status Filter
      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }

      // Apply Category Filter
      if (categoryFilter !== 'All') {
        query = query.eq('category', categoryFilter);
      }

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;

      if (pageNum === 0) {
        setClients(data || []);
      } else {
        setClients((prev) => [...prev, ...(data || [])]);
      }

      setHasMore(data && data.length === PAGE_SIZE && (count ? (from + data.length < count) : true));
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please check connection.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    fetchClients(0);
    fetchCategories();
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch page 0 when filters change
  useEffect(() => {
    setPage(0);
    fetchClients(0);
  }, [searchTerm, statusFilter, categoryFilter]);

  // Fetch next page when page increments
  useEffect(() => {
    if (page > 0) {
      fetchClients(page);
    }
  }, [page]);

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, isFetchingMore]);

  // Selection & Export Handlers
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map((c) => c.id));
    }
  };

  const formatCSVCell = (val) => {
    if (val === null || val === undefined) return '""';
    if (Array.isArray(val)) {
      return `"${val.join(', ').replace(/"/g, '""')}"`;
    }
    let formatted = String(val);
    formatted = formatted.replace(/"/g, '""');
    return `"${formatted}"`;
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      // 1. Fetch outreach schedules for selected clients
      const { data: schedules, error: schedulesErr } = await supabase
        .from('outreach_schedules')
        .select(`
          id,
          client_id,
          custom_message,
          attachments,
          schedule_date,
          schedule_time,
          status,
          created_at
        `)
        .in('client_id', selectedIds);
        
      if (schedulesErr) throw schedulesErr;

      // 2. Fetch media files lookup map
      const { data: media, error: mediaErr } = await supabase
        .from('media')
        .select('id, file_name, file_url');
      
      const mediaMap = {};
      if (!mediaErr && media) {
        media.forEach(m => {
          mediaMap[m.id] = m;
        });
      }

      // 3. Compile rows
      const csvRows = [];
      // Add Headers
      csvRows.push([
        'Business Name',
        'Owner Name',
        'Phone Number',
        'Email',
        'Website',
        'City',
        'Category',
        'Status',
        'Notes',
        'Outreach Channel',
        'Outreach Status',
        'Scheduled Date',
        'Scheduled Time',
        'Message Content',
        'Attachments'
      ]);

      selectedIds.forEach((clientId) => {
        const client = clients.find((c) => c.id === clientId);
        if (!client) return;

        const clientSchedules = (schedules || []).filter((s) => s.client_id === clientId);

        if (clientSchedules.length === 0) {
          csvRows.push([
            client.business_name || '',
            client.owner_name || '',
            client.phone_number || '',
            client.email || '',
            client.website || '',
            client.city || '',
            client.category || '',
            client.status || '',
            client.notes || '',
            '', '', '', '', '', ''
          ]);
        } else {
          clientSchedules.forEach((schedule) => {
            let channel = 'whatsapp';
            let messageText = schedule.custom_message || '';
            if (messageText.startsWith('[EMAIL]\nSubject:')) {
              channel = 'email';
              const parts = messageText.split('---');
              messageText = parts.slice(1).join('---').trim();
            }

            const attachmentsStr = (schedule.attachments || [])
              .map((uuid) => {
                const m = mediaMap[uuid];
                return m ? `${m.file_name} (${m.file_url})` : uuid;
              })
              .join('; ');

            csvRows.push([
              client.business_name || '',
              client.owner_name || '',
              client.phone_number || '',
              client.email || '',
              client.website || '',
              client.city || '',
              client.category || '',
              client.status || '',
              client.notes || '',
              channel,
              schedule.status || '',
              schedule.schedule_date || '',
              schedule.schedule_time || '',
              messageText,
              attachmentsStr
            ]);
          });
        }
      });

      // 4. Generate CSV text
      const csvContent = csvRows
        .map((row) => row.map(formatCSVCell).join(','))
        .join('\r\n');

      // 5. Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await supabase.from('activity_logs').insert({
        action_type: 'Exported Clients',
        details: `Exported ${selectedIds.length} client profiles and message history to Excel/CSV.`
      });
      
      setSelectedIds([]);
    } catch (err) {
      console.error('Error exporting clients:', err);
      alert('Failed to export clients data.');
    } finally {
      setLoading(false);
    }
  };



  // Open modal for adding
  const handleAddClick = () => {
    setEditingClient(null);
    setFormData({
      business_name: '',
      owner_name: '',
      phone_number: '',
      email: '',
      website: '',
      city: '',
      category: '',
      tagsString: '',
      notes: '',
      status: 'New',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (e, client) => {
    e.stopPropagation(); // Prevent opening drawer
    setEditingClient(client);
    setFormData({
      business_name: client.business_name || '',
      owner_name: client.owner_name || '',
      phone_number: client.phone_number || '',
      email: client.email || '',
      website: client.website || '',
      city: client.city || '',
      category: client.category || '',
      tagsString: client.tags ? client.tags.join(', ') : '',
      notes: client.notes || '',
      status: client.status || 'New',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDeleteClick = async (e, client) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete client "${client.business_name}"? This will also remove their scheduled outreach messages.`)) {
      return;
    }
    
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);
        
      if (deleteError) throw deleteError;
      
      // Add activity log
      await supabase.from('activity_logs').insert({
        action_type: 'Deleted Client',
        details: `Removed client "${client.business_name}" from CRM.`
      });

      // Clear selection if deleted client was open
      if (selectedClient?.id === client.id) {
        setSelectedClient(null);
      }
      
      handleRefresh();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client.');
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required';
    }
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\+?\d{8,15}$/.test(formData.phone_number.replace(/[\s-()]/g, ''))) {
      errors.phone_number = 'Provide a valid phone number with country code (e.g. +1234567890)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const formattedTags = formData.tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const clientPayload = {
      business_name: formData.business_name.trim(),
      owner_name: formData.owner_name.trim() || null,
      phone_number: formData.phone_number.replace(/[\s-()]/g, ''),
      email: formData.email.trim() || null,
      website: formData.website.trim() || null,
      city: formData.city.trim() || null,
      category: formData.category.trim() || null,
      tags: formattedTags,
      notes: formData.notes.trim() || null,
      status: formData.status,
      updated_at: new Date().toISOString()
    };

    try {
      setLoading(true);
      if (editingClient) {
        // Edit Client
        const { error: updateError } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq('id', editingClient.id);
          
        if (updateError) throw updateError;

        await supabase.from('activity_logs').insert({
          action_type: 'Updated Client',
          details: `Updated info for client "${clientPayload.business_name}".`
        });

        // Update selectedClient if open in drawer
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...editingClient, ...clientPayload });
        }
      } else {
        // Add Client
        const { error: insertError } = await supabase
          .from('clients')
          .insert(clientPayload);
          
        if (insertError) throw insertError;

        await supabase.from('activity_logs').insert({
          action_type: 'Created Client',
          details: `Created new client "${clientPayload.business_name}".`
        });
      }
      
      setIsModalOpen(false);
      handleRefresh();
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Failed to save client: ' + err.message);
      setLoading(false);
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
      case 'Lead':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
      case 'New':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30';
      case 'Inactive':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
      case 'Archived':
        return 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Clients</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage client profiles, contact information, and CRM parameters.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-[#111625] dark:hover:bg-[#1c2336] text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-x-2"
          >
            <Upload className="h-4.5 w-4.5" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all space-x-2"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filters & Search Controls Component */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      {/* Main Clients Table Component */}
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
        <ClientTable
          clients={clients}
          loading={loading}
          onRowClick={setSelectedClient}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          getStatusBadgeStyles={getStatusBadgeStyles}
          selectedIds={selectedIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={loaderRef} className="h-12 flex items-center justify-center mt-4 mb-8">
        {isFetchingMore && (
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
            <span>Loading more clients...</span>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 shadow-xl flex items-center justify-between space-x-6 animate-in slide-in-from-bottom duration-300 max-w-lg w-[calc(100%-2rem)]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedIds.length} Client{selectedIds.length > 1 ? 's' : ''} Selected</div>
              <p className="text-[10px] text-slate-500">Perform bulk client actions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleExportSelected}
              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all space-x-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal Component */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        categories={categories}
        formErrors={formErrors}
        editingClient={editingClient}
      />

      {/* Bulk Import Modal Component */}
      <ClientImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => {
          setIsImportOpen(false);
          handleRefresh();
        }}
        clients={clients}
      />

      {/* Right Drawer Side Panel Detail Display Component */}
      <ClientDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        getStatusBadgeStyles={getStatusBadgeStyles}
      />
    </div>
  );
}
