# AGENTS.md

# Codex Instructions for Bible Time & Place Explorer

## Mission

Design and implement Bible Time & Place Explorer as a source-grounded, testable, extensible application for exploring biblical events across time and geography.

The first working product should focus on the Book of Acts. Every implementation choice should support the long-term goal of expanding to other biblical books and external historical sources without sacrificing referential integrity, verification, or maintainability.

---

## Operating Principles

### 1. Verify Before Rendering

Never assume data is valid just because it loads.

Before rendering any dataset, validate:

- Required fields exist.
- IDs are unique.
- References resolve.
- Coordinates are valid.
- Dates are parseable.
- Source references exist.
- Journey route points reference known places.
- Relationship endpoints reference known entities.

Invalid data should produce clear validation errors and should not silently fail in the UI.

---

### 2. Source Every Claim

Every event, journey, relationship, place assertion, or interpretive claim must have source attribution.

Minimum source requirement for an event:

```yaml
source_refs:
  - source_id: acts
    citation: Acts 1:1-11
```

Do not create records that make unsupported claims.

If a claim is inferred, traditional, approximate, or disputed, explicitly model that uncertainty.

Example:

```yaml
date:
  start_year: 30
  end_year: 30
  certainty: estimated
```

Example:

```yaml
location_certainty: traditional
```

Example:

```yaml
claim_type: scholarly_interpretation
confidence: medium
```

---

### 3. Preserve Referential Integrity

Data should be normalized.

Events should reference people, places, and sources by ID rather than duplicating names.

Good:

```yaml
location_id: jerusalem
participants:
  - peter
  - john
```

Avoid:

```yaml
location: Jerusalem
participants:
  - Peter
  - John
```

This enables maps, timelines, graph views, search, filtering, and cross-book integration.

---

### 4. Keep Releases Narrow

Every release should have a small, clear purpose.

A good release might include:

- Add event detail panel.
- Add person filter.
- Add validation for missing participants.
- Add 5 new Acts events.

A bad release combines:

- UI redesign
- schema rewrite
- new dataset
- backend migration
- external source ingestion
- authentication

Do not expand scope without a specific reason.

---

### 5. Respect Translation Licensing

Default to citation-backed records, summaries, and modeled metadata rather than embedded Bible translation text.

If the project later displays direct `ESV` text without separate written permission, keep the release within Crossway's published quotation limits:

- No more than `500` consecutive verses.
- Less than one-half of any single biblical book.
- Less than `25%` of the total text of the work in which the quotation appears.

If any direct `ESV` quotation is shown:

- Track the usage in source metadata and release review notes.
- Render the required attribution in the appropriate UI or export surface.
- Mark quotations with `(ESV)` when the shorter non-saleable digital-media rule applies.

Do not use the `ESV` name, `English Standard Version`, `Global Study Bible`, or the ESV logo as branding assets without prior permission.

If the app ever becomes a commercial commentary or Bible reference work that uses `ESV` text, written permission is required before release.

---

## Recommended Architecture

### Initial Application

Use a static-first architecture:

- React
- TypeScript
- Vite
- YAML data files
- Zod or JSON Schema validation
- MapLibre GL JS or Leaflet
- Vitest
- React Testing Library
- Playwright later for end-to-end tests

Do not add a backend until the product needs dynamic writes, user-generated content, search indexing, or contribution workflows.

---

## Suggested Directory Structure

```text
/
├── AGENTS.md
├── STRATEGY.md
├── README.md
├── package.json
├── src/
│   ├── app/
│   ├── components/
│   │   ├── MapView/
│   │   ├── TimelineView/
│   │   ├── EventDetail/
│   │   ├── Filters/
│   │   └── SourceCitation/
│   ├── data/
│   │   ├── loadDataset.ts
│   │   ├── validateDataset.ts
│   │   └── schema.ts
│   ├── domain/
│   │   ├── events.ts
│   │   ├── places.ts
│   │   ├── people.ts
│   │   ├── journeys.ts
│   │   └── relationships.ts
│   ├── telemetry/
│   │   └── events.ts
│   └── tests/
├── data/
│   ├── acts.yaml
│   ├── luke.yaml
│   └── shared/
│       ├── places.yaml
│       ├── people.yaml
│       └── sources.yaml
└── scripts/
    └── validate-data.ts
```

