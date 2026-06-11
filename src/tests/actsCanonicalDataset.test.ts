import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadDatasetFromFile } from "../data/loadDataset";

describe("Acts canonical dataset", () => {
  it("loads the canonical Acts dataset and meets minimum scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/acts.yaml"));

    expect(dataset.metadata.dataset_id).toBe("acts");
    expect(dataset.events.length).toBeGreaterThanOrEqual(10);
    expect(dataset.places.length).toBeGreaterThanOrEqual(8);
    expect(dataset.people.length).toBeGreaterThanOrEqual(8);
    expect(dataset.journeys.length).toBeGreaterThanOrEqual(2);

    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(
      dataset.places.some((place) => place.location_certainty !== "exact")
    ).toBe(true);
  });
});
