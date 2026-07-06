---
title: The Algorithm — Big Dreem app (2026-07-06)
source_id: outputs:algorithm:2026-07-06-big-dreem-app
path: outputs/algorithm/2026-07-06-big-dreem-app/ALGORITHM.md
tags: [algorithm, review]
updated: 2026-07-06
---

# The Algorithm — Big Dreem (`app/`)

**Target:** the whole built `app/` (Big Dreem — pitch-deck builder + fundraising coach), live at
bigdreem.vercel.app. **Goal it's measured against** (from `wiki/charter.md` + the RESHAPE vetting):
*cheaply validate demand for the coaching, led by the free readiness score.* No real users, no
accounts, no AI generation yet.

**Propose-only.** Nothing here is deleted. It's a ranked case for what to cut, in Musk's order —
question first, delete second, and only then simplify. Steps 1–2 carry the weight, on purpose.

---

## Headline

> **The wedge you're trying to validate — the readiness score — is buried behind an 8-step wizard
> and a full 11-slide generation before a first-time visitor ever sees it. The single highest-leverage
> move is to put the score first and make the whole builder optional to the demand test. Everything
> else is a rounding error next to that.**

---

## 1 — Question every requirement

Each requirement gets an owner. The dangerous ones are "unowned" (inherited from a build default or
a mid-session reflex), and the ones from a smart source that never got questioned.

| # | Requirement | Owner | Verdict |
|---|---|---|---|
| R1 | The product is a deck **builder** (wizard → generate → edit → present) | **You** (explicit, repeated) | **Load-bearing.** This is the product. Not on the table. |
| R2 | The differentiator is the **Investor Lens coaching + readiness score** | Charter + the RESHAPE verdict | **Load-bearing — and it's the thing to validate.** Keep, protect, feature it. |
| R3 | To see the coaching, a user must **first finish the 8-step intake AND generate a full deck** | **Unowned** — an accident of build order | **Question hard.** The wedge is gated behind the heaviest part of the app. A demand test led by the score should reach the score in seconds. This is the whole game. |
| R4 | Each slide type needs its **own bespoke layout** — 8 of them (`SlideView`) | You ("decks look bland → make them captivating") | **Real but oversized.** The "would actually send it" bar is load-bearing; *eight* distinct layouts to clear it is not. |
| R5 | Slides support **per-slide image upload** (client resize → localStorage) | **Unowned** — grew from "does it have pictures?" | **Kill (for now).** Images don't test the coaching wedge. `image.ts` + `ImageForward` + the upload UI + `Slide.image` + localStorage-size juggling is the biggest self-contained feature that adds nothing to the goal. |
| R6 | The app emits **schema.org + `llms.txt`** for AI/SEO discovery | **Unowned** — `build-app` default (`include_discovery`) | **Question.** On a client-rendered SPA with **no prerender**, crawlers and AI search largely don't execute the JS — so this is *invisible for the exact SEO channel it's meant to serve.* It's honest-but-inert weight today. |
| R7 | The app ships **graceful-off Sentry + analytics** (`observability.ts`) | **Unowned** — `deploy` default | **Question.** No users, no keys, no one has pulled the deploy trigger. It's inert scaffolding for a tier you haven't reached. |
| R8 | Decks **persist in localStorage** | You ("verify the fix live") | **Keep.** Cheap, and it removes a genuinely jarring reload-loses-everything moment. Low weight. |
| R9 | Full-screen **Present** mode + print-to-PDF | Charter MVP ("export-preview") | **Keep the print path** (part of "would send it"); full-screen Present is deferrable but low-weight — leave it. |

The tell: **every requirement that serves the actual goal (R1, R2, R8) has a clear owner. Almost
everything flagged for deletion is unowned** — it arrived from a build default (R6, R7) or a
one-line reflex to a screenshot (R5). That's exactly the pattern the algorithm exists to catch.

---

## 2 — Delete (ranked by leverage)

The sharpest section. Bias to over-cut; the add-back safety net is real (see the watch at the end).

1. **The "build-a-full-deck-first" gate in front of the coaching (R3).** *Highest leverage.* Today the
   only door to the score is `/new` → 8 steps → generate → editor. Add a **standalone "score my pitch"**
   entry (paste an existing deck's text, or answer the 3 slides that move rounds — traction, team, ask —
   `coaching.ts` already scores those) that returns the readiness score + top-3 fixes **in seconds**. The
   full builder stays; it just stops being the mandatory front door. *This is a reframe, not a file
   deletion — so it's your call, not a mechanical cut — but it's the one change with real leverage on
   "validate demand for the coaching."*
