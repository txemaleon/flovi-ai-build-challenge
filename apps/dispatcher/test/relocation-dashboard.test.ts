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
});
