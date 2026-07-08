import type { RelocationRequestRepository } from "../application/ports/relocation-request-repository.js";
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
}
