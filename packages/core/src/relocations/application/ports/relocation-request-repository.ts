import type { RelocationRequest } from "../../domain/relocation-request.js";
import type { UpdateRelocationRequestFields } from "../update-relocation-request.js";

export interface RelocationRequestRepository {
  save(request: RelocationRequest): Promise<void>;
  list(): Promise<RelocationRequest[]>;
  update(request: UpdateRelocationRequestFields): Promise<RelocationRequest>;
  bookAvailable(requestId: string, driverId: string): Promise<RelocationRequest>;
  cancelOpenOrBooked(requestId: string): Promise<RelocationRequest>;
  completeBooked(requestId: string, driverId: string): Promise<RelocationRequest>;
}
