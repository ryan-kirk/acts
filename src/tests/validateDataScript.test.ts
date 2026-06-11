import { mkdtemp, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { createValidDataset } from "./fixtures/datasetFixtures";

describe("validate-data script", () => {
  it("exits successfully for a valid dataset file", async () => {
    const dataset = createValidDataset();
    const tempDir = await mkdtemp(path.join(tmpdir(), "acts-script-valid-"));
    const filePath = path.join(tempDir, "dataset.yaml");

    await writeFile(filePath, YAML.stringify(dataset), "utf8");

    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/validate-data.ts", filePath],
      {
        cwd: process.cwd(),
        encoding: "utf8"
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Validated");
  });

  it("fails for an invalid dataset file", async () => {
    const dataset = createValidDataset();
    dataset.events[0]!.location_id = "missing_place";

    const tempDir = await mkdtemp(path.join(tmpdir(), "acts-script-invalid-"));
    const filePath = path.join(tempDir, "dataset.yaml");

    await writeFile(filePath, YAML.stringify(dataset), "utf8");

    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/validate-data.ts", filePath],
      {
        cwd: process.cwd(),
        encoding: "utf8"
      }
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown location_id 'missing_place'");
  });
});
