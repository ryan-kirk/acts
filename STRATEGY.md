# STRATEGY.md

# Bible Time & Place Explorer

## Purpose

Bible Time & Place Explorer is an interactive application for exploring biblical events through time, place, people, sources, and relationships. The application begins with the Book of Acts as the first fully modeled dataset, then expands to Luke, the Gospels, the Pauline letters, the Old Testament, and extra-biblical historical sources.

The core idea is to let users move through Scripture as an integrated timeline and map rather than as a flat list of passages. A user should be able to ask:

- What happened?
- Where did it happen?
- When did it likely happen?
- Who was involved?
- What source supports this record?
- How certain is the date, location, or interpretation?
- How does this event relate to other biblical and historical events?

The application should be built around structured, source-attributed data so that every visible claim can be traced back to Scripture or a documented external source.

---

## Product Goals

### Primary Goals

1. Create a structured data foundation for biblical events.
2. Render those events as both a chronological timeline and an interactive map.
3. Preserve source attribution for every event, place, person, route, and relationship.
4. Support future expansion across books of the Bible and external historical sources.
5. Design for careful scholarship, verification, and transparent uncertainty.
6. Respect scripture licensing and attribution constraints so future text excerpts remain compliant and auditable.

### Initial Scope

The first release should focus on the Book of Acts.

Acts is a strong starting point because it has:

- Clear geographic movement from Jerusalem to Rome.
- Named people, cities, journeys, and political figures.
- A natural connection to maps and timelines.
- Missionary journeys that can later support route animation.
- Continuity with the Gospel of Luke.

---

## Licensing Constraints

The application should remain citation-first by default. Structured summaries, citations, claims, and normalized references are preferred over embedding full Bible translation text in the product.

### ESV Use Policy

- Current default: citation-only scripture usage with no embedded `ESV` verse text in the shipped app.
- If direct `ESV` quotation is later introduced without separate written permission, keep it within Crossway's published limits: no more than `500` consecutive verses, less than one-half of any single biblical book, and less than `25%` of the total text of the work in which it appears.
- Any direct `ESV` quotation must carry the required attribution notice in the corresponding product surface, export, or documentation context.
- Non-saleable digital or print surfaces that rely on the shorter notice rule must still mark quotations with `(ESV)`.
- The `ESV` name, `English Standard Version`, `Global Study Bible`, and the ESV logo are trademarked and should not be used as app branding or decorative assets without prior permission.
- Any commentary or Bible reference product intended for commercial sale that uses direct `ESV` text must not ship until written permission is obtained and recorded.

These constraints should be treated as product requirements, not optional documentation cleanup.

---

## Functional Criteria

### 1. Dataset Loading

The application must load structured YAML or JSON data representing:

- Sources
- Places
- People
- Events
- Journeys
- Relationships
- Tags
- Claims
- Future artifacts and media

Initial source files may be stored as Markdown documents with YAML front matter or fenced YAML blocks, then parsed into validated application data.

Minimum required records for initial Acts release:

- At least 10 major events from Acts.
- At least 8 major locations.
- At least 8 major people.
- At least 2 missionary journey records.
- Source references for every event.

---

### 2. Referential Integrity

The application must validate that:

- Every `location_id` used by an event exists in `places`.
- Every `participant` used by an event exists in `people`.
- Every `source_id` used in `source_refs` exists in `sources`.
- Every `place_id` used in a journey route exists in `places`.
- Every relationship endpoint references a known person, place, organization, event, or source.
- Event IDs are unique.
- Person IDs are unique.
- Place IDs are unique.
- Source IDs are unique.

Invalid data should fail validation before rendering.

---

### 3. Timeline View

The application must provide a timeline visualization that allows users to:

- View events in chronological order.
- Filter by book, category, person, location, and certainty.
- Select an event and see details.
- See date uncertainty clearly.
- Navigate from an event to its source citation.

Initial timeline fields:

- Event title
- Approximate year or range
- Location
- Key people
- Category tags
- Source citation
- Summary

---

### 4. Map View

The application must provide a map visualization that allows users to:

- See event locations as points.
- Click a point to view associated events.
- Filter by book, date range, category, person, or source.
- Render missionary journeys as ordered routes when route data exists.
- Distinguish exact, approximate, and disputed locations.

Initial map fields:

- Place name
- Latitude
- Longitude
- Region
- Modern country
- Related events
- Location certainty

---

### 5. Event Detail View

Each event detail page or side panel should show:

