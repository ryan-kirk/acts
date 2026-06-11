import { useDeferredValue, useState } from "react";

import { EventInspector } from "../components/EventInspector";
import { EventRail } from "../components/EventRail";
import { ExplorerStage } from "../components/ExplorerStage";
import { ViewNavigation } from "../components/ViewNavigation";
import type { CanonicalDataset } from "../domain/dataset";
import {
  buildDatasetIndex,
  filterEventsByQuery,
  sortEventsChronologically,
  type ExplorerView
} from "../domain/events";

interface ExplorerShellProps {
  dataset: CanonicalDataset;
}

export function ExplorerShell({ dataset }: ExplorerShellProps) {
  const datasetIndex = buildDatasetIndex(dataset);
  const sortedEvents = sortEventsChronologically(dataset.events);
  const [activeView, setActiveView] = useState<ExplorerView>("overview");
  const [selectedEventId, setSelectedEventId] = useState(sortedEvents[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const selectedEvent = datasetIndex.eventsById.get(selectedEventId) ?? sortedEvents[0] ?? null;
  const filteredEvents = filterEventsByQuery(sortedEvents, deferredSearchQuery, datasetIndex);
  const selectedEventHidden =
    selectedEvent !== null && !filteredEvents.some((event) => event.id === selectedEvent.id);

  if (selectedEvent === null) {
    return (
      <main className="app-shell">
        <section className="error-panel">
          <p className="section-eyebrow">Dataset Unavailable</p>
          <h1>No events were found in the validated Acts dataset.</h1>
          <p>
            The explorer shell expects at least one canonical event record before it can
            render shared navigation.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero-banner">
        <div>
          <p className="eyebrow">Bible Time &amp; Place Explorer</p>
          <h1>Acts explorer shell with shared navigation and validated data bootstrap.</h1>
          <p className="lede">
            The app now boots directly from the canonical Acts dataset and keeps a shared
            event selection across overview, timeline, map, people, and source previews.
          </p>
        </div>
        <div className="status-cluster" aria-label="Dataset status">
          <span className="status-pill">Validated static dataset</span>
          <span className="status-pill">Version {dataset.metadata.version}</span>
          <span className="status-pill">{dataset.metadata.updated ?? "Updated date pending"}</span>
        </div>
      </header>

      <section className="control-bar">
        <ViewNavigation activeView={activeView} onViewChange={setActiveView} />
        <div className="mobile-toggle-group" aria-label="Explorer drawers">
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={isRailOpen}
            onClick={() => setIsRailOpen((currentValue) => !currentValue)}
          >
            {isRailOpen ? "Hide event rail" : "Show event rail"}
          </button>
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={isInspectorOpen}
            onClick={() => setIsInspectorOpen((currentValue) => !currentValue)}
          >
            {isInspectorOpen ? "Hide details" : "Show details"}
          </button>
        </div>
      </section>

      <div className="explorer-layout">
        <aside className={`surface rail-surface ${isRailOpen ? "is-open" : ""}`}>
          <EventRail
            events={filteredEvents}
            query={searchQuery}
            selectedEventId={selectedEvent.id}
            selectedEventHidden={selectedEventHidden}
            index={datasetIndex}
            onQueryChange={setSearchQuery}
            onSelectEvent={(eventId) => {
              setSelectedEventId(eventId);
              setIsRailOpen(false);
              setIsInspectorOpen(true);
            }}
          />
        </aside>

        <section className="surface stage-surface">
          <ExplorerStage
            activeView={activeView}
            dataset={dataset}
            event={selectedEvent}
            index={datasetIndex}
          />
        </section>

        <aside className={`surface inspector-surface ${isInspectorOpen ? "is-open" : ""}`}>
          <EventInspector event={selectedEvent} index={datasetIndex} />
        </aside>
      </div>
    </main>
  );
}
