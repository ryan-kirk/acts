import {
  formatDateCertainty,
  formatDateRange,
  formatSourceType,
  type DatasetIndex
} from "../domain/events";
import type { MapJourneyOverlay } from "../domain/map";

interface JourneyDetailPanelProps {
  activeBookLabel: string;
  activeJourneyOverlay: MapJourneyOverlay | null;
  activePlaceId: string | null;
  eventBookLabels: Map<string, string>;
  index: DatasetIndex;
  onFocusPlace: (placeId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onSelectJourney: (journeyId: string) => void;
  selectedEventId: string;
  visibleJourneyOverlays: MapJourneyOverlay[];
}

export function JourneyDetailPanel({
  activeBookLabel,
  activeJourneyOverlay,
  activePlaceId,
  eventBookLabels,
  index,
  onFocusPlace,
  onSelectEvent,
  onSelectJourney,
  selectedEventId,
  visibleJourneyOverlays
}: JourneyDetailPanelProps) {
  if (visibleJourneyOverlays.length === 0) {
    return (
      <div className="empty-state">
        <h3>No journey overlays are currently visible</h3>
        <p>Re-enable a route toggle to inspect the visible journey records in this book focus.</p>
      </div>
    );
  }

  return (
    <section className="journey-panel">
      <div className="journey-panel-header">
        <div>
          <p className="section-eyebrow">Journey Focus</p>
          <h3>{activeJourneyOverlay?.journey.title ?? "Select a journey route"}</h3>
        </div>
        {activeJourneyOverlay ? (
          <span className="entity-type-badge">
            {formatDateCertainty(activeJourneyOverlay.journey.date.certainty)}
          </span>
        ) : null}
      </div>

      <div className="journey-selector-row">
        {visibleJourneyOverlays.map((journeyOverlay) => {
          const isSelected = activeJourneyOverlay?.id === journeyOverlay.id;

          return (
            <button
              key={journeyOverlay.id}
              type="button"
              className={`journey-selector-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectJourney(journeyOverlay.id)}
            >
              <strong>{journeyOverlay.journey.title}</strong>
              <span>
                {journeyOverlay.stopRecords.length} stop
                {journeyOverlay.stopRecords.length === 1 ? "" : "s"} •{" "}
                {journeyOverlay.relatedEvents.length} linked event
                {journeyOverlay.relatedEvents.length === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>

      {activeJourneyOverlay ? (
        <>
          <p className="journey-summary">
            {activeJourneyOverlay.journey.summary ?? "No journey summary has been modeled yet."}
          </p>

          <dl className="preview-meta-grid">
            <div>
              <dt>Date</dt>
              <dd>{formatDateRange(activeJourneyOverlay.journey)}</dd>
            </div>
            <div>
              <dt>Stops</dt>
              <dd>{activeJourneyOverlay.stopRecords.length}</dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{activeJourneyOverlay.stopRecords[0]?.place.name ?? "Unknown"}</dd>
            </div>
            <div>
              <dt>End</dt>
              <dd>
                {activeJourneyOverlay.stopRecords[activeJourneyOverlay.stopRecords.length - 1]?.place
                  .name ?? "Unknown"}
              </dd>
            </div>
          </dl>

          <div className="journey-section">
            <div className="section-header-row">
              <h3>Route stops</h3>
            </div>
            <ul className="linked-record-list">
              {activeJourneyOverlay.stopRecords.map((stopRecord) => {
                const relatedEvent = stopRecord.relatedEvents[0] ?? null;
                const isSelected = activePlaceId === stopRecord.place.id;

                return (
                  <li key={`${activeJourneyOverlay.id}-${stopRecord.routePoint.sequence}`}>
                    <button
                      type="button"
                      className={`linked-record-button ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        onFocusPlace(stopRecord.place.id);
                        if (relatedEvent) {
                          onSelectEvent(relatedEvent.id);
                        }
                      }}
                    >
                      <strong>
                        {stopRecord.routePoint.sequence}. {stopRecord.place.name}
                      </strong>
                      <span>
                        {stopRecord.place.region}, {stopRecord.place.modern_country}
                        {relatedEvent
                          ? ` • ${relatedEvent.title}`
                          : " • No journey event modeled at this stop"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="journey-section">
            <div className="section-header-row">
              <h3>Linked events in view</h3>
            </div>
            {activeJourneyOverlay.relatedEvents.length === 0 ? (
              <p className="muted-copy">
                No linked events are attached to this journey record yet.
              </p>
            ) : (
              <ul className="linked-record-list">
                {activeJourneyOverlay.relatedEvents.map((relatedEvent) => (
                  <li key={relatedEvent.id}>
                    <button
                      type="button"
                      className={`linked-record-button ${
                        relatedEvent.id === selectedEventId ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectEvent(relatedEvent.id)}
                    >
                      <strong>{relatedEvent.title}</strong>
                      <span>
                        {eventBookLabels.get(relatedEvent.id) ?? activeBookLabel} •{" "}
                        {formatDateRange(relatedEvent)} •{" "}
                        {relatedEvent.source_refs[0]?.citation ?? "Citation pending"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="citation-block journey-section">
            <div className="section-header-row">
              <h3>Journey source support</h3>
              <span className="entity-meta">
                {activeJourneyOverlay.journey.source_refs.length} citation
                {activeJourneyOverlay.journey.source_refs.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="citation-list">
              {activeJourneyOverlay.journey.source_refs.flatMap((sourceRef) => {
                const source = index.sourcesById.get(sourceRef.source_id);

                if (!source) {
                  return [];
                }

                return [
                  <li key={`${activeJourneyOverlay.id}-${source.id}-${sourceRef.citation}`}>
                    <strong>{source.name}</strong>
                    <span>
                      {sourceRef.citation} • {formatSourceType(source.type)}
                    </span>
                  </li>
                ];
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>No journey is currently selected</h3>
          <p>Choose a visible route card or click a route line on the map to inspect it.</p>
        </div>
      )}
    </section>
  );
}
