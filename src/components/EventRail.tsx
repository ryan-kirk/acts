import type { Event } from "../domain/dataset";
import { formatDateRange, type DatasetIndex } from "../domain/events";

interface EventRailProps {
  events: Event[];
  query: string;
  selectedEventId: string;
  selectedEventHidden: boolean;
  index: DatasetIndex;
  onQueryChange: (query: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export function EventRail({
  events,
  query,
  selectedEventId,
  selectedEventHidden,
  index,
  onQueryChange,
  onSelectEvent
}: EventRailProps) {
  return (
    <section className="rail-panel">
      <div className="section-heading-block">
        <p className="section-eyebrow">Acts Dataset</p>
        <h2>Event Rail</h2>
        <p className="section-copy">
          Search by title, location, participant, summary, or citation to keep the
          explorer anchored to canonical Acts records.
        </p>
      </div>

      <label className="search-label" htmlFor="event-rail-search">
        Search events
      </label>
      <input
        id="event-rail-search"
        className="search-input"
        type="search"
        placeholder="Try Jerusalem, Malta, or Acts 15"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
      />

      {selectedEventHidden ? (
        <p className="helper-note" role="status">
          The current selection is outside these filtered results.
        </p>
      ) : null}

      {events.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No matching Acts events</h3>
          <p>Adjust the search to see more of the validated dataset.</p>
        </div>
      ) : (
        <ol className="event-list">
          {events.map((event) => {
            const place = index.placesById.get(event.location_id);
            const primaryCitation = event.source_refs[0]?.citation;
            const isSelected = event.id === selectedEventId;

            return (
              <li key={event.id}>
                <button
                  type="button"
                  className={`event-item ${isSelected ? "is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectEvent(event.id)}
                >
                  <span className="event-item-date">{formatDateRange(event)}</span>
                  <span className="event-item-title">{event.title}</span>
                  <span className="event-item-meta">
                    {place?.name ?? "Unknown place"}{primaryCitation ? ` • ${primaryCitation}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
