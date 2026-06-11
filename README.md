# Bible Time & Place Explorer

## Application Purpose

Bible Time & Place Explorer is a source-grounded application for exploring biblical events across time and geography. The current canonical library now includes both the Gospel of Luke and the Book of Acts, with Acts remaining the default focus while the shared architecture proves multi-book expansion, explicit uncertainty, and traceable citations for every visible claim.

## Current Development Status

The repository now has a working Phase 11 Luke-Acts explorer layer on top of the scaffold, delivery baseline, validation tooling, canonical datasets, explorer shell, timeline explorer, map explorer, people explorer, journey overlays, source explorer, and event inspector.

- Core planning documents are in place in `AGENTS.md`, `STRATEGY.md`, and `BACKLOG.md`.
- A strict TypeScript `React + Vite + Vitest` frontend scaffold is in place.
- The current UI is a dataset-backed explorer shell that boots from validated canonical Luke and Acts datasets, merges them into a shared library, and keeps a shared selected-event state across top-level views.
- Delivery hardening is now in place with a GitHub Actions verification workflow, Node runtime guidance, and baseline Fly.io deployment files for the static frontend.
- Canonical schema and validation tooling are now in place for normalized YAML or JSON datasets, including referential-integrity checks and a dataset validation CLI.
- Source records now support structured usage-rights metadata so terms of use, licensing, and attribution requirements can be tracked as data work continues.
- Validated canonical datasets now exist in [data/acts.yaml](/Users/rakirk/dev/acts/data/acts.yaml) and [data/luke.yaml](/Users/rakirk/dev/acts/data/luke.yaml), covering 26 total events, 15 modeled claims, and multiple external witness types across the merged explorer library with shared-ID deduplication for common people, places, and other normalized records.
- `ACTS_TIMELINE.md` remains in the repository as the original source draft, while `data/acts.yaml` is now the canonical machine-parseable dataset.
- The explorer shell now includes top-level `Overview`, `Timeline`, `Map`, `People`, and `Sources` navigation, a searchable scripture event rail, book filters for `All Books`, `Acts`, and `Luke`, plus a responsive detail panel.
- The timeline view now renders book-aware scripture chronology with era bands, certainty legend cards, category-toned styling, and filters for category, person, place, certainty, and date range.
- The map view now renders validated places with Leaflet, basemap switching, location-certainty styling, journey overlay toggles, compact legends, attribution, and synchronized place and journey context panels tied to canonical records.
- The journey route surface now lets users select missionary journeys, inspect ordered stops, and jump into linked events without leaving the map explorer. The current journey data remains Acts-only.
- The people view now renders a searchable scripture biographical catalog with person summaries, aliases, appearance lists, related places, normalized relationship context, and source-backed record support.
- The event inspector now renders source-grounded record detail with chronology explanations, place context, participant summaries, source-type distinctions, journey context, related-event navigation, and a separate external-attestation claims section.
- People, place, and source actions from the inspector now open focused preview surfaces without losing the selected event.
- The sources view now acts as a dedicated source explorer with grouped witness types, confidence-modeled claims, chronology anchors, and surfaced rights metadata.
- The next major work is no longer the source layer itself; the remaining follow-up queue now centers on shared continuity cues, URL persistence, deeper relationship context, and bundle-size hardening.

## Setup

Use Node.js `22` or newer. The repository includes [`.nvmrc`](/Users/rakirk/dev/acts/.nvmrc) for local version alignment.

Install dependencies:

```bash
npm install
```

## Run The App

Start the local development server:

```bash
npm run dev
```

## Run Tests

Run the Vitest suite:

```bash
npm test
```

Run the local verification bundle used by CI:

```bash
npm run verify
```

Validate a canonical dataset file:

```bash
npm run validate:data -- path/to/dataset.yaml
```

Validate the current canonical library inputs together:

```bash
npm run validate:data -- data/acts.yaml data/luke.yaml
```

## Build

Create a production build:

```bash
npm run build
```

## Current App Scope