2. **Discovery scaffolding — `structured-data.ts` + `public/llms.txt` + the `Home` `useEffect` that injects
   it (R6).** Inert on an unprerendered SPA; zero demand-test value now; clean, self-contained removal.
   Comes back for free at the deploy/prerender tier.
3. **Observability scaffolding — `observability.ts` (Sentry + analytics) + its `main.tsx` call (R7).**
   Inert with no users/keys/deploy. Re-add the day you actually ship to real traffic.
4. **Per-slide image upload — `lib/image.ts`, the `ImageForward` layout, the upload/replace/remove UI in
   `SlideCanvas`, and `Slide.image` (R5).** The biggest genuinely-deletable *feature*. Removing it also
   deletes a whole `SlideView` branch and shrinks the localStorage payload.
5. **Two of the eight slide layouts (R4).** `Cards` and `ImageForward` are the least-load-bearing; folding
   them into `Default`/`Statement` takes `SlideView` from 8 layouts to ~5 with no visible loss on a real
   deck. (This is really step 3 — simplify — listed here because it's a removal.)

**Do NOT delete:** `coaching.ts` (the wedge), `deckStructure.ts` (single source of truth for *both*
generation and coaching — deleting it would drift them apart), the readiness score/ring, localStorage
persistence. These earn their place.

---

## 3 — Simplify (only what survived)

- **`SlideView` (316 lines, 8 layout fns).** After deleting `Cards` + `ImageForward`, collapse the
  remaining branch ladder in `SlideView()` — much of the per-type styling is the same `text(onDark)` +
  `Eyebrow` + headline + body with different padding. A `Statement`/`Default`/`Split`/`MetricChart` core
  covers the deck.
- **`extractMetric` regex + `chartFor` seed data.** Fine to keep, but they're the kind of thing that reads
  as "polish on a corpse" if the demand test says people don't care about deck rendering. Don't touch them
  until the wedge is validated.
- **The wizard help text** already reuses `DECK_STRUCTURE.investorWants` (`tipFor`) — good, that's the
  single-source pattern; keep doing exactly that, don't fork copy.

## 4 — Accelerate

- **Feedback loop:** the app has **no tests** (ship-check flagged this) and a manual browser walkthrough is
  the only proof it works. The fastest loop win is a handful of `coaching.ts` unit tests (it's pure,
  deterministic, and it's the part whose correctness actually matters) — *after* the deletions above, so you
  aren't writing tests for code you're about to cut. Don't accelerate the deletable.
- **Demand signal:** you can't see whether anyone reaches or values the score. Once observability is *earned*
  (real deploy), one event on "score viewed" is the whole demand test. Not before.

## 5 — Automate (last)

- **Nothing yet.** The honest call: automate *after* deleting/simplifying, and Big Dreem hasn't cut yet.
- The one thing that *will* be worth automating once stable: the `coaching.ts` tests in the CI quality-gate
  (`deploy-app.yml`) — but only once the rules stop changing. Automating the coaching rules today would just
  freeze a ruleset you're still validating.

---

## The single highest-leverage deletion

**Delete the requirement that a visitor must generate a whole deck before they can see the coaching.**
Put the readiness score first (a standalone "score my pitch" path); let the full builder be the thing they
graduate into. It's the only change here that moves the actual goal — *validate demand for the coaching* —
rather than just trimming weight.

If you want a **safe, purely-mechanical** first cut with zero product-vision risk, take **#2 + #3 together**
(discovery + observability scaffolding): both are invisible to users today, both come back untouched at the
deploy tier, and removing them proves the algorithm bites without touching anything a user can see.

## Add-back watch (the 10% honesty check)

If none of this ever comes back, the cuts were too shallow. Expected returns:
- **Discovery (schema.org/`llms.txt`)** → returns at the **deploy/prerender** tier, when a crawler can
  actually see it. *(likely)*
- **Observability (Sentry/analytics)** → returns the day you ship to **real traffic**. *(likely — and it's
  what turns "score viewed" into the demand signal)*
- **Image upload** → returns once the wedge is validated and you're polishing decks people already want.
  *(plausible)*
- **A slide layout or two** → returns if a real deck looks flat without it. *(possible)*

That's a healthy add-back list — comfortably over Musk's 10%. The deletions are aggressive on purpose;
the safety net is that every one of them is cheap to restore, and carrying them *now* — before a single
user has told you the coaching is worth having — is the actual cost.
