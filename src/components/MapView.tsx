import { useEffect, useRef, useState } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { CanonicalDataset, Event, Place } from "../domain/dataset";
import {
  formatCoordinate,
  formatDateRange,
  formatLocationCertainty,
  getRelatedEvents,
  type DatasetIndex
} from "../domain/events";
import {
  getTimelineCategoryTone,
  timelineCategoryLegend
} from "../domain/timeline";
import {
  getActiveMapPlaceRecord,
  getMapJourneyOverlayById,
  getMapJourneyOverlays,
  getMapPlaceRecords,
  getMarkerRadius,
  getPreferredEventForPlace,
  locationCertaintyConfig,
  mapBaseLayers,
  type MapBaseLayerId
} from "../domain/map";
import { JourneyDetailPanel } from "./JourneyDetailPanel";

interface MapViewProps {
  activeBookLabel: string;
  dataset: CanonicalDataset;
  eventBookLabels: Map<string, string>;
  events: Event[];
  focusedPlaceId: string | null;
  index: DatasetIndex;
  onFocusPlace: (placeId: string) => void;
  onSelectEvent: (eventId: string) => void;
  selectedEventId: string;
}

type VisibilityMap<T extends string> = Record<T, boolean>;

function createCertaintyVisibilityState(): VisibilityMap<Place["location_certainty"]> {
  return {
    exact: true,
    estimated: true,
    approximate: true,
    traditional: true,
    disputed: true,
    unknown: true
  };
}

function getCompactJourneyLabel(title: string): string {
  return title
    .replace(" Missionary Journey", "")
    .replace("Voyage to Rome", "Rome Voyage");
}