The current app is now a small but real Luke-Acts explorer shell with working timeline, map, people, sources, and journey-route exploration surfaces plus a source-grounded event detail panel.

- It proves the repository can build and test successfully.
- It boots directly from the validated canonical datasets in `data/acts.yaml` and `data/luke.yaml`.
- It merges both datasets into a normalized Luke-Acts library while preserving shared IDs for common people, places, sources, tags, and claims.
- It currently defaults to an Acts-focused view while letting users switch to `All Books`, `Acts`, or `Luke` from the shell.
- It provides shared view navigation for overview, a working timeline explorer, a working map explorer, a working people explorer, and a dedicated sources explorer.
- It includes a searchable scripture event rail with deterministic filtering and active selection styling.
- It includes a chronological book-aware timeline grouped into era bands and styled by category and certainty.
- It includes first-pass timeline filters for category, person, place, certainty, and date range.
- It includes a map explorer with validated place markers, basemap controls, journey overlay toggles, compact certainty and event-type legends, attribution, and a place interaction panel with related event links.
- It includes a journey focus panel with selectable missionary routes, ordered stop lists, linked events, source support, and synchronized place highlighting on the map.
- It includes a people explorer with searchable biographical records, alias and role metadata, linked appearances, place navigation, normalized relationship context, and source support for person records.
- It includes a dedicated source explorer with scriptural witnesses, external attestation groupings, claim cards, rights-status surfacing, and confidence framework copy inspired by the example UI structure.
- It includes a responsive event detail surface with chronology explanation, place context, participant summaries, journey context, related-event navigation, source-support details, and external-claims cards kept separate from canonical summaries.
- It includes linked person, place, and source focus actions that open the corresponding preview surfaces while preserving the current selected event.
- It includes baseline CI verification and Fly.io deployment configuration for the static frontend.
- It now includes canonical schema types, dataset loading utilities, and validation rules for normalized YAML or JSON datasets.
- It now tracks source usage-rights metadata in the schema and surfaces those rights states inside the source explorer and event-level citations.
- It now includes validated canonical Acts and Luke datasets plus a multi-book bootstrap and provenance layer.
- It now includes a modeled claims layer for chronology anchors, archaeological context, literary parallels, manuscript tradition, and later interpretation without overwriting canonical event summaries.
- It does not yet include URL persistence, relationship-driven inspector extensions, cross-view claim cues on the timeline or map, or the later shared-continuity follow-up work.

## Environment Policy

The current frontend does not require any runtime environment variables.

- Only variables prefixed with `VITE_` should ever be used in client-side code.
- Do not place API keys, backend credentials, or private secrets in frontend env files.
- [`.env.example`](/Users/rakirk/dev/acts/.env.example) is intentionally limited to safe placeholder guidance only.

## Fly.io Deployment

Baseline Fly.io deployment files are included in [fly.toml](/Users/rakirk/dev/acts/fly.toml), [Dockerfile](/Users/rakirk/dev/acts/Dockerfile), and [Caddyfile](/Users/rakirk/dev/acts/Caddyfile).

The current deployment flow is:

1. Update the `app` value in `fly.toml` to a unique Fly.io app name for your environment.
2. Authenticate with Fly.io using `flyctl auth login`.
3. Deploy with `fly deploy`.

The production image builds the Vite app and serves the generated `dist/` output as a static site on port `8080`.

## How `BACKLOG.md` Should Be Used

`BACKLOG.md` is the execution guide for upcoming work.

- Work phases in order unless a deliberate reprioritization is documented.
- Keep each phase narrow and coherent instead of bundling unrelated features into one release.
- Treat Phase 0 as scaffold and delivery hygiene, then move into schema and dataset validation before adding explorer features.
- Do not begin timeline, map, or journey UI work until the relevant validation and dataset prerequisites are complete.
- Update each backlog row’s `Status` and `Validation` notes as work lands so the file stays useful as a real delivery tracker.
- Use the validation column as part of the definition of done, not as an afterthought.
