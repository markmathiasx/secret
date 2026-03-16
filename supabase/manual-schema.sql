-- MDH 3D manual schema helper
create table if not exists quotes (
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
  created_at timestamptz default now()
);

create table if not exists orders (
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
  status text default 'novo pedido',
  created_at timestamptz default now()
);
