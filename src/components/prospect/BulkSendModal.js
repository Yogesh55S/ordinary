'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Send, Loader2, PhoneOff, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { mapPlaceTypeToCategory, extractCityFromAddress } from '@/lib/placeUtils';

function buildClientPayload(place) {
  const city = extractCityFromAddress(place.formatted_address);
  const category = mapPlaceTypeToCategory(place.types);
  const noteLines = ['Google Maps Source', `Address: ${place.formatted_address || ''}`];
  if (place.rating != null) noteLines.push(`Google Rating: ${place.rating}/5`);

  return {
    business_name: place.name || '',
    owner_name: null,
    phone_number: (place.formatted_phone_number || '').replace(/[\s\-()]/g, '') || null,
    email: null,
    website: place.website || null,
    city,
    category,
    tags: [],
    notes: noteLines.join('\n'),
    status: 'Lead',
    place_id: place.place_id,
    updated_at: new Date().toISOString(),
  };
}

export default function BulkSendModal({ prospects, clientStatusMap, onClose, onQueued }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoadingTemplates(true);
      const { data, error: fetchError } = await supabase
        .from('templates')
        .select('id, template_name, message_content')
        .order('template_name');

      if (!fetchError && data) {
        setTemplates(data.filter((t) => !(t.message_content || '').startsWith('[EMAIL]\nSubject:')));
      }
      setLoadingTemplates(false);
    })();
  }, []);

  const rows = useMemo(() => {
    return prospects.map((place) => {
      const status = clientStatusMap[place.place_id];
      let skipReason = null;
      if (!place.formatted_phone_number) skipReason = 'No phone number';
      else if (status?.hasSent) skipReason = 'Already messaged';
      else if (status?.hasPending) skipReason = 'Already in queue';

      return { place, status, skipReason, eligible: !skipReason };
    });
  }, [prospects, clientStatusMap]);

  const eligibleRows = rows.filter((r) => r.eligible);
  const selectedTemplate = templates.find((t) => t.id === templateId);

  const handleSubmit = async () => {
    if (!templateId || eligibleRows.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const queued = [];
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().substring(0, 8);

      for (const row of eligibleRows) {
        let clientId = row.status?.clientId;

        if (!clientId) {
          const payload = buildClientPayload(row.place);
          const { data: inserted, error: insertError } = await supabase
            .from('clients')
            .insert(payload)
            .select('id')
            .single();
          if (insertError) throw insertError;
          clientId = inserted.id;
        }

        const { data: scheduleRow, error: scheduleError } = await supabase
          .from('outreach_schedules')
          .insert({
            client_id: clientId,
            template_id: templateId,
            custom_message: selectedTemplate.message_content,
            attachments: [],
            schedule_date: today,
            schedule_time: nowTime,
            status: 'Pending',
          })
          .select('id')
          .single();
        if (scheduleError) throw scheduleError;

        queued.push({
          scheduleId: scheduleRow.id,
          businessName: row.place.name,
          placeId: row.place.place_id,
        });
      }

      await supabase.from('activity_logs').insert({
        action_type: 'Bulk Outreach Queued',
        details: `Queued WhatsApp outreach ("${selectedTemplate.template_name}") to ${queued.length} prospect(s) from Prospect Finder.`,
      });

      onQueued(queued);
    } catch (err) {
      setError(err.message || 'Failed to queue messages.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-2xl w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Send className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Add &amp; Send Message</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{prospects.length} prospect{prospects.length > 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Recipient list */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {rows.map(({ place, skipReason, eligible }) => (
                <div key={place.place_id} className="flex items-center justify-between px-4 py-2.5 text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{place.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{place.formatted_phone_number || 'No phone'}</p>
                  </div>
                  {eligible ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0 whitespace-nowrap">
                      <MessageSquare className="h-3 w-3" />
                      <span>Will send</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/30 shrink-0 whitespace-nowrap">
                      {skipReason === 'No phone number' ? <PhoneOff className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>Skipped — {skipReason}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {rows.length !== eligibleRows.length && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {eligibleRows.length} of {rows.length} will be messaged — the rest are skipped to avoid duplicates.
            </p>
          )}

          {/* Template selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message Template <span className="text-rose-500">*</span>
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={loadingTemplates}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-ink-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            >
              <option value="">{loadingTemplates ? 'Loading templates...' : '-- Select a template --'}</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.template_name}</option>
              ))}
            </select>
            {!loadingTemplates && templates.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">No WhatsApp templates found — create one in Templates first.</p>
            )}
          </div>

          {selectedTemplate && (
            <div className="p-3.5 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Preview</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{selectedTemplate.message_content}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !templateId || eligibleRows.length === 0}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
          >
            {submitting
              ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              : <Send className="h-4 w-4 shrink-0" />
            }
            <span>{submitting ? 'Queuing...' : `Add & Queue ${eligibleRows.length} Message${eligibleRows.length !== 1 ? 's' : ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
