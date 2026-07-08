import type { RelocationRequest } from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type UpdateRelocationRequestFields = Readonly<{
  id: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  notes: string;
  status?: RelocationRequest["status"];
}>;

export type UpdateRelocationRequestDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function updateRelocationRequest(
  fields: UpdateRelocationRequestFields,
  dependencies: UpdateRelocationRequestDependencies
): Promise<RelocationRequest> {
  try {
    return await dependencies.relocationRequests.update(fields);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Failed to update relocation request: ${message}`);
  }
}