---

## Data Design Rules

### Required Top-Level Collections

Support these collections:

```yaml
metadata:
sources:
places:
people:
events:
journeys:
relationships:
tags:
```

Future collections may include:

```yaml
organizations:
artifacts:
media:
claims:
manuscripts:
bibliography:
```

---

## ID Conventions

Use stable, lowercase, snake_case IDs.

Examples:

```text
acts_001
jerusalem
paul
cornelius
missionary_journey_1
```

Do not use display names as primary keys.

Good:

```yaml
id: james_brother_of_jesus
name: James
aliases:
  - Brother of Jesus
```

Good:

```yaml
id: james_zebedee
name: James
aliases:
  - James son of Zebedee
```

This avoids collisions between people with the same name.

---

## Date Rules

Use explicit date objects rather than free-text strings.

Preferred:

```yaml
date:
  start_year: 49
  end_year: 49
  certainty: estimated
```

For ranges:

```yaml
date:
  start_year: 60
  end_year: 62
  certainty: estimated
```

For unknown dates:

```yaml
date:
  start_year: null
  end_year: null
  certainty: unknown
```

Allowed certainty values should include:

- explicit
- estimated
- approximate
- traditional
- disputed
- unknown

---

## Location Rules

Every mapped place should include:

```yaml
id:
name:
latitude:
longitude:
region:
modern_country:
location_certainty:
```

Coordinates must be valid:

- Latitude between -90 and 90.
- Longitude between -180 and 180.

If the exact site is uncertain, use an approximate or traditional coordinate and mark the certainty.

Example:

```yaml
location_certainty: approximate
```

---

## Source Rules

Every source should include:

```yaml
id:
name:
type:
citation:
```

Recommended source types:

- scripture
- historical
- archaeological
- commentary
- manuscript
- atlas
- scholarly_article
- book
- dataset

Every event must include at least one `source_refs` entry.

Scripture sources should also carry rights metadata when needed for direct text usage, including:

- rights status
- attribution text
- usage notes
- permission basis or review note

Citation-only scripture records may remain minimal, but any embedded translation text must not ship without explicit rights tracking.

---

## External Source Integration

External sources should extend the dataset without overwriting canonical Scripture records.

When adding Josephus, Eusebius, archaeological records, historical atlases, or academic sources:

1. Add the source to `sources`.
2. Add new claims or contextual records separately.
3. Link to existing events, people, or places by ID.
4. Mark confidence.
5. Preserve source type.
6. Avoid merging interpretation into the base event summary unless clearly supported.

Use a `claims` collection for interpretive or debated content.

Example:

```yaml
claims:
  - id: claim_luke_author_presence_we_sections
    statement: Luke may have been present during portions of Paul's journeys indicated by the 'we' passages.
    claim_type: scholarly_interpretation
    confidence: medium
    related_event_ids:
      - acts_010
    source_refs:
      - source_id: acts
        citation: Acts 16:10-17
```

---

## Verification Practices

### Data Validation Tests

Create tests for:

- Duplicate IDs.
- Missing source IDs.
- Missing participant IDs.
- Missing location IDs.
- Invalid coordinates.
- Invalid date ranges.
- Journey route sequence errors.
- Relationships pointing to unknown entities.
- Events without source references.

### UI Tests

Create tests for:

- Timeline renders events in chronological order.
- Map receives valid coordinates.
- Event detail shows citation.
- Filters reduce visible events correctly.
- Selecting a timeline event updates detail view.
- Selecting a map point updates detail view.

### Regression Tests

Whenever a bug is fixed, add a regression test that would have caught it.

---

## Telemetry Guidelines

Telemetry should help improve usability and data quality without collecting unnecessary personal information.

Track product events such as:

- App loaded.
- Dataset loaded.
- Event selected.
- Place selected.
- Person filter used.
- Timeline filter used.
- Journey selected.
- Source citation opened.
- Validation error encountered.

Do not track:

- Sensitive personal notes.
- Private religious beliefs.
- User identity unless accounts are intentionally introduced later.
- Free-text search content unless explicitly needed and disclosed.

Initial telemetry can be console-based or local development only. Add production analytics only after privacy expectations are documented.

---

