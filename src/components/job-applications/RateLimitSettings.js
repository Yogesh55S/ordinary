'use client';

import { useEffect, useState } from 'react';
import { Timer, Loader2, Send, CheckCircle2, XCircle } from 'lucide-react';

function formatTimestamp(value) {
  if (!value) return 'Never';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function RateLimitSettings({ settings, pendingCount, onSave, onSendNow, sendingNow, lastSendResult }) {
  const [form, setForm] = useState({ batch_size: 5, interval_value: 30, interval_unit: 'minutes', is_active: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        batch_size: settings.batch_size,
        interval_value: settings.interval_value,
        interval_unit: settings.interval_unit,
        is_active: settings.is_active,
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSavedMsg('');
    if (form.batch_size < 1 || form.interval_value < 1) {
      setError('Batch size and interval must be at least 1.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      setSavedMsg('Loop settings saved.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs p-6 space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
          <Timer className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sending Loop</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rate-limit outreach to avoid spam filters</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span>Send</span>
          <input
            type="number"
            min={1}
            value={form.batch_size}
            onChange={(e) => setForm((f) => ({ ...f, batch_size: parseInt(e.target.value, 10) || 1 }))}
            className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />
          <span>emails every</span>
          <input
            type="number"
            min={1}
            value={form.interval_value}
            onChange={(e) => setForm((f) => ({ ...f, interval_value: parseInt(e.target.value, 10) || 1 }))}
            className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />
          <select
            value={form.interval_unit}
            onChange={(e) => setForm((f) => ({ ...f, interval_unit: e.target.value }))}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>

        <label className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loop active (background worker will send automatically)</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${form.is_active ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            aria-pressed={form.is_active}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-4.5' : 'translate-x-1'}`} />
          </button>
        </label>

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="p-2.5 bg-slate-50 dark:bg-[#0e1320] rounded-lg border border-slate-100 dark:border-slate-800/60">
            <p className="font-semibold text-slate-700 dark:text-slate-300">{pendingCount}</p>
            <p>Pending in queue</p>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-[#0e1320] rounded-lg border border-slate-100 dark:border-slate-800/60">
            <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{formatTimestamp(settings?.last_run_at)}</p>
            <p>Last batch run</p>
          </div>
        </div>

        {savedMsg && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{savedMsg}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{saving ? 'Saving...' : 'Save Loop Settings'}</span>
          </button>
          <button
            type="button"
            onClick={onSendNow}
            disabled={sendingNow || pendingCount === 0}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-[#0e1320] border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm shadow-sm transition-all"
          >
            {sendingNow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{sendingNow ? 'Sending...' : 'Send Batch Now'}</span>
          </button>
        </div>
      </form>

      {lastSendResult && (
        <div className={`flex items-start space-x-2 p-3 rounded-xl text-xs font-medium ${lastSendResult.error ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
          {lastSendResult.error
            ? <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          }
          <span>
            {lastSendResult.error
              ? lastSendResult.error
              : `Sent ${lastSendResult.sent}, failed ${lastSendResult.failed}. ${lastSendResult.remaining} still pending.`}
          </span>
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        This only saves the schedule. To actually send in the background on this interval, run{' '}
        <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">npm run job-application-worker</code>{' '}
        as a persistent process — see the setup notes below.
      </p>
    </div>
  );
}
