import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type ListRelocationRequestsDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
}>;

export async function listRelocationRequests(
  dependencies: ListRelocationRequestsDependencies
) {
  return dependencies.relocationRequests.list();
}
