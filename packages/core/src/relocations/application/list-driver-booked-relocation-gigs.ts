import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type ListDriverBookedRelocationGigsFields = Readonly<{
  driverId: string;
}>;

export type ListDriverBookedRelocationGigsDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function listDriverBookedRelocationGigs(
  fields: ListDriverBookedRelocationGigsFields,
  dependencies: ListDriverBookedRelocationGigsDependencies
): Promise<RelocationRequest[]> {
  return (await dependencies.relocationRequests.list())
    .filter(
      (request) =>
        request.status === "booked" && request.driverId === fields.driverId
    )
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
}
