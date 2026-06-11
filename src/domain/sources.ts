import type {
  CanonicalDataset,
  Claim,
  Event,
  Person,
  Place,
  Source
} from "./dataset";
import { sortEventsChronologically, type DatasetIndex } from "./events";

export type SourceSectionId =
  | "scripture_witnesses"
  | "historical_witnesses"
  | "material_witnesses";

export interface SourceSectionDefinition {
  description: string;
  id: SourceSectionId;
  label: string;
}

export interface ClaimSourceEntry {
  citation: string;
  note?: string;
  source: Source;
}

export interface ClaimExplorerRecord {
  claim: Claim;
  relatedEvents: Event[];
  relatedPeople: Person[];
  relatedPlaces: Place[];
  sourceEntries: ClaimSourceEntry[];
}

export interface SourceExplorerRecord {
  isExternal: boolean;
  linkedClaims: ClaimExplorerRecord[];
  linkedEvents: Event[];
  sectionId: SourceSectionId;
  source: Source;
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

const confidenceRank: Record<Claim["confidence"], number> = {
  high: 0,
  medium: 1,
  low: 2
};

export const sourceSections: readonly SourceSectionDefinition[] = [
  {
    id: "scripture_witnesses",
    label: "Scriptural Witnesses",
    description:
      "Canonical scripture references that ground the visible event records and preserve the base narrative layer."
  },
  {
    id: "historical_witnesses",
    label: "Historical & Scholarly Witnesses",
    description:
      "Later historians, literary parallels, commentaries, books, and scholarly studies that help interpret or date visible records."
  },
  {
    id: "material_witnesses",
    label: "Material & Geographic Witnesses",
    description:
      "Archaeological, atlas, manuscript, and dataset-style witnesses that anchor places, routes, or textual traditions."
  }
] as const;

function compareClaims(leftClaim: Claim, rightClaim: Claim): number {
  const confidenceDifference =
    confidenceRank[leftClaim.confidence] - confidenceRank[rightClaim.confidence];

  if (confidenceDifference !== 0) {
    return confidenceDifference;
  }

  return collator.compare(leftClaim.id, rightClaim.id);
}

function compareSources(leftSource: SourceExplorerRecord, rightSource: SourceExplorerRecord): number {
  if (leftSource.linkedClaims.length !== rightSource.linkedClaims.length) {
    return rightSource.linkedClaims.length - leftSource.linkedClaims.length;
  }

  if (leftSource.linkedEvents.length !== rightSource.linkedEvents.length) {
    return rightSource.linkedEvents.length - leftSource.linkedEvents.length;
  }

  return collator.compare(leftSource.source.name, rightSource.source.name);
}

function getSourceSectionId(sourceType: Source["type"]): SourceSectionId {
  switch (sourceType) {
    case "scripture":
      return "scripture_witnesses";
    case "historical":
    case "commentary":
    case "scholarly_article":
    case "book":
      return "historical_witnesses";
    case "archaeological":
    case "manuscript":
    case "atlas":
    case "dataset":
      return "material_witnesses";
    default:
      return "historical_witnesses";
  }
}

function buildVisibleScope(events: Event[]) {
  const visibleEventIds = new Set(events.map((event) => event.id));
  const visiblePersonIds = new Set(events.flatMap((event) => event.participants));
  const visiblePlaceIds = new Set(events.map((event) => event.location_id));

  return {
    visibleEventIds,
    visiblePersonIds,
    visiblePlaceIds
  };
}

function claimIsVisible(
  claim: Claim,
  scope: ReturnType<typeof buildVisibleScope>
): boolean {
  if (claim.related_event_ids.some((eventId) => scope.visibleEventIds.has(eventId))) {
    return true;
  }

  if (claim.related_person_ids.some((personId) => scope.visiblePersonIds.has(personId))) {
    return true;
  }

  if (claim.related_place_ids.some((placeId) => scope.visiblePlaceIds.has(placeId))) {
    return true;
  }

  return false;
}

function buildClaimSourceEntries(claim: Claim, index: DatasetIndex): ClaimSourceEntry[] {
  return claim.source_refs.flatMap((sourceRef) => {
    const source = index.sourcesById.get(sourceRef.source_id);
    return source
      ? [
          {
            citation: sourceRef.citation,
            ...(sourceRef.note ? { note: sourceRef.note } : {}),
            source
          }
        ]
      : [];
  });
}

function buildClaimExplorerRecord(
  claim: Claim,
  index: DatasetIndex
): ClaimExplorerRecord {
  return {
    claim,
    relatedEvents: sortEventsChronologically(
      claim.related_event_ids.flatMap((eventId) => {
        const event = index.eventsById.get(eventId);
        return event ? [event] : [];
      })
    ),
    relatedPeople: claim.related_person_ids.flatMap((personId) => {
      const person = index.peopleById.get(personId);
      return person ? [person] : [];
    }),
    relatedPlaces: claim.related_place_ids.flatMap((placeId) => {
      const place = index.placesById.get(placeId);
      return place ? [place] : [];
    }),
    sourceEntries: buildClaimSourceEntries(claim, index)
  };
}

export function buildClaimExplorerRecords(
  dataset: CanonicalDataset,
  index: DatasetIndex,
  visibleEvents: Event[]
): ClaimExplorerRecord[] {
  const scope = buildVisibleScope(visibleEvents);

  return dataset.claims
    .filter((claim) => claimIsVisible(claim, scope))
    .sort(compareClaims)
    .map((claim) => buildClaimExplorerRecord(claim, index));
}

export function getClaimRecordsForEvent(
  eventId: string,
  dataset: CanonicalDataset,
  index: DatasetIndex
): ClaimExplorerRecord[] {
  return dataset.claims
    .filter((claim) => claim.related_event_ids.includes(eventId))
    .sort(compareClaims)
    .map((claim) => buildClaimExplorerRecord(claim, index));
}

export function buildSourceExplorerRecords(
  dataset: CanonicalDataset,
  visibleEvents: Event[],
  claimRecords: ClaimExplorerRecord[]
): SourceExplorerRecord[] {
  const sourceRecords = dataset.sources.flatMap((source) => {
    const linkedEvents = sortEventsChronologically(
      visibleEvents.filter((event) =>
        event.source_refs.some((sourceRef) => sourceRef.source_id === source.id)
      )
    );
    const linkedClaims = claimRecords.filter((claimRecord) =>
      claimRecord.sourceEntries.some((sourceEntry) => sourceEntry.source.id === source.id)
    );

    if (linkedEvents.length === 0 && linkedClaims.length === 0) {
      return [];
    }

    return [
      {
        source,
        linkedEvents,
        linkedClaims,
        sectionId: getSourceSectionId(source.type),
        isExternal: source.type !== "scripture"
      }
    ];
  });

  return sourceRecords.sort(compareSources);
}

export function groupSourceExplorerRecords(
  records: SourceExplorerRecord[]
): Array<{ records: SourceExplorerRecord[]; section: SourceSectionDefinition }> {
  return sourceSections.flatMap((section) => {
    const sectionRecords = records.filter((record) => record.sectionId === section.id);

    return sectionRecords.length > 0
      ? [
          {
            section,
            records: sectionRecords
          }
        ]
      : [];
  });
}

export function getPreferredSourceId(
  records: SourceExplorerRecord[],
  focusedSourceId: string | null,
  selectedEvent: Event
): string | null {
  if (focusedSourceId && records.some((record) => record.source.id === focusedSourceId)) {
    return focusedSourceId;
  }

  const selectedEventSourceId = selectedEvent.source_refs.find((sourceRef) =>
    records.some((record) => record.source.id === sourceRef.source_id)
  )?.source_id;

  if (selectedEventSourceId) {
    return selectedEventSourceId;
  }

  return records[0]?.source.id ?? null;
}

export function formatClaimType(claimType: string): string {
  return claimType
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatClaimConfidence(confidence: Claim["confidence"]): string {
  switch (confidence) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return confidence;
  }
}

export function getClaimConfidenceDescription(confidence: Claim["confidence"]): string {
  switch (confidence) {
    case "high":
      return "Strong external anchor or broad scholarly agreement supports this interpretive layer.";
    case "medium":
      return "This claim reflects a responsible synthesis with some open interpretive judgment.";
    case "low":
      return "This claim is a cautious or later-layer tradition and should not be confused with explicit canonical narration.";
    default:
      return "Confidence has not yet been described for this claim.";
  }
}

export function formatRightsStatus(status: Source["usage_rights"]["status"]): string {
  switch (status) {
    case "cleared":
      return "Cleared";
    case "restricted":
      return "Restricted";
    case "pending_review":
      return "Pending Review";
    case "not_applicable":
      return "Not Applicable";
    case "unknown":
      return "Unknown";
    default:
      return status;
  }
}
