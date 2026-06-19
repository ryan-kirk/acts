import type { CanonicalDataset, Event } from "../domain/dataset";
import {
  formatLocationCertainty,
  formatSourceType,
  formatDateCertainty,
  formatDateRange,
  getDateCertaintyDescription,
  getEventJourney,
  getLocationCertaintyDescription,
  getEventParticipants,
  getPlaceForEvent,
  getRelatedEvents,
  getEventTags,
  type DatasetIndex
} from "../domain/events";
import {
  type ClaimConfidenceFilter,
  filterClaimExplorerRecords,
  formatClaimConfidence,
  formatClaimType,
  getClaimRecordsForEvent
} from "../domain/sources";

interface EventInspectorProps {
  activeBookLabel: string;
  claimConfidenceFilter: ClaimConfidenceFilter;
  dataset: CanonicalDataset;
  event: Event;
  eventBookLabel: string;
  events: Event[];
  index: DatasetIndex;
  onSelectEvent: (eventId: string) => void;
  onFocusPerson: (personId: string) => void;
  onFocusPlace: (placeId: string) => void;
  onFocusSource: (sourceId: string) => void;
}

export function EventInspector({
  activeBookLabel,
  claimConfidenceFilter,
  dataset,
  event,
  eventBookLabel,
  events,
  index,
  onSelectEvent,
  onFocusPerson,
  onFocusPlace,
  onFocusSource
}: EventInspectorProps) {
  const isSynopticContinuityClaim = (claimType: string) => claimType.startsWith("synoptic_");
  const place = getPlaceForEvent(event, index);
  const participants = getEventParticipants(event, index);
  const tags = getEventTags(event, index);
  const journey = getEventJourney(event, index);
  const relatedEvents = getRelatedEvents(event, index);
  const allClaimRecords = getClaimRecordsForEvent(event.id, dataset, index);
  const claimRecords = filterClaimExplorerRecords(allClaimRecords, claimConfidenceFilter);
  const allContinuityClaimRecords = allClaimRecords.filter((claimRecord) =>
    isSynopticContinuityClaim(claimRecord.claim.claim_type)
  );
  const continuityClaimRecords = claimRecords.filter((claimRecord) =>
    isSynopticContinuityClaim(claimRecord.claim.claim_type)
  );
  const allExternalClaimRecords = allClaimRecords.filter(
    (claimRecord) => !isSynopticContinuityClaim(claimRecord.claim.claim_type)
  );
  const externalClaimRecords = claimRecords.filter(
    (claimRecord) => !isSynopticContinuityClaim(claimRecord.claim.claim_type)
  );
  const chronologyExplanation = getDateCertaintyDescription(event.date.certainty);
  const sourceEntries = event.source_refs.flatMap((sourceRef) => {
    const source = index.sourcesById.get(sourceRef.source_id);
    return source ? [{ source, sourceRef }] : [];
  });

  return (
    <section className="inspector-panel" aria-label="Selected event details">
      <div className="section-heading-block">
        <p className="section-eyebrow">Selected Event</p>
        <h2>{event.title}</h2>
      </div>

      <p className="inspector-summary">{event.summary}</p>

      <dl className="detail-grid">
        <div>
          <dt>Book</dt>
          <dd>{eventBookLabel}</dd>
        </div>
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

      <section className="detail-section">
        <div className="section-header-row">
          <h3>Chronology Note</h3>
        </div>
        <p className="muted-copy">{chronologyExplanation}</p>
        {event.notes ? <p className="context-note">{event.notes}</p> : null}
      </section>

      <section className="detail-section">
        <div className="section-header-row">
          <h3>Place Context</h3>
          {place ? (
            <button
              type="button"
              className="detail-action-button"
              aria-label={`Open place focus for ${place.name}`}
              onClick={() => onFocusPlace(place.id)}
            >
              Open place focus
            </button>
          ) : null}
        </div>

        {place ? (
          <div className="entity-card">
            <div className="entity-card-header">
              <div>
                <strong>{place.name}</strong>
                <span className="entity-subtitle">
                  {place.region}, {place.modern_country}
                </span>
              </div>
              <span className="entity-type-badge">
                {formatLocationCertainty(place.location_certainty)}
              </span>
            </div>
            <p className="entity-summary">
              {place.summary ?? "No place summary has been modeled yet."}
            </p>
            <p className="muted-copy">
              {getLocationCertaintyDescription(place.location_certainty)}
            </p>
          </div>
        ) : (
          <p className="muted-copy">This event does not currently resolve to a known place.</p>
        )}
      </section>

      <section className="detail-section">
        <div className="section-header-row">
          <h3>People</h3>
        </div>
        {participants.length === 0 ? (
          <p className="muted-copy">No participants are attached to this event record.</p>
        ) : (
          <ul className="entity-card-list">
            {participants.map((participant) => (
              <li key={participant.id} className="entity-card">
                <div className="entity-card-header">
                  <div>
                    <strong>{participant.name}</strong>
                    <span className="entity-subtitle">
                      {participant.role ?? "Role not specified"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="detail-action-button"
                    aria-label={`Open person focus for ${participant.name}`}
                    onClick={() => onFocusPerson(participant.id)}
                  >
                    Open person focus
                  </button>
                </div>
                {participant.aliases.length > 0 ? (
                  <p className="entity-meta">
                    Aliases: {participant.aliases.join(", ")}
                  </p>
                ) : null}
                <p className="entity-summary">
                  {participant.summary ?? "No person summary has been modeled yet."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-section">
        <div className="section-header-row">
          <h3>Tags</h3>
        </div>
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
      </section>

      {journey ? (
        <section className="detail-section">
          <div className="section-header-row">
            <h3>Journey Context</h3>
          </div>
          <div className="entity-card">
            <div className="entity-card-header">
              <div>
                <strong>{journey.title}</strong>
                <span className="entity-subtitle">
                  {journey.route.length} route stop{journey.route.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="entity-type-badge">{formatDateCertainty(journey.date.certainty)}</span>
            </div>
            <p className="entity-summary">
              {journey.summary ?? "No journey summary has been modeled yet."}
            </p>
          </div>
        </section>
      ) : null}

      <section className="detail-section">
        <div className="section-header-row">
          <h3>Related Events</h3>
        </div>
        {relatedEvents.length === 0 ? (
          <p className="muted-copy">No related events are linked to this record yet.</p>
        ) : (
          <ul className="linked-record-list">
            {relatedEvents.map((relatedEvent) => (
              <li key={relatedEvent.id}>
                <button
                  type="button"
                  className="linked-record-button"
                  onClick={() => onSelectEvent(relatedEvent.id)}
                >
                  <strong>{relatedEvent.title}</strong>
                  <span>
                    {formatDateRange(relatedEvent)} •{" "}
                    {relatedEvent.source_refs[0]?.citation ?? "Citation pending"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {allContinuityClaimRecords.length > 0 ? (
        <section className="detail-section">
          <div className="section-header-row">
            <h3>Synoptic Continuity</h3>
            {claimConfidenceFilter !== "all" ? (
              <span className="entity-type-badge">
                {formatClaimConfidence(claimConfidenceFilter)} confidence
              </span>
            ) : null}
          </div>
          {continuityClaimRecords.length === 0 ? (
            <p className="muted-copy">
              No synoptic continuity cues for this event match the current confidence lens.
            </p>
          ) : (
            <ul className="sources-claim-list inspector-claim-list">
              {continuityClaimRecords.map((claimRecord) => {
                const parallelEvents = claimRecord.relatedEvents.filter(
                  (relatedEvent) => relatedEvent.id !== event.id
                );

                return (
                  <li key={claimRecord.claim.id} className="sources-claim-card">
                    <div className="sources-claim-header">
                      <strong>{formatClaimType(claimRecord.claim.claim_type)}</strong>
                      <span
                        className={`sources-confidence-badge confidence-${claimRecord.claim.confidence}`}
                      >
                        {formatClaimConfidence(claimRecord.claim.confidence)}
                      </span>
                    </div>
                    <p className="sources-claim-statement">{claimRecord.claim.statement}</p>
                    <div className="sources-citation-row">
                      {claimRecord.sourceEntries.map((sourceEntry) => (
                        <button
                          key={`${claimRecord.claim.id}-${sourceEntry.source.id}-${sourceEntry.citation}`}
                          type="button"
                          className="sources-citation-badge"
                          onClick={() => onFocusSource(sourceEntry.source.id)}
                        >
                          {sourceEntry.source.name} • {sourceEntry.citation}
                        </button>
                      ))}
                    </div>
                    {parallelEvents.length > 0 ? (
                      <ul className="linked-record-list">
                        {parallelEvents.map((relatedEvent) => (
                          <li key={relatedEvent.id}>
                            <button
                              type="button"
                              className="linked-record-button"
                              onClick={() => onSelectEvent(relatedEvent.id)}
                            >
                              <strong>{relatedEvent.title}</strong>
                              <span>
                                {formatDateRange(relatedEvent)} •{" "}
                                {relatedEvent.source_refs[0]?.citation ?? "Citation pending"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted-copy">
                        No parallel event cards are currently available outside this active
                        selection.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {allExternalClaimRecords.length > 0 ? (
        <section className="detail-section">
          <div className="section-header-row">
            <h3>External Attestation & Claims</h3>
            {claimConfidenceFilter !== "all" ? (
              <span className="entity-type-badge">
                {formatClaimConfidence(claimConfidenceFilter)} confidence
              </span>
            ) : null}
          </div>
          {externalClaimRecords.length === 0 ? (
            <p className="muted-copy">
              No external claims for this event match the current confidence lens.
            </p>
          ) : (
            <ul className="sources-claim-list inspector-claim-list">
              {externalClaimRecords.map((claimRecord) => {
                const additionalEvents = claimRecord.relatedEvents.filter(
                  (relatedEvent) => relatedEvent.id !== event.id
                );

                return (
                  <li key={claimRecord.claim.id} className="sources-claim-card">
                    <div className="sources-claim-header">
                      <strong>{formatClaimType(claimRecord.claim.claim_type)}</strong>
                      <span
                        className={`sources-confidence-badge confidence-${claimRecord.claim.confidence}`}
                      >
                        {formatClaimConfidence(claimRecord.claim.confidence)}
                      </span>
                    </div>
                    <p className="sources-claim-statement">{claimRecord.claim.statement}</p>

                    <div className="sources-citation-row">
                      {claimRecord.sourceEntries.map((sourceEntry) => (
                        <button
                          key={`${claimRecord.claim.id}-${sourceEntry.source.id}-${sourceEntry.citation}`}
                          type="button"
                          className="sources-citation-badge"
                          onClick={() => onFocusSource(sourceEntry.source.id)}
                        >
                          {sourceEntry.source.name} • {sourceEntry.citation}
                        </button>
                      ))}
                    </div>

                    {additionalEvents.length > 0 ? (
                      <ul className="linked-record-list">
                        {additionalEvents.map((relatedEvent) => (
                          <li key={relatedEvent.id}>
                            <button
                              type="button"
                              className="linked-record-button"
                              onClick={() => onSelectEvent(relatedEvent.id)}
                            >
                              <strong>{relatedEvent.title}</strong>
                              <span>
                                {formatDateRange(relatedEvent)} •{" "}
                                {relatedEvent.source_refs[0]?.citation ?? "Citation pending"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      <section className="citation-block detail-section">
        <div className="section-header-row">
          <h3>Source Support</h3>
          <span className="entity-meta">
            {sourceEntries.length} citation{sourceEntries.length === 1 ? "" : "s"}
          </span>
        </div>
        <ul className="citation-list">
          {sourceEntries.map(({ source, sourceRef }) => (
            <li key={`${event.id}-${sourceRef.source_id}-${sourceRef.citation}`}>
              <div className="citation-header">
                <div>
                  <strong>{source.name}</strong>
                  <span className="entity-subtitle">{formatSourceType(source.type)}</span>
                </div>
                <button
                  type="button"
                  className="detail-action-button"
                  aria-label={`Open source focus for ${source.name}`}
                  onClick={() => onFocusSource(source.id)}
                >
                  Open source focus
                </button>
              </div>
              <span>{sourceRef.citation}</span>
              <p className="entity-meta">Catalog citation: {source.citation}</p>
              <p className="muted-copy">
                Rights status: {source.usage_rights.status}
                {source.usage_rights.attribution_text
                  ? ` • ${source.usage_rights.attribution_text}`
                  : ""}
              </p>
              {source.usage_rights.usage_notes ? (
                <p className="context-note">{source.usage_rights.usage_notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <div className="section-header-row">
          <h3>Record Scope</h3>
        </div>
        <p className="muted-copy">
          This view is grounded in normalized {activeBookLabel} data within the canonical
          scripture library. It currently resolves{" "}
          {participants.length} participant{participants.length === 1 ? "" : "s"},{" "}
          {relatedEvents.length} related event{relatedEvents.length === 1 ? "" : "s"}, and{" "}
          {events.filter((candidateEvent) => candidateEvent.id === event.id).length} selected
          canonical event record.
        </p>
      </section>
    </section>
  );
}
