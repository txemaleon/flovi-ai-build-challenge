import type { RelocationRequestRepository } from "../application/ports/relocation-request-repository.js";
import type { UpdateRelocationRequestFields } from "../application/update-relocation-request.js";
import type {
  RelocationRequest,
  RelocationRequestStatus
} from "../domain/relocation-request.js";

type SupabaseError = Readonly<{
  message: string;
}>;

type SupabaseMutationResult = Readonly<{
  error: SupabaseError | null;
}>;

type SupabaseQueryResult<Row> = Readonly<{
  data: Row[];
  error: SupabaseError | null;
}>;

export type SupabaseRelocationRequestClient = Readonly<{
  from(table: "relocation_requests"): {
    insert(row: RelocationRequestRow): PromiseLike<SupabaseMutationResult>;
    update(row: RelocationRequestUpdateRow): SupabaseRelocationRequestUpdate;
    select(columns: string): {
      order(
        column: "scheduled_at",
        options: { ascending: boolean }
      ): PromiseLike<SupabaseQueryResult<RelocationRequestRow>>;
    };
  };
}>;

type SupabaseRelocationRequestUpdate = {
  eq(
    column: "id" | "status",
    value: string
  ): SupabaseRelocationRequestUpdate;
  select(columns?: string): {
    single(): PromiseLike<{
      data: RelocationRequestRow | null;
      error: SupabaseError | null;
    }>;
  };
};

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

type RelocationRequestUpdateRow =
  | Readonly<{
      origin: string;
      destination: string;
      scheduled_at: string;
      notes: string;
    }>
  | Readonly<{
      status: "booked";
      driver_id: string;
    }>;

const relocationRequestColumns =
  "id,dispatcher_id,origin,destination,scheduled_at,notes,status,driver_id";

export class SupabaseRelocationRequestRepository
  implements RelocationRequestRepository
{
  constructor(private readonly supabase: SupabaseRelocationRequestClient) {}

  async save(request: RelocationRequest): Promise<void> {
    const result = await this.supabase
      .from("relocation_requests")
      .insert(toRelocationRequestRow(request));

    if (result.error) {
      throw new Error(
        `Failed to save relocation request to Supabase: ${result.error.message}`
      );
    }
  }

  async list(): Promise<RelocationRequest[]> {
    const result = await this.supabase
      .from("relocation_requests")
      .select(relocationRequestColumns)
      .order("scheduled_at", { ascending: true });

    if (result.error) {
      throw new Error(
        `Failed to list relocation requests from Supabase: ${result.error.message}`
      );
    }

    return result.data.map(toRelocationRequest);
  }

  async update(
    request: UpdateRelocationRequestFields
  ): Promise<RelocationRequest> {
    const result = await this.supabase
      .from("relocation_requests")
      .update(toRelocationRequestUpdateRow(request))
      .eq("id", request.id)
      .select(relocationRequestColumns)
      .single();

    if (result.error) {
      throw new Error("Unable to update relocation request.");
    }

    return toRelocationRequest(result.data!);
  }

  async bookAvailable(
    requestId: string,
    driverId: string
  ): Promise<RelocationRequest> {
    const result = await this.supabase
      .from("relocation_requests")
      .update({
        status: "booked",
        driver_id: driverId
      })
      .eq("id", requestId)
      .eq("status", "available")
      .select(relocationRequestColumns)
      .single();

    if (result.error || !result.data) {
      throw new Error("Relocation request is not available.");
    }

    return toRelocationRequest(result.data);
  }
}

function toRelocationRequestRow(
  request: RelocationRequest
): RelocationRequestRow {
  return {
    id: request.id,
    dispatcher_id: request.dispatcherId,
    origin: request.origin,
    destination: request.destination,
    scheduled_at: request.scheduledAt,
    notes: request.notes,
    status: request.status,
    driver_id: request.driverId ?? null
  };
}

function toRelocationRequest(row: RelocationRequestRow): RelocationRequest {
  return {
    id: row.id,
    dispatcherId: row.dispatcher_id,
    origin: row.origin,
    destination: row.destination,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
    status: row.status,
    ...(row.driver_id ? { driverId: row.driver_id } : {})
  };
}

function toRelocationRequestUpdateRow(
  request: UpdateRelocationRequestFields
): RelocationRequestUpdateRow {
  return {
    origin: request.origin,
    destination: request.destination,
    scheduled_at: request.scheduledAt,
    notes: request.notes
  };
}
