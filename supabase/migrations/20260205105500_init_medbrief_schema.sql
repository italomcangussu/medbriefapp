-- MedBrief initial schema

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('user', 'admin');
create type public.user_status as enum ('active', 'blocked');
create type public.log_status as enum ('success', 'error', 'warning');
create type public.input_type as enum ('file', 'text');
create type public.summary_status as enum ('pending', 'processing', 'completed', 'failed');
create type public.server_status as enum ('online', 'maintenance', 'offline');

-- Utility function to maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (app users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Settings (single row)
create table if not exists public.app_settings (
  id smallint primary key default 1,
  webhook_url text,
  admin_webhook_url text,
  server_status public.server_status not null default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute procedure public.set_updated_at();

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

-- Documents (optional storage metadata)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);

-- Summaries
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  input_type public.input_type not null,
  input_text text,
  document_id uuid references public.documents(id) on delete set null,
  file_name text,
  mime_type text,
  summary_text text,
  status public.summary_status not null default 'pending',
  error_message text,
  processing_time_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_summaries_updated_at
before update on public.summaries
for each row execute procedure public.set_updated_at();

create index if not exists summaries_user_id_idx on public.summaries(user_id);
create index if not exists summaries_created_at_idx on public.summaries(created_at);

-- System logs
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details text,
  status public.log_status not null default 'success',
  created_at timestamptz not null default now()
);

create index if not exists system_logs_created_at_idx on public.system_logs(created_at);

-- Admin actions (audit)
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_actions_created_at_idx on public.admin_actions(created_at);

-- Admin stats view
create or replace view public.admin_dashboard_stats as
select
  (select count(*) from public.summaries) as total_summaries,
  (select count(*) from public.profiles where status = 'active') as active_users,
  (select coalesce(avg(processing_time_ms), 0)::numeric(10,2) from public.summaries where processing_time_ms is not null) as avg_processing_time_ms,
  (select server_status from public.app_settings where id = 1) as server_status;

-- Helper: check admin
create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = p_user_id and p.role = 'admin' and p.status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.is_admin(auth.uid());
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, accepted_terms_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'accepted_terms_at', '')::timestamptz
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.documents enable row level security;
alter table public.summaries enable row level security;
alter table public.system_logs enable row level security;
alter table public.admin_actions enable row level security;

-- Profiles policies
create policy profiles_select_own_or_admin
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy profiles_insert_self
  on public.profiles for insert
  with check (id = auth.uid());

create policy profiles_update_self
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_update
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- App settings policies (admin only)
create policy app_settings_admin_select
  on public.app_settings for select
  using (public.is_admin());

create policy app_settings_admin_update
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy app_settings_admin_insert
  on public.app_settings for insert
  with check (public.is_admin());

-- Documents policies
create policy documents_select_own_or_admin
  on public.documents for select
  using (user_id = auth.uid() or public.is_admin());

create policy documents_insert_own
  on public.documents for insert
  with check (user_id = auth.uid());

create policy documents_update_own_or_admin
  on public.documents for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy documents_delete_own_or_admin
  on public.documents for delete
  using (user_id = auth.uid() or public.is_admin());

-- Summaries policies
create policy summaries_select_own_or_admin
  on public.summaries for select
  using (user_id = auth.uid() or public.is_admin());

create policy summaries_insert_own
  on public.summaries for insert
  with check (user_id = auth.uid());

create policy summaries_update_own_or_admin
  on public.summaries for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy summaries_delete_own_or_admin
  on public.summaries for delete
  using (user_id = auth.uid() or public.is_admin());

-- System logs policies
create policy system_logs_admin_select
  on public.system_logs for select
  using (public.is_admin());

create policy system_logs_insert_authenticated
  on public.system_logs for insert
  with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

-- Admin actions policies
create policy admin_actions_admin_select
  on public.admin_actions for select
  using (public.is_admin());

create policy admin_actions_admin_insert
  on public.admin_actions for insert
  with check (public.is_admin());

-- Storage bucket for documents (optional)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies (bucket: documents)
create policy storage_documents_read_own_or_admin
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or (auth.uid()::text = (storage.objects.metadata->>'user_id'))
    )
  );

create policy storage_documents_write_own
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.objects.metadata->>'user_id')
  );

create policy storage_documents_update_own_or_admin
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.objects.metadata->>'user_id')
    )
  )
  with check (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.objects.metadata->>'user_id')
    )
  );

create policy storage_documents_delete_own_or_admin
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.objects.metadata->>'user_id')
    )
  );
