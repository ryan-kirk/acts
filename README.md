# Bible Time & Place Explorer

## Application Purpose

Bible Time & Place Explorer is a source-grounded application for exploring biblical events across time and geography. The first product focus is the Book of Acts, with the long-term goal of expanding into Luke and additional historical sources while preserving referential integrity, explicit uncertainty, and traceable citations for every visible claim.

## Current Development Status

The repository now has a working Phase 1 delivery baseline on top of the initial app scaffold.

- Core planning documents are in place in `AGENTS.md`, `STRATEGY.md`, and `BACKLOG.md`.
- A strict TypeScript `React + Vite + Vitest` frontend scaffold is in place.
- The current UI is a simple landing page that explains the app purpose and states that the first dataset will focus on the Book of Acts.
- Delivery hardening is now in place with a GitHub Actions verification workflow, Node runtime guidance, and baseline Fly.io deployment files for the static frontend.
- An initial Acts source draft exists in `ACTS_TIMELINE.md`, but schema validation, canonical data loading, and timeline or map views have not been implemented yet.
- The next major work is Phase 2 in `BACKLOG.md`: canonical schema and validation.

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

## Build

Create a production build:

```bash
npm run build
```

## Current App Scope

The current scaffold is intentionally small.

- It proves the repository can build and test successfully.
- It provides a stable landing page for the project.
- It prepares the project structure for source-attributed data work.
- It includes baseline CI verification and Fly.io deployment configuration for the static frontend.
- It does not yet parse or validate `ACTS_TIMELINE.md`.

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
