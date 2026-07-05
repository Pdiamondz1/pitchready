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

## Big Dreem — web app (`app/`)

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

## Deploy

**Live:** https://pitchready-virid.vercel.app/ (Vercel, deployed 2026-07-04 from `origin/main`, root dir
`app/`). Verified: home renders, deep-link `/decks/:id` loads via the SPA rewrite (no 404), coaching works
live, zero console errors. Auto-deploys on every push to `main`.

Scaffolded for **Vercel** (offline, nothing deployed, no keys). Config in `app/vercel.json` (Vite + SPA
rewrite), a CI quality-gate at `.github/workflows/deploy-app.yml` (typecheck + build; does **not** deploy),
an optional env template `app/.env.production` (Sentry/analytics slots — all graceful-off), and
`app/src/lib/observability.ts` (Sentry loads from CDN only if `VITE_SENTRY_DSN` is set; vendor-neutral
`track()` no-ops otherwise). **The one go-live step is the user's** — connect the repo to Vercel (root dir
`app/`), set env, deploy. Checklist: [outputs/deploy/2026-07-04-pitchready/GO-LIVE.md](../outputs/deploy/2026-07-04-pitchready/GO-LIVE.md).
Record: [raw/builds/2026-07-04-pitchready-deploy.md](../raw/builds/2026-07-04-pitchready-deploy.md).
Honest note: client-rendered SPA — SEO specifically needs prerender/SSR (short-form/community sharing work
as-is).

**Later tiers:** live AI generation (keyed) → accounts/save (`build-backend`) → PPTX/Slides export →
send/tracking → monetization (`polish`).
