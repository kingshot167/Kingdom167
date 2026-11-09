-- Suggested Supabase/Postgres schema. Apply after reviewing in a Supabase migration.
create extension if not exists btree_gist;

create table public.prep_week_config (
  weekday smallint primary key check (weekday in (0,1,4)), -- Mon, Tue, Fri; UTC weekday index
  perk text not null check (perk in ('Construction','Research','Troop Training')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.prep_week_config(weekday,perk) values
  (0,'Construction'),(1,'Research'),(4,'Construction');

create table public.prep_week_bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id),
  ign text not null check (length(trim(ign)) between 1 and 24),
  perk text not null check (perk in ('Construction','Research','Troop Training','No default perk')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (extract(epoch from (ends_at-starts_at)) = 1800),
  -- A single range row preserves midnight-crossing bookings as one reservation.
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
);

alter table public.prep_week_config enable row level security;
alter table public.prep_week_bookings enable row level security;
grant select on public.prep_week_config, public.prep_week_bookings to authenticated;
-- Do not grant direct INSERT/UPDATE/DELETE to anon or authenticated.
-- Publish booking/cancel/admin operations only through SECURITY DEFINER RPCs that:
--  * require auth.uid() and validate IGN/perk, 30-minute boundaries and UTC schedule;
--  * constrain bookings to the active Prep Week, with Saturday ending by 12:00 UTC;
--  * permit cancellation only by the owner before starts_at;
--  * restrict config writes to a server-verified admin role (e.g. JWT app_metadata role).
-- The exclusion constraint is the final race-safe guard against overlapping bookings,
-- including a booking that crosses midnight. Keep the service_role key server-side only.
create policy "authenticated can read config" on public.prep_week_config
  for select to authenticated using (true);
create policy "authenticated can see schedule" on public.prep_week_bookings
  for select to authenticated using (true);
