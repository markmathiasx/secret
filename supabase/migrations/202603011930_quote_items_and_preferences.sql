create table if not exists public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id text,
  quantity integer not null default 1,
  unit_price numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  favorite_categories text[] not null default '{}',
  preferred_materials text[] not null default '{}',
  budget_range text,
  notify_whatsapp boolean not null default true,
  notify_email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.quote_request_items enable row level security;
alter table public.customer_preferences enable row level security;

drop policy if exists "quote_request_items_own" on public.quote_request_items;
create policy "quote_request_items_own" on public.quote_request_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "customer_preferences_own" on public.customer_preferences;
create policy "customer_preferences_own" on public.customer_preferences
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_customer_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customer_preferences_updated_at on public.customer_preferences;
create trigger trg_customer_preferences_updated_at
before update on public.customer_preferences
for each row execute procedure public.handle_customer_preferences_updated_at();
