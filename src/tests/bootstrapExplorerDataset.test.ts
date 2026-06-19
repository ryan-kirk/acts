import { describe, expect, it } from "vitest";
import YAML from "yaml";

import {
  getExplorerDatasetLoadState,
  loadEmbeddedDataset
} from "../app/bootstrapExplorerDataset";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("embedded explorer dataset bootstrap", () => {
  it("loads a validated YAML dataset through the shared parser", () => {
    const dataset = createValidDataset();
    const result = loadEmbeddedDataset(YAML.stringify(dataset), "yaml");

    expect(result.metadata.dataset_id).toBe(dataset.metadata.dataset_id);
  });

  it("returns a readable error state when validation fails", () => {
    const result = getExplorerDatasetLoadState(["events:\n  - id: bad_record\n"]);

    expect(result.status).toBe("error");

    if (result.status === "error") {
      expect(result.message).toContain("metadata");
      expect(result.message).toContain("events.0.title");
    }
  });

  it("merges embedded Luke and Acts datasets into a multi-book ready state", () => {
    const actsDataset = createValidDataset();
    const baseDataset = createValidDataset();
    const lukeDataset = {
      ...baseDataset,
      metadata: {
        ...baseDataset.metadata,
        dataset_id: "luke",
        title: "Gospel of Luke Canonical Dataset"
      },
      books: [
        {
          ...baseDataset.books[0]!,
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
          ...baseDataset.sources[0]!,
          id: "luke",
          name: "Gospel of Luke"
        }
      ],
      places: [
        {
          ...baseDataset.places[0]!,
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 24:47-49"
            }
          ]
        }
      ],
      people: [
        {
          ...baseDataset.people[0]!,
          source_refs: [
            {
              source_id: "luke",
              citation: "Luke 5:1-11"
            }
          ]
        }
      ],
      events: [
        {
          ...baseDataset.events[0]!,
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
          ...baseDataset.literary_units[0]!,
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
      claims: []
    };
    const result = getExplorerDatasetLoadState([
      YAML.stringify(actsDataset),
      YAML.stringify(lukeDataset)
    ]);

    expect(result.status).toBe("ready");

    if (result.status === "ready") {
      expect(result.library.dataset.books.map((book) => book.id)).toEqual(["acts", "luke"]);
      expect(result.library.dataset.events).toHaveLength(2);
      expect(result.library.provenance.eventBookIds.get("acts_001")).toBe("acts");
      expect(result.library.provenance.eventBookIds.get("luke_001")).toBe("luke");
    }
  });

  it("loads the embedded canonical library and exposes Matthew, Mark, Luke, John, and Acts", () => {
    const result = getExplorerDatasetLoadState();

    expect(result.status).toBe("ready");

    if (result.status === "ready") {
      expect(result.library.dataset.books.map((book) => book.id)).toEqual([
        "matthew",
        "mark",
        "luke",
        "john",
        "acts"
      ]);
      expect(result.library.dataset.events.length).toBeGreaterThanOrEqual(55);
      expect(result.library.provenance.claimBookIds.get("claim_synoptic_baptism_inaugural_witness"))
        .toBeDefined();
      expect(result.library.provenance.eventBookIds.get("john_009")).toBe("john");
    }
  });
});
