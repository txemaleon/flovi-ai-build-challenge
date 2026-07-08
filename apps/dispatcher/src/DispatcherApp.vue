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
  <main class="app-shell">
    <section v-if="configurationMessage" class="auth-panel">
      <p class="eyebrow">Configuration</p>
      <h1>Supabase configuration is missing</h1>
      <p class="state-message">{{ configurationMessage }}</p>
    </section>

    <section v-else-if="isCheckingSession" class="auth-panel">
      <p class="eyebrow">Dispatcher</p>
      <h1>Checking session</h1>
      <p class="state-message">Loading dispatcher session...</p>
    </section>

    <section v-else-if="!session" class="auth-panel">
      <p class="eyebrow">Dispatcher</p>
      <h1>Sign in to manage relocations</h1>
      <p v-if="authError" class="state-message state-message-error">
        {{ authError }}
      </p>
      <button
        data-test="google-sign-in"
        class="primary-button"
        type="button"
        @click="signInWithGoogle"
      >
        Sign in with Google
      </button>
    </section>

    <section v-else class="authenticated-shell">
      <header class="top-bar">
        <div>
          <p class="eyebrow">Signed in</p>
          <p class="session-label">
            {{ session.user.email ?? session.user.id }}
          </p>
        </div>
        <button
          data-test="sign-out"
          class="secondary-button"
          type="button"
          @click="signOut"
        >
          Sign out
        </button>
      </header>
      <p v-if="authError" class="state-message state-message-error">
        {{ authError }}
      </p>
      <RelocationDashboard
        :realtime-service="runtime?.realtimeService"
        :service="relocationService"
      />
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f6f7f9;
  color: #172033;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.auth-panel {
  max-width: 520px;
  margin: 0 auto;
  padding: 72px 24px;
}

.authenticated-shell {
  min-height: 100vh;
}

.top-bar {
  align-items: center;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  display: flex;
  justify-content: space-between;
  padding: 14px 32px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #607089;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 14px;
  font-size: clamp(1.7rem, 2vw, 2.25rem);
  letter-spacing: 0;
  line-height: 1.1;
  text-wrap: balance;
}

.session-label,
.state-message {
  color: #607089;
  margin: 0;
}

.state-message {
  margin-bottom: 20px;
}

.state-message-error {
  color: #a33d3d;
}

.primary-button,
.secondary-button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0 14px;
  transition-property: background-color, transform;
  transition-duration: 160ms;
}

.primary-button {
  background: #2563eb;
  color: #ffffff;
}

.secondary-button {
  background: #e8eef6;
  color: #24344d;
}

.primary-button:hover {
  background: #1d4ed8;
}

.secondary-button:hover {
  background: #dfe7f2;
}

.primary-button:active,
.secondary-button:active {
  transform: scale(0.96);
}

@media (max-width: 700px) {
  .top-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
  }
}
</style>
