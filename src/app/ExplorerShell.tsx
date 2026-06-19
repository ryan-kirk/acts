import { useDeferredValue, useEffect, useState } from "react";

import { EventInspector } from "../components/EventInspector";
import { EventRail } from "../components/EventRail";
import { ExplorerStage } from "../components/ExplorerStage";
import { ViewNavigation } from "../components/ViewNavigation";
import type { ExplorerDataset, ExplorerDatasetProvenance } from "../domain/library";
import {
  buildDatasetIndex,
  filterEventsByQuery,
  sortEventsChronologically,
  type ExplorerView
} from "../domain/events";
import {
  filterExplorerDatasetByBook,
  getBookLabelForFilter,
  getEventBookLabel,
  getEventBookLabelMap,
  type BookFilterId
} from "../domain/library";
import { type ClaimConfidenceFilter, formatClaimConfidence } from "../domain/sources";
import { defaultTimelineFilters } from "../domain/timeline";

interface ExplorerShellProps {
  dataset: ExplorerDataset;
  provenance: ExplorerDatasetProvenance;
}

export function ExplorerShell({ dataset, provenance }: ExplorerShellProps) {
  const [activeView, setActiveView] = useState<ExplorerView>("overview");
  const [activeBookId, setActiveBookId] = useState<BookFilterId>(
    () => dataset.books.find((book) => book.id === "acts")?.id ?? dataset.books[0]?.id ?? "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const filteredDataset = filterExplorerDatasetByBook(dataset, provenance, activeBookId);
  const datasetIndex = buildDatasetIndex(filteredDataset);
  const libraryIndex = buildDatasetIndex(dataset);
  const sortedEvents = sortEventsChronologically(filteredDataset.events);
  const eventBookLabels = getEventBookLabelMap(dataset, provenance);
  const activeBookLabel = getBookLabelForFilter(dataset, activeBookId);
  const [selectedEventId, setSelectedEventId] = useState(sortedEvents[0]?.id ?? "");
  const [focusedPersonId, setFocusedPersonId] = useState<string | null>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [focusedSourceId, setFocusedSourceId] = useState<string | null>(null);
  const [claimConfidenceFilter, setClaimConfidenceFilter] =
    useState<ClaimConfidenceFilter>("all");
  const [timelineFilters, setTimelineFilters] = useState({
    ...defaultTimelineFilters
  });
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const libraryLabel =
    dataset.books.length <= 3
      ? dataset.books.map((book) => book.label).join(", ")
      : `${dataset.books.length} books`;
  const gospelCount = dataset.books.filter((book) => book.corpus === "gospel").length;

  const selectedEvent = datasetIndex.eventsById.get(selectedEventId) ?? sortedEvents[0] ?? null;
  const filteredEvents = filterEventsByQuery(sortedEvents, deferredSearchQuery, datasetIndex);
  const selectedEventHidden =
    selectedEvent !== null && !filteredEvents.some((event) => event.id === selectedEvent.id);

  useEffect(() => {
    const activeBookStillExists =
      activeBookId === "all" || dataset.books.some((book) => book.id === activeBookId);

    if (activeBookStillExists) {
      return;
    }

    setActiveBookId(dataset.books.find((book) => book.id === "acts")?.id ?? dataset.books[0]?.id ?? "all");
  }, [activeBookId, dataset.books]);

  useEffect(() => {
    if (sortedEvents.length === 0) {
      return;
    }

    const selectedEventIsVisible = sortedEvents.some((event) => event.id === selectedEventId);

    if (selectedEventIsVisible) {
      return;
    }

    setSelectedEventId(sortedEvents[0]!.id);
    setFocusedPersonId(null);
    setFocusedPlaceId(null);
    setFocusedSourceId(null);
  }, [selectedEventId, sortedEvents]);

  function clearEntityFocus(): void {
    setFocusedPersonId(null);
    setFocusedPlaceId(null);
    setFocusedSourceId(null);
  }

  function handleSelectEvent(eventId: string): void {
    const selectedEventBookId = provenance.eventBookIds.get(eventId);

    if (
      activeBookId !== "all" &&
      selectedEventBookId &&
      selectedEventBookId !== activeBookId
    ) {
      setActiveBookId(selectedEventBookId);
      setSearchQuery("");
      setTimelineFilters({
        ...defaultTimelineFilters
      });
    }

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

  function handleBookFilterChange(bookId: BookFilterId): void {
    setActiveBookId(bookId);
    setSearchQuery("");
    setTimelineFilters({
      ...defaultTimelineFilters
    });
    clearEntityFocus();
    setIsRailOpen(false);
  }

  if (selectedEvent === null) {
    return (
      <main className="app-shell">
        <section className="error-panel">
          <p className="section-eyebrow">Dataset Unavailable</p>
          <h1>No events were found in the filtered canonical library.</h1>
          <p>
            The explorer shell expects at least one canonical event record before it can render
            shared navigation.
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
          <h1>Scripture explorer with shared navigation, filtering, and synchronized context.</h1>
          <p className="lede">
            Interactive scripture explorer · {libraryLabel} · shared timeline, map, people, and
            source-grounded event context.
          </p>
        </div>
        <div className="status-cluster" aria-label="Dataset status">
          <span className="status-pill">Scope: {activeBookLabel}</span>
          <span className="status-pill">{dataset.events.length} events</span>
          <span className="status-pill">{dataset.journeys.length} journeys</span>
          <span className="status-pill">{dataset.literary_units.length} literary units</span>
          <span className="status-pill">{gospelCount} gospels loaded</span>
          <span className="status-pill">
            Claim lens:{" "}
            {claimConfidenceFilter === "all"
              ? "All confidences"
              : formatClaimConfidence(claimConfidenceFilter)}
          </span>
          <span className="status-pill">Version {dataset.metadata.version}</span>
        </div>
      </header>

      <section className="control-bar">
        <ViewNavigation activeView={activeView} onViewChange={setActiveView} />
        <div className="book-filter-bar" aria-label="Book filters">
          <button
            type="button"
            className={`book-filter-chip ${activeBookId === "all" ? "is-active" : ""}`}
            onClick={() => handleBookFilterChange("all")}
          >
            All Books
          </button>
          {dataset.books.map((book) => (
            <button
              key={book.id}
              type="button"
              className={`book-filter-chip ${activeBookId === book.id ? "is-active" : ""}`}
              onClick={() => handleBookFilterChange(book.id)}
            >
              {book.label}
            </button>
          ))}
        </div>
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
            activeBookLabel={activeBookLabel}
            eventBookLabels={eventBookLabels}
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
            activeBookId={activeBookId}
            activeBookLabel={activeBookLabel}
            claimConfidenceFilter={claimConfidenceFilter}
            dataset={filteredDataset}
            library={dataset}
            libraryIndex={libraryIndex}
            event={selectedEvent}
            eventBookLabels={eventBookLabels}
            events={sortedEvents}
            index={datasetIndex}
            focusedPersonId={focusedPersonId}
            focusedPlaceId={focusedPlaceId}
            focusedSourceId={focusedSourceId}
            timelineFilters={timelineFilters}
            onBookFilterChange={handleBookFilterChange}
            onClaimConfidenceFilterChange={setClaimConfidenceFilter}
            onFocusPerson={handleFocusPerson}
            onFocusPlace={handleFocusPlace}
            onFocusSource={handleFocusSource}
            onSelectEvent={handleSelectEvent}
            onTimelineFiltersChange={setTimelineFilters}
            onViewChange={setActiveView}
          />
        </section>

        <aside className={`surface inspector-surface ${isInspectorOpen ? "is-open" : ""}`}>
          <EventInspector
            activeBookLabel={activeBookLabel}
            claimConfidenceFilter={claimConfidenceFilter}
            dataset={filteredDataset}
            event={selectedEvent}
            eventBookLabel={
              getEventBookLabel(dataset, provenance, selectedEvent.id) ?? activeBookLabel
            }
            events={sortedEvents}
            index={libraryIndex}
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
