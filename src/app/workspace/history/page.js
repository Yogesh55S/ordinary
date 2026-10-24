'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, History, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ScheduleTable from '@/components/schedules/ScheduleTable';
import ViewMessageModal from '@/components/schedules/ViewMessageModal';

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Fetch initial data: Clients (to get unique categories)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, business_name, category')
          .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
          .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
          .neq('business_name', 'SYSTEM_EXCEL_SYNC');
        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  // Fetch initial history or when filter changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchHistoryData(0, true);
  }, [categoryFilter, clients]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistoryData(nextPage, false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, page, categoryFilter, clients]);

  const fetchHistoryData = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      
      let query = supabase
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
          clients ( business_name, owner_name, phone_number, email, category ),
          templates ( template_name )
        `)
        .in('status', ['Sent', 'Failed']);

      // Apply category filter safely using client list logic (to prevent inner join syntax bugs)
      if (categoryFilter !== 'All') {
        const filteredClientIds = clients
          .filter((c) => c.category === categoryFilter)
          .map((c) => c.id);
        
        // If no clients match the category, set empty list so query returns empty instead of all
        if (filteredClientIds.length === 0) {
          setSchedules([]);
          setHasMore(false);
          setLoading(false);
          setLoadingMore(false);
          return;
        }
        
        query = query.in('client_id', filteredClientIds);
      }

      // Order and Paginate
      query = query
        .order('schedule_date', { ascending: false })
        .order('schedule_time', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const [schedulesRes, mediaRes] = await Promise.all([
        query,
        supabase.from('media').select('*'),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (mediaRes.error) throw mediaRes.error;

      // Resolve attachments
      const mediaMap = {};
      (mediaRes.data || []).forEach((m) => {
        mediaMap[m.id] = m;
      });

      const fetchedSchedules = (schedulesRes.data || []).map((item) => {
        const resolved = (item.attachments || [])
          .map((uuid) => mediaMap[uuid])
          .filter(Boolean);
        
        return {
          ...item,
          resolvedAttachments: resolved
        };
      });

      if (isInitial) {
        setSchedules(fetchedSchedules);
      } else {
        setSchedules((prev) => [...prev, ...fetchedSchedules]);
      }

      // If fetched records are less than PAGE_SIZE, we reached the end
      if (fetchedSchedules.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load outreach history records.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDeleteClick = async (item) => {
    if (!confirm(`Are you sure you want to delete this outreach history record from ordinary?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('outreach_schedules')
        .delete()
        .eq('id', item.id);
        
      if (deleteError) throw deleteError;

      // Log cancel activity
      await supabase.from('activity_logs').insert({
        action_type: 'Delete History Record',
        details: `Deleted outreach history item for client "${item.clients?.business_name}".`
      });

      // Reload initial list
      setPage(0);
      setHasMore(true);
      fetchHistoryData(0, true);
    } catch (err) {
      console.error('Error deleting schedule history record:', err);
      alert('Failed to delete history item.');
      setLoading(false);
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Sent':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
      case 'Failed':
        return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  // Extract unique categories dynamically for filter options
  const uniqueCategories = ['All', ...new Set(clients.map((c) => c.category).filter(Boolean))];

  return (
    <div className="flex-1 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl mx-auto w-full relative">
      <PageHeader
        title="Outreach History"
        icon={History}
        description="Archived log of sent and failed outreach notifications."
        actions={
          <button
            onClick={() => {
              setPage(0);
              setHasMore(true);
              fetchHistoryData(0, true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-ink-800 dark:hover:bg-ink-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        }
      />

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-905/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-850 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-ink-800 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex-1 sm:flex-none min-w-0">
            <label htmlFor="history-category-filter" className="sr-only">Client category</label>
            <select
              id="history-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-ink-900 text-slate-850 dark:text-slate-300 w-full sm:w-auto sm:min-w-[200px]"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-450 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 px-3 py-2.5 sm:py-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <span>{schedules.length}<span className="hidden sm:inline"> loaded</span> records</span>
          </div>
        </div>

        <div className="hidden sm:block text-xs font-semibold text-slate-400 dark:text-slate-500">
          Scroll down to auto-load older outreach logs.
        </div>
      </div>

      {/* Outreach History Records Table */}
      <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
        <ScheduleTable
          schedules={schedules}
          loading={loading}
          onView={(item) => {
            setSelectedSchedule(item);
            setIsViewOpen(true);
          }}
          onSendNow={() => {}}
          onEdit={() => {}}
          onDelete={handleDeleteClick}
          getStatusBadgeStyles={getStatusBadgeStyles}
          isHistory={true}
        />
      </div>

      {/* Bottom Loading Indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6 space-x-2 text-sm text-indigo-600 dark:text-indigo-400 animate-pulse font-semibold">
          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
          <span>Fetching older outreach records...</span>
        </div>
      )}

      {/* End of logs status */}
      {!hasMore && schedules.length > 0 && (
        <div className="text-center py-6 text-xs text-slate-405 dark:text-slate-500 font-semibold border-t border-dashed border-slate-100 dark:border-slate-850">
          All outreach logs have been loaded.
        </div>
      )}

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
