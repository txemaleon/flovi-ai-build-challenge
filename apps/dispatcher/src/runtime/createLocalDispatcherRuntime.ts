import {
  InMemoryRelocationRequestRepository,
  demoDispatcherId,
  demoRelocationRequests
} from "@flovi/core";
import type { DispatcherRuntime } from "../DispatcherApp.vue";
import type { DispatcherSession } from "../auth/createDispatcherAuthService.js";
import { createDispatcherRelocationService } from "../services/createDispatcherRelocationService.js";

export function createLocalDispatcherRuntime(): DispatcherRuntime {
  let session: DispatcherSession | null = {
    user: {
      id: demoDispatcherId,
      email: "demo-dispatcher@flovi.local"
    }
  };
  const relocationRequests = new InMemoryRelocationRequestRepository();

  for (const request of demoRelocationRequests) {
    void relocationRequests.save({ ...request });
  }

  return {
    authService: {
      getCurrentSession: async () => session,
      subscribeToAuthChanges: () => () => undefined,
      signInWithGoogle: async () => {
        session = {
          user: {
            id: demoDispatcherId,
            email: "demo-dispatcher@flovi.local"
          }
        };
      },
      signOut: async () => {
        session = null;
      }
    },
    createRelocationService: () =>
      createDispatcherRelocationService({
        dispatcherId: demoDispatcherId,
        relocationRequests
      })
  };
}