## Security Guidelines

For the initial static app:

- Do not store secrets in the frontend.
- Do not commit API keys.
- Sanitize rendered Markdown or rich text.
- Treat imported YAML as untrusted input.
- Avoid dangerously setting HTML.
- Keep dependencies minimal.
- Run dependency audits before releases.

If a backend is added later:

- Validate all inputs server-side.
- Use authentication only when necessary.
- Apply rate limiting.
- Separate public datasets from user-generated content.
- Maintain audit logs for data contributions.
- Protect admin workflows.
- Use least-privilege API keys.

---

## Scaling Guidelines

Start simple, but avoid designs that block growth.

### Data Scale

The app should eventually handle:

- Thousands of events.
- Thousands of places.
- Many source records.
- Multiple books.
- Multiple interpretive layers.

### UI Scale

As data grows, add:

- Search indexing.
- Clustering map markers.
- Virtualized timeline lists.
- Dataset lazy loading.
- Book-level filters.
- Cached derived views.

### Backend Scale

Only introduce backend services when needed for:

- Public API.
- User annotations.
- Contribution review.
- Full-text search.
- Dataset versioning.
- Collaboration.
- Authentication.

---

## Performance Guidelines

For the first release:

- Keep initial JavaScript bundle small.
- Avoid heavy visualization libraries unless necessary.
- Precompute derived indexes where simple.
- Memoize filtered event lists.
- Avoid re-rendering all map markers unnecessarily.
- Keep route rendering simple.

---

## UI Design Best Practices

### Design Principles

The UI should feel:

- Clear
- Calm
- Trustworthy
- Exploratory
- Source-grounded
- Historically humble

Avoid sensational or overconfident presentation.

### Core Screens

Initial screens:

1. Explorer page
   - Map
   - Timeline
   - Filters
   - Event detail panel

2. Dataset status page
   - Number of events
   - Number of places
   - Number of people
   - Validation status
   - Source coverage

Later screens:

- Person profile
- Place profile
- Journey profile
- Source explorer
- Claims comparison
- Contribution review

---

## Coding Standards

### TypeScript

Use strict TypeScript.

Avoid `any` unless there is a clear reason.

Use domain types for:

- Source
- Place
- Person
- Event
- Journey
- Relationship
- Claim

### Components

Keep components small.

Prefer:

- `TimelineView`
- `TimelineEventItem`
- `MapView`
- `EventDetailPanel`
- `SourceCitation`
- `FilterPanel`

Avoid massive all-purpose components.

### Data Functions

Keep data transformation logic outside React components.

Good:

```text
filterEvents()
sortEventsByDate()
getEventsByPlace()
getPeopleForEvent()
validateDataset()
```

These should have unit tests.

---

## Release Checklist

Before each release, verify:

- App builds successfully.
- Unit tests pass.
- Data validation passes.
- No unresolved broken references.
- No console errors in primary flows.
- Every visible event has a source citation.
- Timeline and map remain synchronized.
- New data includes certainty fields where appropriate.
- Any direct `ESV` text remains within the published quotation limits or has written permission recorded.
- Required `ESV` attribution is present anywhere direct quotation text appears.
- No unauthorized `ESV` trademarks or logo assets are included.
- README or dataset documentation is updated.

---

## First Codex Task Sequence

Start with these tasks in order:

1. Initialize a Vite React TypeScript app.
2. Add `/data/acts.yaml` using the structured schema.
3. Define TypeScript domain types.
4. Implement Zod or JSON Schema validation.
5. Add tests for referential integrity.
6. Render a simple event timeline.
7. Render a simple map with place markers.
8. Add event selection and detail panel.
9. Add category/person/place filters.
10. Add journey route rendering.

Do not skip validation to work on visual polish.

---

## Definition of Done

A feature is done only when:

- It works in the UI.
- It has unit tests for core logic.
- It preserves referential integrity.
- It does not introduce unsupported claims.
- It does not expand scope beyond the feature.
- It keeps the app buildable and deployable.

---

## Project Philosophy

This project is not merely a Bible map. It is a structured, source-attributed biblical knowledge explorer.

Prioritize correctness, traceability, and extensibility over speed or visual novelty.

The long-term value is not just the interface. It is the trusted data model underneath it.
