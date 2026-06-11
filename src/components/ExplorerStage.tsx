import type { JSX } from "react";

import { MapView } from "../components/MapView";
import { PeopleView } from "../components/PeopleView";
import { TimelineView } from "../components/TimelineView";
import type { Event } from "../domain/dataset";
import {
  formatSourceType,
  getEventsForSource,
  type DatasetIndex,
  type ExplorerView
} from "../domain/events";
import type { ExplorerDataset } from "../domain/library";
import type { TimelineFilters } from "../domain/timeline";

interface ExplorerStageProps {
  activeView: ExplorerView;
  activeBookLabel: string;
  dataset: ExplorerDataset;
  event: Event;
  eventBookLabels: Map<string, string>;
  events: Event[];
  index: DatasetIndex;
  focusedPersonId: string | null;
  focusedPlaceId: string | null;
  focusedSourceId: string | null;
  timelineFilters: TimelineFilters;
  onFocusPerson: (personId: string) => void;
  onFocusPlace: (placeId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onTimelineFiltersChange: (filters: TimelineFilters) => void;
}

export function ExplorerStage({
  activeView,
  activeBookLabel,
  dataset,
  event,
  eventBookLabels,
  events,
  index,
  focusedPersonId,
  focusedPlaceId,
  focusedSourceId,
  timelineFilters,
  onFocusPerson,
  onFocusPlace,
  onSelectEvent,
  onTimelineFiltersChange
}: ExplorerStageProps) {
  const defaultSourceId = event.source_refs[0]?.source_id ?? dataset.sources[0]?.id ?? null;
  const activeSourceId = focusedSourceId ?? defaultSourceId;
  const focusedSource = activeSourceId ? index.sourcesById.get(activeSourceId) ?? null : null;
  const selectedSources = event.source_refs.flatMap((sourceRef) =>
    index.sourcesById.has(sourceRef.source_id) ? [sourceRef] : []
  );

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
      if (focusedSource === null) {
        content = (
          <div className="stage-stack">
            <div className="stage-card">
              <p className="stage-card-eyebrow">Source Preview</p>
              <h3>No source focus available</h3>
              <p>The selected event does not currently resolve to a known source record.</p>
            </div>
          </div>
        );
        break;
      }

      content = (
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">Source Focus</p>
            <h3>{focusedSource.name}</h3>
            <p>{focusedSource.citation}</p>

            <dl className="preview-meta-grid">
              <div>
                <dt>Type</dt>
                <dd>{formatSourceType(focusedSource.type)}</dd>
              </div>
              <div>
                <dt>Rights Status</dt>
                <dd>{focusedSource.usage_rights.status}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{focusedSource.author ?? "Not specified"}</dd>
              </div>
              <div>
                <dt>Selected Citations</dt>
                <dd>{selectedSources.length}</dd>
              </div>
            </dl>

            {focusedSource.usage_rights.usage_notes ? (
              <p className="muted-copy">{focusedSource.usage_rights.usage_notes}</p>
            ) : null}
          </div>
          <div className="stage-card stage-card-compact">
            <h3>Source-backed events in view</h3>
            <ul className="linked-record-list">
              {getEventsForSource(focusedSource.id, events).map((sourceEvent) => (
                <li key={sourceEvent.id}>
                  <button
                    type="button"
                    className="linked-record-button"
                    onClick={() => onSelectEvent(sourceEvent.id)}
                  >
                    <strong>{sourceEvent.title}</strong>
                    <span>
                      {
                        sourceEvent.source_refs.find(
                          (sourceRef) => sourceRef.source_id === focusedSource.id
                        )?.citation
                      }
                    </span>
                  </button>
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
            <p className="stage-card-eyebrow">Validated Library</p>
            <h3>{dataset.metadata.title}</h3>
            <p>{dataset.metadata.description}</p>
          </div>
          <div className="metric-grid" aria-label="Dataset counts">
            <article className="metric-card">
              <span>Books</span>
              <strong>{dataset.books.length}</strong>
            </article>
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
          <div className="stage-card stage-card-compact">
            <p className="stage-card-eyebrow">Current Focus</p>
            <h3>{activeBookLabel}</h3>
            <p>
              The explorer is currently scoped to {activeBookLabel} while shared people,
              places, tags, and sources remain normalized across the Luke-Acts library.
            </p>
          </div>
        </div>
      );
      break;
  }

  return <section className="stage-panel">{content}</section>;
}
