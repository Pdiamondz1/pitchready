---
title: Build Record — Big Dreem "score first" path (2026-07-06)
source_id: raw/builds/2026-07-06-score-first.md
path: raw/builds/2026-07-06-score-first.md
tags: [build, app, incremental, score-first]
updated: 2026-07-06
layer: build-app
target: web
---

# Build Record — "score first" path (incremental re-run)

Incremental `build-app` re-run on the existing `app/` (Big Dreem, live at bigdreem.vercel.app).
Adds ONE new flow: a fast front door to the coaching wedge. Design was brainstormed and **user-approved**
before building (see the spec/brainstorm in this session), then implemented via build-app in incremental
mode (no redundant re-confirm).

## Why (the goal it serves)
Big Dreem's near-term goal (charter + RESHAPE vetting): cheaply **validate demand for the coaching**, led
by the free readiness score. The score was buried behind an 8-step wizard + full deck generation. This is
the highest-leverage cut from `outputs/algorithm/2026-07-06-big-dreem-app/ALGORITHM.md` — a faster front
door. The 8-step wizard and full builder are **unchanged** (this is additive).

## What was built
- **New route `/score`** (`app/src/pages/Score.tsx`) — a two-phase page (local state, nothing routed):
  - **Input:** 3 fields — Traction · Team · The Ask (the highest-weight investor slides), each with its
    `DECK_STRUCTURE.investorWants` tip. Enabled once any field has content.
  - **Result:** the `DeckScoreRing` (reused) + a blunt one-line coach verdict + the 2–3 gaps worst-first,
    each with severity color + the investor tip. CTAs: **Build my full deck** (primary), **See a sample
    deck**, **Edit my answers**.
- **New coaching helper** (`app/src/data/coaching.ts`): `analyzeQuick(input)` scores ONLY traction/team/ask
  by **reusing the existing `analyzeSlide` rules + `FRACTION` weights + the matching `DECK_STRUCTURE` specs**
  (weights 3/3/2 → focused 0–100), returns notes sorted worst-first. `analyzeDeck` is untouched — the fast
  score can never disagree with the full one. `quickVerdict()` gives a blunt headline keyed off the worst note.
- **Graduation hand-off:** "Build my full deck" → `createDeck({ ...EMPTY_INPUT, traction, team, ask })`
  (generation fills the rest) → navigates into the editor, deck prefilled. Nothing is saved until this click
  (no throwaway-score clutter in My Decks).
- **Home hero CTA swap** (`app/src/pages/Home.tsx`): primary → `/score` "Score my pitch — free"; secondary →
  `/new` "Build a full deck" + a "30 seconds · no sign-up" subline.
- **Nav link** (`app/src/components/layout/AppShell.tsx`): "Score my pitch" added (reachable anywhere;
  `/score` is shareable for the short-form/community distribution plan).
- **Route wired** in `app/src/App.tsx`.

## Scope (honored)
- **IN:** one `/score` page, one coaching helper, the Home hero swap + nav link, the graduation hand-off.
- **OUT (deferred):** paste-a-deck parsing (a Tier-0 trap without an LLM), any AI rewrite (that's the later
  build-backend "Improve with AI"), saving throwaway scores, editing from the score screen, accounts.

## Verification
- `npm run typecheck` clean; `npm run build` clean (1614 modules).
- Browser walkthrough (local dev): `/score` renders; a strong-traction / thin-team / strong-ask input
  scored **81 (green)**, flagged **Team = FIX first** (worst-first), verdict "Name the founders and your
  unfair advantage"; Traction + Ask STRONG. Console clean. Graduation created a prefilled deck and landed in
  the editor (team slide warn/amber, ask slide strong/green in the rail + Investor Lens).

## Stack
Unchanged — Vite + React 18 + TS + Tailwind (violet theme). No new deps, no keys, Tier 0.

## North-stars
- Charter: `wiki/charter.md` · Design system: `wiki/design-system.md` (vibrant violet)
- Algorithm report that motivated this: `outputs/algorithm/2026-07-06-big-dreem-app/ALGORITHM.md`
- Prior build records: `raw/builds/2026-07-04-pitchready.md`, `raw/builds/2026-07-04-pitchready-deploy.md`
