'use client';

import { useState, useRef } from 'react';
import {
  Search, MapPin, Users, Download, Globe,
  X, ChevronRight, Loader2, AlertCircle, CheckCircle, Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import ProspectTable from '@/components/prospect/ProspectTable';
import AddClientModal from '@/components/prospect/AddClientModal';
import BulkSendModal from '@/components/prospect/BulkSendModal';
import SendProgressModal from '@/components/prospect/SendProgressModal';
import { mapPlaceTypeToCategory, extractCityFromAddress, formatCSVCell } from '@/lib/placeUtils';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Results' },
  { key: 'noWebsite', label: 'No Website' },
  { key: 'hasWebsite', label: 'Has Website' },
];

export default function ProspectPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const [addingPlace, setAddingPlace] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [clientStatusMap, setClientStatusMap] = useState({});
  const [bulkSending, setBulkSending] = useState(false);
  const [progressItems, setProgressItems] = useState(null);
  const inputRef = useRef(null);

  const refreshClientStatus = async (placeIds) => {
    if (!placeIds.length) return;
    const { data: clientRows, error: clientErr } = await supabase
      .from('clients')
      .select('id, place_id')
      .in('place_id', placeIds);

    if (clientErr || !clientRows?.length) return;

    const clientIds = clientRows.map((c) => c.id);
    const { data: scheduleRows } = await supabase
      .from('outreach_schedules')
      .select('client_id, status')
      .in('client_id', clientIds);

    const scheduleByClient = {};
    (scheduleRows || []).forEach((s) => {
      if (!scheduleByClient[s.client_id]) scheduleByClient[s.client_id] = { hasPending: false, hasSent: false };
      if (s.status === 'Pending' || s.status === 'Scheduled') scheduleByClient[s.client_id].hasPending = true;
      if (s.status === 'Sent') scheduleByClient[s.client_id].hasSent = true;
    });

    setClientStatusMap((prev) => {
      const next = { ...prev };
      clientRows.forEach((c) => {
        const sched = scheduleByClient[c.id] || { hasPending: false, hasSent: false };
        next[c.place_id] = { clientId: c.id, ...sched };
      });
      return next;
    });
  };

  const applyFilter = (list) => {
    if (filter === 'hasWebsite') return list.filter((r) => !!r.website);
    if (filter === 'noWebsite') return list.filter((r) => !r.website);
    return list;
  };

  const filteredResults = applyFilter(results);

  const fetchPlaces = async (searchQuery, pageToken = null) => {
    const isMore = !!pageToken;
    try {
      if (isMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setResults([]);
        setSelectedIds([]);
        setNextPageToken(null);
        setClientStatusMap({});
      }

      const params = new URLSearchParams();
      if (pageToken) {
        params.set('pagetoken', pageToken);
      } else {
        params.set('query', searchQuery);
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch results.');

      if (isMore) {
        setResults((prev) => [...prev, ...(data.results || [])]);
      } else {
        setResults(data.results || []);
        setHasSearched(true);
      }
      setNextPageToken(data.next_page_token || null);

      const placeIds = (data.results || []).map((r) => r.place_id).filter(Boolean);
      refreshClientStatus(placeIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchPlaces(query.trim());
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredResults.map((r) => r.place_id);
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setSelectedIds([]);
  };

  const handleExportSelected = () => {
    const toExport = results.filter((r) => selectedIds.includes(r.place_id));
    if (!toExport.length) return;

    const headers = [
      'Business Name', 'Owner Name', 'Phone Number', 'Email',
      'Website', 'City', 'Category', 'Status', 'Notes',
    ];

    const rows = toExport.map((r) => {
      const city = extractCityFromAddress(r.formatted_address);
      const category = mapPlaceTypeToCategory(r.types);
      const noteLines = ['Google Maps Source', `Address: ${r.formatted_address || ''}`];
      if (r.rating != null) noteLines.push(`Google Rating: ${r.rating}/5`);
      return [
        r.name,
        '',
        r.formatted_phone_number || '',
        '',
        r.website || '',
        city,
        category,
        'Lead',
        noteLines.join('\n'),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(formatCSVCell).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddClientSuccess = (businessName) => {
    if (addingPlace?.place_id) refreshClientStatus([addingPlace.place_id]);
    setAddingPlace(null);
    setSuccessMsg(`"${businessName}" added to Clients successfully!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const hasWebsiteCount = results.filter((r) => r.website).length;
  const noWebsiteCount = results.filter((r) => !r.website).length;

  return (
    <div className="flex-1 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Prospect Finder"
        description="Search Google Maps for local businesses and convert them into clients."
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "dental clinic in karnal" or "restaurant in delhi"'
            className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-ink-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="inline-flex items-center space-x-2 px-4 sm:px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-2xl text-sm shadow-sm transition-all shrink-0"
        >
          {loading
            ? <Loader2 className="h-4.5 w-4.5 animate-spin" />
            : <Search className="h-4.5 w-4.5" />
          }
          <span className="hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start space-x-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Results Area */}
      {hasSearched && !loading && (
        <div className="space-y-4">
          {/* Stats + Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span>{hasWebsiteCount} have a website</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400 inline-block shrink-0" />
                <span>{noWebsiteCount} no website</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 scroll-x-touch no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => handleFilterChange(f.key)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    filter === f.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-ink-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
            <ProspectTable
              results={filteredResults}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onAddClient={setAddingPlace}
              clientStatusMap={clientStatusMap}
            />
          </div>

          {/* Load More */}
          {nextPageToken && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchPlaces(null, nextPageToken)}
                disabled={loadingMore}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white dark:bg-ink-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all shadow-sm"
              >
                {loadingMore
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ChevronRight className="h-4 w-4" />
                }
                <span>{loadingMore ? 'Loading more...' : 'Load More Results'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State (before first search) */}
      {!hasSearched && !loading && (
        <div className="flex flex-col items-center justify-center py-14 sm:py-28 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-5 shadow-sm">
            <MapPin className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Find Your Next Client</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
            Search Google Maps for any business type in any city. Instantly see who has a website and who doesn&apos;t — perfect for finding outreach opportunities.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['dental clinic in karnal', 'salon in delhi', 'gym in mumbai'].map((example) => (
              <button
                key={example}
                onClick={() => { setQuery(example); inputRef.current?.focus(); }}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-lg hover:border-indigo-400 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 max-w-xl w-[calc(100%-2rem)]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {selectedIds.length} Prospect{selectedIds.length > 1 ? 's' : ''} Selected
              </div>
              <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400">Add to Clients &amp; queue a WhatsApp message, or export as CSV</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleExportSelected}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setBulkSending(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Add &amp; Send Message</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {addingPlace && (
        <AddClientModal
          place={addingPlace}
          onClose={() => setAddingPlace(null)}
          onSuccess={handleAddClientSuccess}
        />
      )}

      {/* Bulk Add & Send Modal */}
      {bulkSending && (
        <BulkSendModal
          prospects={results.filter((r) => selectedIds.includes(r.place_id))}
          clientStatusMap={clientStatusMap}
          onClose={() => setBulkSending(false)}
          onQueued={(queued) => {
            const placeIds = queued.map((q) => q.placeId);
            setBulkSending(false);
            setSelectedIds([]);
            setProgressItems(queued);
            refreshClientStatus(placeIds);
          }}
        />
      )}

      {/* Send Progress Modal */}
      {progressItems && (
        <SendProgressModal
          items={progressItems}
          onClose={() => setProgressItems(null)}
        />
      )}
    </div>
  );
}
