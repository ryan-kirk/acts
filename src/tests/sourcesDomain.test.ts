import { describe, expect, it } from "vitest";

import type { CanonicalDataset } from "../domain/dataset";
import { buildDatasetIndex } from "../domain/events";
import {
  buildClaimExplorerRecords,
  buildSourceExplorerRecords,
  formatClaimConfidence,
  formatClaimType,
  formatRightsStatus,
  getPreferredSourceId,
  groupSourceExplorerRecords
} from "../domain/sources";
import { createValidDataset } from "./fixtures/datasetFixtures";

function createDatasetWithExternalClaims(): CanonicalDataset {
  const dataset = createValidDataset();

  return {
    ...dataset,
    sources: [
      ...dataset.sources,
      {
        id: "josephus_antiquities",
        name: "Antiquities of the Jews",
        type: "historical",
        citation: "Josephus, Antiquities 19.338-352",
        author: "Flavius Josephus",
        usage_rights: {
          status: "cleared",
          attribution_text: "Reference-level citation only."
        }
      },
      {
        id: "gallio_inscription",
        name: "Gallio Inscription",
        type: "archaeological",
        citation: "Delphi Inscription",
        usage_rights: {
          status: "cleared",
          attribution_text: "Reference-level citation only."
        }
      }
    ],
    places: [
      ...dataset.places,
      {
        id: "athens",
        name: "Athens",
        latitude: 37.9838,
        longitude: 23.7275,
        region: "Achaia",
        modern_country: "Greece",
        location_certainty: "exact",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 17:15-34"
          }
        ]
      }
    ],
    people: [
      ...dataset.people,
      {
        id: "paul",
        name: "Paul",
        aliases: ["Saul"],
        role: "Apostle",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 17:15-34"
          }
        ]
      }
    ],
    events: [
      ...dataset.events,
      {
        id: "acts_002",
        title: "Mars Hill Address",
        summary: "Paul addresses the Areopagus in Athens.",
        date: {
          start_year: 51,
          end_year: 51,
          certainty: "estimated"
        },
        location_id: "athens",
        participants: ["paul"],
        tag_ids: ["apostles"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 17:22-31"
          }
        ],
        related_event_ids: [],
        notes: "Fixture event."
      }
    ],
    journeys: dataset.journeys.map((journey) => ({
      ...journey,
      related_event_ids: ["acts_001"]
    })),
    relationships: [
      ...dataset.relationships,
      {
        id: "relationship_002",
        from_type: "person",
        from_id: "paul",
        to_type: "event",
        to_id: "acts_002",
        relationship_type: "participant_in",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 17:22-31"
          }
        ]
      }
    ],
    claims: [
      ...dataset.claims,
      {
        id: "claim_002",
        statement: "Jerusalem remains the narrative base for the opening witness scene.",
        claim_type: "historical_context",
        confidence: "medium",
        related_event_ids: [],
        related_person_ids: [],
        related_place_ids: ["jerusalem"],
        source_refs: [
          {
            source_id: "josephus_antiquities",
            citation: "Antiquities 19.338-352"
          }
        ]
      },
      {
        id: "claim_003",
        statement: "The Gallio inscription anchors the Achaian chronology around Acts 17-18.",
        claim_type: "chronology_anchor",
        confidence: "high",
        related_event_ids: ["acts_002"],
        related_person_ids: ["paul"],
        related_place_ids: ["athens"],
        source_refs: [
          {
            source_id: "gallio_inscription",
            citation: "Delphi Inscription"
          }
        ]
      }
    ]
  };
}

describe("sources domain helpers", () => {
  it("builds visible claim records from event, person, and place scope", () => {
    const dataset = createDatasetWithExternalClaims();
    const index = buildDatasetIndex(dataset);

    const visibleClaims = buildClaimExplorerRecords(dataset, index, [dataset.events[0]!]);

    expect(visibleClaims.map((claimRecord) => claimRecord.claim.id)).toEqual([
      "claim_001",
      "claim_002"
    ]);
  });

  it("builds grouped source records for the current visible scope", () => {
    const dataset = createDatasetWithExternalClaims();
    const index = buildDatasetIndex(dataset);
    const claimRecords = buildClaimExplorerRecords(dataset, index, [dataset.events[0]!]);
    const sourceRecords = buildSourceExplorerRecords(dataset, [dataset.events[0]!], claimRecords);
    const groupedRecords = groupSourceExplorerRecords(sourceRecords);

    expect(sourceRecords.map((sourceRecord) => sourceRecord.source.id)).toEqual([
      "acts",
      "josephus_antiquities"
    ]);
    expect(groupedRecords.map((group) => group.section.id)).toEqual([
      "scripture_witnesses",
      "historical_witnesses"
    ]);
  });

  it("prefers an explicit focused source, then falls back to the selected event's scripture source", () => {
    const dataset = createDatasetWithExternalClaims();
    const index = buildDatasetIndex(dataset);
    const claimRecords = buildClaimExplorerRecords(dataset, index, [dataset.events[0]!]);
    const sourceRecords = buildSourceExplorerRecords(dataset, [dataset.events[0]!], claimRecords);

    expect(getPreferredSourceId(sourceRecords, "josephus_antiquities", dataset.events[0]!)).toBe(
      "josephus_antiquities"
    );
    expect(getPreferredSourceId(sourceRecords, null, dataset.events[0]!)).toBe("acts");
  });

  it("formats claim and rights labels for UI display", () => {
    expect(formatClaimType("chronology_anchor")).toBe("Chronology Anchor");
    expect(formatClaimConfidence("high")).toBe("High");
    expect(formatRightsStatus("pending_review")).toBe("Pending Review");
  });
});
