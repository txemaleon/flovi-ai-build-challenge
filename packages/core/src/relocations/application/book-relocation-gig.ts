import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type BookRelocationGigFields = Readonly<{
  requestId: string;
  driverId: string;
}>;

export type BookRelocationGigDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function bookRelocationGig(
  fields: BookRelocationGigFields,
  dependencies: BookRelocationGigDependencies
): Promise<RelocationRequest> {
  return dependencies.relocationRequests.bookAvailable(
    fields.requestId,
    fields.driverId
  );
}
