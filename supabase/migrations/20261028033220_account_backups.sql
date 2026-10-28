-- Separate from the beta tables: there is deliberately no client-writable premium flag.
create table public.hydration_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb
    check (jsonb_typeof(settings) = 'object' and octet_length(settings::text) <= 65536)
    check (not (settings ?| array['isPremium', 'is_premium', 'userAccount', 'unlockedCharacters'])),
  updated_at timestamptz not null default now()
);

create table public.hydration_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 120),
  beverage_type text not null check (beverage_type in (
    'water', 'green_tea', 'herbal_tea', 'coffee', 'espresso', 'juice', 'smoothie',
    'milk', 'electrolyte', 'soda', 'alcohol'
  )),
  amount integer not null check (amount > 0 and amount <= 10000),
  effective_amount integer not null check (effective_amount between -10000 and 20000),
  color text not null check (length(color) between 1 and 32),
  logged_at timestamptz not null,
  primary key (user_id, id)
);

alter table public.hydration_profiles enable row level security;
alter table public.hydration_logs enable row level security;

revoke all on public.hydration_profiles, public.hydration_logs from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update on public.hydration_profiles to authenticated;
grant select, insert on public.hydration_logs to authenticated;
grant all on public.hydration_profiles, public.hydration_logs to service_role;

create policy profiles_select_own on public.hydration_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.hydration_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.hydration_profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy logs_select_own on public.hydration_logs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy logs_insert_own on public.hydration_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);
