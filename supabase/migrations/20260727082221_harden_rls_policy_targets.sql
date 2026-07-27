-- Harden exposed public schema objects for Supabase Data API access.
-- This migration changes access policy metadata only; it does not mutate user data.

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.favorites to authenticated;
grant select, insert, update, delete on table public.quote_requests to authenticated;
grant select, insert, update, delete on table public.user_addresses to authenticated;
grant select, insert, update, delete on table public.order_history_placeholder to authenticated;
grant select, insert, update, delete on table public.social_lead_events to authenticated;
grant select, insert, update, delete on table public.quote_request_items to authenticated;
grant select, insert, update, delete on table public.customer_preferences to authenticated;

revoke all on table public.profiles from anon;
revoke all on table public.favorites from anon;
revoke all on table public.quote_requests from anon;
revoke all on table public.user_addresses from anon;
revoke all on table public.order_history_placeholder from anon;
revoke all on table public.social_lead_events from anon;
revoke all on table public.quote_request_items from anon;
revoke all on table public.customer_preferences from anon;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own"
on public.profiles
for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own"
on public.favorites
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "quote_requests_own" on public.quote_requests;
create policy "quote_requests_own"
on public.quote_requests
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "user_addresses_own" on public.user_addresses;
create policy "user_addresses_own"
on public.user_addresses
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "order_history_placeholder_own" on public.order_history_placeholder;
create policy "order_history_placeholder_own"
on public.order_history_placeholder
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "social_lead_events_own" on public.social_lead_events;
create policy "social_lead_events_own"
on public.social_lead_events
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "quote_request_items_own" on public.quote_request_items;
create policy "quote_request_items_own"
on public.quote_request_items
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "customer_preferences_own" on public.customer_preferences;
create policy "customer_preferences_own"
on public.customer_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
