-- Sealed exams: students never receive the answers. The teacher's app writes a set of
-- exam papers (questions + answer key) when the exam is assigned; students only get the
-- questions of their own paper through exam_start(), answers are saved one by one with
-- exam_answer() and the server marks them in exam_finish(). Optional full-screen mode:
-- leaving full screen (or the exam page) ends the exam with a 0.
create extension if not exists fuzzystrmatch with schema extensions;

alter table public.homework add column fullscreen boolean not null default false;
alter table public.submissions add column flag text check (flag in ('left_fullscreen', 'left_exam'));

create or replace function public.compute_grade() returns trigger
language plpgsql set search_path = '' as $$
declare pct numeric := 100.0 * least(new.correct, new.total) / new.total;
begin
  if new.flag is not null then new.grade := 0; return new; end if;
  new.grade := case when pct >= 90 then 5 when pct >= 75 then 4 when pct >= 50 then 3 else 2 end;
  return new;
end $$;

create table public.exam_papers (
  homework_id uuid not null references public.homework(id) on delete cascade,
  variant     int  not null check (variant between 0 and 199),
  questions   jsonb not null check (jsonb_typeof(questions) = 'array'),
  answer_key  jsonb not null check (jsonb_typeof(answer_key) = 'array'),
  created_at  timestamptz not null default now(),
  primary key (homework_id, variant)
);

create table public.exam_attempts (
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  variant     int  not null,
  started_at  timestamptz not null default now(),
  responses   jsonb not null default '{}'::jsonb,
  finished_at timestamptz,
  result      jsonb,
  primary key (homework_id, student_id)
);
create index on public.exam_attempts(student_id);

alter table public.exam_papers   enable row level security;
alter table public.exam_attempts enable row level security;

-- Papers and attempts are visible to the class teacher only. Students go through the functions below.
create policy "papers: teacher read" on public.exam_papers for select to authenticated
  using (exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));
create policy "papers: teacher insert" on public.exam_papers for insert to authenticated
  with check (exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));
create policy "papers: teacher delete" on public.exam_papers for delete to authenticated
  using (exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));
create policy "attempts: teacher read" on public.exam_attempts for select to authenticated
  using (exists (select 1 from public.homework h where h.id = homework_id and public.is_class_teacher(h.classroom_id)));

-- Exam submissions can only be created by exam_finish().
drop policy "submissions: student submits before due" on public.submissions;
create policy "submissions: student submits before due" on public.submissions for insert to authenticated
  with check (student_id = (select auth.uid()) and flag is null
      and exists (select 1 from public.homework h
                  join public.classroom_members m on m.classroom_id = h.classroom_id and m.student_id = (select auth.uid())
                  where h.id = homework_id and h.kind = 'homework' and now() <= h.due_at));

-- Teacher question sets used in an exam are not readable by students.
drop policy "sets: owner or assigned student read" on public.question_sets;
create policy "sets: owner or assigned student read" on public.question_sets for select to authenticated
  using (teacher_id = (select auth.uid())
    or exists (select 1 from public.homework h
               join public.classroom_members m on m.classroom_id = h.classroom_id and m.student_id = (select auth.uid())
               where question_sets.id = any(h.set_ids) and h.kind = 'homework'));

