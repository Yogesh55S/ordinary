-- Job Applications outreach feature — core tables.
-- These were referenced by application code (src/app/job-applications/page.js,
-- src/app/api/send-job-emails/route.js, src/scripts/job-application-worker.js) but never
-- created in the live database, so every query against them failed with PGRST205.
--
-- Run this in the Supabase Dashboard -> SQL Editor (no local DB/CLI access available).

create table if not exists public.job_profiles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  relevant_skills text,
  why_company_template text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_hr_contacts (
  id uuid primary key default gen_random_uuid(),
  job_profile_id uuid references public.job_profiles(id) on delete set null,
  hr_email text not null,
  hr_name text,
  company_name text,
  status text not null default 'Pending' check (status in ('Pending', 'Sent', 'Failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_application_settings (
  id uuid primary key default gen_random_uuid(),
  batch_size integer not null default 5,
  interval_value integer not null default 30,
  interval_unit text not null default 'minutes' check (interval_unit in ('minutes', 'hours')),
  is_active boolean not null default false,
  last_run_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists job_hr_contacts_status_idx on public.job_hr_contacts (status);
create index if not exists job_hr_contacts_job_profile_id_idx on public.job_hr_contacts (job_profile_id);

alter table public.job_profiles enable row level security;
alter table public.job_hr_contacts enable row level security;
alter table public.job_application_settings enable row level security;

-- Single-owner internal tool with no auth layer today — these policies preserve the app's
-- existing anon-key access pattern explicitly (used by src/app/job-applications/page.js),
-- rather than leaving RLS disabled entirely on tables reachable via the public anon key.
create policy "anon full access" on public.job_profiles
  for all to anon using (true) with check (true);

create policy "anon full access" on public.job_hr_contacts
  for all to anon using (true) with check (true);

create policy "anon full access" on public.job_application_settings
  for all to anon using (true) with check (true);
