import { ZodIssue } from "zod";

import {
  datasetSchema,
  type ClaimSchema,
  type DatasetSchema,
  type EventSchema,
  type JourneySchema,
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
  checkDuplicateIds(issues, "events", dataset.events);
  checkDuplicateIds(issues, "journeys", dataset.journeys);
  checkDuplicateIds(issues, "relationships", dataset.relationships);
  checkDuplicateIds(issues, "tags", dataset.tags);
  checkDuplicateIds(issues, "claims", dataset.claims);

  const knownSourceIds = new Set(dataset.sources.map((source) => source.id));
  const knownPlaceIds = new Set(dataset.places.map((place) => place.id));
  const knownPersonIds = new Set(dataset.people.map((person) => person.id));
  const knownEventIds = new Set(dataset.events.map((event) => event.id));
  const knownJourneyIds = new Set(dataset.journeys.map((journey) => journey.id));
  const knownTagIds = new Set(dataset.tags.map((tag) => tag.id));

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
    person: knownPersonIds,
    place: knownPlaceIds,
    event: knownEventIds,
    journey: knownJourneyIds,
    source: knownSourceIds,
    tag: knownTagIds
  };

  assertRelationshipReferencesResolve(
    issues,
    dataset.relationships,
    knownIdsByType,
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