export function MapView({
  activeBookLabel,
  dataset,
  eventBookLabels,
  events,
  focusedPlaceId,
  index,
  onFocusPlace,
  onSelectEvent,
  selectedEventId
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRefs = useRef<Record<string, L.CircleMarker>>({});
  const journeyLayerRefs = useRef<Record<string, L.Polyline>>({});
  const selectedEventIdRef = useRef(selectedEventId);
  const callbacksRef = useRef({
    onFocusPlace,
    onSelectEvent
  });

  const placeRecords = getMapPlaceRecords(events, index);
  const journeyOverlays = getMapJourneyOverlays(dataset, index);
  const activePlaceRecord = getActiveMapPlaceRecord(
    focusedPlaceId,
    selectedEventId,
    placeRecords,
    index
  );
  const selectedEventJourneyId = index.eventsById.get(selectedEventId)?.journey_id ?? null;

  const [baseLayerId, setBaseLayerId] = useState<MapBaseLayerId>("satellite");
  const [certaintyVisibility, setCertaintyVisibility] = useState(createCertaintyVisibilityState);
  const [journeyVisibility, setJourneyVisibility] = useState<VisibilityMap<string>>(() =>
    Object.fromEntries(journeyOverlays.map((overlay) => [overlay.id, true]))
  );
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(
    selectedEventJourneyId ?? journeyOverlays[0]?.id ?? null
  );
  const visibleJourneyOverlays = journeyOverlays.filter((overlay) => journeyVisibility[overlay.id]);

  const activeJourneyOverlay = getMapJourneyOverlayById(selectedJourneyId, journeyOverlays);
  const activeJourneyPlaceIds = new Set(
    activeJourneyOverlay?.stopRecords.map((stopRecord) => stopRecord.place.id) ?? []
  );
  const activeBaseLayer = mapBaseLayers.find((baseLayer) => baseLayer.id === baseLayerId)!;
  const visiblePlaceRecords = placeRecords.filter(
    (placeRecord) => certaintyVisibility[placeRecord.place.location_certainty]
  );
  const visibleEventTypeLegendEntries = timelineCategoryLegend.filter((legendEntry) => {
    return events.some(
      (event) => getTimelineCategoryTone(event, index) === legendEntry.tone
    );
  });

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  useEffect(() => {
    callbacksRef.current = {
      onFocusPlace,
      onSelectEvent
    };
  }, [onFocusPlace, onSelectEvent]);

  useEffect(() => {
    setJourneyVisibility((currentVisibility) => {
      const nextVisibility = Object.fromEntries(
        journeyOverlays.map((overlay) => [overlay.id, currentVisibility[overlay.id] ?? true])
      );
      const currentKeys = Object.keys(currentVisibility);
      const nextKeys = Object.keys(nextVisibility);
      const visibilityChanged =
        currentKeys.length !== nextKeys.length ||
        nextKeys.some((journeyId) => currentVisibility[journeyId] !== nextVisibility[journeyId]);

      return visibilityChanged ? nextVisibility : currentVisibility;
    });
  }, [journeyOverlays]);

  useEffect(() => {
    if (!selectedEventJourneyId) {
      return;
    }

    setJourneyVisibility((currentVisibility) =>
      currentVisibility[selectedEventJourneyId]
        ? currentVisibility
        : {
            ...currentVisibility,
            [selectedEventJourneyId]: true
          }
    );
    setSelectedJourneyId(selectedEventJourneyId);
  }, [selectedEventJourneyId]);

  useEffect(() => {
    if (journeyOverlays.length === 0) {
      if (selectedJourneyId !== null) {
        setSelectedJourneyId(null);
      }
      return;
    }

    const selectedJourneyVisible = selectedJourneyId
      ? journeyOverlays.some(
          (journeyOverlay) =>
            journeyOverlay.id === selectedJourneyId && journeyVisibility[journeyOverlay.id]
        )
      : false;

    if (selectedJourneyVisible) {
      return;
    }

    const selectedEventVisibleJourneyId =
      selectedEventJourneyId && journeyVisibility[selectedEventJourneyId]
        ? selectedEventJourneyId
        : null;
    const nextSelectedJourneyId =
      selectedEventVisibleJourneyId ?? visibleJourneyOverlays[0]?.id ?? null;

    if (nextSelectedJourneyId !== selectedJourneyId) {
      setSelectedJourneyId(nextSelectedJourneyId);
    }
  }, [
    journeyOverlays,
    journeyVisibility,
    selectedEventJourneyId,
    selectedJourneyId,
    visibleJourneyOverlays
  ]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [37.5, 26.2],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = map;

    const initialTileLayer = L.tileLayer(activeBaseLayer.url, {
      maxZoom: 18
    });
    initialTileLayer.addTo(map);
    tileLayerRef.current = initialTileLayer;

    const tilePane = map.getPane("tilePane");
    if (tilePane) {
      tilePane.style.filter = activeBaseLayer.filter;
    }

    placeRecords.forEach((placeRecord) => {
      const certaintyTone = locationCertaintyConfig[placeRecord.place.location_certainty];
      const marker = L.circleMarker([placeRecord.place.latitude, placeRecord.place.longitude], {
        radius: getMarkerRadius(placeRecord.eventCount, false),
        fillColor: certaintyTone.color,
        fillOpacity: 0.82,
        color: certaintyTone.stroke,
        weight: 2
      });

      marker.on("click", () => {
        const preferredEvent = getPreferredEventForPlace(
          placeRecord,
          selectedEventIdRef.current
        );

        if (preferredEvent) {
          callbacksRef.current.onFocusPlace(placeRecord.place.id);
          callbacksRef.current.onSelectEvent(preferredEvent.id);
        }
      });

      marker.addTo(map);
      markerRefs.current[placeRecord.place.id] = marker;
    });

    journeyOverlays.forEach((overlay) => {
      const polyline = L.polyline(overlay.points, {
        color: overlay.color,
        weight: 2.4,
        opacity: 0.7,
        dashArray: "8 5"
      });

      polyline.on("click", () => {
        setSelectedJourneyId(overlay.id);
      });

      polyline.addTo(map);
      journeyLayerRefs.current[overlay.id] = polyline;
    });

    if (placeRecords.length > 0) {
      map.fitBounds(
        placeRecords.map((placeRecord) => [
          placeRecord.place.latitude,
          placeRecord.place.longitude
        ]),
        {
          padding: [24, 24]
        }
      );
    }

    map.invalidateSize();

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markerRefs.current = {};
      journeyLayerRefs.current = {};
    };
  }, [activeBaseLayer.filter, activeBaseLayer.url, journeyOverlays, placeRecords]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const nextTileLayer = L.tileLayer(activeBaseLayer.url, {
      maxZoom: 18
    });
    nextTileLayer.addTo(map);
    tileLayerRef.current = nextTileLayer;

    const tilePane = map.getPane("tilePane");
    if (tilePane) {
      tilePane.style.filter = activeBaseLayer.filter;
    }
  }, [activeBaseLayer]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    placeRecords.forEach((placeRecord) => {
      const marker = markerRefs.current[placeRecord.place.id];
      if (!marker) {
        return;
      }

      const isVisible = certaintyVisibility[placeRecord.place.location_certainty];
      const isSelected = activePlaceRecord?.place.id === placeRecord.place.id;
      const isRouteStop = activeJourneyPlaceIds.has(placeRecord.place.id);
      const certaintyTone = locationCertaintyConfig[placeRecord.place.location_certainty];

      if (isVisible) {
        if (!map.hasLayer(marker)) {
          marker.addTo(map);
        }
      } else if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }

      marker.setStyle({
        radius: isSelected
          ? getMarkerRadius(placeRecord.eventCount, true)
          : isRouteStop
            ? getMarkerRadius(placeRecord.eventCount, false) + 1
            : getMarkerRadius(placeRecord.eventCount, false),
        fillColor: isSelected ? "#c9922a" : certaintyTone.color,
        fillOpacity: isSelected ? 1 : isRouteStop ? 0.94 : 0.82,
        color: isSelected
          ? "#f2e4bd"
          : isRouteStop
            ? activeJourneyOverlay?.color ?? certaintyTone.stroke
            : certaintyTone.stroke,
        weight: isSelected ? 3 : isRouteStop ? 3 : 2
      });
    });
  }, [activeJourneyOverlay, activeJourneyPlaceIds, activePlaceRecord, certaintyVisibility, placeRecords]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    journeyOverlays.forEach((overlay) => {
      const layer = journeyLayerRefs.current[overlay.id];

      if (!layer) {
        return;
      }

      if (journeyVisibility[overlay.id]) {
        if (!map.hasLayer(layer)) {
          layer.addTo(map);
        }
      } else if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }

      layer.setStyle({
        color: overlay.color,
        weight: activeJourneyOverlay?.id === overlay.id ? 4.2 : 2.4,
        opacity: activeJourneyOverlay?.id === overlay.id ? 0.96 : 0.62,
        dashArray: activeJourneyOverlay?.id === overlay.id ? "10 4" : "8 5"
      });
    });
  }, [activeJourneyOverlay, journeyOverlays, journeyVisibility]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !activeJourneyOverlay) {
      return;
    }

    map.fitBounds(activeJourneyOverlay.points, {
      padding: [36, 36]
    });
  }, [activeJourneyOverlay]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !activePlaceRecord) {
      return;
    }

    map.flyTo([activePlaceRecord.place.latitude, activePlaceRecord.place.longitude], 6, {
      duration: 0.9
    });
  }, [activePlaceRecord]);

  function handleToggleJourneyVisibility(journeyId: string): void {
    setJourneyVisibility((currentVisibility) => ({
      ...currentVisibility,
      [journeyId]: !currentVisibility[journeyId]
    }));
  }

  function handleFocusJourney(journeyId: string): void {
    setJourneyVisibility((currentVisibility) =>
      currentVisibility[journeyId]
        ? currentVisibility
        : {
            ...currentVisibility,
            [journeyId]: true
          }
    );
    setSelectedJourneyId(journeyId);
  }

  return (
    <section className="map-view" aria-label="Scripture map explorer">
      <div className="map-toolbar">
        <div className="map-toolbar-group map-toolbar-group-compact">
          <span className="map-toolbar-label">Basemap</span>
          <div className="map-chip-row">
            {mapBaseLayers.map((baseLayer) => (
              <button
                key={baseLayer.id}
                type="button"
                className={`map-chip ${baseLayerId === baseLayer.id ? "is-active" : ""}`}
                onClick={() => setBaseLayerId(baseLayer.id)}
              >
                {baseLayer.label}
              </button>
            ))}
          </div>
        </div>

        <div className="map-toolbar-group map-toolbar-group-compact">
          <div className="map-toolbar-header">
            <span className="map-toolbar-label">Journey Routes</span>
            <span className="map-toolbar-note">
              {visibleJourneyOverlays.length} visible
            </span>
          </div>
          <div className="map-chip-row">
            {journeyOverlays.map((overlay) => (
              <button
                key={overlay.id}
                type="button"
                className={`map-chip ${journeyVisibility[overlay.id] ? "is-active" : ""}`}
                aria-pressed={journeyVisibility[overlay.id]}
                onClick={() => handleToggleJourneyVisibility(overlay.id)}
              >
                {getCompactJourneyLabel(overlay.journey.title)}
              </button>
            ))}
          </div>
        </div>

        <div className="map-toolbar-group map-toolbar-group-wide">
          <div className="map-toolbar-header">
            <span className="map-toolbar-label">Location Certainty</span>
            <span className="map-toolbar-note">Marker tones reflect place certainty.</span>
          </div>
          <div className="map-chip-row">
            {Object.entries(locationCertaintyConfig).map(([certainty, config]) => (
              <button
                key={certainty}
                type="button"
                className={`map-chip ${certaintyVisibility[certainty as Place["location_certainty"]] ? "is-active" : ""}`}
                title={config.description}
                onClick={() =>
                  setCertaintyVisibility((currentVisibility) => ({
                    ...currentVisibility,
                    [certainty]: !currentVisibility[certainty as Place["location_certainty"]]
                  }))
                }
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="map-shell">
        <div ref={containerRef} className="map-canvas" />

        <div className="map-overlay map-status-card">
          <strong>{visiblePlaceRecords.length} validated places visible</strong>
          <span>
            {visibleJourneyOverlays.length} active overlay
            {visibleJourneyOverlays.length === 1 ? "" : "s"} of {journeyOverlays.length}
          </span>
          <span>Book focus: {activeBookLabel}</span>
          <span>
            Focus route: {activeJourneyOverlay?.journey.title ?? "None selected"}
          </span>
        </div>

        <div className="map-overlay map-event-legend-card">
          <div className="map-legend-header">
            <strong>Event types</strong>
            <span>Shared scripture record tones used across the explorer.</span>
          </div>
          <ul className="map-event-legend-list">
            {visibleEventTypeLegendEntries.map((legendEntry) => (
              <li key={legendEntry.tone}>
                <span
                  className="map-event-legend-swatch"
                  style={{ background: legendEntry.color }}
                />
                <span>{legendEntry.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="map-overlay map-attribution-card">
          Basemap: {activeBaseLayer.label} · {activeBaseLayer.attribution}
        </div>
      </div>

      <div className="map-detail-grid">
        <JourneyDetailPanel
          activeJourneyOverlay={activeJourneyOverlay}
          activePlaceId={activePlaceRecord?.place.id ?? null}
          activeBookLabel={activeBookLabel}
          eventBookLabels={eventBookLabels}
          index={index}
          journeyOverlays={journeyOverlays}
          journeyVisibility={journeyVisibility}
          onFocusPlace={onFocusPlace}
          onFocusJourney={handleFocusJourney}
          onSelectEvent={onSelectEvent}
          onToggleJourneyVisibility={handleToggleJourneyVisibility}
          selectedEventId={selectedEventId}
        />

        {activePlaceRecord ? (
          <section className="map-place-panel">
            <div className="map-place-header">
              <div>
                <p className="section-eyebrow">Place Interaction</p>
                <h3>{activePlaceRecord.place.name}</h3>
              </div>
              <span className="entity-type-badge">
                {formatLocationCertainty(activePlaceRecord.place.location_certainty)}
              </span>
            </div>

            <p className="map-place-summary">
              {activePlaceRecord.place.summary ?? "No place summary has been modeled yet."}
            </p>

            <dl className="preview-meta-grid">
              <div>
                <dt>Region</dt>
                <dd>{activePlaceRecord.place.region}</dd>
              </div>
              <div>
                <dt>Modern Country</dt>
                <dd>{activePlaceRecord.place.modern_country}</dd>
              </div>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {formatCoordinate(activePlaceRecord.place.latitude)},{" "}
                  {formatCoordinate(activePlaceRecord.place.longitude)}
                </dd>
              </div>
              <div>
                <dt>Related Events</dt>
                <dd>{activePlaceRecord.eventCount}</dd>
              </div>
            </dl>

            <div className="map-place-section">
              <div className="section-header-row">
                <h3>Events at this place</h3>
              </div>
              <ul className="linked-record-list">
                {activePlaceRecord.events.map((placeEvent) => (
                  <li key={placeEvent.id}>
                    <button
                      type="button"
                      className={`linked-record-button ${
                        placeEvent.id === selectedEventId ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectEvent(placeEvent.id)}
                    >
                      <strong>{placeEvent.title}</strong>
                      <span>
                        {eventBookLabels.get(placeEvent.id) ?? activeBookLabel} •{" "}
                        {formatDateRange(placeEvent)} •{" "}
                        {placeEvent.source_refs[0]?.citation ?? "Citation pending"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {activePlaceRecord.journeyIds.length > 0 ? (
              <div className="map-place-section">
                <div className="section-header-row">
                  <h3>Journeys through this place</h3>
                </div>
                <div className="map-journey-pill-row">
                  {activePlaceRecord.journeyIds.map((journeyId) => {
                    const journey = index.journeysById.get(journeyId);
                    const isSelected = activeJourneyOverlay?.id === journeyId;

                    return (
                      <button
                        key={journeyId}
                        type="button"
                        className={`map-inline-button ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleFocusJourney(journeyId)}
                      >
                        {journey?.title ?? journeyId}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {getPreferredEventForPlace(activePlaceRecord, selectedEventId) ? (
              <div className="map-place-section">
                <div className="section-header-row">
                  <h3>Selected event relationships</h3>
                </div>
                <ul className="linked-record-list">
                  {getRelatedEvents(
                    getPreferredEventForPlace(activePlaceRecord, selectedEventId)!,
                    index
                  ).map((relatedEvent) => (
                    <li key={relatedEvent.id}>
                      <button
                        type="button"
                        className="linked-record-button"
                        onClick={() => onSelectEvent(relatedEvent.id)}
                      >
                        <strong>{relatedEvent.title}</strong>
                        <span>
                          {eventBookLabels.get(relatedEvent.id) ?? activeBookLabel} •{" "}
                          {formatDateRange(relatedEvent)} •{" "}
                          {relatedEvent.source_refs[0]?.citation ?? "Citation pending"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : (
          <div className="empty-state">
            <h3>No map place is currently selected</h3>
            <p>Choose an event, marker, or place-focus action to anchor the map explorer.</p>
          </div>
        )}
      </div>
    </section>
  );
}
