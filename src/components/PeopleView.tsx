import { useDeferredValue, useEffect, useState } from "react";

import type { CanonicalDataset, Event, Relationship } from "../domain/dataset";
import {
  formatDateRange,
  formatSourceType,
  type DatasetIndex
} from "../domain/events";
import {
  buildPeopleExplorerRecords,
  filterPeopleExplorerRecords,
  getDefaultPersonIdForEvent,
  getPersonExplorerProfile
} from "../domain/people";

interface PeopleViewProps {
  dataset: CanonicalDataset;
  event: Event;
  focusedPersonId: string | null;
  index: DatasetIndex;
  onFocusPerson: (personId: string) => void;
  onFocusPlace: (placeId: string) => void;
  onSelectEvent: (eventId: string) => void;
  selectedEventId: string;
}

function getRelationshipActionLabel(
  entityType: Relationship["from_type"] | Relationship["to_type"]
): string {
  switch (entityType) {
    case "person":
      return "Open person focus";
    case "place":
      return "Open place focus";
    case "event":
      return "Open related event";
    case "journey":
      return "Journey record";
    case "source":
      return "Source record";
    case "tag":
      return "Tag record";
    default:
      return "Open record";
  }
}

export function PeopleView({
  dataset,
  event,
  focusedPersonId,
  index,
  onFocusPerson,
  onFocusPlace,
  onSelectEvent,
  selectedEventId
}: PeopleViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const peopleRecords = buildPeopleExplorerRecords(dataset, index);
  const filteredPeopleRecords = filterPeopleExplorerRecords(peopleRecords, deferredSearchQuery);
  const fallbackPersonId =
    focusedPersonId ??
    getDefaultPersonIdForEvent(event, index) ??
    peopleRecords[0]?.person.id ??
    null;
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(fallbackPersonId);

  useEffect(() => {
    if (focusedPersonId) {
      setSelectedPersonId(focusedPersonId);
    }
  }, [focusedPersonId]);

  useEffect(() => {
    if (!selectedPersonId) {
      setSelectedPersonId(fallbackPersonId);
      return;
    }

    const selectedPersonExists = peopleRecords.some(
      (peopleRecord) => peopleRecord.person.id === selectedPersonId
    );

    if (!selectedPersonExists) {
      setSelectedPersonId(fallbackPersonId);
    }
  }, [fallbackPersonId, peopleRecords, selectedPersonId]);

  const selectedProfile = selectedPersonId
    ? getPersonExplorerProfile(selectedPersonId, dataset, index)
    : null;
  const selectedPersonHidden =
    selectedProfile !== null &&
    !filteredPeopleRecords.some((peopleRecord) => peopleRecord.person.id === selectedProfile.person.id);
  const selectedPersonSourceEntries =
    selectedProfile?.person.source_refs?.flatMap((sourceRef) => {
      const source = index.sourcesById.get(sourceRef.source_id);
      return source ? [{ source, sourceRef }] : [];
    }) ?? [];
  const appearanceCountByPlaceId = new Map<string, number>();

  selectedProfile?.appearances.forEach((appearance) => {
    const currentCount = appearanceCountByPlaceId.get(appearance.location_id) ?? 0;
    appearanceCountByPlaceId.set(appearance.location_id, currentCount + 1);
  });

  function handleSelectPerson(personId: string): void {
    setSelectedPersonId(personId);
    onFocusPerson(personId);
  }

  function handleRelationshipAction(
    relatedEntityType: Relationship["from_type"] | Relationship["to_type"],
    relatedEntityId: string
  ): void {
    switch (relatedEntityType) {
      case "person":
        handleSelectPerson(relatedEntityId);
        return;
      case "place":
        onFocusPlace(relatedEntityId);
        return;
      case "event":
        onSelectEvent(relatedEntityId);
        return;
      default:
        return;
    }
  }

  return (
    <section className="people-view" aria-label="Acts people explorer">
      <div className="people-toolbar">
        <div className="people-counts">
          <span className="people-count-pill">
            {filteredPeopleRecords.length} of {peopleRecords.length} people visible
          </span>
          <span className="people-count-pill">Acts biographical catalog</span>
        </div>
      </div>

      <div className="people-layout">
        <aside className="people-list-panel">
          <label className="people-search-field">
            <span>Search people</span>
            <input
              type="search"
              className="people-search-input"
              aria-label="Search people"
              placeholder="Search names, aliases, and roles"
              value={searchQuery}
              onChange={(searchEvent) => setSearchQuery(searchEvent.currentTarget.value)}
            />
          </label>

          {filteredPeopleRecords.length === 0 ? (
            <div className="empty-state people-empty-list" role="status">
              <h3>No people match this search</h3>
              <p>Try a person name, alias, or role from the Acts dataset.</p>
            </div>
          ) : (
            <ul className="people-record-list" aria-label="People results">
              {filteredPeopleRecords.map((peopleRecord) => {
                const isSelected = selectedProfile?.person.id === peopleRecord.person.id;

                return (
                  <li key={peopleRecord.person.id}>
                    <button
                      type="button"
                      className={`people-record-button ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => handleSelectPerson(peopleRecord.person.id)}
                    >
                      <div className="people-record-header">
                        <strong>{peopleRecord.person.name}</strong>
                        <span className="people-record-badge">
                          {peopleRecord.appearanceCount} event
                          {peopleRecord.appearanceCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <span className="people-record-role">
                        {peopleRecord.person.role ?? "Role not specified"}
                      </span>
                      {peopleRecord.person.aliases.length > 0 ? (
                        <span className="people-record-aliases">
                          Also: {peopleRecord.person.aliases.join(", ")}
                        </span>
                      ) : null}
                      <div className="people-record-meta">
                        <span>{peopleRecord.placeCount} place{peopleRecord.placeCount === 1 ? "" : "s"}</span>
                        <span>
                          {peopleRecord.relationshipCount} relationship
                          {peopleRecord.relationshipCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="people-detail-panel">
          {selectedPersonHidden ? (
            <p className="helper-note people-hidden-note" role="status">
              The selected person is outside the active people search results.
            </p>
          ) : null}

          {selectedProfile ? (
            <div className="people-detail-stack">
              <div className="people-detail-card">
                <p className="people-detail-eyebrow">Biographical Record</p>
                <div className="people-detail-header">
                  <div>
                    <h3>{selectedProfile.person.name}</h3>
                    <p className="people-detail-aliases">
                      {selectedProfile.person.aliases.length > 0
                        ? `Also known as ${selectedProfile.person.aliases.join(" · ")}`
                        : "No aliases recorded"}
                    </p>
                  </div>
                  <span className="entity-type-badge">
                    {selectedProfile.person.role ?? "Role not specified"}
                  </span>
                </div>

                <div className="people-badge-row">
                  <span className="people-stat-badge">
                    {selectedProfile.appearances.length} appearance
                    {selectedProfile.appearances.length === 1 ? "" : "s"}
                  </span>
                  <span className="people-stat-badge">
                    {selectedProfile.relatedPlaces.length} related place
                    {selectedProfile.relatedPlaces.length === 1 ? "" : "s"}
                  </span>
                  <span className="people-stat-badge">
                    {selectedProfile.relationshipConnections.length} normalized connection
                    {selectedProfile.relationshipConnections.length === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="people-detail-summary">
                  {selectedProfile.person.summary ?? "No person summary has been modeled yet."}
                </p>
              </div>

              <section className="people-section">
                <div className="section-header-row">
                  <h3>Acts appearances</h3>
                </div>
                {selectedProfile.appearances.length === 0 ? (
                  <p className="muted-copy">No Acts appearances are linked to this person yet.</p>
                ) : (
                  <ul className="linked-record-list">
                    {selectedProfile.appearances.map((appearance) => {
                      const place = index.placesById.get(appearance.location_id);
                      const isSelectedEvent = appearance.id === selectedEventId;

                      return (
                        <li key={appearance.id}>
                          <button
                            type="button"
                            className={`linked-record-button ${isSelectedEvent ? "is-selected" : ""}`}
                            onClick={() => onSelectEvent(appearance.id)}
                          >
                            <strong>{appearance.title}</strong>
                            <span>
                              {formatDateRange(appearance)} • {place?.name ?? "Unknown place"} •{" "}
                              {appearance.source_refs[0]?.citation ?? "Citation pending"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="people-section">
                <div className="section-header-row">
                  <h3>Related places</h3>
                </div>
                {selectedProfile.relatedPlaces.length === 0 ? (
                  <p className="muted-copy">No related places are linked through Acts appearances.</p>
                ) : (
                  <ul className="linked-record-list">
                    {selectedProfile.relatedPlaces.map((place) => (
                      <li key={place.id}>
                        <button
                          type="button"
                          className="linked-record-button"
                          onClick={() => onFocusPlace(place.id)}
                        >
                          <strong>{place.name}</strong>
                          <span>
                            {place.region}, {place.modern_country} •{" "}
                            {appearanceCountByPlaceId.get(place.id) ?? 0} appearance
                            {(appearanceCountByPlaceId.get(place.id) ?? 0) === 1 ? "" : "s"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="people-section">
                <div className="section-header-row">
                  <h3>Relationship network</h3>
                </div>
                {selectedProfile.relationshipConnections.length === 0 ? (
                  <p className="muted-copy">
                    No normalized relationship records point to this person yet.
                  </p>
                ) : (
                  <ul className="people-relationship-list">
                    {selectedProfile.relationshipConnections.map((connection) => {
                      const relationshipActionable = ["person", "place", "event"].includes(
                        connection.relatedEntityType
                      );

                      return (
                        <li key={connection.id} className="people-relationship-card">
                          <div className="people-relationship-header">
                            <div>
                              <strong>{connection.relatedEntityLabel}</strong>
                              <span className="entity-subtitle">
                                {connection.relationshipTypeLabel} • {connection.relatedEntitySubtitle}
                              </span>
                            </div>
                            <span className="people-relationship-direction">
                              {connection.direction}
                            </span>
                          </div>
                          <p className="people-relationship-citation">
                            {connection.citation}
                            {connection.notes ? ` • ${connection.notes}` : ""}
                          </p>
                          {relationshipActionable ? (
                            <button
                              type="button"
                              className="detail-action-button"
                              onClick={() =>
                                handleRelationshipAction(
                                  connection.relatedEntityType,
                                  connection.relatedEntityId
                                )
                              }
                            >
                              {getRelationshipActionLabel(connection.relatedEntityType)}
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="citation-block people-section">
                <div className="section-header-row">
                  <h3>Record support</h3>
                  <span className="entity-meta">
                    {selectedPersonSourceEntries.length} citation
                    {selectedPersonSourceEntries.length === 1 ? "" : "s"}
                  </span>
                </div>
                {selectedPersonSourceEntries.length === 0 ? (
                  <p className="muted-copy">
                    No source support is attached to this person record yet.
                  </p>
                ) : (
                  <ul className="citation-list">
                    {selectedPersonSourceEntries.map(({ source, sourceRef }) => (
                      <li
                        key={`${selectedProfile.person.id}-${source.id}-${sourceRef.citation}`}
                      >
                        <strong>{source.name}</strong>
                        <span>
                          {sourceRef.citation} • {formatSourceType(source.type)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <div className="empty-state" role="status">
              <h3>No person is currently selected</h3>
              <p>Select a person or use an event detail link to open a biographical record.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
