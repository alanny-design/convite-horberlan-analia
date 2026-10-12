-- Galeria de fotos do casamento (rota /fotos)
-- Bucket público
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos',
  'fotos',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Enviar fotos (sem sobrescrever: o site gera nomes únicos e não usa upsert)
drop policy if exists "fotos: enviar" on storage.objects;
create policy "fotos: enviar"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'fotos');

-- Listar as fotos na galeria
drop policy if exists "fotos: listar" on storage.objects;
create policy "fotos: listar"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos');
