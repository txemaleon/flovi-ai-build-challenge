import {
  createRelocationRequest,
  listRelocationRequests,
  type RelocationRequestRepository
} from "@flovi/core";
import type { DispatcherRelocationService } from "./dispatcherRelocationService.js";

export type CreateDispatcherRelocationServiceOptions = Readonly<{
  dispatcherId: string;
  relocationRequests: RelocationRequestRepository;
  generateId?: () => string;
}>;

export function createDispatcherRelocationService(
  options: CreateDispatcherRelocationServiceOptions
): DispatcherRelocationService {
  return {
    listRelocationRequests: () =>
      listRelocationRequests({
        relocationRequests: options.relocationRequests
      }),
    createRelocationRequest: (input) =>
      createRelocationRequest(
        {
          dispatcherId: options.dispatcherId,
          origin: input.origin,
          destination: input.destination,
          scheduledAt: input.scheduledAt,
          notes: input.notes
        },
        {
          relocationRequests: options.relocationRequests,
          generateId: options.generateId
        }
      )
  };
}
