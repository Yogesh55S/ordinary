'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  AlertCircle,
  Palette,
  SendHorizonal,
  ListPlus,
  Briefcase,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Timer
} from 'lucide-react';

import PageHeader from '@/components/PageHeader';
import JobProfilesPanel from '@/components/job-applications/JobProfilesPanel';
import AddHrContactsForm from '@/components/job-applications/AddHrContactsForm';
import ComposeCard from '@/components/job-applications/ComposeCard';
import QueueTable from '@/components/job-applications/QueueTable';

const DEFAULT_SETTINGS = { batch_size: 1, interval_value: 15, interval_unit: 'minutes', is_active: true };

export default function JobApplicationsPage() {
  const [profiles, setProfiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingNow, setSendingNow] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [nextDueSeconds, setNextDueSeconds] = useState(null);

  const fetchSettings = useCallback(async () => {
    let { data, error: fetchError } = await supabase
      .from('job_application_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('job_application_settings')
        .insert(DEFAULT_SETTINGS)
        .select()
        .single();
      if (insertError) throw insertError;
      data = inserted;
    }

    setSettings(data);
    return data;
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profilesRes, contactsRes, templatesRes] = await Promise.all([
        supabase.from('job_profiles').select('*').order('created_at', { ascending: false }),
        supabase
          .from('job_hr_contacts')
          .select('*, job_profiles(id, title)')
          .order('created_at', { ascending: false }),
        supabase.from('job_email_template').select('*').order('updated_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (templatesRes.error && templatesRes.error.code !== 'PGRST205' && templatesRes.error.code !== '42703') {
        throw templatesRes.error;
      }

      setProfiles(profilesRes.data || []);
      setContacts(contactsRes.data || []);
      setTemplates(templatesRes.data || []);
      await fetchSettings();
    } catch (err) {
      console.error('Error loading job applications data:', err);
      setError(err.message || 'Failed to load job applications data.');
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddProfile = async (payload) => {
    const { error: insertError } = await supabase.from('job_profiles').insert(payload);
    if (insertError) throw insertError;

    await supabase.from('activity_logs').insert({
      action_type: 'Job Profile Created',
      details: `Added job profile "${payload.title}".`,
    });

    await fetchAll();
  };

  const handleDeleteProfile = async (id) => {
    const { error: deleteError } = await supabase.from('job_profiles').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await fetchAll();
  };

  const handleAddContacts = async ({ jobProfileId, contacts: newContacts }) => {
    const rows = newContacts.map((c) => ({
      job_profile_id: jobProfileId,
      hr_email: c.hr_email,
      hr_name: c.hr_name,
      company_name: c.company_name,
      status: 'Pending',
    }));

    const { error: insertError } = await supabase.from('job_hr_contacts').insert(rows);
    if (insertError) throw insertError;

    await supabase.from('activity_logs').insert({
      action_type: 'Job Applications Queued',
      details: `Queued ${rows.length} HR contact(s) for job application outreach.`,
    });

    await fetchAll();
  };

  const handleDeleteContact = async (id) => {
    const { error: deleteError } = await supabase.from('job_hr_contacts').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRetryContact = async (id) => {
    const { error: updateError } = await supabase
      .from('job_hr_contacts')
      .update({ status: 'Pending', error_message: null })
      .eq('id', id);
    if (updateError) throw updateError;
    await fetchAll();
  };

  const handleUpdateContact = async (id, fields) => {
    const { error: updateError } = await supabase
      .from('job_hr_contacts')
      .update(fields)
      .eq('id', id);
    if (updateError) throw updateError;
    await fetchAll();
  };

  const handleSendNow = useCallback(async (requestedBatchSize = null) => {
    setSendingNow(true);
    try {
      const res = await fetch('/api/send-job-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(requestedBatchSize ? { body: JSON.stringify({ batchSize: requestedBatchSize }) } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch send failed.');
      await fetchAll();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setSendingNow(false);
    }
  }, [fetchAll]);

  // Unified Compose & Send Handler
  const handleComposeSend = async (payload) => {
    // 1. Direct Immediate Delivery
    if (payload.deliveryMode === 'immediate') {
      const res = await fetch('/api/send-single-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      await fetchAll();
      return { success: true, message: `Application email sent immediately to ${payload.hrEmail}!` };
    }

    // 2. Throttled Rate-Limited Delivery
    if (payload.rateLimit && settings?.id) {
      await supabase
        .from('job_application_settings')
        .update({
          batch_size: payload.rateLimit.batch_size,
          interval_value: payload.rateLimit.interval_value,
          interval_unit: payload.rateLimit.interval_unit,
          is_active: payload.rateLimit.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
    }

    const contactsToQueue = payload.recipientType === 'bulk' && payload.bulkContacts?.length
      ? payload.bulkContacts
      : [{
          hr_email: payload.hrEmail,
          hr_name: payload.hrName || null,
          company_name: payload.companyName || null,
        }];

    const rows = contactsToQueue.map((c) => ({
      job_profile_id: payload.jobProfileId || null,
      hr_email: c.hr_email,
      hr_name: c.hr_name || null,
      company_name: c.company_name || null,
      status: 'Pending',
      template_id: payload.templateId,
    }));

    const { error: insertError } = await supabase.from('job_hr_contacts').insert(rows);
    if (insertError) throw insertError;

    await supabase.from('activity_logs').insert({
      action_type: 'Job Applications Queued',
      details: `Queued ${rows.length} application(s) with ${payload.rateLimit.interval_value} ${payload.rateLimit.interval_unit} interval delay.`,
    });

    let immediateNotice = '';
    if (payload.rateLimit?.sendFirstImmediately) {
      try {
        const batchResult = await handleSendNow(1);
        if (batchResult?.sent > 0) {
          immediateNotice = rows.length > 1
            ? `1st application sent immediately to ${rows[0].hr_email}! Remaining ${rows.length - 1} queued with ${payload.rateLimit.interval_value} ${payload.rateLimit.interval_unit} delay.`
            : `Application sent immediately to ${rows[0].hr_email}!`;
        }
      } catch (err) {
        console.warn('Immediate first batch notice:', err);
      }
    }

    await fetchAll();
    return {
      success: true,
      message: immediateNotice || `Queued ${rows.length} application(s) with a ${payload.rateLimit.interval_value} ${payload.rateLimit.interval_unit} time gap between emails.`,
    };
  };

  const sentCount = contacts.filter((c) => c.status === 'Sent').length;
  const pendingCount = contacts.filter((c) => c.status === 'Pending').length;
  const defaultTemplate = templates.find((t) => t.is_default) || templates[0];

  // In-Browser Auto-Dispatch Heartbeat:
  const isSendingRef = useRef(false);
  isSendingRef.current = sendingNow;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!settings?.is_active || pendingCount === 0) {
        setNextDueSeconds(null);
        return;
      }

      const multiplier = settings.interval_unit === 'hours' ? 3600000 : 60000;
      const intervalMs = (settings.interval_value || 15) * multiplier;
      const lastRun = settings.last_run_at ? new Date(settings.last_run_at).getTime() : 0;
      const nextDue = lastRun + intervalMs;
      const diffMs = nextDue - Date.now();

      if (diffMs <= 0) {
        setNextDueSeconds(0);
        if (!isSendingRef.current) {
          handleSendNow(settings.batch_size || 1).catch((e) => console.error('Loop auto-trigger error:', e));
        }
      } else {
        setNextDueSeconds(Math.ceil(diffMs / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, pendingCount, handleSendNow]);

  const formatCountdown = (secs) => {
    if (secs === null) return 'Paused / Idle';
    if (secs <= 0) return 'Sending now...';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="flex-1 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Job Applications"
        description="Direct dispatch and rate-limited loop automation for HR application outreach."
        actions={
          <Link
            href="/job-applications/templates"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-ink-800 text-brand border border-mist dark:border-line hover:bg-mist/25 dark:hover:bg-ink-700 shadow-sm transition-colors"
          >
            <Palette className="h-4 w-4" />
            <span>Email Templates</span>
          </Link>
        }
      />

      {/* KPI Stats Bar with Live Rate Limit Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-black border border-mist dark:border-line rounded-lg shadow-xs">
          <div className="flex items-center justify-between gap-2 text-black/60 dark:text-mist text-xs">
            <span className="truncate">Delivered</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="text-xl font-bold text-black dark:text-white mt-1">{sentCount}</p>
        </div>
        <div className="p-3 bg-white dark:bg-black border border-mist dark:border-line rounded-lg shadow-xs">
          <div className="flex items-center justify-between gap-2 text-black/60 dark:text-mist text-xs">
            <span className="truncate">Pending in Queue</span>
            <Clock className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="text-xl font-bold text-black dark:text-white mt-1">{pendingCount}</p>
        </div>
        <div className="p-3 bg-white dark:bg-black border border-mist dark:border-line rounded-lg shadow-xs">
          <div className="flex items-center justify-between gap-2 text-black/60 dark:text-mist text-xs">
            <span className="truncate">Rate Limit Throttle</span>
            <Timer className="h-3.5 w-3.5 text-brand" />
          </div>
          <div className="mt-1 flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${settings?.is_active && pendingCount > 0 ? 'bg-brand animate-pulse' : 'bg-mist'}`} />
            <p className="text-xs font-bold text-black dark:text-white">
              {pendingCount > 0 ? formatCountdown(nextDueSeconds) : 'Queue Empty'}
            </p>
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-black border border-mist dark:border-line rounded-lg shadow-xs">
          <div className="flex items-center justify-between gap-2 text-black/60 dark:text-mist text-xs">
            <span className="truncate">Default Template</span>
            <LayoutGrid className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="text-xs font-bold text-black dark:text-white truncate mt-1.5" title={defaultTemplate?.name || 'Default'}>
            {defaultTemplate?.name || 'Default Template'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2.5 p-3 bg-mist/25 dark:bg-black border border-brand rounded-lg text-black dark:text-white text-xs font-medium">
          <AlertCircle className="h-4 w-4 text-brand shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Structured View Switcher */}
      <div className="flex items-center bg-mist/25 dark:bg-black border border-mist dark:border-line rounded-md p-1 w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('compose')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'compose'
              ? 'bg-brand text-white shadow-xs'
              : 'text-black dark:text-mist hover:bg-mist/25'
          }`}
        >
          <SendHorizonal className="h-3.5 w-3.5" />
          <span>Compose & Dispatch</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'bulk'
              ? 'bg-brand text-white shadow-xs'
              : 'text-black dark:text-mist hover:bg-mist/25'
          }`}
        >
          <ListPlus className="h-3.5 w-3.5" />
          <span>Bulk Queue Importer</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'profiles'
              ? 'bg-brand text-white shadow-xs'
              : 'text-black dark:text-mist hover:bg-mist/25'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Job Profiles</span>
        </button>
      </div>

      {/* Tab Panels without redundant RateLimitSettings card */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7">
            <ComposeCard
              profiles={profiles}
              templates={templates}
              settings={settings}
              onSend={handleComposeSend}
            />
          </div>
          <div className="lg:col-span-5">
            <QueueTable
              contacts={contacts}
              loading={loading}
              onDelete={handleDeleteContact}
              onRetry={handleRetryContact}
              onUpdate={handleUpdateContact}
            />
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7">
            <AddHrContactsForm profiles={profiles} onAddContacts={handleAddContacts} />
          </div>
          <div className="lg:col-span-5">
            <QueueTable
              contacts={contacts}
              loading={loading}
              onDelete={handleDeleteContact}
              onRetry={handleRetryContact}
              onUpdate={handleUpdateContact}
            />
          </div>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7">
            <JobProfilesPanel
              profiles={profiles}
              loading={loading}
              onAddProfile={handleAddProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-white dark:bg-black rounded-lg border border-mist dark:border-line shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand dark:text-mist">How Profiles Work</h3>
              <p className="text-xs text-black/70 dark:text-mist leading-relaxed">
                Profiles allow you to configure distinct job titles, relevant skills, and tailored &quot;Why This Company&quot; pitch lines. When composing applications, attaching a profile automatically fills in the personalized email tokens.
              </p>
            </div>
            <QueueTable
              contacts={contacts}
              loading={loading}
              onDelete={handleDeleteContact}
              onRetry={handleRetryContact}
              onUpdate={handleUpdateContact}
            />
          </div>
        </div>
      )}
    </div>
  );
}
