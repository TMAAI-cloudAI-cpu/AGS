create table if not exists public.staff (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  cell_number text not null,
  id_number text,
  address text,
  access text check (access in ('full', 'staff')) not null default 'staff',
  pin text not null,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.staff enable row level security;

grant select, insert, update, delete on public.staff to anon, authenticated;

drop policy if exists "workspace can read staff" on public.staff;
drop policy if exists "workspace can add staff" on public.staff;
drop policy if exists "workspace can update staff" on public.staff;
drop policy if exists "workspace can remove staff" on public.staff;

create policy "workspace can read staff" on public.staff for select using (true);
create policy "workspace can add staff" on public.staff for insert with check (true);
create policy "workspace can update staff" on public.staff for update using (true);
create policy "workspace can remove staff" on public.staff for delete using (true);
