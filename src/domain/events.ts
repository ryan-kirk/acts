import type {
  CanonicalDataset,
  Event,
  Journey,
  Person,
  Place,
  Source,
  Tag
} from "./dataset";

export type ExplorerView = "overview" | "timeline" | "map" | "people" | "sources";

export interface ExplorerViewOption {
  id: ExplorerView;
  label: string;
  description: string;
}

export interface DatasetIndex {
  eventsById: Map<string, Event>;
  journeysById: Map<string, Journey>;
  peopleById: Map<string, Person>;
  placesById: Map<string, Place>;
  sourcesById: Map<string, Source>;
  tagsById: Map<string, Tag>;
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

export const explorerViews: ExplorerViewOption[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Dataset status and current explorer scope."
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Chronology preview anchored to the selected Acts event."
  },
  {
    id: "map",
    label: "Map",
    description: "Place preview using the selected event's validated location."
  },
  {
    id: "people",
    label: "People",
    description: "Participant preview from the selected event."
  },
  {
    id: "sources",
    label: "Sources",
    description: "Source and rights preview for the selected event."
  }
];

export function buildDatasetIndex(dataset: CanonicalDataset): DatasetIndex {
  return {
    eventsById: new Map(dataset.events.map((event) => [event.id, event])),
    journeysById: new Map(dataset.journeys.map((journey) => [journey.id, journey])),
    peopleById: new Map(dataset.people.map((person) => [person.id, person])),
    placesById: new Map(dataset.places.map((place) => [place.id, place])),
    sourcesById: new Map(dataset.sources.map((source) => [source.id, source])),
    tagsById: new Map(dataset.tags.map((tag) => [tag.id, tag]))
  };
}

function getComparableYear(year: number | null, fallback: number): number {
  return year ?? fallback;
}

export function sortEventsChronologically(events: Event[]): Event[] {
  return [...events].sort((leftEvent, rightEvent) => {
    const startYearDifference =
      getComparableYear(leftEvent.date.start_year, Number.MAX_SAFE_INTEGER) -
      getComparableYear(rightEvent.date.start_year, Number.MAX_SAFE_INTEGER);

    if (startYearDifference !== 0) {
      return startYearDifference;
    }

    const endYearDifference =
      getComparableYear(leftEvent.date.end_year, Number.MAX_SAFE_INTEGER) -
      getComparableYear(rightEvent.date.end_year, Number.MAX_SAFE_INTEGER);

    if (endYearDifference !== 0) {
      return endYearDifference;
    }

    return collator.compare(leftEvent.title, rightEvent.title);
  });
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getEventSearchDocument(event: Event, index: DatasetIndex): string {
  const locationName = index.placesById.get(event.location_id)?.name ?? "";
  const sourceCitations = event.source_refs.map((sourceRef) => sourceRef.citation).join(" ");
  const participantNames = event.participants
    .map((participantId) => index.peopleById.get(participantId)?.name ?? "")
    .join(" ");

  return normalizeSearchText(
    [event.title, event.summary, locationName, sourceCitations, participantNames].join(" ")
  );
}

export function filterEventsByQuery(
  events: Event[],
  query: string,
  index: DatasetIndex
): Event[] {
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length === 0) {
    return events;
  }

  return events.filter((event) => getEventSearchDocument(event, index).includes(normalizedQuery));
}

function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }

  return `AD ${year}`;
}

export function formatDateRange(event: Event): string {
  const { start_year: startYear, end_year: endYear } = event.date;

  if (startYear === null || endYear === null) {
    return "Date unknown";
  }

  if (startYear === endYear) {
    return formatYear(startYear);
  }

  return `${formatYear(startYear)} to ${formatYear(endYear)}`;
}

export function formatDateCertainty(certainty: Event["date"]["certainty"]): string {
  switch (certainty) {
    case "explicit":
      return "Explicit";
    case "estimated":
      return "Estimated";
    case "approximate":
      return "Approximate";
    case "traditional":
      return "Traditional";
    case "disputed":
      return "Disputed";
    case "unknown":
      return "Unknown";
    default:
      return certainty;
  }
}

export function getEventParticipants(event: Event, index: DatasetIndex): Person[] {
  return event.participants.flatMap((participantId) => {
    const person = index.peopleById.get(participantId);
    return person ? [person] : [];
  });
}

export function getEventTags(event: Event, index: DatasetIndex): Tag[] {
  return event.tag_ids.flatMap((tagId) => {
    const tag = index.tagsById.get(tagId);
    return tag ? [tag] : [];
  });
}

export function getEventJourney(event: Event, index: DatasetIndex): Journey | null {
  if (!event.journey_id) {
    return null;
  }

  return index.journeysById.get(event.journey_id) ?? null;
}

export function formatCoordinate(value: number): string {
  return value.toFixed(4);
}
