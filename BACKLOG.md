# BACKLOG

This backlog is the working plan for the first delivery sequence of Bible Time & Place Explorer. It is ordered by dependency, priority, and phase coherence so we can keep each release narrow and validation-first.

Status legend: `Next`, `Planned`, `Blocked`, `Done`
Priority legend: `P0` = foundation, `P1` = core explorer, `P2` = expansion

## Phase 0. Application Scaffold

Description: Establish the smallest useful static-first application foundation so later data and UI work has a stable home.

Goal: Ship a verified local `React + TypeScript + Vite + Vitest` scaffold with a simple landing page and clean project structure.

Functional Criteria:
- The repository contains the agreed frontend scaffold, scripts, and baseline folders.
- The app renders a simple landing page explaining the project purpose and Acts-first scope.
- The project builds and tests successfully in local development.

Verification Method:
- Run `npm test`.
- Run `npm run build`.
- Confirm the landing page renders with the expected purpose and Acts messaging.

Backend Methods:
- None.
- Static-first frontend only, with local scripts and build tooling.

Frontend Features:
- Landing page.
- Minimal application bootstrap.
- Baseline test harness.

Deployment Requirements:
- Produce a deterministic production build suitable for packaging into a Fly.io app image.
- Keep client bundles free of secrets and backend-only assumptions.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-001 | 0. Application scaffold | Done | P0 | Tooling | Initialize a static-first `Vite + React + TypeScript` app scaffold with strict TypeScript and a minimal dependency set. | `package.json` exists, React and Vite are installed, and the scaffold builds locally. |
| BL-002 | 0. Application scaffold | Done | P0 | Project structure | Add the baseline directories for app code, components, domain logic, data loading, tests, scripts, and canonical dataset storage without mixing in feature work. | The repo contains the agreed top-level folders, the tracked `data/` path is available for canonical datasets, and `README.md` reflects the structure. |
| BL-003 | 0. Application scaffold | Done | P0 | Quality gates | Add baseline scripts for local development, build, and tests. | `npm run dev`, `npm test`, and `npm run build` are documented and the test/build commands succeed locally. |

## Phase 1. Delivery Hardening

Description: Strengthen the scaffold so it is safe to collaborate on, easy to verify automatically, and ready for eventual deployment.

Goal: Make the repo consistently testable, buildable, secret-safe, and ready for the first Fly.io deployment configuration.

Functional Criteria:
- Automated checks run on every change.
- Local environment handling is documented and does not leak secrets into the client.
- Deployment configuration exists for the current static app shape.

Verification Method:
- CI runs the same test and build commands as local development.
- Example environment files contain placeholders only.
- Fly.io configuration can build the app image and define a healthy web process.

Backend Methods:
- None.
- CI and deployment automation only; no application backend service.

Frontend Features:
- No major user-facing features.
- Delivery, safety, and runtime configuration only.

Deployment Requirements:
- Add Fly.io baseline configuration such as `fly.toml`, startup strategy, and health expectations.
- Ensure the app can be deployed as a static frontend served from a simple Fly.io web process.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-025 | 1. Delivery hardening | Done | P0 | Automation | Add a lightweight CI workflow that runs the app test and build commands on pushes and pull requests. | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) installs dependencies, runs `npm run verify`, and builds the production container image. |
| BL-026 | 1. Delivery hardening | Done | P0 | Security | Audit environment handling so the frontend scaffold does not depend on committed secrets and example env files remain placeholders only. | [`.env.example`](.env.example) contains only safe guidance, [README.md](README.md) documents the frontend env policy, and ignored local env files remain outside version control. |
| BL-038 | 1. Delivery hardening | Done | P0 | Deployment | Add baseline Fly.io deployment configuration for the current static frontend app. | [fly.toml](fly.toml), [Dockerfile](Dockerfile), [Caddyfile](Caddyfile), and [`.dockerignore`](.dockerignore) define the deployment path, and CI is configured to build the production image on every push and pull request. |
| BL-039 | 1. Delivery hardening | Done | P0 | Runtime parity | Pin the baseline Node runtime expectations used by local development and CI. | [package.json](package.json) declares the minimum Node engine, [`.nvmrc`](.nvmrc) is committed, and CI uses the same runtime family. |

## Phase 2. Canonical Schema And Validation

Description: Define the canonical data model and the validation rules that protect referential integrity before any real explorer rendering happens.

Goal: Ensure every future UI surface consumes normalized, validated, source-attributed data rather than ad hoc records.

Functional Criteria:
- Canonical types exist for all required top-level collections.
- Validation catches malformed records, bad certainty values, invalid coordinates, and broken references.
- Dataset validation is runnable as a first-class workflow.

Verification Method:
- Unit tests cover schema success and failure cases.
- Intentionally broken fixtures fail fast with clear messages.
- Validation command exits non-zero on invalid dataset input.

Backend Methods:
- No backend service.
- Build-time and local-script validation only.

Frontend Features:
- None required beyond wiring future views to validated types.

Deployment Requirements:
- Validation must run before Fly.io deployment builds are considered releasable.
- Only validated static dataset artifacts should ship in the Fly.io image.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-004 | 2. Canonical schema and validation | Done | P0 | Domain model | Define canonical TypeScript and schema types for `sources`, `places`, `people`, `events`, `journeys`, `relationships`, `tags`, and future `claims`. | [src/data/schema.ts](src/data/schema.ts) and [src/domain/dataset.ts](src/domain/dataset.ts) now define strict canonical types, including structured `usage_rights` metadata for source licensing and terms tracking. |
| BL-005 | 2. Canonical schema and validation | Done | P0 | Validation | Implement schema validation for required fields, stable IDs, coordinates, dates, certainty values, and source references before any rendering. | [src/data/validateDataset.ts](src/data/validateDataset.ts) validates required fields, certainty values, date ranges, and source references, and the validation tests pass. |
| BL-006 | 2. Canonical schema and validation | Done | P0 | Referential integrity | Add validation rules and tests for duplicate IDs, unknown locations, unknown participants, unknown sources, invalid journey route points, and broken relationship endpoints. | [src/tests/validateDataset.test.ts](src/tests/validateDataset.test.ts) covers duplicate IDs, broken references, invalid coordinates, date errors, journey sequence issues, and relationship endpoint failures. |
| BL-027 | 2. Canonical schema and validation | Done | P0 | Validation tooling | Add a dedicated dataset validation command once the canonical schema and import path exist. | [`npm run validate:data`](package.json) runs [scripts/validate-data.ts](scripts/validate-data.ts), which loads YAML or JSON datasets through [src/data/loadDataset.ts](src/data/loadDataset.ts). |

## Phase 3. Acts Canonical Dataset

Description: Turn `ACTS_TIMELINE.md` from a draft artifact into a canonical, machine-parseable Acts dataset suitable for validation and UI use.

Goal: Produce the first trustworthy Book of Acts dataset with normalized references, certainty modeling, and minimum viable breadth.

Functional Criteria:
- Acts data is normalized into the canonical schema.
- Minimum initial record counts are met for events, places, people, and journeys.
- Uncertain or traditional claims are explicitly marked.

Verification Method:
- Dataset validation passes cleanly.
- Record counts meet the initial scope targets.
- Every event has source references and all IDs resolve.

Backend Methods:
- No backend service.
- Static dataset transformation and validation scripts only.

Frontend Features:
- None directly, but this phase unlocks all real explorer rendering.

Deployment Requirements:
- Bundle the validated Acts dataset with the frontend artifacts shipped to Fly.io.
- No runtime write path or external database is required.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-007 | 3. Acts canonical dataset | Done | P0 | Dataset audit | Review `ACTS_TIMELINE.md` and normalize its structure into a machine-parseable, source-attributed draft aligned to the canonical schema. | [data/acts.yaml](data/acts.yaml) is now the canonical Acts dataset, and [ACTS_TIMELINE.md](ACTS_TIMELINE.md) remains as the source draft reference. |
| BL-008 | 3. Acts canonical dataset | Done | P0 | Core records | Bring the Acts draft up to the minimum initial dataset target with at least 10 major events, 8 places, 8 people, 2 journeys, and required `source_refs`. | The canonical dataset validates with 17 events, 14 places, 14 people, 3 journeys, and source-backed records across the core collections. |
| BL-009 | 3. Acts canonical dataset | Done | P0 | Uncertainty modeling | Add explicit date certainty, location certainty, and notes for approximate, traditional, or disputed records in the Acts dataset. | Events now use explicit date certainty objects, places include `location_certainty`, and traditionally or approximately located records such as Malta, Antioch, Salamis, and Lystra are marked in the canonical dataset. |
| BL-040 | 3. Acts canonical dataset | Done | P0 | Source rights | Backfill `usage_rights` metadata for every source record used by the Acts canonical dataset, including license, terms, attribution, and review status. | The canonical Acts source record includes structured `usage_rights` metadata, and dataset validation plus tests confirm source-rights tracking is present. |

## Phase 4. Explorer Shell And Shared Navigation

