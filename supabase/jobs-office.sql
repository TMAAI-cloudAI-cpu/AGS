alter table public.jobs add column if not exists job_number text;
alter table public.jobs add column if not exists description text;
alter table public.jobs add column if not exists staff_id uuid references public.staff(id);

create unique index if not exists jobs_job_number_key on public.jobs (job_number);

do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'jobs'
  loop
    execute format('drop policy if exists %I on public.jobs', r.policyname);
  end loop;
end $$;

grant select, insert, update, delete on public.jobs to anon, authenticated;

create policy "workspace can read jobs" on public.jobs for select using (true);
create policy "workspace can add jobs" on public.jobs for insert with check (true);
create policy "workspace can update jobs" on public.jobs for update using (true);
create policy "workspace can delete jobs" on public.jobs for delete using (true);
