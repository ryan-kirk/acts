import { ZodIssue } from "zod";

import { getDatasetBookLiteraryCoverage } from "./literaryCoverage";
import {
  datasetSchema,
  type BookSchema,
  type ClaimSchema,
  type DatasetSchema,
  type EventSchema,
  type JourneySchema,
  type LiteraryUnitSchema,
  type PlaceSchema,
  type RelationshipSchema,
  type SourceRefSchema
} from "./schema";

export interface ValidationIssue {
  path: string;
  message: string;
}

export class DatasetValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(formatValidationIssues(issues));
    this.name = "DatasetValidationError";
    this.issues = issues;
  }
}

function fromZodIssue(issue: ZodIssue): ValidationIssue {
  return {
    path: issue.path.length > 0 ? issue.path.join(".") : "dataset",
    message: issue.message
  };
}

function addIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function assertNoDuplicateReferences(
  issues: ValidationIssue[],
  path: string,
  values: string[],
  label: string
): void {
  const seen = new Set<string>();

  values.forEach((value, index) => {
    if (!seen.has(value)) {
      seen.add(value);
      return;
    }

    addIssue(issues, `${path}.${index}`, `Duplicate ${label} '${value}'.`);
  });
}

function checkDuplicateIds(
  issues: ValidationIssue[],
  collectionName: string,
  items: Array<{ id: string }>
): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      addIssue(
        issues,
        `${collectionName}.${item.id}`,
        `Duplicate ID '${item.id}' found in ${collectionName}.`
      );
      continue;
    }

    seen.add(item.id);
  }
}

function assertSourceRefsResolve(
  issues: ValidationIssue[],
  pathPrefix: string,
  sourceRefs: SourceRefSchema[],
  knownSourceIds: Set<string>
): void {
  sourceRefs.forEach((sourceRef, index) => {
    if (!knownSourceIds.has(sourceRef.source_id)) {
      addIssue(
        issues,
        `${pathPrefix}.source_refs.${index}.source_id`,
        `Unknown source_id '${sourceRef.source_id}'.`
      );
    }
  });
}

function assertOptionalSourceRefsResolve(
  issues: ValidationIssue[],
  pathPrefix: string,
  sourceRefs: SourceRefSchema[] | undefined,
  knownSourceIds: Set<string>
): void {
  if (sourceRefs) {
    assertSourceRefsResolve(issues, pathPrefix, sourceRefs, knownSourceIds);
  }
}

function assertBookReferencesResolve(
  issues: ValidationIssue[],
  dataset: DatasetSchema,
  knownPersonIds: Set<string>,
  knownPlaceIds: Set<string>,
  knownSourceIds: Set<string>
): void {
  const sourceTypeById = new Map(dataset.sources.map((source) => [source.id, source.type]));
  const knownBookIds = new Set(dataset.books.map((book) => book.id));

  if (!knownBookIds.has(dataset.metadata.dataset_id)) {
    addIssue(
      issues,
      "metadata.dataset_id",
      `No book record matches dataset_id '${dataset.metadata.dataset_id}'.`
    );
  }

  dataset.books.forEach((book: BookSchema, index: number) => {
    const path = `books.${index}`;

    if (!knownSourceIds.has(book.primary_source_id)) {
      addIssue(
        issues,
        `${path}.primary_source_id`,
        `Unknown primary_source_id '${book.primary_source_id}'.`
      );
    } else if (sourceTypeById.get(book.primary_source_id) !== "scripture") {
      addIssue(
        issues,
        `${path}.primary_source_id`,
        `Book primary_source_id '${book.primary_source_id}' must reference a scripture source.`
      );
    }

    if (book.composition_place_id && !knownPlaceIds.has(book.composition_place_id)) {
      addIssue(
        issues,
        `${path}.composition_place_id`,
        `Unknown composition_place_id '${book.composition_place_id}'.`
      );
    }

    if (book.destination_place_id && !knownPlaceIds.has(book.destination_place_id)) {
      addIssue(
        issues,
        `${path}.destination_place_id`,
        `Unknown destination_place_id '${book.destination_place_id}'.`
      );
    }

    book.sender_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.sender_ids.${personIndex}`,
          `Unknown sender_id '${personId}'.`
        );
      }
    });

    book.co_sender_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.co_sender_ids.${personIndex}`,
          `Unknown co_sender_id '${personId}'.`
        );
      }
    });

    book.recipient_person_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.recipient_person_ids.${personIndex}`,
          `Unknown recipient_person_id '${personId}'.`
        );
      }
    });

    book.recipient_place_ids.forEach((placeId, placeIndex) => {
      if (!knownPlaceIds.has(placeId)) {
        addIssue(
          issues,
          `${path}.recipient_place_ids.${placeIndex}`,
          `Unknown recipient_place_id '${placeId}'.`
        );
      }
    });

    book.related_person_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.related_person_ids.${personIndex}`,
          `Unknown related_person_id '${personId}'.`
        );
      }
    });

    book.related_place_ids.forEach((placeId, placeIndex) => {
      if (!knownPlaceIds.has(placeId)) {
        addIssue(
          issues,
          `${path}.related_place_ids.${placeIndex}`,
          `Unknown related_place_id '${placeId}'.`
        );
      }
    });

    assertNoDuplicateReferences(
      issues,
      `${path}.related_person_ids`,
      book.related_person_ids,
      "related_person_id"
    );
    assertNoDuplicateReferences(
      issues,
      `${path}.related_place_ids`,
      book.related_place_ids,
      "related_place_id"
    );

    assertSourceRefsResolve(issues, path, book.source_refs, knownSourceIds);
  });
}

