import { describe, expect, it } from "vitest";
import {
  SupabaseRelocationRequestRepository,
  type RelocationRequestStatus,
  type RelocationRequest
} from "../../src/relocations/index.js";

type SupabaseError = Readonly<{ message: string }>;

type RelocationRequestRow = Readonly<{
  id: string;
  dispatcher_id: string;
  origin: string;
  destination: string;
  scheduled_at: string;
  notes: string;
  status: RelocationRequestStatus;
  driver_id: string | null;
}>;

type InsertResult = Readonly<{ error: SupabaseError | null }>;
type SelectResult = Readonly<{
  data: RelocationRequestRow[];
  error: SupabaseError | null;
}>;

class FakeSupabaseClient {
  readonly inserts: unknown[] = [];
  readonly updates: unknown[] = [];
  readonly updateFilters: Array<Readonly<{ column: string; value: unknown }>> =
    [];
  readonly updateInFilters: Array<
    Readonly<{ column: string; values: readonly unknown[] }>
  > = [];
  readonly selectedColumns: string[] = [];
  readonly orderedBy: Array<Readonly<{ column: string; ascending: boolean }>> =
    [];
  readonly tables: string[] = [];

  constructor(
    private readonly insertResult: InsertResult = { error: null },
    private readonly selectResult: SelectResult = { data: [], error: null },
    private readonly updateResult: SelectResult = { data: [], error: null }
  ) {}

  from(table: string) {
    this.tables.push(table);

    return {
      insert: async (row: unknown) => {
        this.inserts.push(row);
        return this.insertResult;
      },
      update: (row: unknown) => {
        this.updates.push(row);

        const updateFilter = {
          eq: (column: string, value: unknown) => {
            this.updateFilters.push({ column, value });

            return updateFilter;
          },
          in: (column: string, values: readonly unknown[]) => {
            this.updateInFilters.push({ column, values });

            return updateFilter;
          },
          select: () => ({
            single: async () => ({
              data: this.updateResult.data[0] ?? null,
              error: this.updateResult.error
            })
          })
        };

        return updateFilter;
      },
      select: (columns: string) => {
        this.selectedColumns.push(columns);

        return {
          order: async (column: string, options: { ascending: boolean }) => {
            this.orderedBy.push({ column, ascending: options.ascending });
            return this.selectResult;
          }
        };
      }
    };
  }
}

