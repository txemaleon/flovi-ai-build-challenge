import { createClient } from "@supabase/supabase-js";
import type { DispatcherAppConfig } from "../DispatcherApp.vue";
import type { DispatcherAuthClient } from "../auth/createDispatcherAuthService.js";
import type { SupabaseRelocationRequestClient } from "@flovi/core";

export type DispatcherSupabaseClient = DispatcherAuthClient &
  SupabaseRelocationRequestClient;

export function createSupabaseBrowserClient(
  config: Required<DispatcherAppConfig>
): DispatcherSupabaseClient {
  return createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  ) as DispatcherSupabaseClient;
}
