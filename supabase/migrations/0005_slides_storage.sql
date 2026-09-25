-- Public bucket for uploaded PowerPoint files (and slide images). Files are
-- stored as <teacher uid>/<name>; only that teacher can write or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slides', 'slides', true, 52428800, array[
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

create policy "slides: teachers upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'slides' and (storage.foldername(name))[1] = (select auth.uid())::text and public.my_role() = 'teacher');
create policy "slides: owners update" on storage.objects for update to authenticated
  using (bucket_id = 'slides' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "slides: owners delete" on storage.objects for delete to authenticated
  using (bucket_id = 'slides' and (storage.foldername(name))[1] = (select auth.uid())::text);