- Title
- Date or date range
- Date certainty
- Summary
- Source references
- Associated people
- Associated place
- Related journey, if applicable
- Tags/categories
- Notes or scholarly uncertainty, if available

Every claim shown in the event detail must be traceable to a source reference.

---

### 6. Source Explorer

The application should eventually support a source explorer that allows users to view:

- Scripture references.
- Extra-biblical historical references.
- Archaeological references.
- Commentary references.
- Confidence level and source type.

Initial release only needs source references in event detail views.

---

### 7. Search and Filtering

The application should support search over:

- Event title
- Event summary
- People
- Places
- Source citation
- Tags

Initial filtering should include:

- Book
- Person
- Place
- Category
- Date range
- Certainty level

---

### 8. Extensibility

The application should be designed so future datasets can add:

- Luke
- Other Gospels
- Pauline letters
- Old Testament books
- Roman history
- Jewish historical sources
- Josephus
- Eusebius
- Archaeological artifacts
- Ancient roads and route networks
- Manuscripts
- Scholarly claims and competing interpretations

The data model should avoid hard-coding assumptions that only work for Acts.

---

## Proposed Data Model

Use a canonical structure similar to:

```yaml
metadata:
  dataset_id: acts
  title: Book of Acts Timeline
  version: "1.0.0"
  schema_version: "1.0.0"

sources:
  - id: acts
    name: Book of Acts
    type: scripture
    citation: New Testament

places:
  - id: jerusalem
    name: Jerusalem
    latitude: 31.7683
    longitude: 35.2137
    region: Judea
    modern_country: Israel
    location_certainty: high

people:
  - id: paul
    name: Paul
    aliases:
      - Saul
      - Saul of Tarsus
    type: apostle

events:
  - id: acts_001
    title: Ascension of Jesus
    date:
      start_year: 30
      end_year: 30
      certainty: estimated
    location_id: jerusalem
    participants:
      - jesus
      - peter
      - john
    source_refs:
      - source_id: acts
        citation: Acts 1:1-11
    categories:
      - ascension
      - apostles
    summary: >
      Jesus ascends into heaven and commissions the disciples.

journeys:
  - id: missionary_journey_1
    title: First Missionary Journey
    start_year: 46
    end_year: 48
    participants:
      - paul
      - barnabas
    route:
      - sequence: 1
        place_id: antioch
      - sequence: 2
        place_id: cyprus

relationships:
  - source_id: paul
    target_id: barnabas
    relationship_type: missionary_partner
```

---

## Proposed Technical Architecture

### Recommended Initial Stack

Use a simple, narrow stack that allows rapid local development and future deployment.

Recommended stack:

- Frontend: React + TypeScript
- Build tool: Vite
- Map rendering: MapLibre GL JS or Leaflet
- Timeline rendering: custom React components first; later consider Vis Timeline or D3
- Data validation: Zod or JSON Schema
- Data format: YAML source files converted to validated JSON
- Backend: optional for first release
- Initial persistence: static files in repository
- Testing: Vitest + React Testing Library
- E2E testing: Playwright once UI stabilizes
- Deployment: static hosting first, such as GitHub Pages, Vercel, Netlify, or Fly.io static deployment

### Why Static First

A static-first implementation keeps the first release narrow and avoids unnecessary complexity.

The first release does not require:

- User accounts
- Authentication
- Database writes
- Collaboration
- Admin dashboards
- Complex backend services

Structured source files can live in the repo and be validated at build time.

A backend can be added later when the app needs:

- User annotations
- Saved views
- Public contributions
- Moderation workflows
- Dataset versioning
- Search indexing
- API access

---

## UI Visualizations

### 1. Combined Timeline + Map

Primary experience:

- Left panel: filters and search
- Center or main view: map
- Bottom or side panel: chronological timeline
- Event selection synchronizes map and timeline

Selecting an event in the timeline should highlight the map point.

Selecting a map point should show all related events at that place.

---

### 2. Missionary Journey View

For Acts, support a journey view showing:

- Ordered route stops
- Route sequence
- Approximate years
- Participants
- Events associated with each stop
- Links to source citations

Initial implementation can use straight lines between route stops. Later releases can use ancient road networks or scholarly route geometries.

---

### 3. Event Detail Panel

When a user selects an event, show:

- Event title
- Date/date range
- Place
- People
- Summary
- Source references
- Certainty indicators
- Related events and relationships

---

### 4. People and Place Explorer

Later releases should include:

- Person profile pages
- Place profile pages
- Event lists by person
- Event lists by place
- Relationship graph of people and events

---

### 5. Confidence and Uncertainty Visualization

