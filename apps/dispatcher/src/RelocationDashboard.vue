<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { RelocationRequest } from "@flovi/core";
import type { DispatcherRelocationService } from "./services/dispatcherRelocationService.js";

const props = defineProps<{
  service: DispatcherRelocationService;
}>();

const requests = ref<RelocationRequest[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const origin = ref("");
const destination = ref("");
const scheduledAt = ref("");
const notes = ref("");

async function loadRequests() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    requests.value = await props.service.listRelocationRequests();
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to load relocation requests.";
  } finally {
    isLoading.value = false;
  }
}

async function submitRequest() {
  await props.service.createRelocationRequest({
    origin: origin.value,
    destination: destination.value,
    scheduledAt: toUtcIsoString(scheduledAt.value),
    notes: notes.value
  });

  origin.value = "";
  destination.value = "";
  scheduledAt.value = "";
  notes.value = "";

  await loadRequests();
}

function formatScheduledAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date(value));
}

function toUtcIsoString(value: string): string {
  return `${value}:00.000Z`;
}

onMounted(loadRequests);
</script>

<template>
  <main class="dashboard-shell">
    <section class="dashboard-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Dispatcher</p>
          <h1>Relocation requests</h1>
        </div>
        <div class="header-actions">
          <button class="google-button" type="button">Sign in with Google</button>
          <button data-test="refresh" class="secondary-button" @click="loadRequests">
            Refresh
          </button>
        </div>
      </div>

      <form
        data-test="request-form"
        class="request-form"
        @submit.prevent="submitRequest"
      >
        <label>
          <span>Origin</span>
          <input
            v-model="origin"
            data-test="origin"
            autocomplete="off"
            required
            type="text"
          />
        </label>
        <label>
          <span>Destination</span>
          <input
            v-model="destination"
            data-test="destination"
            autocomplete="off"
            required
            type="text"
          />
        </label>
        <label>
          <span>Scheduled</span>
          <input
            v-model="scheduledAt"
            data-test="scheduled-at"
            required
            type="datetime-local"
          />
        </label>
        <label class="notes-field">
          <span>Notes</span>
          <textarea v-model="notes" data-test="notes" rows="3" />
        </label>
        <button class="primary-button" type="submit">Create request</button>
      </form>

      <p v-if="isLoading" class="state-message">Loading relocation requests...</p>
      <p v-else-if="errorMessage" class="state-message state-message-error">
        {{ errorMessage }}
      </p>

      <p v-else-if="requests.length === 0" class="state-message">
        No relocation requests yet.
      </p>

      <div v-else class="request-list">
        <article
          v-for="request in requests"
          :key="request.id"
          class="request-row"
        >
          <div>
            <p class="route">
              {{ request.origin }} <span>to</span> {{ request.destination }}
            </p>
            <p class="scheduled">
              {{ formatScheduledAt(request.scheduledAt) }}
            </p>
          </div>
          <span data-test="status" class="status-pill">
            {{ request.status }}
          </span>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  background: #f6f7f9;
  color: #172033;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  padding: 32px;
}

.dashboard-panel {
  max-width: 1040px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 18px 48px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-actions {
  align-items: center;
  display: flex;
  gap: 10px;
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
  margin: 0;
  font-size: clamp(1.6rem, 1.8vw, 2.1rem);
  line-height: 1.1;
  letter-spacing: 0;
  text-wrap: balance;
}

.google-button,
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

.google-button {
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.14);
  color: #24344d;
}

.primary-button {
  align-self: end;
  background: #2563eb;
  color: #ffffff;
}

.secondary-button {
  background: #e8eef6;
  color: #24344d;
}

.google-button:hover {
  background: #f8fafc;
}

.primary-button:hover {
  background: #1d4ed8;
}

.secondary-button:hover {
  background: #dfe7f2;
}

.google-button:active,
.primary-button:active,
.secondary-button:active {
  transform: scale(0.96);
}

.request-form {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 26px;
  padding: 18px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

label {
  display: grid;
  gap: 7px;
}

label span {
  color: #4d5c72;
  font-size: 0.8rem;
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.12);
  color: #172033;
  font: inherit;
  min-height: 40px;
  padding: 9px 11px;
}

input:focus,
textarea:focus {
  outline: 2px solid rgba(37, 99, 235, 0.28);
  outline-offset: 2px;
}

textarea {
  resize: vertical;
}

.notes-field {
  grid-column: span 3;
}

.state-message {
  margin: 24px 0 0;
  color: #607089;
}

.state-message-error {
  color: #a33d3d;
}

.request-list {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.request-row {
  align-items: center;
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;
}

.route {
  margin: 0;
  color: #172033;
  font-weight: 750;
}

.route span {
  color: #7a8799;
  font-weight: 600;
}

.scheduled {
  color: #607089;
  font-size: 0.94rem;
  font-variant-numeric: tabular-nums;
  margin: 6px 0 0;
}

.status-pill {
  background: #dff5ea;
  border-radius: 999px;
  color: #11623f;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 6px 10px;
  text-transform: capitalize;
}

@media (max-width: 820px) {
  .dashboard-shell {
    padding: 16px;
  }

  .panel-header,
  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .request-form {
    grid-template-columns: 1fr;
  }

  .notes-field {
    grid-column: span 1;
  }

  .request-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
