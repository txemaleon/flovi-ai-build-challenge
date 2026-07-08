grant usage on schema public to authenticated;

grant usage on type public.relocation_request_status to authenticated;

grant select, insert, update
  on table public.relocation_requests
  to authenticated;
