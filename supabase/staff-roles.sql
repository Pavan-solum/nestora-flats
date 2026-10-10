-- Let every Nestora desk role sign in, and let an admin create more roles.
-- Paste this in the Supabase SQL editor. The app cannot run it.
-- If the ALTER TYPE lines fail because a new value is used too soon, run those
-- four lines alone, then run the rest of this file.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lead-manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'social-media-manager';

create table if not exists public.staff_roles (
  role text primary key,
  label text not null,
  access text not null check (
    access in ('admin', 'agent', 'staff', 'lead-manager', 'social-media-manager')
  )
);

insert into public.staff_roles (role, label, access) values
  ('admin', 'Admin', 'admin'),
  ('agent', 'Agent', 'agent'),
  ('staff', 'Staff', 'staff'),
  ('lead-manager', 'Lead manager', 'lead-manager'),
  ('social-media-manager', 'Social media manager', 'social-media-manager')
on conflict (role) do nothing;

create or replace function public.add_app_role(role_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if role_name is null or role_name !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Role name must use lowercase letters, numbers, and hyphens';
  end if;
  execute format('alter type public.app_role add value if not exists %L', role_name);
end;
$$;

revoke all on function public.add_app_role(text) from public;
grant execute on function public.add_app_role(text) to service_role;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and (
        role::text in (
          'admin',
          'agent',
          'staff',
          'lead-manager',
          'social-media-manager'
        )
        or exists (
          select 1
          from public.staff_roles
          where staff_roles.role = profiles.role::text
        )
      )
  );
$$;
