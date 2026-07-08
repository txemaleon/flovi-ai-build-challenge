import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type CompleteRelocationGigFields = Readonly<{
  requestId: string;
  driverId: string;
}>;

export type CompleteRelocationGigDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function completeRelocationGig(
  fields: CompleteRelocationGigFields,
  dependencies: CompleteRelocationGigDependencies
): Promise<RelocationRequest> {
  return dependencies.relocationRequests.completeBooked(
    fields.requestId,
    fields.driverId
  );
}
