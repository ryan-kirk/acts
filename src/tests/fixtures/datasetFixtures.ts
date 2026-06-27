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
    books: [
      {
        id: "acts",
        label: "Acts",
        title: "Book of Acts",
        testament: "new_testament",
        canonical_order: 5,
        corpus: "history",
        genre: ["narrative", "history"],
        summary: "Fixture book metadata for the Acts dataset.",
        authorship_note: "Traditionally attributed to Luke.",
        primary_source_id: "acts",
        sender_ids: [],
        co_sender_ids: [],
        recipient_person_ids: [],
        recipient_place_ids: [],
        related_person_ids: ["peter"],
        related_place_ids: ["jerusalem"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-28:31"
          }
        ]
      }
    ],
    sources: [
      {
        id: "acts",
        name: "Book of Acts",
        type: "scripture",
        citation: "New Testament",
        usage_rights: {
          status: "not_applicable",
          usage_notes:
            "This dataset stores canonical scripture references only, not licensed translation text.",
          trademark_usage_note:
            "Future ESV-branded assets or marks require separate permission review before product use.",
          commercial_use_note:
            "If direct ESV text is ever embedded in a commercial Bible-reference workflow, written permission must be recorded before release.",
          requires_written_permission_for_commercial_use: true
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
    literary_units: [
      {
        id: "acts_unit_001",
        book_id: "acts",
        title: "Jerusalem Witness And Pentecost",
        unit_type: "narrative",
        passage: {
          start_chapter: 1,
          start_verse: 1,
          end_chapter: 2,
          end_verse: 47
        },
        summary: "Opening Jerusalem witness material from the ascension through Pentecost.",
        location_id: "jerusalem",
        participant_ids: ["peter"],
        related_person_ids: [],
        related_place_ids: [],
        related_event_ids: ["acts_001"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-2:47"
          }
        ]
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

export function createValidEpistleDataset(): CanonicalDataset {
  const dataset = structuredClone(createValidDataset());

  return {
    ...dataset,
    metadata: {
      dataset_id: "romans",
      title: "Romans Canonical Dataset",
      version: "1.0.0",
      schema_version: "1.0.0",
      description: "Epistolary fixture dataset for book-metadata and literary-unit tests."
    },
    books: [
      {
        id: "romans",
        label: "Romans",
        title: "Romans",
        testament: "new_testament",
        canonical_order: 6,
        corpus: "pauline_epistle",
        genre: ["epistle", "theological discourse"],
        summary: "Pauline epistle fixture with composition, destination, and literary-unit context.",
        authorship_note: "Traditionally attributed to Paul.",
        primary_source_id: "romans",
        composition_date: {
          start_year: 57,
          end_year: 57,
          certainty: "estimated"
        },
        composition_place_id: "corinth",
        destination_place_id: "rome",
        sender_ids: ["paul"],
        co_sender_ids: [],
        recipient_person_ids: [],
        recipient_place_ids: ["rome"],
        related_person_ids: ["paul", "phoebe"],
        related_place_ids: ["corinth", "rome"],
        recipient_group: "House churches in Rome",
        dispatch_note: "Phoebe is commended as a trusted carrier and patronal connection.",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:1-15; 15:22-29; 16:1-2"
          }
        ]
      }
    ],
    sources: [
      {
        id: "romans",
        name: "Romans",
        type: "scripture",
        citation: "New Testament, Romans 1-16",
        author: "Traditionally attributed to Paul",
        usage_rights: {
          status: "not_applicable",
          attribution_text:
            "This dataset stores canonical scripture references only, not licensed translation text.",
          usage_notes:
            "Any future embedded ESV text would require attribution review before release.",
          trademark_usage_note:
            "Future ESV-branded assets or marks require separate permission review before product use.",
          commercial_use_note:
            "If direct ESV text is ever embedded in a commercial Bible-reference workflow, written permission must be recorded before release.",
          requires_written_permission_for_commercial_use: true
        }
      }
    ],
    places: [
      {
        id: "corinth",
        name: "Corinth",
        latitude: 37.9381,
        longitude: 22.9324,
        region: "Achaia",
        modern_country: "Greece",
        location_certainty: "approximate",
        summary: "Traditional composition setting for Romans during Paul's Achaian ministry.",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 16:1-23"
          }
        ]
      },
      {
        id: "rome",
        name: "Rome",
        latitude: 41.9028,
        longitude: 12.4964,
        region: "Italia",
        modern_country: "Italy",
        location_certainty: "exact",
        summary: "Destination church network addressed in Romans.",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:7-15"
          }
        ]
      }
    ],
    people: [
      {
        id: "paul",
        name: "Paul",
        aliases: ["Saul"],
        role: "Apostle",
        summary: "Named sender of Romans and the voice behind the epistle's argument.",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:1"
          }
        ]
      },
      {
        id: "phoebe",
        name: "Phoebe",
        aliases: [],
        role: "Deacon and patron",
        summary: "Commended at the close of Romans and often connected with the letter's delivery.",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 16:1-2"
          }
        ]
      }
    ],
    events: [
      {
        id: "romans_001",
        title: "Paul writes to the Roman believers",
        summary: "Paul frames his gospel, mission plans, and pastoral aims for the assemblies in Rome.",
        date: {
          start_year: 57,
          end_year: 57,
          certainty: "estimated"
        },
        location_id: "corinth",
        participants: ["paul", "phoebe"],
        tag_ids: ["letter_writing"],
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:1-15; 15:22-29; 16:1-2"
          }
        ],
        related_event_ids: [],
        notes: "Epistolary anchor event for a non-journey book."
      }
    ],
    journeys: [],
    relationships: [
      {
        id: "relationship_romans_001",
        from_type: "person",
        from_id: "paul",
        to_type: "event",
        to_id: "romans_001",
        relationship_type: "author_of",
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:1"
          }
        ]
      }
    ],
    tags: [
      {
        id: "letter_writing",
        label: "Letter Writing",
        description: "Records tied to composition, delivery, or epistolary framing.",
        group: "literary"
      }
    ],
    literary_units: [
      {
        id: "romans_unit_001",
        book_id: "romans",
        title: "Letter Opening And Gospel Thesis",
        unit_type: "letter_opening",
        passage: {
          start_chapter: 1,
          start_verse: 1,
          end_chapter: 1,
          end_verse: 17
        },
        summary: "Salutation, prayer, and thesis statement for the righteousness of God.",
        location_id: "rome",
        participant_ids: ["paul"],
        related_person_ids: ["phoebe"],
        related_place_ids: ["corinth"],
        related_event_ids: ["romans_001"],
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:1-17"
          }
        ]
      },
      {
        id: "romans_unit_002",
        book_id: "romans",
        title: "Sin, Justification, And Abraham",
        unit_type: "argument",
        passage: {
          start_chapter: 1,
          start_verse: 18,
          end_chapter: 4,
          end_verse: 25
        },
        summary: "Paul argues from universal need toward justification by faith.",
        participant_ids: ["paul"],
        related_person_ids: [],
        related_place_ids: [],
        related_event_ids: ["romans_001"],
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 1:18-4:25"
          }
        ]
      },
      {
        id: "romans_unit_003",
        book_id: "romans",
        title: "Life In Christ And the Spirit",
        unit_type: "argument",
        passage: {
          start_chapter: 5,
          start_verse: 1,
          end_chapter: 8,
          end_verse: 39
        },
        summary: "Union with Christ, the Spirit, and hope frame the middle argument.",
        participant_ids: ["paul"],
        related_person_ids: [],
        related_place_ids: [],
        related_event_ids: ["romans_001"],
        source_refs: [
          {
            source_id: "romans",
            citation: "Romans 5:1-8:39"
          }
        ]
      }
    ],
    claims: []
  };
}

