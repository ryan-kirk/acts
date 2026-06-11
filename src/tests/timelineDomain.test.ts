import { describe, expect, it } from "vitest";

import type { Event } from "../domain/dataset";
import {
  defaultTimelineFilters,
  filterTimelineEvents,
  getTimelineEraForEvent,
  groupEventsByTimelineEra
} from "../domain/timeline";
import { createValidDataset } from "./fixtures/datasetFixtures";

function createEvent(overrides: Partial<Event>): Event {
  const baseEvent = createValidDataset().events[0]!;

  return {
    ...baseEvent,
    ...overrides,
    date: {
      ...baseEvent.date,
      ...overrides.date
    },
    participants: overrides.participants ?? baseEvent.participants,
    tag_ids: overrides.tag_ids ?? baseEvent.tag_ids,
    source_refs: overrides.source_refs ?? baseEvent.source_refs,
    related_event_ids: overrides.related_event_ids ?? baseEvent.related_event_ids
  };
}

describe("timeline domain helpers", () => {
  it("filters timeline events across category, person, place, certainty, and date range", () => {
    const events = [
      createEvent({
        id: "acts_001",
        title: "Jerusalem Witness",
        location_id: "jerusalem",
        participants: ["peter"],
        tag_ids: ["apostles"],
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      }),
      createEvent({
        id: "acts_002",
        title: "Philippi Mission",
        location_id: "philippi",
        participants: ["paul"],
        tag_ids: ["mission_journey"],
        date: {
          start_year: 50,
          end_year: 51,
          certainty: "estimated"
        }
      }),
      createEvent({
        id: "acts_003",
        title: "Corinth Debate",
        location_id: "corinth",
        participants: ["paul"],
        tag_ids: ["preaching"],
        date: {
          start_year: 51,
          end_year: 51,
          certainty: "approximate"
        }
      })
    ];

    const filteredEvents = filterTimelineEvents(events, {
      ...defaultTimelineFilters,
      tagId: "mission_journey",
      participantId: "paul",
      locationId: "philippi",
      certainty: "estimated",
      startYear: 50,
      endYear: 51
    });

    expect(filteredEvents.map((event) => event.id)).toEqual(["acts_002"]);
  });

  it("assigns events to stable era bands and keeps undated records separate", () => {
    const groups = groupEventsByTimelineEra([
      createEvent({
        id: "acts_010",
        title: "Rome Imprisonment",
        date: {
          start_year: 61,
          end_year: 62,
          certainty: "estimated"
        }
      }),
      createEvent({
        id: "acts_009",
        title: "Jerusalem Beginning",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        }
      }),
      createEvent({
        id: "acts_011",
        title: "Undated Event",
        date: {
          start_year: null,
          end_year: null,
          certainty: "unknown"
        }
      })
    ]);

    expect(groups.map((group) => group.era.id)).toEqual([
      "jerusalem_witness",
      "journeys_to_rome",
      "undated"
    ]);
    expect(groups[0]?.events[0]?.title).toBe("Jerusalem Beginning");
    expect(groups[2]?.events[0]?.title).toBe("Undated Event");
  });

  it("prefers a single era even when a ranged event touches a boundary year", () => {
    const boundaryEvent = createEvent({
      id: "acts_020",
      title: "Boundary Event",
      date: {
        start_year: 35,
        end_year: 36,
        certainty: "estimated"
      }
    });

    expect(getTimelineEraForEvent(boundaryEvent).id).toBe("jerusalem_witness");
  });
});
