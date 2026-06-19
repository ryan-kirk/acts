import { describe, expect, it } from "vitest";

import {
  filterExplorerDatasetByBook,
  getBookLabelForFilter,
  getEventBookLabel,
  mergeCanonicalDatasets
} from "../domain/library";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("library domain helpers", () => {
  it("merges independently valid Luke and Acts datasets while deduplicating shared entities", () => {
    const actsDataset = createValidDataset();
    const lukeDataset = {
      ...createValidDataset(),
      metadata: {
        ...createValidDataset().metadata,
        dataset_id: "luke",
        title: "Gospel of Luke Canonical Dataset"
      },
      books: [
        {
          ...createValidDataset().books[0]!,
          id: "luke",
          label: "Luke",
          title: "Gospel of Luke",
          primary_source_id: "luke",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-24:53"
            }
          ]
        }
      ],
      sources: [
        {
          ...createValidDataset().sources[0]!,
          id: "luke",
          name: "Gospel of Luke"
        }
      ],
      literary_units: [
        {
          ...createValidDataset().literary_units[0]!,
          id: "luke_unit_001",
          book_id: "luke",
          title: "Luke Literary Unit",
          related_event_ids: ["luke_001"],
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      people: [
        {
          ...createValidDataset().people[0]!,
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 5:1-11"
            }
          ]
        }
      ],
      places: [
        {
          ...createValidDataset().places[0]!,
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 24:47-49"
            }
          ]
        }
      ],
      events: [
        {
          ...createValidDataset().events[0]!,
          id: "luke_001",
          title: "Luke Event",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      journeys: [],
      relationships: [],
      claims: []
    };

    const library = mergeCanonicalDatasets([actsDataset, lukeDataset]);

    expect(library.dataset.books.map((book) => book.id)).toEqual(["acts", "luke"]);
    expect(library.dataset.books.map((book) => book.literaryUnitCount)).toEqual([1, 1]);
    expect(library.dataset.people).toHaveLength(1);
    expect(library.dataset.places).toHaveLength(1);
    expect(library.dataset.events.map((event) => event.id)).toEqual(["acts_001", "luke_001"]);
  });

  it("filters the explorer dataset by active book while preserving shared entities", () => {
    const actsDataset = createValidDataset();
    const lukeDataset = {
      ...createValidDataset(),
      metadata: {
        ...createValidDataset().metadata,
        dataset_id: "luke",
        title: "Gospel of Luke Canonical Dataset"
      },
      books: [
        {
          ...createValidDataset().books[0]!,
          id: "luke",
          label: "Luke",
          title: "Gospel of Luke",
          primary_source_id: "luke",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-24:53"
            }
          ]
        }
      ],
      sources: [
        {
          ...createValidDataset().sources[0]!,
          id: "luke",
          name: "Gospel of Luke"
        }
      ],
      literary_units: [
        {
          ...createValidDataset().literary_units[0]!,
          id: "luke_unit_001",
          book_id: "luke",
          title: "Luke Literary Unit",
          related_event_ids: ["luke_001"],
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      events: [
        {
          ...createValidDataset().events[0]!,
          id: "luke_001",
          title: "Luke Event",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      journeys: [],
      relationships: [],
      claims: []
    };
    const library = mergeCanonicalDatasets([actsDataset, lukeDataset]);

    const filteredDataset = filterExplorerDatasetByBook(
      library.dataset,
      library.provenance,
      "luke"
    );

    expect(filteredDataset.events.map((event) => event.id)).toEqual(["luke_001"]);
    expect(filteredDataset.books.map((book) => book.id)).toEqual(["luke"]);
    expect(filteredDataset.literary_units.map((literaryUnit) => literaryUnit.id)).toEqual([
      "luke_unit_001"
    ]);
    expect(filteredDataset.people).toHaveLength(library.dataset.people.length);
    expect(getBookLabelForFilter(library.dataset, "all")).toBe("Acts + Luke");
    expect(getEventBookLabel(library.dataset, library.provenance, "luke_001")).toBe("Luke");
  });

  it("tracks shared claim provenance across books so continuity records stay visible per scope", () => {
    const actsDataset = createValidDataset();
    const lukeDataset = {
      ...createValidDataset(),
      metadata: {
        ...createValidDataset().metadata,
        dataset_id: "luke",
        title: "Gospel of Luke Canonical Dataset"
      },
      books: [
        {
          ...createValidDataset().books[0]!,
          id: "luke",
          label: "Luke",
          title: "Gospel of Luke",
          primary_source_id: "luke",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-24:53"
            }
          ]
        }
      ],
      sources: [
        {
          ...createValidDataset().sources[0]!,
          id: "luke",
          name: "Gospel of Luke"
        }
      ],
      events: [
        {
          ...createValidDataset().events[0]!,
          id: "luke_001",
          title: "Luke Event",
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      literary_units: [
        {
          ...createValidDataset().literary_units[0]!,
          id: "luke_unit_001",
          book_id: "luke",
          title: "Luke Literary Unit",
          related_event_ids: ["luke_001"],
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ],
      journeys: [],
      relationships: [],
      claims: [
        {
          ...createValidDataset().claims[0]!,
          id: "claim_shared_parallel",
          statement: "Shared continuity claim.",
          related_event_ids: ["luke_001"],
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 1:1-4"
            }
          ]
        }
      ]
    };

    actsDataset.claims = [
      {
        ...actsDataset.claims[0]!,
        id: "claim_shared_parallel",
        statement: "Shared continuity claim.",
        related_event_ids: ["acts_001"],
        source_refs: [
          {
            source_id: "acts",
            citation: "Acts 1:1-11"
          }
        ]
      }
    ];

    const library = mergeCanonicalDatasets([actsDataset, lukeDataset]);
    const lukeScope = filterExplorerDatasetByBook(library.dataset, library.provenance, "luke");

    expect(library.provenance.claimBookIds.get("claim_shared_parallel")).toEqual(
      new Set(["acts", "luke"])
    );
    expect(lukeScope.claims.map((claim) => claim.id)).toContain("claim_shared_parallel");
  });
});
