import type { RelocationRequest } from "@flovi/core";

export type CreateRelocationRequestInput = Readonly<{
  origin: string;
  destination: string;
  scheduledAt: string;
  notes: string;
}>;

export type UpdateRelocationRequestInput = CreateRelocationRequestInput &
  Readonly<{
    id: string;
  }>;

export type CancelRelocationRequestInput = Readonly<{
  requestId: string;
}>;

export type DispatcherRelocationService = Readonly<{
  listRelocationRequests(): Promise<RelocationRequest[]>;
  createRelocationRequest(
    input: CreateRelocationRequestInput
  ): Promise<RelocationRequest>;
  updateRelocationRequest(
    input: UpdateRelocationRequestInput
  ): Promise<RelocationRequest>;
  cancelRelocationRequest(
    input: CancelRelocationRequestInput
  ): Promise<RelocationRequest>;
}>;
