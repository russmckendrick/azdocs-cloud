# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro static site at `https://azdocs.cloud`. The documentation and shared brand
assets are imported from the main azdocs repository during development and
production builds rather than maintained as a second editorial copy.

## Users

Azure, cloud-platform, and infrastructure engineers who need to understand an
estate they did not necessarily build: while onboarding to a tenant, preparing
a review, tracing a misconfiguration, or producing documentation for someone
else.

## Product Purpose

azdocs turns one read-only Azure Resource Graph collection into a durable local
SQLite snapshot. People can explore the saved evidence, trace relationships,
compare collections, and export diagrams and reports offline.

## Positioning

Collection and interpretation are deliberately separated. One read-only
collection becomes the stored evidence used by the CLI, desktop explorer,
diagrams, reports, and later comparisons.

## Operating Context

The product is available as a scriptable CLI and a Tauri desktop application.
Collection, connection tests, and explicit website capture need network access;
reports, diagrams, the terminal browser, and desktop exploration read the saved
SQLite evidence offline.

## Capabilities and Constraints

- Collection is read-only and designed to work with Azure Reader permissions.
- Output is deterministic for a fixed snapshot, application version,
  configuration, theme, labels, and fonts.
- The product surfaces scope and truncation instead of silently dropping data.
- Azure Resource Graph does not expose every possible data-plane or activity
  signal. The site must not imply complete coverage or live state.
- Installation is available through Homebrew and GitHub Releases. The site does
  not invent pricing, usage figures, customer claims, or benchmarks.

## Brand Commitments

Use the existing azdocs name and production SVG marks from
`docs/marks/assets/`. Preserve their exact topology-A construction and usage
rules. The voice is technical, calm, direct, and evidence-led. The marketing
site should be modern, animated, concise, and visually distinct from the
application's Field Report presentation.

## Evidence on Hand

- Product truth and capabilities: the main repository's `PRODUCT.md`,
  `README.md`, and `docs/` tree.
- Production marks: `docs/marks/assets/` in the main repository.
- Azure service artwork: the vendored `data/icons/` catalogue.
- Existing Map behavior and terminology: the desktop topology implementation
  and its documentation.
- No customer logos, testimonials, pricing, benchmarks, or adoption figures are
  available and none may be fabricated.

## Product Principles

- Say exactly what was collected, stored, and exported.
- Show the relationship model instead of describing it at length.
- Make the route from broad estate signal to exact stored evidence obvious.
- Keep documentation authoritative in the main azdocs repository.
- Prefer concise product proof over generic SaaS persuasion.

## Accessibility & Inclusion

Target keyboard operation, visible focus, WCAG 2.2 AA contrast, semantic
controls, resilient text scaling, and responsive layouts. Honour reduced-motion
preferences and never rely on colour alone to communicate meaning.
