<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  filterRelocationRequests,
  getRelocationPlaceOptions,
  type RelocationRequest,
  type RelocationRequestStatus
} from "@flovi/core";
import type { DispatcherRelocationService } from "./services/dispatcherRelocationService.js";
import type { DispatcherRealtimeService } from "./services/dispatcherRealtimeService.js";

const props = defineProps<{
  service: DispatcherRelocationService;
  realtimeService?: DispatcherRealtimeService;
}>();

const requests = ref<RelocationRequest[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const origin = ref("");
const destination = ref("");
const scheduledAt = ref("");
const notes = ref("");
const editingRequestId = ref<string | null>(null);
const activeStatusFilter = ref<"all" | RelocationRequestStatus>("all");
const searchText = ref("");
const filterOrigin = ref("");
const filterDestination = ref("");
const filterFrom = ref("");
const filterTo = ref("");
let unsubscribeFromRealtime: (() => void) | undefined;

const statusFilters: Array<{
  value: "all" | RelocationRequestStatus;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "available", label: "Open" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const statusCounts = computed(() =>
  statusFilters.map((filter) => ({
    ...filter,
    count:
      filter.value === "all"
        ? requests.value.length
        : requests.value.filter((request) => request.status === filter.value)
            .length
  }))
);

const placeOptions = computed(() => getRelocationPlaceOptions(requests.value));

const filteredRequests = computed(() =>
  filterRelocationRequests(requests.value, {
    searchText: searchText.value,
    origin: filterOrigin.value,
    destination: filterDestination.value,
    status: activeStatusFilter.value,
    scheduledFrom: toFilterStart(filterFrom.value),
    scheduledTo: toFilterEnd(filterTo.value)
  })
);

async function loadRequests() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    requests.value = [...(await props.service.listRelocationRequests())];
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
  errorMessage.value = "";

  try {
    if (editingRequestId.value) {
      await props.service.updateRelocationRequest({
        id: editingRequestId.value,
        origin: origin.value,
        destination: destination.value,
        scheduledAt: toUtcIsoString(scheduledAt.value),
        notes: notes.value
      });
    } else {
      await props.service.createRelocationRequest({
        origin: origin.value,
        destination: destination.value,
        scheduledAt: toUtcIsoString(scheduledAt.value),
        notes: notes.value
      });
    }

    resetForm();
    await loadRequests();
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to save relocation request.";
  }
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

function toDateTimeLocal(value: string): string {
  return value.slice(0, 16);
}

function toFilterStart(value: string): string | undefined {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

function toFilterEnd(value: string): string | undefined {
  return value ? `${value}T23:59:59.999Z` : undefined;
}

function editRequest(request: RelocationRequest) {
  editingRequestId.value = request.id;
  origin.value = request.origin;
  destination.value = request.destination;
  scheduledAt.value = toDateTimeLocal(request.scheduledAt);
  notes.value = request.notes;
  errorMessage.value = "";
}

function cancelEdit() {
  resetForm();
}

async function cancelRequest(request: RelocationRequest) {
  errorMessage.value = "";

  try {
    await props.service.cancelRelocationRequest({ requestId: request.id });
    await loadRequests();
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to cancel relocation request.";
  }
}

function resetForm() {
  editingRequestId.value = null;
  origin.value = "";
  destination.value = "";
  scheduledAt.value = "";
  notes.value = "";
}

function statusLabel(status: RelocationRequestStatus): string {
  return status === "available" ? "Open" : statusFilters.find(
    (filter) => filter.value === status
  )!.label;
}

function canCancel(request: RelocationRequest): boolean {
  return request.status === "available" || request.status === "booked";
}

function assignmentLabel(request: RelocationRequest): string {
  return request.driverId ? `Assigned ${request.driverId}` : "Unassigned";
}

onMounted(() => {
  void loadRequests();
  unsubscribeFromRealtime =
    props.realtimeService?.subscribeToRelocationRequestChanges(() => {
      void loadRequests();
    });
});

onUnmounted(() => {
  unsubscribeFromRealtime?.();
});
</script>

<template>
  <main class="dashboard-shell">
    <section class="dashboard-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Dispatcher</p>
          <h1>Relocation requests</h1>
        </div>
        <button data-test="refresh" class="secondary-button" @click="loadRequests">
          Refresh
        </button>
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
            list="relocation-place-options"
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
            list="relocation-place-options"
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
        <button class="primary-button" type="submit">
          {{ editingRequestId ? "Save changes" : "Create request" }}
        </button>
        <button
          v-if="editingRequestId"
          data-test="cancel-edit"
          class="secondary-button"
          type="button"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </form>

      <p v-if="isLoading" class="state-message">Loading relocation requests...</p>
      <p v-else-if="errorMessage" class="state-message state-message-error">
        {{ errorMessage }}
      </p>

      <template v-else>
        <datalist id="relocation-place-options">
          <option
            v-for="place in placeOptions"
            :key="place"
            :value="place"
          />
        </datalist>

        <div v-if="requests.length > 0" class="status-tools">
          <button
            v-for="filter in statusCounts"
            :key="filter.value"
            data-test="status-filter"
            class="filter-button"
            :class="{ 'filter-button-active': activeStatusFilter === filter.value }"
            type="button"
            @click="activeStatusFilter = filter.value"
          >
            <span data-test="status-summary">{{ filter.label }} {{ filter.count }}</span>
          </button>
        </div>

        <div v-if="requests.length > 0" class="filter-bar">
          <label>
            <span>Search</span>
            <input
              v-model="searchText"
              data-test="request-search"
              autocomplete="off"
              type="search"
            />
          </label>
          <label>
            <span>Origin</span>
            <input
              v-model="filterOrigin"
              data-test="filter-origin"
              autocomplete="off"
              list="relocation-place-options"
              type="text"
            />
          </label>
          <label>
            <span>Destination</span>
            <input
              v-model="filterDestination"
              data-test="filter-destination"
              autocomplete="off"
              list="relocation-place-options"
              type="text"
            />
          </label>
          <label>
            <span>From</span>
            <input v-model="filterFrom" data-test="filter-from" type="date" />
          </label>
          <label>
            <span>To</span>
            <input v-model="filterTo" data-test="filter-to" type="date" />
          </label>
        </div>

        <p v-if="requests.length === 0" class="state-message">
          No relocation requests yet.
        </p>

        <p v-else-if="filteredRequests.length === 0" class="state-message">
          No relocation requests match this status.
        </p>

        <div v-else class="request-list">
          <article
            v-for="request in filteredRequests"
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
              <p
                v-if="request.status === 'booked' || request.status === 'completed'"
                data-test="assignment"
                class="assignment"
              >
                {{ assignmentLabel(request) }}
              </p>
            </div>
            <span data-test="status" class="status-pill">
              {{ statusLabel(request.status) }}
            </span>
            <button
              data-test="edit-request"
              class="secondary-button"
              type="button"
              @click="editRequest(request)"
            >
              Edit
            </button>
            <button
              v-if="canCancel(request)"
              data-test="cancel-request"
              class="secondary-button"
              type="button"
              @click="cancelRequest(request)"
            >
              Cancel
            </button>
          </article>
        </div>
      </template>
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
  align-self: end;
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

.status-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.filter-bar {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(180px, 1.4fr) repeat(4, minmax(120px, 1fr));
  margin-top: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.filter-button {
  background: #eef2f7;
  border: 0;
  border-radius: 999px;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  min-height: 34px;
  padding: 0 12px;
}

.filter-button-active {
  background: #dbeafe;
  color: #1d4ed8;
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

.assignment {
  color: #4d5c72;
  font-size: 0.86rem;
  font-weight: 700;
  margin: 6px 0 0;
  overflow-wrap: anywhere;
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

  .panel-header {
    align-items: stretch;
    flex-direction: column;
  }

  .request-form {
    grid-template-columns: 1fr;
  }

  .filter-bar {
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
