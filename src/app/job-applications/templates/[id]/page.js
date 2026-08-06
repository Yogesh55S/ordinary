'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DEFAULT_TECH_STACK, buildTechStackSectionHtml } from '@/lib/jobApplicationTechStack';
import {
  ArrowLeft,
  Code2,
  FileText,
  Eye,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Monitor,
  Smartphone,
  Star,
  Pencil,
} from 'lucide-react';

const PREVIEW_WIDTHS = { desktop: 600, mobile: 375 };

const DEFAULT_PLAIN_TEXT = `Hi {{HR_NAME}},

I'm Yogesh Kumar, a Full-Stack & Mobile Developer, and I'm reaching out about the {{JOB_TITLE}} role at {{COMPANY_NAME}}.

{{WHY_COMPANY}}

My experience with {{RELEVANT_SKILLS}} lines up closely with what this role needs.

A few things I've shipped:
- Pawgloo (Veterinary Telehealth) — React Native, AWS Lambda, MongoDB, GetStream, Cashfree
- Genesis Classes — Next.js, Supabase, Tailwind CSS, Razorpay
- Rabbit Auto Care — Next.js, Supabase, Vercel, Shiprocket

Portfolio: {{PORTFOLIO_URL}}
Resume: {{RESUME_URL}}
GitHub: {{GITHUB_URL}}
LinkedIn: {{LINKEDIN_URL}}

Thanks for your time — I'd love to talk further.

Yogesh Kumar
Full-Stack & Mobile Developer`;

// Preview-only sample values — mirrors job-application-email/data/sample.ts so the
// live preview shows exactly what a real recipient would see.
const SAMPLE_TOKENS = {
  '{{HR_NAME}}': 'Priya',
  '{{COMPANY_NAME}}': 'Acme Technologies',
  '{{JOB_TITLE}}': 'Senior Full-Stack Engineer',
  '{{WHY_COMPANY}}': "I've been following Acme's work on scalable fintech infrastructure and would love to contribute to that mission.",
  '{{RELEVANT_SKILLS}}': 'React, Next.js, Node.js, REST APIs, Supabase',
  '{{PORTFOLIO_URL}}': 'https://portfolio-pink-nu-30.vercel.app/',
  '{{GITHUB_URL}}': 'https://github.com/Yogesh55S',
  '{{LINKEDIN_URL}}': 'https://www.linkedin.com/in/yogesh-kumar-983840226/',
  '{{RESUME_URL}}': 'https://github.com/Yogesh55S/Yogesh55S/blob/df1ca00c2929ec29e090b3f1de2f170507d59876/Yogesh_Resume%20(2).pdf',
  '{{TECH_STACK_SECTION}}': buildTechStackSectionHtml(DEFAULT_TECH_STACK),
};

const TOKEN_REFERENCE = [
  { token: '{{HR_NAME}}', desc: "Recipient's name" },
  { token: '{{COMPANY_NAME}}', desc: "Recipient's company" },
  { token: '{{JOB_TITLE}}', desc: 'Job profile title being applied for' },
  { token: '{{WHY_COMPANY}}', desc: "Job profile's \"why this company\" text" },
  { token: '{{RELEVANT_SKILLS}}', desc: "Job profile's relevant skills" },
  { token: '{{PORTFOLIO_URL}}', desc: 'JOB_APPLICATION_PORTFOLIO_URL env var' },
  { token: '{{GITHUB_URL}}', desc: 'JOB_APPLICATION_GITHUB_URL env var' },
  { token: '{{LINKEDIN_URL}}', desc: 'JOB_APPLICATION_LINKEDIN_URL env var' },
  { token: '{{RESUME_URL}}', desc: 'JOB_APPLICATION_RESUME_URL env var' },
  { token: '{{TECH_STACK_SECTION}}', desc: 'Skills box — chosen per application on the Compose page (defaults to your full skill set here)' },
];

function substituteTokens(content) {
  let out = content || '';
  for (const [token, value] of Object.entries(SAMPLE_TOKENS)) {
    out = out.split(token).join(value);
  }
  return out;
}

