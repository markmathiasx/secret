-- MDH 3D Store private storage foundation.
-- Keep service-role uploads server-side only. These policies are defense-in-depth
-- for any future browser-authenticated direct uploads.

insert into storage.buckets (id, name, public)
values ('mdh-private-assets', 'mdh-private-assets', false)
on conflict (id) do update
set public = false;

alter table storage.objects enable row level security;

drop policy if exists "mdh_users_upload_own_private_assets" on storage.objects;
create policy "mdh_users_upload_own_private_assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mdh-private-assets'
  and (storage.foldername(name))[1] in ('quote-reference', 'quote-model', 'admin-private')
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

drop policy if exists "mdh_users_read_own_private_assets" on storage.objects;
create policy "mdh_users_read_own_private_assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mdh-private-assets'
  and (storage.foldername(name))[1] in ('quote-reference', 'quote-model', 'admin-private')
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

drop policy if exists "mdh_users_update_own_private_assets" on storage.objects;
create policy "mdh_users_update_own_private_assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'mdh-private-assets'
  and (storage.foldername(name))[1] in ('quote-reference', 'quote-model', 'admin-private')
  and (storage.foldername(name))[2] = (select auth.uid())::text
)
with check (
  bucket_id = 'mdh-private-assets'
  and (storage.foldername(name))[1] in ('quote-reference', 'quote-model', 'admin-private')
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

drop policy if exists "mdh_public_product_assets_are_readable" on storage.objects;
create policy "mdh_public_product_assets_are_readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'mdh-private-assets'
  and (storage.foldername(name))[1] = 'product-public'
);