describe("SupabaseRelocationRequestRepository", () => {
  it("inserts a relocation request using relocation_requests snake_case columns", async () => {
    const supabase = new FakeSupabaseClient();
    const repository = new SupabaseRelocationRequestRepository(supabase);

    const request: RelocationRequest = {
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay.",
      status: "available"
    };

    await repository.save(request);

    expect(supabase.tables).toEqual(["relocation_requests"]);
    expect(supabase.inserts).toEqual([
      {
        id: "request-123",
        dispatcher_id: "dispatcher-123",
        origin: "Madrid Airport",
        destination: "Barcelona Sants",
        scheduled_at: "2026-07-09T09:30:00.000Z",
        notes: "Vehicle is parked in short stay.",
        status: "available",
        driver_id: null
      }
    ]);
  });

  it("maps Supabase relocation request rows back to domain relocation requests", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      {
        data: [
          {
            id: "request-456",
            dispatcher_id: "dispatcher-456",
            origin: "Valencia Port",
            destination: "Madrid Chamartin",
            scheduled_at: "2026-07-10T15:00:00.000Z",
            notes: "",
            status: "available",
            driver_id: null
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(repository.list()).resolves.toEqual([
      {
        id: "request-456",
        dispatcherId: "dispatcher-456",
        origin: "Valencia Port",
        destination: "Madrid Chamartin",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "",
        status: "available"
      }
    ]);
    expect(supabase.tables).toEqual(["relocation_requests"]);
    expect(supabase.selectedColumns).toEqual([
      "id,dispatcher_id,origin,destination,scheduled_at,notes,status,driver_id"
    ]);
    expect(supabase.orderedBy).toEqual([
      { column: "scheduled_at", ascending: true }
    ]);
  });

  it("surfaces Supabase insert failures clearly", async () => {
    const supabase = new FakeSupabaseClient({
      error: { message: "permission denied" }
    });
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.save({
        id: "request-789",
        dispatcherId: "dispatcher-789",
        origin: "Seville Station",
        destination: "Malaga Airport",
        scheduledAt: "2026-07-11T12:00:00.000Z",
        notes: "",
        status: "available"
      })
    ).rejects.toThrow(
      "Failed to save relocation request to Supabase: permission denied"
    );
  });

  it("surfaces Supabase select failures clearly", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      {
        data: [],
        error: { message: "network unavailable" }
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(repository.list()).rejects.toThrow(
      "Failed to list relocation requests from Supabase: network unavailable"
    );
  });

  it("updates editable relocation request fields using snake_case columns scoped by id", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [
          {
            id: "request-123",
            dispatcher_id: "dispatcher-123",
            origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduled_at: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket.",
        status: "available",
        driver_id: null
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.update({
        id: "request-123",
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket."
      })
    ).resolves.toEqual({
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Chamartin",
      destination: "Valencia Port",
      scheduledAt: "2026-07-10T15:00:00.000Z",
      notes: "Bring parking ticket.",
      status: "available"
    });
    expect(supabase.tables).toEqual(["relocation_requests"]);
    expect(supabase.updates).toEqual([
      {
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduled_at: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket."
      }
    ]);
    expect(supabase.updateFilters).toEqual([
      { column: "id", value: "request-123" }
    ]);
  });

  it("does not write status or driver ownership in the generic Supabase update payload", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [
          {
            id: "request-123",
            dispatcher_id: "dispatcher-123",
            origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduled_at: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket.",
        status: "available",
        driver_id: null
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await repository.update({
      id: "request-123",
      origin: "Madrid Chamartin",
      destination: "Valencia Port",
      scheduledAt: "2026-07-10T15:00:00.000Z",
      notes: "Bring parking ticket."
    });

    expect(supabase.updates).toEqual([
      {
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduled_at: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket."
      }
    ]);
  });

  it("books an available relocation request atomically in Supabase", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [
          {
            id: "request-123",
            dispatcher_id: "dispatcher-123",
            origin: "Madrid Airport",
            destination: "Barcelona Sants",
            scheduled_at: "2026-07-09T09:30:00.000Z",
            notes: "Vehicle is parked in short stay.",
            status: "booked",
            driver_id: "driver-456"
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.bookAvailable("request-123", "driver-456")
    ).resolves.toEqual({
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay.",
      status: "booked",
      driverId: "driver-456"
    });
    expect(supabase.updates).toEqual([
      {
        status: "booked",
        driver_id: "driver-456"
      }
    ]);
    expect(supabase.updateFilters).toEqual([
      { column: "id", value: "request-123" },
      { column: "status", value: "available" }
    ]);
  });

  it("surfaces unavailable Supabase booking attempts clearly", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [],
        error: { message: "JSON object requested, multiple (or no) rows returned" }
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.bookAvailable("request-123", "driver-456")
    ).rejects.toThrow("Relocation request is not available.");
  });

  it("cancels an open or booked relocation request atomically in Supabase", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [
          {
            id: "request-123",
            dispatcher_id: "dispatcher-123",
            origin: "Madrid Airport",
            destination: "Barcelona Sants",
            scheduled_at: "2026-07-09T09:30:00.000Z",
            notes: "Vehicle is parked in short stay.",
            status: "cancelled",
            driver_id: "driver-456"
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(repository.cancelOpenOrBooked("request-123")).resolves.toEqual({
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay.",
      status: "cancelled",
      driverId: "driver-456"
    });
    expect(supabase.updates).toEqual([{ status: "cancelled" }]);
    expect(supabase.updateFilters).toEqual([
      { column: "id", value: "request-123" }
    ]);
    expect(supabase.updateInFilters).toEqual([
      { column: "status", values: ["available", "booked"] }
    ]);
  });

  it("completes a booked relocation request for a driver atomically in Supabase", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [
          {
            id: "request-123",
            dispatcher_id: "dispatcher-123",
            origin: "Madrid Airport",
            destination: "Barcelona Sants",
            scheduled_at: "2026-07-09T09:30:00.000Z",
            notes: "Vehicle is parked in short stay.",
            status: "completed",
            driver_id: "driver-456"
          }
        ],
        error: null
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.completeBooked("request-123", "driver-456")
    ).resolves.toEqual({
      id: "request-123",
      dispatcherId: "dispatcher-123",
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Vehicle is parked in short stay.",
      status: "completed",
      driverId: "driver-456"
    });
    expect(supabase.updates).toEqual([{ status: "completed" }]);
    expect(supabase.updateFilters).toEqual([
      { column: "id", value: "request-123" },
      { column: "driver_id", value: "driver-456" },
      { column: "status", value: "booked" }
    ]);
  });

  it("surfaces unavailable Supabase cancellation attempts clearly", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [],
        error: { message: "no rows returned" }
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(repository.cancelOpenOrBooked("request-123")).rejects.toThrow(
      "Relocation request cannot be cancelled."
    );
  });

  it("surfaces unavailable Supabase completion attempts clearly", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [],
        error: { message: "no rows returned" }
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.completeBooked("request-123", "driver-456")
    ).rejects.toThrow("Relocation request is not booked for this driver.");
  });

  it("surfaces Supabase update failures clearly", async () => {
    const supabase = new FakeSupabaseClient(
      { error: null },
      { data: [], error: null },
      {
        data: [],
        error: { message: "row update denied" }
      }
    );
    const repository = new SupabaseRelocationRequestRepository(supabase);

    await expect(
      repository.update({
        id: "request-123",
        dispatcherId: "dispatcher-123",
        origin: "Madrid Chamartin",
        destination: "Valencia Port",
        scheduledAt: "2026-07-10T15:00:00.000Z",
        notes: "Bring parking ticket.",
        status: "available"
      })
    ).rejects.toThrow("Unable to update relocation request.");
  });
});
