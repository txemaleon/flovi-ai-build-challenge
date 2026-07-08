export const relocationRequestStatuses = ["available"] as const;

export type RelocationRequestStatus =
  (typeof relocationRequestStatuses)[number];

export type RelocationRequest = Readonly<{
  id: string;
  dispatcherId: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  notes: string;
  status: RelocationRequestStatus;
}>;

export type CreateRelocationRequestFields = Readonly<{
  dispatcherId: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  notes?: string;
}>;

export function createAvailableRelocationRequest(
  id: string,
  fields: CreateRelocationRequestFields
): RelocationRequest {
  return {
    id,
    dispatcherId: fields.dispatcherId,
    origin: fields.origin,
    destination: fields.destination,
    scheduledAt: fields.scheduledAt,
    notes: fields.notes ?? "",
    status: "available"
  };
}
