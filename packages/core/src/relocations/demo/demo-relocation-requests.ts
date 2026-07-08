import type {
  RelocationRequest,
  RelocationRequestStatus
} from "../domain/relocation-request.js";

export const demoDispatcherId = "demo-dispatcher";
export const demoDriverId = "demo-driver";
export const secondaryDemoDriverId = "demo-driver-2";

export const demoRelocationRequests = [
  {
    id: "demo-001",
    dispatcherId: demoDispatcherId,
    origin: "Madrid",
    destination: "Barcelona",
    scheduledAt: "2026-07-12T08:30:00.000Z",
    notes: "Executive sedan ready at the airport lot.",
    status: "available"
  },
  {
    id: "demo-002",
    dispatcherId: demoDispatcherId,
    origin: "Barcelona",
    destination: "Valencia",
    scheduledAt: "2026-07-12T11:00:00.000Z",
    notes: "Compact vehicle with charging card.",
    status: "booked",
    driverId: demoDriverId
  },
  {
    id: "demo-003",
    dispatcherId: demoDispatcherId,
    origin: "Valencia",
    destination: "Alicante",
    scheduledAt: "2026-07-12T15:45:00.000Z",
    notes: "Suggested continuation from Valencia.",
    status: "available"
  },
  {
    id: "demo-004",
    dispatcherId: demoDispatcherId,
    origin: "Seville",
    destination: "Malaga",
    scheduledAt: "2026-07-13T09:15:00.000Z",
    notes: "Completed transfer from station garage.",
    status: "completed",
    driverId: demoDriverId
  },
  {
    id: "demo-005",
    dispatcherId: demoDispatcherId,
    origin: "Malaga",
    destination: "Marbella",
    scheduledAt: "2026-07-13T13:30:00.000Z",
    notes: "coastal hotel handoff with valet contact.",
    status: "available"
  },
  {
    id: "demo-006",
    dispatcherId: demoDispatcherId,
    origin: "Bilbao",
    destination: "San Sebastian",
    scheduledAt: "2026-07-13T16:00:00.000Z",
    notes: "Cancelled after customer changed pickup.",
    status: "cancelled"
  },
  {
    id: "demo-007",
    dispatcherId: demoDispatcherId,
    origin: "Zaragoza",
    destination: "Madrid",
    scheduledAt: "2026-07-14T08:00:00.000Z",
    notes: "SUV, return paperwork in glovebox.",
    status: "available"
  },
  {
    id: "demo-008",
    dispatcherId: demoDispatcherId,
    origin: "A Coruna",
    destination: "Bilbao",
    scheduledAt: "2026-07-14T10:30:00.000Z",
    notes: "Booked northern corridor relocation.",
    status: "booked",
    driverId: secondaryDemoDriverId
  },
  {
    id: "demo-009",
    dispatcherId: demoDispatcherId,
    origin: "Palma",
    destination: "Barcelona",
    scheduledAt: "2026-07-14T12:15:00.000Z",
    notes: "Ferry arrival confirmed.",
    status: "available"
  },
  {
    id: "demo-010",
    dispatcherId: demoDispatcherId,
    origin: "Alicante",
    destination: "Valencia",
    scheduledAt: "2026-07-14T17:30:00.000Z",
    notes: "Completed same-day coastal return.",
    status: "completed",
    driverId: secondaryDemoDriverId
  },
  {
    id: "demo-011",
    dispatcherId: demoDispatcherId,
    origin: "Madrid",
    destination: "Seville",
    scheduledAt: "2026-07-15T07:45:00.000Z",
    notes: "Open request, train station delivery.",
    status: "available"
  },
  {
    id: "demo-012",
    dispatcherId: demoDispatcherId,
    origin: "San Sebastian",
    destination: "Bilbao",
    scheduledAt: "2026-07-15T09:00:00.000Z",
    notes: "Booked short-hop handoff.",
    status: "booked",
    driverId: demoDriverId
  },
  {
    id: "demo-013",
    dispatcherId: demoDispatcherId,
    origin: "Bilbao",
    destination: "Zaragoza",
    scheduledAt: "2026-07-15T12:30:00.000Z",
    notes: "Suggested after Bilbao drop-off.",
    status: "available"
  },
  {
    id: "demo-014",
    dispatcherId: demoDispatcherId,
    origin: "Barcelona",
    destination: "Palma",
    scheduledAt: "2026-07-15T18:45:00.000Z",
    notes: "Cancelled due to ferry delay.",
    status: "cancelled"
  },
  {
    id: "demo-015",
    dispatcherId: demoDispatcherId,
    origin: "Marbella",
    destination: "Malaga",
    scheduledAt: "2026-07-16T08:20:00.000Z",
    notes: "Convertible, pickup at resort valet.",
    status: "available"
  },
  {
    id: "demo-016",
    dispatcherId: demoDispatcherId,
    origin: "Valencia",
    destination: "Zaragoza",
    scheduledAt: "2026-07-16T10:10:00.000Z",
    notes: "Completed regional fleet balancing move.",
    status: "completed",
    driverId: demoDriverId
  },
  {
    id: "demo-017",
    dispatcherId: demoDispatcherId,
    origin: "Malaga",
    destination: "Seville",
    scheduledAt: "2026-07-16T14:00:00.000Z",
    notes: "Booked airport-to-city relocation.",
    status: "booked",
    driverId: secondaryDemoDriverId
  },
  {
    id: "demo-018",
    dispatcherId: demoDispatcherId,
    origin: "Alicante",
    destination: "Madrid",
    scheduledAt: "2026-07-17T08:45:00.000Z",
    notes: "Open high-priority sedan transfer.",
    status: "available"
  },
  {
    id: "demo-019",
    dispatcherId: demoDispatcherId,
    origin: "Seville",
    destination: "Marbella",
    scheduledAt: "2026-07-17T12:00:00.000Z",
    notes: "Cancelled by dispatcher after duplicate booking.",
    status: "cancelled"
  },
  {
    id: "demo-020",
    dispatcherId: demoDispatcherId,
    origin: "Zaragoza",
    destination: "Barcelona",
    scheduledAt: "2026-07-17T15:15:00.000Z",
    notes: "Open EV transfer, charging cable included.",
    status: "available"
  },
  {
    id: "demo-021",
    dispatcherId: demoDispatcherId,
    origin: "A Coruna",
    destination: "Madrid",
    scheduledAt: "2026-07-18T09:30:00.000Z",
    notes: "Completed long-haul delivery.",
    status: "completed",
    driverId: secondaryDemoDriverId
  },
  {
    id: "demo-022",
    dispatcherId: demoDispatcherId,
    origin: "Palma",
    destination: "Alicante",
    scheduledAt: "2026-07-18T13:40:00.000Z",
    notes: "Open island arrival request.",
    status: "available"
  },
  {
    id: "demo-023",
    dispatcherId: demoDispatcherId,
    origin: "Madrid",
    destination: "A Coruna",
    scheduledAt: "2026-07-18T16:25:00.000Z",
    notes: "Booked northbound delivery.",
    status: "booked",
    driverId: demoDriverId
  },
  {
    id: "demo-024",
    dispatcherId: demoDispatcherId,
    origin: "Barcelona",
    destination: "Bilbao",
    scheduledAt: "2026-07-19T08:05:00.000Z",
    notes: "Open dealer exchange.",
    status: "available"
  },
  {
    id: "demo-025",
    dispatcherId: demoDispatcherId,
    origin: "San Sebastian",
    destination: "A Coruna",
    scheduledAt: "2026-07-19T11:50:00.000Z",
    notes: "Completed northern coast transfer.",
    status: "completed",
    driverId: demoDriverId
  },
  {
    id: "demo-026",
    dispatcherId: demoDispatcherId,
    origin: "Marbella",
    destination: "Valencia",
    scheduledAt: "2026-07-19T17:35:00.000Z",
    notes: "Cancelled maintenance hold.",
    status: "cancelled"
  },
  {
    id: "demo-027",
    dispatcherId: demoDispatcherId,
    origin: "Malaga",
    destination: "Marbella",
    scheduledAt: "2026-07-21T09:00:00.000Z",
    notes: "Later coastal request outside the default window.",
    status: "available"
  },
  {
    id: "demo-028",
    dispatcherId: demoDispatcherId,
    origin: "Bilbao",
    destination: "Madrid",
    scheduledAt: "2026-07-21T15:20:00.000Z",
    notes: "Booked return to central fleet.",
    status: "booked",
    driverId: secondaryDemoDriverId
  }
] as const satisfies readonly RelocationRequest[];

