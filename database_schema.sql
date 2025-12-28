
-- 1. Create a table for workout sessions
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- Anonymous user ID for now
  title text not null,
  date timestamp with time zone not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Create a table for user weekly plans
create table if not exists weekly_plan (
  user_id uuid primary key,
  plan jsonb not null,
  updated_at timestamp with time zone default now()
);

-- 3. Enable Row Level Security (RLS) - Optional for anon access but good practice
alter table sessions enable row level security;
alter table weekly_plan enable row level security;

-- 4. Create policies to allow public access (since we are in dev/anon mode)
--    In a real app, you would restrict this to auth.uid()
create policy "Allow all access for public" on sessions
  for all using (true) with check (true);

create policy "Allow all access for public" on weekly_plan
  for all using (true) with check (true);
