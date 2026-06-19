import { z } from "zod";

const idPattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const idSchema = z
  .string()
  .trim()
  .regex(idPattern, "IDs must be lowercase snake_case.");

const nonEmptyString = z.string().trim().min(1, "Required.");
const optionalNonEmptyString = z.string().trim().min(1).optional();
const optionalUrlString = z.union([
  z.url(),
  z.literal("").transform(() => undefined)
]).optional();

export const dateCertaintySchema = z.enum([
  "explicit",
  "estimated",
  "approximate",
  "traditional",
  "disputed",
  "unknown"
]);

export const locationCertaintySchema = z.enum([
  "exact",
  "estimated",
  "approximate",
  "traditional",
  "disputed",
  "unknown"
]);

export const sourceTypeSchema = z.enum([
  "scripture",
  "historical",
  "archaeological",
  "commentary",
  "manuscript",
  "atlas",
  "scholarly_article",
  "book",
  "dataset"
]);

export const rightsStatusSchema = z.enum([
  "cleared",
  "restricted",
  "pending_review",
  "not_applicable",
  "unknown"
]);

export const confidenceSchema = z.enum(["low", "medium", "high"]);

export const usageRightsSchema = z
  .object({
    status: rightsStatusSchema,
    license_name: optionalNonEmptyString,
    license_url: optionalUrlString,
    terms_of_use_url: optionalUrlString,
    attribution_text: optionalNonEmptyString,
    usage_notes: optionalNonEmptyString,
    trademark_usage_note: optionalNonEmptyString,
    commercial_use_note: optionalNonEmptyString,
    requires_written_permission_for_commercial_use: z.boolean().optional()
  })
  .superRefine((value, ctx) => {
    const hasSupportingDetail = Boolean(
      value.license_name ??
        value.license_url ??
        value.terms_of_use_url ??
        value.attribution_text ??
        value.usage_notes ??
        value.trademark_usage_note ??
        value.commercial_use_note
    );

    if (value.status !== "unknown" && !hasSupportingDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "usage_rights must include license, terms, attribution, or usage notes when status is not 'unknown'."
      });
    }

    if (
      value.requires_written_permission_for_commercial_use &&
      !value.commercial_use_note
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "usage_rights.requires_written_permission_for_commercial_use requires a commercial_use_note."
      });
    }
  });

export const sourceRefSchema = z.object({
  source_id: idSchema,
  citation: nonEmptyString,
  note: optionalNonEmptyString
});

export const metadataSchema = z.object({
  dataset_id: idSchema,
  title: nonEmptyString,
  version: nonEmptyString,
  schema_version: nonEmptyString,
  description: optionalNonEmptyString,
  created: optionalNonEmptyString,
  updated: optionalNonEmptyString
});

export const bookTestamentSchema = z.enum(["old_testament", "new_testament"]);

export const bookCorpusSchema = z.enum([
  "gospel",
  "history",
  "pauline_epistle",
  "general_epistle",
  "apocalypse",
  "law",
  "wisdom",
  "poetry",
  "major_prophet",
  "minor_prophet",
  "other"
]);

export const sourceSchema = z.object({
  id: idSchema,
  name: nonEmptyString,
  type: sourceTypeSchema,
  citation: nonEmptyString,
  author: optionalNonEmptyString,
  publication_date: optionalNonEmptyString,
  url: optionalUrlString,
  usage_rights: usageRightsSchema
});

export const passageRangeSchema = z
  .object({
    start_chapter: z.number().int().positive(),
    start_verse: z.number().int().positive().optional(),
    end_chapter: z.number().int().positive(),
    end_verse: z.number().int().positive().optional()
  })
  .superRefine((value, ctx) => {
    if (value.start_chapter > value.end_chapter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passage ranges must not end before they begin."
      });
    }

    if (
      value.start_chapter === value.end_chapter &&
      value.start_verse !== undefined &&
      value.end_verse !== undefined &&
      value.start_verse > value.end_verse
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passage ranges within one chapter must not end before they begin."
      });
    }

    if (
      value.start_chapter === value.end_chapter &&
      (value.start_verse === undefined) !== (value.end_verse === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Single-chapter passage ranges must provide both start_verse and end_verse, or omit both."
      });
    }
  });

export const placeSchema = z.object({
  id: idSchema,
  name: nonEmptyString,
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  region: nonEmptyString,
  modern_country: nonEmptyString,
  location_certainty: locationCertaintySchema,
  summary: optionalNonEmptyString,
  source_refs: z.array(sourceRefSchema).min(1).optional()
});

export const personSchema = z.object({
  id: idSchema,
  name: nonEmptyString,
  aliases: z.array(nonEmptyString).default([]),
  role: optionalNonEmptyString,
  summary: optionalNonEmptyString,
  source_refs: z.array(sourceRefSchema).min(1).optional()
});

export const tagSchema = z.object({
  id: idSchema,
  label: nonEmptyString,
  description: optionalNonEmptyString,
  group: optionalNonEmptyString
});

