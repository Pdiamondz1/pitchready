---
title: Go-Live Checklist — PitchReady (Vercel)
source_id: outputs/deploy/2026-07-04-pitchready/GO-LIVE.md
path: outputs/deploy/2026-07-04-pitchready/GO-LIVE.md
tags: [deploy, go-live, vercel, pitchready]
updated: 2026-07-04
---

# Go-Live Checklist — PitchReady → Vercel

Everything is scaffolded. These steps are **yours** — I never deploy, publish, or enter a key. Your keys
stay in Vercel; never in chat, never in git.

## Deploy (≈10 minutes)

1. **Create a free Vercel account** at [vercel.com](https://vercel.com) and install the **Vercel GitHub app**.
2. **Import the repository** `Pdiamondz1/pitchready` in Vercel.
   - ⚠️ **Set Root Directory to `app/`** — this is the important one. The repo holds the whole project
     (template + app); Vercel must build **just the app** in `app/`, not the foundation.
   - Vercel auto-detects Vite (build `npm run build`, output `dist`). `app/vercel.json` already sets the
     SPA rewrite so deep links / refresh work.
3. **Set environment variables** (Settings → Environment Variables) — **all optional**, skip them for a
   first launch:
   - `VITE_SENTRY_DSN` — paste a Sentry DSN to turn on error tracking (leave unset = off).
   - `VITE_ANALYTICS_ID` — only if you wire an analytics provider in `src/lib/observability.ts`.
   - *(No Supabase vars — there's no backend yet.)*
4. **Deploy.** Vercel builds and gives you a live URL. From now on: every push to `main` auto-deploys;
   every PR gets a preview URL.
5. **Verify** the live URL loads (home + `/decks` + open a deck + Present). Optionally add a **custom
   domain** and turn on **Vercel Analytics** (one click).

*The GitHub Actions workflow (`deploy-app.yml`) runs typecheck + build as an **informational** quality
gate — it proves the build is green but does not itself deploy (Vercel does). To make a red build block a
deploy, enable "wait for CI" / required checks in your Vercel + GitHub settings.*

## Before you lean on the SEO channel — read this

The app is a **client-rendered SPA.** The SPA rewrite makes routing work, but **search-engine crawlers may
not see your content** without **prerender/SSR**. Practically:

- ✅ **Short-form (TikTok/Reels/X) and community sharing work as-is** — those drive people to a URL that
  renders fine in a browser. Lead your demand test with these.
- ⚠️ **The SEO channel specifically** ("is my pitch deck investor-ready" search traffic) needs a prerender
  step first — options: Vercel's prerendering, a prerender service, or migrating to an SSR framework later.
  This is a follow-up, **not** a blocker for validating demand.

## What this deploy does NOT include (by design)

- **Real data / accounts / persistence** — decks reset on refresh. Fine for a one-session "score your deck"
  demo; close with `build-backend` (also where **real AI generation** lands) once demand shows up.
- **A test suite** (`test-app`) and a **security/a11y/perf audit** (`audit-app`) — defer for a scrappy
  validation; close before a real product launch.
- **Legal pages** — add privacy/terms **before** `build-backend` wires accounts (then they're required).

## After you're live

- Post 2–3 short-form demos of the readiness score jumping as a deck gets fixed (the 40 → 93 visual).
- Drop the "free pitch-deck readiness score" in a founder community; watch for engagement.
- If it resonates → `build-backend` for real AI. If not → you learned it for ~$0.
- To keep a shipped app healthy on a schedule later: `maintain-app`.
