---
name: azdocs.cloud
description: A deep-midnight, scroll-driven product theatre built around the current azdocs desktop application.
colors:
  theatre-void: "#07111e"
  theatre-deep: "#030a13"
  theatre-panel: "#0c1928"
  theatre-panel-soft: "#0a1624"
  theatre-ink: "#f4f8fc"
  theatre-body: "#c4d1df"
  theatre-muted: "#8ea1b5"
  theatre-faint: "#768ba1"
  theatre-line: "#20354b"
  theatre-line-strong: "#31506e"
  azure-action: "#168fe5"
  azure-signal: "#49b6ff"
  app-dark: "#101820"
  state-green: "#53d18d"
  severity-amber: "#f3bf4d"
  severity-coral: "#ff8066"
typography:
  display:
    fontFamily: '"Plex", "Segoe UI", system-ui, sans-serif'
    fontSize: "clamp(4rem, 8.4vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Plex", "Segoe UI", system-ui, sans-serif'
    fontSize: "clamp(2.8rem, 5.6vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  stage-title:
    fontFamily: '"Plex", "Segoe UI", system-ui, sans-serif'
    fontSize: "clamp(1.85rem, 3vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Plex", "Segoe UI", system-ui, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: '"Plex Mono", ui-monospace, monospace'
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.6
  cue:
    fontFamily: '"Plex", "Segoe UI", system-ui, sans-serif'
    fontSize: "0.69rem"
    fontWeight: 400
    lineHeight: 1.35
  display-mobile:
    fontSize: "3.35rem"
  navigation:
    fontSize: "0.88rem"
  action:
    fontSize: "0.95rem"
  not-found-title:
    fontSize: "3rem"
  not-found-body:
    fontSize: "1.1rem"
  docs-display:
    fontSize: "clamp(2.8rem, 5.2vw, 4.6rem)"
  docs-heading:
    fontSize: "1.85rem"
  docs-table:
    fontSize: "0.82rem"
  docs-display-mobile:
    fontSize: "clamp(2.6rem, 13vw, 3.6rem)"
  docs-heading-mobile:
    fontSize: "1.55rem"
  docs-body-mobile:
    fontSize: "0.93rem"
rounded:
  docs-control: "8px"
  compact: "10px"
  action: "11px"
  theatre: "14px"
  capsule: "999px"
spacing:
  tight: "8px"
  compact: "12px"
  control: "18px"
  content: "24px"
  theatre-gutter: "30px"
  section-gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.azure-action}"
    textColor: "{colors.theatre-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.action}"
    padding: "0 21px"
    height: "50px"
  button-secondary:
    backgroundColor: "{colors.theatre-panel-soft}"
    textColor: "{colors.theatre-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.action}"
    padding: "0 21px"
    height: "50px"
  app-window:
    backgroundColor: "{colors.app-dark}"
    textColor: "{colors.theatre-body}"
    rounded: "{rounded.theatre}"
    width: "min(1220px, calc(100vw - 70px))"
  export-proof:
    backgroundColor: "{colors.app-dark}"
    textColor: "{colors.theatre-body}"
    rounded: "{rounded.theatre}"
---

# Design System: azdocs.cloud

## Overview

**Creative north star: “The Workspace Takes the Stage.”**

azdocs.cloud is a deep-midnight product theatre whose primary evidence is the product itself. A direct first-view statement gives way to a pinned, near-full-width build of the current azdocs desktop app. Scrolling changes the real application through Overview, Map, Findings, and Inventory while fragments of the frame move outward to create the product-explosion moment.

The site and application now share a dark setting, but they remain distinct. The website is cinematic and spacious. The embedded desktop remains dense and operational, retaining its own source-controlled palette, typography, controls, Azure icons, and fixture data. The iframe is generated from the desktop source; it is not a second hand-authored copy.

After the product theatre, the page shows a freshly generated azdocs PDF as a three-column, independently scrolling contact sheet. Selecting any page opens a focused modal with previous/next navigation and a direct link to the original PDF. The byte-for-byte HTML export remains available as a fallback. The page then explains the collect-store-use workflow and points to documentation imported from the source repository. No generic SaaS cards, invented metrics, or customer theatre.

The story occupies roughly 480 small viewport heights with one sticky viewport:

- The story occupies roughly 480 small viewport heights with one sticky viewport.
- The heading fades and rises as the application scales from 62% into the stage.
- Four restrained frame fragments travel outwards during arrival. They provide the “explosion” without fabricating product controls.
- Scroll thresholds switch the same-origin showcase iframe through Overview, Map, Findings, and Inventory by activating its real navigation.
- Stage copy explains each current view; the application itself remains the dominant visual.
- The generated showcase is pinned to dark before first paint and uses `/demo/` as its asset base.
- A full-screen link gives users an interactive version; pointer events stay off in the scroll theatre so wheel input always advances the narrative.

Under reduced motion, the long scroll track collapses. The app is immediately visible, movement and scene copy disappear, and the iframe becomes directly interactive.

