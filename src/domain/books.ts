import type {
  Book,
  CanonicalDataset,
  Event,
  LiteraryUnit,
  Person,
  Place,
  Source
} from "./dataset";
import type { DatasetIndex } from "./events";

export type BookNarrativeSemanticId = "sign" | "discourse" | "feast";

export interface BookNarrativeSemantic {
  description: string;
  eventCount: number;
  id: BookNarrativeSemanticId;
  label: string;
  sampleEventTitles: string[];
  tagLabels: string[];
}

const bookNarrativeSemanticDefinitions: Record<
  BookNarrativeSemanticId,
  Pick<BookNarrativeSemantic, "description" | "id" | "label">
> = {
  sign: {
    id: "sign",
    label: "Signs",
    description:
      "Public acts presented as revelatory works rather than isolated miracles alone."
  },
  discourse: {
    id: "discourse",
    label: "Discourses",
    description:
      "Extended speech scenes that carry theological explanation and narrative interpretation."
  },
  feast: {
    id: "feast",
    label: "Feast-Linked Chronology",
    description:
      "Festival settings that help anchor chronology, symbolism, and public conflict."
  }
};

function comparePassagePart(leftValue: number | undefined, rightValue: number | undefined): number {
  return (leftValue ?? 0) - (rightValue ?? 0);
}

export function getPrimaryScopeBook(dataset: Pick<CanonicalDataset, "books">): Book | null {
  return dataset.books.length === 1 ? dataset.books[0] ?? null : null;
}

export function getBookById(
  dataset: Pick<CanonicalDataset, "books">,
  bookId: string
): Book | null {
  return dataset.books.find((book) => book.id === bookId) ?? null;
}

export function getLiteraryUnitsForBook(
  dataset: Pick<CanonicalDataset, "literary_units">,
  bookId: string
): LiteraryUnit[] {
  return [...dataset.literary_units]
    .filter((literaryUnit) => literaryUnit.book_id === bookId)
    .sort((leftUnit, rightUnit) => {
      const chapterDifference =
        leftUnit.passage.start_chapter - rightUnit.passage.start_chapter;

      if (chapterDifference !== 0) {
        return chapterDifference;
      }

      const verseDifference = comparePassagePart(
        leftUnit.passage.start_verse,
        rightUnit.passage.start_verse
      );

      if (verseDifference !== 0) {
        return verseDifference;
      }

      return leftUnit.id.localeCompare(rightUnit.id);
    });
}

export function formatBookCorpus(corpus: Book["corpus"]): string {
  switch (corpus) {
    case "gospel":
      return "Gospel";
    case "history":
      return "History";
    case "pauline_epistle":
      return "Pauline Epistle";
    case "general_epistle":
      return "General Epistle";
    case "apocalypse":
      return "Apocalypse";
    case "law":
      return "Law";
    case "wisdom":
      return "Wisdom";
    case "poetry":
      return "Poetry";
    case "major_prophet":
      return "Major Prophet";
    case "minor_prophet":
      return "Minor Prophet";
    case "other":
      return "Other";
    default:
      return corpus;
  }
}

export function formatPassageRange(literaryUnit: LiteraryUnit): string {
  const { start_chapter, start_verse, end_chapter, end_verse } = literaryUnit.passage;

  if (start_chapter === end_chapter) {
    if (start_verse !== undefined && end_verse !== undefined) {
      return `${start_chapter}:${start_verse}-${end_verse}`;
    }

    return `${start_chapter}`;
  }

  const startLabel =
    start_verse !== undefined ? `${start_chapter}:${start_verse}` : `${start_chapter}`;
  const endLabel = end_verse !== undefined ? `${end_chapter}:${end_verse}` : `${end_chapter}`;

  return `${startLabel}-${endLabel}`;
}

export function getBookCompositionPlace(book: Book, index: DatasetIndex): Place | null {
  if (!book.composition_place_id) {
    return null;
  }

  return index.placesById.get(book.composition_place_id) ?? null;
}

export function getBookDestinationPlace(book: Book, index: DatasetIndex): Place | null {
  if (!book.destination_place_id) {
    return null;
  }

  return index.placesById.get(book.destination_place_id) ?? null;
}

export function getBookSenders(book: Book, index: DatasetIndex): Person[] {
  return book.sender_ids.flatMap((senderId) => {
    const sender = index.peopleById.get(senderId);
    return sender ? [sender] : [];
  });
}

export function getBookCoSenders(book: Book, index: DatasetIndex): Person[] {
  return book.co_sender_ids.flatMap((senderId) => {
    const sender = index.peopleById.get(senderId);
    return sender ? [sender] : [];
  });
}

export function getBookRecipientPeople(book: Book, index: DatasetIndex): Person[] {
  return book.recipient_person_ids.flatMap((recipientId) => {
    const recipient = index.peopleById.get(recipientId);
    return recipient ? [recipient] : [];
  });
}

export function getBookRecipientPlaces(book: Book, index: DatasetIndex): Place[] {
  return book.recipient_place_ids.flatMap((placeId) => {
    const place = index.placesById.get(placeId);
    return place ? [place] : [];
  });
}

export function getPrimarySourceForBook(book: Book, index: DatasetIndex): Source | null {
  return index.sourcesById.get(book.primary_source_id) ?? null;
}

export function isLetterLikeBook(book: Book): boolean {
  return (
    book.corpus === "pauline_epistle" ||
    book.corpus === "general_epistle" ||
    book.sender_ids.length > 0 ||
    book.co_sender_ids.length > 0 ||
    book.recipient_person_ids.length > 0 ||
    book.recipient_place_ids.length > 0 ||
    Boolean(book.recipient_group)
  );
}

export function getBookNarrativeSemantics(
  events: Event[],
  index: DatasetIndex
): BookNarrativeSemantic[] {
  const eventIdsBySemanticId = new Map<BookNarrativeSemanticId, Set<string>>();
  const tagLabelsBySemanticId = new Map<BookNarrativeSemanticId, Set<string>>();

  events.forEach((event) => {
    event.tag_ids.forEach((tagId) => {
      const tag = index.tagsById.get(tagId);
      if (!tag) {
        return;
      }

      const semanticId =
        tag.group === "sign" || tag.group === "discourse" || tag.group === "feast"
          ? tag.group
          : null;

      if (!semanticId) {
        return;
      }

      const eventIds = eventIdsBySemanticId.get(semanticId) ?? new Set<string>();
      eventIds.add(event.id);
      eventIdsBySemanticId.set(semanticId, eventIds);

      const tagLabels = tagLabelsBySemanticId.get(semanticId) ?? new Set<string>();
      tagLabels.add(tag.label);
      tagLabelsBySemanticId.set(semanticId, tagLabels);
    });
  });

  return (Object.keys(bookNarrativeSemanticDefinitions) as BookNarrativeSemanticId[])
    .filter((semanticId) => (eventIdsBySemanticId.get(semanticId)?.size ?? 0) > 0)
    .map((semanticId) => {
      const definition = bookNarrativeSemanticDefinitions[semanticId];
      const matchingEvents = events.filter((event) =>
        event.tag_ids.some((tagId) => index.tagsById.get(tagId)?.group === semanticId)
      );

      return {
        ...definition,
        eventCount: eventIdsBySemanticId.get(semanticId)?.size ?? 0,
        sampleEventTitles: matchingEvents.slice(0, 3).map((event) => event.title),
        tagLabels: Array.from(tagLabelsBySemanticId.get(semanticId) ?? [])
      };
    });
}
