alter type public.relocation_request_status add value if not exists 'booked';

alter table public.relocation_requests
  add column if not exists driver_id uuid references auth.users(id) on delete set null;
