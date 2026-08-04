-- Editable job-application email template (singleton row), edited from
-- /job-applications/template in the app. If no row exists, the app falls back to
-- the compiled job-application-email/dist/template.html at send time.

create table if not exists public.job_email_template (
  id uuid primary key default gen_random_uuid(),
  html_content text not null,
  plain_text_content text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.job_email_template enable row level security;

-- Single-owner internal tool with no auth layer today — same anon-key access pattern as
-- the other job_application_* tables (see 0001_job_applications_core.sql).
create policy "anon full access" on public.job_email_template
  for all to anon using (true) with check (true);
