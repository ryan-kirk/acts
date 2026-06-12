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
  journeyOverlays: MapJourneyOverlay[];
  journeyVisibility: Record<string, boolean>;
  onFocusPlace: (placeId: string) => void;
  onFocusJourney: (journeyId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onToggleJourneyVisibility: (journeyId: string) => void;
  selectedEventId: string;
}

export function JourneyDetailPanel({
  activeBookLabel,
  activeJourneyOverlay,
  activePlaceId,
  eventBookLabels,
  index,
  journeyOverlays,
  journeyVisibility,
  onFocusPlace,
  onFocusJourney,
  onSelectEvent,
  onToggleJourneyVisibility,
  selectedEventId,
}: JourneyDetailPanelProps) {
  const visibleJourneyOverlays = journeyOverlays.filter(
    (journeyOverlay) => journeyVisibility[journeyOverlay.id]
  );

  if (journeyOverlays.length === 0) {
    return (
      <div className="empty-state">
        <h3>No journey overlays are modeled in this scope</h3>
        <p>Switch books or widen the scope to inspect route-based travel records.</p>
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
        <div className="journey-panel-badges">
          <span className="entity-type-badge">
            {visibleJourneyOverlays.length} of {journeyOverlays.length} visible
          </span>
          {activeJourneyOverlay ? (
            <span className="entity-type-badge">
              {formatDateCertainty(activeJourneyOverlay.journey.date.certainty)}
            </span>
          ) : null}
        </div>
      </div>

      <ul className="journey-selector-row">
        {journeyOverlays.map((journeyOverlay) => {
          const isSelected = activeJourneyOverlay?.id === journeyOverlay.id;
          const isVisible = journeyVisibility[journeyOverlay.id];

          return (
            <li
              key={journeyOverlay.id}
              className={`journey-selector-card ${
                isSelected ? "is-selected" : ""
              } ${isVisible ? "" : "is-hidden"}`}
            >
              <div className="journey-selector-card-header">
                <div>
                  <strong>{journeyOverlay.journey.title}</strong>
                  <span>
                    {journeyOverlay.stopRecords.length} stop
                    {journeyOverlay.stopRecords.length === 1 ? "" : "s"} •{" "}
                    {journeyOverlay.relatedEvents.length} linked event
                    {journeyOverlay.relatedEvents.length === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="entity-type-badge">
                  {isVisible ? "Visible" : "Hidden"}
                </span>
              </div>
              <div className="journey-selector-card-actions">
                <button
                  type="button"
                  className={`map-inline-button ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onFocusJourney(journeyOverlay.id)}
                >
                  {isSelected ? "Focused route" : "Focus route"}
                </button>
                <button
                  type="button"
                  className={`map-inline-button ${isVisible ? "is-selected" : ""}`}
                  aria-pressed={isVisible}
                  onClick={() => onToggleJourneyVisibility(journeyOverlay.id)}
                >
                  {isVisible ? "Hide route" : "Show route"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {visibleJourneyOverlays.length === 0 ? (
        <div className="empty-state journey-empty-state">
          <h3>No journey overlays are currently visible</h3>
          <p>Re-enable a route above to inspect the mapped travel sequence in this scope.</p>
        </div>
      ) : null}

      {activeJourneyOverlay && visibleJourneyOverlays.length > 0 ? (
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
        <div className="empty-state journey-empty-state">
          <h3>No journey is currently selected</h3>
          <p>Choose a visible route card or click a route line on the map to inspect it.</p>
        </div>
      )}
    </section>
  );
}
