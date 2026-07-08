import { describe, expect, it } from "vitest";
import {
  SupabaseRelocationRequestRepository,
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
  status: "available";
}>;

type InsertResult = Readonly<{ error: SupabaseError | null }>;
type SelectResult = Readonly<{
  data: RelocationRequestRow[];
  error: SupabaseError | null;
}>;

class FakeSupabaseClient {
  readonly inserts: unknown[] = [];
  readonly selectedColumns: string[] = [];
  readonly orderedBy: Array<Readonly<{ column: string; ascending: boolean }>> =
    [];
  readonly tables: string[] = [];

  constructor(
    private readonly insertResult: InsertResult = { error: null },
    private readonly selectResult: SelectResult = { data: [], error: null }
  ) {}

  from(table: string) {
    this.tables.push(table);

    return {
      insert: async (row: unknown) => {
        this.inserts.push(row);
        return this.insertResult;
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
        status: "available"
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
            status: "available"
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
      "id,dispatcher_id,origin,destination,scheduled_at,notes,status"
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
});
