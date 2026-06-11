import type {
  CanonicalDataset,
  Event,
  Person,
  Place,
  Relationship
} from "./dataset";
import { getEventsForPerson, type DatasetIndex } from "./events";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

export interface PersonExplorerRecord {
  appearanceCount: number;
  person: Person;
  placeCount: number;
  relationshipCount: number;
}

export interface PersonRelationshipConnection {
  citation: string;
  direction: "incoming" | "outgoing";
  id: string;
  notes?: string;
  relatedEntityId: string;
  relatedEntityLabel: string;
  relatedEntitySubtitle: string;
  relatedEntityType: Relationship["from_type"] | Relationship["to_type"];
  relationshipType: string;
  relationshipTypeLabel: string;
}

export interface PersonExplorerProfile {
  appearances: Event[];
  person: Person;
  relatedPlaces: Place[];
  relationshipConnections: PersonRelationshipConnection[];
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getPersonSearchDocument(record: PersonExplorerRecord): string {
  return normalizeSearchText(
    [
      record.person.name,
      record.person.aliases.join(" "),
      record.person.role ?? "",
      record.person.summary ?? ""
    ].join(" ")
  );
}

function isPersonRelationshipForId(
  relationship: Relationship,
  personId: string
): boolean {
  return (
    (relationship.from_type === "person" && relationship.from_id === personId) ||
    (relationship.to_type === "person" && relationship.to_id === personId)
  );
}

function getUniquePlacesForEvents(events: Event[], index: DatasetIndex): Place[] {
  const placesById = new Map<string, Place>();

  events.forEach((event) => {
    const place = index.placesById.get(event.location_id);

    if (place && !placesById.has(place.id)) {
      placesById.set(place.id, place);
    }
  });

  return Array.from(placesById.values()).sort((leftPlace, rightPlace) =>
    collator.compare(leftPlace.name, rightPlace.name)
  );
}

function getRelatedEntityMetadata(
  entityType: Relationship["from_type"] | Relationship["to_type"],
  entityId: string,
  index: DatasetIndex
): {
  label: string;
  subtitle: string;
} {
  switch (entityType) {
    case "person": {
      const person = index.peopleById.get(entityId);
      return {
        label: person?.name ?? entityId,
        subtitle: person?.role ?? "Person record"
      };
    }
    case "place": {
      const place = index.placesById.get(entityId);
      return {
        label: place?.name ?? entityId,
        subtitle: place ? `${place.region}, ${place.modern_country}` : "Place record"
      };
    }
    case "event": {
      const event = index.eventsById.get(entityId);
      return {
        label: event?.title ?? entityId,
        subtitle: event?.source_refs[0]?.citation ?? "Event record"
      };
    }
    case "journey": {
      const journey = index.journeysById.get(entityId);
      return {
        label: journey?.title ?? entityId,
        subtitle: journey?.source_refs[0]?.citation ?? "Journey record"
      };
    }
    case "source": {
      const source = index.sourcesById.get(entityId);
      return {
        label: source?.name ?? entityId,
        subtitle: source?.citation ?? "Source record"
      };
    }
    case "tag": {
      const tag = index.tagsById.get(entityId);
      return {
        label: tag?.label ?? entityId,
        subtitle: tag?.description ?? "Tag record"
      };
    }
    default:
      return {
        label: entityId,
        subtitle: "Related record"
      };
  }
}

export function formatRelationshipType(relationshipType: string): string {
  return relationshipType
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getDefaultPersonIdForEvent(
  event: Event,
  index: DatasetIndex
): string | null {
  return event.participants.find((participantId) => index.peopleById.has(participantId)) ?? null;
}

export function buildPeopleExplorerRecords(
  dataset: CanonicalDataset,
  index: DatasetIndex
): PersonExplorerRecord[] {
  return [...dataset.people]
    .map((person) => {
      const appearances = getEventsForPerson(person.id, dataset.events);
      const relationships = dataset.relationships.filter((relationship) =>
        isPersonRelationshipForId(relationship, person.id)
      );

      return {
        person,
        appearanceCount: appearances.length,
        placeCount: getUniquePlacesForEvents(appearances, index).length,
        relationshipCount: relationships.length
      };
    })
    .sort((leftRecord, rightRecord) => {
      if (leftRecord.appearanceCount !== rightRecord.appearanceCount) {
        return rightRecord.appearanceCount - leftRecord.appearanceCount;
      }

      return collator.compare(leftRecord.person.name, rightRecord.person.name);
    });
}

export function filterPeopleExplorerRecords(
  records: PersonExplorerRecord[],
  query: string
): PersonExplorerRecord[] {
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length === 0) {
    return records;
  }

  return records.filter((record) =>
    getPersonSearchDocument(record).includes(normalizedQuery)
  );
}

export function getPersonRelationshipConnections(
  personId: string,
  dataset: CanonicalDataset,
  index: DatasetIndex
): PersonRelationshipConnection[] {
  return dataset.relationships
    .flatMap((relationship) => {
      const isOutgoing =
        relationship.from_type === "person" && relationship.from_id === personId;
      const isIncoming = relationship.to_type === "person" && relationship.to_id === personId;

      if (!isOutgoing && !isIncoming) {
        return [];
      }

      const relatedEntityType = isOutgoing ? relationship.to_type : relationship.from_type;
      const relatedEntityId = isOutgoing ? relationship.to_id : relationship.from_id;
      const metadata = getRelatedEntityMetadata(relatedEntityType, relatedEntityId, index);
      const connection: PersonRelationshipConnection = {
        id: relationship.id,
        citation: relationship.source_refs[0]?.citation ?? "Citation pending",
        direction: isOutgoing ? "outgoing" : "incoming",
        relatedEntityId,
        relatedEntityLabel: metadata.label,
        relatedEntitySubtitle: metadata.subtitle,
        relatedEntityType,
        relationshipType: relationship.relationship_type,
        relationshipTypeLabel: formatRelationshipType(relationship.relationship_type)
      };

      if (relationship.notes) {
        connection.notes = relationship.notes;
      }

      return [connection];
    })
    .sort((leftConnection, rightConnection) => {
      const labelDifference = collator.compare(
        leftConnection.relatedEntityLabel,
        rightConnection.relatedEntityLabel
      );

      if (labelDifference !== 0) {
        return labelDifference;
      }

      return collator.compare(
        leftConnection.relationshipTypeLabel,
        rightConnection.relationshipTypeLabel
      );
    });
}

export function getPersonExplorerProfile(
  personId: string,
  dataset: CanonicalDataset,
  index: DatasetIndex
): PersonExplorerProfile | null {
  const person = index.peopleById.get(personId);

  if (!person) {
    return null;
  }

  const appearances = getEventsForPerson(person.id, dataset.events);

  return {
    person,
    appearances,
    relatedPlaces: getUniquePlacesForEvents(appearances, index),
    relationshipConnections: getPersonRelationshipConnections(person.id, dataset, index)
  };
}
