import type { CanonicalDataset, Event } from "../domain/dataset";
import {
  formatBookCorpus,
  getBookNarrativeSemantics,
  formatPassageRange,
  getLiteraryUnitsForBook,
  getPrimaryScopeBook
} from "../domain/books";
import {
  formatDateCertainty,
  formatDateRange,
  getEventTags,
  type DatasetIndex
} from "../domain/events";
import {
  buildTimelineGridLayout,
  defaultTimelineFilters,
  filterTimelineEvents,
  formatTimelineYearLabel,
  getPrimaryTimelineTag,
  getTimelineCategoryTone,
  getTimelineFilterOptions,
  timelineCertaintyLegend,
  type TimelineFilters
} from "../domain/timeline";

interface TimelineViewProps {
  activeBookLabel: string;
  dataset: CanonicalDataset;
  eventBookLabels: Map<string, string>;
  events: Event[];
  filters: TimelineFilters;
  index: DatasetIndex;
  selectedEventId: string;
  onFiltersChange: (filters: TimelineFilters) => void;
  onSelectEvent: (eventId: string) => void;
}

function parseYearInput(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

export function TimelineView({
  activeBookLabel,
  dataset,
  eventBookLabels,
  events,
  filters,
  index,
  selectedEventId,
  onFiltersChange,
  onSelectEvent
}: TimelineViewProps) {
  const filterOptions = getTimelineFilterOptions(dataset);
  const filteredEvents = filterTimelineEvents(events, filters);
  const activeScopeBook = getPrimaryScopeBook(dataset);
  const activeScopeLiteraryUnits = activeScopeBook
    ? getLiteraryUnitsForBook(dataset, activeScopeBook.id)
    : [];
  const activeScopeNarrativeSemantics = activeScopeBook
    ? getBookNarrativeSemantics(dataset.events, index)
    : [];
  const timelineLayout = buildTimelineGridLayout(filteredEvents);
  const selectedEventHidden = !filteredEvents.some((event) => event.id === selectedEventId);
  const timelineGridTemplateColumns = timelineLayout
    ? timelineLayout.columns
        .map((column) =>
          column.kind === "gap" ? "minmax(7.25rem, 0.82fr)" : "minmax(5.25rem, 1fr)"
        )
        .join(" ")
    : "";

  return (
    <section className="timeline-view" aria-label="Scripture timeline">
      <div className="timeline-toolbar">
        <div className="timeline-counts">
          <span className="timeline-count-pill">
            {filteredEvents.length} of {events.length} events visible
          </span>
          <span className="timeline-count-pill">{activeBookLabel} chronology</span>
        </div>
        <button
          type="button"
          className="timeline-reset-button"
          onClick={() => onFiltersChange({ ...defaultTimelineFilters })}
        >
          Clear filters
        </button>
      </div>

      <div className="timeline-filter-grid" aria-label="Timeline filters">
        <label className="timeline-filter-field">
          <span>Category</span>
          <select
            value={filters.tagId}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                tagId: event.currentTarget.value
              })
            }
          >
            <option value="all">All categories</option>
            {filterOptions.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label}
              </option>
            ))}
          </select>
        </label>

        <label className="timeline-filter-field">
          <span>Person</span>
          <select
            value={filters.participantId}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                participantId: event.currentTarget.value
              })
            }
          >
            <option value="all">All people</option>
            {filterOptions.participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.label}
              </option>
            ))}
          </select>
        </label>

        <label className="timeline-filter-field">
          <span>Place</span>
          <select
            value={filters.locationId}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                locationId: event.currentTarget.value
              })
            }
          >
            <option value="all">All places</option>
            {filterOptions.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label}
              </option>
            ))}
          </select>
        </label>

        <label className="timeline-filter-field">
          <span>Certainty</span>
          <select
            value={filters.certainty}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                certainty: event.currentTarget.value as TimelineFilters["certainty"]
              })
            }
          >
            <option value="all">All certainty levels</option>
            {filterOptions.certainties.map((certainty) => (
              <option key={certainty.id} value={certainty.id}>
                {certainty.label}
              </option>
            ))}
          </select>
        </label>

        <label className="timeline-filter-field">
          <span>Start year</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={filters.startYear ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                startYear: parseYearInput(event.currentTarget.value)
              })
            }
          />
        </label>

        <label className="timeline-filter-field">
          <span>End year</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="62"
            value={filters.endYear ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                endYear: parseYearInput(event.currentTarget.value)
              })
            }
          />
        </label>
      </div>

      <section className="timeline-inline-legend" aria-label="Timeline legend">
        <div className="timeline-inline-copy">
          <h3>Chronology Surface</h3>
          <p>
            Scroll horizontally through the dated record bands. Long empty periods
            collapse automatically so sparse books stay readable.
          </p>
        </div>
        <div className="timeline-inline-badges">
          {timelineCertaintyLegend.map((entry) => (
            <div
              key={entry.certainty}
              className={`timeline-certainty-inline certainty-${entry.certainty}`}
            >
              <strong>{entry.label}</strong>
            </div>
          ))}
        </div>
      </section>

      {selectedEventHidden ? (
        <p className="helper-note timeline-hidden-note" role="status">
          The currently selected event is outside the active timeline filters.
        </p>
      ) : null}

      {filteredEvents.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No events match these timeline filters</h3>
          <p>Clear or widen the filters to restore the full chronology.</p>
        </div>
      ) : (
        <div className="timeline-surface-stack">
          {activeScopeBook ? (
            <section className="timeline-context-grid">
              <article className="timeline-context-card">
                <p className="stage-card-eyebrow">Book Context</p>
                <div className="section-header-row">
                  <h3>{activeScopeBook.title}</h3>
                  <span className="entity-type-badge">
                    {formatBookCorpus(activeScopeBook.corpus)}
                  </span>
                </div>
                <p className="muted-copy">
                  {activeScopeBook.summary ??
                    "No book summary is currently modeled for the active scope."}
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
                    <dt>Modeled Units</dt>
                    <dd>{activeScopeLiteraryUnits.length}</dd>
                  </div>
                  <div>
                    <dt>Visible Events</dt>
                    <dd>{filteredEvents.length}</dd>
                  </div>
                </dl>
              </article>

              <article className="timeline-context-card">
                <p className="stage-card-eyebrow">Literary Units</p>
                <div className="section-header-row">
                  <h3>{activeBookLabel} anchors</h3>
                </div>
                {activeScopeLiteraryUnits.length === 0 ? (
                  <p className="muted-copy">
                    No literary-unit anchors are available for this scope yet.
                  </p>
                ) : (
                  <ul className="linked-record-list compact-linked-list">
                    {activeScopeLiteraryUnits.map((literaryUnit) => (
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
              </article>

              {activeScopeNarrativeSemantics.length > 0 ? (
                <article className="timeline-context-card">
                  <p className="stage-card-eyebrow">Narrative Semantics</p>
                  <div className="section-header-row">
                    <h3>{activeBookLabel} signals</h3>
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
                </article>
              ) : null}
            </section>
          ) : null}

          {timelineLayout && timelineLayout.records.length > 0 ? (
            <section className="timeline-board" aria-label="Chronology board">
              <div className="timeline-scroll-shell">
                <div
                  className="timeline-axis-row"
                  style={{
                    gridTemplateColumns: timelineGridTemplateColumns
                  }}
                >
                  {timelineLayout.columns.map((column, columnIndex) => {
                    const year = column.startYear;
                    const isGap = column.kind === "gap";
                    const isMajorTick =
                      isGap ||
                      columnIndex === 0 ||
                      column.endYear === timelineLayout.maxYear ||
                      year % 5 === 0;

                    return (
                      <div
                        key={column.id}
                        className={`timeline-axis-tick ${isMajorTick ? "is-major" : ""} ${
                          isGap ? "is-gap" : ""
                        }`}
                      >
                        {isGap ? column.label : isMajorTick ? formatTimelineYearLabel(year) : ""}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="timeline-band-row"
                  aria-hidden="true"
                  style={{
                    gridTemplateColumns: timelineGridTemplateColumns
                  }}
                >
                  {timelineLayout.bands.map((band) => (
                    <div
                      key={band.id}
                      className="timeline-band-chip"
                      style={{
                        gridColumn: `${band.columnStart} / span ${band.columnSpan}`
                      }}
                    >
                      {band.label}
                    </div>
                  ))}
                </div>

                <ol
                  className="timeline-grid"
                  style={{
                    gridTemplateColumns: timelineGridTemplateColumns,
                    gridTemplateRows: `repeat(${timelineLayout.totalTracks}, minmax(9rem, auto))`
                  }}
                >
                  {timelineLayout.records.map((record) => {
                    const event = record.event;
                    const place = index.placesById.get(event.location_id);
                    const tags = getEventTags(event, index);
                    const primaryTag = getPrimaryTimelineTag(event, index);
                    const categoryTone = getTimelineCategoryTone(event, index);
                    const bookLabel = eventBookLabels.get(event.id) ?? activeBookLabel;
                    const isSelected = event.id === selectedEventId;

                    return (
                      <li
                        key={event.id}
                        className="timeline-grid-item"
                        style={{
                          gridColumn: `${record.columnStart} / span ${record.columnSpan}`,
                          gridRow: `${record.track + 1}`
                        }}
                      >
                        <span
                          className={`timeline-grid-anchor category-${categoryTone} ${
                            isSelected ? "is-selected" : ""
                          }`}
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          className={`timeline-event-card timeline-grid-card category-${categoryTone} ${
                            isSelected ? "is-selected" : ""
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => onSelectEvent(event.id)}
                        >
                          <div className="timeline-event-topline">
                            <span className="timeline-event-date">{formatDateRange(event)}</span>
                            <span
                              className={`timeline-certainty-badge certainty-${event.date.certainty}`}
                            >
                              {formatDateCertainty(event.date.certainty)}
                            </span>
                          </div>

                          <h4>{event.title}</h4>
                          <p className="timeline-event-meta">
                            {bookLabel} • {place?.name ?? "Unknown place"} •{" "}
                            {primaryTag?.label ?? "Uncategorized event"}
                          </p>

                          <div className="timeline-event-footer">
                            <div className="timeline-tag-row">
                              {tags.slice(0, 2).map((tag) => (
                                <span key={tag.id} className="timeline-tag-pill">
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                            <span className="timeline-citation">
                              {event.source_refs[0]?.citation ?? "Citation pending"}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          ) : null}

          {timelineLayout?.undatedEvents.length ? (
            <section className="timeline-undated-panel">
              <div className="section-header-row">
                <h3>Undated Records</h3>
              </div>
              <ol className="timeline-undated-list">
                {timelineLayout.undatedEvents.map((event) => {
                  const place = index.placesById.get(event.location_id);
                  const bookLabel = eventBookLabels.get(event.id) ?? activeBookLabel;
                  const isSelected = event.id === selectedEventId;

                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        className={`linked-record-button ${isSelected ? "is-selected" : ""}`}
                        onClick={() => onSelectEvent(event.id)}
                      >
                        <strong>{event.title}</strong>
                        <span>
                          {bookLabel} • {place?.name ?? "Unknown place"} •{" "}
                          {event.source_refs[0]?.citation ?? "Citation pending"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
