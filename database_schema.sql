

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


create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamp with time zone default now()
);


alter table sessions enable row level security;
alter table weekly_plan enable row level security;
alter table profiles enable row level security;


drop policy if exists "Allow all access for public" on sessions;
drop policy if exists "Allow all access for public" on weekly_plan;
drop policy if exists "Users can manage their own sessions" on sessions;
drop policy if exists "Users can manage their own plans" on weekly_plan;
drop policy if exists "Users can view own profile" on profiles;


create policy "Users can manage their own sessions" 
on sessions for all 
using (auth.uid() = user_id) 
with check (auth.uid() = user_id);


create policy "Users can manage their own plans" 
on weekly_plan for all 
using (auth.uid() = user_id) 
with check (auth.uid() = user_id);


create policy "Users can view own profile" 
on profiles for select 
using (auth.uid() = id);


create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;


drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
