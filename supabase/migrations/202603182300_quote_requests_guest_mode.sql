alter table if exists public.quote_requests
  alter column user_id drop not null;

alter table if exists public.quote_requests
  add column if not exists quote_id text,
  add column if not exists request_type text default 'image-to-3d',
  add column if not exists customer_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists project_description text,
  add column if not exists project_size text,
  add column if not exists preferred_material text,
  add column if not exists preferred_color text,
  add column if not exists desired_deadline text,
  add column if not exists quantity integer default 1,
  add column if not exists reference_image_name text,
  add column if not exists reference_image_size bigint,
  add column if not exists model_file_name text,
  add column if not exists model_file_size bigint,
  add column if not exists source text default 'site',
  add column if not exists storage_mode text default 'metadata-only';

create unique index if not exists quote_requests_quote_id_uidx on public.quote_requests (quote_id);
create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
