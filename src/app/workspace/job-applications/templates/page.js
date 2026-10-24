'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Star,
  Loader2,
  AlertCircle,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  Mail,
  LayoutGrid,
} from 'lucide-react';

function RenameField({ template, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(template.name || 'Untitled Template');
  const [savingRename, setSavingRename] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!editing) setValue(template.name || 'Untitled Template');
  }, [template.name, editing]);

  const commit = async () => {
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed || trimmed === (template.name || 'Untitled Template')) {
      setValue(template.name || 'Untitled Template');
      return;
    }
    setSavingRename(true);
    await onSave(template, trimmed);
    setSavingRename(false);
  };

  const cancel = () => {
    setValue(template.name || 'Untitled Template');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          className="min-w-0 flex-1 text-sm font-bold text-black dark:text-white bg-white dark:bg-black border border-brand rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
          className="p-1 rounded-lg text-brand hover:bg-mist/25 shrink-0"
          title="Save name"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          className="p-1 rounded-lg text-black dark:text-white hover:bg-mist/25 shrink-0"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/name flex items-center gap-1.5 min-w-0 flex-1 text-left"
      title="Click to rename"
    >
      <h3 className="text-sm font-bold text-black dark:text-white truncate">
        {template.name || 'Untitled Template'}
      </h3>
      {savingRename ? (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-brand" />
      ) : (
        <Pencil className="h-3 w-3 shrink-0 text-brand opacity-0 group-hover/name:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

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
      router.push(`/workspace/job-applications/templates/${inserted.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create a new template.');
      setCreating(false);
    }
  };

  const handleRename = async (template, newName) => {
    setError(null);
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? { ...t, name: newName } : t)));
    try {
      const { error: updateError } = await supabase
        .from('job_email_template')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', template.id);
      if (updateError) throw updateError;
      await fetchTemplates();
    } catch (err) {
      setError(err.message || 'Failed to rename template.');
      await fetchTemplates();
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
    <div className="flex-1 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Email Templates"
        icon={Mail}
        backHref="/job-applications"
        backLabel="Back to Job Applications"
        description="Design multiple email templates and pick one each time you compose an application."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-brand hover:bg-brand-strong disabled:opacity-60 text-white shadow-sm transition-colors"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{creating ? 'Creating...' : 'New Template'}</span>
          </button>
        }
      />

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-xl text-black dark:text-white">
          <AlertCircle className="h-5 w-5 text-brand shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-brand">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-mist/30 dark:bg-black border border-mist dark:border-line text-brand mb-4">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-black dark:text-white">No templates yet</p>
          <p className="text-xs text-black/60 dark:text-mist/70 mt-1 max-w-xs">
            Click "New Template" to start from the shipped default design.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`group bg-white dark:bg-black rounded-2xl border shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all duration-200 ${
                t.is_default
                  ? 'border-brand ring-1 ring-brand'
                  : 'border-mist dark:border-line hover:border-brand'
              }`}
            >
              <div className="h-36 bg-mist/15 dark:bg-black overflow-hidden relative border-b border-mist dark:border-line">
                <iframe
                  title={`${t.name || 'Untitled Template'} preview`}
                  srcDoc={t.html_content}
                  className="origin-top-left pointer-events-none border-0"
                  style={{ width: '600px', height: '620px', transform: 'scale(0.213)' }}
                  sandbox=""
                  tabIndex={-1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {t.is_default && (
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand text-white shadow-sm">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    <span>Default</span>
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <RenameField template={t} onSave={handleRename} />
                </div>
                <p className="text-[11px] text-black/60 dark:text-mist/70 mb-3.5">
                  Updated {new Date(t.updated_at).toLocaleDateString()}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <Link
                    href={`/workspace/job-applications/templates/${t.id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl bg-mist/30 dark:bg-black text-brand border border-mist dark:border-line hover:bg-mist/50 transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit content</span>
                  </Link>
                  <div className="flex items-center gap-0.5">
                    {!t.is_default && (
                      <button
                        onClick={() => handleSetDefault(t)}
                        disabled={busyId === t.id}
                        title="Set as default"
                        className="p-1.5 rounded-lg text-black dark:text-mist hover:text-brand hover:bg-mist/25 transition-all disabled:opacity-50"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(t)}
                      disabled={busyId === t.id}
                      title="Duplicate"
                      className="p-1.5 rounded-lg text-black dark:text-mist hover:bg-mist/25 transition-all disabled:opacity-50"
                    >
                      {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={busyId === t.id}
                      title="Delete"
                      className="p-1.5 rounded-lg text-black dark:text-mist hover:bg-mist/25 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
