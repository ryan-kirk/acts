import type { JSX } from "react";

import { MapView } from "../components/MapView";
import { PeopleView } from "../components/PeopleView";
import { SourcesView } from "../components/SourcesView";
import { TimelineView } from "../components/TimelineView";
import type { Event } from "../domain/dataset";
import { type DatasetIndex, type ExplorerView } from "../domain/events";
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
  onFocusSource: (sourceId: string) => void;
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
  onFocusSource,
  onSelectEvent,
  onTimelineFiltersChange
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
