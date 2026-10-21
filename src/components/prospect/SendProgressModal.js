'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

const POLL_MS = 4000;

export default function SendProgressModal({ items, onClose }) {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(items.map((i) => [i.scheduleId, 'Pending']))
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    const ids = items.map((i) => i.scheduleId);
    if (ids.length === 0) return;

    const poll = async () => {
      const { data, error } = await supabase
        .from('outreach_schedules')
        .select('id, status')
        .in('id', ids);

      if (error || !data) return;

      setStatuses((prev) => {
        const next = { ...prev };
        data.forEach((row) => { next[row.id] = row.status; });
        return next;
      });

      const allDone = data.every((row) => row.status === 'Sent' || row.status === 'Failed');
      if (allDone && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items]);

  const total = items.length;
  const sentCount = Object.values(statuses).filter((s) => s === 'Sent').length;
  const failedCount = Object.values(statuses).filter((s) => s === 'Failed').length;
  const doneCount = sentCount + failedCount;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-2xl w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sending Messages</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {allDone ? 'All messages processed' : `${doneCount} of ${total} sent`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-5">
          {/* Progress bar */}
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{sentCount} sent{failedCount > 0 ? ` · ${failedCount} failed` : ''}</span>
            <span>{progressPct}%</span>
          </div>
        </div>

        {/* Recipient list */}
        <div className="p-6 pt-4 overflow-y-auto space-y-2">
          {items.map((item) => {
            const status = statuses[item.scheduleId] || 'Pending';
            let pill;
            if (status === 'Sent') {
              pill = (
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  <CheckCircle2 className="h-3 w-3" /><span>Sent</span>
                </span>
              );
            } else if (status === 'Failed') {
              pill = (
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30">
                  <XCircle className="h-3 w-3" /><span>Failed</span>
                </span>
              );
            } else {
              pill = (
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                  <Clock className="h-3 w-3" /><span>Queued</span>
                </span>
              );
            }

            return (
              <div key={item.scheduleId} className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{item.businessName}</span>
                {pill}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
            {!allDone && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
            Sending happens in the background with a short delay between messages — you can close this and it will keep going.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
          >
            {allDone ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
