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

  it("rejects malformed literary unit passage ranges", () => {
    const dataset = createValidDataset();
    dataset.literary_units[0]!.passage = {
      start_chapter: 3,
      start_verse: 12,
      end_chapter: 3,
      end_verse: 2
    };

    expect(() => validateDataset(dataset)).toThrow(
      /Passage ranges within one chapter must not end before they begin/
    );
  });

  it("rejects book metadata that points to unknown recipients or composition places", () => {
    const dataset = createValidDataset();
    dataset.books[0]!.recipient_person_ids = ["missing_recipient"];
    dataset.books[0]!.composition_place_id = "missing_place";

    expect(() => validateDataset(dataset)).toThrow(
      /Unknown recipient_person_id 'missing_recipient'/
    );
    expect(() => validateDataset(dataset)).toThrow(
      /Unknown composition_place_id 'missing_place'/
    );
  });

  it("rejects literary units that point to unknown books or related events", () => {
    const dataset = createValidDataset();
    dataset.literary_units[0]!.book_id = "missing_book";
    dataset.literary_units[0]!.related_event_ids = ["missing_event"];

    expect(() => validateDataset(dataset)).toThrow(/Unknown book_id 'missing_book'/);
    expect(() => validateDataset(dataset)).toThrow(
      /Unknown literary unit related_event_id 'missing_event'/
    );
  });

  it("requires source usage rights metadata to be tracked", () => {
    const dataset = createValidDataset();
    // @ts-expect-error intentional fixture corruption for validation coverage
    delete dataset.sources[0]!.usage_rights;

    expect(() => validateDataset(dataset)).toThrow(/usage_rights/);
  });

  it("requires scripture legal guardrails to include a commercial-use note when permission is required", () => {
    const dataset = createValidDataset();
    dataset.sources[0]!.usage_rights.requires_written_permission_for_commercial_use = true;
    delete dataset.sources[0]!.usage_rights.commercial_use_note;

    expect(() => validateDataset(dataset)).toThrow(/commercial_use_note/);
  });
});
