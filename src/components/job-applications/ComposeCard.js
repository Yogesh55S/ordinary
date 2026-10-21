'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  SendHorizonal,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Pencil,
  Monitor,
  Smartphone,
  Timer,
  Zap,
  Clock,
  Building2,
  Users
} from 'lucide-react';
import SkillsMultiSelect from './SkillsMultiSelect';
import { DEFAULT_TECH_STACK, buildTechStackSectionHtml } from '@/lib/jobApplicationTechStack';

const PREVIEW_WIDTHS = { desktop: 600, mobile: 375 };

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

function parseBulkLines(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const valid = [];
  for (const line of lines) {
    const [emailRaw, nameRaw, companyRaw] = line.split(',').map((p) => (p || '').trim());
    if (emailRaw && EMAIL_RE.test(emailRaw)) {
      valid.push({
        hr_email: emailRaw,
        hr_name: nameRaw || null,
        company_name: companyRaw || null,
      });
    }
  }
  return valid;
}

export default function ComposeCard({ profiles, templates, settings, onSend }) {
  // Dispatch Mode: 'immediate' (Send right now) vs 'rate_limited' (Send with time gap)
  const [deliveryMode, setDeliveryMode] = useState('immediate');
  const [recipientType, setRecipientType] = useState('single'); // 'single' vs 'bulk'

  // Single recipient fields
  const [hrEmail, setHrEmail] = useState('');
  const [hrName, setHrName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Bulk recipient fields
  const [bulkText, setBulkText] = useState('');

  // Rate Limiting parameters
  const [batchSize, setBatchSize] = useState(settings?.batch_size || 1);
  const [intervalValue, setIntervalValue] = useState(settings?.interval_value || 15);
  const [intervalUnit, setIntervalUnit] = useState(settings?.interval_unit || 'minutes');
  const [sendFirstImmediately, setSendFirstImmediately] = useState(true);

  useEffect(() => {
    if (settings) {
      if (settings.batch_size) setBatchSize(settings.batch_size);
      if (settings.interval_value) setIntervalValue(settings.interval_value);
      if (settings.interval_unit) setIntervalUnit(settings.interval_unit);
    }
  }, [settings]);

  // Profile & Content fields
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

  // Derive preview recipient
  const previewRecipient = useMemo(() => {
    if (deliveryMode === 'rate_limited' && recipientType === 'bulk') {
      const parsed = parseBulkLines(bulkText);
      return parsed[0] || { hr_email: 'recipient@company.com', hr_name: 'there', company_name: 'your team' };
    }
    return {
      hr_email: hrEmail || 'recipient@company.com',
      hr_name: hrName || 'there',
      company_name: companyName || 'your team',
    };
  }, [deliveryMode, recipientType, bulkText, hrEmail, hrName, companyName]);

  const previewHtml = useMemo(() => {
    if (!selectedTemplate) return '';
    return renderTemplate(selectedTemplate.html_content, {
      '{{HR_NAME}}': escapeHtml(previewRecipient.hr_name || 'there'),
      '{{COMPANY_NAME}}': escapeHtml(previewRecipient.company_name || 'your team'),
      '{{JOB_TITLE}}': escapeHtml(jobTitle || 'the open role'),
      '{{WHY_COMPANY}}': escapeHtml(whyCompany || ''),
      '{{RELEVANT_SKILLS}}': escapeHtml(relevantSkills || ''),
      '{{PORTFOLIO_URL}}': REAL_LINKS.portfolioUrl,
      '{{GITHUB_URL}}': REAL_LINKS.githubUrl,
      '{{LINKEDIN_URL}}': REAL_LINKS.linkedinUrl,
      '{{RESUME_URL}}': REAL_LINKS.resumeUrl,
      '{{TECH_STACK_SECTION}}': buildTechStackSectionHtml(selectedSkillCategories),
    });
  }, [selectedTemplate, previewRecipient, jobTitle, whyCompany, relevantSkills, selectedSkillCategories]);

  const handleReview = () => {
    setResult(null);
    if (deliveryMode === 'immediate') {
      if (!hrEmail || !EMAIL_RE.test(hrEmail)) {
        setReviewError('Enter a valid HR email address.');
        return;
      }
    } else {
      if (recipientType === 'single') {
        if (!hrEmail || !EMAIL_RE.test(hrEmail)) {
          setReviewError('Enter a valid HR email address to queue.');
          return;
        }
      } else {
        const parsed = parseBulkLines(bulkText);
        if (parsed.length === 0) {
          setReviewError('Enter at least one valid HR email in the list.');
          return;
        }
      }
    }

    if (!templateId) {
      setReviewError('Please select an email template.');
      return;
    }

    setReviewError(null);
    setReviewing(true);
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const parsedBulk = deliveryMode === 'rate_limited' && recipientType === 'bulk'
        ? parseBulkLines(bulkText)
        : [];

      const res = await onSend({
        deliveryMode,
        recipientType,
        hrEmail: hrEmail.trim(),
        hrName: hrName.trim(),
        companyName: companyName.trim(),
        bulkContacts: parsedBulk,
        rateLimit: {
          batch_size: batchSize,
          interval_value: intervalValue,
          interval_unit: intervalUnit,
          is_active: true,
          sendFirstImmediately,
        },
        templateId,
        jobProfileId: jobProfileId || null,
        jobTitle,
        whyCompany,
        relevantSkills,
        selectedSkills: selectedSkillCategories,
      });

      setResult({
        success: true,
        message: res?.message || (deliveryMode === 'immediate'
          ? 'Application email dispatched immediately!'
          : `Queued with a ${intervalValue} ${intervalUnit} time gap!`),
      });

      if (deliveryMode === 'immediate') {
        setHrEmail('');
        setHrName('');
        setCompanyName('');
      } else if (recipientType === 'bulk') {
        setBulkText('');
      } else {
        setHrEmail('');
        setHrName('');
        setCompanyName('');
      }
      setReviewing(false);
    } catch (err) {
      setResult({ error: err.message || 'Failed to dispatch.' });
    } finally {
      setSending(false);
    }
  };

  const parsedBulkCount = useMemo(() => {
    if (recipientType !== 'bulk' || !bulkText) return 0;
    return parseBulkLines(bulkText).length;
  }, [recipientType, bulkText]);

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-mist dark:border-line shadow-xs p-5 space-y-4 transition-colors">
      {/* Header & Flow Mode Selector */}
      <div className="border-b border-mist/60 dark:border-line pb-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-black dark:text-white">Compose Application</h2>
            <p className="text-xs text-black/60 dark:text-mist">Configure target company and choose delivery throttle</p>
          </div>

          {/* Delivery Mode Tabs */}
          <div className="flex items-center bg-mist/25 dark:bg-black border border-mist dark:border-line rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setDeliveryMode('immediate')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                deliveryMode === 'immediate'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-black dark:text-mist hover:bg-mist/25'
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Send Immediately</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode('rate_limited')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                deliveryMode === 'rate_limited'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-black dark:text-mist hover:bg-mist/25'
              }`}
            >
              <Timer className="h-3 w-3" />
              <span>With Time Gap (Rate Limited)</span>
            </button>
          </div>
        </div>

        {/* Real-time Mode Description Badge */}
        <div className={`p-2.5 rounded-md border text-xs flex items-center justify-between flex-wrap gap-2 ${
          deliveryMode === 'immediate'
            ? 'bg-mist/20 dark:bg-black border-mist dark:border-line text-black dark:text-white'
            : 'bg-mist/35 dark:bg-black border-brand text-black dark:text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {deliveryMode === 'immediate' ? (
              <Zap className="h-3.5 w-3.5 text-brand" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-brand" />
            )}
            <span>
              {deliveryMode === 'immediate'
                ? 'Direct Delivery: Dispatches email to HR right now without waiting.'
                : `Throttled Outreach: Queues applications to send every ${intervalValue} ${intervalUnit} to safeguard spam score.`}
            </span>
          </div>

          {deliveryMode === 'rate_limited' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand text-white shrink-0">
              Auto-Throttle Protected
            </span>
          )}
        </div>
      </div>

      {result?.success && (
        <div className="flex items-center space-x-2 p-2.5 bg-mist/40 dark:bg-black border border-brand rounded-md text-black dark:text-white text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
          <span>{result.message}</span>
        </div>
      )}
      {result?.error && (
        <div className="flex items-center space-x-2 p-2.5 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-md text-black dark:text-white text-xs font-medium">
          <AlertCircle className="h-4 w-4 text-brand shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {templates.length === 0 ? (
        <p className="text-xs text-black dark:text-white bg-mist/25 dark:bg-black border border-mist dark:border-line rounded-md p-3">
          No email templates found — please create or export a template first.
        </p>
      ) : (
        <>
          <fieldset disabled={reviewing} className={reviewing ? 'opacity-60 pointer-events-none space-y-3' : 'space-y-3'}>
            
            {/* If Rate Limited: Allow Single vs Bulk contacts */}
            {deliveryMode === 'rate_limited' && (
              <div className="flex items-center space-x-3 text-xs pb-1">
                <span className="font-semibold text-black dark:text-white">Target Scope:</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientType"
                    checked={recipientType === 'single'}
                    onChange={() => setRecipientType('single')}
                    className="accent-brand"
                  />
                  <Building2 className="h-3 w-3 text-brand" />
                  <span className="text-black dark:text-white">Single Company</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientType"
                    checked={recipientType === 'bulk'}
                    onChange={() => setRecipientType('bulk')}
                    className="accent-brand"
                  />
                  <Users className="h-3 w-3 text-brand" />
                  <span className="text-black dark:text-white">Multiple Companies (Bulk List)</span>
                </label>
              </div>
            )}

            {/* Recipient Details (Single) */}
            {(deliveryMode === 'immediate' || recipientType === 'single') ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                    HR Email <span className="text-brand">*</span>
                  </label>
                  <input
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand"
                  />
                </div>
                <input
                  type="text"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  placeholder="HR Contact Name"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand"
                />
                <select
                  value={jobProfileId}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                >
                  <option value="" className="bg-white dark:bg-black text-black dark:text-white">-- Select Profile --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-black text-black dark:text-white">{p.title}</option>
                  ))}
                </select>
              </div>
            ) : (
              /* Recipient Details (Bulk Multiline) */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-black dark:text-white">
                    HR Emails (1 per line) <span className="text-brand">*</span>
                  </label>
                  {parsedBulkCount > 0 && (
                    <span className="text-[11px] font-bold text-brand">
                      {parsedBulkCount} valid contact{parsedBulkCount > 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={jobProfileId}
                    onChange={(e) => handleProfileChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                  >
                    <option value="" className="bg-white dark:bg-black text-black dark:text-white">-- Attach Job Profile to Batch --</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-black text-black dark:text-white">{p.title}</option>
                    ))}
                  </select>
                  <div className="px-2.5 py-1 rounded-md bg-mist/15 dark:bg-black border border-mist dark:border-line text-[11px] font-mono text-black/70 dark:text-mist flex items-center">
                    <span>Format: email, name, company</span>
                  </div>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={4}
                  placeholder={'hr@acme.com, Priya Sharma, Acme Inc\nrecruiter@meta.com, John, Meta\njobs@stripe.com'}
                  className="w-full px-3 py-2 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-brand transition-colors resize-none font-mono"
                />
              </div>
            )}

            {/* Embedded Time Gap & Rate Limiting Controls when in Rate Limited Mode */}
            {deliveryMode === 'rate_limited' && (
              <div className="p-3.5 bg-mist/15 dark:bg-black border border-mist dark:border-line rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white flex items-center space-x-1.5">
                    <Timer className="h-3.5 w-3.5 text-brand" />
                    <span>Time Gap Throttle Settings</span>
                  </span>
                  <span className="text-[10px] text-black/60 dark:text-mist">Controls dispatch delay</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-black dark:text-white">
                  <span>Send</span>
                  <input
                    type="number"
                    min={1}
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 1)}
                    className="w-14 px-2 py-1 text-xs text-center rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                  />
                  <span>email(s) every</span>
                  <input
                    type="number"
                    min={1}
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(parseInt(e.target.value, 10) || 1)}
                    className="w-14 px-2 py-1 text-xs text-center rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                  />
                  <select
                    value={intervalUnit}
                    onChange={(e) => setIntervalUnit(e.target.value)}
                    className="px-2 py-1 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                  >
                    <option value="minutes" className="bg-white dark:bg-black text-black dark:text-white">Minutes</option>
                    <option value="hours" className="bg-white dark:bg-black text-black dark:text-white">Hours</option>
                  </select>
                </div>

                <label className="flex items-center space-x-2 text-xs text-black dark:text-white cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sendFirstImmediately}
                    onChange={(e) => setSendFirstImmediately(e.target.checked)}
                    className="accent-brand h-3.5 w-3.5 rounded"
                  />
                  <span className="font-semibold">Send 1st application immediately</span>
                  <span className="text-black/60 dark:text-mist text-[11px]">(space out remainder by {intervalValue} {intervalUnit})</span>
                </label>
              </div>
            )}

            {/* Template & Skills Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1">Email Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} className="bg-white dark:bg-black text-black dark:text-white">
                      {t.name || 'Untitled Template'}{t.is_default ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1">Tech Stack Skills</label>
                <SkillsMultiSelect
                  categories={DEFAULT_TECH_STACK}
                  checkedSkills={checkedSkills}
                  onToggleSkill={toggleSkill}
                  onToggleCategory={toggleCategory}
                />
              </div>
            </div>

            {/* Pitch Text Customization */}
            <details className="group pt-1">
              <summary className="text-xs font-semibold text-brand dark:text-mist cursor-pointer select-none list-none flex items-center space-x-1">
                <span className="group-open:hidden">+ Customize intro & pitch text</span>
                <span className="hidden group-open:inline">- Collapse pitch text</span>
              </summary>
              <div className="mt-2.5 space-y-2">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job Title"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                />
                <textarea
                  value={whyCompany}
                  onChange={(e) => setWhyCompany(e.target.value)}
                  rows={2}
                  placeholder="Why this company..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand resize-none"
                />
                <input
                  type="text"
                  value={relevantSkills}
                  onChange={(e) => setRelevantSkills(e.target.value)}
                  placeholder="Relevant Skills intro phrase"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-brand"
                />
              </div>
            </details>
          </fieldset>

          {reviewError && (
            <div className="flex items-center space-x-2 p-2 bg-brand/5 dark:bg-brand/10 border border-brand/30 dark:border-line rounded-md text-black dark:text-white text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-brand shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          {!reviewing ? (
            <button
              type="button"
              onClick={handleReview}
              className="w-full inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand hover:opacity-90 text-white font-semibold rounded-md text-xs shadow-xs transition-all"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>
                {deliveryMode === 'immediate'
                  ? 'Review Application Email'
                  : `Review & Queue with ${intervalValue}m Gap`}
              </span>
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="border border-mist dark:border-line rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-mist dark:border-line bg-mist/25 dark:bg-black">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-black dark:text-white">
                      Preview for {previewRecipient.hr_email}
                    </span>
                    {deliveryMode === 'rate_limited' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand text-white font-bold">
                        {recipientType === 'bulk' ? `1 of ${parsedBulkCount} queued` : 'Queued with delay'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center bg-white dark:bg-black border border-mist dark:border-line rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-black dark:text-mist'
                      }`}
                    >
                      <Monitor className="h-3 w-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-black dark:text-mist'
                      }`}
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>
                <div className="h-[460px] bg-mist/20 dark:bg-black overflow-y-auto flex justify-center py-3 px-2">
                  <iframe
                    title="Application preview"
                    srcDoc={previewHtml}
                    style={{ width: PREVIEW_WIDTHS[previewDevice], maxWidth: '100%' }}
                    className="h-full bg-white shrink-0 border border-mist dark:border-line rounded-md shadow-xs transition-all"
                    sandbox=""
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewing(false)}
                  disabled={sending}
                  className="inline-flex items-center justify-center space-x-1 px-3.5 py-2 bg-white dark:bg-black text-black dark:text-white border border-mist dark:border-line font-semibold rounded-md text-xs hover:bg-mist/25 transition-all disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5 text-brand" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand hover:opacity-90 disabled:opacity-60 text-white font-semibold rounded-md text-xs shadow-xs transition-all"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : deliveryMode === 'immediate' ? (
                    <SendHorizonal className="h-3.5 w-3.5" />
                  ) : (
                    <Timer className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {sending
                      ? 'Dispatching...'
                      : deliveryMode === 'immediate'
                      ? 'Send Application Immediately'
                      : sendFirstImmediately
                      ? `Send 1st Now & Queue with ${intervalValue}m Delay`
                      : `Queue with ${intervalValue}m Time Gap`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
