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
  Sun,
  Moon,
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
  const [previewTheme, setPreviewTheme] = useState('light');
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

  const previewHtml = useMemo(() => {
    let html = substituteTokens(htmlContent);
    if (previewTheme === 'dark') {
      const darkMeta = `<meta name="color-scheme" content="light dark">\n<style>\n  :root { color-scheme: dark; }\n  body { background-color: #121212 !important; color: #e5e7eb !important; }\n</style>\n`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${darkMeta}</head>`);
      } else {
        html = `${darkMeta}${html}`;
      }
    }
    return html;
  }, [htmlContent, previewTheme]);

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
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-black/70 dark:text-[#CBDDE9] hover:text-[#2A72A1] mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Templates</span>
          </Link>

          <label className="block text-[11px] font-bold uppercase tracking-wide text-black/70 dark:text-[#CBDDE9] mb-1.5">
            Template name
          </label>
          <div className="relative w-full max-w-md">
            <Pencil className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2A72A1] pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
              className="w-full text-lg font-bold tracking-tight text-black dark:text-white bg-white dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2A72A1]/30 focus:border-[#2A72A1] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            {isDefault && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#2A72A1] text-white">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span>Default</span>
              </span>
            )}
            <p className="text-xs text-black/70 dark:text-[#CBDDE9]">
              {isDefault ? 'Used by the bulk-queue sending loop.' : 'Edit the HTML and plain-text versions, then preview them live before saving.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={resetting || loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-black text-black dark:text-white border border-[#CBDDE9] dark:border-[#2A72A1]/40 hover:bg-[#CBDDE9]/25 transition-all disabled:opacity-50"
          >
            {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            <span>Reset to Shipped Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#2A72A1] hover:opacity-90 disabled:opacity-60 text-white shadow-sm transition-all"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-[#CBDDE9]/30 dark:bg-black border border-black dark:border-white rounded-xl text-black dark:text-white">
          <AlertCircle className="h-5 w-5 text-[#2A72A1] shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {saveMessage && (
        <div className="flex items-center space-x-3 p-4 bg-[#CBDDE9]/40 dark:bg-black border border-[#2A72A1] rounded-xl text-black dark:text-white">
          <CheckCircle2 className="h-5 w-5 text-[#2A72A1] shrink-0" />
          <span className="text-sm font-medium">{saveMessage}</span>
          {updatedAt && (
            <span className="text-xs text-black/60 dark:text-[#CBDDE9]/70">
              ({new Date(updatedAt).toLocaleString()})
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#2A72A1]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading template...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Editor */}
          <div className="bg-white dark:bg-black rounded-2xl border border-[#CBDDE9] dark:border-[#2A72A1]/40 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-[#CBDDE9] dark:border-[#2A72A1]/30">
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'html'
                    ? 'border-[#2A72A1] text-[#2A72A1]'
                    : 'border-transparent text-black dark:text-[#CBDDE9] hover:text-[#2A72A1]'
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
                    ? 'border-[#2A72A1] text-[#2A72A1]'
                    : 'border-transparent text-black dark:text-[#CBDDE9] hover:text-[#2A72A1]'
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
                    ? 'border-[#2A72A1] text-[#2A72A1]'
                    : 'border-transparent text-black dark:text-[#CBDDE9] hover:text-[#2A72A1]'
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
                className="w-full h-[560px] p-4 text-xs font-mono leading-relaxed bg-[#CBDDE9]/15 dark:bg-black text-black dark:text-white focus:outline-none resize-none"
                placeholder="<html>...</html>"
              />
            )}

            {activeTab === 'text' && (
              <textarea
                value={plainTextContent}
                onChange={(e) => setPlainTextContent(e.target.value)}
                spellCheck={false}
                className="w-full h-[560px] p-4 text-sm font-mono leading-relaxed bg-[#CBDDE9]/15 dark:bg-black text-black dark:text-white focus:outline-none resize-none"
                placeholder="Plain-text fallback for email clients that don't render HTML..."
              />
            )}

            {activeTab === 'tokens' && (
              <div className="h-[560px] overflow-y-auto p-5 space-y-3">
                <p className="text-xs text-black/70 dark:text-[#CBDDE9]">
                  Use these tokens anywhere in the HTML or plain text — they get replaced with real
                  values when each email is sent.
                </p>
                <div className="space-y-2">
                  {TOKEN_REFERENCE.map(({ token, desc }) => (
                    <div
                      key={token}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#CBDDE9] dark:border-[#2A72A1]/30 bg-[#CBDDE9]/15 dark:bg-black"
                    >
                      <code className="text-xs font-mono font-bold text-[#2A72A1] shrink-0">{token}</code>
                      <span className="text-[11px] text-black/70 dark:text-[#CBDDE9] text-right">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="bg-white dark:bg-black rounded-2xl border border-[#CBDDE9] dark:border-[#2A72A1]/40 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-[#CBDDE9] dark:border-[#2A72A1]/30 bg-[#CBDDE9]/25 dark:bg-black">
              <div className="flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-[#2A72A1]" />
                <span className="text-xs font-bold text-black dark:text-white">Live Preview</span>
                <span className="text-[11px] text-black/60 dark:text-[#CBDDE9]/70 hidden sm:inline">(sample data — updates as you type)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/30 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      previewTheme === 'light'
                        ? 'bg-[#2A72A1] text-white shadow-sm'
                        : 'text-black dark:text-[#CBDDE9]'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      previewTheme === 'dark'
                        ? 'bg-[#2A72A1] text-white shadow-sm'
                        : 'text-black dark:text-[#CBDDE9]'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Dark</span>
                  </button>
                </div>

                <div className="flex items-center bg-white dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/30 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-[#2A72A1] text-white shadow-sm'
                        : 'text-black dark:text-[#CBDDE9]'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-[#2A72A1] text-white shadow-sm'
                        : 'text-black dark:text-[#CBDDE9]'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>
              </div>
            </div>
            <div className={`h-[560px] ${previewTheme === 'dark' ? 'bg-black' : 'bg-[#CBDDE9]/20'} overflow-y-auto flex justify-center py-4 px-4 transition-colors`}>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                style={{ width: PREVIEW_WIDTHS[previewDevice] }}
                className={`h-full shrink-0 border border-[#CBDDE9] dark:border-[#2A72A1]/40 transition-all duration-200 ${
                  previewTheme === 'dark' ? 'bg-black' : 'bg-white'
                } ${
                  previewDevice === 'mobile' ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-sm'
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
