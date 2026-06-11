import type { CanonicalDataset, Event } from "../domain/dataset";
import {
  formatDateCertainty,
  formatDateRange,
  getEventTags,
  type DatasetIndex
} from "../domain/events";
import {
  defaultTimelineFilters,
  filterTimelineEvents,
  getPrimaryTimelineTag,
  getTimelineCategoryTone,
  getTimelineFilterOptions,
  groupEventsByTimelineEra,
  timelineCertaintyLegend,
  type TimelineFilters
} from "../domain/timeline";

interface TimelineViewProps {
  dataset: CanonicalDataset;
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
  dataset,
  events,
  filters,
  index,
  selectedEventId,
  onFiltersChange,
  onSelectEvent
}: TimelineViewProps) {
  const filterOptions = getTimelineFilterOptions(dataset);
  const filteredEvents = filterTimelineEvents(events, filters);
  const groupedEvents = groupEventsByTimelineEra(filteredEvents);
  const selectedEventHidden = !filteredEvents.some((event) => event.id === selectedEventId);

  return (
    <section className="timeline-view" aria-label="Acts timeline">
      <div className="timeline-toolbar">
        <div className="timeline-counts">
          <span className="timeline-count-pill">
            {filteredEvents.length} of {events.length} events visible
          </span>
          <span className="timeline-count-pill">Acts-first chronology</span>
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

      <section className="timeline-legend" aria-label="Timeline legend">
        <div className="timeline-legend-copy">
          <h3>Certainty legend</h3>
          <p>
            Date certainty stays explicit in the timeline so chronology communicates humility
            as well as order.
          </p>
        </div>
        <div className="timeline-legend-items">
          {timelineCertaintyLegend.map((entry) => (
            <article
              key={entry.certainty}
              className={`timeline-legend-card certainty-${entry.certainty}`}
            >
              <strong>{entry.label}</strong>
              <span>{entry.description}</span>
            </article>
          ))}
        </div>
      </section>

      {selectedEventHidden ? (
        <p className="helper-note timeline-hidden-note" role="status">
          The currently selected event is outside the active timeline filters.
        </p>
      ) : null}

      {groupedEvents.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No Acts events match these timeline filters</h3>
          <p>Clear or widen the filters to restore the full chronology.</p>
        </div>
      ) : (
        <div className="timeline-era-stack">
          {groupedEvents.map((group) => (
            <section key={group.era.id} className="timeline-era-band">
              <header className="timeline-era-header">
                <div>
                  <p className="section-eyebrow">Era Band</p>
                  <h3>{group.era.title}</h3>
                </div>
                <div className="timeline-era-summary">
                  <strong>
                    {group.era.startYear !== null && group.era.endYear !== null
                      ? `AD ${group.era.startYear}-${group.era.endYear}`
                      : "Undated"}
                  </strong>
                  <span>{group.era.description}</span>
                </div>
              </header>

              <ol className="timeline-event-list">
                {group.events.map((event) => {
                  const place = index.placesById.get(event.location_id);
                  const tags = getEventTags(event, index);
                  const primaryTag = getPrimaryTimelineTag(event, index);
                  const categoryTone = getTimelineCategoryTone(event, index);
                  const isSelected = event.id === selectedEventId;

                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        className={`timeline-event-card category-${categoryTone} ${
                          isSelected ? "is-selected" : ""
                        }`}
                        aria-pressed={isSelected}
                        onClick={() => onSelectEvent(event.id)}
                      >
                        <div className="timeline-event-marker" aria-hidden="true" />
                        <div className="timeline-event-body">
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
                            {place?.name ?? "Unknown place"} •{" "}
                            {primaryTag?.label ?? "Uncategorized event"}
                          </p>
                          <p className="timeline-event-summary">{event.summary}</p>

                          <div className="timeline-event-footer">
                            <div className="timeline-tag-row">
                              {tags.map((tag) => (
                                <span key={tag.id} className="timeline-tag-pill">
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                            <span className="timeline-citation">
                              {event.source_refs[0]?.citation ?? "Citation pending"}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
