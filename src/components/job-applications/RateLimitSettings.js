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
    <div className="bg-white dark:bg-black rounded-lg border border-mist dark:border-line shadow-xs p-5 space-y-4 transition-colors">
      <div className="flex items-center space-x-2.5 border-b border-mist/60 dark:border-line pb-3">
        <div className="h-8 w-8 bg-mist/30 dark:bg-black text-brand border border-mist dark:border-line rounded-md flex items-center justify-center shrink-0">
          <Timer className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-black dark:text-white">Outreach Rate Limiting</h2>
          <p className="text-xs text-black/60 dark:text-mist">Interval throttle to protect sender reputation</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {error && (
          <div className="p-2 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-md text-black dark:text-white text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-black dark:text-white">
          <span>Send</span>
          <input
            type="number"
            min={1}
            value={form.batch_size}
            onChange={(e) => setForm((f) => ({ ...f, batch_size: parseInt(e.target.value, 10) || 1 }))}
            className="w-14 px-2 py-1 text-xs text-center rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand transition-colors"
          />
          <span>emails every</span>
          <input
            type="number"
            min={1}
            value={form.interval_value}
            onChange={(e) => setForm((f) => ({ ...f, interval_value: parseInt(e.target.value, 10) || 1 }))}
            className="w-14 px-2 py-1 text-xs text-center rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand transition-colors"
          />
          <select
            value={form.interval_unit}
            onChange={(e) => setForm((f) => ({ ...f, interval_unit: e.target.value }))}
            className="px-2 py-1 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand transition-colors"
          >
            <option value="minutes" className="bg-white dark:bg-black text-black dark:text-white">Minutes</option>
            <option value="hours" className="bg-white dark:bg-black text-black dark:text-white">Hours</option>
          </select>
        </div>

        <label className="flex items-center justify-between px-3 py-2 bg-mist/15 dark:bg-black border border-mist dark:border-line rounded-md cursor-pointer">
          <span className="text-xs font-semibold text-black dark:text-white">Automated background worker loop</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
            className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors shrink-0 ${form.is_active ? 'bg-brand' : 'bg-mist dark:bg-brand/40'}`}
            aria-pressed={form.is_active}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs text-black/70 dark:text-mist">
          <div className="p-2 bg-mist/15 dark:bg-black rounded-md border border-mist dark:border-line">
            <p className="text-base font-bold text-black dark:text-white">{pendingCount}</p>
            <p className="text-[11px]">Pending in queue</p>
          </div>
          <div className="p-2 bg-mist/15 dark:bg-black rounded-md border border-mist dark:border-line">
            <p className="text-xs font-bold text-black dark:text-white truncate mt-1">{formatTimestamp(settings?.last_run_at)}</p>
            <p className="text-[11px]">Last batch run</p>
          </div>
        </div>

        {savedMsg && <p className="text-xs font-bold text-brand dark:text-mist">{savedMsg}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-brand hover:opacity-90 disabled:opacity-60 text-white font-semibold rounded-md text-xs shadow-xs transition-all"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
          <button
            type="button"
            onClick={onSendNow}
            disabled={sendingNow || pendingCount === 0}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-white dark:bg-black border border-mist dark:border-line hover:bg-mist/25 disabled:opacity-50 text-black dark:text-white font-semibold rounded-md text-xs shadow-xs transition-all"
          >
            {sendingNow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-brand" />}
            <span>{sendingNow ? 'Sending...' : 'Send Batch'}</span>
          </button>
        </div>
      </form>

      {lastSendResult && (
        <div className={`flex items-start space-x-2 p-2.5 rounded-md text-xs font-medium ${lastSendResult.error ? 'bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line text-black dark:text-white' : 'bg-mist/40 dark:bg-black border border-brand text-black dark:text-white'}`}>
          {lastSendResult.error
            ? <XCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
          }
          <span>
            {lastSendResult.error
              ? lastSendResult.error
              : `Sent ${lastSendResult.sent}, failed ${lastSendResult.failed}. ${lastSendResult.remaining} still pending.`}
          </span>
        </div>
      )}
    </div>
  );
}
