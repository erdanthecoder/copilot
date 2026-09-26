-- LearnKyrgyz — initial schema
-- Roles: every auth user gets a profile that is either 'student' or 'teacher'.

create extension if not exists pgcrypto;

-- ───────────────────────── profiles ─────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'student' check (role in ('student','teacher')),
  full_name    text not null default '' check (char_length(full_name) <= 80),
  avatar_color text not null default '#58cc02',
  xp           int  not null default 0 check (xp >= 0),
  streak       int  not null default 0 check (streak >= 0),
  last_active  date,
  learn_from   text not null default 'en' check (learn_from in ('en','ru')),
  hearts       int  not null default 5 check (hearts between 0 and 5),
  progress     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ───────────────────────── classrooms ─────────────────────────
create or replace function public.gen_join_code() returns text
language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random()*32)::int, 1), '')
  from generate_series(1,6);
$$;

create table public.classrooms (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  name        text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  join_code   text not null unique default public.gen_join_code(),
  color       text not null default '#1cb0f6',
  created_at  timestamptz not null default now()
);
create index on public.classrooms(teacher_id);

create table public.classroom_members (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (classroom_id, student_id)
);
create index on public.classroom_members(student_id);

create table public.classroom_invites (
  id           uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at   timestamptz not null default now(),
  unique (classroom_id, email)
);
create index on public.classroom_invites(lower(email));

-- ───────────────────────── homework & submissions ─────────────────────────
create table public.homework (
  id              uuid primary key default gen_random_uuid(),
  classroom_id    uuid not null references public.classrooms(id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 120),
  instructions    text not null default '' check (char_length(instructions) <= 2000),
  topic_ids       text[] not null default '{}',
  writing_prompts jsonb not null default '[]'::jsonb,
  question_count  int not null default 12 check (question_count between 4 and 40),
  due_at          timestamptz not null,
  created_at      timestamptz not null default now()
);
create index on public.homework(classroom_id);

create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  homework_id     uuid not null references public.homework(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  correct         int not null check (correct >= 0),
  total           int not null check (total > 0),
  score           numeric(5,2) generated always as (round(100.0 * least(correct, total) / total, 2)) stored,
  answers         jsonb not null default '[]'::jsonb,
  writing         jsonb not null default '[]'::jsonb,
  grade           int,
  teacher_grade   int check (teacher_grade between 2 and 5),
  teacher_comment text not null default '' check (char_length(teacher_comment) <= 1000),
  submitted_at    timestamptz not null default now(),
  unique (homework_id, student_id)
);
create index on public.submissions(student_id);

-- Russian 5-point scale, computed on the server.
create or replace function public.compute_grade() returns trigger
language plpgsql set search_path = '' as $$
declare pct numeric := 100.0 * least(new.correct, new.total) / new.total;
begin
  new.grade := case when pct >= 90 then 5 when pct >= 75 then 4 when pct >= 50 then 3 else 2 end;
  return new;
end $$;
create trigger submissions_grade before insert or update of correct, total on public.submissions
  for each row execute function public.compute_grade();

-- ───────────────────────── presentations & meetings ─────────────────────────
create table public.presentations (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  classroom_id uuid references public.classrooms(id) on delete set null,
  title        text not null check (char_length(title) between 1 and 120),
  slides       jsonb not null default '[]'::jsonb,
  shared       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.presentations(teacher_id);
create index on public.presentations(classroom_id);

create table public.meetings (
  id           uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id   uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title        text not null default 'Live lesson' check (char_length(title) <= 120),
  kind         text not null default 'video' check (kind in ('video','voice')),
  status       text not null default 'live' check (status in ('live','ended')),
  started_at   timestamptz not null default now(),
  ended_at     timestamptz
);
create index on public.meetings(classroom_id);
create index on public.meetings(teacher_id);

create table public.vocab_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  word_id     text not null check (char_length(word_id) <= 120),
  note        text not null default '' check (char_length(note) <= 1000),
  created_at  timestamptz not null default now()
);
create index on public.vocab_reports(reporter_id);