Description: Build the overall application frame that ties all major views together and manages shared selection state.

Goal: Deliver a usable explorer shell with navigation, shared state, and an event rail that can host the timeline, map, people, and sources experiences.

Functional Criteria:
- Users can switch views without losing core app context.
- Shared selected-event state drives synchronized explorer surfaces.
- The event rail is searchable and supports active selection.

Verification Method:
- Component tests verify view switching and selection persistence.
- Search tests verify deterministic filtering by supported fields.
- Responsive checks confirm rail and inspector behavior across breakpoints.

Backend Methods:
- None.
- Client-side state only, driven by validated static data.

Frontend Features:
- Top-level explorer shell.
- View navigation.
- Searchable event rail.
- Responsive sidebar and drawer behavior.

Deployment Requirements:
- The Fly.io deployment must serve client-side navigation correctly.
- Static asset routing must support direct loading of the explorer shell entrypoint.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-028 | 4. Explorer shell and shared navigation | Done | P1 | App shell | Build the primary explorer shell with dataset identity, top-level view navigation, and shared selection state for map, timeline, people, and future sources views. | [src/app/App.tsx](src/app/App.tsx), [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx), [src/components/ViewNavigation.tsx](src/components/ViewNavigation.tsx), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now provide the dataset-backed shell, top-level view tabs, and shared selection persistence across explorer previews. |
| BL-042 | 4. Explorer shell and shared navigation | Done | P1 | Data bootstrap | Load the canonical scripture datasets into the frontend app through the shared dataset loader and provide a clear failure state when validation fails. | [src/data/parseDataset.ts](src/data/parseDataset.ts), [src/data/loadDataset.ts](src/data/loadDataset.ts), [src/app/bootstrapExplorerDataset.ts](src/app/bootstrapExplorerDataset.ts), and [src/tests/bootstrapExplorerDataset.test.ts](src/tests/bootstrapExplorerDataset.test.ts) now share parsing and validation logic between scripts and the browser shell, merge Matthew, Mark, Luke, John, and Acts into one library, and render explicit load failures. |
| BL-029 | 4. Explorer shell and shared navigation | Done | P1 | Event rail | Add a searchable left-side event rail listing scripture events with compact title, date, location, and book metadata plus active selection highlighting. | [src/components/EventRail.tsx](src/components/EventRail.tsx), [src/domain/events.ts](src/domain/events.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now provide deterministic event search by title, location, participant, summary, or citation, plus persistent active-selection highlighting across the expanding multi-book library. |
| BL-030 | 4. Explorer shell and shared navigation | Done | P1 | Responsive layout | Implement responsive sidebar and drawer behavior for the explorer rail and inspector so the core UI works on desktop and mobile widths. | [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx), [src/components/EventInspector.tsx](src/components/EventInspector.tsx), and [src/styles.css](src/styles.css) now provide desktop multi-panel layout, mobile rail/detail toggles, and verified shared-selection behavior through `npm test` and `npm run build`. |

## Phase 5. Timeline Explorer

Description: Introduce the first primary data view: a chronological explorer that shows how Acts unfolds over time.

Goal: Let users browse, filter, and select Acts events in chronological order with clear visual treatment for category and certainty.

Functional Criteria:
- Events render in stable chronological order.
- Timeline semantics communicate eras, categories, and certainty.
- Filters operate on validated derived data rather than inline UI logic.

Verification Method:
- Unit tests cover timeline sorting and filtering functions.
- UI tests confirm rendering order, selection behavior, and filter interaction.
- Regression tests cover unknown dates and certainty display.

Backend Methods:
- None.
- Client-side derived views from validated static event data.

Frontend Features:
- Scrollable or navigable timeline.
- Certainty legend.
- Era bands.
- Category styling.
- First-pass filters.

Deployment Requirements:
- Timeline data and derived assets remain static and deploy with the Fly.io app image.
- No server-side timeline rendering dependency is required.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-010 | 5. Timeline explorer | Done | P1 | Timeline UI | Render a chronological timeline from validated event data with selection support and stable ordering. | [src/components/TimelineView.tsx](src/components/TimelineView.tsx), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), [src/domain/events.ts](src/domain/events.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now render a real scripture chronology, keep shared event selection in sync with the inspector, and verify both default Acts focus and Luke book filtering through the UI tests. |
| BL-031 | 5. Timeline explorer | Done | P1 | Timeline semantics | Add certainty legend, era bands, and category-coded event presentation so the timeline communicates chronology and interpretive confidence clearly. | [src/domain/timeline.ts](src/domain/timeline.ts), [src/components/TimelineView.tsx](src/components/TimelineView.tsx), and [src/styles.css](src/styles.css) now provide explicit certainty legend cards, era-band grouping, and category-toned timeline event styling backed by canonical tag groups. |
| BL-012 | 5. Timeline explorer | Done | P1 | Filters | Add first-pass filters for category, person, place, certainty, and date range with data logic kept outside React components. | [src/domain/timeline.ts](src/domain/timeline.ts), [src/tests/timelineDomain.test.ts](src/tests/timelineDomain.test.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now cover derived filtering logic plus UI filter interaction for category, person, place, certainty, and date range. |
| BL-044 | 5. Timeline explorer | Planned | P1 | Filter persistence | Persist active timeline filters in the URL so filtered Acts chronology views can be reloaded and shared without losing context. | Reloading or sharing a timeline URL restores the visible filter state and timeline slice, invalid filter values fail safely, and shared event selection remains consistent with the filtered chronology. |

## Phase 6. Event Inspector And Record Detail

Description: Add the deep reading surface for selected events so the explorer becomes source-grounded rather than just visually navigable.

Goal: Show rich event detail with source attribution, certainty explanation, linked entities, and related events.

Functional Criteria:
- Selected events display complete normalized detail.
- Source support is visible for every shown claim.
- Related events, people, and places are navigable from the detail surface.

Verification Method:
- UI tests confirm selection from rail, timeline, and map updates the inspector.
- Tests verify citations are always present for visible event records.
- Regression tests cover related-record navigation and certainty rendering.

Backend Methods:
- None.
- Client-side lookup from validated entities and relations.

Frontend Features:
- Right-side inspector.
- Event metadata blocks.
- Certainty explanation.
- Linked people, places, and related events.

Deployment Requirements:
- No additional Fly.io service is required.
- All detail content must be resolvable from static data shipped with the app.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-011 | 6. Event inspector and record detail | Done | P1 | Event detail | Add a right-side event inspector showing title, summary, certainty, date, place, participants, citations, and related events. | [src/components/EventInspector.tsx](src/components/EventInspector.tsx), [src/domain/events.ts](src/domain/events.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now render richer event detail, keep inspector selection synchronized with rail and timeline changes, and support related-event navigation from the detail surface. |
| BL-032 | 6. Event inspector and record detail | Done | P1 | Record context | Extend event detail with certainty explanations, location context, person summaries, and source-type distinctions to match the example explorer’s record depth. | [src/components/EventInspector.tsx](src/components/EventInspector.tsx), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), [src/styles.css](src/styles.css), and [src/tests/eventsDomain.test.ts](src/tests/eventsDomain.test.ts) now provide chronology explanations, place context, participant summaries, source-type labeling, and linked person/place/source focus actions backed by normalized IDs. |
| BL-043 | 6. Event inspector and record detail | Planned | P1 | Deep linking | Persist the active explorer view and selected event in URL query parameters so Fly.io-hosted explorer links can reopen the same context directly. | Reloading or sharing a URL restores valid view and selection state, unknown IDs fail safely to defaults, and browser back/forward navigation stays synchronized with the shell. |
| BL-045 | 6. Event inspector and record detail | Planned | P1 | Relationship context | Surface normalized relationship records in the inspector so users can see explicit dataset links such as ministry partners, evangelized households, and mentorship ties around the selected record. | Inspector relationship cards resolve from the `relationships` collection by ID, unknown endpoints remain impossible after validation, and selecting related relationship entries can open the connected event, person, or place focus safely. |

## Phase 7. Map Explorer And Place Interaction

Description: Add the geographic explorer so users can move through Acts spatially as well as chronologically.

Goal: Provide an interactive map with validated place markers, map controls, place context, and synchronized selection behavior.

Functional Criteria:
- Places render from validated coordinates only.
- Map controls affect the rendered view without breaking shared state.
- Place popups and marker interactions connect back to event records.

Verification Method:
- UI tests confirm valid markers render and invalid coordinates do not.
- Interaction tests verify popup event selection and cross-view sync.
- Manual verification confirms map attribution and certainty cues appear correctly.

Backend Methods:
- None.
- Client-side map rendering against validated static place and event data.

Frontend Features:
- Interactive map.
- Marker rendering.
- Basemap or layer controls.
- Legends.
- Place popups or cards.
- Cross-view selection sync.

Deployment Requirements:
- Fly.io deployment must serve the map-enabled frontend and allow browser tile requests to configured providers.
- Map attribution and static assets must be present in production.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-013 | 7. Map explorer and place interaction | Done | P1 | Map UI | Render validated place markers on a simple map using canonical place data and a lightweight mapping library. | [src/components/MapView.tsx](src/components/MapView.tsx), [src/domain/map.ts](src/domain/map.ts), and [src/tests/mapDomain.test.ts](src/tests/mapDomain.test.ts) now render canonical places from the active book scope, exclude non-renderable locations from the map layer, and keep place grouping in domain logic. |
| BL-033 | 7. Map explorer and place interaction | Done | P1 | Map controls | Add map-level controls such as basemap selection, legend, and route visibility toggles needed for the example explorer interaction model. | [src/components/MapView.tsx](src/components/MapView.tsx), [src/styles.css](src/styles.css), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now provide basemap switching, journey overlay toggles, location-certainty chips, attribution, and legend coverage verified through the app tests. |
| BL-034 | 7. Map explorer and place interaction | Done | P1 | Place popups | Add place popups or cards showing place description, regional context, and related events with click-through event selection. | [src/components/MapView.tsx](src/components/MapView.tsx) now renders a place interaction card with summary, region, country, coordinates, related events, and journey context derived from canonical place and event records. |
| BL-014 | 7. Map explorer and place interaction | Done | P1 | Cross-view sync | Connect map selection to event detail and timeline selection so the explorer stays synchronized across views. | [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), [src/components/MapView.tsx](src/components/MapView.tsx), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now keep marker clicks, place actions, and shared inspector selection synchronized across the explorer shell. |
| BL-015 | 7. Map explorer and place interaction | Done | P1 | Location certainty | Distinguish exact, approximate, traditional, and disputed location records in the map UI. | [src/domain/map.ts](src/domain/map.ts), [src/components/MapView.tsx](src/components/MapView.tsx), and [src/styles.css](src/styles.css) now encode certainty-specific marker tones, filter controls, and legend copy backed directly by canonical `location_certainty` values. |
| BL-046 | 7. Map explorer and place interaction | Planned | P1 | Performance | Reduce the main frontend bundle impact introduced by the interactive explorer surfaces, likely by lazy-loading Leaflet and other view-specific code paths. | `npm run build` completes without the current large-chunk warning, or the remaining warning is explicitly documented and accepted with measured bundle-size tradeoffs. |

## Phase 8. People Explorer And Entity Context

Description: Expand from event-centric browsing into person-centric exploration so users can follow recurring actors across Acts.

Goal: Provide searchable person records and connected navigation between people, events, and related entities.

Functional Criteria:
- Users can search and select people records.
- Person detail summarizes aliases, roles, and appearances in Acts.
- Navigation across people and events preserves referential integrity.

Verification Method:
- UI tests verify person search, selection, and linked event lists.
- Referential-integrity tests fail on broken person references.
- Regression tests confirm navigation between person and event records.

Backend Methods:
- None.
- Client-side entity lookup from normalized records.

Frontend Features:
- People view.
- Person search.
- Biographical detail.
- Linked appearances and cross-record navigation.

Deployment Requirements:
- No new Fly.io infrastructure is required.
- Person records ship as static validated data within the deployed app.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-035 | 8. People explorer and entity context | Done | P1 | People UI | Add a searchable people view with biographical summaries, aliases, roles, and linked appearances. | [src/components/PeopleView.tsx](src/components/PeopleView.tsx), [src/domain/people.ts](src/domain/people.ts), and [src/tests/peopleDomain.test.ts](src/tests/peopleDomain.test.ts) now provide a searchable scripture biographical catalog backed by normalized person records, appearance counts, related places, and source-backed detail sections. |
| BL-036 | 8. People explorer and entity context | Done | P1 | Cross-record navigation | Add navigation links between event detail, people records, and related events so users can move through the dataset as connected entities. | [src/components/PeopleView.tsx](src/components/PeopleView.tsx), [src/components/EventInspector.tsx](src/components/EventInspector.tsx), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now keep person search, appearance-event selection, related-person navigation, and place focus wired to the shared explorer shell. |
| BL-047 | 8. People explorer and entity context | Planned | P1 | Dataset coverage | Expand canonical relationship coverage for major Acts figures so the people explorer can show fuller context than the initial five modeled ties. | Additional relationship records validate cleanly, person profiles surface materially richer connection networks for major figures such as Peter and Paul, and new links continue to resolve only through normalized IDs. |

## Phase 9. Journey Overlays And Route Exploration

Description: Build the first route-based layer so the missionary journeys can be explored as ordered geographic movement rather than isolated points.

Goal: Represent Acts journeys as validated route overlays with journey selection and journey-level context.

Functional Criteria:
- Journeys reference known place IDs in valid order.
- Route overlays render on the map and can be toggled or selected.
- Journey detail links journeys back to related events and sources.

Verification Method:
- Validation tests catch bad route order or unknown route points.
- UI tests confirm route toggles and journey selection.
- Manual or screenshot verification confirms route rendering order and clarity.

Backend Methods:
- None.
- Client-side route rendering from validated journey data.

Frontend Features:
- Journey overlays.
- Route toggles.
- Journey detail surface.

Deployment Requirements:
- Journey data ships statically with the Fly.io app.
- No routing or geospatial backend is required for the initial implementation.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-016 | 9. Journey overlays and route exploration | Done | P1 | Journey model | Finalize journey records as ordered route sequences that reference existing place IDs rather than free-text locations. | [data/acts.yaml](data/acts.yaml), [src/data/validateDataset.ts](src/data/validateDataset.ts), and [src/tests/validateDataset.test.ts](src/tests/validateDataset.test.ts) now enforce known `place_id` references plus contiguous, non-duplicate route sequencing for canonical journey records. |
| BL-017 | 9. Journey overlays and route exploration | Done | P1 | Route rendering | Draw missionary journey routes on the map and let users select a journey to focus related events and places. | [src/domain/map.ts](src/domain/map.ts), [src/components/MapView.tsx](src/components/MapView.tsx), [src/test/leafletMock.ts](src/test/leafletMock.ts), [src/tests/mapDomain.test.ts](src/tests/mapDomain.test.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now render ordered route overlays, support route-line selection, preserve overlay visibility toggles, and focus related places and events from the map explorer. |
| BL-018 | 9. Journey overlays and route exploration | Done | P1 | Journey detail | Add journey-level detail with title, date range, source support, and linked events. | [src/components/JourneyDetailPanel.tsx](src/components/JourneyDetailPanel.tsx), [src/components/MapView.tsx](src/components/MapView.tsx), [src/domain/events.ts](src/domain/events.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now provide journey summaries, date ranges, stop-by-stop route detail, linked event navigation, and source citations for the active journey. |

## Phase 10. Luke Multi-Book Expansion

Description: Extend the architecture from an Acts-only explorer into a multi-book explorer without breaking canonical shared entities.

Goal: Add Luke as the second normalized dataset and prove that the model scales across books while preserving shared IDs and explorer filters.

Functional Criteria:
- Luke can be modeled using the same schema.
- Shared people, places, and sources are referenced rather than duplicated.
- Explorer surfaces can filter and navigate across books.

Verification Method:
- Validation passes independently for Acts and Luke datasets.
- Cross-book references resolve correctly.
- UI tests verify book-level filters across shared views.

Backend Methods:
- None.
- Static multi-dataset loading and client-side book filtering.

Frontend Features:
- Book-aware filters in rail, timeline, and map.
- Cross-book entity navigation.

Deployment Requirements:
- Fly.io build artifacts must include multiple validated datasets without changing the app’s static-first architecture.
- No backend data API is introduced in this phase.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-019 | 10. Luke multi-book expansion | Done | P2 | Multi-book data | Define how a Luke dataset will share places, people, and sources with Acts while remaining independently validated. | [data/luke.yaml](data/luke.yaml), [src/app/bootstrapExplorerDataset.ts](src/app/bootstrapExplorerDataset.ts), [src/domain/library.ts](src/domain/library.ts), [src/tests/actsCanonicalDataset.test.ts](src/tests/actsCanonicalDataset.test.ts), and [src/tests/bootstrapExplorerDataset.test.ts](src/tests/bootstrapExplorerDataset.test.ts) now validate Luke independently, merge Luke and Acts into one library, and preserve shared entities by stable ID. |
| BL-020 | 10. Luke multi-book expansion | Done | P2 | Explorer filters | Extend timeline, rail, and map filters to support book-level exploration across Acts and Luke. | [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx), [src/components/EventRail.tsx](src/components/EventRail.tsx), [src/components/TimelineView.tsx](src/components/TimelineView.tsx), [src/components/MapView.tsx](src/components/MapView.tsx), [src/components/PeopleView.tsx](src/components/PeopleView.tsx), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now let users limit results to `All Books`, `Acts`, `Matthew`, `Mark`, or `Luke` while preserving shared-ID resolution across the explorer. |
| BL-021 | 10. Luke multi-book expansion | Done | P2 | Cross-book relationships | Model continuity points between Luke and Acts such as shared people, places, and transitional events. | [data/luke.yaml](data/luke.yaml) now reuses shared IDs such as `jerusalem`, `jesus`, `peter`, `john`, and `james_zebedee`; [src/domain/library.ts](src/domain/library.ts) deduplicates those shared records during library merge; and [src/tests/libraryDomain.test.ts](src/tests/libraryDomain.test.ts) verifies that cross-book continuity is preserved without direct duplicate canonical records. |
| BL-048 | 10. Luke multi-book expansion | Planned | P2 | Shared context | Surface explicit Luke-to-Acts continuity cues in the UI, such as transition cards or library context for shared people, places, and closing-to-opening narrative anchors. | Users can see why shared records bridge Luke and Acts without relying on duplicated event summaries, and continuity UI remains grounded in normalized IDs plus source-backed records. |

## Phase 11. External Sources And Claims Layer

Description: Add the first explicit interpretive and extra-biblical layer while preserving the distinction between canonical scripture data and later historical or scholarly claims.

Goal: Support a source explorer, external attestations, and confidence-modeled claims without overwriting the base scripture records.

Functional Criteria:
- External sources can be modeled with distinct source types and metadata.
- Claims are stored separately from canonical event summaries.
- UI clearly distinguishes scripture records from external attestations and debated claims.

Verification Method:
- Validation tests confirm source and claim references resolve.
- UI tests confirm source grouping and claim separation.
- Regression tests prevent unsupported interpretation from leaking into canonical summaries.

Backend Methods:
- None by default.
- Static claims and source datasets, with client-side rendering and filtering.

Frontend Features:
- Sources explorer.
- Claim and confidence display.
- External attestation grouping.

Deployment Requirements:
- Fly.io deployment continues to serve a static-first app image containing normalized source and claim data.
- No backend is introduced unless future contribution, indexing, or write workflows justify it.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-022 | 11. External sources and claims layer | Done | P2 | Source model | Extend the source model to support historical, archaeological, commentary, manuscript, atlas, and scholarly sources. | [data/acts.yaml](data/acts.yaml) and [data/luke.yaml](data/luke.yaml) now include external source records spanning `historical`, `archaeological`, `commentary`, `manuscript`, `atlas`, `scholarly_article`, and `book` types, and [`npm run validate:data -- data/acts.yaml data/luke.yaml`](package.json) confirms the expanded source model validates without altering canonical event integrity. |
| BL-023 | 11. External sources and claims layer | Done | P2 | Claims layer | Introduce a separate `claims` collection for interpretive or debated assertions linked to existing events, people, and places. | [data/acts.yaml](data/acts.yaml) and [data/luke.yaml](data/luke.yaml) now model 15 source-backed claims separately from event summaries, [src/domain/sources.ts](src/domain/sources.ts) derives visible claim records, and [src/tests/sourcesDomain.test.ts](src/tests/sourcesDomain.test.ts) verifies claim scoping through related events, people, and places. |
| BL-024 | 11. External sources and claims layer | Done | P2 | UI attribution | Surface external claims and confidence levels without overwriting scripture-grounded event summaries. | [src/components/EventInspector.tsx](src/components/EventInspector.tsx) now renders a dedicated external-attestation section separate from canonical event copy, [src/components/SourcesView.tsx](src/components/SourcesView.tsx) renders claim cards with confidence badges and linked sources, and [src/tests/App.test.tsx](src/tests/App.test.tsx) verifies claim separation in the inspector. |
| BL-037 | 11. External sources and claims layer | Done | P2 | Sources explorer | Add a dedicated sources view that groups scriptural witnesses, external authors, inscriptions, and certainty-framework content needed for the example UI. | [src/components/SourcesView.tsx](src/components/SourcesView.tsx), [src/domain/sources.ts](src/domain/sources.ts), and [src/styles.css](src/styles.css) now provide a dense source explorer with grouped witness sections, active source focus, claim lists, and confidence framework cards inspired by the example UI, and [src/tests/App.test.tsx](src/tests/App.test.tsx) verifies the grouped source surface renders. |
| BL-041 | 11. External sources and claims layer | Done | P2 | Rights transparency | Surface source licensing, terms-of-use links, attribution requirements, and rights-review status to users in source and citation interfaces. | [src/components/SourcesView.tsx](src/components/SourcesView.tsx) and [src/components/EventInspector.tsx](src/components/EventInspector.tsx) now surface rights status, attribution text, and usage notes anywhere sources are shown, while [data/acts.yaml](data/acts.yaml) and [data/luke.yaml](data/luke.yaml) provide the underlying rights metadata. |
| BL-049 | 11. External sources and claims layer | Planned | P2 | Explorer controls | Add filters inside the sources explorer for witness type, confidence level, and rights status so larger attestation libraries remain browsable. | Users can isolate archaeological, historical, commentary, or manuscript witnesses plus claim-confidence bands without losing the active book or selected event context. |
| BL-050 | 11. External sources and claims layer | Planned | P2 | Cross-view cues | Surface lightweight claim or external-attestation indicators in the rail, timeline, and map so users can discover interpreted or externally anchored records before opening the inspector. | Events with modeled claims show a consistent cue across explorer surfaces, the cue resolves from normalized claim records, and no canonical summary text is altered to achieve the signaling. |

## Phase 12. Explorer Regression Recovery And UI Harmonization

Description: Resolve the current timeline, map, overview, and Luke discoverability regressions so the explorer behaves more like the intended example-driven product and less like a collection of partially aligned surfaces.

Goal: Restore confidence in the core explorer by fixing journey-selection behavior, improving timeline presentation, consolidating overview controls, and making Luke coverage and visibility explicit.

Functional Criteria:
- Journey controls correctly support visible multi-selection and future extensibility.
- The map can render all intended journey overlays, including the Rome voyage when modeled.
- The timeline presents as a more purpose-built chronological explorer rather than a plain record list.
- Overview and book-scoping controls make the Luke-Acts library understandable without hidden state.
- Luke records are either expanded materially or their current coverage and scope are made unmistakable in the UI.

Verification Method:
- UI tests confirm journey visibility toggles can enable and disable multiple routes without losing the active journey focus unexpectedly.
- Dataset and map tests confirm the Rome voyage appears once the canonical journey record is modeled.
- Manual and screenshot review compares timeline and overview density against the `examples/ui` layout expectations.
- Regression tests confirm Luke records appear in rail, timeline, map, and people flows under the expected book scope.

Backend Methods:
- No backend service.
- Canonical dataset updates, derived domain logic, and client-side state management only.

Frontend Features:
- Journey multi-select controls.
- Extensible journey selector UX.
- Scrollable timeline redesign.
- Overview-level book and confidence controls.
- Clear Luke coverage and library-scope affordances.

Deployment Requirements:
- Changes remain compatible with the existing static Fly.io deployment.
- Additional UI complexity should not materially worsen the current bundle-size warning without an explicit follow-up plan.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-051 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Map controls | Fix the journey visibility regression so multiple journeys can be shown or hidden independently without breaking active route selection or map focus. | [src/components/MapView.tsx](src/components/MapView.tsx) now keeps active route focus stable while toggles operate independently, and [src/tests/App.test.tsx](src/tests/App.test.tsx) verifies unrelated route toggles no longer break the selected journey. |
| BL-052 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Journey dataset | Audit and model the missing Rome-voyage journey so the map layer includes the expected final travel sequence and can support future journey families consistently. | [data/acts.yaml](data/acts.yaml) now models `voyage_to_rome` plus intermediate ports and linked event assignments, the canonical validation suite passes, and [src/tests/App.test.tsx](src/tests/App.test.tsx) confirms the fourth route overlay renders in the map explorer. |
| BL-053 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Journey UX | Replace or extend the current journey chip controls with a more extensible selector pattern that can scale to future journeys and route families. | [src/components/JourneyDetailPanel.tsx](src/components/JourneyDetailPanel.tsx) now provides a richer route selector with separate focus and visibility actions, [src/styles.css](src/styles.css) keeps the control compact and responsive, and the map regression tests still pass with the expanded selector behavior. |
| BL-054 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Timeline UX | Redesign the timeline view to better match the `examples/ui` concept of a scrollable, intentional chronology surface instead of a plain stacked record list. | [src/components/TimelineView.tsx](src/components/TimelineView.tsx) and [src/domain/timeline.ts](src/domain/timeline.ts) now render a horizontal chronology board with dense cards, axis bands, and preserved filters, while [src/tests/App.test.tsx](src/tests/App.test.tsx) and [src/tests/timelineDomain.test.ts](src/tests/timelineDomain.test.ts) confirm chronology behavior still holds. |
| BL-055 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Shared controls | Rework the overview surface into a true control hub for book scope and shared certainty or confidence controls, reducing duplicated shell-level state affordances. | [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx) now turns the overview into a scope and confidence hub, [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx) carries the shared claim-confidence lens across views, and [src/tests/App.test.tsx](src/tests/App.test.tsx) verifies overview-driven controls affect inspector and sources behavior deterministically. |
| BL-056 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Luke coverage audit | Audit Luke dataset completeness versus user expectation, then either expand Luke records substantially or surface explicit “current coverage” messaging so the book no longer appears missing. | [README.md](README.md) now documents the current Luke coverage explicitly, [src/components/EventRail.tsx](src/components/EventRail.tsx) and [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx) surface the partial Luke scope in-product, and [src/tests/App.test.tsx](src/tests/App.test.tsx) confirms Luke records appear under the expected scope. |
| BL-057 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Luke discoverability | Improve multi-book discoverability so the app’s default Acts focus does not make Luke content appear absent, including clearer scope messaging and better overview/library framing. | The header, overview hub, and event rail now communicate the active scope directly through [src/app/ExplorerShell.tsx](src/app/ExplorerShell.tsx), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), and [src/components/EventRail.tsx](src/components/EventRail.tsx), while regression tests verify Luke can be reached from the first-load overview without relying on hidden shell state. |
| BL-058 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Map lifecycle | Stop recreating the Leaflet map during ordinary event selection by separating one-time map setup from marker and journey overlay synchronization. | [src/components/MapView.tsx](src/components/MapView.tsx) now mounts the Leaflet surface once and syncs markers plus overlays in place, while [src/tests/App.test.tsx](src/tests/App.test.tsx) confirms changing the selected event no longer creates a replacement map instance. |
| BL-059 | 12. Explorer regression recovery and UI harmonization | Done | P1 | Sparse chronology | Collapse long empty year runs in the horizontal timeline so Luke and future sparse datasets stay compact instead of rendering large dead-space stretches. | [src/domain/timeline.ts](src/domain/timeline.ts) now emits explicit gap columns, [src/components/TimelineView.tsx](src/components/TimelineView.tsx) renders the compressed chronology surface, and [src/tests/timelineDomain.test.ts](src/tests/timelineDomain.test.ts) plus [src/tests/App.test.tsx](src/tests/App.test.tsx) keep the regression covered. |

## Phase 13. New Testament Source Inventory And ESV Rights

Description: Prepare the remaining New Testament books as explicit future sources before dataset extraction starts, including the preferred translation strategy and rights workflow.

Goal: Establish a complete source inventory for all `27` New Testament books and define how the preferred `ESV` basis can be used safely inside the app.

Functional Criteria:
- Every New Testament book is documented with its current extraction status.
- The preferred `ESV` workflow distinguishes citation-only use from any future text-excerpt use.
- Remaining scripture source records have a clear metadata and rights plan before canonical dataset work begins.
- Any future direct `ESV` text path has explicit controls for quotation limits, attribution, trademark usage, and commercial-permission review.

Verification Method:
- [SOURCES.md](SOURCES.md) lists all `27` New Testament books and the app’s current extraction status for each.
- New scripture source records for remaining books validate once added to canonical datasets.
- Rights notes are available before any direct Bible text is shipped to users.
- Follow-up compliance tasks exist for attribution rendering, quotation-budget validation, and commercial-use review before any text-bearing release can be considered complete.

Backend Methods:
- None.
- Documentation, source metadata planning, and validation-first dataset preparation only.

Frontend Features:
- Source transparency for current and future scripture coverage.
- Future rights surfacing for preferred Bible-text usage.

Deployment Requirements:
- Fly.io deployments must remain citation-only until any ESV text usage is explicitly cleared and surfaced.
- Future production builds must not embed licensed Bible text without corresponding rights metadata.
- Future text-bearing builds must fail release review if they exceed the published `ESV` quotation thresholds, omit required attribution, or introduce unauthorized trademarked branding.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-060 | 13. New Testament source inventory and ESV rights | Done | P2 | Documentation | Create `SOURCES.md` with entries for every New Testament book, current extraction status, and the current external-source inventory. | [SOURCES.md](SOURCES.md) now lists all `27` New Testament books, distinguishes modeled versus unmodeled sources, and records the external sources currently referenced by Matthew, Mark, Luke, John, and Acts claims. |
| BL-061 | 13. New Testament source inventory and ESV rights | Done | P2 | Rights strategy | Define the preferred `ESV` ingestion workflow, including what remains citation-only, what would count as embedded text, and how attribution and permissions must be surfaced. | [SOURCES.md](SOURCES.md) now documents the citation-only default, defines what counts as embedded ESV text, and records the required rights and attribution workflow before any translation text can ship. |
| BL-062 | 13. New Testament source inventory and ESV rights | Done | P2 | Source metadata | Add planned scripture source stubs or canonical metadata conventions for the remaining New Testament books so future datasets can be created consistently. | [SOURCES.md](SOURCES.md) now includes canonical source-metadata conventions, a reusable scripture source template, and planned source IDs plus citation seeds for all `27` New Testament books. |
| BL-099 | 13. New Testament source inventory and ESV rights | Planned | P2 | UI transparency | Surface the public source inventory and scripture-text policy inside the app so users can see current corpus coverage and citation-only rules without leaving the explorer. | The overview or sources explorer shows modeled-book coverage, planned-book scope, and the current citation-only scripture policy, and the UI remains aligned with [SOURCES.md](SOURCES.md) without duplicating conflicting source-governance copy. |
| BL-100 | 13. New Testament source inventory and ESV rights | Planned | P2 | Compliance automation | Add release checks that flag embedded `ESV` text without rights metadata, missing attribution, or quotation usage that exceeds the published verse-count or percentage thresholds. | Validation or release tooling fails safely when direct `ESV` text appears without matching rights metadata, required attribution text, or compliant quotation-budget accounting. |
| BL-101 | 13. New Testament source inventory and ESV rights | Done | P2 | Legal guardrails | Document and enforce product rules for `ESV` trademark usage and for any future commercial commentary or Bible-reference release that would require written permission. | [src/data/schema.ts](src/data/schema.ts) and [data/luke.yaml](data/luke.yaml) plus [data/acts.yaml](data/acts.yaml) now track scripture-source trademark and commercial-use notes explicitly, [src/components/SourcesView.tsx](src/components/SourcesView.tsx) surfaces those guardrails in the UI, and [SOURCES.md](SOURCES.md) records the public compliance policy. |

## Phase 13b. Literary Reference Coverage And Foundational Closeout

Description: Consolidate the remaining unfinished work from phases `5` through `13` into one pre-expansion closeout phase while extending the literary model so book metadata can carry fuller normalized people and place reference material.

Goal: Finish the unresolved explorer, source-governance, and release-safety work from the first delivery arc while making the current Matthew-Mark-Luke-John-Acts library richer at the literary-unit level through explicit person and place references.

Note: The original open backlog rows in phases `5` through `13` remain in place for dependency and historical traceability. This phase is the coordinated execution wrapper that groups those remaining items into one focused delivery sequence before more corpus expansion proceeds.

Functional Criteria:
- Literary modeling can express all currently modeled people and places relevant to a book or literary unit, not just a single anchor location or a narrow event-participant subset.
- Current canonical book datasets can be backfilled with normalized literary people and place references, plus any missing supporting records needed for those references.
- Active explorer view, selected event, and timeline filters can be restored from the URL.
- Relationship context, Luke-Acts continuity, source discoverability, and claim cues are completed across the existing explorer surfaces.
- Release verification catches unsupported `ESV` text usage or missing rights metadata before deployment.
- Bundle-size or view-loading hardening reduces the current main-chunk risk without regressing explorer behavior.

Verification Method:
- Schema and validation tests cover literary-unit people and place references, duplicate prevention, and unknown-reference failures.
- Dataset validation confirms every new literary reference resolves to known canonical people and places, and any intentional coverage limits are documented clearly in dataset notes or summaries.
- UI tests cover deep linking, URL-backed filter restoration, relationship cards, continuity cues, source explorer controls, and claim discoverability indicators.
- Release verification covers rights metadata, attribution requirements, quotation-budget rules, and current build-size expectations.

Backend Methods:
- None.
- Static schema expansion, canonical dataset enrichment, client-side derived indexes, and release-time verification only.

Frontend Features:
- Literary-unit and book-level people or place reference context.
- URL-persistent explorer state.
- Relationship and continuity context.
- Source explorer controls and rights-policy surfacing.
- Claim discoverability cues.
- Bundle-size hardening or lazy-loaded explorer surfaces where needed.

Deployment Requirements:
- Fly.io deployments must remain static-first and continue booting from validated canonical datasets.
- Release verification must block unsupported direct `ESV` text usage, missing attribution metadata, or broken literary references.
- Bundle strategy changes must preserve current map, timeline, inspector, and sources behavior under production builds.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-104 | 13b. Literary reference coverage and foundational closeout | Done | P1 | Literary schema | Extend the canonical literary model so `books` and `literary_units` can carry normalized people and place reference material beyond a single `location_id` or `participant_ids` list, with room to distinguish primary anchors from broader literary-reference context. | [src/data/schema.ts](src/data/schema.ts), [src/domain/dataset.ts](src/domain/dataset.ts), [src/data/literaryCoverage.ts](src/data/literaryCoverage.ts), and [src/data/validateDataset.ts](src/data/validateDataset.ts) now support `related_person_ids` and `related_place_ids`, reject unknown IDs, detect duplicate or anchor-colliding literary references, and compute book-level literary coverage summaries for validation tooling. |
| BL-105 | 13b. Literary reference coverage and foundational closeout | Done | P1 | Canonical reference material | Backfill Matthew, Mark, Luke, John, and Acts with fuller literary-unit and book-level people or place references, adding any missing normalized person or place records required to support those references. | [data/matthew.yaml](data/matthew.yaml), [data/mark.yaml](data/mark.yaml), [data/luke.yaml](data/luke.yaml), [data/john.yaml](data/john.yaml), and [data/acts.yaml](data/acts.yaml) now carry book-level literary reference registries plus enriched literary-unit context, and [`npm run validate:data -- data/acts.yaml data/luke.yaml data/matthew.yaml data/mark.yaml data/john.yaml`](package.json) reports full literary coverage for all shipped people and places in every dataset. |
| BL-106 | 13b. Literary reference coverage and foundational closeout | Planned | P1 | URL state | Complete the remaining deep-linking and filter-persistence work from phases `5` and `6` so active view, selected event, and timeline filters survive reloads, sharing, and browser navigation. | This phase closes [BL-043](#phase-6-event-inspector-and-record-detail) and [BL-044](#phase-5-timeline-explorer): shared URLs restore valid explorer state, invalid values fail safely, and browser back-forward behavior remains synchronized with shell state. |
| BL-107 | 13b. Literary reference coverage and foundational closeout | Planned | P1 | Relationship and continuity context | Complete the remaining relationship-context work from phases `6`, `8`, and `10`, including richer Acts figure relationships and explicit Luke-to-Acts continuity cues grounded in normalized records. | This phase closes [BL-045](#phase-6-event-inspector-and-record-detail), [BL-047](#phase-8-people-explorer-and-entity-context), and [BL-048](#phase-10-luke-multi-book-expansion): inspector and people views surface denser relationship context, continuity cues resolve by stable IDs, and cross-record navigation remains validated. |
| BL-108 | 13b. Literary reference coverage and foundational closeout | Planned | P2 | Source transparency and discoverability | Complete the remaining source-explorer and claim-discoverability work from phases `11` and `13`, including witness filters, cross-view claim cues, and in-app visibility for corpus coverage plus citation-only scripture policy. | This phase closes [BL-049](#phase-11-external-sources-and-claims-layer), [BL-050](#phase-11-external-sources-and-claims-layer), and [BL-099](#phase-13-new-testament-source-inventory-and-esv-rights): users can filter sources by type, confidence, or rights status, discover claim-backed records from dense surfaces, and review current source-policy coverage without leaving the app. |
| BL-109 | 13b. Literary reference coverage and foundational closeout | Planned | P2 | Compliance automation | Complete the remaining `ESV` release-safety work from phase `13` by adding automated checks for direct-text usage, attribution requirements, rights metadata, and quotation-budget limits. | This phase closes [BL-100](#phase-13-new-testament-source-inventory-and-esv-rights): validation or release tooling fails safely when embedded `ESV` text appears without matching rights metadata, required attribution, or compliant verse-count accounting. |
| BL-110 | 13b. Literary reference coverage and foundational closeout | Planned | P1 | Explorer performance | Complete the remaining bundle-size hardening work from phase `7`, likely through lazy-loading Leaflet or other view-specific surfaces, without weakening the current static-first deployment path. | This phase closes [BL-046](#phase-7-map-explorer-and-place-interaction): `npm run build` no longer emits the current large-chunk warning, or any remaining warning is deliberately re-baselined with measured tradeoffs and documented acceptance criteria. |

## Phase 14. Book Metadata And Literary Unit Modeling

Description: Extend the canonical model beyond Acts-style event narratives so letters, sermons, and visionary material can be ingested without distortion.

Goal: Support full-New-Testament modeling through shared book metadata, literary-unit anchors, and letter-context structures.

Functional Criteria:
- The data model can represent book metadata such as canonical order, corpus, authorship notes, and genre.
- Literary units or pericope-level anchors exist for books that are not best expressed as journeys or dense event streams.
- Letter-oriented books can express sender, co-sender, recipient, destination, composition place, and dispatch context.

Verification Method:
- Schema and validation tests cover book metadata, literary-unit ranges, and letter-context references.
- Dataset fixtures prove that narrative, epistolary, and apocalyptic books can validate under one shared model.
- UI smoke tests confirm non-journey books can still render meaningfully in the explorer.

Backend Methods:
- No backend service.
- Canonical schema, validation logic, and shared dataset-derivation helpers only.

Frontend Features:
- Book metadata support.
- Letter-context views.
- Literary-unit aware explorer surfaces for books with fewer mapped events.

Deployment Requirements:
- Static Fly.io builds must continue to boot from validated datasets without adding a server dependency.
- Expanded modeling should not break current Luke-Acts rendering or build output.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-063 | 14. Book metadata and literary unit modeling | Done | P2 | Schema | Extend the canonical schema to support book metadata, literary units, and letter-context records for the remaining New Testament corpus. | [src/data/schema.ts](src/data/schema.ts) and [src/domain/dataset.ts](src/domain/dataset.ts) now define canonical `books` and `literary_units` records plus structured letter-context and scripture-guardrail fields, while [data/luke.yaml](data/luke.yaml) and [data/acts.yaml](data/acts.yaml) ship the first modeled book records and literary-unit anchors. |
| BL-064 | 14. Book metadata and literary unit modeling | Done | P2 | Validation | Add validation rules for passage-range formatting, book-order metadata, recipient endpoint resolution, and cross-book reference integrity. | [src/data/validateDataset.ts](src/data/validateDataset.ts), [src/tests/validateDataset.test.ts](src/tests/validateDataset.test.ts), and [src/tests/bookModeling.test.ts](src/tests/bookModeling.test.ts) now reject malformed passage ranges and broken book-context references while validating narrative, epistolary, and apocalyptic fixtures under one shared model. |
| BL-065 | 14. Book metadata and literary unit modeling | Done | P2 | Explorer adaptation | Adapt timeline, map, people, and sources surfaces so letter-heavy and discourse-heavy books remain useful even when journey or map content is sparse. | [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), [src/components/TimelineView.tsx](src/components/TimelineView.tsx), [src/components/MapView.tsx](src/components/MapView.tsx), [src/components/PeopleView.tsx](src/components/PeopleView.tsx), [src/components/SourcesView.tsx](src/components/SourcesView.tsx), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now surface book metadata, literary units, composition or destination context, recipients, and source guardrails without requiring Acts-like journeys. |

## Phase 15. Synoptic Gospel Expansion

Description: Expand beyond Luke by adding the other synoptic witnesses with shared people, places, and explicit parallel-handling strategy.

Goal: Deliver canonical Matthew and Mark datasets plus the first cross-gospel parallel layer.

Functional Criteria:
- Matthew and Mark validate independently and merge cleanly into the shared library.
- Shared gospel people and places reuse stable IDs rather than duplicating records.
- Synoptic overlaps can be linked without collapsing distinct witness details into one summary.

Verification Method:
- Independent dataset validation passes for Matthew and Mark.
- Library merge tests confirm shared-ID reuse across Matthew, Mark, and Luke.
- UI tests verify book scoping and cross-gospel continuity remain understandable.

Backend Methods:
- None.
- Static dataset authoring, validation, and library-merge logic only.

Frontend Features:
- Book-aware gospel browsing.
- Synoptic continuity cues.
- Additional gospel events, places, people, and claims.

Deployment Requirements:
- New gospel datasets must ship as static artifacts in the Fly.io image.
- Multi-gospel loading should preserve current app startup reliability.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-066 | 15. Synoptic gospel expansion | Done | P2 | Matthew dataset | Create a canonical Matthew dataset with normalized events, places, people, tags, and source-backed claims aligned to the shared schema. | [data/matthew.yaml](data/matthew.yaml), [src/tests/actsCanonicalDataset.test.ts](src/tests/actsCanonicalDataset.test.ts), and [`npm run validate:data -- data/acts.yaml data/luke.yaml data/matthew.yaml data/mark.yaml data/john.yaml`](package.json) now validate Matthew independently, reuse stable shared IDs where appropriate, and provide enough coverage for meaningful rail, timeline, people, inspector, and sources views. |
| BL-067 | 15. Synoptic gospel expansion | Done | P2 | Mark dataset | Create a canonical Mark dataset with normalized narrative events, places, people, tags, and source-backed claims aligned to the shared schema. | [data/mark.yaml](data/mark.yaml), [src/tests/actsCanonicalDataset.test.ts](src/tests/actsCanonicalDataset.test.ts), and [src/tests/bootstrapExplorerDataset.test.ts](src/tests/bootstrapExplorerDataset.test.ts) now validate Mark independently, merge its shared entities without duplication, and keep the embedded app bootable with Mark in the canonical library. |
| BL-068 | 15. Synoptic gospel expansion | Done | P2 | Parallels | Model synoptic parallel or continuity links across Matthew, Mark, and Luke without erasing witness-specific chronology, phrasing, or emphasis. | Shared claim records such as `claim_synoptic_baptism_inaugural_witness`, `claim_synoptic_feeding_five_thousand`, and `claim_synoptic_entry_jerusalem` now merge across [data/matthew.yaml](data/matthew.yaml), [data/mark.yaml](data/mark.yaml), and [data/luke.yaml](data/luke.yaml); [src/domain/library.ts](src/domain/library.ts) tracks multi-book claim provenance; and [src/components/EventInspector.tsx](src/components/EventInspector.tsx) plus [src/tests/App.test.tsx](src/tests/App.test.tsx) surface those parallels as continuity cues instead of merged summaries. |
| BL-102 | 15. Synoptic gospel expansion | Planned | P2 | Comparison UX | Surface lightweight continuity badges directly on rail or timeline cards so synoptic-linked events are discoverable before opening the inspector. | Users can spot synoptic-linked records from dense list views, continuity cues stay grounded in merged claim provenance, and witness-specific event summaries remain distinct. |

## Phase 16. John And Johannine Narrative

Description: Add the fourth Gospel as a distinct narrative witness with its own chronology, symbolism, and geography.

Goal: Deliver a canonical John dataset and the supporting structures needed for Johannine signs, discourses, and feast context.

Functional Criteria:
- John validates as a distinct gospel witness under the shared schema.
- The app can model signs, discourses, and feast-linked chronology without flattening them into generic events.
- Shared people and places integrate with the broader library by stable ID.

Verification Method:
- `data/john.yaml` validates cleanly.
- UI tests confirm book-level scoping and source-grounded John records render correctly.
- Claims tests cover Johannine chronology or authorship notes without mixing them into canonical summaries.

Backend Methods:
- None.
- Static dataset, claim modeling, and shared entity resolution only.

Frontend Features:
- John-specific record browsing.
- Johannine place and people context.
- Source-backed claims for feast chronology, symbolism, or discourse framing.

Deployment Requirements:
- John must load through the current static bootstrap path without introducing a backend dependency.
- New claims and records must not regress current Luke-Acts startup behavior.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-069 | 16. John and Johannine narrative | Done | P2 | John dataset | Create a canonical John dataset with normalized events, places, people, tags, and claims. | [data/john.yaml](data/john.yaml), [src/tests/actsCanonicalDataset.test.ts](src/tests/actsCanonicalDataset.test.ts), [src/tests/bootstrapExplorerDataset.test.ts](src/tests/bootstrapExplorerDataset.test.ts), and `npm run validate:data -- data/acts.yaml data/luke.yaml data/matthew.yaml data/mark.yaml data/john.yaml` now validate John independently, merge it into the shared library, and provide enough content for timeline, people, sources, and inspector flows. |
| BL-070 | 16. John and Johannine narrative | Done | P2 | Narrative semantics | Add support for Johannine signs, discourses, feast cycles, and related interpretive claims where the canonical record benefits from more than simple event cards. | [src/domain/books.ts](src/domain/books.ts), [src/components/ExplorerStage.tsx](src/components/ExplorerStage.tsx), [src/components/TimelineView.tsx](src/components/TimelineView.tsx), [src/domain/timeline.ts](src/domain/timeline.ts), [src/tests/bookModeling.test.ts](src/tests/bookModeling.test.ts), and [src/tests/App.test.tsx](src/tests/App.test.tsx) now distinguish signs, discourse units, and feast-linked chronology while keeping citations and claims source-backed. |
| BL-103 | 16. John and Johannine narrative | Planned | P2 | Semantic discoverability | Surface lightweight Johannine semantic cues directly on dense rail or timeline cards so signs, discourses, and feast-linked records are discoverable before opening context panels. | John-scoped rail or timeline cards show clear semantic cues derived from canonical tag groups, cues stay consistent with the overview or timeline semantics summaries, and they do not crowd out existing chronology, place, or citation metadata. |

## Phase 17. Pauline Mission Letters

Description: Add the Pauline letters most tightly connected to mission travel, early church formation, and cross-links with Acts chronology.

Goal: Deliver the first six Pauline correspondence datasets and tie them to the existing missionary and city context already modeled in Acts.

Functional Criteria:
- Each letter validates independently under the shared schema.
- Acts-linked cities, co-workers, and chronology anchors are reused rather than duplicated.
- Letter composition and recipient context remain distinct from canonical event summaries.

Verification Method:
- Each letter dataset validates cleanly.
- Cross-book merge tests confirm shared places and people remain stable by ID.
- UI tests confirm letter books can be scoped, browsed, and inspected without requiring map-heavy content.

Backend Methods:
- None.
- Static dataset authoring plus cross-book merge logic only.

Frontend Features:
- Pauline letter browsing.
- Composition and recipient context.
- Acts-to-letter continuity cues.

Deployment Requirements:
- Fly.io static builds must continue to succeed as additional letter datasets are bundled.
- App initialization should remain performant as the library grows beyond Luke-Acts.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-071 | 17. Pauline mission letters | Planned | P2 | Romans dataset | Create a canonical Romans dataset with letter metadata, recipient context, argument units, and source-backed claims where needed. | `data/romans.yaml` validates and provides meaningful composition, people, place, and claims coverage without forcing Romans into an Acts-like journey shape. |
| BL-072 | 17. Pauline mission letters | Planned | P2 | 1 Corinthians dataset | Create a canonical 1 Corinthians dataset tied to Corinthian context, co-workers, and major argument sections. | `data/1_corinthians.yaml` validates, cross-links to Corinth and Pauline co-workers, and supports explorer browsing through literary units and letter metadata. |
| BL-073 | 17. Pauline mission letters | Planned | P2 | 2 Corinthians dataset | Create a canonical 2 Corinthians dataset with correspondence-sequence context, places, people, and claims where uncertainty matters. | `data/2_corinthians.yaml` validates and preserves source-backed chronology or correspondence-sequence uncertainty explicitly. |
| BL-074 | 17. Pauline mission letters | Planned | P2 | Galatians dataset | Create a canonical Galatians dataset with recipient options, controversy links, and mission-network context. | `data/galatians.yaml` validates and keeps recipient or dating uncertainty modeled as claims rather than silently embedded assumptions. |
| BL-075 | 17. Pauline mission letters | Planned | P2 | 1 Thessalonians dataset | Create a canonical 1 Thessalonians dataset with early mission aftermath, recipients, and chronology anchors. | `data/1_thessalonians.yaml` validates and integrates with Thessalonian city and co-worker context already modeled elsewhere in the library. |
| BL-076 | 17. Pauline mission letters | Planned | P2 | 2 Thessalonians dataset | Create a canonical 2 Thessalonians dataset with follow-up correspondence context and eschatological claim handling. | `data/2_thessalonians.yaml` validates and models authorship or chronology debates explicitly where the data layer needs them. |
| BL-077 | 17. Pauline mission letters | Planned | P2 | Continuity | Link these letters to Acts-era journeys, cities, and co-workers so mission and correspondence contexts can be explored together. | Cross-book continuity cues resolve by stable IDs, remain citation-backed, and help users move between Acts events and the related letters safely. |

## Phase 18. Pauline Captivity And Pastoral Letters

Description: Add the remaining Pauline letters as a second coherent corpus focused on imprisonment, captivity, pastoral oversight, and delegated ministry.

Goal: Deliver the final seven Pauline correspondence datasets plus the relationship structures needed for church and delegate context.

Functional Criteria:
- Each captivity or pastoral letter validates independently under the shared schema.
- Delegate networks, recipient churches, and composition settings are modeled explicitly.
- Shared Pauline people, cities, and claims remain normalized across the library.

Verification Method:
- Each dataset validates cleanly.
- Relationship and recipient-reference tests confirm endpoints resolve by stable ID.
- UI tests confirm letter-heavy books remain browsable with sparse map or journey data.

Backend Methods:
- None.
- Static datasets, relationship records, and shared-entity merge logic only.

Frontend Features:
- Pastoral network context.
- Captivity-letter composition and delivery context.
- Additional cross-book relationship exploration.

Deployment Requirements:
- Static Fly.io builds must continue to boot reliably as more Pauline books are added.
- Letter-oriented UI additions must not regress existing narrative-book behavior.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-078 | 18. Pauline captivity and pastoral letters | Planned | P2 | Ephesians dataset | Create a canonical Ephesians dataset with letter metadata, recipients, and key literary units. | `data/ephesians.yaml` validates and integrates with shared Pauline people, places, and church-context records. |
| BL-079 | 18. Pauline captivity and pastoral letters | Planned | P2 | Philippians dataset | Create a canonical Philippians dataset with imprisonment context, co-workers, and Philippian recipient ties. | `data/philippians.yaml` validates and links cleanly to Philippi plus existing Pauline network records. |
| BL-080 | 18. Pauline captivity and pastoral letters | Planned | P2 | Colossians dataset | Create a canonical Colossians dataset with destination context, co-senders, and linked church network records. | `data/colossians.yaml` validates and cross-links to related places, people, and nearby church contexts without duplicate entities. |
| BL-081 | 18. Pauline captivity and pastoral letters | Planned | P2 | Philemon dataset | Create a canonical Philemon dataset with house-church, relationship, and dispatch context. | `data/philemon.yaml` validates and makes the Onesimus-Philemon network explorable through normalized relationship records. |
| BL-082 | 18. Pauline captivity and pastoral letters | Planned | P2 | 1 Timothy dataset | Create a canonical 1 Timothy dataset with Ephesus-related pastoral context, church-order records, and co-worker metadata. | `data/1_timothy.yaml` validates and models pastoral instructions through literary units plus related people and places. |
| BL-083 | 18. Pauline captivity and pastoral letters | Planned | P2 | 2 Timothy dataset | Create a canonical 2 Timothy dataset with imprisonment context, final co-worker network, and chronology notes. | `data/2_timothy.yaml` validates and preserves uncertainty or later-tradition claims explicitly where needed. |
| BL-084 | 18. Pauline captivity and pastoral letters | Planned | P2 | Titus dataset | Create a canonical Titus dataset with Crete context, delegate oversight, and governance-related literary units. | `data/titus.yaml` validates and integrates with pastoral-network modeling rather than isolated free-text summaries. |
| BL-085 | 18. Pauline captivity and pastoral letters | Planned | P2 | Church network modeling | Expand recipient-church, elder, co-worker, and household relationship modeling so the captivity and pastoral letters have adequate structural support. | Shared relationship and church-context records validate cleanly and provide meaningful explorer context across the captivity and pastoral corpora. |

## Phase 19. Hebrews And General Epistles

Description: Add the non-Pauline letters and Hebrews as a coherent corpus built around sermon structure, dispersed audiences, and church-network context.

Goal: Deliver canonical datasets for Hebrews, James, 1-2 Peter, 1-3 John, and Jude.

Functional Criteria:
- Each book validates independently under the shared schema.
- Audience, destination, and authorship uncertainty can be modeled without overstating certainty.
- Shared church, people, and claim records remain normalized across the library.

Verification Method:
- Each dataset validates cleanly.
- Claims tests cover destination, authorship, or literary-dependence questions where applicable.
- UI tests confirm these books render meaningfully through literary units, recipients, and source-backed notes.

Backend Methods:
- None.
- Static datasets, claim modeling, and shared entity resolution only.

Frontend Features:
- General-epistle browsing.
- Audience and church-network context.
- Uncertainty-aware literary-unit display.

Deployment Requirements:
- Static Fly.io deployment must continue to serve all books without a dynamic content service.
- Corpus growth should remain compatible with future lazy-loading or chunking work already tracked elsewhere.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-086 | 19. Hebrews and general epistles | Planned | P2 | Hebrews dataset | Create a canonical Hebrews dataset with literary units, audience notes, and source-backed authorship or destination claims where needed. | `data/hebrews.yaml` validates and keeps disputed metadata in the claims layer rather than embedding unsupported certainty into summaries. |
| BL-087 | 19. Hebrews and general epistles | Planned | P2 | James dataset | Create a canonical James dataset with Jerusalem-linked context, audience metadata, and thematic literary units. | `data/james.yaml` validates and integrates with shared people, places, and church context where supportable. |
| BL-088 | 19. Hebrews and general epistles | Planned | P2 | 1 Peter dataset | Create a canonical 1 Peter dataset with diaspora-audience context, Petrine links, and Asia Minor geography where modeled. | `data/1_peter.yaml` validates and preserves audience and place references through normalized IDs and source-backed notes. |
| BL-089 | 19. Hebrews and general epistles | Planned | P2 | 2 Peter dataset | Create a canonical 2 Peter dataset with literary units and explicit authorship or dating claims where relevant. | `data/2_peter.yaml` validates and keeps debated metadata separate from the base canonical record. |
| BL-090 | 19. Hebrews and general epistles | Planned | P2 | 1 John dataset | Create a canonical 1 John dataset with literary units, community context, and Johannine continuity links. | `data/1_john.yaml` validates and integrates with shared Johannine people, claims, and church-network context where appropriate. |
| BL-091 | 19. Hebrews and general epistles | Planned | P2 | 2 John dataset | Create a canonical 2 John dataset with short-letter metadata, recipient notes, and literary-unit anchors. | `data/2_john.yaml` validates and handles uncertain recipient identity through claims rather than hard-coded assumptions. |
| BL-092 | 19. Hebrews and general epistles | Planned | P2 | 3 John dataset | Create a canonical 3 John dataset with named-person relationships, hospitality context, and local church-network modeling. | `data/3_john.yaml` validates and provides relationship-driven explorer value despite the book’s short length. |
| BL-093 | 19. Hebrews and general epistles | Planned | P2 | Jude dataset | Create a canonical Jude dataset with literary units, intertextual claims, and relation-to-2-Peter notes where appropriate. | `data/jude.yaml` validates and keeps intertextual or authorship questions in the modeled claims layer. |

## Phase 20. Revelation And Apocalyptic Layer

Description: Add Revelation as a special-case canonical source with explicit handling for churches, vision cycles, symbolism, and apocalyptic claims.

Goal: Deliver a canonical Revelation dataset and the supporting UI semantics needed for visionary material.

Functional Criteria:
- Revelation validates under the shared schema without pretending its vision cycles are ordinary Acts-style chronology.
- The seven churches and Patmos context can be explored through normalized places and recipient-like structures.
- Symbolic or debated interpretive content remains in claims rather than in canonical summaries.

Verification Method:
- `data/revelation.yaml` validates cleanly.
- UI and domain tests confirm vision cycles, church targets, and claims render without breaking other books.
- Source-view tests confirm interpretive claims remain clearly distinguished from the canonical witness.

Backend Methods:
- None.
- Static dataset authoring and claim-layer modeling only.

Frontend Features:
- Revelation book scope.
- Seven-church context.
- Vision-sequence and symbolism-aware record presentation.

Deployment Requirements:
- Static Fly.io deployment must continue to function without a backend.
- Revelation-specific UI additions should remain compatible with existing navigation and selection state.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-094 | 20. Revelation and apocalyptic layer | Planned | P2 | Revelation dataset | Create a canonical Revelation dataset with literary units, seven-church context, places, people, and source-backed claims. | `data/revelation.yaml` validates and provides meaningful explorer coverage without collapsing debated interpretation into the canonical record itself. |
| BL-095 | 20. Revelation and apocalyptic layer | Planned | P2 | Apocalyptic semantics | Extend the explorer as needed to represent vision cycles, church messages, and symbolic claims safely and clearly. | Domain helpers, UI tests, and manual review confirm Revelation can be browsed without forcing misleading map, timeline, or journey assumptions. |

## Phase 21. Full New Testament Library Integration

Description: Harden the application for a full `27`-book New Testament library after the remaining datasets have been added.

Goal: Make the app usable, testable, and performant as a complete New Testament explorer rather than a Luke-Acts prototype.

Functional Criteria:
- The full New Testament library loads, validates, and scopes correctly by book and corpus.
- Explorer navigation respects canonical order and remains understandable at larger scale.
- Performance, bundle size, and regression coverage remain acceptable for the larger static corpus.

Verification Method:
- Full-library validation passes across all New Testament datasets together.
- UI tests verify canonical-order navigation, book scoping, and cross-book continuity for representative books.
- Build and performance checks confirm the static Fly.io app remains deployable.

Backend Methods:
- None by default.
- Static dataset loading, indexing, and client-side optimization only.

Frontend Features:
- Full-library navigation.
- Canonical order and corpus grouping.
- Scalability improvements for rail, search, and dataset loading.

Deployment Requirements:
- The final full-New-Testament library must still deploy as a static Fly.io app image.
- Bundle-size and loading-strategy changes should resolve or materially reduce the current large-chunk warning.

| ID | Phase | Status | Priority | Area | Feature | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| BL-096 | 21. Full New Testament library integration | Planned | P2 | Data bootstrap | Optimize full-library bootstrap, indexing, and lazy-loading so all New Testament datasets can load without overwhelming the current client bundle. | The app can load the complete New Testament library, startup remains acceptable, and bundle warnings are either resolved or explicitly re-baselined with measured tradeoffs. |
| BL-097 | 21. Full New Testament library integration | Planned | P2 | Navigation | Add canonical-order and corpus-aware navigation so users can move through all `27` books coherently in the explorer shell. | Rail, book filters, and library controls present books in canonical order, support corpus grouping, and preserve current selection and scope behavior. |
| BL-098 | 21. Full New Testament library integration | Planned | P2 | Regression coverage | Expand validation, unit, and UI regression coverage to prove the explorer remains stable with the full New Testament corpus loaded together. | End-to-end validation passes across all New Testament datasets, representative UI tests cover each corpus, and previously fixed Luke-Acts regressions remain protected. |
