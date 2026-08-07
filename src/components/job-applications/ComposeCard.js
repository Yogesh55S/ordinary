'use client';

import { useState, useMemo, useEffect } from 'react';
import { SendHorizonal, Loader2, AlertCircle, CheckCircle2, Eye, Pencil, Monitor, Smartphone } from 'lucide-react';
import SkillsMultiSelect from './SkillsMultiSelect';
import { DEFAULT_TECH_STACK, buildTechStackSectionHtml } from '@/lib/jobApplicationTechStack';

const PREVIEW_WIDTHS = { desktop: 600, mobile: 375 };

// Same real links used in the template editor's preview — public info, not secrets.
const REAL_LINKS = {
  portfolioUrl: 'https://portfolio-pink-nu-30.vercel.app/',
  githubUrl: 'https://github.com/Yogesh55S',
  linkedinUrl: 'https://www.linkedin.com/in/yogesh-kumar-983840226/',
  resumeUrl: 'https://github.com/Yogesh55S/Yogesh55S/blob/df1ca00c2929ec29e090b3f1de2f170507d59876/Yogesh_Resume%20(2).pdf',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderTemplate(template, tokens) {
  let out = template || '';
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value);
  }
  return out;
}

export default function ComposeCard({ profiles, templates, onSend }) {
  const [hrEmail, setHrEmail] = useState('');
  const [hrName, setHrName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobProfileId, setJobProfileId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [whyCompany, setWhyCompany] = useState('');
  const [relevantSkills, setRelevantSkills] = useState('');
  const [templateId, setTemplateId] = useState(() => {
    const def = templates.find((t) => t.is_default) || templates[0];
    return def?.id || '';
  });
  const [checkedSkills, setCheckedSkills] = useState(() => {
    const initial = {};
    DEFAULT_TECH_STACK.forEach((group) => {
      initial[group.category] = new Set(group.items);
    });
    return initial;
  });

  useEffect(() => {
    if (!templateId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) || templates[0];
      setTemplateId(def?.id || '');
    }
  }, [templates, templateId]);

  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // If migration 0003 hasn't run yet, `name`/`is_default` won't exist on any row —
  // detect that so we can tell the user exactly what's wrong instead of showing a
  // template dropdown with blank-looking option text.
  const migrationPending = templates.length > 0 && templates.every((t) => t.is_default === undefined);

  const handleProfileChange = (id) => {
    setJobProfileId(id);
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    setJobTitle(profile.title || '');
    setRelevantSkills(profile.relevant_skills || '');
    setWhyCompany((profile.why_company_template || '').split('{{company_name}}').join(companyName || 'your company'));
  };

  const toggleSkill = (category, item) => {
    setCheckedSkills((prev) => {
      const next = { ...prev };
      const set = new Set(next[category] || []);
      if (set.has(item)) set.delete(item);
      else set.add(item);
      next[category] = set;
      return next;
    });
  };

  const toggleCategory = (category, checkAll) => {
    setCheckedSkills((prev) => {
      const next = { ...prev };
      const group = DEFAULT_TECH_STACK.find((g) => g.category === category);
      next[category] = checkAll ? new Set(group.items) : new Set();
      return next;
    });
  };

  const selectedSkillCategories = useMemo(
    () =>
      DEFAULT_TECH_STACK.map((group) => ({
        category: group.category,
        items: group.items.filter((item) => checkedSkills[group.category]?.has(item)),
      })),
    [checkedSkills]
  );

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const previewHtml = useMemo(() => {
    if (!selectedTemplate) return '';
    return renderTemplate(selectedTemplate.html_content, {
      '{{HR_NAME}}': escapeHtml(hrName || 'there'),
      '{{COMPANY_NAME}}': escapeHtml(companyName || 'your team'),
      '{{JOB_TITLE}}': escapeHtml(jobTitle || 'the open role'),
      '{{WHY_COMPANY}}': escapeHtml(whyCompany || ''),
      '{{RELEVANT_SKILLS}}': escapeHtml(relevantSkills || ''),
      '{{PORTFOLIO_URL}}': REAL_LINKS.portfolioUrl,
      '{{GITHUB_URL}}': REAL_LINKS.githubUrl,
      '{{LINKEDIN_URL}}': REAL_LINKS.linkedinUrl,
      '{{RESUME_URL}}': REAL_LINKS.resumeUrl,
      '{{TECH_STACK_SECTION}}': buildTechStackSectionHtml(selectedSkillCategories),
    });
  }, [selectedTemplate, hrName, companyName, jobTitle, whyCompany, relevantSkills, selectedSkillCategories]);

  const handleReview = () => {
    setResult(null);
    if (!hrEmail || !EMAIL_RE.test(hrEmail)) {
      setReviewError('Enter a valid HR email address first.');
      return;
    }
    if (!templateId) {
      setReviewError('Select a template first.');
      return;
    }
    setReviewError(null);
    setReviewing(true);
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      await onSend({
        hrEmail,
        hrName,
        companyName,
        templateId,
        jobProfileId: jobProfileId || null,
        jobTitle,
        whyCompany,
        relevantSkills,
        selectedSkills: selectedSkillCategories,
      });
      setResult({ success: true });
      setHrEmail('');
      setHrName('');
      setCompanyName('');
      setReviewing(false);
    } catch (err) {
      setResult({ error: err.message || 'Failed to send.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xs p-6 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Compose & Send</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sends immediately — not the batch queue</p>
      </div>

      {migrationPending && (
        <div className="flex items-start space-x-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-800 dark:text-amber-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Template names/default aren't loading correctly — the template-library migration (<code className="font-mono">0003_template_library.sql</code>) hasn't been run in Supabase yet. Run it, then reload this page.</span>
        </div>
      )}

      {result?.success && (
        <div className="flex items-center space-x-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Sent! Check the queue below for the record.</span>
        </div>
      )}
      {result?.error && (
        <div className="flex items-center space-x-2 px-3 py-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {templates.length === 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3">
          No templates yet — create one under "Email Templates" first.
        </p>
      ) : (
        <>
          <fieldset disabled={reviewing} className={reviewing ? 'opacity-60 pointer-events-none space-y-4' : 'space-y-4'}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  HR Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  placeholder="hr@company.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
              <input
                type="text"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                placeholder="HR name"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
              <select
                value={jobProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="">-- Job profile --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name || 'Untitled Template'}{t.is_default ? ' (Default)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skills to show</label>
                <SkillsMultiSelect
                  categories={DEFAULT_TECH_STACK}
                  checkedSkills={checkedSkills}
                  onToggleSkill={toggleSkill}
                  onToggleCategory={toggleCategory}
                />
              </div>
            </div>

            <details className="group">
              <summary className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer select-none list-none flex items-center space-x-1">
                <span className="group-open:hidden">Edit job title / why-company / skills text</span>
                <span className="hidden group-open:inline">Hide content fields</span>
              </summary>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job title"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
                <textarea
                  value={whyCompany}
                  onChange={(e) => setWhyCompany(e.target.value)}
                  rows={2}
                  placeholder="Why this company..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                />
                <input
                  type="text"
                  value={relevantSkills}
                  onChange={(e) => setRelevantSkills(e.target.value)}
                  placeholder="Relevant skills (intro line)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1320] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </details>
          </fieldset>

          {reviewError && (
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          {!reviewing ? (
            <button
              type="button"
              onClick={handleReview}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
            >
              <Eye className="h-4 w-4" />
              <span>Review Application</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1320]">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">This is exactly what {hrEmail || 'the recipient'} will see</span>
                  <div className="flex items-center bg-slate-100 dark:bg-[#0a0e17] rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-white dark:bg-[#111625] text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Monitor className="h-3 w-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-white dark:bg-[#111625] text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>
                <div className="h-[520px] bg-slate-100 dark:bg-[#0a0e17] overflow-y-auto flex justify-center py-4">
                  <iframe
                    title="Application preview"
                    srcDoc={previewHtml}
                    style={{ width: PREVIEW_WIDTHS[previewDevice] }}
                    className="h-full bg-white shrink-0 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
                    sandbox=""
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewing(false)}
                  disabled={sending}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white dark:bg-[#0e1320] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl text-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  <span>{sending ? 'Sending...' : 'Looks good — Send Application'}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
