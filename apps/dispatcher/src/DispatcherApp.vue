<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import RelocationDashboard from "./RelocationDashboard.vue";
import type {
  DispatcherAuthService,
  DispatcherSession
} from "./auth/createDispatcherAuthService.js";
import type { DispatcherRelocationService } from "./services/dispatcherRelocationService.js";
import type { DispatcherRealtimeService } from "./services/dispatcherRealtimeService.js";

export type DispatcherAppConfig = Readonly<{
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}>;

export type DispatcherRuntime = Readonly<{
  authService: DispatcherAuthService;
  realtimeService?: DispatcherRealtimeService;
  createRelocationService(
    session: DispatcherSession
  ): DispatcherRelocationService;
}>;

const props = defineProps<{
  config: DispatcherAppConfig;
  runtime?: DispatcherRuntime;
}>();

const session = ref<DispatcherSession | null>(null);
const relocationService = ref<DispatcherRelocationService>(
  {} as DispatcherRelocationService
);
const isCheckingSession = ref(true);
const authError = ref("");
let unsubscribeFromAuth: (() => void) | undefined;

const configurationMessage = computed(() => {
  if (props.runtime) {
    return "";
  }

  const missingVariables = [
    props.config.supabaseUrl ? "" : "VITE_SUPABASE_URL",
    props.config.supabaseAnonKey ? "" : "VITE_SUPABASE_ANON_KEY"
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    return `Supabase configuration is missing: ${missingVariables.join(", ")}`;
  }

  return "";
});

onMounted(async () => {
  if (configurationMessage.value) {
    isCheckingSession.value = false;
    return;
  }

  if (!props.runtime) {
    authError.value = "Unable to read auth session.";
    isCheckingSession.value = false;
    return;
  }

  try {
    setSession(await props.runtime!.authService.getCurrentSession());
    unsubscribeFromAuth = props.runtime!.authService.subscribeToAuthChanges(
      (nextSession) => {
        setSession(nextSession);
      }
    );
  } catch (error) {
    authError.value =
      error instanceof Error ? error.message : "Unable to read auth session.";
  } finally {
    isCheckingSession.value = false;
  }
});

onUnmounted(() => {
  unsubscribeFromAuth?.();
});

async function signInWithGoogle() {
  authError.value = "";

  try {
    await props.runtime!.authService.signInWithGoogle();
  } catch (error) {
    authError.value =
      error instanceof Error ? error.message : "Unable to start Google sign-in.";
  }
}

async function signOut() {
  authError.value = "";

  try {
    await props.runtime!.authService.signOut();
    setSession(null);
  } catch (error) {
    authError.value =
      error instanceof Error ? error.message : "Unable to sign out.";
  }
}

function setSession(nextSession: DispatcherSession | null) {
  session.value = nextSession;

  if (nextSession) {
    relocationService.value = props.runtime!.createRelocationService(nextSession);
  }
}
</script>

<template>
  <main class="min-h-screen bg-flovi-bg text-flovi-ink antialiased">
    <section
      v-if="configurationMessage"
      class="mx-auto grid min-h-screen w-full max-w-xl content-center px-5 py-16"
    >
      <div class="rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.07)]">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Configuration
        </p>
        <h1 class="mb-3 text-balance text-2xl font-semibold leading-tight tracking-normal text-slate-950">
          Supabase configuration is missing
        </h1>
        <p class="m-0 text-pretty text-sm leading-6 text-slate-600">
          {{ configurationMessage }}
        </p>
      </div>
    </section>

    <section
      v-else-if="isCheckingSession"
      class="mx-auto grid min-h-screen w-full max-w-xl content-center px-5 py-16"
    >
      <div class="rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.07)]">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Dispatcher
        </p>
        <h1 class="mb-3 text-balance text-2xl font-semibold leading-tight tracking-normal text-slate-950">
          Checking session
        </h1>
        <p class="m-0 text-sm leading-6 text-slate-600">
          Loading dispatcher session...
        </p>
      </div>
    </section>

    <section
      v-else-if="!session"
      class="mx-auto grid min-h-screen w-full max-w-xl content-center px-5 py-16"
    >
      <div class="rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.07)]">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Dispatcher
        </p>
        <h1 class="mb-3 text-balance text-2xl font-semibold leading-tight tracking-normal text-slate-950">
          Sign in to manage relocations
        </h1>
        <p class="mb-5 text-pretty text-sm leading-6 text-slate-600">
          Access the operations dashboard, create requests, and keep relocation
          status moving.
        </p>
        <p
          v-if="authError"
          class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow-[inset_0_0_0_1px_rgba(185,28,28,0.12)]"
        >
          {{ authError }}
        </p>
        <button
          data-test="google-sign-in"
          aria-label="Sign in with Google"
          class="google-sign-in-button inline-flex h-11 min-w-56 items-center justify-center gap-3 rounded-lg bg-white px-4 text-sm font-medium text-zinc-800 shadow-[0_0_0_1px_rgba(24,24,27,0.14),0_1px_2px_rgba(24,24,27,0.06)] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-zinc-50 hover:shadow-[0_0_0_1px_rgba(24,24,27,0.18),0_2px_4px_rgba(24,24,27,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.96]"
          type="button"
          @click="signInWithGoogle"
        >
          <svg
            data-test="google-g-icon"
            aria-hidden="true"
            class="h-5 w-5 shrink-0"
            viewBox="0 0 18 18"
          >
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.94v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.94a9 9 0 0 0 0 8.08l3.02-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .94 4.96l3.02 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </section>

    <section v-else class="min-h-screen">
      <header class="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white px-5 py-3 shadow-[0_1px_0_rgba(15,23,42,0.08)] sm:px-8">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Dispatcher
          </p>
          <p class="m-0 overflow-wrap-anywhere text-sm font-semibold text-slate-800">
            {{ session.user.email ?? session.user.id }}
          </p>
        </div>
        <button
          data-test="sign-out"
          class="min-h-10 rounded-lg bg-slate-100 px-3.5 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 ease-out hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.96]"
          type="button"
          @click="signOut"
        >
          Sign out
        </button>
      </header>
      <p
        v-if="authError"
        class="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow-[inset_0_0_0_1px_rgba(185,28,28,0.12)] sm:mx-8"
      >
        {{ authError }}
      </p>
      <RelocationDashboard
        :realtime-service="runtime?.realtimeService"
        :service="relocationService"
      />
    </section>
  </main>
</template>