The UI should distinguish between:

- Explicit textual source
- Estimated chronology
- Traditional location
- Approximate location
- Disputed location
- Scholarly interpretation

Avoid presenting uncertain chronology or geography as if it were exact.

---

## Milestones

## Phase 0: Repository Setup

Goal: establish a clean development foundation.

Deliverables:

- Create app repository.
- Add README.md.
- Add STRATEGY.md.
- Add AGENTS.md.
- Add initial `/data` directory.
- Add first `acts.yaml` or `acts_timeline.md` data file.
- Add TypeScript, linting, formatting, and unit test setup.

Acceptance criteria:

- App runs locally.
- Tests run locally.
- Data validation script runs locally.
- Repository contains clear development instructions.

---

## Phase 1: Data Schema and Validation

Goal: make structured biblical event data reliable before building UI complexity.

Deliverables:

- Define schema for sources, places, people, events, journeys, and relationships.
- Implement parser for YAML data.
- Implement validation rules for referential integrity.
- Add unit tests for valid and invalid datasets.
- Add sample Acts dataset.

Acceptance criteria:

- Invalid references fail tests.
- Duplicate IDs fail tests.
- Missing required fields fail tests.
- Acts sample dataset passes validation.
- Build fails if data validation fails.

---

## Phase 2: First Visual Prototype

Goal: create a simple but usable “hello world” explorer for Acts.

Deliverables:

- Timeline list of Acts events.
- Interactive map with event points.
- Clickable event detail panel.
- Basic filters by category, person, and place.
- Source citations displayed for each event.

Acceptance criteria:

- User can explore at least 10 Acts events.
- Selecting an event highlights the map location.
- Selecting a map point shows related events.
- All rendered events display source citations.
- Unit tests cover filtering logic and event rendering.

---

## Phase 3: Journey Visualization

Goal: make Acts distinctive by visualizing missionary journeys.

Deliverables:

- Journey selector.
- Ordered route display.
- Route stop list.
- Events grouped by journey.
- Basic route line visualization.

Acceptance criteria:

- At least two journeys render on the map.
- Route order is preserved.
- Journey participants are displayed.
- Journey source references are displayed.
- Tests verify route sequence sorting and missing-place validation.

---

## Phase 4: Expand to Luke

Goal: demonstrate the schema works beyond Acts.

Deliverables:

- Add Luke dataset.
- Add book filter.
- Add shared people and places where appropriate.
- Add continuity links between Luke and Acts.

Acceptance criteria:

- Luke and Acts can render together.
- Shared places do not duplicate unnecessarily.
- Shared people use consistent IDs.
- Source citations remain book-specific.
- Tests validate cross-book references.

---

## Phase 5: External Source Integration

Goal: support richer historical context while preserving trust.

Deliverables:

- Add source types for historical, archaeological, commentary, and manuscript references.
- Add claims model.
- Add confidence scores.
- Add import pipeline for curated external data.
- Add source comparison UI.

Acceptance criteria:

- External source records do not overwrite scripture records.
- Competing claims can coexist.
- Every external claim has a source.
- UI distinguishes primary text from interpretive or historical context.

---

## Release Discipline

Each release should be small and testable.

Preferred release size:

- One primary feature.
- One dataset improvement.
- One validation improvement.
- Tests for each changed behavior.
- No large untested data migrations.

Avoid releases that combine:

- Major UI rewrite
- New schema
- New dataset
- New external source integration
- New deployment infrastructure

---

## Non-Goals for Initial Release

Do not build these in the first release:

- User accounts
- Public editing
- AI chat interface
- Complex backend
- Contribution moderation
- Payments
- Mobile app wrapper
- Deep commentary library
- Full Bible dataset
- Perfect historical route reconstruction

The first release should prove that structured biblical events can be explored through a timeline and map with clear source attribution.

---

## Success Criteria

The first public demo succeeds if a user can:

1. Open the app.
2. Choose the Book of Acts.
3. See events on a timeline.
4. See events on a map.
5. Click an event.
6. Understand what happened, where, when, who was involved, and what source supports it.
7. Recognize which dates and locations are estimated.
8. Follow Paul’s missionary movement from Antioch toward Rome.

---

## Long-Term Vision

The long-term vision is a trustworthy biblical history exploration platform that connects:

- Scripture
- Geography
- Chronology
- People
- Journeys
- Historical sources
- Archaeological findings
- Interpretive claims

The application should help users see the Bible as a connected historical and geographic narrative while remaining careful about uncertainty, source attribution, and scholarly humility.
