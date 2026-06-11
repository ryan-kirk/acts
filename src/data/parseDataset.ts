import YAML from "yaml";

import { type DatasetSchema } from "./schema";
import { validateDataset } from "./validateDataset";

export type DatasetDocumentFormat = "json" | "yaml" | "yml";

export function parseDatasetDocument(
  documentText: string,
  format: DatasetDocumentFormat
): DatasetSchema {
  let parsedDataset: unknown;

  switch (format) {
    case "json":
      parsedDataset = JSON.parse(documentText) as unknown;
      break;
    case "yaml":
    case "yml":
      parsedDataset = YAML.parse(documentText) as unknown;
      break;
    default:
      throw new Error(`Unsupported dataset format '${format}'. Use json or yaml.`);
  }

  return validateDataset(parsedDataset);
}

export function parseDatasetDocumentByExtension(
  documentText: string,
  extension: string
): DatasetSchema {
  const normalizedExtension = extension.toLowerCase();

  switch (normalizedExtension) {
    case ".json":
      return parseDatasetDocument(documentText, "json");
    case ".yaml":
      return parseDatasetDocument(documentText, "yaml");
    case ".yml":
      return parseDatasetDocument(documentText, "yml");
    default:
      throw new Error(
        `Unsupported dataset file extension '${normalizedExtension}'. Use .json, .yaml, or .yml.`
      );
  }
}
