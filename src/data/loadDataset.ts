import { readFile } from "node:fs/promises";
import path from "node:path";

import YAML from "yaml";

import { type DatasetSchema } from "./schema";
import { validateDataset } from "./validateDataset";

export async function readDatasetFile(filePath: string): Promise<unknown> {
  const extension = path.extname(filePath).toLowerCase();
  const fileContents = await readFile(filePath, "utf8");

  switch (extension) {
    case ".json":
      return JSON.parse(fileContents) as unknown;
    case ".yaml":
    case ".yml":
      return YAML.parse(fileContents) as unknown;
    default:
      throw new Error(
        `Unsupported dataset file extension '${extension}'. Use .json, .yaml, or .yml.`
      );
  }
}

export async function loadDatasetFromFile(filePath: string): Promise<DatasetSchema> {
  const rawDataset = await readDatasetFile(filePath);
  return validateDataset(rawDataset);
}
