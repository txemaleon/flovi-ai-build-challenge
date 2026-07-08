create policy "drivers can book available relocation requests"
  on public.relocation_requests
  for update
  to authenticated
  using (status = 'available')
  with check (status = 'booked' and driver_id = auth.uid());
