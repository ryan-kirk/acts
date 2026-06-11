import type { JSX } from "react";

import { MapView } from "../components/MapView";
import { TimelineView } from "../components/TimelineView";
import type { CanonicalDataset, Event } from "../domain/dataset";
import {
  explorerViews,
  formatSourceType,
  getEventsForPerson,
  getEventsForSource,
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
  focusedPersonId: string | null;
  focusedPlaceId: string | null;
  focusedSourceId: string | null;
  timelineFilters: TimelineFilters;
  onFocusPlace: (placeId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onTimelineFiltersChange: (filters: TimelineFilters) => void;
}

export function ExplorerStage({
  activeView,
  dataset,
  event,
  events,
  index,
  focusedPersonId,
  focusedPlaceId,
  focusedSourceId,
  timelineFilters,
  onFocusPlace,
  onSelectEvent,
  onTimelineFiltersChange
}: ExplorerStageProps) {
  const selectedView = explorerViews.find((view) => view.id === activeView) ?? explorerViews[0]!;
  const participants = getEventParticipants(event, index);
  const focusedPerson =
    (focusedPersonId ? index.peopleById.get(focusedPersonId) : null) ?? participants[0] ?? null;
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
        <MapView
          dataset={dataset}
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
      if (focusedPerson === null) {
        content = (
          <div className="stage-stack">
            <div className="stage-card">
              <p className="stage-card-eyebrow">People Preview</p>
              <h3>No person focus available</h3>
              <p>The selected event does not currently resolve to any participant records.</p>
            </div>
          </div>
        );
        break;
      }

      content = (
        <div className="stage-stack">
          <div className="stage-card">
            <p className="stage-card-eyebrow">Person Focus</p>
            <h3>{focusedPerson.name}</h3>
            <p>{focusedPerson.summary ?? "No person summary has been modeled yet."}</p>

            <dl className="preview-meta-grid">
              <div>
                <dt>Role</dt>
                <dd>{focusedPerson.role ?? "Role not specified"}</dd>
              </div>
              <div>
                <dt>Aliases</dt>
                <dd>
                  {focusedPerson.aliases.length > 0
                    ? focusedPerson.aliases.join(", ")
                    : "No aliases recorded"}
                </dd>
              </div>
            </dl>
          </div>
          <div className="stage-card stage-card-compact">
            <h3>Acts appearances</h3>
            <ul className="linked-record-list">
              {getEventsForPerson(focusedPerson.id, events).map((appearance) => (
                <li key={appearance.id}>
                  <button
                    type="button"
                    className="linked-record-button"
                    onClick={() => onSelectEvent(appearance.id)}
                  >
                    <strong>{appearance.title}</strong>
                    <span>{appearance.source_refs[0]?.citation ?? "Citation pending"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
            <h3>Source-backed Acts events</h3>
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
