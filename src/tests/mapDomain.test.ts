import { describe, expect, it } from "vitest";

import { buildDatasetIndex } from "../domain/events";
import {
  getActiveMapPlaceRecord,
  getMapJourneyOverlays,
  getMapPlaceRecords
} from "../domain/map";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("map domain helpers", () => {
  it("builds grouped place records from renderable coordinates only", () => {
    const dataset = createValidDataset();

    dataset.places.push(
      {
        ...dataset.places[0]!,
        id: "antioch",
        name: "Antioch",
        latitude: 36.2021,
        longitude: 36.1606,
        location_certainty: "approximate"
      },
      {
        ...dataset.places[0]!,
        id: "unknown_place",
        name: "Unknown Place",
        latitude: 112,
        longitude: 22
      }
    );

    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "Jerusalem Event",
        journey_id: "missionary_journey_1",
        related_event_ids: []
      },
      {
        ...dataset.events[0]!,
        id: "acts_002",
        title: "Antioch Event",
        location_id: "antioch",
        journey_id: "missionary_journey_1",
        date: {
          start_year: 45,
          end_year: 45,
          certainty: "estimated"
        },
        related_event_ids: []
      },
      {
        ...dataset.events[0]!,
        id: "acts_003",
        title: "Hidden Event",
        location_id: "unknown_place",
        date: {
          start_year: 46,
          end_year: 46,
          certainty: "estimated"
        },
        related_event_ids: []
      }
    ];

    const records = getMapPlaceRecords(dataset.events, buildDatasetIndex(dataset));

    expect(records.map((record) => record.place.id)).toEqual(["jerusalem", "antioch"]);
    expect(records[0]?.journeyIds).toEqual(["missionary_journey_1"]);
    expect(records[1]?.eventCount).toBe(1);
  });

  it("creates journey overlays in sequence order and links related journey events", () => {
    const dataset = createValidDataset();

    dataset.places.push(
      {
        ...dataset.places[0]!,
        id: "antioch",
        name: "Antioch",
        latitude: 36.2021,
        longitude: 36.1606,
        location_certainty: "approximate"
      },
      {
        ...dataset.places[0]!,
        id: "unknown_place",
        name: "Unknown Place",
        latitude: 112,
        longitude: 22
      }
    );

    dataset.journeys = [
      {
        ...dataset.journeys[0]!,
        id: "journey_valid",
        title: "Valid Journey",
        route: [
          {
            sequence: 2,
            place_id: "antioch"
          },
          {
            sequence: 1,
            place_id: "jerusalem"
          }
        ],
        related_event_ids: ["acts_001"]
      },
      {
        ...dataset.journeys[0]!,
        id: "journey_hidden",
        title: "Hidden Journey",
        route: [
          {
            sequence: 1,
            place_id: "unknown_place"
          },
          {
            sequence: 2,
            place_id: "missing_place"
          }
        ],
        related_event_ids: []
      }
    ];
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "Jerusalem Event",
        journey_id: "journey_valid",
        related_event_ids: []
      },
      {
        ...dataset.events[0]!,
        id: "acts_002",
        title: "Antioch Event",
        location_id: "antioch",
        journey_id: "journey_valid",
        date: {
          start_year: 45,
          end_year: 45,
          certainty: "estimated"
        },
        related_event_ids: []
      }
    ];

    const overlays = getMapJourneyOverlays(dataset, buildDatasetIndex(dataset));

    expect(overlays).toHaveLength(1);
    expect(overlays[0]?.id).toBe("journey_valid");
    expect(overlays[0]?.points).toEqual([
      [31.7683, 35.2137],
      [36.2021, 36.1606]
    ]);
    expect(overlays[0]?.stopRecords.map((stopRecord) => stopRecord.routePoint.sequence)).toEqual([
      1,
      2
    ]);
    expect(overlays[0]?.relatedEvents.map((event) => event.id)).toEqual([
      "acts_001",
      "acts_002"
    ]);
  });

  it("prefers explicit place focus before selected-event fallback", () => {
    const dataset = createValidDataset();

    dataset.places.push({
      ...dataset.places[0]!,
      id: "antioch",
      name: "Antioch",
      latitude: 36.2021,
      longitude: 36.1606,
      location_certainty: "approximate"
    });

    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "Jerusalem Event",
        related_event_ids: []
      },
      {
        ...dataset.events[0]!,
        id: "acts_002",
        title: "Antioch Event",
        location_id: "antioch",
        date: {
          start_year: 45,
          end_year: 45,
          certainty: "estimated"
        },
        related_event_ids: []
      }
    ];

    const index = buildDatasetIndex(dataset);
    const placeRecords = getMapPlaceRecords(dataset.events, index);

    expect(getActiveMapPlaceRecord("jerusalem", "acts_002", placeRecords, index)?.place.id).toBe(
      "jerusalem"
    );
    expect(getActiveMapPlaceRecord(null, "acts_002", placeRecords, index)?.place.id).toBe(
      "antioch"
    );
    expect(getActiveMapPlaceRecord(null, "missing_event", placeRecords, index)?.place.id).toBe(
      "jerusalem"
    );
  });
});