-- Same normalisation as normalize() in assets/js/engine.js.
create or replace function public.lk_norm(s text) returns text
language sql immutable set search_path = '' as $$
  select btrim(regexp_replace(regexp_replace(
    translate(lower(coalesce(s, '')), 'ЁҢӨҮАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯё’`', 'еңөүабвгдежзийклмнопрстуфхцчшщъыьэюяе'''''),
    '[.,!?;:«»"“”—–()-]', ' ', 'g'), '\s+', ' ', 'g'));
$$;

-- One question: key {c: index} for choices, {a: [normalised answers], typed: bool} for text.
create or replace function public.exam_grade_one(k jsonb, r jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare n text; a text; tol int; fa text; fn text;
begin
  if r is null or k is null then return false; end if;
  if k ? 'c' then
    return coalesce(r->>'c', '') ~ '^[0-9]{1,3}$' and (r->>'c')::int = (k->>'c')::int;
  end if;
  n := left(public.lk_norm(r->>'g'), 250);
  if n = '' then return false; end if;
  for a in select left(x, 250) from jsonb_array_elements_text(coalesce(k->'a', '[]'::jsonb)) x loop
    if a = n then return true; end if;
    if coalesce((k->>'typed')::boolean, false) then
      fa := translate(a, 'ңөү', 'ноу'); fn := translate(n, 'ңөү', 'ноу');
      if fa = fn then return true; end if;
      tol := case when length(a) > 12 then 2 when length(a) > 4 then 1 else 0 end;
      if tol > 0 and (extensions.levenshtein(a, n) <= tol or extensions.levenshtein(fa, fn) <= tol) then return true; end if;
    end if;
  end loop;
  return false;
end $$;

-- Marks an attempt and writes the submission (internal).
create or replace function public.exam_finalize(hw uuid, sid uuid, reason text) returns public.submissions
language plpgsql security definer set search_path = '' as $$
declare att public.exam_attempts; pap public.exam_papers; sub public.submissions;
        n int; i int; ok boolean; right_n int := 0; detail jsonb := '[]'::jsonb; q jsonb;
begin
  select * into att from public.exam_attempts where homework_id = hw and student_id = sid for update;
  if not found then raise exception 'no_attempt'; end if;
  select * into sub from public.submissions where homework_id = hw and student_id = sid;
  if found then return sub; end if;
  select * into pap from public.exam_papers where homework_id = hw and variant = att.variant;
  n := coalesce(jsonb_array_length(pap.answer_key), 0);
  for i in 0 .. n - 1 loop
    q := pap.questions -> i;
    ok := reason is null and public.exam_grade_one(pap.answer_key -> i, att.responses -> (i::text));
    if ok then right_n := right_n + 1; end if;
    detail := detail || jsonb_build_array(jsonb_build_object(
      'ok', ok, 'type', q->>'type',
      'prompt', coalesce(q->>'prompt', concat_ws(' ___ ', q->>'before', q->>'after')),
      'given', coalesce(att.responses -> (i::text) ->> 'g', ''),
      'solution', pap.answer_key -> i ->> 's'));
  end loop;
  update public.exam_attempts set finished_at = now(), result = detail where homework_id = hw and student_id = sid;
  insert into public.submissions (homework_id, student_id, correct, total, answers, flag)
    values (hw, sid, right_n, greatest(n, 1), '[]'::jsonb, reason) returning * into sub;
  return sub;
end $$;

create or replace function public.exam_seconds_left(h public.homework, att public.exam_attempts) returns int
language sql stable set search_path = '' as $$
  select coalesce(h.time_limit_minutes, 240) * 60 - floor(extract(epoch from now() - att.started_at))::int;
$$;

-- Start (or, for normal exams, resume) an exam. Returns only the questions.
create or replace function public.exam_start(hw uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); h public.homework; att public.exam_attempts; pap public.exam_papers;
        nv int; v int; sub public.submissions;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  select * into h from public.homework where id = hw;
  if not found or h.kind <> 'exam' then raise exception 'not_an_exam'; end if;
  if not exists (select 1 from public.classroom_members where classroom_id = h.classroom_id and student_id = me) then raise exception 'not_in_class'; end if;
  select * into sub from public.submissions where homework_id = hw and student_id = me;
  if found then return jsonb_build_object('status', 'submitted', 'grade', sub.grade, 'correct', sub.correct, 'total', sub.total, 'flag', sub.flag); end if;
  select * into att from public.exam_attempts where homework_id = hw and student_id = me;
  if found then
    -- Coming back to a full-screen exam means the student left it.
    if h.fullscreen then
      sub := public.exam_finalize(hw, me, 'left_exam');
      return jsonb_build_object('status', 'ended', 'grade', sub.grade, 'correct', sub.correct, 'total', sub.total, 'flag', sub.flag);
    end if;
    if public.exam_seconds_left(h, att) <= 0 then
      sub := public.exam_finalize(hw, me, null);
      return jsonb_build_object('status', 'ended', 'grade', sub.grade, 'correct', sub.correct, 'total', sub.total, 'flag', sub.flag);
    end if;
  else
    if now() > h.due_at then raise exception 'past_due'; end if;
    select count(*) into nv from public.exam_papers where homework_id = hw;
    if nv = 0 then raise exception 'exam_not_ready'; end if;
    select count(*) into v from public.exam_attempts where homework_id = hw;
    insert into public.exam_attempts (homework_id, student_id, variant) values (hw, me, v % nv)
      on conflict do nothing;
    select * into att from public.exam_attempts where homework_id = hw and student_id = me;
  end if;
  select * into pap from public.exam_papers where homework_id = hw and variant = att.variant;
  return jsonb_build_object('status', 'ok', 'questions', pap.questions,
    'answered', (select coalesce(jsonb_agg(k::int), '[]'::jsonb) from jsonb_object_keys(att.responses) k),
    'seconds_left', greatest(0, public.exam_seconds_left(h, att)), 'fullscreen', h.fullscreen);
end $$;

-- Save one answer: {c: option index, g: text shown} or {g: text}.
create or replace function public.exam_answer(hw uuid, idx int, resp jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); h public.homework; att public.exam_attempts; n int;
begin
  select * into h from public.homework where id = hw;
  select * into att from public.exam_attempts where homework_id = hw and student_id = me for update;
  if not found then raise exception 'no_attempt'; end if;
  if att.finished_at is not null or exists (select 1 from public.submissions where homework_id = hw and student_id = me) then raise exception 'already_submitted'; end if;
  if public.exam_seconds_left(h, att) + 30 <= 0 then raise exception 'time_up'; end if;
  select jsonb_array_length(questions) into n from public.exam_papers where homework_id = hw and variant = att.variant;
  if idx is null or idx < 0 or idx >= n then raise exception 'bad_question'; end if;
  if resp is null or jsonb_typeof(resp) <> 'object' or length(resp::text) > 2000 then raise exception 'bad_answer'; end if;
  update public.exam_attempts set responses = responses || jsonb_build_object(idx::text, jsonb_build_object('c', resp->'c', 'g', left(resp->>'g', 1000)))
    where homework_id = hw and student_id = me;
end $$;

-- Hand in. reason: null (normal), 'left_fullscreen' or 'left_exam' (grade 0).
create or replace function public.exam_finish(hw uuid, reason text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); sub public.submissions;
begin
  if reason is not null and reason not in ('left_fullscreen', 'left_exam') then raise exception 'bad_reason'; end if;
  if not exists (select 1 from public.exam_attempts where homework_id = hw and student_id = me) then raise exception 'no_attempt'; end if;
  sub := public.exam_finalize(hw, me, reason);
  return jsonb_build_object('status', 'submitted', 'grade', sub.grade, 'correct', sub.correct, 'total', sub.total, 'flag', sub.flag);
end $$;

-- Teacher: close attempts whose time has run out (the student closed the page).
create or replace function public.exam_close_expired(hw uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare h public.homework; att public.exam_attempts; n int := 0;
begin
  select * into h from public.homework where id = hw;
  if not found or not public.is_class_teacher(h.classroom_id) then raise exception 'not_allowed'; end if;
  for att in select a.* from public.exam_attempts a where a.homework_id = hw and a.finished_at is null
      and not exists (select 1 from public.submissions s where s.homework_id = hw and s.student_id = a.student_id) loop
    if public.exam_seconds_left(h, att) + 30 <= 0 then
      perform public.exam_finalize(hw, att.student_id, case when h.fullscreen then 'left_exam' end);
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

-- Teacher: let a student take the exam again (removes their attempt and grade).
create or replace function public.exam_reset(hw uuid, sid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare h public.homework;
begin
  select * into h from public.homework where id = hw;
  if not found or not public.is_class_teacher(h.classroom_id) then raise exception 'not_allowed'; end if;
  delete from public.submissions where homework_id = hw and student_id = sid;
  delete from public.exam_attempts where homework_id = hw and student_id = sid;
end $$;

revoke execute on function public.exam_finalize(uuid, uuid, text), public.exam_grade_one(jsonb, jsonb),
  public.exam_seconds_left(public.homework, public.exam_attempts) from public, anon, authenticated;
revoke execute on function public.exam_start(uuid), public.exam_answer(uuid, int, jsonb), public.exam_finish(uuid, text),
  public.exam_close_expired(uuid), public.exam_reset(uuid, uuid) from public, anon;
grant execute on function public.exam_start(uuid), public.exam_answer(uuid, int, jsonb), public.exam_finish(uuid, text),
  public.exam_close_expired(uuid), public.exam_reset(uuid, uuid) to authenticated;
