-- Ebooks table
create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  title_es text,
  description text not null default '',
  description_en text,
  description_es text,
  slug text not null unique,
  cover_image_url text,
  file_url text not null,
  requires_contact boolean not null default false,
  show_on_homepage boolean not null default false,
  is_published boolean not null default false,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ebooks enable row level security;

create policy "Anyone can read published ebooks"
  on public.ebooks for select
  using (is_published = true);

create policy "Admins can read all ebooks"
  on public.ebooks for select
  using (public.is_admin(auth.uid()));

create policy "Admins can insert ebooks"
  on public.ebooks for insert
  with check (public.is_admin(auth.uid()));

create policy "Admins can update ebooks"
  on public.ebooks for update
  using (public.is_admin(auth.uid()));

create policy "Admins can delete ebooks"
  on public.ebooks for delete
  using (public.is_admin(auth.uid()));

-- Ebook leads table
create table public.ebook_leads (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

alter table public.ebook_leads enable row level security;

-- Anyone can insert a lead (public form submission)
create policy "Anyone can submit ebook lead"
  on public.ebook_leads for insert
  with check (true);

create policy "Admins can read ebook leads"
  on public.ebook_leads for select
  using (public.is_admin(auth.uid()));

create policy "Admins can delete ebook leads"
  on public.ebook_leads for delete
  using (public.is_admin(auth.uid()));

-- Function to increment download count (callable by anyone)
create or replace function public.increment_download_count(ebook_id uuid)
returns void
language sql
security definer
as $$
  update public.ebooks set download_count = download_count + 1 where id = ebook_id;
$$;

-- Ebook files storage bucket
insert into storage.buckets (id, name, public)
values ('ebook-files', 'ebook-files', true)
on conflict (id) do nothing;

create policy "Anyone can view ebook files"
  on storage.objects for select
  using (bucket_id = 'ebook-files');

create policy "Admins can upload ebook files"
  on storage.objects for insert
  with check (bucket_id = 'ebook-files' AND public.is_admin(auth.uid()));

create policy "Admins can update ebook files"
  on storage.objects for update
  using (bucket_id = 'ebook-files' AND public.is_admin(auth.uid()));

create policy "Admins can delete ebook files"
  on storage.objects for delete
  using (bucket_id = 'ebook-files' AND public.is_admin(auth.uid()));

-- Index
create index idx_ebooks_slug on public.ebooks(slug);
create index idx_ebook_leads_ebook_id on public.ebook_leads(ebook_id);
