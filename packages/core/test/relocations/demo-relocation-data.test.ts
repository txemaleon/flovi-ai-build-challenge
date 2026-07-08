import { describe, expect, it } from "vitest";
import {
  demoRelocationRequests,
  filterRelocationRequests,
  getRelocationPlaceOptions
} from "../../src/relocations/index.js";

describe("demo relocation data and filtering", () => {
  it("provides a populated Spain demo dataset with all lifecycle statuses", () => {
    expect(demoRelocationRequests).toHaveLength(28);
    expect(new Set(demoRelocationRequests.map((request) => request.status))).toEqual(
      new Set(["available", "booked", "completed", "cancelled"])
    );

    const places = new Set(
      demoRelocationRequests.flatMap((request) => [
        request.origin,
        request.destination
      ])
    );

    expect([...places].sort((left, right) => left.localeCompare(right))).toEqual(
      expect.arrayContaining([
        "Madrid",
        "Barcelona",
        "Valencia",
        "Seville",
        "Malaga",
        "Marbella",
        "Bilbao",
        "San Sebastian",
        "Zaragoza",
        "Alicante",
        "A Coruna",
        "Palma"
      ])
    );
  });

  it("filters relocation requests by text, places, status, and scheduled window", () => {
    const filtered = filterRelocationRequests(demoRelocationRequests, {
      searchText: "coastal",
      origin: "Malaga",
      destination: "Marbella",
      status: "available",
      scheduledFrom: "2026-07-12T00:00:00.000Z",
      scheduledTo: "2026-07-20T23:59:59.999Z"
    });

    expect(filtered).toEqual([
      expect.objectContaining({
        origin: "Malaga",
        destination: "Marbella",
        status: "available",
        notes: expect.stringContaining("coastal")
      })
    ]);
  });

  it("sorts filtered relocation requests by scheduled pickup time", () => {
    expect(
      filterRelocationRequests(demoRelocationRequests, {
        origin: "Malaga"
      }).map((request) => request.id)
    ).toEqual(["demo-005", "demo-017", "demo-027"]);
  });

  it("returns sorted place options for origin and destination autocomplete", () => {
    expect(getRelocationPlaceOptions(demoRelocationRequests)).toEqual([
      "A Coruna",
      "Alicante",
      "Barcelona",
      "Bilbao",
      "Madrid",
      "Malaga",
      "Marbella",
      "Palma",
      "San Sebastian",
      "Seville",
      "Valencia",
      "Zaragoza"
    ]);
  });
});
