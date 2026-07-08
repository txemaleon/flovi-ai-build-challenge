import {
  createAvailableRelocationRequest,
  type CreateRelocationRequestFields
} from "../domain/relocation-request.js";
import type { RelocationRequestRepository } from "./ports/relocation-request-repository.js";

export type CreateRelocationRequestDependencies = Readonly<{
  relocationRequests: RelocationRequestRepository;
  generateId?: () => string;
}>;

export async function createRelocationRequest(
  fields: CreateRelocationRequestFields,
  dependencies: CreateRelocationRequestDependencies
) {
  const request = createAvailableRelocationRequest(
    dependencies.generateId?.() ?? generateRuntimeId(),
    fields
  );

  await dependencies.relocationRequests.save(request);

  return request;
}

type RuntimeCrypto = Readonly<{
  randomUUID?: () => string;
}>;

function generateRuntimeId(): string {
  const runtimeCrypto = (globalThis as { crypto?: RuntimeCrypto }).crypto;
  const id = runtimeCrypto?.randomUUID?.();

  if (!id) {
    throw new Error("No runtime UUID generator is available.");
  }

  return id;
}
