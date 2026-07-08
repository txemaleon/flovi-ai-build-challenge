import { createClient } from "@supabase/supabase-js";
import type { DispatcherAppConfig } from "../DispatcherApp.vue";
import type { DispatcherAuthClient } from "../auth/createDispatcherAuthService.js";
import type { SupabaseRelocationRequestClient } from "@flovi/core";
import type { DispatcherRealtimeClient } from "../services/createDispatcherRealtimeService.js";

export type DispatcherSupabaseClient = DispatcherAuthClient &
  SupabaseRelocationRequestClient &
  DispatcherRealtimeClient;

export function createSupabaseBrowserClient(
  config: Required<DispatcherAppConfig>
): DispatcherSupabaseClient {
  const createSupabaseClient = createClient as (
    supabaseUrl: string,
    supabaseKey: string
  ) => unknown;

  return createSupabaseClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  ) as DispatcherSupabaseClient;
}
