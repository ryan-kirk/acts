# Bible Time & Place Explorer

## Application Purpose

Bible Time & Place Explorer is a source-grounded application for exploring biblical events across time, geography, literary structure, and source context. The current canonical library now includes Matthew, Mark, Luke, John, and Acts, with Acts remaining the default focus while the shared architecture supports multi-book metadata, literary-unit modeling, explicit uncertainty, Johannine narrative semantics, and traceable citations for every visible claim.

## Current Development Status

The repository now has a working Phase 16 explorer layer on top of the scaffold, delivery baseline, validation tooling, multi-book canonical datasets, explorer shell, timeline explorer, map explorer, people explorer, journey overlays, source explorer, event inspector, and the shared book-metadata plus literary-unit modeling layer.

- Core planning documents are in place in `AGENTS.md`, `STRATEGY.md`, and `BACKLOG.md`.
- A strict TypeScript `React + Vite + Vitest` frontend scaffold is in place.
- The current UI boots from validated canonical Matthew, Mark, Luke, John, and Acts datasets, merges them into one shared library, and keeps a shared selected-event state across top-level views.
- Delivery hardening is in place with GitHub Actions verification, Node runtime guidance, and baseline Fly.io deployment files for the static frontend.
- Canonical schema and validation tooling are in place for normalized YAML or JSON datasets, including referential-integrity checks, book metadata, literary units, source-rights metadata, and a dataset validation CLI.
- Validated canonical datasets now exist in [data/matthew.yaml](data/matthew.yaml), [data/mark.yaml](data/mark.yaml), [data/luke.yaml](data/luke.yaml), [data/john.yaml](data/john.yaml), and [data/acts.yaml](data/acts.yaml), covering `5` modeled book records, `20` literary units, `58` total events, `24` merged claims, `35` places, and `27` people in the shared library.
- [SOURCES.md](SOURCES.md) now inventories all `27` New Testament books, documents the currently modeled Matthew-Mark-Luke-John-Acts extraction coverage, and records the project’s current citation-only `ESV` rights workflow.
- The explorer shell includes top-level `Overview`, `Timeline`, `Map`, `People`, and `Sources` navigation, a searchable scripture event rail, book filters for `All Books`, `Acts`, `Matthew`, `Mark`, `Luke`, and `John`, explicit scope messaging, and a responsive detail panel.
- The overview acts as a control hub for book scope, shared claim-confidence filtering, active book metadata, and literary-unit coverage so partial gospel coverage is visible from first load.
- The overview and timeline now surface Johannine narrative semantics for John, including signs, discourses, and feast-linked chronology as source-backed structural cues rather than flattened generic event metadata.
- The event inspector now includes dedicated synoptic continuity cues, allowing Matthew, Mark, and Luke parallels to remain distinct while still linking across books.
- The map, people, and sources views remain synchronized with shared selection and still render Acts journey context without requiring journey-heavy behavior from the Gospel datasets.

## Setup

Use Node.js `22` or newer. The repository includes [`.nvmrc`](.nvmrc) for local version alignment.

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
npm run validate:data -- data/acts.yaml data/luke.yaml data/matthew.yaml data/mark.yaml data/john.yaml
```

## Build

Create a production build:

```bash
npm run build
```

## Current App Scope

The current app is now a small but real Matthew-Mark-Luke-John-Acts explorer shell with working timeline, map, people, sources, journey-route exploration surfaces, and a source-grounded event detail panel.

- It proves the repository can build and test successfully.
- It boots directly from the validated canonical datasets in `data/matthew.yaml`, `data/mark.yaml`, `data/luke.yaml`, `data/john.yaml`, and `data/acts.yaml`.
- It merges those datasets into a normalized library while preserving shared IDs for common people, places, sources, tags, and continuity claims.
- It models canonical book records and literary units so future epistles, sermons, and apocalyptic books do not need to be forced into an Acts-like journey shape.
- It defaults to an Acts-focused view while letting users switch to `All Books`, `Acts`, `Matthew`, `Mark`, `Luke`, or `John` from the shell.
- It includes first-pass synoptic continuity cues in the inspector so gospel parallels can be followed across books without flattening their witness-specific summaries.
- It includes first-pass Johannine narrative semantics in the overview and timeline so signs, discourses, and feast-linked chronology remain visible as book-level structure.
- It includes a searchable event rail, a dense chronology board with filters, a synchronized map explorer, a people explorer, a source explorer, and an event inspector with cross-book navigation.
- It still includes four modeled Acts journey overlays, including the Rome voyage sequence, while the Gospel datasets remain useful through literary units, shared place or person context, and John-specific structural cues.
- It tracks source usage-rights metadata in the schema and surfaces rights status, citation-only posture, and ESV guardrails inside the sources UI and event citations.
- It includes fixture-verified epistolary and apocalyptic dataset coverage in the test suite so later New Testament corpora can be added without another schema rewrite.
- It does not yet include URL persistence, relationship-driven inspector extensions, rail or timeline continuity badges, or bundle-size hardening.
- `npm run build` currently passes, but Vite still warns about a large main chunk; bundle-size hardening remains tracked in the backlog.

## Environment Policy

The current frontend does not require any runtime environment variables.

- Only variables prefixed with `VITE_` should ever be used in client-side code.
- Do not place API keys, backend credentials, or private secrets in frontend env files.
- [`.env.example`](.env.example) is intentionally limited to safe placeholder guidance only.

## Fly.io Deployment

Baseline Fly.io deployment files are included in [fly.toml](fly.toml), [Dockerfile](Dockerfile), and [Caddyfile](Caddyfile).

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
