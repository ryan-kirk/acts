import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { getActsDatasetLoadState, loadEmbeddedDataset } from "../app/bootstrapActsDataset";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("embedded dataset bootstrap", () => {
  it("loads a validated YAML dataset into ready state", () => {
    const dataset = createValidDataset();
    const result = loadEmbeddedDataset(YAML.stringify(dataset), "yaml");

    expect(result.status).toBe("ready");

    if (result.status === "ready") {
      expect(result.dataset.metadata.dataset_id).toBe(dataset.metadata.dataset_id);
    }
  });

  it("returns a readable error state when validation fails", () => {
    const result = getActsDatasetLoadState("events:\n  - id: bad_record\n");

    expect(result.status).toBe("error");

    if (result.status === "error") {
      expect(result.message).toContain("metadata");
      expect(result.message).toContain("events.0.title");
    }
  });
});
