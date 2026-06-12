import type { JSX } from "react";

import { MapView } from "../components/MapView";
import { PeopleView } from "../components/PeopleView";
import { SourcesView } from "../components/SourcesView";
import { TimelineView } from "../components/TimelineView";
import type { Event } from "../domain/dataset";
import { explorerViews, type DatasetIndex, type ExplorerView } from "../domain/events";
import type { BookFilterId, ExplorerDataset } from "../domain/library";
import { type ClaimConfidenceFilter, formatClaimConfidence } from "../domain/sources";
import type { TimelineFilters } from "../domain/timeline";

interface ExplorerStageProps {
  activeView: ExplorerView;
  activeBookId: BookFilterId;
  activeBookLabel: string;
  claimConfidenceFilter: ClaimConfidenceFilter;
  dataset: ExplorerDataset;
  library: ExplorerDataset;
  event: Event;
  eventBookLabels: Map<string, string>;
  events: Event[];
  index: DatasetIndex;
  focusedPersonId: string | null;
  focusedPlaceId: string | null;
  focusedSourceId: string | null;
  timelineFilters: TimelineFilters;
  onBookFilterChange: (bookId: BookFilterId) => void;
  onClaimConfidenceFilterChange: (confidence: ClaimConfidenceFilter) => void;
  onFocusPerson: (personId: string) => void;
  onFocusPlace: (placeId: string) => void;
  onFocusSource: (sourceId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onTimelineFiltersChange: (filters: TimelineFilters) => void;
  onViewChange: (view: ExplorerView) => void;
}

export function ExplorerStage({
  activeView,
  activeBookId,
  activeBookLabel,
  claimConfidenceFilter,
  dataset,
  library,
  event,
  eventBookLabels,
  events,
  index,
  focusedPersonId,
  focusedPlaceId,
  focusedSourceId,
  timelineFilters,
  onBookFilterChange,
  onClaimConfidenceFilterChange,
  onFocusPerson,
  onFocusPlace,
  onFocusSource,
  onSelectEvent,
  onTimelineFiltersChange,
  onViewChange
}: ExplorerStageProps) {
  let content: JSX.Element;

  switch (activeView) {
    case "timeline":
      content = (
        <TimelineView
          activeBookLabel={activeBookLabel}
          dataset={dataset}
          eventBookLabels={eventBookLabels}
          events={events}
          filters={timelineFilters}
          index={index}
          selectedEventId={event.id}
          onFiltersChange={onTimelineFiltersChange}
          onSelectEvent={onSelectEvent}
        />
      );
      break;
    case "map":
      content = (
        <MapView
          activeBookLabel={activeBookLabel}
          dataset={dataset}
          eventBookLabels={eventBookLabels}
          events={events}
          focusedPlaceId={focusedPlaceId}
          index={index}
          onFocusPlace={onFocusPlace}
          onSelectEvent={onSelectEvent}
          selectedEventId={event.id}
        />
      );
      break;
    case "people":
      content = (
        <PeopleView
          activeBookLabel={activeBookLabel}
          dataset={dataset}
          event={event}
          focusedPersonId={focusedPersonId}
          index={index}
          onFocusPerson={onFocusPerson}
          onFocusPlace={onFocusPlace}
          onSelectEvent={onSelectEvent}
          selectedEventId={event.id}
        />
      );
      break;
    case "sources":
      content = (
        <SourcesView
          activeBookLabel={activeBookLabel}
          claimConfidenceFilter={claimConfidenceFilter}
          dataset={dataset}
          eventBookLabels={eventBookLabels}
          events={events}
          focusedSourceId={focusedSourceId}
          index={index}
          onFocusSource={onFocusSource}
          onSelectEvent={onSelectEvent}
          selectedEvent={event}
        />
      );
      break;
    case "overview":
    default:
      const visibleClaimCounts = dataset.claims.reduce<Record<string, number>>((counts, claim) => {
        return {
          ...counts,
          [claim.confidence]: (counts[claim.confidence] ?? 0) + 1
        };
      }, {});
      const scopeOptions = [
        {
          id: "all" as const,
          label: "All Books",
          title: "Luke-Acts Library",
          eventCount: library.events.length,
          journeyCount: library.journeys.length,
          description:
            "Merged library view across normalized people, places, sources, and claims."
        },
        ...library.books
      ];

      content = (
        <div className="stage-stack overview-stack">
          <div className="overview-nav-grid" aria-label="Explorer destinations">
            {explorerViews
              .filter((view) => view.id !== "overview")
              .map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className="overview-nav-card"
                  onClick={() => onViewChange(view.id)}
                >
                  <span className="stage-card-eyebrow">{view.label}</span>
                  <strong>{view.label}</strong>
                  <span>{view.description}</span>
                </button>
              ))}
          </div>

          <div className="overview-control-grid">
            <section className="stage-card overview-section-card">
              <div className="section-header-row">
                <div>
                  <p className="stage-card-eyebrow">Scope Hub</p>
                  <h3>Book Focus</h3>
                </div>
                <span className="entity-type-badge">{activeBookLabel} active</span>
              </div>
              <p>
                Acts remains the default explorer scope, but Luke is available as a parallel
                canonical dataset and can be surfaced from here without changing the rest of the
                shell layout.
              </p>
              <div className="overview-book-grid">
                {scopeOptions.map((scopeOption) => {
                  const isActive = activeBookId === scopeOption.id;

                  return (
                    <button
                      key={scopeOption.id}
                      type="button"
                      className={`overview-book-card ${isActive ? "is-active" : ""}`}
                      aria-pressed={isActive}
                      aria-label={`Focus ${scopeOption.label}`}
                      onClick={() => onBookFilterChange(scopeOption.id)}
                    >
                      <span className="stage-card-eyebrow">{scopeOption.label}</span>
                      <strong>{scopeOption.eventCount} events</strong>
                      <span>
                        {scopeOption.journeyCount} journey
                        {scopeOption.journeyCount === 1 ? "" : "s"}
                      </span>
                      <p>
                        {scopeOption.title}
                        {scopeOption.description ? ` · ${scopeOption.description}` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="stage-card overview-section-card">
              <div className="section-header-row">
                <div>
                  <p className="stage-card-eyebrow">Shared Lens</p>
                  <h3>Claim Confidence</h3>
                </div>
                <span className="entity-type-badge">
                  {claimConfidenceFilter === "all"
                    ? "All confidences"
                    : `${formatClaimConfidence(claimConfidenceFilter)} only`}
                </span>
              </div>
              <p>
                This lens carries into the sources explorer and event inspector so interpretive
                layers can be narrowed without changing the canonical event rail itself.
              </p>
              <div className="book-filter-bar overview-chip-row">
                {(["all", "high", "medium", "low"] as const).map((confidence) => {
                  const isActive = claimConfidenceFilter === confidence;
                  const visibleClaimCount =
                    confidence === "all"
                      ? dataset.claims.length
                      : (visibleClaimCounts[confidence] ?? 0);

                  return (
                    <button
                      key={confidence}
                      type="button"
                      className={`book-filter-chip ${isActive ? "is-active" : ""}`}
                      aria-pressed={isActive}
                      onClick={() => onClaimConfidenceFilterChange(confidence)}
                    >
                      {confidence === "all"
                        ? `All (${visibleClaimCount})`
                        : `${formatClaimConfidence(confidence)} (${visibleClaimCount})`}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="metric-grid" aria-label="Dataset counts">
            <article className="metric-card">
              <span>Books</span>
              <strong>{library.books.length}</strong>
            </article>
            <article className="metric-card">
              <span>Scope Events</span>
              <strong>{dataset.events.length}</strong>
            </article>
            <article className="metric-card">
              <span>Places</span>
              <strong>{library.places.length}</strong>
            </article>
            <article className="metric-card">
              <span>People</span>
              <strong>{library.people.length}</strong>
            </article>
            <article className="metric-card">
              <span>Scope Claims</span>
              <strong>{dataset.claims.length}</strong>
            </article>
          </div>

          <div className="overview-coverage-grid">
            {library.books.map((book) => (
              <article key={book.id} className="stage-card overview-coverage-card">
                <p className="stage-card-eyebrow">{book.label} Coverage</p>
                <h3>{book.title}</h3>
                <p>
                  {book.eventCount} canonical event
                  {book.eventCount === 1 ? "" : "s"} and {book.journeyCount} journey
                  {book.journeyCount === 1 ? "" : "s"} are currently modeled for this book.
                </p>
                {book.id === "luke" ? (
                  <p className="muted-copy">
                    Luke currently ships as a curated first-pass preview from infancy through the
                    ascension. The overview keeps that partial coverage explicit so the dataset
                    does not appear missing or broken.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      );
      break;
  }

  return <section className="stage-panel">{content}</section>;
}