-- ───────────────────────── helper functions ─────────────────────────
create or replace function public.is_class_teacher(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classrooms c where c.id = cid and c.teacher_id = (select auth.uid()));
$$;

create or replace function public.is_class_member(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classroom_members m where m.classroom_id = cid and m.student_id = (select auth.uid()))
      or exists (select 1 from public.classrooms c where c.id = cid and c.teacher_id = (select auth.uid()));
$$;

create or replace function public.shares_class(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classrooms c
    left join public.classroom_members m on m.classroom_id = c.id
    where (c.teacher_id = (select auth.uid()) and m.student_id = other)
       or (m.student_id = (select auth.uid()) and (c.teacher_id = other
            or exists (select 1 from public.classroom_members m2 where m2.classroom_id = c.id and m2.student_id = other)))
  );
$$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- ───────────────────────── triggers ─────────────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role, full_name, learn_from)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'teacher' then 'teacher' else 'student' end,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)), 80),
    case when new.raw_user_meta_data->>'learn_from' = 'ru' then 'ru' else 'en' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.lock_role() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role then raise exception 'Role cannot be changed'; end if;
  return new;
end $$;
create trigger profiles_lock_role before update on public.profiles
  for each row execute function public.lock_role();

create or replace function public.only_teachers_create() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select role from public.profiles where id = (select auth.uid())) is distinct from 'teacher' then
    raise exception 'Only teachers can do this';
  end if;
  return new;
end $$;
create trigger classrooms_teacher_only before insert on public.classrooms
  for each row execute function public.only_teachers_create();
create trigger presentations_teacher_only before insert on public.presentations
  for each row execute function public.only_teachers_create();

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger presentations_touch before update on public.presentations
  for each row execute function public.touch_updated_at();

-- ───────────────────────── RPCs ─────────────────────────
create or replace function public.classroom_preview(code text)
returns table (id uuid, name text, description text, teacher_name text, color text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.name, c.description, p.full_name, c.color
  from public.classrooms c join public.profiles p on p.id = c.teacher_id
  where c.join_code = upper(trim(code));
$$;

create or replace function public.join_classroom(code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
  if (select auth.uid()) is null then raise exception 'Not signed in'; end if;
  if (select role from public.profiles where id = (select auth.uid())) <> 'student' then
    raise exception 'Only students can join a classroom';
  end if;
  select id into cid from public.classrooms where join_code = upper(trim(code));
  if cid is null then raise exception 'No classroom has that code'; end if;
  insert into public.classroom_members (classroom_id, student_id) values (cid, (select auth.uid()))
    on conflict do nothing;
  return cid;
end $$;

create or replace function public.accept_invite(invite_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
  if (select role from public.profiles where id = (select auth.uid())) <> 'student' then
    raise exception 'Only students can join a classroom';
  end if;
  select classroom_id into cid from public.classroom_invites
    where id = invite_id and lower(email) = lower((select auth.jwt())->>'email');
  if cid is null then raise exception 'Invite not found'; end if;
  insert into public.classroom_members (classroom_id, student_id) values (cid, (select auth.uid()))
    on conflict do nothing;
  delete from public.classroom_invites where id = invite_id;
  return cid;
end $$;

revoke execute on function public.join_classroom(text), public.accept_invite(uuid), public.classroom_preview(text) from public, anon;
grant execute on function public.join_classroom(text), public.accept_invite(uuid), public.classroom_preview(text) to authenticated;

-- ───────────────────────── RLS ─────────────────────────
alter table public.profiles          enable row level security;
alter table public.classrooms        enable row level security;
alter table public.classroom_members enable row level security;
alter table public.classroom_invites enable row level security;
alter table public.homework          enable row level security;
alter table public.submissions       enable row level security;
alter table public.presentations     enable row level security;
alter table public.meetings          enable row level security;
alter table public.vocab_reports     enable row level security;

create policy "profiles: read self or classmates" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_class(id));
create policy "profiles: update self" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "classrooms: members read" on public.classrooms for select to authenticated
  using (teacher_id = (select auth.uid()) or public.is_class_member(id));
create policy "classrooms: teacher insert" on public.classrooms for insert to authenticated
  with check (teacher_id = (select auth.uid()));
create policy "classrooms: teacher update" on public.classrooms for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "classrooms: teacher delete" on public.classrooms for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "members: read class" on public.classroom_members for select to authenticated
  using (public.is_class_member(classroom_id));
create policy "members: leave or remove" on public.classroom_members for delete to authenticated
  using (student_id = (select auth.uid()) or public.is_class_teacher(classroom_id));

create policy "invites: teacher or invitee read" on public.classroom_invites for select to authenticated
  using (public.is_class_teacher(classroom_id) or lower(email) = lower((select auth.jwt())->>'email'));
create policy "invites: teacher insert" on public.classroom_invites for insert to authenticated
  with check (public.is_class_teacher(classroom_id));
create policy "invites: teacher or invitee delete" on public.classroom_invites for delete to authenticated
  using (public.is_class_teacher(classroom_id) or lower(email) = lower((select auth.jwt())->>'email'));

create policy "homework: members read" on public.homework for select to authenticated
  using (public.is_class_member(classroom_id));
create policy "homework: teacher insert" on public.homework for insert to authenticated
  with check (public.is_class_teacher(classroom_id));
create policy "homework: teacher update" on public.homework for update to authenticated
  using (public.is_class_teacher(classroom_id)) with check (public.is_class_teacher(classroom_id));
create policy "homework: teacher delete" on public.homework for delete to authenticated
  using (public.is_class_teacher(classroom_id));

create policy "submissions: own or teacher read" on public.submissions for select to authenticated
  using (student_id = (select auth.uid())
      or exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));
create policy "submissions: student submits before due" on public.submissions for insert to authenticated
  with check (student_id = (select auth.uid())
      and exists (select 1 from public.homework h
                  join public.classroom_members m on m.classroom_id = h.classroom_id and m.student_id = (select auth.uid())
                  where h.id = homework_id and now() <= h.due_at));
create policy "submissions: teacher grades" on public.submissions for update to authenticated
  using (exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));