export default function TemplateEditorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadDefaultHtml = useCallback(async () => {
    const res = await fetch('/api/job-email-template/default');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load the shipped default template.');
    return data.html;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('job_email_template')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Template not found — it may have been deleted.');
          return;
        }

        setName(data.name || 'Untitled Template');
        setIsDefault(!!data.is_default);
        setHtmlContent(data.html_content);
        setPlainTextContent(data.plain_text_content || '');
        setUpdatedAt(data.updated_at);
      } catch (err) {
        console.error('Error loading email template:', err);
        setError(err.message || 'Failed to load the email template.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const previewHtml = useMemo(() => substituteTokens(htmlContent), [htmlContent]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const payload = {
        name: name.trim() || 'Untitled Template',
        html_content: htmlContent,
        plain_text_content: plainTextContent,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from('job_email_template').update(payload).eq('id', id);
      if (updateError) throw updateError;

      setUpdatedAt(payload.updated_at);
      setSaveMessage('Saved.');
    } catch (err) {
      console.error('Error saving email template:', err);
      setError(err.message || 'Failed to save the email template.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Replace your current HTML with the shipped default template? This does not save automatically — you can still review before clicking Save.')) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      const defaultHtml = await loadDefaultHtml();
      setHtmlContent(defaultHtml);
      setPlainTextContent(DEFAULT_PLAIN_TEXT);
      setSaveMessage(null);
    } catch (err) {
      setError(err.message || 'Failed to load the shipped default template.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href="/job-applications/templates"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Templates</span>
          </Link>

          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
            Template name
          </label>
          <div className="relative w-full max-w-md">
            <Pencil className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
              className="w-full text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            {isDefault && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span>Default</span>
              </span>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isDefault ? 'Used by the bulk-queue sending loop.' : 'Edit the HTML and plain-text versions, then preview them live before saving.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={resetting || loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all disabled:opacity-50"
          >
            {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            <span>Reset to Shipped Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-sm transition-all"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {saveMessage && (
        <div className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{saveMessage}</span>
          {updatedAt && (
            <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              ({new Date(updatedAt).toLocaleString()})
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading template...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Editor */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'html'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Code2 className="h-4 w-4" />
                <span>HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'text'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Plain Text</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tokens')}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'tokens'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Merge Tokens</span>
              </button>
            </div>

            {activeTab === 'html' && (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                spellCheck={false}
                className="w-full h-[560px] p-4 text-xs font-mono leading-relaxed bg-slate-50 dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                placeholder="<html>...</html>"
              />
            )}

            {activeTab === 'text' && (
              <textarea
                value={plainTextContent}
                onChange={(e) => setPlainTextContent(e.target.value)}
                spellCheck={false}
                className="w-full h-[560px] p-4 text-sm font-mono leading-relaxed bg-slate-50 dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                placeholder="Plain-text fallback for email clients that don't render HTML..."
              />
            )}

            {activeTab === 'tokens' && (
              <div className="h-[560px] overflow-y-auto p-5 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use these tokens anywhere in the HTML or plain text — they get replaced with real
                  values when each email is sent. The live preview on the right shows them filled
                  in with sample data.
                </p>
                <div className="space-y-2">
                  {TOKEN_REFERENCE.map(({ token, desc }) => (
                    <div
                      key={token}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0e1320]"
                    >
                      <code className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 shrink-0">{token}</code>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800/60">
              <div className="flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Preview</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">(sample data — updates as you type)</span>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-[#0a0e17] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-[#111625] text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-[#111625] text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>
            <div className="h-[560px] bg-slate-100 dark:bg-[#0a0e17] overflow-y-auto flex justify-center py-4 px-4">
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                style={{ width: PREVIEW_WIDTHS[previewDevice] }}
                className={`h-full bg-white shrink-0 border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
                  previewDevice === 'mobile' ? 'rounded-2xl shadow-md' : 'rounded-lg shadow-sm'
                }`}
                sandbox=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
