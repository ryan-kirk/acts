import type {
  CanonicalDataset,
  Claim,
  Event,
  Journey,
  Metadata,
  Person,
  Place,
  Relationship,
  Source,
  Tag
} from "./dataset";

export type BookFilterId = "all" | string;

export interface BookDefinition {
  description?: string;
  eventCount: number;
  id: string;
  journeyCount: number;
  label: string;
  title: string;
}

export interface ExplorerDataset extends CanonicalDataset {
  books: BookDefinition[];
}

export interface ExplorerDatasetProvenance {
  eventBookIds: Map<string, string>;
  journeyBookIds: Map<string, string>;
  relationshipBookIds: Map<string, string>;
}

export interface ExplorerDatasetLibrary {
  dataset: ExplorerDataset;
  provenance: ExplorerDatasetProvenance;
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function dedupeSourceRefs(
  leftRefs: NonNullable<Place["source_refs"]>,
  rightRefs: NonNullable<Place["source_refs"]>
): NonNullable<Place["source_refs"]> {
  const refsByKey = new Map<string, (typeof leftRefs)[number]>();

  [...leftRefs, ...rightRefs].forEach((sourceRef) => {
    const key = `${sourceRef.source_id}|${sourceRef.citation}|${sourceRef.note ?? ""}`;
    refsByKey.set(key, sourceRef);
  });

  return Array.from(refsByKey.values());
}

function mergeOptionalString(
  label: string,
  recordId: string,
  leftValue: string | undefined,
  rightValue: string | undefined
): string | undefined {
  if (!leftValue) {
    return rightValue;
  }

  if (!rightValue) {
    return leftValue;
  }

  if (leftValue === rightValue) {
    return leftValue;
  }

  throw new Error(
    `Conflicting ${label} values were found for shared record '${recordId}'.`
  );
}

function assertMatchingValue<T>(
  label: string,
  recordId: string,
  leftValue: T,
  rightValue: T
): void {
  if (leftValue !== rightValue) {
    throw new Error(`Conflicting ${label} values were found for shared record '${recordId}'.`);
  }
}

function mergeOptionalSourceRefs<T extends Place | Person>(
  leftRecord: T,
  rightRecord: T
): T {
  const leftRefs = leftRecord.source_refs ?? [];
  const rightRefs = rightRecord.source_refs ?? [];
  const mergedRefs = dedupeSourceRefs(leftRefs, rightRefs);

  if (mergedRefs.length === 0) {
    return {
      ...leftRecord,
      source_refs: undefined
    };
  }

  return {
    ...leftRecord,
    source_refs: mergedRefs
  };
}

function mergeSharedPlace(leftPlace: Place, rightPlace: Place): Place {
  assertMatchingValue("place name", leftPlace.id, leftPlace.name, rightPlace.name);
  assertMatchingValue("latitude", leftPlace.id, leftPlace.latitude, rightPlace.latitude);
  assertMatchingValue("longitude", leftPlace.id, leftPlace.longitude, rightPlace.longitude);
  assertMatchingValue("region", leftPlace.id, leftPlace.region, rightPlace.region);
  assertMatchingValue(
    "modern_country",
    leftPlace.id,
    leftPlace.modern_country,
    rightPlace.modern_country
  );
  assertMatchingValue(
    "location_certainty",
    leftPlace.id,
    leftPlace.location_certainty,
    rightPlace.location_certainty
  );

  return mergeOptionalSourceRefs(
    {
      ...leftPlace,
      summary: mergeOptionalString("place summary", leftPlace.id, leftPlace.summary, rightPlace.summary)
    },
    rightPlace
  );
}

function mergeSharedPerson(leftPerson: Person, rightPerson: Person): Person {
  assertMatchingValue("person name", leftPerson.id, leftPerson.name, rightPerson.name);

  return mergeOptionalSourceRefs(
    {
      ...leftPerson,
      aliases: dedupeStrings([...leftPerson.aliases, ...rightPerson.aliases]),
      role: mergeOptionalString("person role", leftPerson.id, leftPerson.role, rightPerson.role),
      summary: mergeOptionalString(
        "person summary",
        leftPerson.id,
        leftPerson.summary,
        rightPerson.summary
      )
    },
    rightPerson
  );
}

function mergeSharedTag(leftTag: Tag, rightTag: Tag): Tag {
  assertMatchingValue("tag label", leftTag.id, leftTag.label, rightTag.label);

  return {
    ...leftTag,
    description: mergeOptionalString(
      "tag description",
      leftTag.id,
      leftTag.description,
      rightTag.description
    ),
    group: mergeOptionalString("tag group", leftTag.id, leftTag.group, rightTag.group)
  };
}

function mergeSourceRecord(leftSource: Source, rightSource: Source): Source {
  assertMatchingValue("source name", leftSource.id, leftSource.name, rightSource.name);
  assertMatchingValue("source type", leftSource.id, leftSource.type, rightSource.type);
  assertMatchingValue("source citation", leftSource.id, leftSource.citation, rightSource.citation);
  assertMatchingValue(
    "source rights",
    leftSource.id,
    JSON.stringify(leftSource.usage_rights),
    JSON.stringify(rightSource.usage_rights)
  );

  return {
    ...leftSource,
    author: mergeOptionalString("source author", leftSource.id, leftSource.author, rightSource.author),
    publication_date: mergeOptionalString(
      "source publication_date",
      leftSource.id,
      leftSource.publication_date,
      rightSource.publication_date
    ),
    url: mergeOptionalString("source url", leftSource.id, leftSource.url, rightSource.url)
  };
}

function mergeClaimRecord(leftClaim: Claim, rightClaim: Claim): Claim {
  assertMatchingValue("claim statement", leftClaim.id, leftClaim.statement, rightClaim.statement);
  assertMatchingValue("claim type", leftClaim.id, leftClaim.claim_type, rightClaim.claim_type);
  assertMatchingValue("claim confidence", leftClaim.id, leftClaim.confidence, rightClaim.confidence);

  return {
    ...leftClaim,
    related_event_ids: dedupeStrings([...leftClaim.related_event_ids, ...rightClaim.related_event_ids]),
    related_person_ids: dedupeStrings([
      ...leftClaim.related_person_ids,
      ...rightClaim.related_person_ids
    ]),
    related_place_ids: dedupeStrings([
      ...leftClaim.related_place_ids,
      ...rightClaim.related_place_ids
    ]),
    source_refs: dedupeSourceRefs(leftClaim.source_refs, rightClaim.source_refs)
  };
}

function mergeRecordMap<T extends { id: string }>(
  records: T[],
  mergeRecord: (leftRecord: T, rightRecord: T) => T
): T[] {
  const recordsById = new Map<string, T>();

  records.forEach((record) => {
    const existingRecord = recordsById.get(record.id);

    if (!existingRecord) {
      recordsById.set(record.id, record);
      return;
    }

    recordsById.set(record.id, mergeRecord(existingRecord, record));
  });

  return Array.from(recordsById.values());
}

function buildLibraryMetadata(datasets: CanonicalDataset[]): Metadata {
  const schemaVersion = datasets[0]?.metadata.schema_version ?? "1.0.0";
  const version = datasets
    .map((dataset) => `${dataset.metadata.dataset_id}-${dataset.metadata.version}`)
    .join("+");
  const createdValues = datasets.flatMap((dataset) =>
    dataset.metadata.created ? [dataset.metadata.created] : []
  );
  const updatedValues = datasets.flatMap((dataset) =>
    dataset.metadata.updated ? [dataset.metadata.updated] : []
  );

  return {
    dataset_id: "luke_acts_library",
    title: "Luke-Acts Canonical Library",
    version,
    schema_version: schemaVersion,
    description:
      "Merged canonical scripture library for the Gospel of Luke and the Book of Acts, with shared entities deduplicated by stable IDs.",
    created: createdValues[0],
    updated: updatedValues.at(-1)
  };
}

function getBookLabel(datasetId: string): string {
  switch (datasetId) {
    case "acts":
      return "Acts";
    case "luke":
      return "Luke";
    default:
      return datasetId
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
  }
}

export function mergeCanonicalDatasets(
  datasets: CanonicalDataset[]
): ExplorerDatasetLibrary {
  if (datasets.length === 0) {
    throw new Error("At least one canonical dataset is required to build the explorer library.");
  }

  const mergedSources = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.sources),
    mergeSourceRecord
  );
  const mergedPlaces = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.places),
    mergeSharedPlace
  );
  const mergedPeople = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.people),
    mergeSharedPerson
  );
  const mergedTags = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.tags),
    mergeSharedTag
  );
  const mergedClaims = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.claims),
    mergeClaimRecord
  );

  const eventBookIds = new Map<string, string>();
  const journeyBookIds = new Map<string, string>();
  const relationshipBookIds = new Map<string, string>();
  const mergedEvents: Event[] = [];
  const mergedJourneys: Journey[] = [];
  const mergedRelationships: Relationship[] = [];

  datasets.forEach((dataset) => {
    dataset.events.forEach((event) => {
      if (eventBookIds.has(event.id)) {
        throw new Error(`Duplicate event id '${event.id}' was found across multiple books.`);
      }

      eventBookIds.set(event.id, dataset.metadata.dataset_id);
      mergedEvents.push(event);
    });

    dataset.journeys.forEach((journey) => {
      if (journeyBookIds.has(journey.id)) {
        throw new Error(`Duplicate journey id '${journey.id}' was found across multiple books.`);
      }

      journeyBookIds.set(journey.id, dataset.metadata.dataset_id);
      mergedJourneys.push(journey);
    });

    dataset.relationships.forEach((relationship) => {
      if (relationshipBookIds.has(relationship.id)) {
        throw new Error(
          `Duplicate relationship id '${relationship.id}' was found across multiple books.`
        );
      }

      relationshipBookIds.set(relationship.id, dataset.metadata.dataset_id);
      mergedRelationships.push(relationship);
    });
  });

  const books: BookDefinition[] = datasets.map((dataset) => ({
    id: dataset.metadata.dataset_id,
    label: getBookLabel(dataset.metadata.dataset_id),
    title: dataset.metadata.title,
    ...(dataset.metadata.description
      ? { description: dataset.metadata.description }
      : {}),
    eventCount: dataset.events.length,
    journeyCount: dataset.journeys.length
  }));

  return {
    dataset: {
      metadata: buildLibraryMetadata(datasets),
      sources: mergedSources,
      places: mergedPlaces,
      people: mergedPeople,
      events: mergedEvents,
      journeys: mergedJourneys,
      relationships: mergedRelationships,
      tags: mergedTags,
      claims: mergedClaims,
      books
    },
    provenance: {
      eventBookIds,
      journeyBookIds,
      relationshipBookIds
    }
  };
}

