-- MDH 3D quote_requests / quotes extension
create table if not exists quote_requests (
  id bigserial primary key,
  quote_id text not null unique,
  request_type text not null default 'image-to-3d',
  customer_name text not null,
  phone text not null,
  email text,
  project_description text,
  project_size text,
  preferred_material text,
  preferred_color text,
  desired_deadline text,
  quantity integer default 1,
  reference_image_name text,
  reference_image_size bigint,
  model_file_name text,
  model_file_size bigint,
  source text default 'site',
  storage_mode text default 'metadata-only',
  created_at timestamptz default now()
);

create index if not exists quote_requests_created_at_idx on quote_requests(created_at desc);
create index if not exists quote_requests_phone_idx on quote_requests(phone);
