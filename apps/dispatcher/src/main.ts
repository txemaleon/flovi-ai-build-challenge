import { createApp } from "vue";
import DispatcherApp from "./DispatcherApp.vue";
import { createDispatcherRuntime } from "./runtime/createDispatcherRuntime.js";
import { createLocalDispatcherRuntime } from "./runtime/createLocalDispatcherRuntime.js";
import { createSupabaseBrowserClient } from "./runtime/createSupabaseBrowserClient.js";
import { readDispatcherConfig } from "./runtime/readDispatcherConfig.js";

const config = readDispatcherConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
});
const runtime =
  config.supabaseUrl && config.supabaseAnonKey
    ? createDispatcherRuntime(
        createSupabaseBrowserClient({
          supabaseUrl: config.supabaseUrl,
          supabaseAnonKey: config.supabaseAnonKey
        })
      )
    : createLocalDispatcherRuntime();

createApp(DispatcherApp, {
  config,
  runtime
}).mount("#app");
