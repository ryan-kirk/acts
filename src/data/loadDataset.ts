import { readFile } from "node:fs/promises";
import path from "node:path";

import { type DatasetSchema } from "./schema";
import { parseDatasetDocumentByExtension } from "./parseDataset";

export async function readDatasetFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

export async function loadDatasetFromFile(filePath: string): Promise<DatasetSchema> {
  const extension = path.extname(filePath).toLowerCase();
  const fileContents = await readDatasetFile(filePath);

  return parseDatasetDocumentByExtension(fileContents, extension);
}
