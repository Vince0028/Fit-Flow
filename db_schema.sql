-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
-- Used IF NOT EXISTS to prevent errors if you ran the script partially or if a starter kit created it
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  age numeric,
  gender text,
  height numeric,
  weight numeric,
  blood_pressure text,
  fitness_goals text,
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;

-- Policies (Drop first to ensure updates are applied without error)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Table: sessions
create table if not exists public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text,
  date timestamp with time zone,
  exercises jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.sessions enable row level security;

drop policy if exists "Users can view own sessions" on public.sessions;
create policy "Users can view own sessions" on public.sessions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on public.sessions;
create policy "Users can insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on public.sessions;
create policy "Users can update own sessions" on public.sessions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on public.sessions;
create policy "Users can delete own sessions" on public.sessions for delete using (auth.uid() = user_id);

-- Table: weekly_plan
create table if not exists public.weekly_plan (
  user_id uuid references auth.users not null primary key,
  plan jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.weekly_plan enable row level security;

drop policy if exists "Users can view own plan" on public.weekly_plan;
create policy "Users can view own plan" on public.weekly_plan for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own plan" on public.weekly_plan;
create policy "Users can insert own plan" on public.weekly_plan for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own plan" on public.weekly_plan;
create policy "Users can update own plan" on public.weekly_plan for update using (auth.uid() = user_id);
  
drop policy if exists "Users can delete own plan" on public.weekly_plan;
create policy "Users can delete own plan" on public.weekly_plan for delete using (auth.uid() = user_id);

-- Table: daily_nutrition
create table if not exists public.daily_nutrition (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date,
  meal_name text,
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  foods jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.daily_nutrition enable row level security;

drop policy if exists "Users can view own nutrition logs" on public.daily_nutrition;
create policy "Users can view own nutrition logs" on public.daily_nutrition for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own nutrition logs" on public.daily_nutrition;
create policy "Users can insert own nutrition logs" on public.daily_nutrition for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own nutrition logs" on public.daily_nutrition;
create policy "Users can update own nutrition logs" on public.daily_nutrition for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own nutrition logs" on public.daily_nutrition;
create policy "Users can delete own nutrition logs" on public.daily_nutrition for delete using (auth.uid() = user_id);