-- Teachers may only change their own grade/comment columns.
revoke update on public.submissions from authenticated, anon;
grant update (teacher_grade, teacher_comment) on public.submissions to authenticated;

create policy "presentations: teacher or shared read" on public.presentations for select to authenticated
  using (teacher_id = (select auth.uid()) or (shared and classroom_id is not null and public.is_class_member(classroom_id)));
create policy "presentations: teacher insert" on public.presentations for insert to authenticated
  with check (teacher_id = (select auth.uid()) and (classroom_id is null or public.is_class_teacher(classroom_id)));
create policy "presentations: teacher update" on public.presentations for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()) and (classroom_id is null or public.is_class_teacher(classroom_id)));
create policy "presentations: teacher delete" on public.presentations for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "meetings: members read" on public.meetings for select to authenticated
  using (public.is_class_member(classroom_id));
create policy "meetings: teacher insert" on public.meetings for insert to authenticated
  with check (teacher_id = (select auth.uid()) and public.is_class_teacher(classroom_id));
create policy "meetings: teacher update" on public.meetings for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "meetings: teacher delete" on public.meetings for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "reports: insert own" on public.vocab_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "reports: read own" on public.vocab_reports for select to authenticated
  using (reporter_id = (select auth.uid()));

-- ───────────────────────── Realtime ─────────────────────────
-- Private broadcast/presence topics look like  class:<classroom uuid>:<anything>
create or replace function public.topic_class_id(t text) returns uuid
language sql immutable set search_path = '' as $$
  select case when t ~ '^class:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(:.*)?$'
              then substring(t from 7 for 36)::uuid end;
$$;

create policy "class members receive" on realtime.messages for select to authenticated
  using (public.is_class_member(public.topic_class_id((select realtime.topic()))));
create policy "class members send" on realtime.messages for insert to authenticated
  with check (public.is_class_member(public.topic_class_id((select realtime.topic()))));

alter publication supabase_realtime add table public.meetings, public.homework, public.presentations;
