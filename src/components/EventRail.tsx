import type { Event } from "../domain/dataset";
import { formatDateRange, type DatasetIndex } from "../domain/events";

interface EventRailProps {
  activeBookLabel: string;
  events: Event[];
  eventBookLabels: Map<string, string>;
  query: string;
  selectedEventId: string;
  selectedEventHidden: boolean;
  index: DatasetIndex;
  onQueryChange: (query: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export function EventRail({
  activeBookLabel,
  events,
  eventBookLabels,
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
        <p className="section-eyebrow">
          {activeBookLabel === "All Books" ? "Canonical Library" : `${activeBookLabel} Dataset`}
        </p>
        <h2>Event Rail</h2>
        <p className="section-copy">
          Search by title, location, participant, summary, or citation to keep the explorer
          anchored to normalized canonical records while the shared scripture library expands.
        </p>
      </div>

      <label className="search-label" htmlFor="event-rail-search">
        Search events
      </label>
      <input
        id="event-rail-search"
        className="search-input"
        type="search"
        placeholder="Try Jerusalem, Cana, or John 11"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
      />

      <div className="rail-scroll-region">
        {selectedEventHidden ? (
          <p className="helper-note" role="status">
            The current selection is outside these filtered results.
          </p>
        ) : null}

        {events.length === 0 ? (
          <div className="empty-state" role="status">
            <h3>No matching events</h3>
            <p>Adjust the search or book focus to restore visible canonical records.</p>
          </div>
        ) : (
          <ol className="event-list">
            {events.map((event) => {
              const place = index.placesById.get(event.location_id);
              const primaryCitation = event.source_refs[0]?.citation;
              const bookLabel = eventBookLabels.get(event.id) ?? activeBookLabel;
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
                      {bookLabel} • {place?.name ?? "Unknown place"}
                      {primaryCitation ? ` • ${primaryCitation}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <footer className="rail-footer">
        <span>Active scope: {activeBookLabel}</span>
        <span>Shared entities merge by stable IDs across the canonical scripture library</span>
      </footer>
    </section>
  );
}
