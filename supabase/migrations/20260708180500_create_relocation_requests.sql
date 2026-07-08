create type public.relocation_request_status as enum ('available');

create table public.relocation_requests (
  id uuid primary key default gen_random_uuid(),
  dispatcher_id uuid not null references auth.users(id) on delete cascade,
  origin text not null check (length(trim(origin)) > 0),
  destination text not null check (length(trim(destination)) > 0),
  scheduled_at timestamptz not null,
  notes text not null default '',
  status public.relocation_request_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.relocation_requests enable row level security;

create policy "authenticated users can list relocation requests"
  on public.relocation_requests
  for select
  to authenticated
  using (true);

create policy "dispatchers can create their relocation requests"
  on public.relocation_requests
  for insert
  to authenticated
  with check (dispatcher_id = auth.uid());

create policy "dispatchers can update their relocation requests"
  on public.relocation_requests
  for update
  to authenticated
  using (dispatcher_id = auth.uid())
  with check (dispatcher_id = auth.uid());
