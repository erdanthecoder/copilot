-- Teacher-written question sets that can be attached to homework.
create table public.question_sets (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title       text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  questions   jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) <= 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.question_sets(teacher_id);

alter table public.homework add column set_ids uuid[] not null default '{}';
alter table public.homework drop constraint homework_question_count_check;
alter table public.homework add constraint homework_question_count_check check (question_count between 0 and 60);

create trigger question_sets_teacher_only before insert on public.question_sets
  for each row execute function public.only_teachers_create();
create trigger question_sets_touch before update on public.question_sets
  for each row execute function public.touch_updated_at();

alter table public.question_sets enable row level security;

create policy "sets: owner or assigned student read" on public.question_sets for select to authenticated
  using (teacher_id = (select auth.uid())
    or exists (select 1 from public.homework h
               join public.classroom_members m on m.classroom_id = h.classroom_id and m.student_id = (select auth.uid())
               where question_sets.id = any(h.set_ids)));
create policy "sets: owner insert" on public.question_sets for insert to authenticated
  with check (teacher_id = (select auth.uid()));
create policy "sets: owner update" on public.question_sets for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "sets: owner delete" on public.question_sets for delete to authenticated
  using (teacher_id = (select auth.uid()));
