import { createApp } from "vue";
import {
  InMemoryRelocationRequestRepository,
  createAvailableRelocationRequest
} from "@flovi/core";
import RelocationDashboard from "./RelocationDashboard.vue";
import { createDispatcherRelocationService } from "./services/createDispatcherRelocationService.js";

const relocationRequests = new InMemoryRelocationRequestRepository();

await relocationRequests.save(
  createAvailableRelocationRequest("demo-request-1", {
    dispatcherId: "demo-dispatcher",
    origin: "Madrid Airport",
    destination: "Barcelona Sants",
    scheduledAt: "2026-07-09T09:30:00.000Z",
    notes: "Demo request loaded from the local app composition root."
  })
);

createApp(RelocationDashboard, {
  service: createDispatcherRelocationService({
    dispatcherId: "demo-dispatcher",
    relocationRequests
  })
}).mount("#app");
