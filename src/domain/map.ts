import type { CanonicalDataset, Event, Journey, Place } from "./dataset";
import { sortEventsChronologically, type DatasetIndex } from "./events";

export type MapBaseLayerId = "satellite" | "terrain" | "topo";

export interface MapBaseLayerConfig {
  attribution: string;
  filter: string;
  id: MapBaseLayerId;
  label: string;
  url: string;
}

export interface MapPlaceRecord {
  eventCount: number;
  events: Event[];
  journeyIds: string[];
  place: Place;
}

export interface MapJourneyOverlay {
  color: string;
  id: string;
  journey: Journey;
  points: Array<[number, number]>;
}

export interface LocationCertaintyConfig {
  color: string;
  description: string;
  label: string;
  stroke: string;
}

export const mapBaseLayers: MapBaseLayerConfig[] = [
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri World Imagery",
    filter: "sepia(18%) contrast(1.08) brightness(0.86) saturate(1.08)"
  },
  {
    id: "terrain",
    label: "Terrain",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri World Shaded Relief",
    filter: "sepia(30%) contrast(1.06) brightness(0.9) saturate(0.88)"
  },
  {
    id: "topo",
    label: "Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri World Topographic",
    filter: "sepia(10%) contrast(1.02) brightness(0.94)"
  }
];

export const locationCertaintyConfig: Record<
  Place["location_certainty"],
  LocationCertaintyConfig
> = {
  exact: {
    label: "Exact",
    description: "Well-established coordinates.",
    color: "#5a9267",
    stroke: "#dce9d2"
  },
  estimated: {
    label: "Estimated",
    description: "Likely site with some uncertainty.",
    color: "#6b88b5",
    stroke: "#d8dfef"
  },
  approximate: {
    label: "Approximate",
    description: "General area rather than precise spot.",
    color: "#c9922a",
    stroke: "#f3dfb0"
  },
  traditional: {
    label: "Traditional",
    description: "Historic or later-identified site.",
    color: "#8d6fae",
    stroke: "#e1d7ef"
  },
  disputed: {
    label: "Disputed",
    description: "Actively debated location.",
    color: "#b45b4c",
    stroke: "#f0d7d1"
  },
  unknown: {
    label: "Unknown",
    description: "No reliable mapped site.",
    color: "#7c8484",
    stroke: "#dee2e1"
  }
};

const journeyPalette = ["#d3a548", "#6f9e88", "#aa7ec8", "#d06767"];

export function isRenderableCoordinate(place: Pick<Place, "latitude" | "longitude">): boolean {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

export function getMapPlaceRecords(events: Event[], index: DatasetIndex): MapPlaceRecord[] {
  const groupedByPlace = new Map<string, Event[]>();

  events.forEach((event) => {
    const existingEvents = groupedByPlace.get(event.location_id) ?? [];
    existingEvents.push(event);
    groupedByPlace.set(event.location_id, existingEvents);
  });

  const records = Array.from(groupedByPlace.entries()).flatMap(([placeId, placeEvents]) => {
    const place = index.placesById.get(placeId);

    if (!place || !isRenderableCoordinate(place)) {
      return [];
    }

    const journeyIds = Array.from(
      new Set(placeEvents.flatMap((event) => (event.journey_id ? [event.journey_id] : [])))
    );

    return [
      {
        place,
        events: sortEventsChronologically(placeEvents),
        eventCount: placeEvents.length,
        journeyIds
      }
    ];
  });

  return records.sort((leftRecord, rightRecord) => {
    const leftFirstEvent = leftRecord.events[0];
    const rightFirstEvent = rightRecord.events[0];

    if (!leftFirstEvent || !rightFirstEvent) {
      return leftRecord.place.name.localeCompare(rightRecord.place.name);
    }

    const dateDifference =
      (leftFirstEvent.date.start_year ?? Number.MAX_SAFE_INTEGER) -
      (rightFirstEvent.date.start_year ?? Number.MAX_SAFE_INTEGER);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return leftRecord.place.name.localeCompare(rightRecord.place.name);
  });
}

export function getMapJourneyOverlays(
  dataset: CanonicalDataset,
  index: DatasetIndex
): MapJourneyOverlay[] {
  return dataset.journeys.flatMap((journey, journeyIndex) => {
    const points = journey.route
      .flatMap((routePoint) => {
        const place = index.placesById.get(routePoint.place_id);
        return place && isRenderableCoordinate(place) ? [place] : [];
      })
      .map((place) => [place.latitude, place.longitude] as [number, number]);

    if (points.length < 2) {
      return [];
    }

    return [
      {
        id: journey.id,
        journey,
        points,
        color: journeyPalette[journeyIndex % journeyPalette.length]!
      }
    ];
  });
}

export function getPreferredEventForPlace(
  placeRecord: MapPlaceRecord,
  selectedEventId: string | null
): Event | null {
  if (selectedEventId) {
    const selectedEvent = placeRecord.events.find((event) => event.id === selectedEventId);
    if (selectedEvent) {
      return selectedEvent;
    }
  }

  return placeRecord.events[0] ?? null;
}

export function getMapPlaceRecordById(
  placeId: string | null,
  placeRecords: MapPlaceRecord[]
): MapPlaceRecord | null {
  if (!placeId) {
    return null;
  }

  return placeRecords.find((placeRecord) => placeRecord.place.id === placeId) ?? null;
}

export function getActiveMapPlaceRecord(
  focusedPlaceId: string | null,
  selectedEventId: string | null,
  placeRecords: MapPlaceRecord[],
  index: DatasetIndex
): MapPlaceRecord | null {
  const focusedPlaceRecord = getMapPlaceRecordById(focusedPlaceId, placeRecords);

  if (focusedPlaceRecord) {
    return focusedPlaceRecord;
  }

  if (!selectedEventId) {
    return placeRecords[0] ?? null;
  }

  const selectedEvent = index.eventsById.get(selectedEventId);

  if (!selectedEvent) {
    return placeRecords[0] ?? null;
  }

  return getMapPlaceRecordById(selectedEvent.location_id, placeRecords) ?? placeRecords[0] ?? null;
}

export function getMarkerRadius(eventCount: number, isSelected: boolean): number {
  const baseRadius = 6 + Math.min(eventCount - 1, 3);
  return isSelected ? baseRadius + 2 : baseRadius;
}
