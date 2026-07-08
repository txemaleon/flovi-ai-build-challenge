import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type CancelRelocationRequestFields = Readonly<{
  requestId: string;
}>;

export type CancelRelocationRequestDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function cancelRelocationRequest(
  fields: CancelRelocationRequestFields,
  dependencies: CancelRelocationRequestDependencies
): Promise<RelocationRequest> {
  return dependencies.relocationRequests.cancelOpenOrBooked(fields.requestId);
}
