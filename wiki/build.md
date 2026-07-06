---
title: Build Index
source_id: wiki:build
path: wiki/build.md
tags: [index, build, app, meta]
updated: 2026-07-06
---

# Build Index

AI-maintained summary of the built app(s). Code lives in build-target folders (like `aios/`),
outside the knowledge system; this page indexes what exists and how to run it.

## Big Dreem — web app (`app/`)

**What it is:** a pitch-deck builder + fundraising coach for founders raising capital. Guided intake →
templated investor deck (11 slides) → the **Investor Lens** coaches every slide and scores readiness
(0–100). Themed front-end MVP with mock/templated data (Tier 0 — no backend, no keys).

**Front door — "score first" (`/score`):** a 30-second alternative to the full wizard — answer the 3
slides investors weight most (traction · team · the ask) → instant readiness score + the worst gaps →
"Build my full deck" graduates into the editor, prefilled. The wedge (the coaching/score) reachable in
seconds; the shareable route for short-form/community distribution. Added 2026-07-06 (the highest-leverage
cut from `outputs/algorithm/2026-07-06-big-dreem-app/ALGORITHM.md`).

**Run it:**
```
cd app
npm install
npm run dev      # http://localhost:5174
```

**Routes:** `/` (home) · `/score` (quick score → graduate) · `/new` (intake wizard) · `/decks` (deck
list) · `/decks/:id` (editor + Investor Lens) · `/decks/:id/present` (present + print-to-PDF).

**Theme:** `wiki/design-system.md` ("vibrant violet" — Space Grotesk + Inter, violet primary + reserved
warm gold, 10px radius, light/dark). *(Restyled 2026-07-06 from "ink & gold".)*

**Repo:** template + KB + app live in **one self-contained project repo** — the app is hosted and
maintained by its own template within its repo. Detached from the original template remote (kept as
`template-upstream` for pulling updates); **no default push target** until you add your own remote, so the
original template can't be overwritten. See the charter's repo section.

**Records & north-stars:**
- Build records: [raw/builds/2026-07-04-pitchready.md](../raw/builds/2026-07-04-pitchready.md) · [raw/builds/2026-07-06-score-first.md](../raw/builds/2026-07-06-score-first.md) (the "score first" front door)
- Charter: [charter.md](charter.md) · Design system: [design-system.md](design-system.md)
- Vetting: [outputs/vetting/2026-07-04-pitch-deck-generator/](../outputs/vetting/2026-07-04-pitch-deck-generator/) (RESHAPE → narrative-coaching build)

## Deploy

**Live:** https://bigdreem.vercel.app/ (Vercel, deployed 2026-07-04 from `origin/main`, root dir `app/`;
Vercel project renamed + `bigdreem.vercel.app` domain claimed by the user). Verified: home renders, deep-link `/decks/:id` loads via the SPA rewrite (no 404), coaching works
live, zero console errors. Auto-deploys on every push to `main`.

Scaffolded for **Vercel** (offline, nothing deployed, no keys). Config in `app/vercel.json` (Vite + SPA
rewrite), a CI quality-gate at `.github/workflows/deploy-app.yml` (typecheck + build; does **not** deploy).
**The one go-live step is the user's** — connect the repo to Vercel (root dir `app/`), set env, deploy.
Checklist: [outputs/deploy/2026-07-04-pitchready/GO-LIVE.md](../outputs/deploy/2026-07-04-pitchready/GO-LIVE.md).
Record: [raw/builds/2026-07-04-pitchready-deploy.md](../raw/builds/2026-07-04-pitchready-deploy.md).

*Delete-first cut (2026-07-06, per the algorithm report):* the graceful-off observability scaffold
(`observability.ts` + Sentry/analytics env slots) and the schema.org/`llms.txt` discovery output were
**removed** — both were inert (no users/keys, and a client-rendered SPA isn't seen by crawlers without
prerender). They return at a real deploy/prerender tier. Honest note stands: SEO specifically needs
prerender/SSR (short-form/community sharing work as-is).

**Later tiers:** live AI generation (keyed) → accounts/save (`build-backend`) → PPTX/Slides export →
send/tracking → monetization (`polish`).
