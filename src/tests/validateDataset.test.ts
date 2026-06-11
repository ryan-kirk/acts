import { describe, expect, it } from "vitest";

import { validateDataset } from "../data/validateDataset";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("validateDataset", () => {
  it("accepts a valid canonical dataset", () => {
    const dataset = createValidDataset();

    expect(validateDataset(dataset)).toEqual(dataset);
  });

  it("rejects duplicate IDs in a collection", () => {
    const dataset = createValidDataset();
    dataset.people.push(structuredClone(dataset.people[0]!));

    expect(() => validateDataset(dataset)).toThrow(/Duplicate ID 'peter'/);
  });

  it("rejects missing source IDs", () => {
    const dataset = createValidDataset();
    dataset.events[0]!.source_refs[0]!.source_id = "missing_source";

    expect(() => validateDataset(dataset)).toThrow(/Unknown source_id 'missing_source'/);
  });

  it("rejects missing participant and location references", () => {
    const dataset = createValidDataset();
    dataset.events[0]!.participants = ["missing_person"];
    dataset.events[0]!.location_id = "missing_place";

    expect(() => validateDataset(dataset)).toThrow(/Unknown location_id 'missing_place'/);
    expect(() => validateDataset(dataset)).toThrow(/Unknown participant 'missing_person'/);
  });

  it("rejects invalid coordinates", () => {
    const dataset = createValidDataset();
    dataset.places[0]!.latitude = 100;

    expect(() => validateDataset(dataset)).toThrow();
  });

  it("rejects invalid date ranges", () => {
    const dataset = createValidDataset();
    dataset.events[0]!.date.start_year = 50;
    dataset.events[0]!.date.end_year = 40;

    expect(() => validateDataset(dataset)).toThrow(
      /start_year must be less than or equal to end_year/
    );
  });

  it("rejects invalid journey routes", () => {
    const dataset = createValidDataset();
    dataset.journeys[0]!.route = [
      { sequence: 1, place_id: "jerusalem" },
      { sequence: 3, place_id: "missing_place" }
    ];

    expect(() => validateDataset(dataset)).toThrow(
      /Journey routes must use contiguous sequence numbers starting at 1/
    );
    expect(() => validateDataset(dataset)).toThrow(
      /Unknown route place_id 'missing_place'/
    );
  });

  it("rejects duplicate journey route sequence numbers", () => {
    const dataset = createValidDataset();
    dataset.places.push({
      ...dataset.places[0]!,
      id: "antioch",
      name: "Antioch",
      latitude: 36.2021,
      longitude: 36.1606
    });
    dataset.journeys[0]!.route = [
      { sequence: 1, place_id: "jerusalem" },
      { sequence: 1, place_id: "antioch" }
    ];

    expect(() => validateDataset(dataset)).toThrow(
      /Journey routes must not contain duplicate sequence numbers/
    );
  });

  it("rejects relationships that point to unknown entities", () => {
    const dataset = createValidDataset();
    dataset.relationships[0]!.to_id = "missing_event";

    expect(() => validateDataset(dataset)).toThrow(/Unknown event ID 'missing_event'/);
  });

  it("requires source usage rights metadata to be tracked", () => {
    const dataset = createValidDataset();
    // @ts-expect-error intentional fixture corruption for validation coverage
    delete dataset.sources[0]!.usage_rights;

    expect(() => validateDataset(dataset)).toThrow(/usage_rights/);
  });
});
