# azdocs.cloud

The Astro site for [azdocs.cloud](https://azdocs.cloud).

The site shell lives in this repository. Product documentation, brand assets,
the desktop showcase, and the example report stay authoritative in the main
[`azdocs`](https://github.com/russmckendrick/azdocs) repository and are imported
or generated at build time.

## Develop locally

Requirements: Node.js 22.12 or newer, pnpm 10, Rust, Poppler, and a complete
`azdocs` checkout beside this repository. The checked-in `.node-version`
selects Node 22.

```sh
pnpm install
pnpm --dir ../azdocs/desktop install
pnpm dev
```

`pnpm dev` prepares every product surface before starting Astro. It refreshes
the report when its renderer or fixture changed, typechecks and builds the
desktop showcase in forced dark mode, imports documentation and shared assets,
and verifies both generated manifests. By default it uses the sibling checkout
at `../azdocs`. Set `AZDOCS_SOURCE` to use another checkout:

```sh
AZDOCS_SOURCE=/path/to/azdocs pnpm dev
```

## Build

```sh
pnpm build
```

Each build refreshes stale generated product exports, builds the current dark
desktop showcase, imports the current documentation and shared assets, runs all
freshness checks and Astro's checks, and generates the static site in `dist/`.
The deploy workflow checks out both repositories, so the production artifact
always comes from one explicit azdocs revision.

Generated source and public assets are intentionally ignored by Git:

- `.azdocs-source/docs/`
- `public/docs/`
- `public/fonts/`
- `public/azure-icons/`
- `public/demo/`

The source import is in [`scripts/sync-azdocs.mjs`](scripts/sync-azdocs.mjs),
and the desktop build is in
[`scripts/build-desktop-demo.mjs`](scripts/build-desktop-demo.mjs).

## Refresh the example report

```sh
pnpm refresh:exports
```

This compiles the current sibling azdocs checkout and runs its canonical fixture
exporter in a fresh temporary directory. It saves the richer PDF assessment,
the untouched HTML fallback, and their source/output checksums under
`public/product-exports/`. It never copies an old file from the app's `output/`
directory. Rust and the azdocs Cargo dependencies must already be installed;
`AZDOCS_SOURCE` also applies to this command.

Development and builds now run this refresh automatically only when the source
digest is stale, then verify the artifact checksum. `pnpm refresh:exports`
remains useful when explicitly regenerating or diagnosing the fixture output.

## Desktop showcase

```sh
pnpm build:demo
pnpm check:demo
```

The showcase is a browser build of the current desktop source, not a parallel
HTML recreation. It uses the app's fixture API, omits machine-only Exports and
Settings actions, forces the dark variation before first paint, and emits a
manifest with source and full-output checksums under `public/demo/`. The landing
page uses the same build for its scroll-driven Overview, Map, Findings, and
Inventory sequence.

## Deploy

The GitHub Actions workflow builds on pushes to `main`, on pull requests, on a
nightly schedule, and by manual dispatch with an optional azdocs ref. Pull
requests stop after verification; other runs deploy the exact saved `dist`
artifact to Cloudflare. Configure these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

For an authenticated local deployment:

```sh
pnpm deploy
```

## Useful commands

```sh
pnpm check
pnpm build
pnpm preview
```

The production site is configured for `https://azdocs.cloud` in
`astro.config.mjs`; `wrangler.jsonc` serves the generated `dist/` directory as
Cloudflare static assets for the apex and `www` domains.
