'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Plus,
  Star,
  Loader2,
  AlertCircle,
  Copy,
  Trash2,
  Pencil,
} from 'lucide-react';

export default function TemplateLibraryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('job_email_template')
        .select('*')
        .order('updated_at', { ascending: false });

      // PGRST205 = table/column not found — migration 0003 (name/is_default columns) not run yet.
      if (fetchError && fetchError.code !== 'PGRST205' && fetchError.code !== '42703') throw fetchError;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const loadDefaultHtml = async () => {
    const res = await fetch('/api/job-email-template/default');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load the shipped default template.');
    return data.html;
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const html = await loadDefaultHtml();
      const isFirst = templates.length === 0;
      const { data: inserted, error: insertError } = await supabase
        .from('job_email_template')
        .insert({
          name: 'Untitled Template',
          html_content: html,
          plain_text_content: '',
          is_default: isFirst,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      router.push(`/job-applications/templates/${inserted.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create a new template.');
      setCreating(false);
    }
  };

  const handleSetDefault = async (template) => {
    setBusyId(template.id);
    setError(null);
    try {
      await supabase.from('job_email_template').update({ is_default: false }).neq('id', template.id);
      const { error: updateError } = await supabase
        .from('job_email_template')
        .update({ is_default: true })
        .eq('id', template.id);
      if (updateError) throw updateError;
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to set default template.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (template) => {
    setBusyId(template.id);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('job_email_template').insert({
        name: `${template.name || 'Untitled Template'} (Copy)`,
        html_content: template.html_content,
        plain_text_content: template.plain_text_content,
        is_default: false,
      });
      if (insertError) throw insertError;
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to duplicate template.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`Delete template "${template.name || 'Untitled Template'}"? This cannot be undone.`)) return;
    setBusyId(template.id);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('job_email_template').delete().eq('id', template.id);
      if (deleteError) throw deleteError;
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to delete template.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link
            href="/job-applications"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Job Applications</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Email Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Design multiple email templates and pick one each time you compose an application.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-sm transition-all"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{creating ? 'Creating...' : 'New Template'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!loading && templates.length > 0 && templates.every((t) => t.is_default === undefined) && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-sm font-medium">
            Template names and defaults aren't showing correctly below — the template-library migration
            (<code className="font-mono">0003_template_library.sql</code>) hasn't been run in Supabase yet. Run it, then reload this page.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-24 text-slate-400 dark:text-slate-500 text-sm">
          No templates yet — click "New Template" to start from the shipped default design.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-slate-100 dark:bg-[#0a0e17] overflow-hidden relative">
                <iframe
                  title={`${t.name || 'Untitled Template'} preview`}
                  srcDoc={t.html_content}
                  className="origin-top-left pointer-events-none border-0"
                  style={{ width: '600px', height: '620px', transform: 'scale(0.213)' }}
                  sandbox=""
                  tabIndex={-1}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{t.name || 'Untitled Template'}</h3>
                  {t.is_default && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shrink-0">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>Default</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                  Updated {new Date(t.updated_at).toLocaleDateString()}
                </p>
                <div className="mt-auto flex items-center flex-wrap gap-1.5">
                  <Link
                    href={`/job-applications/templates/${t.id}`}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </Link>
                  {!t.is_default && (
                    <button
                      onClick={() => handleSetDefault(t)}
                      disabled={busyId === t.id}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      <Star className="h-3 w-3" />
                      <span>Set Default</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(t)}
                    disabled={busyId === t.id}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {busyId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={busyId === t.id}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
