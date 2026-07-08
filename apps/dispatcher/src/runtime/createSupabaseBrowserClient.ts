import { createClient } from "@supabase/supabase-js";
import type { DispatcherAppConfig } from "../DispatcherApp.vue";
import type { DispatcherAuthClient } from "../auth/createDispatcherAuthService.js";
import type { SupabaseRelocationRequestClient } from "@flovi/core";

export type DispatcherSupabaseClient = DispatcherAuthClient &
  SupabaseRelocationRequestClient;

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
