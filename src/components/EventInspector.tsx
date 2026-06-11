import type { Event } from "../domain/dataset";
import {
  formatDateCertainty,
  formatDateRange,
  getEventJourney,
  getEventParticipants,
  getEventTags,
  type DatasetIndex
} from "../domain/events";

interface EventInspectorProps {
  event: Event;
  index: DatasetIndex;
}

export function EventInspector({ event, index }: EventInspectorProps) {
  const place = index.placesById.get(event.location_id) ?? null;
  const participants = getEventParticipants(event, index);
  const tags = getEventTags(event, index);
  const journey = getEventJourney(event, index);

  return (
    <section className="inspector-panel" aria-label="Selected event details">
      <div className="section-heading-block">
        <p className="section-eyebrow">Selected Event</p>
        <h2>{event.title}</h2>
      </div>

      <p className="inspector-summary">{event.summary}</p>

      <dl className="detail-grid">
        <div>
          <dt>Date</dt>
          <dd>{formatDateRange(event)}</dd>
        </div>
        <div>
          <dt>Certainty</dt>
          <dd>{formatDateCertainty(event.date.certainty)}</dd>
        </div>
        <div>
          <dt>Place</dt>
          <dd>{place?.name ?? "Unknown place"}</dd>
        </div>
        <div>
          <dt>Journey</dt>
          <dd>{journey?.title ?? "Standalone event"}</dd>
        </div>
      </dl>

      <div className="pill-section">
        <h3>People</h3>
        {participants.length === 0 ? (
          <p className="muted-copy">No participants are attached to this event record.</p>
        ) : (
          <div className="pill-row">
            {participants.map((participant) => (
              <span key={participant.id} className="pill">
                {participant.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pill-section">
        <h3>Tags</h3>
        {tags.length === 0 ? (
          <p className="muted-copy">No tags are attached to this event record.</p>
        ) : (
          <div className="pill-row">
            {tags.map((tag) => (
              <span key={tag.id} className="pill pill-muted">
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="citation-block">
        <h3>Source Citations</h3>
        <ul className="citation-list">
          {event.source_refs.map((sourceRef) => (
            <li key={`${event.id}-${sourceRef.source_id}-${sourceRef.citation}`}>
              <strong>{index.sourcesById.get(sourceRef.source_id)?.name ?? sourceRef.source_id}</strong>
              <span>{sourceRef.citation}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
