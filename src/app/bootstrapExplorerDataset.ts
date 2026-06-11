import actsDatasetRaw from "../../data/acts.yaml?raw";
import lukeDatasetRaw from "../../data/luke.yaml?raw";

import { parseDatasetDocument } from "../data/parseDataset";
import {
  mergeCanonicalDatasets,
  type ExplorerDatasetLibrary
} from "../domain/library";

export type ExplorerDatasetLoadState =
  | {
      status: "ready";
      library: ExplorerDatasetLibrary;
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
) {
  return parseDatasetDocument(documentText, format);
}

export function getExplorerDatasetLoadState(
  datasetDocuments: readonly string[] = [actsDatasetRaw, lukeDatasetRaw]
): ExplorerDatasetLoadState {
  try {
    const datasets = datasetDocuments.map((documentText) =>
      loadEmbeddedDataset(documentText, "yaml")
    );

    return {
      status: "ready",
      library: mergeCanonicalDatasets(datasets)
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error)
    };
  }
}

export const explorerDatasetLoadState = getExplorerDatasetLoadState();
