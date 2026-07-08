import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import type { RelocationRequest } from "@flovi/core";
import RelocationDashboard from "../src/RelocationDashboard.vue";
import type { DispatcherRelocationService } from "../src/services/dispatcherRelocationService.js";

function createService(
  requests: RelocationRequest[]
): DispatcherRelocationService {
  return {
    listRelocationRequests: async () => requests,
    createRelocationRequest: async () => {
      throw new Error("create is not used in this test");
    },
    updateRelocationRequest: async () => {
      throw new Error("update is not used in this test");
    }
  };
}

function createRealtimeService(): {
  realtimeService: {
    subscribeToRelocationRequestChanges(callback: () => void): () => void;
  };
  emitChange: () => void;
  unsubscribeCount: () => number;
} {
  let onChange: (() => void) | undefined;
  let unsubscribeCalls = 0;

  return {
    emitChange: () => {
      onChange?.();
    },
    unsubscribeCount: () => unsubscribeCalls,
    realtimeService: {
      subscribeToRelocationRequestChanges: (callback) => {
        onChange = callback;

        return () => {
          unsubscribeCalls += 1;
        };
      }
    }
  };
}

describe("RelocationDashboard", () => {
  it("shows existing relocation requests with route, scheduled time, and status", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: createService([
          {
            id: "request-1",
            dispatcherId: "dispatcher-1",
            origin: "Madrid Airport",
            destination: "Barcelona Sants",
            scheduledAt: "2026-07-09T09:30:00.000Z",
            notes: "Vehicle is parked in short stay.",
            status: "available"
          }
        ])
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");

    expect(wrapper.text()).toContain("Madrid Airport");
    expect(wrapper.text()).toContain("Barcelona Sants");
    expect(wrapper.text()).toContain("Jul 9, 2026, 09:30");
    expect(wrapper.find('[data-test="status"]').text()).toBe("available");
  });

  it("shows loading and empty states while requests are fetched", async () => {
    let resolveRequests: (requests: RelocationRequest[]) => void = () => {};
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: () =>
            new Promise<RelocationRequest[]>((resolve) => {
              resolveRequests = resolve;
            }),
          createRelocationRequest: async () => {
            throw new Error("create is not used in this test");
          },
          updateRelocationRequest: async () => {
            throw new Error("update is not used in this test");
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");

    expect(wrapper.text()).toContain("Loading relocation requests...");

    resolveRequests([]);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("No relocation requests yet.");
  });

  it("shows an error state when requests cannot be fetched", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: async () => {
            throw new Error("Supabase is unavailable");
          },
          createRelocationRequest: async () => {
            throw new Error("create is not used in this test");
          },
          updateRelocationRequest: async () => {
            throw new Error("update is not used in this test");
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");

    expect(wrapper.text()).toContain("Supabase is unavailable");
  });

  it("shows a fallback error when a request fetch rejects without an Error", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: async () => {
            throw "offline";
          },
          createRelocationRequest: async () => {
            throw new Error("create is not used in this test");
          },
          updateRelocationRequest: async () => {
            throw new Error("update is not used in this test");
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");

    expect(wrapper.text()).toContain("Unable to load relocation requests.");
  });


  it("creates a relocation request from the form and refreshes the visible list", async () => {
    const requests: RelocationRequest[] = [];
    const createdInputs: unknown[] = [];
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: async () => requests,
          createRelocationRequest: async (input) => {
            createdInputs.push(input);
            const created: RelocationRequest = {
              id: "request-2",
              dispatcherId: "dispatcher-1",
              origin: input.origin,
              destination: input.destination,
              scheduledAt: input.scheduledAt,
              notes: input.notes,
              status: "available"
            };
            requests.push(created);
            return created;
          },
          updateRelocationRequest: async () => {
            throw new Error("update is not used in this test");
          }
        }
      }
    });

    await wrapper.find('[data-test="origin"]').setValue("Bilbao Depot");
    await wrapper.find('[data-test="destination"]').setValue("San Sebastian");
    await wrapper
      .find('[data-test="scheduled-at"]')
      .setValue("2026-07-12T08:15");
    await wrapper.find('[data-test="notes"]').setValue("Call ahead.");
    await wrapper.find('[data-test="request-form"]').trigger("submit");

    expect(createdInputs).toEqual([
      {
        origin: "Bilbao Depot",
        destination: "San Sebastian",
        scheduledAt: "2026-07-12T08:15:00.000Z",
        notes: "Call ahead."
      }
    ]);
    expect(wrapper.text()).toContain("Bilbao Depot");
    expect(wrapper.text()).toContain("San Sebastian");
    expect(wrapper.text()).toContain("Jul 12, 2026, 08:15");
  });

  it("opens a populated edit form for an existing relocation request", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: createService([
          {
            id: "request-1",
            dispatcherId: "dispatcher-1",
            origin: "Madrid Airport",
            destination: "Barcelona Sants",
            scheduledAt: "2026-07-09T09:30:00.000Z",
            notes: "Vehicle is parked in short stay.",
            status: "available"
          }
        ])
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");
    await wrapper.find('[data-test="edit-request"]').trigger("click");

    expect(
      (wrapper.find('[data-test="origin"]').element as HTMLInputElement).value
    ).toBe("Madrid Airport");
    expect(
      (wrapper.find('[data-test="destination"]').element as HTMLInputElement)
        .value
    ).toBe("Barcelona Sants");
    expect(
      (wrapper.find('[data-test="scheduled-at"]').element as HTMLInputElement)
        .value
    ).toBe("2026-07-09T09:30");
    expect(
      (wrapper.find('[data-test="notes"]').element as HTMLTextAreaElement).value
    ).toBe("Vehicle is parked in short stay.");
  });

  it("saves an edited relocation request and refreshes the visible list", async () => {
    const requests: RelocationRequest[] = [
      {
        id: "request-1",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay.",
        status: "available"
      }
    ];
    const updatedInputs: unknown[] = [];
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: async () => requests,
          createRelocationRequest: async () => {
            throw new Error("create is not used in this test");
          },
          updateRelocationRequest: async (input) => {
            updatedInputs.push(input);
            const updated: RelocationRequest = {
              id: input.id,
              dispatcherId: "dispatcher-1",
              origin: input.origin,
              destination: input.destination,
              scheduledAt: input.scheduledAt,
              notes: input.notes,
              status: "available"
            };
            requests.splice(0, requests.length, updated);
            return updated;
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");
    await wrapper.find('[data-test="edit-request"]').trigger("click");
    await wrapper.find('[data-test="origin"]').setValue("Madrid Chamartin");
    await wrapper.find('[data-test="destination"]').setValue("Valencia Port");
    await wrapper
      .find('[data-test="scheduled-at"]')
      .setValue("2026-07-10T15:00");
    await wrapper.find('[data-test="notes"]').setValue("Bring parking ticket.");
    await wrapper.find('[data-test="request-form"]').trigger("submit");

    expect(updatedInputs).toEqual([
      {
        id: "request-1",
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket."
      }
    ]);
    expect(wrapper.text()).toContain("Madrid Chamartin");
    expect(wrapper.text()).toContain("Valencia Port");
  });

  it("cancels edit mode without saving", async () => {
    let updateCalls = 0;
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          ...createService([
            {
              id: "request-1",
              dispatcherId: "dispatcher-1",
              origin: "Madrid Airport",
              destination: "Barcelona Sants",
              scheduledAt: "2026-07-09T09:30:00.000Z",
              notes: "Vehicle is parked in short stay.",
              status: "available"
            }
          ]),
          updateRelocationRequest: async () => {
            updateCalls += 1;
            throw new Error("update should not be called");
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");
    await wrapper.find('[data-test="edit-request"]').trigger("click");
    await wrapper.find('[data-test="cancel-edit"]').trigger("click");
    await wrapper.find('[data-test="origin"]').setValue("New request");
    await wrapper.find('[data-test="destination"]').setValue("New destination");

    expect(wrapper.text()).toContain("Create request");
    expect(updateCalls).toBe(0);
  });

  it("shows a clear message when update fails", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          ...createService([
            {
              id: "request-1",
              dispatcherId: "dispatcher-1",
              origin: "Madrid Airport",
              destination: "Barcelona Sants",
              scheduledAt: "2026-07-09T09:30:00.000Z",
              notes: "Vehicle is parked in short stay.",
              status: "available"
            }
          ]),
          updateRelocationRequest: async () => {
            throw new Error("Unable to update relocation request.");
          }
        }
      }
    });

    await wrapper.find('[data-test="refresh"]').trigger("click");
    await wrapper.find('[data-test="edit-request"]').trigger("click");
    await wrapper.find('[data-test="origin"]').setValue("Madrid Chamartin");
    await wrapper.find('[data-test="request-form"]').trigger("submit");

    expect(wrapper.text()).toContain("Unable to update relocation request.");
  });

  it("shows a fallback message when saving rejects without an Error", async () => {
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: {
          listRelocationRequests: async () => [],
          createRelocationRequest: async () => {
            throw "offline";
          },
          updateRelocationRequest: async () => {
            throw new Error("update is not used in this test");
          }
        }
      }
    });

    await wrapper.find('[data-test="origin"]').setValue("Bilbao Depot");
    await wrapper.find('[data-test="destination"]').setValue("San Sebastian");
    await wrapper
      .find('[data-test="scheduled-at"]')
      .setValue("2026-07-12T08:15");
    await wrapper.find('[data-test="request-form"]').trigger("submit");

    expect(wrapper.text()).toContain("Unable to save relocation request.");
  });

  it("refreshes requests after realtime changes and cleans up the subscription", async () => {
    const requests: RelocationRequest[] = [
      {
        id: "request-1",
        dispatcherId: "dispatcher-1",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduledAt: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay.",
        status: "available"
      }
    ];
    const realtime = createRealtimeService();
    const wrapper = mount(RelocationDashboard, {
      props: {
        service: createService(requests),
        realtimeService: realtime.realtimeService
      }
    });

    await vi.dynamicImportSettled();
    requests.splice(0, requests.length, {
      id: "request-2",
      dispatcherId: "dispatcher-1",
      origin: "Valencia Port",
      destination: "Madrid Chamartin",
      scheduledAt: "2026-07-10T15:00:00.000Z",
      notes: "Updated by realtime.",
      status: "available"
    });
    realtime.emitChange();
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain("Valencia Port");
    wrapper.unmount();
    expect(realtime.unsubscribeCount()).toBe(1);
  });
});
