-- OneInTwo: one account (this project's auth) used by LearnKyrgyz, Quoldek and Kadam.
-- Each app keeps its own small blobs here — Quoldek's quizzes, Kadam's stars — so they
-- follow the person to any device. Every row belongs to one user and only they can see it.
create table public.app_data (
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  app        text not null check (app in ('quoldek', 'kadam', 'akylduukodo', 'oneintwo')),
  key        text not null check (char_length(key) between 1 and 64),
  data       jsonb not null default '{}'::jsonb check (octet_length(data::text) <= 2000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, app, key)
);
alter table public.app_data enable row level security;
create policy "app_data: own rows" on public.app_data for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create trigger app_data_touch before update on public.app_data
  for each row execute function public.touch_updated_at();
