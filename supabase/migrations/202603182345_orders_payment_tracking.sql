alter table if exists public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists payment_status text,
  add column if not exists payment_status_detail text,
  add column if not exists payment_approved_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists orders_payment_reference_idx on public.orders (payment_reference);
