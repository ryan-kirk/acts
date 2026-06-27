import type {
  Book,
  CanonicalDataset,
  Claim,
  Event,
  Journey,
  LiteraryUnit,
  Metadata,
  Person,
  Place,
  Relationship,
  Source,
  Tag
} from "./dataset";

export type BookFilterId = "all" | string;

export interface ExplorerBook extends Book {
  eventCount: number;
  id: string;
  journeyCount: number;
  literaryUnitCount: number;
}

export type ExplorerDataset = Omit<CanonicalDataset, "books"> & {
  books: ExplorerBook[];
};

export interface ExplorerDatasetProvenance {
  claimBookIds: Map<string, Set<string>>;
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

function mergeBookRecord(leftBook: Book, rightBook: Book): Book {
  assertMatchingValue("book label", leftBook.id, leftBook.label, rightBook.label);
  assertMatchingValue("book title", leftBook.id, leftBook.title, rightBook.title);
  assertMatchingValue("book testament", leftBook.id, leftBook.testament, rightBook.testament);
  assertMatchingValue(
    "book canonical_order",
    leftBook.id,
    leftBook.canonical_order,
    rightBook.canonical_order
  );
  assertMatchingValue("book corpus", leftBook.id, leftBook.corpus, rightBook.corpus);
  assertMatchingValue(
    "book primary_source_id",
    leftBook.id,
    leftBook.primary_source_id,
    rightBook.primary_source_id
  );

  return {
    ...leftBook,
    genre: dedupeStrings([...leftBook.genre, ...rightBook.genre]),
    summary: mergeOptionalString("book summary", leftBook.id, leftBook.summary, rightBook.summary),
    authorship_note: mergeOptionalString(
      "book authorship_note",
      leftBook.id,
      leftBook.authorship_note,
      rightBook.authorship_note
    ),
    composition_date: leftBook.composition_date ?? rightBook.composition_date,
    composition_place_id: mergeOptionalString(
      "book composition_place_id",
      leftBook.id,
      leftBook.composition_place_id,
      rightBook.composition_place_id
    ),
    destination_place_id: mergeOptionalString(
      "book destination_place_id",
      leftBook.id,
      leftBook.destination_place_id,
      rightBook.destination_place_id
    ),
    sender_ids: dedupeStrings([...leftBook.sender_ids, ...rightBook.sender_ids]),
    co_sender_ids: dedupeStrings([...leftBook.co_sender_ids, ...rightBook.co_sender_ids]),
    recipient_person_ids: dedupeStrings([
      ...leftBook.recipient_person_ids,
      ...rightBook.recipient_person_ids
    ]),
    recipient_place_ids: dedupeStrings([
      ...leftBook.recipient_place_ids,
      ...rightBook.recipient_place_ids
    ]),
    related_person_ids: dedupeStrings([
      ...leftBook.related_person_ids,
      ...rightBook.related_person_ids
    ]),
    related_place_ids: dedupeStrings([
      ...leftBook.related_place_ids,
      ...rightBook.related_place_ids
    ]),
    recipient_group: mergeOptionalString(
      "book recipient_group",
      leftBook.id,
      leftBook.recipient_group,
      rightBook.recipient_group
    ),
    dispatch_note: mergeOptionalString(
      "book dispatch_note",
      leftBook.id,
      leftBook.dispatch_note,
      rightBook.dispatch_note
    ),
    source_refs: dedupeSourceRefs(leftBook.source_refs, rightBook.source_refs)
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
    dataset_id: "scripture_library",
    title: "Canonical Scripture Library",
    version,
    schema_version: schemaVersion,
    description:
      "Merged canonical scripture library with shared entities deduplicated by stable IDs.",
    created: createdValues[0],
    updated: updatedValues.at(-1)
  };
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
  const mergedBookRecords = mergeRecordMap(
    datasets.flatMap((dataset) => dataset.books),
    mergeBookRecord
  );

  const eventBookIds = new Map<string, string>();
  const claimBookIds = new Map<string, Set<string>>();
  const journeyBookIds = new Map<string, string>();
  const relationshipBookIds = new Map<string, string>();
  const mergedEvents: Event[] = [];
  const mergedJourneys: Journey[] = [];
  const mergedRelationships: Relationship[] = [];
  const mergedLiteraryUnits: LiteraryUnit[] = [];

  datasets.forEach((dataset) => {
    dataset.claims.forEach((claim) => {
      const existingClaimBookIds = claimBookIds.get(claim.id) ?? new Set<string>();
      existingClaimBookIds.add(dataset.metadata.dataset_id);
      claimBookIds.set(claim.id, existingClaimBookIds);
    });

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

    mergedLiteraryUnits.push(...dataset.literary_units);
  });

  const books: ExplorerBook[] = mergedBookRecords
    .map((book) => {
      const bookDatasets = datasets.filter((dataset) =>
        dataset.books.some((datasetBook) => datasetBook.id === book.id)
      );

      return {
        ...book,
        eventCount: bookDatasets.reduce((total, dataset) => total + dataset.events.length, 0),
        journeyCount: bookDatasets.reduce((total, dataset) => total + dataset.journeys.length, 0),
        literaryUnitCount: bookDatasets.reduce(
          (total, dataset) => total + dataset.literary_units.length,
          0
        )
      };
    })
    .sort((leftBook, rightBook) => leftBook.canonical_order - rightBook.canonical_order);

  return {
    dataset: {
      metadata: buildLibraryMetadata(datasets),
      literary_units: mergedLiteraryUnits,
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
      claimBookIds,
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
    books: dataset.books.filter((book) => book.id === activeBookId),
    claims: dataset.claims.filter((claim) =>
      provenance.claimBookIds.get(claim.id)?.has(activeBookId)
    ),
    events: dataset.events.filter((event) => provenance.eventBookIds.get(event.id) === activeBookId),
    journeys: dataset.journeys.filter(
      (journey) => provenance.journeyBookIds.get(journey.id) === activeBookId
    ),
    relationships: dataset.relationships.filter(
      (relationship) => provenance.relationshipBookIds.get(relationship.id) === activeBookId
    ),
    literary_units: dataset.literary_units.filter((literaryUnit) => literaryUnit.book_id === activeBookId)
  };
}

export function getBookDefinition(
  dataset: ExplorerDataset,
  bookId: string
): ExplorerBook | null {
  return dataset.books.find((book) => book.id === bookId) ?? null;
}

export function getBookLabelForFilter(
  dataset: ExplorerDataset,
  bookId: BookFilterId
): string {
  if (bookId === "all") {
    return dataset.books.length <= 3
      ? dataset.books.map((book) => book.label).join(" + ")
      : "All Books";
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
