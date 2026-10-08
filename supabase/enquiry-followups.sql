-- Follow-up fields and catalog indexes.
-- Paste this in the Supabase SQL editor. The app cannot run it.
-- Existing enquiry rows stay. Missing columns are added.

alter table public.enquiries add column if not exists status text not null default 'new';
alter table public.enquiries add column if not exists reply text not null default '';
alter table public.enquiries add column if not exists follow_up_at timestamptz;

create index if not exists flats_catalog_idx
  on public.flats (city, area, status, listed_at desc);

create index if not exists enquiries_created_idx
  on public.enquiries (created_at desc);