export function createValidApocalypticDataset(): CanonicalDataset {
  return {
    metadata: {
      dataset_id: "revelation",
      title: "Revelation Canonical Dataset",
      version: "1.0.0",
      schema_version: "1.0.0",
      description: "Apocalyptic fixture dataset for book-metadata and literary-unit tests."
    },
    books: [
      {
        id: "revelation",
        label: "Revelation",
        title: "Revelation",
        testament: "new_testament",
        canonical_order: 27,
        corpus: "apocalypse",
        genre: ["apocalypse", "prophecy", "letter"],
        summary: "Apocalyptic fixture with a Patmos setting and vision-cycle literary units.",
        authorship_note: "Attributed in the text to John.",
        primary_source_id: "revelation",
        sender_ids: [],
        co_sender_ids: [],
        recipient_person_ids: [],
        recipient_group: "Seven churches in Asia",
        recipient_place_ids: ["asia_minor"],
        related_person_ids: ["john_of_patmos"],
        related_place_ids: ["patmos", "asia_minor"],
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:1-4"
          }
        ]
      }
    ],
    sources: [
      {
        id: "revelation",
        name: "Revelation",
        type: "scripture",
        citation: "New Testament, Revelation 1-22",
        usage_rights: {
          status: "not_applicable",
          attribution_text:
            "This dataset stores canonical scripture references only, not licensed translation text.",
          usage_notes:
            "Any future embedded ESV text would require attribution review before release.",
          trademark_usage_note:
            "Future ESV-branded assets or marks require separate permission review before product use.",
          commercial_use_note:
            "If direct ESV text is ever embedded in a commercial Bible-reference workflow, written permission must be recorded before release.",
          requires_written_permission_for_commercial_use: true
        }
      }
    ],
    places: [
      {
        id: "patmos",
        name: "Patmos",
        latitude: 37.3083,
        longitude: 26.5481,
        region: "Aegean",
        modern_country: "Greece",
        location_certainty: "traditional",
        summary: "Island setting named in Revelation's opening vision report.",
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:9"
          }
        ]
      },
      {
        id: "asia_minor",
        name: "Asia Minor church network",
        latitude: 38.5,
        longitude: 27.2,
        region: "Asia",
        modern_country: "Turkey",
        location_certainty: "approximate",
        summary: "Regional placeholder for the seven churches addressed in Revelation.",
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:4"
          }
        ]
      }
    ],
    people: [
      {
        id: "john_of_patmos",
        name: "John",
        aliases: ["John of Patmos"],
        role: "Visionary witness",
        summary: "Named seer and narrator in Revelation's opening.",
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:1-2, 1:9"
          }
        ]
      }
    ],
    events: [
      {
        id: "revelation_001",
        title: "John receives the Patmos vision commission",
        summary: "John identifies himself on Patmos and receives the opening visionary commission.",
        date: {
          start_year: 95,
          end_year: 95,
          certainty: "traditional"
        },
        location_id: "patmos",
        participants: ["john_of_patmos"],
        tag_ids: ["vision"],
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:9-20"
          }
        ],
        related_event_ids: [],
        notes: "Apocalyptic anchor event for fixture coverage."
      }
    ],
    journeys: [],
    relationships: [
      {
        id: "relationship_revelation_001",
        from_type: "person",
        from_id: "john_of_patmos",
        to_type: "event",
        to_id: "revelation_001",
        relationship_type: "visionary_witness_of",
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:9-20"
          }
        ]
      }
    ],
    tags: [
      {
        id: "vision",
        label: "Vision",
        description: "Records centered on visionary disclosure.",
        group: "apocalyptic"
      }
    ],
    literary_units: [
      {
        id: "revelation_unit_001",
        book_id: "revelation",
        title: "Opening Vision And Seven-Church Address",
        unit_type: "vision",
        passage: {
          start_chapter: 1,
          start_verse: 1,
          end_chapter: 3,
          end_verse: 22
        },
        summary: "Revelation opens with commission, throne-language, and the seven church messages.",
        location_id: "patmos",
        participant_ids: ["john_of_patmos"],
        related_person_ids: [],
        related_place_ids: ["asia_minor"],
        related_event_ids: ["revelation_001"],
        source_refs: [
          {
            source_id: "revelation",
            citation: "Revelation 1:1-3:22"
          }
        ]
      }
    ],
    claims: []
  };
}
