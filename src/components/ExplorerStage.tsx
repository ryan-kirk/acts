import type { JSX } from "react";

import { TimelineView } from "../components/TimelineView";
import type { CanonicalDataset, Event } from "../domain/dataset";
import {
  explorerViews,
  formatCoordinate,
  getEventParticipants,
  type DatasetIndex,
  type ExplorerView
} from "../domain/events";
import type { TimelineFilters } from "../domain/timeline";

interface ExplorerStageProps {
  activeView: ExplorerView;
  dataset: CanonicalDataset;
  event: Event;
  events: Event[];
  index: DatasetIndex;
  timelineFilters: TimelineFilters;
  onSelectEvent: (eventId: string) => void;
  onTimelineFiltersChange: (filters: TimelineFilters) => void;
}

export function ExplorerStage({
  activeView,
  dataset,
  event,
  events,
  index,
  timelineFilters,
  onSelectEvent,
  onTimelineFiltersChange
}: ExplorerStageProps) {
  const selectedView = explorerViews.find((view) => view.id === activeView) ?? explorerViews[0]!;
  const place = index.placesById.get(event.location_id) ?? null;
  const participants = getEventParticipants(event, index);
  const selectedSources = event.source_refs.flatMap((sourceRef) =>
    index.sourcesById.has(sourceRef.source_id) ? [sourceRef] : []
  );

  let content: JSX.Element;

  switch (activeView) {
    case "timeline":
      content = (
        <TimelineView
          dataset={dataset}
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
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">Place Preview</p>
            <h3>{place?.name ?? "Unknown place"}</h3>
            <p>
              Phase 7 will introduce the interactive map. The shell is already wired to
              the validated place record that the future map surface will consume.
            </p>
          </div>
          {place ? (
            <div className="stage-card stage-card-compact">
              <h3>Validated coordinates</h3>
              <p>
                {formatCoordinate(place.latitude)}, {formatCoordinate(place.longitude)}
              </p>
              <p className="muted-copy">
                {place.region}, {place.modern_country} • {place.location_certainty}
              </p>
            </div>
          ) : null}
        </div>
      );
      break;
    case "people":
      content = (
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">People Preview</p>
            <h3>{participants.length} participant{participants.length === 1 ? "" : "s"}</h3>
            <p>
              Phase 8 will turn these linked participants into a full people explorer with
              biographies and appearance histories.
            </p>
          </div>
          <div className="stage-card stage-card-compact">
            <h3>Selected event participants</h3>
            <ul className="stage-list">
              {participants.map((participant) => (
                <li key={participant.id}>{participant.name}</li>
              ))}
            </ul>
          </div>
        </div>
      );
      break;
    case "sources":
      content = (
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">Source Preview</p>
            <h3>{selectedSources.length} citation{selectedSources.length === 1 ? "" : "s"}</h3>
            <p>
              Phase 11 will widen this into a source explorer. The shell already exposes the
              selected record’s citations and the dataset’s rights metadata.
            </p>
          </div>
          <div className="stage-card stage-card-compact">
            <h3>Rights tracking</h3>
            <ul className="stage-list">
              {dataset.sources.map((source) => (
                <li key={source.id}>
                  {source.name}: {source.usage_rights.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      break;
    case "overview":
    default:
      content = (
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">Validated Dataset</p>
            <h3>{dataset.metadata.title}</h3>
            <p>{dataset.metadata.description}</p>
          </div>
          <div className="metric-grid" aria-label="Dataset counts">
            <article className="metric-card">
              <span>Events</span>
              <strong>{dataset.events.length}</strong>
            </article>
            <article className="metric-card">
              <span>Places</span>
              <strong>{dataset.places.length}</strong>
            </article>
            <article className="metric-card">
              <span>People</span>
              <strong>{dataset.people.length}</strong>
            </article>
            <article className="metric-card">
              <span>Journeys</span>
              <strong>{dataset.journeys.length}</strong>
            </article>
          </div>
        </div>
      );
      break;
  }

  return (
    <section className="stage-panel">
      <div className="section-heading-block">
        <p className="section-eyebrow">Explorer View</p>
        <h2>{selectedView.label}</h2>
        <p className="section-copy">{selectedView.description}</p>
      </div>
      {content}
    </section>
  );
}
