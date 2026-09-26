-- Exams: homework rows can be marked as an exam, optionally with a time limit.
alter table public.homework add column kind text not null default 'homework' check (kind in ('homework', 'exam'));
alter table public.homework add column time_limit_minutes int check (time_limit_minutes is null or time_limit_minutes between 1 and 240);
