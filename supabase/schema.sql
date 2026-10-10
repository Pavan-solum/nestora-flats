-- Idempotent Nestora schema. Does not drop tables or rows.
-- Existing tables are kept; missing Mars Mount columns are added.

create table if not exists public.flats (
  id text primary key,
  title text not null,
  description text not null default '',
  price bigint not null,
  location text not null default '',
  city text not null,
  area text not null,
  bedrooms integer,
  bathrooms integer,
  balconies integer,
  carpet_area integer,
  facing text,
  floor integer,
  total_floors integer,
  age_years integer,
  furnishing text,
  amenities jsonb not null default '[]'::jsonb,
  nearby_schools jsonb not null default '[]'::jsonb,
  nearby_colleges jsonb not null default '[]'::jsonb,
  nearby_hospitals jsonb not null default '[]'::jsonb,
  nearby_transport jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'available',
  featured boolean not null default false,
  listed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project_name text,
  oc_cc_approved boolean,
  khata text,
  total_units integer,
  independent_walls boolean,
  map_url text,
  latitude double precision,
  longitude double precision
);

-- Live migration: run these ALTER statements in the Supabase SQL editor.
-- They add Mars Mount columns only. They do not drop tables, rewrite enums, or add policies.
alter table public.flats add column if not exists project_name text;
alter table public.flats add column if not exists oc_cc_approved boolean;
alter table public.flats add column if not exists khata text;
alter table public.flats add column if not exists total_units integer;
alter table public.flats add column if not exists independent_walls boolean;
alter table public.flats add column if not exists map_url text;
alter table public.flats add column if not exists latitude double precision;
alter table public.flats add column if not exists longitude double precision;

create table if not exists public.enquiries (
  id text primary key,
  intent text not null,
  flat_id text,
  flat_title text,
  name text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  preferred_visit text,
  city text,
  area text,
  created_at timestamptz not null default now(),
  status text not null default 'new',
  reply text not null default '',
  follow_up_at timestamptz
);

alter table public.flats enable row level security;
alter table public.enquiries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flats' and policyname = 'flats_public_read'
  ) then
    create policy flats_public_read on public.flats
      for select to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'enquiries' and policyname = 'enquiries_public_insert'
  ) then
    create policy enquiries_public_insert on public.enquiries
      for insert to anon, authenticated
      with check (true);
  end if;
end $$;

alter table public.enquiries add column if not exists status text not null default 'new';
alter table public.enquiries add column if not exists reply text not null default '';
alter table public.enquiries add column if not exists follow_up_at timestamptz;

create index if not exists flats_catalog_idx
  on public.flats (city, area, status, listed_at desc);

create index if not exists enquiries_created_idx
  on public.enquiries (created_at desc);
