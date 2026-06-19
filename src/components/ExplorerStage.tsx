import type { JSX } from "react";

import { MapView } from "../components/MapView";
import { PeopleView } from "../components/PeopleView";
import { SourcesView } from "../components/SourcesView";
import { TimelineView } from "../components/TimelineView";
import {
  formatBookCorpus,
  getBookNarrativeSemantics,
  formatPassageRange,
  getLiteraryUnitsForBook,
  getPrimaryScopeBook,
  isLetterLikeBook
} from "../domain/books";
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
  libraryIndex: DatasetIndex;
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
  libraryIndex,
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
  const activeScopeBook = getPrimaryScopeBook(dataset);
  const activeScopeLiteraryUnits = activeScopeBook
    ? getLiteraryUnitsForBook(dataset, activeScopeBook.id)
    : [];
  const activeScopeNarrativeSemantics = activeScopeBook
    ? getBookNarrativeSemantics(dataset.events, index)
    : [];

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
          index={libraryIndex}
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
          title: "Canonical Scripture Library",
          eventCount: library.events.length,
          journeyCount: library.journeys.length,
          description:
            "Merged library view across normalized people, places, sources, and claims."
        },
        ...library.books.map((book) => ({
          ...book,
          description: book.summary
        }))
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
                Acts remains the default explorer scope, while Matthew, Mark, Luke, and John now
                ship alongside it as canonical Gospel datasets that can be surfaced from here
                without changing the rest of the shell layout.
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

          {activeScopeBook ? (
            <div className="overview-control-grid">
              <section className="stage-card overview-section-card">
                <div className="section-header-row">
                  <div>
                    <p className="stage-card-eyebrow">Active Book Record</p>
                    <h3>{activeScopeBook.title}</h3>
                  </div>
                  <span className="entity-type-badge">
                    {formatBookCorpus(activeScopeBook.corpus)}
                  </span>
                </div>
                <p>
                  {activeScopeBook.summary ??
                    "No active book summary has been modeled for this scope yet."}
                </p>
                <dl className="preview-meta-grid">
                  <div>
                    <dt>Canonical Order</dt>
                    <dd>{activeScopeBook.canonical_order}</dd>
                  </div>
                  <div>
                    <dt>Genres</dt>
                    <dd>{activeScopeBook.genre.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Literary Units</dt>
                    <dd>{activeScopeLiteraryUnits.length}</dd>
                  </div>
                  <div>
                    <dt>Letter Context</dt>
                    <dd>{isLetterLikeBook(activeScopeBook) ? "Modeled" : "Not primary"}</dd>
                  </div>
                </dl>
                {activeScopeBook.recipient_group ? (
                  <p className="muted-copy">Recipient group: {activeScopeBook.recipient_group}</p>
                ) : null}
                {activeScopeBook.authorship_note ? (
                  <p className="muted-copy">{activeScopeBook.authorship_note}</p>
                ) : null}
              </section>

              <section className="stage-card overview-section-card">
                <div className="section-header-row">
                  <div>
                    <p className="stage-card-eyebrow">Literary Anchors</p>
                    <h3>{activeBookLabel} units</h3>
                  </div>
                  <span className="entity-type-badge">
                    {activeScopeLiteraryUnits.length} modeled
                  </span>
                </div>
                {activeScopeLiteraryUnits.length === 0 ? (
                  <p className="muted-copy">
                    No literary-unit anchors are modeled for the current scope yet.
                  </p>
                ) : (
                  <ul className="linked-record-list compact-linked-list">
                    {activeScopeLiteraryUnits.slice(0, 4).map((literaryUnit) => (
                      <li key={literaryUnit.id}>
                        <div className="linked-record-button static-linked-card">
                          <strong>{literaryUnit.title}</strong>
                          <span>
                            {formatPassageRange(literaryUnit)} • {literaryUnit.unit_type}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {activeScopeNarrativeSemantics.length > 0 ? (
                <section className="stage-card overview-section-card">
                  <div className="section-header-row">
                    <div>
                      <p className="stage-card-eyebrow">Narrative Semantics</p>
                      <h3>{activeBookLabel} signals</h3>
                    </div>
                    <span className="entity-type-badge">
                      {activeScopeNarrativeSemantics.length} active
                    </span>
                  </div>
                  <ul className="entity-card-list">
                    {activeScopeNarrativeSemantics.map((semantic) => (
                      <li key={semantic.id} className="entity-card">
                        <div className="entity-card-header">
                          <div>
                            <strong>{semantic.label}</strong>
                            <span className="entity-subtitle">
                              {semantic.eventCount} event
                              {semantic.eventCount === 1 ? "" : "s"}
                            </span>
                          </div>
                          <span className="entity-type-badge">
                            {semantic.tagLabels.join(", ")}
                          </span>
                        </div>
                        <p className="entity-summary">{semantic.description}</p>
                        <p className="entity-meta">
                          Examples: {semantic.sampleEventTitles.join(" • ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

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
            <article className="metric-card">
              <span>Literary Units</span>
              <strong>{dataset.literary_units.length}</strong>
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
                  {book.journeyCount === 1 ? "" : "s"} plus {book.literaryUnitCount} literary
                  unit{book.literaryUnitCount === 1 ? "" : "s"} are currently modeled for this
                  book.
                </p>
                <p className="muted-copy">
                  {formatBookCorpus(book.corpus)} • {book.genre.join(", ")}
                </p>
                {book.corpus === "gospel" ? (
                  <p className="muted-copy">
                    Gospel coverage currently ships as a curated first-pass set of events and
                    literary anchors rather than a full chapter-by-chapter extraction. The
                    overview keeps that partial coverage explicit so the dataset does not appear
                    missing or broken.
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
