# PitchReady

A pitch-deck builder **and a fundraising coach** for founders raising capital. You answer a
short guided intake, PitchReady assembles an investor-structured deck (the 11 slides funders
expect), and the **Investor Lens** coaches you on every slide — flagging a vague ask, thin
traction, or a missing team story — and scores how investor-ready your deck is.

> **What this is:** a **themed front-end MVP with mock/templated data** — Tier 0. There is no
> backend, no accounts, and no live AI. Data resets on refresh. It's a real, runnable product
> you can click through end-to-end; the "AI brain," saving, and export upgrades come next (see
> _Later tiers_).

## Run it

```bash
cd app
npm install     # one time — downloads the building blocks
npm run dev      # then open the printed URL (http://localhost:5174)
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

## What's inside

| Route | Screen |
|-------|--------|
| `/` | Home / landing — value prop + example decks |
| `/new` | Guided 8-step intake wizard → generates a deck |
| `/decks` | Your decks, each with a readiness score |
| `/decks/:id` | Deck editor — slide rail · editable slide · **Investor Lens** panel |
| `/decks/:id/present` | Full-screen present + print-to-PDF export |

- **Stack:** Vite + React + TypeScript + Tailwind (same shape as the foundation's `aios/` console).
- **Theme:** the "ink & gold" design system (`wiki/design-system.md`) — Fraunces + Inter, deep
  indigo primary, gold reserved for standout metrics and the ask. Light + dark.
- **Data:** typed mock fixtures in `src/data/` — a strong seed deck (NimbusAI) and a weak one
  (Loamly) so the coaching contrast is visible immediately. The generator (`deckStructure.ts`)
  and the coaching rules (`coaching.ts`) share one structure so they never drift.

## Discovery / AI legibility (honest note)

`public/llms.txt` and the schema.org JSON-LD (injected on the home page) help AI assistants and
search engines understand the app. They **aid** legibility — they are **not** a guarantee of AI
visibility, and they do **not** make the app agent-operable (that would need a real read-only
agent surface, e.g. an MCP server). Because this is a **client-rendered SPA**, the JSON-LD is
seen by agents/crawlers that execute JavaScript; full crawler pickup is an SSR/prerender concern
for the deploy tier.

## Later tiers (not in this build)

Live AI generation (keyed) → accounts + cloud save (`build-backend`) → PPTX / Google Slides
export → optional send + tracking → monetization (`polish` / Stripe).

---
_Build record: `raw/builds/2026-07-04-pitchready.md`. Charter: `wiki/charter.md`. Design system:
`wiki/design-system.md`._
