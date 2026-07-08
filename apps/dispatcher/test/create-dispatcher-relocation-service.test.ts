import { describe, expect, it } from "vitest";
import { InMemoryRelocationRequestRepository } from "@flovi/core";
import { createDispatcherRelocationService } from "../src/services/createDispatcherRelocationService.js";

describe("createDispatcherRelocationService", () => {
  it("creates and lists relocation requests through the core application boundary", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();
    const service = createDispatcherRelocationService({
      dispatcherId: "dispatcher-1",
      relocationRequests,
      generateId: () => "request-1"
    });

    await service.createRelocationRequest({
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay."
    });

    await expect(service.listRelocationRequests()).resolves.toEqual([
      {
        id: "request-1",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay.",
        status: "available"
      }
    ]);
  });

  it("updates and lists a relocation request through the core application boundary", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();
    const service = createDispatcherRelocationService({
      dispatcherId: "dispatcher-1",
      relocationRequests,
      generateId: () => "request-1"
    });

    await service.createRelocationRequest({
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay."
    });

    await service.updateRelocationRequest({
      id: "request-1",
      origin: "Madrid Chamartin",
      destination: "Valencia Port",
      scheduledAt: "2026-07-10T15:00:00.000Z",
      notes: "Bring parking ticket."
    });

    await expect(service.listRelocationRequests()).resolves.toEqual([
      {
        id: "request-1",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket.",
        status: "available"
      }
    ]);
  });

  it("cancels and lists a relocation request through the core application boundary", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();
    const service = createDispatcherRelocationService({
      dispatcherId: "dispatcher-1",
      relocationRequests,
      generateId: () => "request-1"
    });

    await service.createRelocationRequest({
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay."
    });

    await service.cancelRelocationRequest({ requestId: "request-1" });

    await expect(service.listRelocationRequests()).resolves.toEqual([
      {
        id: "request-1",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay.",
        status: "cancelled"
      }
    ]);
  });
});
