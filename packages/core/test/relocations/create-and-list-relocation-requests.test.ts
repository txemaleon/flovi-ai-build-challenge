import { afterEach, describe, expect, it, vi } from "vitest";
import {
  InMemoryRelocationRequestRepository,
  createRelocationRequest,
  listRelocationRequests
} from "../../src/relocations/index.js";

describe("dispatcher relocation request workflow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a relocation request and lists it with available status", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();

    const created = await createRelocationRequest(
      {
        dispatcherId: "dispatcher-123",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay."
      },
      { relocationRequests }
    );

    expect(created).toMatchObject({
      id: expect.any(String),
      dispatcherId: "dispatcher-123",
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay.",
      status: "available"
    });

    await expect(
      listRelocationRequests({ relocationRequests })
    ).resolves.toEqual([created]);
  });

  it("accepts an injected id generator and defaults missing notes", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();

    const created = await createRelocationRequest(
      {
        dispatcherId: "dispatcher-456",
        origin: "Valencia Port",
        destination: "Madrid Chamartin",
        scheduledAt: "2026-07-10T15:00:00.000Z"
      },
      {
        relocationRequests,
        generateId: () => "request-1"
      }
    );

    expect(created).toMatchObject({
      id: "request-1",
      notes: "",
      status: "available"
    });
  });

  it("fails clearly when no runtime uuid generator is available", async () => {
    vi.stubGlobal("crypto", undefined);

    await expect(
      createRelocationRequest(
        {
          dispatcherId: "dispatcher-789",
          origin: "Seville Station",
          destination: "Malaga Airport",
          scheduledAt: "2026-07-11T12:00:00.000Z"
        },
        { relocationRequests: new InMemoryRelocationRequestRepository() }
      )
    ).rejects.toThrow("No runtime UUID generator is available.");
  });
});
