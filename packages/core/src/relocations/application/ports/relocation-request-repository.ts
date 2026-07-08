import type { RelocationRequest } from "../../domain/relocation-request.js";

export interface RelocationRequestRepository {
  save(request: RelocationRequest): Promise<void>;
  list(): Promise<RelocationRequest[]>;
}
