import type { CanonicalDataset, Event, Tag } from "./dataset";
import {
  formatDateCertainty,
  sortEventsChronologically,
  type DatasetIndex
} from "./events";

export interface TimelineFilters {
  tagId: string;
  participantId: string;
  locationId: string;
  certainty: Event["date"]["certainty"] | "all";
  startYear: number | null;
  endYear: number | null;
}

export interface TimelineEra {
  id: string;
  title: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
}

export interface TimelineFilterOption {
  id: string;
  label: string;
}

export interface TimelineFilterOptions {
  certainties: TimelineFilterOption[];
  locations: TimelineFilterOption[];
  participants: TimelineFilterOption[];
  tags: TimelineFilterOption[];
}

export interface TimelineEraGroup {
  era: TimelineEra;
  events: Event[];
}

export interface TimelineGridBand {
  endYear: number;
  id: string;
  label: string;
  startYear: number;
}

export interface TimelineGridRecord {
  columnSpan: number;
  event: Event;
  track: number;
  yearOffset: number;
}

export interface TimelineGridLayout {
  bands: TimelineGridBand[];
  maxYear: number;
  minYear: number;
  totalTracks: number;
  undatedEvents: Event[];
  visibleYears: number[];
  records: TimelineGridRecord[];
}

export type TimelineCategoryTone =
  | "governance"
  | "movement"
  | "opposition"
  | "people"
  | "proclamation"
  | "response"
  | "sign"
  | "theology"
  | "uncategorized";

export interface TimelineCategoryLegendEntry {
  color: string;
  label: string;
  tone: TimelineCategoryTone;
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

export const defaultTimelineFilters: TimelineFilters = {
  tagId: "all",
  participantId: "all",
  locationId: "all",
  certainty: "all",
  startYear: null,
  endYear: null
};

export const timelineEras: TimelineEra[] = [
  {
    id: "jerusalem_witness",
    title: "Jerusalem Witness",
    description: "From the ascension through Saul's conversion.",
    startYear: 30,
    endYear: 35
  },
  {
    id: "gentile_opening",
    title: "Gentile Opening",
    description: "From Cornelius to the Jerusalem Council.",
    startYear: 36,
    endYear: 49
  },
  {
    id: "journeys_to_rome",
    title: "Journeys To Rome",
    description: "From Macedonia through Paul's Roman imprisonment.",
    startYear: 50,
    endYear: 62
  }
];

export const undatedTimelineEra: TimelineEra = {
  id: "undated",
  title: "Undated Events",
  description: "Events without date anchors remain visible here until refined.",
  startYear: null,
  endYear: null
};

export const timelineCertaintyLegend = [
  {
    certainty: "explicit" as const,
    label: formatDateCertainty("explicit"),
    description: "Text or source context gives a direct chronological anchor."
  },
  {
    certainty: "estimated" as const,
    label: formatDateCertainty("estimated"),
    description: "The event is placed with a best-fit year or short range."
  },
  {
    certainty: "approximate" as const,
    label: formatDateCertainty("approximate"),
    description: "The chronology is intentionally loose or rounded."
  },
  {
    certainty: "traditional" as const,
    label: formatDateCertainty("traditional"),
    description: "The date is preserved by tradition rather than direct statement."
  },
  {
    certainty: "disputed" as const,
    label: formatDateCertainty("disputed"),
    description: "Competing chronologies are plausible in current interpretation."
  },
  {
    certainty: "unknown" as const,
    label: formatDateCertainty("unknown"),
    description: "No supported chronological anchor is currently modeled."
  }
];

export const timelineCategoryLegend: TimelineCategoryLegendEntry[] = [
  {
    tone: "movement",
    label: "Movement",
    color: "#b58c3f"
  },
  {
    tone: "proclamation",
    label: "Witness",
    color: "#566f3a"
  },
  {
    tone: "response",
    label: "Response",
    color: "#8a5f86"
  },
  {
    tone: "sign",
    label: "Signs",
    color: "#37738c"
  },
  {
    tone: "opposition",
    label: "Opposition",
    color: "#a15144"
  },
  {
    tone: "governance",
    label: "Governance",
    color: "#496a56"
  },
  {
    tone: "people",
    label: "People",
    color: "#5e7e89"
  },
  {
    tone: "theology",
    label: "Theology",
    color: "#5d588d"
  },
  {
    tone: "uncategorized",
    label: "Other",
    color: "#8f8c73"
  }
];

function sortFilterOptions(options: TimelineFilterOption[]): TimelineFilterOption[] {
  return [...options].sort((leftOption, rightOption) =>
    collator.compare(leftOption.label, rightOption.label)
  );
}

export function formatTimelineYearLabel(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }

  if (year === 0) {
    return "AD 0";
  }

  return `AD ${year}`;
}

function formatTimelineBandLabel(startYear: number, endYear: number): string {
  if (startYear === endYear) {
    return formatTimelineYearLabel(startYear);
  }

  return `${formatTimelineYearLabel(startYear)} - ${formatTimelineYearLabel(endYear)}`;
}

export function getTimelineFilterOptions(
  dataset: CanonicalDataset
): TimelineFilterOptions {
  const certainties = Array.from(new Set(dataset.events.map((event) => event.date.certainty))).map(
    (certainty) => ({
      id: certainty,
      label: formatDateCertainty(certainty)
    })
  );

  return {
    certainties: sortFilterOptions(certainties),
    locations: sortFilterOptions(
      dataset.places.map((place) => ({
        id: place.id,
        label: place.name
      }))
    ),
    participants: sortFilterOptions(
      dataset.people.map((person) => ({
        id: person.id,
        label: person.name
      }))
    ),
    tags: sortFilterOptions(
      dataset.tags.map((tag) => ({
        id: tag.id,
        label: tag.label
      }))
    )
  };
}

