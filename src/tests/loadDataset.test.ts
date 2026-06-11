import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { loadDatasetFromFile } from "../data/loadDataset";
import { createValidDataset } from "./fixtures/datasetFixtures";

describe("loadDatasetFromFile", () => {
  it("loads and validates JSON datasets", async () => {
    const dataset = createValidDataset();
    const tempDir = await mkdtemp(path.join(tmpdir(), "acts-json-"));
    const filePath = path.join(tempDir, "dataset.json");

    await writeFile(filePath, JSON.stringify(dataset, null, 2), "utf8");

    await expect(loadDatasetFromFile(filePath)).resolves.toEqual(dataset);
  });

  it("loads and validates YAML datasets", async () => {
    const dataset = createValidDataset();
    const tempDir = await mkdtemp(path.join(tmpdir(), "acts-yaml-"));
    const filePath = path.join(tempDir, "dataset.yaml");

    await writeFile(filePath, YAML.stringify(dataset), "utf8");

    await expect(loadDatasetFromFile(filePath)).resolves.toEqual(dataset);
  });
});
