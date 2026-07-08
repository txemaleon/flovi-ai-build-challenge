import type { DispatcherAppConfig } from "../DispatcherApp.vue";

export type DispatcherEnv = Readonly<{
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}>;

export function readDispatcherConfig(env: DispatcherEnv): DispatcherAppConfig {
  return {
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY
  };
}