function eventMatchesDateRange(event: Event, startYear: number | null, endYear: number | null) {
  if (startYear === null && endYear === null) {
    return true;
  }

  if (event.date.start_year === null || event.date.end_year === null) {
    return false;
  }

  if (startYear !== null && event.date.end_year < startYear) {
    return false;
  }

  if (endYear !== null && event.date.start_year > endYear) {
    return false;
  }

  return true;
}

export function filterTimelineEvents(events: Event[], filters: TimelineFilters): Event[] {
  return events.filter((event) => {
    if (filters.tagId !== "all" && !event.tag_ids.includes(filters.tagId)) {
      return false;
    }

    if (
      filters.participantId !== "all" &&
      !event.participants.includes(filters.participantId)
    ) {
      return false;
    }

    if (filters.locationId !== "all" && event.location_id !== filters.locationId) {
      return false;
    }

    if (filters.certainty !== "all" && event.date.certainty !== filters.certainty) {
      return false;
    }

    return eventMatchesDateRange(event, filters.startYear, filters.endYear);
  });
}

function isEventWithinEra(event: Event, era: TimelineEra): boolean {
  if (
    event.date.start_year === null ||
    event.date.end_year === null ||
    era.startYear === null ||
    era.endYear === null
  ) {
    return false;
  }

  return event.date.start_year <= era.endYear && event.date.end_year >= era.startYear;
}

export function getTimelineEraForEvent(event: Event): TimelineEra {
  if (event.date.start_year === null || event.date.end_year === null) {
    return undatedTimelineEra;
  }

  return timelineEras.find((era) => isEventWithinEra(event, era)) ?? undatedTimelineEra;
}

export function groupEventsByTimelineEra(events: Event[]): TimelineEraGroup[] {
  const sortedEvents = sortEventsChronologically(events);
  const groupedEvents = timelineEras.map((era) => ({
    era,
    events: sortedEvents.filter((event) => getTimelineEraForEvent(event).id === era.id)
  }));
  const undatedEvents = sortedEvents.filter(
    (event) => getTimelineEraForEvent(event).id === undatedTimelineEra.id
  );

  if (undatedEvents.length > 0) {
    groupedEvents.push({
      era: undatedTimelineEra,
      events: undatedEvents
    });
  }

  return groupedEvents.filter((group) => group.events.length > 0);
}

export function buildTimelineGridLayout(events: Event[]): TimelineGridLayout | null {
  const sortedEvents = sortEventsChronologically(events);
  const undatedEvents = sortedEvents.filter(
    (event) => event.date.start_year === null || event.date.end_year === null
  );
  const datedEvents = sortedEvents.filter(
    (event) => event.date.start_year !== null && event.date.end_year !== null
  );

  if (datedEvents.length === 0) {
    return undatedEvents.length > 0
      ? {
          minYear: 0,
          maxYear: 0,
          visibleYears: [],
          totalTracks: 0,
          records: [],
          bands: [],
          undatedEvents
        }
      : null;
  }

  const rawMinYear = Math.min(...datedEvents.map((event) => event.date.start_year!));
  const rawMaxYear = Math.max(...datedEvents.map((event) => event.date.end_year!));
  const minYear = rawMinYear - 1;
  const maxYear = rawMaxYear + 1;
  const visibleYears = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
  const trackEndYears: number[] = [];
  const records: TimelineGridRecord[] = [];

  datedEvents.forEach((event) => {
    const startYear = event.date.start_year!;
    const endYear = event.date.end_year!;
    const baseSpan = Math.max(endYear - startYear + 1, 1);
    const columnSpan = Math.max(baseSpan, 2);
    const visibleEndYear = startYear + columnSpan - 1;
    let track = trackEndYears.findIndex((trackEndYear) => trackEndYear < startYear);

    if (track === -1) {
      track = trackEndYears.length;
      trackEndYears.push(visibleEndYear);
    } else {
      trackEndYears[track] = visibleEndYear;
    }

    records.push({
      event,
      track,
      columnSpan,
      yearOffset: startYear - minYear + 1
    });
  });

  const bandSize = maxYear - minYear > 36 ? 10 : 5;
  const bandStartYear = Math.floor(minYear / bandSize) * bandSize;
  const bands: TimelineGridBand[] = [];

  for (let currentYear = bandStartYear; currentYear <= maxYear; currentYear += bandSize) {
    const startYear = Math.max(currentYear, minYear);
    const endYear = Math.min(currentYear + bandSize - 1, maxYear);

    bands.push({
      id: `band_${startYear}_${endYear}`,
      startYear,
      endYear,
      label: formatTimelineBandLabel(startYear, endYear)
    });
  }

  return {
    minYear,
    maxYear,
    visibleYears,
    totalTracks: Math.max(trackEndYears.length, 1),
    records,
    bands,
    undatedEvents
  };
}

export function getPrimaryTimelineTag(event: Event, index: DatasetIndex): Tag | null {
  const firstTagId = event.tag_ids[0];

  if (!firstTagId) {
    return null;
  }

  return index.tagsById.get(firstTagId) ?? null;
}

export function getTimelineCategoryTone(
  event: Event,
  index: DatasetIndex
): TimelineCategoryTone {
  const primaryTagGroup = getPrimaryTimelineTag(event, index)?.group;

  switch (primaryTagGroup) {
    case "governance":
    case "movement":
    case "opposition":
    case "people":
    case "proclamation":
    case "response":
    case "sign":
    case "theology":
      return primaryTagGroup;
    default:
      return "uncategorized";
  }
}
