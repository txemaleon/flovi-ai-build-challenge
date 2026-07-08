import { SupabaseRelocationRequestRepository } from "@flovi/core";
import {
  createDispatcherAuthService,
  type DispatcherSession
} from "../auth/createDispatcherAuthService.js";
import { createDispatcherRelocationService } from "../services/createDispatcherRelocationService.js";
import type { DispatcherRuntime } from "../DispatcherApp.vue";
import type { DispatcherSupabaseClient } from "./createSupabaseBrowserClient.js";

export type CreateDispatcherRuntimeOptions = Readonly<{
  generateId?: () => string;
}>;

export function createDispatcherRuntime(
  supabase: DispatcherSupabaseClient,
  options: CreateDispatcherRuntimeOptions = {}
): DispatcherRuntime {
  return {
    authService: createDispatcherAuthService(supabase),
    createRelocationService: (session: DispatcherSession) =>
      createDispatcherRelocationService({
        dispatcherId: session.user.id,
        relocationRequests: new SupabaseRelocationRequestRepository(supabase),
        generateId: options.generateId
      })
  };
}
