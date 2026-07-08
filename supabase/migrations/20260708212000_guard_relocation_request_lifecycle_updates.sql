create or replace function public.guard_relocation_request_update()
returns trigger
language plpgsql
as $$
declare
  actor_id uuid := auth.uid();
  editable_fields_unchanged boolean :=
    new.origin is not distinct from old.origin
    and new.destination is not distinct from old.destination
    and new.scheduled_at is not distinct from old.scheduled_at
    and new.notes is not distinct from old.notes;
begin
  if actor_id is null then
    raise exception 'Invalid relocation request lifecycle update.';
  end if;

  if new.id is distinct from old.id
    or new.dispatcher_id is distinct from old.dispatcher_id
    or new.created_at is distinct from old.created_at then
    raise exception 'Invalid relocation request lifecycle update.';
  end if;

  if old.status in ('completed', 'cancelled')
    and new.status is distinct from old.status then
    raise exception 'Invalid relocation request lifecycle update.';
  end if;

  if actor_id = old.dispatcher_id
    and new.status = old.status
    and new.driver_id is not distinct from old.driver_id then
    return new;
  end if;

  if actor_id = old.dispatcher_id
    and old.status in ('available', 'booked')
    and new.status = 'cancelled'
    and new.driver_id is not distinct from old.driver_id
    and editable_fields_unchanged then
    return new;
  end if;

  if old.status = 'available'
    and new.status = 'booked'
    and old.driver_id is null
    and new.driver_id = actor_id
    and editable_fields_unchanged then
    return new;
  end if;

  if old.status = 'booked'
    and old.driver_id = actor_id
    and new.status = 'completed'
    and new.driver_id is not distinct from old.driver_id
    and editable_fields_unchanged then
    return new;
  end if;

  raise exception 'Invalid relocation request lifecycle update.';
end;
$$;

drop trigger if exists guard_relocation_request_update
  on public.relocation_requests;

create trigger guard_relocation_request_update
  before update on public.relocation_requests
  for each row
  execute function public.guard_relocation_request_update();
