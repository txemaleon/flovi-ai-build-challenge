create policy "drivers can complete their booked relocation requests"
  on public.relocation_requests
  for update
  to authenticated
  using (status = 'booked' and driver_id = auth.uid())
  with check (status = 'completed' and driver_id = auth.uid());
