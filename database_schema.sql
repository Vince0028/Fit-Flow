

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid(),
  title text not null,
  date timestamp with time zone not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now()
);


create table if not exists weekly_plan (
  user_id uuid primary key default auth.uid(),
  plan jsonb not null,
  updated_at timestamp with time zone default now()
);


alter table sessions enable row level security;
alter table weekly_plan enable row level security;


drop policy if exists "Allow all access for public" on sessions;
drop policy if exists "Allow all access for public" on weekly_plan;
drop policy if exists "Users can manage their own sessions" on sessions;
drop policy if exists "Users can manage their own plans" on weekly_plan;


create policy "Users can manage their own sessions" 
on sessions for all 
using (auth.uid() = user_id) 
with check (auth.uid() = user_id);


create policy "Users can manage their own plans" 
on weekly_plan for all 
using (auth.uid() = user_id) 
with check (auth.uid() = user_id);
