import type { DatasetSchema, LiteraryUnitSchema } from "./schema";

export interface BookLiteraryCoverage {
  bookId: string;
  coveredPersonIds: string[];
  coveredPlaceIds: string[];
  missingPersonIds: string[];
  missingPlaceIds: string[];
  totalPeopleCount: number;
  totalPlacesCount: number;
}

function sortIds(ids: Iterable<string>): string[] {
  return [...ids].sort((leftId, rightId) => leftId.localeCompare(rightId));
}

function getLiteraryUnitsForBook(
  dataset: Pick<DatasetSchema, "literary_units">,
  bookId: string
): LiteraryUnitSchema[] {
  return dataset.literary_units.filter((literaryUnit) => literaryUnit.book_id === bookId);
}

export function collectBookLiteraryPersonIds(
  dataset: Pick<DatasetSchema, "literary_units">,
  book: Pick<
    DatasetSchema["books"][number],
    "id" | "sender_ids" | "co_sender_ids" | "recipient_person_ids" | "related_person_ids"
  >
): string[] {
  const relatedPeople = new Set<string>([
    ...book.sender_ids,
    ...book.co_sender_ids,
    ...book.recipient_person_ids,
    ...book.related_person_ids
  ]);

  getLiteraryUnitsForBook(dataset, book.id).forEach((literaryUnit) => {
    literaryUnit.participant_ids.forEach((personId) => relatedPeople.add(personId));
    literaryUnit.related_person_ids.forEach((personId) => relatedPeople.add(personId));
  });

  return sortIds(relatedPeople);
}

export function collectBookLiteraryPlaceIds(
  dataset: Pick<DatasetSchema, "literary_units">,
  book: Pick<
    DatasetSchema["books"][number],
    "id" | "composition_place_id" | "destination_place_id" | "recipient_place_ids" | "related_place_ids"
  >
): string[] {
  const relatedPlaces = new Set<string>([
    ...book.recipient_place_ids,
    ...book.related_place_ids
  ]);

  if (book.composition_place_id) {
    relatedPlaces.add(book.composition_place_id);
  }

  if (book.destination_place_id) {
    relatedPlaces.add(book.destination_place_id);
  }

  getLiteraryUnitsForBook(dataset, book.id).forEach((literaryUnit) => {
    if (literaryUnit.location_id) {
      relatedPlaces.add(literaryUnit.location_id);
    }

    literaryUnit.related_place_ids.forEach((placeId) => relatedPlaces.add(placeId));
  });

  return sortIds(relatedPlaces);
}

export function getDatasetBookLiteraryCoverage(
  dataset: Pick<DatasetSchema, "books" | "people" | "places" | "literary_units">
): BookLiteraryCoverage[] {
  const totalPersonIds = new Set(dataset.people.map((person) => person.id));
  const totalPlaceIds = new Set(dataset.places.map((place) => place.id));

  return dataset.books.map((book) => {
    const coveredPersonIds = collectBookLiteraryPersonIds(dataset, book);
    const coveredPlaceIds = collectBookLiteraryPlaceIds(dataset, book);
    const coveredPeopleSet = new Set(coveredPersonIds);
    const coveredPlacesSet = new Set(coveredPlaceIds);

    return {
      bookId: book.id,
      coveredPersonIds,
      coveredPlaceIds,
      missingPersonIds: sortIds(
        [...totalPersonIds].filter((personId) => !coveredPeopleSet.has(personId))
      ),
      missingPlaceIds: sortIds(
        [...totalPlaceIds].filter((placeId) => !coveredPlacesSet.has(placeId))
      ),
      totalPeopleCount: totalPersonIds.size,
      totalPlacesCount: totalPlaceIds.size
    };
  });
}
