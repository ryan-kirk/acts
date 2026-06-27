import { describe, expect, it } from "vitest";

import { getDatasetBookLiteraryCoverage } from "../data/literaryCoverage";
import { validateDataset } from "../data/validateDataset";
import {
  formatPassageRange,
  getBookNarrativeSemantics,
  getLiteraryUnitsForBook
} from "../domain/books";
import { buildDatasetIndex } from "../domain/events";
import {
  createValidApocalypticDataset,
  createValidDataset,
  createValidEpistleDataset
} from "./fixtures/datasetFixtures";

describe("book metadata and literary-unit modeling", () => {
  it("validates narrative, epistolary, and apocalyptic fixtures under the shared schema", () => {
    expect(validateDataset(createValidDataset()).metadata.dataset_id).toBe("acts");
    expect(validateDataset(createValidEpistleDataset()).metadata.dataset_id).toBe("romans");
    expect(validateDataset(createValidApocalypticDataset()).metadata.dataset_id).toBe(
      "revelation"
    );
  });

  it("formats passage anchors and retrieves literary units by active book", () => {
    const dataset = createValidEpistleDataset();
    const literaryUnits = getLiteraryUnitsForBook(dataset, "romans");

    expect(literaryUnits.map((literaryUnit) => literaryUnit.id)).toEqual([
      "romans_unit_001",
      "romans_unit_002",
      "romans_unit_003"
    ]);
    expect(formatPassageRange(literaryUnits[0]!)).toBe("1:1-17");
    expect(formatPassageRange(literaryUnits[1]!)).toBe("1:18-4:25");
  });

  it("derives narrative semantics for books that distinguish signs, discourses, and feast cycles", () => {
    const dataset = structuredClone(createValidDataset());

    dataset.metadata.dataset_id = "john";
    dataset.metadata.title = "Gospel of John Canonical Dataset";
    dataset.books = [
      {
        ...dataset.books[0]!,
        id: "john",
        label: "John",
        title: "Gospel of John",
        canonical_order: 4,
        corpus: "gospel",
        genre: ["gospel", "narrative", "discourse"],
        primary_source_id: "john",
        source_refs: [
          {
            source_id: "john",
            citation: "John 1:1-21:25"
          }
        ]
      }
    ];
    dataset.sources = [
      {
        ...dataset.sources[0]!,
        id: "john",
        name: "Gospel of John",
        citation: "New Testament, John 1-21"
      }
    ];
    dataset.tags = [
      {
        id: "sign",
        label: "Sign",
        group: "sign"
      },
      {
        id: "discourse",
        label: "Discourse",
        group: "discourse"
      },
      {
        id: "passover",
        label: "Passover",
        group: "feast"
      }
    ];
    dataset.events = [
      {
        ...dataset.events[0]!,
        id: "john_001",
        title: "Water into Wine at Cana",
        tag_ids: ["sign"],
        source_refs: [
          {
            source_id: "john",
            citation: "John 2:1-11"
          }
        ]
      },
      {
        ...dataset.events[0]!,
        id: "john_002",
        title: "Temple Cleansing at Passover",
        tag_ids: ["passover"],
        source_refs: [
          {
            source_id: "john",
            citation: "John 2:13-22"
          }
        ]
      },
      {
        ...dataset.events[0]!,
        id: "john_003",
        title: "Bread of Life Discourse",
        tag_ids: ["discourse", "passover"],
        source_refs: [
          {
            source_id: "john",
            citation: "John 6:22-71"
          }
        ]
      }
    ];

    const semantics = getBookNarrativeSemantics(dataset.events, buildDatasetIndex(dataset));

    expect(semantics.map((semantic) => semantic.id)).toEqual(["sign", "discourse", "feast"]);
    expect(semantics.find((semantic) => semantic.id === "sign")?.sampleEventTitles).toContain(
      "Water into Wine at Cana"
    );
    expect(semantics.find((semantic) => semantic.id === "discourse")?.eventCount).toBe(1);
    expect(semantics.find((semantic) => semantic.id === "feast")?.eventCount).toBe(2);
  });

  it("summarizes literary people and place coverage at the book level", () => {
    const dataset = createValidEpistleDataset();

    const [coverage] = getDatasetBookLiteraryCoverage(dataset);
    if (!coverage) {
      throw new Error("Expected Romans literary coverage to be defined.");
    }

    expect(coverage).toMatchObject({
      bookId: "romans",
      totalPeopleCount: 2,
      totalPlacesCount: 2,
      missingPersonIds: [],
      missingPlaceIds: []
    });
    expect(coverage.coveredPersonIds).toEqual(["paul", "phoebe"]);
    expect(coverage.coveredPlaceIds).toEqual(["corinth", "rome"]);
  });
});
