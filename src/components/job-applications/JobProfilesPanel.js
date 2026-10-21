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
    <div className="bg-white dark:bg-black rounded-lg border border-mist dark:border-line shadow-xs p-5 space-y-4 transition-colors">
      <div className="flex items-center justify-between border-b border-mist/60 dark:border-line pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 bg-mist/30 dark:bg-black text-brand border border-mist dark:border-line rounded-md flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-black dark:text-white">Target Job Profiles</h2>
            <p className="text-xs text-black/60 dark:text-mist">Standard roles & pitch templates</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => (formOpen ? resetForm() : setFormOpen(true))}
          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-md bg-white dark:bg-black text-brand border border-mist dark:border-line hover:bg-mist/25 transition-all"
        >
          {formOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          <span>{formOpen ? 'Cancel' : 'Add Profile'}</span>
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-2.5 p-3.5 bg-mist/15 dark:bg-black border border-mist dark:border-line rounded-md">
          {error && (
            <div className="p-2 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-md text-black dark:text-white text-xs font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">
              Job Title <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">Relevant Skills Intro</label>
            <input
              type="text"
              value={form.relevant_skills}
              onChange={(e) => setForm((f) => ({ ...f, relevant_skills: e.target.value }))}
              placeholder="e.g. React, Next.js, Node.js, Supabase"
              className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">
              Why This Company <span className="text-black/60 dark:text-mist/70 font-normal">(use {'{{company_name}}'})</span>
            </label>
            <textarea
              value={form.why_company_template}
              onChange={(e) => setForm((f) => ({ ...f, why_company_template: e.target.value }))}
              rows={2}
              placeholder="I've been following {{company_name}}'s work in..."
              className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-brand hover:opacity-90 disabled:opacity-60 text-white font-semibold rounded-md text-xs shadow-xs transition-all"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{submitting ? 'Saving Profile...' : 'Save Profile'}</span>
          </button>
        </form>
      )}

      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {loading && (
          <p className="text-xs text-brand py-2">Loading profiles...</p>
        )}
        {!loading && profiles.length === 0 && (
          <p className="text-xs text-black/60 dark:text-mist/70 py-2">No job profiles yet — add one to start queuing contacts.</p>
        )}
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-md border border-mist dark:border-line bg-mist/15 dark:bg-black"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-black dark:text-white truncate">{profile.title}</p>
              {profile.relevant_skills && (
                <p className="text-[11px] text-black/70 dark:text-mist truncate">{profile.relevant_skills}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(profile)}
              disabled={deletingId === profile.id}
              className="p-1 rounded-md text-black dark:text-white hover:bg-mist/25 transition-all shrink-0 disabled:opacity-50"
              aria-label={`Delete ${profile.title}`}
            >
              {deletingId === profile.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
