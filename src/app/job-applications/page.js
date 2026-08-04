'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Palette } from 'lucide-react';

import JobProfilesPanel from '@/components/job-applications/JobProfilesPanel';
import AddHrContactsForm from '@/components/job-applications/AddHrContactsForm';
import RateLimitSettings from '@/components/job-applications/RateLimitSettings';
import QueueTable from '@/components/job-applications/QueueTable';

const DEFAULT_SETTINGS = { batch_size: 5, interval_value: 30, interval_unit: 'minutes', is_active: false };

export default function JobApplicationsPage() {
  const [profiles, setProfiles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingNow, setSendingNow] = useState(false);
  const [lastSendResult, setLastSendResult] = useState(null);

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

      const [profilesRes, contactsRes] = await Promise.all([
        supabase.from('job_profiles').select('*').order('created_at', { ascending: false }),
        supabase
          .from('job_hr_contacts')
          .select('*, job_profiles(id, title)')
          .order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (contactsRes.error) throw contactsRes.error;

      setProfiles(profilesRes.data || []);
      setContacts(contactsRes.data || []);
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

  const handleSaveSettings = async (form) => {
    if (!settings?.id) return;
    const { error: updateError } = await supabase
      .from('job_application_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', settings.id);
    if (updateError) throw updateError;
    await fetchSettings();
  };

  const handleSendNow = async () => {
    setSendingNow(true);
    setLastSendResult(null);
    try {
      const res = await fetch('/api/send-job-emails', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch send failed.');
      setLastSendResult(data);
      await fetchAll();
    } catch (err) {
      setLastSendResult({ error: err.message });
    } finally {
      setSendingNow(false);
    }
  };

  const pendingCount = contacts.filter((c) => c.status === 'Pending').length;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Job Applications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Queue HR contacts, attach a job profile, and let a rate-limited loop send your application emails.
          </p>
        </div>
        <Link
          href="/job-applications/template"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-[#111625] text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 shadow-sm transition-all shrink-0"
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Edit Email Template</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <AddHrContactsForm profiles={profiles} onAddContacts={handleAddContacts} />
          <QueueTable
            contacts={contacts}
            loading={loading}
            onDelete={handleDeleteContact}
            onRetry={handleRetryContact}
          />
        </div>

        <div className="space-y-6">
          <RateLimitSettings
            settings={settings}
            pendingCount={pendingCount}
            onSave={handleSaveSettings}
            onSendNow={handleSendNow}
            sendingNow={sendingNow}
            lastSendResult={lastSendResult}
          />
          <JobProfilesPanel
            profiles={profiles}
            loading={loading}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        </div>
      </div>
    </div>
  );
}