export type RelocationRequestStatusFilter = RelocationRequestStatus | "all";

export type RelocationRequestFilters = Readonly<{
  searchText?: string;
  origin?: string;
  destination?: string;
  status?: RelocationRequestStatusFilter;
  scheduledFrom?: string;
  scheduledTo?: string;
}>;

export function filterRelocationRequests(
  requests: readonly RelocationRequest[],
  filters: RelocationRequestFilters
): RelocationRequest[] {
  const normalizedSearch = filters.searchText?.trim().toLowerCase() ?? "";

  return requests
    .filter((request) =>
      normalizedSearch
        ? [
            request.origin,
            request.destination,
            request.notes,
            request.status,
            request.driverId ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true
    )
    .filter((request) => !filters.origin || request.origin === filters.origin)
    .filter(
      (request) =>
        !filters.destination || request.destination === filters.destination
    )
    .filter(
      (request) =>
        !filters.status ||
        filters.status === "all" ||
        request.status === filters.status
    )
    .filter(
      (request) =>
        !filters.scheduledFrom || request.scheduledAt >= filters.scheduledFrom
    )
    .filter(
      (request) =>
        !filters.scheduledTo || request.scheduledAt <= filters.scheduledTo
    )
    .slice()
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
}

export function getRelocationPlaceOptions(
  requests: readonly RelocationRequest[]
): string[] {
  return [...new Set(requests.flatMap((request) => [
    request.origin,
    request.destination
  ]))].sort((left, right) => left.localeCompare(right));
}
