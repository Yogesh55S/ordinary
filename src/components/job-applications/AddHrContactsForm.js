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
    <div className="bg-white dark:bg-black rounded-lg border border-mist dark:border-line shadow-xs p-5 space-y-4 transition-colors">
      <div className="flex items-center space-x-2.5 border-b border-mist/60 dark:border-line pb-3">
        <div className="h-8 w-8 bg-mist/30 dark:bg-black text-brand border border-mist dark:border-line rounded-md flex items-center justify-center shrink-0">
          <UserPlus className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-black dark:text-white">Batch Add HR Contacts</h2>
          <p className="text-xs text-black/60 dark:text-mist">Imports contacts into the Pending queue for the sending loop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-start space-x-2 p-2 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-md text-black dark:text-white text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-black dark:text-white mb-1">
            Target Job Profile <span className="text-brand">*</span>
          </label>
          <select
            value={jobProfileId}
            onChange={(e) => setJobProfileId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand transition-colors"
          >
            <option value="" className="bg-white dark:bg-black text-black dark:text-white">-- Select target profile --</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-black text-black dark:text-white">{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-black dark:text-white">
              HR Email List <span className="text-brand">*</span>
            </label>
            <span className="text-[11px] text-black/60 dark:text-mist/70">1 contact per line</span>
          </div>
          <div className="mb-1.5 px-2.5 py-1.5 rounded-md bg-mist/15 dark:bg-black border border-mist dark:border-line text-[11px] font-mono text-black/70 dark:text-mist">
            <span className="text-black dark:text-white font-semibold">Format: </span>
            <span>email, name (opt), company (opt)</span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder={'hr@acme.com, Priya Sharma, Acme Inc\nrecruiter@tech.co'}
            className="w-full px-3 py-2 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand transition-colors resize-none font-mono"
          />
        </div>

        {skippedLines.length > 0 && (
          <div className="p-2 bg-mist/25 dark:bg-black border border-brand rounded-md text-black dark:text-white text-xs">
            <p className="font-bold mb-1">Skipped {skippedLines.length} invalid line{skippedLines.length > 1 ? 's' : ''}:</p>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
              {skippedLines.map((l, i) => <li key={i} className="truncate">{l}</li>)}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-brand hover:opacity-90 disabled:opacity-60 text-white font-semibold rounded-md text-xs shadow-xs transition-all"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          <span>{submitting ? 'Adding to Queue...' : 'Queue Contacts'}</span>
        </button>
      </form>
    </div>
  );
}
