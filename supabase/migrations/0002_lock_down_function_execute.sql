-- Trigger functions: nobody calls these directly.
revoke execute on function public.handle_new_user(), public.only_teachers_create() from public, anon, authenticated;
-- RLS helpers: signed-in users only (needed while evaluating policies).
revoke execute on function public.is_class_member(uuid), public.is_class_teacher(uuid), public.shares_class(uuid), public.my_role() from public, anon;
grant execute on function public.is_class_member(uuid), public.is_class_teacher(uuid), public.shares_class(uuid), public.my_role() to authenticated;
