import { useDeferredValue, useState } from "react";

import { EventInspector } from "../components/EventInspector";
import { EventRail } from "../components/EventRail";
import { ExplorerStage } from "../components/ExplorerStage";
import { ViewNavigation } from "../components/ViewNavigation";
import type { CanonicalDataset } from "../domain/dataset";
import {
  buildDatasetIndex,
  filterEventsByQuery,
  sortEventsChronologically,
  type ExplorerView
} from "../domain/events";
import { defaultTimelineFilters } from "../domain/timeline";

interface ExplorerShellProps {
  dataset: CanonicalDataset;
}

export function ExplorerShell({ dataset }: ExplorerShellProps) {
  const datasetIndex = buildDatasetIndex(dataset);
  const sortedEvents = sortEventsChronologically(dataset.events);
  const [activeView, setActiveView] = useState<ExplorerView>("overview");
  const [selectedEventId, setSelectedEventId] = useState(sortedEvents[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedPersonId, setFocusedPersonId] = useState<string | null>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [focusedSourceId, setFocusedSourceId] = useState<string | null>(null);
  const [timelineFilters, setTimelineFilters] = useState({
    ...defaultTimelineFilters
  });
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const selectedEvent = datasetIndex.eventsById.get(selectedEventId) ?? sortedEvents[0] ?? null;
  const filteredEvents = filterEventsByQuery(sortedEvents, deferredSearchQuery, datasetIndex);
  const selectedEventHidden =
    selectedEvent !== null && !filteredEvents.some((event) => event.id === selectedEvent.id);

  function clearEntityFocus(): void {
    setFocusedPersonId(null);
    setFocusedPlaceId(null);
    setFocusedSourceId(null);
  }

  function handleSelectEvent(eventId: string): void {
    setSelectedEventId(eventId);
    clearEntityFocus();
    setIsRailOpen(false);
    setIsInspectorOpen(true);
  }

  function handleFocusPlace(placeId: string): void {
    setFocusedPlaceId(placeId);
    setFocusedPersonId(null);
    setFocusedSourceId(null);
    setActiveView("map");
    setIsInspectorOpen(true);
  }

  function handleFocusPerson(personId: string): void {
    setFocusedPersonId(personId);
    setFocusedPlaceId(null);
    setFocusedSourceId(null);
    setActiveView("people");
    setIsInspectorOpen(true);
  }

  function handleFocusSource(sourceId: string): void {
    setFocusedSourceId(sourceId);
    setFocusedPersonId(null);
    setFocusedPlaceId(null);
    setActiveView("sources");
    setIsInspectorOpen(true);
  }

  if (selectedEvent === null) {
    return (
      <main className="app-shell">
        <section className="error-panel">
          <p className="section-eyebrow">Dataset Unavailable</p>
          <h1>No events were found in the validated Acts dataset.</h1>
          <p>
            The explorer shell expects at least one canonical event record before it can
            render shared navigation.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero-banner">
        <div>
          <p className="eyebrow">Bible Time &amp; Place Explorer</p>
          <h1>Acts explorer with shared navigation, filtering, and a real chronology view.</h1>
          <p className="lede">
            The app now boots directly from the canonical Acts dataset and keeps a shared
            event selection across working timeline, map, and people explorers, with
            selectable missionary journey routes now layered into the map while the
            sources surface remains queued for deeper expansion.
          </p>
        </div>
        <div className="status-cluster" aria-label="Dataset status">
          <span className="status-pill">Validated static dataset</span>
          <span className="status-pill">Version {dataset.metadata.version}</span>
          <span className="status-pill">{dataset.metadata.updated ?? "Updated date pending"}</span>
        </div>
      </header>

      <section className="control-bar">
        <ViewNavigation activeView={activeView} onViewChange={setActiveView} />
        <div className="mobile-toggle-group" aria-label="Explorer drawers">
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={isRailOpen}
            onClick={() => setIsRailOpen((currentValue) => !currentValue)}
          >
            {isRailOpen ? "Hide event rail" : "Show event rail"}
          </button>
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={isInspectorOpen}
            onClick={() => setIsInspectorOpen((currentValue) => !currentValue)}
          >
            {isInspectorOpen ? "Hide details" : "Show details"}
          </button>
        </div>
      </section>

      <div className="explorer-layout">
        <aside className={`surface rail-surface ${isRailOpen ? "is-open" : ""}`}>
          <EventRail
            events={filteredEvents}
            query={searchQuery}
            selectedEventId={selectedEvent.id}
            selectedEventHidden={selectedEventHidden}
            index={datasetIndex}
            onQueryChange={setSearchQuery}
            onSelectEvent={handleSelectEvent}
          />
        </aside>

        <section className="surface stage-surface">
          <ExplorerStage
            activeView={activeView}
            dataset={dataset}
            event={selectedEvent}
            events={sortedEvents}
            index={datasetIndex}
            focusedPersonId={focusedPersonId}
            focusedPlaceId={focusedPlaceId}
            focusedSourceId={focusedSourceId}
            timelineFilters={timelineFilters}
            onFocusPerson={handleFocusPerson}
            onFocusPlace={handleFocusPlace}
            onSelectEvent={handleSelectEvent}
            onTimelineFiltersChange={setTimelineFilters}
          />
        </section>

        <aside className={`surface inspector-surface ${isInspectorOpen ? "is-open" : ""}`}>
          <EventInspector
            event={selectedEvent}
            events={sortedEvents}
            index={datasetIndex}
            onSelectEvent={handleSelectEvent}
            onFocusPerson={handleFocusPerson}
            onFocusPlace={handleFocusPlace}
            onFocusSource={handleFocusSource}
          />
        </aside>
      </div>
    </main>
  );
}
