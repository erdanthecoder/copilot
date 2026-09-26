-- Difficulty 0 (easy) .. 2 (hard) controls how much typing a homework uses.
alter table public.homework add column difficulty int not null default 1 check (difficulty between 0 and 2);
