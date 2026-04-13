-- Create site_content table for editable site sections
create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  lang text not null default 'pt',
  value jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint site_content_section_lang_key unique (section, lang)
);

alter table public.site_content enable row level security;

create policy "Anyone can read site_content"
  on public.site_content for select
  using (true);

create policy "Admins can insert site_content"
  on public.site_content for insert
  with check (public.is_admin(auth.uid()));

create policy "Admins can update site_content"
  on public.site_content for update
  using (public.is_admin(auth.uid()));

create policy "Admins can delete site_content"
  on public.site_content for delete
  using (public.is_admin(auth.uid()));

-- Create site_images table for editable site images
create table public.site_images (
  id uuid primary key default gen_random_uuid(),
  image_key text not null unique,
  storage_path text not null,
  public_url text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_images enable row level security;

create policy "Anyone can read site_images"
  on public.site_images for select
  using (true);

create policy "Admins can manage site_images"
  on public.site_images for all
  using (public.is_admin(auth.uid()));

-- Create index for fast lookups
create index idx_site_content_section_lang on public.site_content(section, lang);

-- Create site-images storage bucket
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Anyone can view site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "Admins can upload site images"
  on storage.objects for insert
  with check (bucket_id = 'site-images' AND public.is_admin(auth.uid()));

create policy "Admins can update site images"
  on storage.objects for update
  using (bucket_id = 'site-images' AND public.is_admin(auth.uid()));

create policy "Admins can delete site images"
  on storage.objects for delete
  using (bucket_id = 'site-images' AND public.is_admin(auth.uid()));
