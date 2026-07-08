import type { RelocationRequest } from "../../domain/relocation-request.js";
import type { UpdateRelocationRequestFields } from "../update-relocation-request.js";

export interface RelocationRequestRepository {
  save(request: RelocationRequest): Promise<void>;
  list(): Promise<RelocationRequest[]>;
  update(request: UpdateRelocationRequestFields): Promise<RelocationRequest>;
}
