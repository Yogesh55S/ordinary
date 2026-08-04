'use client';

import { useState } from 'react';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseContactLines(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const valid = [];
  const invalid = [];

  for (const line of lines) {
    const [emailRaw, nameRaw, companyRaw] = line.split(',').map((p) => (p || '').trim());
    if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
      invalid.push(line);
      continue;
    }
    valid.push({
      hr_email: emailRaw,
      hr_name: nameRaw || null,
      company_name: companyRaw || null,
    });
  }

  return { valid, invalid };
}

export default function AddHrContactsForm({ profiles, onAddContacts }) {
  const [jobProfileId, setJobProfileId] = useState('');
  const [rawText, setRawText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [skippedLines, setSkippedLines] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSkippedLines([]);

    if (!jobProfileId) {
      setError('Select a job profile first — add one in the Job Profiles panel if the list is empty.');
      return;
    }

    const { valid, invalid } = parseContactLines(rawText);
    if (valid.length === 0) {
      setError('Enter at least one valid HR email address.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddContacts({ jobProfileId, contacts: valid });
      setRawText('');
      setSkippedLines(invalid);
    } catch (err) {
      setError(err.message || 'Failed to queue HR contacts.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs p-6 space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
          <UserPlus className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add HR Contacts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Queue emails for the sending loop to pick up</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-start space-x-2 p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Profile <span className="text-rose-500">*</span>
          </label>
          <select
            value={jobProfileId}
            onChange={(e) => setJobProfileId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="">-- Select a job profile --</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            HR Emails <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder={'One per line: email, HR name (optional), company (optional)\nhr@company.com, Priya Sharma, Acme Inc\njobs@studio.io'}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none font-mono"
          />
          <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">Each line becomes one queued email. Name and company are optional and personalize the template.</p>
        </div>

        {skippedLines.length > 0 && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-800 dark:text-amber-400 text-xs">
            <p className="font-semibold mb-1">Skipped {skippedLines.length} line{skippedLines.length > 1 ? 's' : ''} (invalid email):</p>
            <ul className="list-disc list-inside space-y-0.5 font-mono">
              {skippedLines.map((l, i) => <li key={i} className="truncate">{l}</li>)}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          <span>{submitting ? 'Queuing...' : 'Add to Queue'}</span>
        </button>
      </form>
    </div>
  );
}
