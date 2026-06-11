import { describe, expect, it } from "vitest";

import { buildDatasetIndex } from "../domain/events";
import {
  buildPeopleExplorerRecords,
  filterPeopleExplorerRecords,
  formatRelationshipType,
  getDefaultPersonIdForEvent,
  getPersonExplorerProfile
} from "../domain/people";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("people domain helpers", () => {
  it("builds person records with appearance, place, and relationship counts", () => {
    const dataset = createValidDataset();

    dataset.people.push({
      ...dataset.people[0]!,
      id: "paul",
      name: "Paul",
      aliases: ["Saul"],
      role: "Apostle"
    });
    dataset.places.push({
      ...dataset.places[0]!,
      id: "damascus",
      name: "Damascus"
    });
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "Jerusalem Event",
        participants: ["peter", "paul"],
        related_event_ids: []
      },
      {
        ...dataset.events[0]!,
        id: "acts_002",
        title: "Damascus Event",
        location_id: "damascus",
        participants: ["paul"],
        date: {
          start_year: 34,
          end_year: 35,
          certainty: "estimated"
        },
        related_event_ids: []
      }
    ];
    dataset.relationships = [
      {
        ...dataset.relationships[0]!,
        id: "relationship_001",
        from_id: "peter",
        from_type: "person",
        to_id: "paul",
        to_type: "person",
        relationship_type: "ministry_partner"
      }
    ];

    const records = buildPeopleExplorerRecords(dataset, buildDatasetIndex(dataset));

    expect(records.map((record) => record.person.id)).toEqual(["paul", "peter"]);
    expect(records[0]).toMatchObject({
      appearanceCount: 2,
      placeCount: 2,
      relationshipCount: 1
    });
  });

  it("filters person records by name, alias, role, and summary text", () => {
    const dataset = createValidDataset();

    dataset.people[0] = {
      ...dataset.people[0]!,
      aliases: ["Simon Peter"],
      role: "Apostle",
      summary: "A leading witness in Jerusalem."
    };

    const records = buildPeopleExplorerRecords(dataset, buildDatasetIndex(dataset));

    expect(filterPeopleExplorerRecords(records, "Simon")).toHaveLength(1);
    expect(filterPeopleExplorerRecords(records, "apostle")).toHaveLength(1);
    expect(filterPeopleExplorerRecords(records, "Jerusalem")).toHaveLength(1);
  });

  it("builds person profiles with appearances, places, and normalized relationships", () => {
    const dataset = createValidDataset();

    dataset.people.push({
      ...dataset.people[0]!,
      id: "cornelius",
      name: "Cornelius",
      role: "Roman centurion"
    });
    dataset.places.push({
      ...dataset.places[0]!,
      id: "caesarea",
      name: "Caesarea Maritima",
      region: "Judea",
      modern_country: "Israel"
    });
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "acts_001",
        title: "Conversion of Cornelius",
        location_id: "caesarea",
        participants: ["peter", "cornelius"],
        related_event_ids: []
      }
    ];
    dataset.relationships = [
      {
        ...dataset.relationships[0]!,
        id: "relationship_001",
        from_id: "peter",
        from_type: "person",
        to_id: "cornelius",
        to_type: "person",
        relationship_type: "evangelized"
      }
    ];

    const profile = getPersonExplorerProfile(
      "cornelius",
      dataset,
      buildDatasetIndex(dataset)
    );

    expect(profile?.appearances.map((appearance) => appearance.id)).toEqual(["acts_001"]);
    expect(profile?.relatedPlaces.map((place) => place.id)).toEqual(["caesarea"]);
    expect(profile?.relationshipConnections[0]).toMatchObject({
      relatedEntityId: "peter",
      relatedEntityLabel: "Peter",
      relationshipTypeLabel: "Evangelized",
      direction: "incoming"
    });
  });

  it("derives default event person focus and formats relationship labels", () => {
    const dataset = createValidDataset();
    const index = buildDatasetIndex(dataset);

    expect(getDefaultPersonIdForEvent(dataset.events[0]!, index)).toBe("peter");
    expect(formatRelationshipType("missionary_companion")).toBe("Missionary Companion");
  });
});
