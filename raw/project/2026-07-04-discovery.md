---
title: Project Discovery — 2026-07-04
source_id: raw/project/2026-07-04-discovery.md
path: raw/project/2026-07-04-discovery.md
tags: [discovery, charter, interview]
updated: 2026-07-04
---

# Project Discovery — 2026-07-04

Charter interview for a web app that **creates pitch decks for startups seeking capital**.
Reached after the same core idea was thoroughly vetted this session (roast + storm-research +
pressure-tests, saved in `outputs/vetting/2026-07-04-pitch-deck-generator/`); the user decided to
build it, choosing the *narrative-coaching* reshape the vetting endorsed. Interview folded in prior
context, so answers moved fast via propose-and-confirm.

## 1. Purpose & problem

**Q:** Is the purpose "help a founder raising a round turn raw business info into a genuinely
investor-ready deck in minutes — structured how investors evaluate (problem → solution → market →
traction → team → ask), with fundraising-specific guidance per slide"? The value is fundraising
expertise + narrative coaching, NOT pretty templates (commoditized). Adjust the emphasis?

**A:** Yes.

## 2. Audience & users

**Q:** Proposed: early-stage founders raising their first round (pre-seed/seed), first-time/technical
founders who can't afford a $2–5k pitch consultant — the segment that needs coaching most and searches
"how to make a pitch deck." Widen, narrow, or lock?

**A:** Widen it.

**Q (widened):** Anyone building a company and raising capital, across stages and capital types —
pre-seed→Series A (angels/VCs), accelerator/incubator applicants & cohorts, student/first-time founders
in university programs & competitions, and non-dilutive seekers (grants, pitch competitions, equity
crowdfunding). Common thread: must present a business to people deciding whether to fund it. Global,
English-first. Lock?

**A:** Good to lock this.

*(User also asked whether to stress-test the idea again. Recommendation given: skip — this exact idea
is already the most-vetted item in the KB (roast + storm + two pressure-tests), and the adopted
narrative-coaching reshape is what the vetting's Buyer persona said they'd actually pay for; re-roasting
would re-litigate a made decision. User agreed: continue the charter. The charter's Vetting section
points at the existing record.)*

## 3. Success & outcomes

**Q:** In 3–6 months: blank→complete investor-structured deck in <~15 min, output good enough to
actually send; coaching visibly improves the deck (flags thin traction / vague ask / missing team
story); ~100 sign-ups from SEO+short-form, a handful of paying users once monetized, 2–3 real-raise
testimonials; ≥1 converting short-form demo + ranking for one target keyword. Adjust the targets?

**A:** Lock this.

## 4. Scope — MVP & non-goals

**Q:** Tier-0 honesty: build-app uses mock data / no keys, so v1 demonstrates the full experience with
templated + rule-based generation (real, runnable, themed); live-AI generation is the first keyed
upgrade. **In / MVP:** guided intake wizard · templated deck generation (~10–12 investor slides:
Title · Problem · Solution · Product · Market/TAM · Business Model · Traction · Competition · Team ·
Ask/Use of Funds · Contact) · rule-based fundraising coaching layer (the differentiator) · in-browser
view + inline edit · polished theme + print-to-PDF preview. **Out (v1):** NDA gate · email/Workspace
send · investor tracking · accounts/cloud save · PPTX/Slides export. **Later:** live AI generation
(keyed) → accounts+save (build-backend) → PPTX/Slides export → optional send/tracking → monetization
(polish/Stripe). Move anything between In/Out/Later?

**A:** Lock this scope.

## 5. Constraints & resources

**Q:** Solo · <$1k · relaxed timeline · Tier 0 (mock/templated, no keys, npm run dev) · Vite+React+
Tailwind (aios/ shape) · distribution = SEO + short-form + marketplace/directory. **Hard repo
constraint (raised by the user):** the product app must live in its OWN git repo with its own remote
(e.g. `pitchready`); the foundation repo `Pdiamondz1/hma_project_foundation` is the local build
workshop only and must NEVER receive product code or be overwritten — enforced by `git init` inside
`app/` + gitignoring `/app/` from the foundation, set up at build time. Add or change anything?

**A:** Let's continue. (Constraints accepted as stated.)

## Draft-confirm gate

**Q:** Full draft charter reflected back (all five dimensions + open questions + vetting reference).
Does it look right — anything to correct or add before writing?

**A:** Yes looks good.