## Colors

The website uses Theatre Void and Deep for page depth, restrained panel tones for chrome, and Theatre Ink/Body/Muted/Faint as a four-step text hierarchy. Azure Action is reserved for primary actions; Azure Signal marks emphasis, links, focus, and the connection between narrative and product.

The desktop iframe owns its palette. The website may frame it with `app-dark` (`#101820`) but must not restyle internal app controls. Green, amber, and coral retain status or severity meaning and are always paired with text.

The generated PDF assessment is the primary proof surface. Its page previews sit on App Dark, while the modal returns to Theatre Deep and Panel. The byte-for-byte HTML output remains as an accessible browser fallback; site CSS does not rewrite either artifact.

## Typography

IBM Plex Sans carries website display and body copy. IBM Plex Mono is limited to source revisions, output formats, and compact stage labels. Typography inside the desktop preview and HTML report is owned by their generators.

- **Display:** `clamp(4rem, 8.4vw, 6rem)`, weight 600, line-height 0.92.
- **Section headline:** `clamp(2.8rem, 5.6vw, 5rem)`, weight 600, line-height 0.98.
- **Stage title:** `clamp(1.85rem, 3vw, 2.8rem)`, weight 600, line-height 1.02.
- **Body:** 1rem at line-height 1.6, held to a readable measure.
- **Metadata:** Plex Mono around 0.67–0.78rem.

## Layout

The application frame reaches 1220px inside a 1240px content system. Its browser chrome is deliberately quiet and the frame receives the strongest elevation on the page. Lower content returns to the shared shell: the report proof, eight-format ruled strip, collect-store-use sequence, and final install action.

The PDF contact sheet shows three pages per row on desktop, two on tablet, and one on mobile. It owns a bounded vertical scroll area so the 23-page report remains explorable without making the landing page unmanageably long. The modal uses the available viewport while preserving the full portrait page.

At tablet widths the desktop preview remains nearly full-width and provenance is removed. On narrow screens, a 900px app frame is cropped from a stable left-side origin so the application stays a coherent object rather than breaking into marketing cards. Stage copy becomes a compact translucent overlay.

## Elevation & Depth

The live application receives the strongest elevation: a long dark shadow plus a restrained Azure-blue ambient edge. PDF pages use compact shadows that separate white paper from the dark contact-sheet surface. The modal reuses the strong application elevation and a blurred black backdrop. Borders remain one pixel and subdued; depth comes from hierarchy rather than stacked decorative cards.

## Shapes

The theatre and export containers use a restrained 14px radius, actions use 11px, and compact controls use 8–10px. PDF pages stay square-cornered because they represent physical report sheets. Capsules are reserved for small state indicators and never become the default container shape.

## Components

### Buttons

Primary and secondary website actions are 50px high with an 11px radius. Focus always uses the shared two-pixel Azure Signal outline. The website never imitates buttons inside the embedded product.

### Live desktop showcase

`pnpm build:demo` typechecks and builds the current `azdocs/desktop` source with showcase mode enabled. It forces the generated entry document to dark, writes a provenance manifest, and hashes the complete output tree. The landing page imports that manifest for cache invalidation and a visible source revision. `pnpm check:demo` rejects stale source or changed generated files.

The scroll controller operates only against semantic navigation titles already rendered by the application. If scripted navigation is unavailable, the iframe remains a complete static preview and its full-screen link remains usable.

### PDF report proof

The PDF and HTML reports are produced together by the canonical Rust fixture runner, never copied from an old `output/` directory. Their shared manifest records renderer inputs, source revision, generation time, and both output checksums. The build refreshes them only when those inputs change, then verifies both before Astro runs.

The PDF is rendered to build-generated JPEG previews using Poppler. All 23 previews appear in the bounded contact sheet; selecting a page opens a native dialog with a large preview, keyboard arrow navigation, close affordances, and an explicit link to that page in the original PDF. The HTML export remains an adjacent text link rather than replacing the richer PDF.

### Workflow sequence

Collect, Store, and Use appear as three ruled stages connected by one Azure line. This is the only post-theatre capability summary: short labels, genuine Azure icons, and direct product language.

## Do's and Don'ts

- Do let the real desktop build dominate the product narrative.
- Do keep the sticky scroll, app arrival, frame explosion, and real view changes working together.
- Do regenerate the showcase and report from the checked-out azdocs source during build and deployment.
- Do keep all 23 PDF pages available in the scrollable contact sheet and modal.
- Do label fixture data and local-source provenance honestly.
- Do keep colour tied to actions, evidence, severity, or state.
- Don’t maintain a parallel HTML recreation of desktop screens.
- Don’t turn the application into a static screenshot or generic feature-card collage.
- Don’t invent customer proof, usage figures, benchmarks, or live Azure state.
- Don’t trap wheel input inside the iframe during the scroll narrative.
- Don’t embed the browser PDF viewer as one oversized white page.
- Don’t bypass checksum or source-freshness checks.
