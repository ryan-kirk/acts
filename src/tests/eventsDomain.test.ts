import { describe, expect, it } from "vitest";

import {
  buildDatasetIndex,
  filterEventsByQuery,
  formatLocationCertainty,
  formatSourceType,
  getDateCertaintyDescription,
  getEventsForPerson,
  getEventsForPlace,
  getEventsForSource,
  getRelatedEvents,
  sortEventsChronologically
} from "../domain/events";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("events domain helpers", () => {
  it("sorts events deterministically by date then title", () => {
    const dataset = createValidDataset();
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_010",
        title: "Later Event",
        date: {
          start_year: 50,
          end_year: 50,
          certainty: "estimated"
        }
      },
      {
        ...dataset.events[0]!,
        id: "acts_009",
        title: "Earlier Event",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      },
      {
        ...dataset.events[0]!,
        id: "acts_011",
        title: "Earlier Event B",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      }
    ];

    const sortedEvents = sortEventsChronologically(dataset.events);

    expect(sortedEvents.map((event) => event.id)).toEqual([
      "acts_009",
      "acts_011",
      "acts_010"
    ]);
  });

  it("filters events by location, participant, and citation text", () => {
    const dataset = createValidDataset();
    const datasetIndex = buildDatasetIndex(dataset);

    expect(filterEventsByQuery(dataset.events, "Jerusalem", datasetIndex)).toHaveLength(1);
    expect(filterEventsByQuery(dataset.events, "Peter", datasetIndex)).toHaveLength(1);
    expect(filterEventsByQuery(dataset.events, "Acts 1:1-11", datasetIndex)).toHaveLength(1);
  });

  it("resolves related events and entity appearance lists from normalized ids", () => {
    const dataset = createValidDataset();
    dataset.places.push({
      ...dataset.places[0]!,
      id: "damascus",
      name: "Damascus"
    });
    dataset.people.push({
      ...dataset.people[0]!,
      id: "paul",
      name: "Paul"
    });
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "First Event",
        related_event_ids: ["acts_003", "acts_002"],
        participants: ["peter"],
        location_id: "jerusalem",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-11"
          }
        ]
      },
      {
        ...dataset.events[0]!,
        id: "acts_002",
        title: "Second Event",
        participants: ["paul"],
        location_id: "damascus",
        date: {
          start_year: 34,
          end_year: 35,
          certainty: "estimated"
        },
        related_event_ids: [],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 9:1-22"
          }
        ]
      },
      {
        ...dataset.events[0]!,
        id: "acts_003",
        title: "Third Event",
        participants: ["peter", "paul"],
        location_id: "jerusalem",
        date: {
          start_year: 40,
          end_year: 40,
          certainty: "estimated"
        },
        related_event_ids: [],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 10:1-48"
          }
        ]
      }
    ];

    const datasetIndex = buildDatasetIndex(dataset);

    expect(getRelatedEvents(dataset.events[0]!, datasetIndex).map((event) => event.id)).toEqual([
      "acts_002",
      "acts_003"
    ]);
    expect(getEventsForPlace("jerusalem", dataset.events).map((event) => event.id)).toEqual([
      "acts_001",
      "acts_003"
    ]);
    expect(getEventsForPerson("paul", dataset.events).map((event) => event.id)).toEqual([
      "acts_002",
      "acts_003"
    ]);
    expect(getEventsForSource("acts", dataset.events)).toHaveLength(3);
  });

  it("formats inspector labels and explanations consistently", () => {
    expect(getDateCertaintyDescription("estimated")).toContain("best-fit year");
    expect(formatLocationCertainty("traditional")).toBe("Traditional");
    expect(formatSourceType("scholarly_article")).toBe("Scholarly Article");
  });
});