function assertEventReferencesResolve(
  issues: ValidationIssue[],
  events: EventSchema[],
  knownPlaceIds: Set<string>,
  knownPersonIds: Set<string>,
  knownSourceIds: Set<string>,
  knownTagIds: Set<string>,
  knownJourneyIds: Set<string>,
  knownEventIds: Set<string>
): void {
  events.forEach((event, index) => {
    const path = `events.${index}`;

    if (!knownPlaceIds.has(event.location_id)) {
      addIssue(
        issues,
        `${path}.location_id`,
        `Unknown location_id '${event.location_id}'.`
      );
    }

    event.participants.forEach((participantId, participantIndex) => {
      if (!knownPersonIds.has(participantId)) {
        addIssue(
          issues,
          `${path}.participants.${participantIndex}`,
          `Unknown participant '${participantId}'.`
        );
      }
    });

    event.tag_ids.forEach((tagId, tagIndex) => {
      if (!knownTagIds.has(tagId)) {
        addIssue(issues, `${path}.tag_ids.${tagIndex}`, `Unknown tag '${tagId}'.`);
      }
    });

    event.related_event_ids.forEach((relatedEventId, relatedIndex) => {
      if (!knownEventIds.has(relatedEventId)) {
        addIssue(
          issues,
          `${path}.related_event_ids.${relatedIndex}`,
          `Unknown related_event_id '${relatedEventId}'.`
        );
      }
    });

    if (event.journey_id && !knownJourneyIds.has(event.journey_id)) {
      addIssue(
        issues,
        `${path}.journey_id`,
        `Unknown journey_id '${event.journey_id}'.`
      );
    }

    assertSourceRefsResolve(issues, path, event.source_refs, knownSourceIds);
  });
}

function assertJourneyReferencesResolve(
  issues: ValidationIssue[],
  journeys: JourneySchema[],
  knownPlaceIds: Set<string>,
  knownSourceIds: Set<string>,
  knownEventIds: Set<string>
): void {
  journeys.forEach((journey, index) => {
    const path = `journeys.${index}`;
    const sequences = journey.route.map((point) => point.sequence).sort((a, b) => a - b);

    journey.route.forEach((routePoint, routeIndex) => {
      if (!knownPlaceIds.has(routePoint.place_id)) {
        addIssue(
          issues,
          `${path}.route.${routeIndex}.place_id`,
          `Unknown route place_id '${routePoint.place_id}'.`
        );
      }
    });

    if (new Set(sequences).size !== sequences.length) {
      addIssue(
        issues,
        `${path}.route`,
        "Journey routes must not contain duplicate sequence numbers."
      );
    }

    sequences.forEach((sequence, sequenceIndex) => {
      if (sequence !== sequenceIndex + 1) {
        addIssue(
          issues,
          `${path}.route`,
          "Journey routes must use contiguous sequence numbers starting at 1."
        );
      }
    });

    journey.related_event_ids.forEach((relatedEventId, relatedIndex) => {
      if (!knownEventIds.has(relatedEventId)) {
        addIssue(
          issues,
          `${path}.related_event_ids.${relatedIndex}`,
          `Unknown related_event_id '${relatedEventId}'.`
        );
      }
    });

    assertSourceRefsResolve(issues, path, journey.source_refs, knownSourceIds);
  });
}

