import path from "node:path";

import { getDatasetBookLiteraryCoverage } from "../src/data/literaryCoverage";
import { loadDatasetFromFile } from "../src/data/loadDataset";
import { DatasetValidationError } from "../src/data/validateDataset";

async function main(): Promise<void> {
  const datasetPaths = process.argv.slice(2);

  if (datasetPaths.length === 0) {
    console.error("Usage: npm run validate:data -- <dataset-file> [more dataset files]");
    process.exitCode = 1;
    return;
  }

  for (const datasetPath of datasetPaths) {
    const resolvedPath = path.resolve(datasetPath);

    try {
      const dataset = await loadDatasetFromFile(resolvedPath);
      const coverageSummary = getDatasetBookLiteraryCoverage(dataset)
        .map(
          (coverage) =>
            `${coverage.bookId}:literary_people=${coverage.coveredPersonIds.length}/${coverage.totalPeopleCount},literary_places=${coverage.coveredPlaceIds.length}/${coverage.totalPlacesCount}`
        )
        .join("; ");

      console.log(
        [
          `Validated ${resolvedPath}`,
          `sources=${dataset.sources.length}`,
          `places=${dataset.places.length}`,
          `people=${dataset.people.length}`,
          `events=${dataset.events.length}`,
          `journeys=${dataset.journeys.length}`,
          `relationships=${dataset.relationships.length}`,
          `tags=${dataset.tags.length}`,
          `claims=${dataset.claims.length}`,
          coverageSummary
        ].join(" | ")
      );
    } catch (error) {
      if (error instanceof DatasetValidationError) {
        console.error(`Validation failed for ${resolvedPath}`);
        console.error(error.message);
        process.exitCode = 1;
        return;
      }

      console.error(`Unable to validate ${resolvedPath}`);
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
      return;
    }
  }
}

void main();
