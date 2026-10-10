-- Loveora hosted accounts and community data.
-- Run once in the Supabase SQL Editor before deploying.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null check (char_length(display_name) between 2 and 32),
    created_at timestamptz not null default now()
);

create table if not exists public.posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    message text not null check (char_length(message) between 3 and 500),
    created_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.post_hearts (
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, user_id)
);

create table if not exists public.post_reports (
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_hearts enable row level security;
alter table public.post_reports enable row level security;

-- The Vercel API verifies each account session and accesses data with the
-- server-only service role key. Browser clients receive no table privileges.
revoke all on public.profiles, public.posts, public.post_hearts, public.post_reports from anon, authenticated;
grant all on public.profiles, public.posts, public.post_hearts, public.post_reports to service_role;

create or replace function public.toggle_post_heart(p_post_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    perform pg_advisory_xact_lock(hashtext(p_post_id::text || ':' || p_user_id::text));
    if exists (select 1 from public.post_hearts where post_id = p_post_id and user_id = p_user_id) then
        delete from public.post_hearts where post_id = p_post_id and user_id = p_user_id;
    else
        insert into public.post_hearts (post_id, user_id) values (p_post_id, p_user_id);
    end if;
end;
$$;

create or replace function public.report_post(p_post_id uuid, p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
    insert into public.post_reports (post_id, user_id)
    values (p_post_id, p_user_id)
    on conflict (post_id, user_id) do nothing;
$$;

revoke all on function public.toggle_post_heart(uuid, uuid) from public, anon, authenticated;
revoke all on function public.report_post(uuid, uuid) from public, anon, authenticated;
grant execute on function public.toggle_post_heart(uuid, uuid) to service_role;
grant execute on function public.report_post(uuid, uuid) to service_role;
