import type { CanonicalDataset } from "../../domain/dataset";

export function createValidDataset(): CanonicalDataset {
  return {
    metadata: {
      dataset_id: "acts",
      title: "Acts Canonical Dataset",
      version: "1.0.0",
      schema_version: "1.0.0",
      description: "Minimal valid dataset fixture for schema and validation tests."
    },
    sources: [
      {
        id: "acts",
        name: "Book of Acts",
        type: "scripture",
        citation: "New Testament",
        usage_rights: {
          status: "not_applicable",
          usage_notes:
            "This dataset stores canonical scripture references only, not licensed translation text."
        }
      }
    ],
    places: [
      {
        id: "jerusalem",
        name: "Jerusalem",
        latitude: 31.7683,
        longitude: 35.2137,
        region: "Judea",
        modern_country: "Israel",
        location_certainty: "exact",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:12"
          }
        ]
      }
    ],
    people: [
      {
        id: "peter",
        name: "Peter",
        aliases: ["Simon Peter"],
        role: "Apostle",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:13"
          }
        ]
      }
    ],
    events: [
      {
        id: "acts_001",
        title: "Ascension of Jesus",
        summary: "Jesus ascends and commissions the disciples.",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        },
        location_id: "jerusalem",
        participants: ["peter"],
        tag_ids: ["apostles"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-11"
          }
        ],
        related_event_ids: [],
        notes: "Fixture event."
      }
    ],
    journeys: [
      {
        id: "missionary_journey_1",
        title: "Initial Jerusalem Witness",
        date: {
          start_year: 30,
          end_year: 30,
          certainty: "estimated"
        },
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:8"
          }
        ],
        route: [
          {
            sequence: 1,
            place_id: "jerusalem"
          }
        ],
        related_event_ids: ["acts_001"]
      }
    ],
    relationships: [
      {
        id: "relationship_001",
        from_type: "person",
        from_id: "peter",
        to_type: "event",
        to_id: "acts_001",
        relationship_type: "participant_in",
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:13"
          }
        ]
      }
    ],
    tags: [
      {
        id: "apostles",
        label: "Apostles",
        description: "Events centered on the apostolic witnesses."
      }
    ],
    claims: [
      {
        id: "claim_001",
        statement: "The ascension serves as the opening transition into Acts.",
        claim_type: "narrative_structure",
        confidence: "medium",
        related_event_ids: ["acts_001"],
        related_person_ids: ["peter"],
        related_place_ids: ["jerusalem"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-11"
          }
        ]
      }
    ]
  };
}
