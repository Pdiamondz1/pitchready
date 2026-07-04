---
title: Build Index
source_id: wiki:build
path: wiki/build.md
tags: [index, build, app, meta]
updated: 2026-07-04
---

# Build Index

AI-maintained summary of the built app(s). Code lives in build-target folders (like `aios/`),
outside the knowledge system; this page indexes what exists and how to run it.

## PitchReady — web app (`app/`)

**What it is:** a pitch-deck builder + fundraising coach for founders raising capital. Guided intake →
templated investor deck (11 slides) → the **Investor Lens** coaches every slide and scores readiness
(0–100). Themed front-end MVP with mock/templated data (Tier 0 — no backend, no keys).

**Run it:**
```
cd app
npm install
npm run dev      # http://localhost:5174
```

**Routes:** `/` (home) · `/new` (intake wizard) · `/decks` (deck list) · `/decks/:id` (editor +
Investor Lens) · `/decks/:id/present` (present + print-to-PDF).

**Theme:** `wiki/design-system.md` ("ink & gold" — Fraunces + Inter, indigo + reserved gold, light/dark).

**Repo:** template + KB + app live in **one self-contained project repo** — the app is hosted and
maintained by its own template within its repo. Detached from the original template remote (kept as
`template-upstream` for pulling updates); **no default push target** until you add your own remote, so the
original template can't be overwritten. See the charter's repo section.

**Records & north-stars:**
- Build record: [raw/builds/2026-07-04-pitchready.md](../raw/builds/2026-07-04-pitchready.md)
- Charter: [charter.md](charter.md) · Design system: [design-system.md](design-system.md)
- Vetting: [outputs/vetting/2026-07-04-pitch-deck-generator/](../outputs/vetting/2026-07-04-pitch-deck-generator/) (RESHAPE → narrative-coaching build)

**Later tiers:** live AI generation (keyed) → accounts/save (`build-backend`) → PPTX/Slides export →
send/tracking → monetization (`polish`).
