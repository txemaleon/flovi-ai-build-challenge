import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type ListDriverAvailableRelocationGigsDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function listDriverAvailableRelocationGigs(
  dependencies: ListDriverAvailableRelocationGigsDependencies
): Promise<RelocationRequest[]> {
  const requests = await dependencies.relocationRequests.list();

  return requests
    .filter((request) => request.status === "available")
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
}
