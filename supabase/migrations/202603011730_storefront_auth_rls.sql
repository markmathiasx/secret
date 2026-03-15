create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'recebido',
  created_at timestamptz not null default now()
);

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient text,
  zip_code text,
  city text,
  state text,
  street text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_history_placeholder (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_code text,
  status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.social_lead_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  channel text not null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.quote_requests enable row level security;
alter table public.user_addresses enable row level security;
alter table public.order_history_placeholder enable row level security;
alter table public.social_lead_events enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quote_requests_own" on public.quote_requests;
create policy "quote_requests_own" on public.quote_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_addresses_own" on public.user_addresses;
create policy "user_addresses_own" on public.user_addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "order_history_placeholder_own" on public.order_history_placeholder;
create policy "order_history_placeholder_own" on public.order_history_placeholder for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "social_lead_events_own" on public.social_lead_events;
create policy "social_lead_events_own" on public.social_lead_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_profile_updated_at();
