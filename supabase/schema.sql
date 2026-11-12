-- AGS Workspace Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text check (role in ('owner', 'assistant', 'staff', 'accountant')) default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  customer_name text,
  address text,
  status text default 'pending',
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Progress Reports
create table public.progress_reports (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  reported_by uuid references public.profiles(id),
  status text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Photos
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  progress_report_id uuid references public.progress_reports(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stock / Tool Requests
create table public.stock_requests (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  item text not null,
  quantity text,
  urgency text default 'normal',
  notes text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.progress_reports enable row level security;
alter table public.photos enable row level security;
alter table public.stock_requests enable row level security;

-- Basic policies (to be refined)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Owners and assistants can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner', 'assistant'))
);

create policy "Staff can view assigned jobs" on public.jobs for select using (
  assigned_to = auth.uid() or 
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner', 'assistant', 'accountant'))
);

create policy "Users can insert progress reports for their jobs" on public.progress_reports for insert with check (
  reported_by = auth.uid()
);
