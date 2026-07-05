---
title: Project Charter
source_id: wiki:charter
path: wiki/charter.md
tags: [charter, project, meta]
updated: 2026-07-04
---

# Project Charter

**One-liner:** A pitch-deck builder that turns a founder's raw business info into an investor-structured deck *and coaches them on what funders actually want* — for anyone raising capital. *(Working name: "PitchReady" — TBD.)*

## Purpose & problem
Help a founder who's raising a round turn raw business info into a genuinely investor-ready pitch deck in minutes — structured the way investors evaluate (problem → solution → market → traction → team → the ask), with fundraising-specific guidance on what each slide must land. The hero is **fundraising expertise + narrative coaching**, not pretty templates: generic deck styling is commoditized (Gamma/Canva/Pitch), so the durable value is *knowing how a fundable deck is built and coaching the founder into one.*

## Audience & users
Anyone building a company and raising capital, across stages and capital types:
- Pre-seed → Series A founders raising from angels or VCs
- Accelerator / incubator applicants and cohorts (YC, Techstars, regional programs)
- Student & first-time founders pitching at university programs and competitions
- Non-dilutive capital seekers — grants, pitch competitions, angel-group demo days, equity crowdfunding

Common thread: someone who must present a business to people deciding whether to fund it, and needs a deck built the way funders evaluate. Global, English-first. Deck emphasis flexes by context (a grant deck weights differently than a VC deck) — itself a feature.

## Success & outcomes
In 3–6 months:
- **Quality bar (immediate):** blank → complete, investor-structured deck in **under ~15 minutes**, and the output is good enough the founder would *actually send it* (reads investor-grade, not generic-AI).
- **Coaching proof:** the app flags the weak spots investors care about (thin traction, vague ask, missing team story) and users report it made their deck *better*, not just faster.
- **Traction (post-launch):** ~100 sign-ups from SEO + short-form, a handful of paying users once monetized, 2–3 testimonials from founders who used it in a real raise.
- **Distribution proof:** ≥1 short-form demo that converts + ranking for one target keyword (e.g. "seed pitch deck template").

## Scope
**In / MVP** (v1, Tier 0 — real & runnable, `npm run dev`):
- Guided **intake wizard** — collects the essentials (one-liner, problem, solution, market, business model, traction, team, the ask/round).
- **Deck generation** — assembles the standard investor sequence (~10–12 slides: Title · Problem · Solution · Product · Market/TAM · Business Model · Traction · Competition · Team · The Ask / Use of Funds · Contact) from the intake, templated.
- **Fundraising coaching layer (the differentiator)** — a per-slide "investor lens" that flags weak spots and coaches what funders want on that slide. Rule-based → fully buildable at Tier 0.
- **In-browser deck view + inline edit** — page through, edit text, reorder slides.
- **Polished theme** (from `define-design`) + **export-preview** (view / print-to-PDF in the browser).

**Out / non-goals (v1):**
- NDA-before-viewing gate (confirmed investor anti-feature)
- Email / Google Workspace sending
- Investor tracking / DocSend-style analytics
- Accounts / login / cloud save (that's `build-backend`, later)
- Real PPTX / Google Slides export

**Later** (deferred, rough order): live AI generation (keyed — the first upgrade; replaces templated generation **and powers a one-click "Improve with AI" that drafts empty slides + sharpens a vague ask straight from the Investor Lens flags — the top user-requested feature; the founder supplies the facts, AI makes them investor-grade**) → accounts + save (`build-backend`) → PPTX/Slides export → optional send/tracking → monetization (`polish`/Stripe).

## Constraints & resources
- **Team:** solo founder/builder. **Budget:** <$1k. **Timeline:** relaxed, no hard deadline.
- **Build tier:** Tier 0 — mock/templated data, **no API keys**, runs locally via `npm run dev`. (Live-AI and accounts are later keyed tiers.)
- **Tech stack:** whatever `build-app` scaffolds — Vite + React + Tailwind (same shape as the repo's `aios/` console).
- **Distribution plan:** SEO/content + short-form social + a marketplace/directory listing (no ad budget, no existing audience).
- **🔒 Repo (self-contained project repo):** the template + knowledge base + the app live together in **one** git repo the project owns — so the app is hosted and maintained by its own template *within its repo* (clone it anywhere and the template comes too). This checkout is **detached from the original template remote** (`Pdiamondz1/hma_project_foundation`, kept as `template-upstream` for pulling future template updates); there is **no default push target** until the user adds their own remote, so the original template can never be overwritten. `app/` is a normal tracked folder (its `node_modules`/`dist`/`.env*` stay ignored).

## Open questions / assumptions
- App / repo **name** *(assumed — confirm later; working name "PitchReady")*.
- **Monetization model** *(assumed — confirm later; likely freemium/subscription, deferred to the `polish` tier)*.
- The project's **own remote**: this repo is detached from the template and awaits a new user-owned remote (e.g. `pitchready`) to be added as `origin` and pushed to.

## Vetting
**RESHAPE** — this core idea was vetted this session (roast council + citation-verified `storm-research` briefing + two follow-up pressure-tests). The build adopts the *narrative-coaching* reshape the vetting endorsed (the Buyer persona's stated real need was "will this get funded?" feedback, not styling). Full record: `outputs/vetting/2026-07-04-pitch-deck-generator/`.

---
*Source: raw/project/2026-07-04-discovery.md (full discovery interview).*
