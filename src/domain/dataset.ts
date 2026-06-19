import { z } from "zod";

import {
  bookSchema,
  claimSchema,
  datasetSchema,
  eventSchema,
  journeySchema,
  literaryUnitSchema,
  metadataSchema,
  personSchema,
  placeSchema,
  relationshipSchema,
  sourceSchema,
  tagSchema,
  usageRightsSchema
} from "../data/schema";

export type Metadata = z.infer<typeof metadataSchema>;
export type UsageRights = z.infer<typeof usageRightsSchema>;
export type Book = z.infer<typeof bookSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Person = z.infer<typeof personSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Journey = z.infer<typeof journeySchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type LiteraryUnit = z.infer<typeof literaryUnitSchema>;
export type CanonicalDataset = z.infer<typeof datasetSchema>;
