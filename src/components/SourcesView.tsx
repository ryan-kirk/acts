import { useEffect, useState } from "react";

import type { Event, Source } from "../domain/dataset";
import type { ExplorerDataset } from "../domain/library";
import { formatDateRange, formatSourceType, type DatasetIndex } from "../domain/events";
import {
  buildClaimExplorerRecords,
  buildSourceExplorerRecords,
  formatClaimConfidence,
  formatClaimType,
  formatRightsStatus,
  getClaimConfidenceDescription,
  getPreferredSourceId,
  groupSourceExplorerRecords
} from "../domain/sources";

interface SourcesViewProps {
  activeBookLabel: string;
  dataset: ExplorerDataset;
  eventBookLabels: Map<string, string>;
  events: Event[];
  focusedSourceId: string | null;
  index: DatasetIndex;
  onFocusSource: (sourceId: string) => void;
  onSelectEvent: (eventId: string) => void;
  selectedEvent: Event;
}

export function SourcesView({
  activeBookLabel,
  dataset,
  eventBookLabels,
  events,
  focusedSourceId,
  index,
  onFocusSource,
  onSelectEvent,
  selectedEvent
}: SourcesViewProps) {
  const claimRecords = buildClaimExplorerRecords(dataset, index, events);
  const sourceRecords = buildSourceExplorerRecords(dataset, events, claimRecords);
  const groupedSourceRecords = groupSourceExplorerRecords(sourceRecords);
  const preferredSourceId = getPreferredSourceId(sourceRecords, focusedSourceId, selectedEvent);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(preferredSourceId);

  useEffect(() => {
    setSelectedSourceId(preferredSourceId);
  }, [preferredSourceId]);

  const activeSourceRecord =
    sourceRecords.find((sourceRecord) => sourceRecord.source.id === selectedSourceId) ?? null;
  const externalSourceCount = sourceRecords.filter((sourceRecord) => sourceRecord.isExternal).length;
  const rightsStatusCounts = sourceRecords.reduce<Record<string, number>>((counts, sourceRecord) => {
    const status = sourceRecord.source.usage_rights.status;
    return {
      ...counts,
      [status]: (counts[status] ?? 0) + 1
    };
  }, {});

  function handleSelectSource(sourceId: string): void {
    setSelectedSourceId(sourceId);
    onFocusSource(sourceId);
  }

  return (
    <section className="sources-view" aria-label="Scripture sources explorer">
      <div className="sources-toolbar">
        <div className="sources-counts">
          <span className="people-count-pill">{sourceRecords.length} sources in view</span>
          <span className="people-count-pill">{claimRecords.length} claims in view</span>
          <span className="people-count-pill">{externalSourceCount} external witnesses</span>
          <span className="people-count-pill">{activeBookLabel} attestation scope</span>
        </div>
      </div>

      <div className="sources-stack">
        <section className="sources-hero-card">
          <div className="sources-hero-header">
            <div>
              <p className="stage-card-eyebrow">Source-Critical Apparatus</p>
              <h3>Sources & Attestation</h3>
              <p className="muted-copy">
                Canonical event summaries remain scripture-grounded while external witnesses,
                manuscript traditions, and interpretive claims stay modeled as a separate layer.
              </p>
            </div>
            {activeSourceRecord ? (
              <span className="entity-type-badge">
                {formatSourceType(activeSourceRecord.source.type)}
              </span>
            ) : null}
          </div>

          <dl className="preview-meta-grid">
            <div>
              <dt>Book Focus</dt>
              <dd>{activeBookLabel}</dd>
            </div>
            <div>
              <dt>Selected Event</dt>
              <dd>{selectedEvent.title}</dd>
            </div>
            <div>
              <dt>Source Focus</dt>
              <dd>{activeSourceRecord?.source.name ?? "No source available"}</dd>
            </div>
            <div>
              <dt>Visible Claims</dt>
              <dd>{claimRecords.length}</dd>
            </div>
          </dl>

          {activeSourceRecord ? (
            <div className="sources-active-card">
              <div className="sources-active-header">
                <div>
                  <p className="section-eyebrow">Active Source</p>
                  <h3>{activeSourceRecord.source.name}</h3>
                  <p className="muted-copy">{activeSourceRecord.source.citation}</p>
                </div>
                <div className="sources-badge-column">
                  <span className="entity-type-badge">
                    {formatSourceType(activeSourceRecord.source.type)}
                  </span>
                  <span className="entity-type-badge">
                    {formatRightsStatus(activeSourceRecord.source.usage_rights.status)}
                  </span>
                </div>
              </div>

              <dl className="preview-meta-grid">
                <div>
                  <dt>Author</dt>
                  <dd>{activeSourceRecord.source.author ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Publication</dt>
                  <dd>{activeSourceRecord.source.publication_date ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Linked Events</dt>
                  <dd>{activeSourceRecord.linkedEvents.length}</dd>
                </div>
                <div>
                  <dt>Linked Claims</dt>
                  <dd>{activeSourceRecord.linkedClaims.length}</dd>
                </div>
              </dl>

              {activeSourceRecord.source.usage_rights.attribution_text ? (
                <p className="context-note">
                  {activeSourceRecord.source.usage_rights.attribution_text}
                </p>
              ) : null}

              {activeSourceRecord.source.usage_rights.usage_notes ? (
                <p className="muted-copy">{activeSourceRecord.source.usage_rights.usage_notes}</p>
              ) : null}

              {(activeSourceRecord.source.usage_rights.license_url ??
                activeSourceRecord.source.usage_rights.terms_of_use_url) ? (
                <div className="sources-link-row">
                  {activeSourceRecord.source.usage_rights.license_url ? (
                    <a
                      className="sources-inline-link"
                      href={activeSourceRecord.source.usage_rights.license_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      License
                    </a>
                  ) : null}
                  {activeSourceRecord.source.usage_rights.terms_of_use_url ? (
                    <a
                      className="sources-inline-link"
                      href={activeSourceRecord.source.usage_rights.terms_of_use_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Terms of Use
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="sources-subsection">
                <div className="section-header-row">
                  <h3>Source-backed events in view</h3>
                </div>
                {activeSourceRecord.linkedEvents.length === 0 ? (
                  <p className="muted-copy">No visible events are currently tied to this source.</p>
                ) : (
                  <ul className="linked-record-list">
                    {activeSourceRecord.linkedEvents.map((linkedEvent) => (
                      <li key={linkedEvent.id}>
                        <button
                          type="button"
                          className="linked-record-button"
                          onClick={() => onSelectEvent(linkedEvent.id)}
                        >
                          <strong>{linkedEvent.title}</strong>
                          <span>
                            {eventBookLabels.get(linkedEvent.id) ?? activeBookLabel} •{" "}
                            {formatDateRange(linkedEvent)} •{" "}
                            {linkedEvent.source_refs[0]?.citation ?? "Citation pending"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="sources-subsection">
                <div className="section-header-row">
                  <h3>Claims tied to this source</h3>
                </div>
                {activeSourceRecord.linkedClaims.length === 0 ? (
                  <p className="muted-copy">
                    No visible interpretive claims currently cite this source.
                  </p>
                ) : (
                  <ul className="sources-claim-list">
                    {activeSourceRecord.linkedClaims.map((claimRecord) => (
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {groupedSourceRecords.map(({ section, records }) => (
          <section key={section.id} className="sources-section">
            <div className="sources-section-header">
              <h3>{section.label}</h3>
              <div className="sources-section-rule" />
            </div>
            <p className="muted-copy sources-section-copy">{section.description}</p>
            <div className="sources-record-grid">
              {records.map((record) => {
                const isSelected = activeSourceRecord?.source.id === record.source.id;

                return (
                  <button
                    key={record.source.id}
                    type="button"
                    className={`sources-record-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelectSource(record.source.id)}
                  >
                    <div className="sources-record-header">
                      <strong>{record.source.name}</strong>
                      <span className="entity-type-badge">
                        {formatSourceType(record.source.type)}
                      </span>
                    </div>
                    <span className="sources-record-meta">
                      {formatRightsStatus(record.source.usage_rights.status)} •{" "}
                      {record.linkedEvents.length} event
                      {record.linkedEvents.length === 1 ? "" : "s"} •{" "}
                      {record.linkedClaims.length} claim
                      {record.linkedClaims.length === 1 ? "" : "s"}
                    </span>
                    <span className="sources-record-copy">{record.source.citation}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section className="sources-section">
          <div className="sources-section-header">
            <h3>Claims In View</h3>
            <div className="sources-section-rule" />
          </div>
          <p className="muted-copy sources-section-copy">
            These cards represent modeled interpretation, chronology anchors, later tradition,
            or external attestation. They do not replace the base scripture summaries.
          </p>

          {claimRecords.length === 0 ? (
            <div className="empty-state" role="status">
              <h3>No claims in view</h3>
              <p>Adjust the active book or select a different event to restore claim context.</p>
            </div>
          ) : (
            <ul className="sources-claim-list">
              {claimRecords.map((claimRecord) => (
                <li key={claimRecord.claim.id} className="sources-claim-card">
                  <div className="sources-claim-header">
                    <div>
                      <p className="section-eyebrow">Claim Layer</p>
                      <strong>{formatClaimType(claimRecord.claim.claim_type)}</strong>
                    </div>
                    <span
                      className={`sources-confidence-badge confidence-${claimRecord.claim.confidence}`}
                    >
                      {formatClaimConfidence(claimRecord.claim.confidence)}
                    </span>
                  </div>

                  <p className="sources-claim-statement">{claimRecord.claim.statement}</p>
                  <p className="muted-copy">
                    {getClaimConfidenceDescription(claimRecord.claim.confidence)}
                  </p>

                  {claimRecord.relatedEvents.length > 0 ? (
                    <div className="sources-subsection">
                      <div className="section-header-row">
                        <h3>Linked events</h3>
                      </div>
                      <ul className="linked-record-list">
                        {claimRecord.relatedEvents.map((linkedEvent) => (
                          <li key={linkedEvent.id}>
                            <button
                              type="button"
                              className="linked-record-button"
                              onClick={() => onSelectEvent(linkedEvent.id)}
                            >
                              <strong>{linkedEvent.title}</strong>
                              <span>
                                {eventBookLabels.get(linkedEvent.id) ?? activeBookLabel} •{" "}
                                {formatDateRange(linkedEvent)} •{" "}
                                {linkedEvent.source_refs[0]?.citation ?? "Citation pending"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(claimRecord.relatedPeople.length > 0 || claimRecord.relatedPlaces.length > 0) ? (
                    <div className="sources-inline-metadata">
                      {claimRecord.relatedPeople.length > 0 ? (
                        <span>
                          People:{" "}
                          {claimRecord.relatedPeople.map((person) => person.name).join(", ")}
                        </span>
                      ) : null}
                      {claimRecord.relatedPlaces.length > 0 ? (
                        <span>
                          Places:{" "}
                          {claimRecord.relatedPlaces.map((place) => place.name).join(", ")}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="sources-citation-row">
                    {claimRecord.sourceEntries.map((sourceEntry) => (
                      <button
                        key={`${claimRecord.claim.id}-${sourceEntry.source.id}-${sourceEntry.citation}`}
                        type="button"
                        className={`sources-citation-badge ${
                          activeSourceRecord?.source.id === sourceEntry.source.id ? "is-active" : ""
                        }`}
                        onClick={() => handleSelectSource(sourceEntry.source.id)}
                      >
                        {sourceEntry.source.name} • {sourceEntry.citation}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="sources-section">
          <div className="sources-section-header">
            <h3>Rights & Use</h3>
            <div className="sources-section-rule" />
          </div>
          <p className="muted-copy sources-section-copy">
            Rights metadata is surfaced directly so later source additions can remain transparent
            about licensing, attribution, and review state.
          </p>
          <div className="sources-rights-grid">
            {Object.entries(rightsStatusCounts).map(([status, count]) => (
              <article key={status} className="metric-card">
                <span>{formatRightsStatus(status as Source["usage_rights"]["status"])}</span>
                <strong>{count}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="sources-section">
          <div className="sources-section-header">
            <h3>Confidence Framework</h3>
            <div className="sources-section-rule" />
          </div>
          <div className="sources-confidence-grid">
            {(["high", "medium", "low"] as const).map((confidence) => (
              <article key={confidence} className="sources-confidence-card">
                <div className="sources-claim-header">
                  <strong>{formatClaimConfidence(confidence)}</strong>
                  <span className={`sources-confidence-badge confidence-${confidence}`}>
                    {formatClaimConfidence(confidence)}
                  </span>
                </div>
                <p className="muted-copy">{getClaimConfidenceDescription(confidence)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
