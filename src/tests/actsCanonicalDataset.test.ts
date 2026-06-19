import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadDatasetFromFile } from "../data/loadDataset";

describe("canonical scripture datasets", () => {
  it("loads the canonical Acts dataset and meets minimum scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/acts.yaml"));

    expect(dataset.metadata.dataset_id).toBe("acts");
    expect(dataset.events.length).toBeGreaterThanOrEqual(10);
    expect(dataset.places.length).toBeGreaterThanOrEqual(8);
    expect(dataset.people.length).toBeGreaterThanOrEqual(8);
    expect(dataset.journeys.length).toBeGreaterThanOrEqual(2);
    expect(dataset.sources.length).toBeGreaterThan(1);
    expect(dataset.claims.length).toBeGreaterThan(0);

    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(dataset.sources.some((source) => source.type !== "scripture")).toBe(true);
    expect(
      dataset.places.some((place) => place.location_certainty !== "exact")
    ).toBe(true);
  });

  it("loads the canonical Luke dataset and meets initial scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/luke.yaml"));

    expect(dataset.metadata.dataset_id).toBe("luke");
    expect(dataset.events.length).toBeGreaterThanOrEqual(8);
    expect(dataset.places.length).toBeGreaterThanOrEqual(6);
    expect(dataset.people.length).toBeGreaterThanOrEqual(8);
    expect(dataset.sources.length).toBeGreaterThan(1);
    expect(dataset.claims.length).toBeGreaterThan(0);
    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(dataset.sources.some((source) => source.type !== "scripture")).toBe(true);
    expect(
      dataset.places.some((place) => place.location_certainty !== "exact")
    ).toBe(true);
  });

  it("loads the canonical Matthew dataset and meets initial scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/matthew.yaml"));

    expect(dataset.metadata.dataset_id).toBe("matthew");
    expect(dataset.events.length).toBeGreaterThanOrEqual(8);
    expect(dataset.places.length).toBeGreaterThanOrEqual(6);
    expect(dataset.people.length).toBeGreaterThanOrEqual(6);
    expect(dataset.literary_units.length).toBeGreaterThanOrEqual(4);
    expect(dataset.sources.length).toBeGreaterThan(1);
    expect(dataset.claims.length).toBeGreaterThan(0);
    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(dataset.sources.some((source) => source.type !== "scripture")).toBe(true);
  });

  it("loads the canonical Mark dataset and meets initial scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/mark.yaml"));

    expect(dataset.metadata.dataset_id).toBe("mark");
    expect(dataset.events.length).toBeGreaterThanOrEqual(8);
    expect(dataset.places.length).toBeGreaterThanOrEqual(7);
    expect(dataset.people.length).toBeGreaterThanOrEqual(6);
    expect(dataset.literary_units.length).toBeGreaterThanOrEqual(4);
    expect(dataset.sources.length).toBeGreaterThan(1);
    expect(dataset.claims.length).toBeGreaterThan(0);
    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(dataset.sources.some((source) => source.type !== "scripture")).toBe(true);
  });

  it("loads the canonical John dataset and meets Johannine scope expectations", async () => {
    const dataset = await loadDatasetFromFile(path.resolve("data/john.yaml"));

    expect(dataset.metadata.dataset_id).toBe("john");
    expect(dataset.events.length).toBeGreaterThanOrEqual(12);
    expect(dataset.places.length).toBeGreaterThanOrEqual(6);
    expect(dataset.people.length).toBeGreaterThanOrEqual(10);
    expect(dataset.literary_units.length).toBeGreaterThanOrEqual(4);
    expect(dataset.sources.length).toBeGreaterThan(1);
    expect(dataset.claims.length).toBeGreaterThanOrEqual(5);
    expect(dataset.events.every((event) => event.source_refs.length > 0)).toBe(true);
    expect(dataset.sources.every((source) => source.usage_rights.status !== "unknown")).toBe(
      true
    );
    expect(dataset.sources.some((source) => source.type !== "scripture")).toBe(true);
    expect(dataset.tags.some((tag) => tag.group === "sign")).toBe(true);
    expect(dataset.tags.some((tag) => tag.group === "discourse")).toBe(true);
    expect(dataset.tags.some((tag) => tag.group === "feast")).toBe(true);
    expect(dataset.claims.some((claim) => claim.id === "claim_john_temple_sequence_distinct")).toBe(
      true
    );
  });
});
