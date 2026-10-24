-- Lock the workspace data away from the public anon key.
--
-- Since the owner-login release, the browser no longer talks to Supabase directly:
-- every query goes through the authenticated /api/db bridge, which uses the
-- service-role key (that key bypasses RLS and table grants, so the app keeps working).
--
-- RUN THIS ONLY AFTER the new app version is deployed — older builds still use the
-- anon key from the browser and would stop working.

do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'activity_logs',
    'clients',
    'job_application_settings',
    'job_email_template',
    'job_hr_contacts',
    'job_profiles',
    'media',
    'outreach_schedules',
    'templates'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);

      -- Remove every policy that grants access to anon / authenticated / public.
      for p in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = t
          and roles && array['anon', 'authenticated', 'public']::name[]
      loop
        execute format('drop policy if exists %I on public.%I', p.policyname, t);
      end loop;

      execute format('revoke all on table public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;

-- Storage: uploads/deletes now go through /api/db/storage with the service role.
-- Public READ of 'outreach-media' stays (WhatsApp/email attachments are sent by URL),
-- but anon must not be able to write. Drop any anon INSERT/UPDATE/DELETE policies:
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and roles && array['anon', 'public']::name[]
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;
