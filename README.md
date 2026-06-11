# Bible Time & Place Explorer

## Application Purpose

Bible Time & Place Explorer is a source-grounded application for exploring biblical events across time and geography. The first product focus is the Book of Acts, with the long-term goal of expanding into Luke and additional historical sources while preserving referential integrity, explicit uncertainty, and traceable citations for every visible claim.

## Current Development Status

The repository now has a working Phase 6 event inspector and record-detail layer on top of the scaffold, delivery baseline, validation layer, and canonical Acts dataset.

- Core planning documents are in place in `AGENTS.md`, `STRATEGY.md`, and `BACKLOG.md`.
- A strict TypeScript `React + Vite + Vitest` frontend scaffold is in place.
- The current UI is a dataset-backed explorer shell that boots from the canonical Acts dataset and keeps a shared selected-event state across top-level views.
- Delivery hardening is now in place with a GitHub Actions verification workflow, Node runtime guidance, and baseline Fly.io deployment files for the static frontend.
- Canonical schema and validation tooling are now in place for normalized YAML or JSON datasets, including referential-integrity checks and a dataset validation CLI.
- Source records now support structured usage-rights metadata so terms of use, licensing, and attribution requirements can be tracked as data work continues.
- A validated canonical Acts dataset now exists in [data/acts.yaml](/Users/rakirk/dev/acts/data/acts.yaml), covering 17 events, 14 places, 14 people, 3 journeys, 5 relationships, and tracked source-rights metadata.
- `ACTS_TIMELINE.md` remains in the repository as the original source draft, while `data/acts.yaml` is now the canonical machine-parseable dataset.
- The explorer shell now includes top-level `Overview`, `Timeline`, `Map`, `People`, and `Sources` navigation, a searchable Acts event rail, a responsive detail panel, and a real timeline explorer.
- The timeline view now renders canonical Acts events in chronological order with era bands, certainty legend cards, category-toned styling, and first-pass filters for category, person, place, certainty, and date range.
- The event inspector now renders source-grounded record detail with chronology explanations, place context, participant summaries, source-type distinctions, journey context, and related-event navigation.
- People, place, and source actions from the inspector now open focused preview surfaces without losing the selected Acts event.
- Map, people, and sources are still preview surfaces rather than their full dedicated explorer implementations.
- The next major work is Phase 7 in `BACKLOG.md`: map explorer and place interaction.

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

## Build

Create a production build:

```bash
npm run build
```

## Current App Scope

The current app is now a small but real explorer shell with a working timeline and a source-grounded event detail surface.

- It proves the repository can build and test successfully.
- It boots directly from the validated canonical Acts dataset in `data/acts.yaml`.
- It provides shared view navigation for overview, a working timeline explorer, and the remaining map, people, and sources previews.
- It includes a searchable Acts event rail with deterministic filtering and active selection styling.
- It includes a chronological Acts timeline grouped into era bands and styled by category and certainty.
- It includes first-pass timeline filters for category, person, place, certainty, and date range.
- It includes a responsive event detail surface with chronology explanation, place context, participant summaries, journey context, related-event navigation, and source-support details.
- It includes linked person, place, and source focus actions that open the corresponding preview surfaces while preserving the current selected event.
- It includes baseline CI verification and Fly.io deployment configuration for the static frontend.
- It now includes canonical schema types, dataset loading utilities, and validation rules for normalized YAML or JSON datasets.
- It now tracks source usage-rights metadata in the schema so licensing and terms information can be captured per source record.
- It now includes a validated canonical Acts dataset in `data/acts.yaml`.
- It does not yet include the dedicated map explorer, people explorer, sources explorer, URL persistence, or relationship-driven detail extensions planned for later phases.

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
