create table if not exists public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  room text not null check (room in ('tech', 'service', 'cv', 'new')),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null check (char_length(btrim(text)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists circle_messages_room_created_at_idx
  on public.circle_messages (room, created_at);

create table if not exists public.circle_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.circle_messages (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 1 and 300),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

alter table public.circle_messages enable row level security;
alter table public.circle_reports enable row level security;

drop policy if exists "Signed-in members can read Circle messages" on public.circle_messages;
create policy "Signed-in members can read Circle messages"
  on public.circle_messages for select to authenticated using (true);

drop policy if exists "Members can post as themselves" on public.circle_messages;
create policy "Members can post as themselves"
  on public.circle_messages for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Members can report messages" on public.circle_reports;
create policy "Members can report messages"
  on public.circle_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));

revoke all on public.circle_messages from anon, authenticated;
grant select, insert on public.circle_messages to authenticated;
revoke all on public.circle_reports from anon, authenticated;
grant insert on public.circle_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'circle_messages'
  ) then
    alter publication supabase_realtime add table public.circle_messages;
  end if;
end
$$;
