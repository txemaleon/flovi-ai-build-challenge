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

  async bookAvailable(
    requestId: string,
    driverId: string
  ): Promise<RelocationRequest> {
    const existing = this.requests.get(requestId);

    if (!existing) {
      throw new Error("Relocation request not found.");
    }

    if (existing.status !== "available") {
      throw new Error("Relocation request is not available.");
    }

    const booked: RelocationRequest = {
      ...existing,
      status: "booked",
      driverId
    };

    this.requests.set(booked.id, booked);

    return booked;
  }

  async cancelOpenOrBooked(requestId: string): Promise<RelocationRequest> {
    const existing = this.requests.get(requestId);

    if (!existing) {
      throw new Error("Relocation request not found.");
    }

    if (existing.status !== "available" && existing.status !== "booked") {
      throw new Error("Relocation request cannot be cancelled.");
    }

    const cancelled: RelocationRequest = {
      ...existing,
      status: "cancelled"
    };

    this.requests.set(cancelled.id, cancelled);

    return cancelled;
  }

  async completeBooked(
    requestId: string,
    driverId: string
  ): Promise<RelocationRequest> {
    const existing = this.requests.get(requestId);

    if (!existing) {
      throw new Error("Relocation request not found.");
    }

    if (existing.status !== "booked" || existing.driverId !== driverId) {
      throw new Error("Relocation request is not booked for this driver.");
    }

    const completed: RelocationRequest = {
      ...existing,
      status: "completed"
    };

    this.requests.set(completed.id, completed);

    return completed;
  }
}
