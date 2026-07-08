import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type ListDriverCompletedRelocationGigsFields = Readonly<{
  driverId: string;
}>;

export type ListDriverCompletedRelocationGigsDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function listDriverCompletedRelocationGigs(
  fields: ListDriverCompletedRelocationGigsFields,
  dependencies: ListDriverCompletedRelocationGigsDependencies
): Promise<RelocationRequest[]> {
  return (await dependencies.relocationRequests.list())
    .filter(
      (request) =>
        request.status === "completed" && request.driverId === fields.driverId
    )
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
}
