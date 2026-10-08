-- Paste this into the Supabase SQL editor.
-- Adds Mars Mount columns when they are missing. Does not drop data or change policies.

alter table public.flats add column if not exists project_name text;
alter table public.flats add column if not exists oc_cc_approved boolean;
alter table public.flats add column if not exists khata text;
alter table public.flats add column if not exists total_units integer;
alter table public.flats add column if not exists independent_walls boolean;
alter table public.flats add column if not exists map_url text;
alter table public.flats add column if not exists latitude double precision;
alter table public.flats add column if not exists longitude double precision;
