---
title: Build Record — PitchReady (web)
source_id: raw/builds/2026-07-04-pitchready.md
path: raw/builds/2026-07-04-pitchready.md
tags: [build, build-app, web, app, pitchready]
updated: 2026-07-04
target: web
---

# Build Record — PitchReady (web)

Scaffolded by `build-app` from `wiki/charter.md` (MVP scope) + `wiki/design-system.md` (theme).
Lives in `app/` (its own git repo — see the repo note below). Tier 0: mock/templated data, no keys.

## Confirmed screen plan (5 screens)
| Route | Screen | Purpose |
|---|---|---|
| `/` | Home / Landing | Hero + coaching pillars + example decks (SEO/short-form surface) |
| `/decks` | My Decks | Deck list with readiness-score badge; new/open/delete |
| `/new` | Intake Wizard | Guided 8-step form → generates a templated deck → opens editor |
| `/decks/:id` | Deck Editor ⭐ | Slide rail (reorder) + editable slide canvas + **Investor Lens** coaching panel |
| `/decks/:id/present` | Present / Export | Full-screen viewer + print-to-PDF export |

## Components
- Layout: `AppShell` (nav/header + dark toggle).
- UI primitives (copied/mirrored from `aios/`): button (added `gold` variant + neutral hovers), card, input, textarea, label, badge, progress.
- Feature: `DeckScoreRing`, `DeckCard`, `SlideRail`, `SlideCanvas`, `InvestorLensPanel`.

## Mock entities (`src/data/`, no backend)
- `types.ts` — `Deck`, `Slide`, `StartupInput`, `SlideType`.
- `deckStructure.ts` — the canonical 11-slide investor sequence + per-slide guidance + the templated generator (`generateSlides`) + `extractMetric`.
- `coaching.ts` — **the Investor Lens rule engine**: per-slide notes (strong/warn/gap) + a weighted 0–100 readiness score. Shares `DECK_STRUCTURE` with the generator so they never drift.
- `decks.ts` — two seed decks: **NimbusAI** (strong, high score) and **Loamly** (weak early draft, low score) so the coaching contrast is visible immediately.
- `store.ts` — reactive in-memory store via `useSyncExternalStore` (create/update/reorder/rename/delete). Resets on refresh.

## Theme
Source: `wiki/design-system.md` — "ink & gold" elegant/premium. Deep indigo primary (`232 52% 28%`),
refined gold accent reserved for standout metrics + the ask (`38 92% 50%`), emerald success. Fraunces
(serif) headlines + Inter body (Google Fonts). `--radius: 0.5rem`, airy, light-first + dark mode.
Contrast: AA (`--muted-foreground` set to `220 12% 40%` for AA). Note: the design-system table listed
`accent = gold`; kept faithful, and Button outline/ghost hovers use `--muted` so gold stays reserved.

## Discovery output (`include_discovery: true`)
- schema.org JSON-LD (`SoftwareApplication`) injected on Home via `src/lib/structured-data.ts`.
- static `public/llms.txt`.
- Honestly framed (aids AI/search legibility, not a visibility guarantee; not agent-operable; SPA caveat) in `app/README.md`.

## Charter / vetting
- Charter: `wiki/charter.md` (updated 2026-07-04).
- Vetting: **RESHAPE** — built the narrative-coaching reshape the vetting endorsed (deck-generation quality + fundraising coaching is the hero; NDA gate / send / tracking excluded from v1). Record: `outputs/vetting/2026-07-04-pitch-deck-generator/`.

## Stack (pinned from `aios/`)
react/react-dom ^18.3.1 · react-router-dom ^6.26.2 · class-variance-authority ^0.7.1 · clsx ^2.1.1 ·
tailwind-merge ^2.5.2 · tailwindcss-animate ^1.0.7 · lucide-react ^0.462.0. Dev: vite ^5.4.1 ·
@vitejs/plugin-react ^4.3.4 · typescript ^5.5.3 · tailwindcss ^3.4.11 · autoprefixer · postcss · @types/*.
Console-only deps excluded (Anthropic SDK, Supabase, react-query, gray-matter, markdown, vitest,
@tailwindcss/typography). Dev port 5174.

## Repo constraint (honored)
The app is its OWN git repo (`git init` inside `app/`, initial commit made locally, **not pushed**),
and `/app/` is gitignored from the foundation repo `Pdiamondz1/hma_project_foundation` — so product
code never reaches the template's remote. A separate product remote (e.g. `pitchready`) is the user's
to add.

## Deferred (Later — not in this build)
Live AI generation (keyed, replaces templated generation) → accounts + save (`build-backend`) →
PPTX/Slides export → optional send/tracking → monetization (`polish`/Stripe). `(assumed — confirm later)`:
app/repo name (working "PitchReady"); monetization model.
