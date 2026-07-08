import type { RelocationRequest } from "@flovi/core";

export type CreateRelocationRequestInput = Readonly<{
  origin: string;
  destination: string;
  scheduledAt: string;
  notes: string;
}>;

export type DispatcherRelocationService = Readonly<{
  listRelocationRequests(): Promise<RelocationRequest[]>;
  createRelocationRequest(
    input: CreateRelocationRequestInput
  ): Promise<RelocationRequest>;
}>;
