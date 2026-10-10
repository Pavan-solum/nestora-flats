-- The live database already has public.social_posts from an older design.
-- Create table if not exists left that table unchanged.
-- This desk uses its own table. Paste this in the Supabase SQL editor.

create table if not exists public.social_desk_posts (
  id text primary key,
  flat_id text,
  flat_title text,
  caption text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  networks jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_desk_posts enable row level security;
