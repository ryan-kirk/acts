import actsDatasetRaw from "../../data/acts.yaml?raw";

import { parseDatasetDocument } from "../data/parseDataset";
import type { CanonicalDataset } from "../domain/dataset";

export type DatasetLoadState =
  | {
      status: "ready";
      dataset: CanonicalDataset;
    }
  | {
      status: "error";
      message: string;
    };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown dataset loading error.";
}

export function loadEmbeddedDataset(
  documentText: string,
  format: "json" | "yaml" | "yml"
): DatasetLoadState {
  try {
    return {
      status: "ready",
      dataset: parseDatasetDocument(documentText, format)
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error)
    };
  }
}

export function getActsDatasetLoadState(documentText: string = actsDatasetRaw): DatasetLoadState {
  return loadEmbeddedDataset(documentText, "yaml");
}

export const actsDatasetLoadState = getActsDatasetLoadState();