function assertLiteraryUnitReferencesResolve(
  issues: ValidationIssue[],
  literaryUnits: LiteraryUnitSchema[],
  knownBookIds: Set<string>,
  knownPlaceIds: Set<string>,
  knownPersonIds: Set<string>,
  knownEventIds: Set<string>,
  knownSourceIds: Set<string>
): void {
  literaryUnits.forEach((literaryUnit, index) => {
    const path = `literary_units.${index}`;

    if (!knownBookIds.has(literaryUnit.book_id)) {
      addIssue(issues, `${path}.book_id`, `Unknown book_id '${literaryUnit.book_id}'.`);
    }

    if (literaryUnit.location_id && !knownPlaceIds.has(literaryUnit.location_id)) {
      addIssue(
        issues,
        `${path}.location_id`,
        `Unknown literary unit location_id '${literaryUnit.location_id}'.`
      );
    }

    literaryUnit.participant_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.participant_ids.${personIndex}`,
          `Unknown literary unit participant_id '${personId}'.`
        );
      }
    });

    literaryUnit.related_person_ids.forEach((personId, personIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.related_person_ids.${personIndex}`,
          `Unknown literary unit related_person_id '${personId}'.`
        );
      }
    });

    literaryUnit.related_place_ids.forEach((placeId, placeIndex) => {
      if (!knownPlaceIds.has(placeId)) {
        addIssue(
          issues,
          `${path}.related_place_ids.${placeIndex}`,
          `Unknown literary unit related_place_id '${placeId}'.`
        );
      }
    });

    assertNoDuplicateReferences(
      issues,
      `${path}.participant_ids`,
      literaryUnit.participant_ids,
      "participant_id"
    );
    assertNoDuplicateReferences(
      issues,
      `${path}.related_person_ids`,
      literaryUnit.related_person_ids,
      "related_person_id"
    );
    assertNoDuplicateReferences(
      issues,
      `${path}.related_place_ids`,
      literaryUnit.related_place_ids,
      "related_place_id"
    );

    literaryUnit.related_person_ids.forEach((personId) => {
      if (literaryUnit.participant_ids.includes(personId)) {
        addIssue(
          issues,
          `${path}.related_person_ids`,
          `Literary unit related_person_id '${personId}' duplicates a participant_id anchor.`
        );
      }
    });

    literaryUnit.related_place_ids.forEach((placeId) => {
      if (literaryUnit.location_id === placeId) {
        addIssue(
          issues,
          `${path}.related_place_ids`,
          `Literary unit related_place_id '${placeId}' duplicates the primary location_id anchor.`
        );
      }
    });

    literaryUnit.related_event_ids.forEach((eventId, eventIndex) => {
      if (!knownEventIds.has(eventId)) {
        addIssue(
          issues,
          `${path}.related_event_ids.${eventIndex}`,
          `Unknown literary unit related_event_id '${eventId}'.`
        );
      }
    });

    assertSourceRefsResolve(issues, path, literaryUnit.source_refs, knownSourceIds);
  });
}

function entityExists(
  type: RelationshipSchema["from_type"],
  id: string,
  knownIdsByType: Record<RelationshipSchema["from_type"], Set<string>>
): boolean {
  return knownIdsByType[type].has(id);
}

function assertRelationshipReferencesResolve(
  issues: ValidationIssue[],
  relationships: RelationshipSchema[],
  knownIdsByType: Record<RelationshipSchema["from_type"], Set<string>>,
  knownSourceIds: Set<string>
): void {
  relationships.forEach((relationship, index) => {
    const path = `relationships.${index}`;

    if (!entityExists(relationship.from_type, relationship.from_id, knownIdsByType)) {
      addIssue(
        issues,
        `${path}.from_id`,
        `Unknown ${relationship.from_type} ID '${relationship.from_id}'.`
      );
    }

    if (!entityExists(relationship.to_type, relationship.to_id, knownIdsByType)) {
      addIssue(
        issues,
        `${path}.to_id`,
        `Unknown ${relationship.to_type} ID '${relationship.to_id}'.`
      );
    }

    assertSourceRefsResolve(issues, path, relationship.source_refs, knownSourceIds);
  });
}

function assertClaimReferencesResolve(
  issues: ValidationIssue[],
  claims: ClaimSchema[],
  knownEventIds: Set<string>,
  knownPersonIds: Set<string>,
  knownPlaceIds: Set<string>,
  knownSourceIds: Set<string>
): void {
  claims.forEach((claim, index) => {
    const path = `claims.${index}`;

    claim.related_event_ids.forEach((eventId, relatedIndex) => {
      if (!knownEventIds.has(eventId)) {
        addIssue(
          issues,
          `${path}.related_event_ids.${relatedIndex}`,
          `Unknown related_event_id '${eventId}'.`
        );
      }
    });

    claim.related_person_ids.forEach((personId, relatedIndex) => {
      if (!knownPersonIds.has(personId)) {
        addIssue(
          issues,
          `${path}.related_person_ids.${relatedIndex}`,
          `Unknown related_person_id '${personId}'.`
        );
      }
    });

    claim.related_place_ids.forEach((placeId, relatedIndex) => {
      if (!knownPlaceIds.has(placeId)) {
        addIssue(
          issues,
          `${path}.related_place_ids.${relatedIndex}`,
          `Unknown related_place_id '${placeId}'.`
        );
      }
    });

    assertSourceRefsResolve(issues, path, claim.source_refs, knownSourceIds);
  });
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n");
}

