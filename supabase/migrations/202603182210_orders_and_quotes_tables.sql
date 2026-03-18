create extension if not exists "pgcrypto";

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_id text unique,
  product_id text,
  product_name text,
  customername text,
  phone text,
  cep text,
  neighborhood text,
  distancekm numeric,
  colorpreference text,
  paymentmethod text,
  notes text,
  estimated_price_pix numeric,
  estimated_price_card numeric,
  estimated_delivery_fee numeric,
  estimated_total_pix numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique,
  product_id text,
  product_name text,
  quantity integer,
  customer_name text,
  email text,
  phone text,
  neighborhood text,
  cep text,
  payment_method text,
  notes text,
  total_pix numeric,
  total_card numeric,
  status text not null default 'novo pedido',
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_quote_id_idx on public.quotes (quote_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_order_code_idx on public.orders (order_code);
