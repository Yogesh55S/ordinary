-- Extends job_email_template (originally a singleton row, see 0002) into a template
-- library: multiple named templates, one of which is marked default. The app
-- (/job-applications/templates) has depended on these columns since it shipped, but
-- this migration was never committed — so `name` edits and default-selection never
-- actually persisted. Run this once against Supabase to bring the schema in line.

alter table public.job_email_template
  add column if not exists name text not null default 'Untitled Template';

alter table public.job_email_template
  add column if not exists is_default boolean not null default false;

-- Backfill: if templates already exist and none is marked default, promote the
-- oldest one so ComposeCard's `templates.find(t => t.is_default) || templates[0]`
-- fallback has a real default to point at.
update public.job_email_template
set is_default = true
where id = (
  select id from public.job_email_template order by updated_at asc limit 1
)
and not exists (select 1 from public.job_email_template where is_default = true);

-- Only one template can be marked default at a time.
create unique index if not exists job_email_template_single_default
  on public.job_email_template (is_default)
  where is_default;
