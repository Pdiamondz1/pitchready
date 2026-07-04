---
title: Build Record — PitchReady deploy scaffold (Vercel)
source_id: raw/builds/2026-07-04-pitchready-deploy.md
path: raw/builds/2026-07-04-pitchready-deploy.md
tags: [build, deploy, vercel, ci, app, pitchready]
updated: 2026-07-04
target: web
layer: deploy
---

# Build Record — PitchReady deploy scaffold (Vercel)

`deploy` scaffolded hosting + CI + graceful-off observability for `app/`, offline. **Nothing deployed,
no keys entered.** Go-live checklist: `outputs/deploy/2026-07-04-pitchready/GO-LIVE.md`.

## Scaffolded
- **`app/vercel.json`** — Vite framework preset; build `npm run build`; output `dist`; **SPA rewrite**
  (all routes → `/index.html`) so client-side routing works on refresh/deep-link.
- **`.github/workflows/deploy-app.yml`** (repo root) — CI **quality gate** on push/PR to `main`:
  checkout → `npm install` → `npm run typecheck` → `npm test --if-present` (slots in once `test-app`
  adds a suite) → `npm run build`. **Does NOT deploy** (Vercel's Git integration does); proves the build
  is green only.
- **`app/.env.production`** — optional slots only (gitignored via `.env.*`): `VITE_SENTRY_DSN`,
  `VITE_ANALYTICS_ID`. **No `VITE_SUPABASE_*`** (no backend yet). App runs fully with all empty.
- **Graceful-off observability** — `app/src/lib/observability.ts` + wired into `main.tsx`:
  - `initObservability()` loads Sentry **from CDN only when `VITE_SENTRY_DSN` is set**; no DSN → nothing
    loads/phones home. **Adaptation:** used a keyless CDN load instead of adding the `@sentry/react` npm
    dep, so the Tier-0 app keeps typechecking/building with **no extra `npm install`** (verified: typecheck
    clean after scaffold). Swap to the package when a backend/build step installs it.
  - `track(event, props?)` — vendor-neutral analytics hook, no-ops until a provider is wired (client half
    of the metrics loop; `sync-metrics` is the server half).
- `app/src/vite-env.d.ts` — typed the optional `VITE_*` env vars.

## Verified
Typecheck clean after scaffold (`npm run typecheck` → exit 0). Production build was verified clean earlier
this session. No new npm dependency added.

## Boundary (honored)
Never deployed, published, entered a key, or created an account. The one go-live step (connect repo to
Vercel + set env + deploy) is the user's, per the checklist.

## Honest note — SEO
Client-rendered SPA: the SPA rewrite makes routing work, but search crawlers may not see content without
**prerender/SSR**. Short-form + community sharing work as-is; the **SEO channel specifically** needs a
prerender follow-up (flagged in the go-live checklist). Not a blocker for the demand-test goal.

## Deferred
Real backend/data + accounts (`build-backend`) · test suite (`test-app`) · security/a11y/perf audit
(`audit-app`) · prerender/SSR for SEO · custom domain + Vercel Analytics (go-live options).
