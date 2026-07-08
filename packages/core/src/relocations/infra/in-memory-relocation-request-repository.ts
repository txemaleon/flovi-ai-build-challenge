import type { RelocationRequestRepository } from "../application/ports/relocation-request-repository.js";
import type { UpdateRelocationRequestFields } from "../application/update-relocation-request.js";
import type { RelocationRequest } from "../domain/relocation-request.js";

export class InMemoryRelocationRequestRepository
  implements RelocationRequestRepository
{
  private readonly requests = new Map<string, RelocationRequest>();

  async save(request: RelocationRequest): Promise<void> {
    this.requests.set(request.id, request);
  }

  async list(): Promise<RelocationRequest[]> {
    return [...this.requests.values()];
  }

  async update(
    request: UpdateRelocationRequestFields
  ): Promise<RelocationRequest> {
    const existing = this.requests.get(request.id);

    if (!existing) {
      throw new Error("Relocation request not found.");
    }

    const updated: RelocationRequest = {
      ...existing,
      origin: request.origin,
      destination: request.destination,
      scheduledAt: request.scheduledAt,
      notes: request.notes
    };

    this.requests.set(updated.id, updated);

    return updated;
  }
}
