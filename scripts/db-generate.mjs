import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'supabase');
fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, 'manual-schema.sql');
const sql = `-- MDH 3D manual schema helper\ncreate table if not exists quotes (\n  id uuid primary key default gen_random_uuid(),\n  quote_id text unique,\n  product_id text,\n  product_name text,\n  customername text,\n  phone text,\n  cep text,\n  neighborhood text,\n  distancekm numeric,\n  colorpreference text,\n  paymentmethod text,\n  notes text,\n  estimated_price_pix numeric,\n  estimated_price_card numeric,\n  estimated_delivery_fee numeric,\n  estimated_total_pix numeric,\n  created_at timestamptz default now()\n);\n\ncreate table if not exists orders (\n  id uuid primary key default gen_random_uuid(),\n  order_code text unique,\n  product_id text,\n  product_name text,\n  quantity integer,\n  customer_name text,\n  email text,\n  phone text,\n  neighborhood text,\n  cep text,\n  payment_method text,\n  notes text,\n  total_pix numeric,\n  total_card numeric,\n  status text default 'novo pedido',\n  created_at timestamptz default now()\n);\n`;
fs.writeFileSync(file, sql);
console.log(`Arquivo gerado em ${file}`);
