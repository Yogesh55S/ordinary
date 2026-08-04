'use client';

import { useState } from 'react';
import { Briefcase, Plus, Trash2, Loader2, X } from 'lucide-react';

const EMPTY_PROFILE = {
  title: '',
  relevant_skills: '',
  why_company_template: '',
};

export default function JobProfilesPanel({ profiles, loading, onAddProfile, onDeleteProfile }) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_PROFILE });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const resetForm = () => {
    setForm({ ...EMPTY_PROFILE });
    setError(null);
    setFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Job title is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onAddProfile({
        title: form.title.trim(),
        relevant_skills: form.relevant_skills.trim(),
        why_company_template: form.why_company_template.trim(),
      });
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save job profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (profile) => {
    if (!confirm(`Delete job profile "${profile.title}"? HR contacts already queued under it will keep their queued data but lose the profile link.`)) return;
    setDeletingId(profile.id);
    try {
      await onDeleteProfile(profile.id);
    } catch (err) {
      alert('Failed to delete job profile: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Job Profiles</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Roles you're applying for</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => (formOpen ? resetForm() : setFormOpen(true))}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 transition-all"
        >
          {formOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{formOpen ? 'Cancel' : 'New Profile'}</span>
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-50 dark:bg-[#0e1320] border border-slate-200 dark:border-slate-800 rounded-xl">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Relevant Skills</label>
            <input
              type="text"
              value={form.relevant_skills}
              onChange={(e) => setForm((f) => ({ ...f, relevant_skills: e.target.value }))}
              placeholder="e.g. React, Next.js, Node.js, Supabase"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Why This Company <span className="text-slate-400 font-normal">(use {'{{company_name}}'} as a placeholder)</span>
            </label>
            <textarea
              value={form.why_company_template}
              onChange={(e) => setForm((f) => ({ ...f, why_company_template: e.target.value }))}
              rows={3}
              placeholder="I've been following {{company_name}}'s work in..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{submitting ? 'Saving...' : 'Save Job Profile'}</span>
          </button>
        </form>
      )}

      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {loading && (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-2">Loading profiles...</p>
        )}
        {!loading && profiles.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No job profiles yet — add one to start queuing HR contacts.</p>
        )}
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0e1320]"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{profile.title}</p>
              {profile.relevant_skills && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.relevant_skills}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(profile)}
              disabled={deletingId === profile.id}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shrink-0 disabled:opacity-50"
              aria-label={`Delete ${profile.title}`}
            >
              {deletingId === profile.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