export const dateRangeSchema = z
  .object({
    start_year: z.number().int().nullable(),
    end_year: z.number().int().nullable(),
    certainty: dateCertaintySchema
  })
  .superRefine((value, ctx) => {
    const hasStart = value.start_year !== null;
    const hasEnd = value.end_year !== null;

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dates must provide both start_year and end_year, or both null."
      });
    }

    if (
      value.start_year !== null &&
      value.end_year !== null &&
      value.start_year > value.end_year
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "start_year must be less than or equal to end_year."
      });
    }

    if (
      value.certainty === "unknown" &&
      (value.start_year !== null || value.end_year !== null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unknown dates must use null start_year and end_year."
      });
    }
  });

export const bookSchema = z.object({
  id: idSchema,
  label: nonEmptyString,
  title: nonEmptyString,
  testament: bookTestamentSchema,
  canonical_order: z.number().int().positive(),
  corpus: bookCorpusSchema,
  genre: z.array(nonEmptyString).min(1),
  summary: optionalNonEmptyString,
  authorship_note: optionalNonEmptyString,
  primary_source_id: idSchema,
  composition_date: dateRangeSchema.optional(),
  composition_place_id: idSchema.optional(),
  destination_place_id: idSchema.optional(),
  sender_ids: z.array(idSchema).default([]),
  co_sender_ids: z.array(idSchema).default([]),
  recipient_person_ids: z.array(idSchema).default([]),
  recipient_place_ids: z.array(idSchema).default([]),
  recipient_group: optionalNonEmptyString,
  dispatch_note: optionalNonEmptyString,
  source_refs: z.array(sourceRefSchema).min(1)
});

export const eventSchema = z.object({
  id: idSchema,
  title: nonEmptyString,
  summary: nonEmptyString,
  date: dateRangeSchema,
  location_id: idSchema,
  participants: z.array(idSchema).default([]),
  tag_ids: z.array(idSchema).default([]),
  source_refs: z.array(sourceRefSchema).min(1),
  related_event_ids: z.array(idSchema).default([]),
  journey_id: idSchema.optional(),
  notes: optionalNonEmptyString
});

export const journeyRoutePointSchema = z.object({
  sequence: z.number().int().positive(),
  place_id: idSchema,
  notes: optionalNonEmptyString
});

export const journeySchema = z.object({
  id: idSchema,
  title: nonEmptyString,
  summary: optionalNonEmptyString,
  date: dateRangeSchema,
  source_refs: z.array(sourceRefSchema).min(1),
  route: z.array(journeyRoutePointSchema).min(1),
  related_event_ids: z.array(idSchema).default([])
});

export const relationshipEntityTypeSchema = z.enum([
  "book",
  "person",
  "place",
  "event",
  "journey",
  "source",
  "tag",
  "literary_unit"
]);

export const relationshipSchema = z.object({
  id: idSchema,
  from_type: relationshipEntityTypeSchema,
  from_id: idSchema,
  to_type: relationshipEntityTypeSchema,
  to_id: idSchema,
  relationship_type: nonEmptyString,
  source_refs: z.array(sourceRefSchema).min(1),
  notes: optionalNonEmptyString
});

export const claimSchema = z.object({
  id: idSchema,
  statement: nonEmptyString,
  claim_type: nonEmptyString,
  confidence: confidenceSchema,
  related_event_ids: z.array(idSchema).default([]),
  related_person_ids: z.array(idSchema).default([]),
  related_place_ids: z.array(idSchema).default([]),
  source_refs: z.array(sourceRefSchema).min(1)
});

export const literaryUnitTypeSchema = z.enum([
  "prologue",
  "narrative",
  "pericope",
  "discourse",
  "parable",
  "miracle_cycle",
  "letter_opening",
  "argument",
  "vision",
  "trial",
  "travel_notice",
  "epilogue"
]);

export const literaryUnitSchema = z.object({
  id: idSchema,
  book_id: idSchema,
  title: nonEmptyString,
  unit_type: literaryUnitTypeSchema,
  passage: passageRangeSchema,
  summary: nonEmptyString,
  location_id: idSchema.optional(),
  participant_ids: z.array(idSchema).default([]),
  related_event_ids: z.array(idSchema).default([]),
  source_refs: z.array(sourceRefSchema).min(1),
  notes: optionalNonEmptyString
});

export const datasetSchema = z.object({
  metadata: metadataSchema,
  books: z.array(bookSchema).min(1),
  sources: z.array(sourceSchema),
  places: z.array(placeSchema),
  people: z.array(personSchema),
  events: z.array(eventSchema),
  journeys: z.array(journeySchema),
  relationships: z.array(relationshipSchema),
  tags: z.array(tagSchema),
  literary_units: z.array(literaryUnitSchema).default([]),
  claims: z.array(claimSchema).default([])
});

export type SourceRefSchema = z.infer<typeof sourceRefSchema>;
export type BookSchema = z.infer<typeof bookSchema>;
export type PlaceSchema = z.infer<typeof placeSchema>;
export type EventSchema = z.infer<typeof eventSchema>;
export type JourneySchema = z.infer<typeof journeySchema>;
export type RelationshipSchema = z.infer<typeof relationshipSchema>;
export type ClaimSchema = z.infer<typeof claimSchema>;
export type LiteraryUnitSchema = z.infer<typeof literaryUnitSchema>;
export type DatasetSchema = z.infer<typeof datasetSchema>;
