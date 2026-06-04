-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  linkedin_url text,
  target_role text,
  preferred_location text,
  expected_salary text,
  onboarding_completed boolean default false,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  ai_calls_today integer default 0,
  ai_calls_reset_date date default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Resumes table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text,
  file_url text,
  parsed_text text,
  ats_score integer,
  keywords jsonb default '[]',
  missing_keywords jsonb default '[]',
  suggestions jsonb default '[]',
  summary text,
  created_at timestamp with time zone default now()
);

-- Applications table
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_title text not null,
  company text not null,
  location text,
  salary text,
  status text default 'Applied' check (status in ('Applied', 'Interview', 'Offer', 'Rejected')),
  applied_date date default current_date,
  interview_date date,
  job_url text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Saved Jobs table
create table if not exists public.saved_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id text not null,
  title text not null,
  company text not null,
  location text,
  salary text,
  description text,
  tags jsonb default '[]',
  apply_url text,
  source text,
  match_score integer default 0,
  saved_at timestamp with time zone default now(),
  unique (user_id, job_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Resumes policies
create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

-- Applications policies
create policy "Users can view own applications" on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on public.applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on public.applications for update using (auth.uid() = user_id);
create policy "Users can delete own applications" on public.applications for delete using (auth.uid() = user_id);

-- Saved Jobs policies
create policy "Users can view own saved jobs" on public.saved_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own saved jobs" on public.saved_jobs for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved jobs" on public.saved_jobs for delete using (auth.uid() = user_id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migrations for existing deployments (run these if upgrading):
-- alter table public.profiles add column if not exists onboarding_completed boolean default false;
-- alter table public.profiles add column if not exists subscription_tier text default 'free';
-- alter table public.profiles add column if not exists stripe_customer_id text;
-- alter table public.profiles add column if not exists stripe_subscription_id text;
-- alter table public.profiles add column if not exists ai_calls_today integer default 0;
-- alter table public.profiles add column if not exists ai_calls_reset_date date default current_date;
-- alter table public.applications add column if not exists interview_date date;
