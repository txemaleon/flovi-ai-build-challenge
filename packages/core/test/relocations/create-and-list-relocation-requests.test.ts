import { afterEach, describe, expect, it, vi } from "vitest";
import {
  InMemoryRelocationRequestRepository,
  createRelocationRequest,
  listDriverAvailableRelocationGigs,
  listRelocationRequests,
  updateRelocationRequest
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

  it("updates an existing relocation request and preserves its status", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();
    const created = await createRelocationRequest(
      {
        dispatcherId: "dispatcher-123",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay."
      },
      {
        relocationRequests,
        generateId: () => "request-123"
      }
    );

    const updated = await updateRelocationRequest(
      {
        id: created.id,
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket."
      },
      { relocationRequests }
    );

    expect(updated).toEqual({
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Chamartin",
      destination: "Valencia Port",
      scheduledAt: "2026-07-10T15:00:00.000Z",
      notes: "Bring parking ticket.",
      status: "available"
    });
    await expect(
      listRelocationRequests({ relocationRequests })
    ).resolves.toEqual([updated]);
  });

  it("surfaces relocation request update errors clearly", async () => {
    const relocationRequests = {
      save: async () => undefined,
      list: async () => [],
      update: async () => {
        throw new Error("database unavailable");
      }
    };

    await expect(
      updateRelocationRequest(
        {
          id: "request-404",
          origin: "Madrid Chamartin",
          destination: "Valencia Port",
          scheduledAt: "2026-07-10T15:00:00.000Z",
          notes: "Bring parking ticket."
        },
        { relocationRequests }
      )
    ).rejects.toThrow(
      "Failed to update relocation request: database unavailable"
    );
  });

  it("surfaces missing in-memory relocation request updates clearly", async () => {
    const relocationRequests = new InMemoryRelocationRequestRepository();

    await expect(
      updateRelocationRequest(
        {
          id: "request-404",
          origin: "Madrid Chamartin",
          destination: "Valencia Port",
          scheduledAt: "2026-07-10T15:00:00.000Z",
          notes: "Bring parking ticket."
        },
        { relocationRequests }
      )
    ).rejects.toThrow(
      "Failed to update relocation request: Relocation request not found."
    );
  });

  it("uses a fallback message when update rejects without an Error", async () => {
    const relocationRequests = {
      save: async () => undefined,
      list: async () => [],
      update: async () => {
        throw "offline";
      }
    };

    await expect(
      updateRelocationRequest(
        {
          id: "request-404",
          origin: "Madrid Chamartin",
          destination: "Valencia Port",
          scheduledAt: "2026-07-10T15:00:00.000Z",
          notes: "Bring parking ticket."
        },
        { relocationRequests }
      )
    ).rejects.toThrow("Failed to update relocation request: unknown error");
  });

  it("lists driver-available gigs sorted by scheduled time", async () => {
    const relocationRequests = {
      save: async () => undefined,
      update: async () => {
        throw new Error("update is not used in this test");
      },
      list: async () => [
        {
          id: "request-later",
          dispatcherId: "dispatcher-1",
          origin: "Barcelona Sants",
          destination: "Valencia Port",
          scheduledAt: "2026-07-12T15:00:00.000Z",
          notes: "Later request",
          status: "available" as const
        },
        {
          id: "request-earlier",
          dispatcherId: "dispatcher-1",
          origin: "Madrid Chamartin",
          destination: "Seville Station",
          scheduledAt: "2026-07-10T09:30:00.000Z",
          notes: "Earlier request",
          status: "available" as const
        }
      ]
    };

    await expect(
      listDriverAvailableRelocationGigs({ relocationRequests })
    ).resolves.toEqual([
      {
        id: "request-earlier",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Chamartin",
        destination: "Seville Station",
        scheduledAt: "2026-07-10T09:30:00.000Z",
        notes: "Earlier request",
        status: "available"
      },
      {
        id: "request-later",
        dispatcherId: "dispatcher-1",
        origin: "Barcelona Sants",
        destination: "Valencia Port",
        scheduledAt: "2026-07-12T15:00:00.000Z",
        notes: "Later request",
        status: "available"
      }
    ]);
  });
});