export function filterExplorerDatasetByBook(
  dataset: ExplorerDataset,
  provenance: ExplorerDatasetProvenance,
  activeBookId: BookFilterId
): ExplorerDataset {
  if (activeBookId === "all") {
    return dataset;
  }

  return {
    ...dataset,
    events: dataset.events.filter((event) => provenance.eventBookIds.get(event.id) === activeBookId),
    journeys: dataset.journeys.filter(
      (journey) => provenance.journeyBookIds.get(journey.id) === activeBookId
    ),
    relationships: dataset.relationships.filter(
      (relationship) => provenance.relationshipBookIds.get(relationship.id) === activeBookId
    )
  };
}

export function getBookDefinition(
  dataset: ExplorerDataset,
  bookId: string
): BookDefinition | null {
  return dataset.books.find((book) => book.id === bookId) ?? null;
}

export function getBookLabelForFilter(
  dataset: ExplorerDataset,
  bookId: BookFilterId
): string {
  if (bookId === "all") {
    return "Luke-Acts";
  }

  return getBookDefinition(dataset, bookId)?.label ?? bookId;
}

export function getEventBookLabelMap(
  dataset: ExplorerDataset,
  provenance: ExplorerDatasetProvenance
): Map<string, string> {
  const labelsById = new Map<string, string>();

  dataset.events.forEach((event) => {
    const bookId = provenance.eventBookIds.get(event.id);

    if (!bookId) {
      return;
    }

    labelsById.set(event.id, getBookLabelForFilter(dataset, bookId));
  });

  return labelsById;
}

export function getEventBookLabel(
  dataset: ExplorerDataset,
  provenance: ExplorerDatasetProvenance,
  eventId: string
): string | null {
  const bookId = provenance.eventBookIds.get(eventId);

  if (!bookId) {
    return null;
  }

  return getBookLabelForFilter(dataset, bookId);
}
