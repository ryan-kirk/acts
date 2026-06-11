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
      sources: [
        {
          ...createValidDataset().sources[0]!,
          id: "luke",
          name: "Gospel of Luke"
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
    expect(filteredDataset.people).toHaveLength(library.dataset.people.length);
    expect(getBookLabelForFilter(library.dataset, "all")).toBe("Luke-Acts");
    expect(getEventBookLabel(library.dataset, library.provenance, "luke_001")).toBe("Luke");
  });
});