export function validateDataset(input: unknown): DatasetSchema {
  const parsed = datasetSchema.safeParse(input);

  if (!parsed.success) {
    throw new DatasetValidationError(parsed.error.issues.map(fromZodIssue));
  }

  const dataset = parsed.data;
  const issues: ValidationIssue[] = [];

  checkDuplicateIds(issues, "sources", dataset.sources);
  checkDuplicateIds(issues, "places", dataset.places);
  checkDuplicateIds(issues, "people", dataset.people);
  checkDuplicateIds(issues, "books", dataset.books);
  checkDuplicateIds(issues, "events", dataset.events);
  checkDuplicateIds(issues, "journeys", dataset.journeys);
  checkDuplicateIds(issues, "relationships", dataset.relationships);
  checkDuplicateIds(issues, "tags", dataset.tags);
  checkDuplicateIds(issues, "literary_units", dataset.literary_units);
  checkDuplicateIds(issues, "claims", dataset.claims);

  const knownSourceIds = new Set(dataset.sources.map((source) => source.id));
  const knownPlaceIds = new Set(dataset.places.map((place) => place.id));
  const knownPersonIds = new Set(dataset.people.map((person) => person.id));
  const knownBookIds = new Set(dataset.books.map((book) => book.id));
  const knownEventIds = new Set(dataset.events.map((event) => event.id));
  const knownJourneyIds = new Set(dataset.journeys.map((journey) => journey.id));
  const knownTagIds = new Set(dataset.tags.map((tag) => tag.id));

  assertBookReferencesResolve(issues, dataset, knownPersonIds, knownPlaceIds, knownSourceIds);

  dataset.places.forEach((place: PlaceSchema, index: number) => {
    assertOptionalSourceRefsResolve(issues, `places.${index}`, place.source_refs, knownSourceIds);
  });

  dataset.people.forEach((person, index) => {
    assertOptionalSourceRefsResolve(issues, `people.${index}`, person.source_refs, knownSourceIds);
  });

  assertEventReferencesResolve(
    issues,
    dataset.events,
    knownPlaceIds,
    knownPersonIds,
    knownSourceIds,
    knownTagIds,
    knownJourneyIds,
    knownEventIds
  );

  assertJourneyReferencesResolve(
    issues,
    dataset.journeys,
    knownPlaceIds,
    knownSourceIds,
    knownEventIds
  );

  const knownIdsByType: Record<RelationshipSchema["from_type"], Set<string>> = {
    book: knownBookIds,
    person: knownPersonIds,
    place: knownPlaceIds,
    event: knownEventIds,
    journey: knownJourneyIds,
    source: knownSourceIds,
    tag: knownTagIds,
    literary_unit: new Set(dataset.literary_units.map((literaryUnit) => literaryUnit.id))
  };

  assertRelationshipReferencesResolve(
    issues,
    dataset.relationships,
    knownIdsByType,
    knownSourceIds
  );

  assertLiteraryUnitReferencesResolve(
    issues,
    dataset.literary_units,
    knownBookIds,
    knownPlaceIds,
    knownPersonIds,
    knownEventIds,
    knownSourceIds
  );

  assertClaimReferencesResolve(
    issues,
    dataset.claims,
    knownEventIds,
    knownPersonIds,
    knownPlaceIds,
    knownSourceIds
  );

  const literaryCoverage = getDatasetBookLiteraryCoverage(dataset);

  literaryCoverage.forEach((coverage, index) => {
    if (coverage.missingPersonIds.length > 0) {
      addIssue(
        issues,
        `books.${index}.related_person_ids`,
        `Book '${coverage.bookId}' literary metadata does not cover people IDs: ${coverage.missingPersonIds.join(", ")}.`
      );
    }

    if (coverage.missingPlaceIds.length > 0) {
      addIssue(
        issues,
        `books.${index}.related_place_ids`,
        `Book '${coverage.bookId}' literary metadata does not cover place IDs: ${coverage.missingPlaceIds.join(", ")}.`
      );
    }
  });

  if (issues.length > 0) {
    throw new DatasetValidationError(issues);
  }

  return dataset;
}

export function safeValidateDataset(
  input: unknown
):
  | { success: true; data: DatasetSchema }
  | { success: false; error: DatasetValidationError } {
  try {
    return {
      success: true,
      data: validateDataset(input)
    };
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      return {
        success: false,
        error
      };
    }

    throw error;
  }
}
