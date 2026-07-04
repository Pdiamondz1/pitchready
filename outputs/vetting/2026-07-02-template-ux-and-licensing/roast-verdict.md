---
title: Roast Verdict — hma_project_foundation UX (non-tech users) + licensability
source_id: outputs/vetting/2026-07-02-template-ux-and-licensing/roast-verdict.md
path: outputs/vetting/2026-07-02-template-ux-and-licensing/roast-verdict.md
tags: [vetting, roast, verdict]
updated: 2026-07-02
---

# Roast Verdict — hma_project_foundation UX (non-tech users) + licensability

**The brief:** hma_project_foundation — a "clone-to-build-anything" project template that runs inside Claude
Code (Anthropic's agentic CLI). Clone one git repo and get a file-based "second brain" (immutable raw/ →
AI-written wiki/ index → outputs/), ~27 conversational skills, a tuned sub-agent fleet, and a file-first React
console. Its promise is a guided idea→shipped-product assembly line: charter → adversarial idea-vetting +
citation-verified research → design → building a themed web/mobile/browser-extension app → a 6-rung "path to
production" (Supabase data, tests, security/a11y/perf audit, Vercel deploy scaffolding, a go/no-go gate, and a
polish pass with legal templates + optional Stripe). Self-improving (maintenance loop + advisor), safety-boxed
(offline/no-keys Tier 0; never enters keys, charges a card, deploys, or publishes for you — every go-live step
is a human checklist). Built ON TOP OF Claude Code + a third-party "superpowers" skills plugin; orchestrates
Supabase/Vercel/Stripe. Judge, for the full spectrum of non-technical users (self-cloner, semi-technical
founder, end-customers of the built apps, client handed a finished project): (1) is the UX easy for non-tech
users? (2) is it licensable — legally (built on Claude Code + a third-party plugin, needs the buyer's own
Anthropic subscription) and commercially (white-label / hosted SaaS / paid template)?

## THE VERDICT: RESHAPE
Confidence: high

**The call in one line:** Stop selling it as "easy for non-technical users" — the terminal / git / BYO-subscription
on-ramp filters out exactly that audience — but it IS cleanly licensable, so reshape into ONE honest product:
either a premium BYO-key foundation for developers/agencies (shippable this week), or build the hosted console
on-ramp FIRST if you truly want non-tech users (the only version that makes the UX claim true).

**Why:** The scores split 3/9/4/7/4, but the split is illusory — every member, bulls included, converged on
one root fact: the terminal on-ramp is the decisive constraint, and "easy for non-tech users" and "a developer
clones a repo with their own key" cannot both describe one artifact (the Logician's contradiction). The UX
question has a hard answer (NO, not for non-tech users as-shipped); licensing has a clean legal answer (YES —
superpowers is MIT, BYO-key is Anthropic-ToS-permitted today) and a proven-but-modest commercial one
($149–299 one-time dev templates are a real market; ShipFast does ~$16–21k/mo). The Expansionist's 9 isn't
wrong — it's scoring a DIFFERENT product (a hosted platform), which is precisely the reshape.

**Biggest risk:** Platform dependency + a forkable-markdown moat — Anthropic can absorb "describe it → agent
builds it" natively, and your most capable buyers are the ones best equipped to regenerate your skills with
the very tool you sold them. Defensibility is curation + updates + methodology, not the files.

**Biggest upside:** The hosted-studio platform — the `aios/` console as a "describe your idea → watch it build"
BYO-key front door + the `advise-project` retention loop (a native recurring hook almost no template has) +
vertical editions (law-firm-factory, restaurant-app-factory) + a cross-project "what works" data flywheel.
That's a platform valuation, not a template one.

**Money read:** Legally clean today — publish a one-line "bring your own Anthropic subscription; nothing is
routed through anyone else's credentials" notice; that statement is your compliance moat as Anthropic's
third-party policy keeps shifting. Fastest first dollar: the dev/agency template at **$149–299 one-time** — the
product already exists, so a landing page + Gumroad + docs is a weekend and first dollar in days. The platform
path is real ARR but months of build + real infra/liability (you'd be running agentic execution on users'
behalf) — don't start there.

**The cheapest 48-hour test:** Put the raw repo in front of **5 actual non-technical target users**, give them
only the README, and count how many reach a running console unassisted — and note WHERE each one stalls.
Prediction: ~0 reach it, all stalling at the same 2–3 steps — which settles the UX question overnight for ~$0.
In parallel (also 48h): a one-page landing site for the dev/agency template with a "$X early access" button —
if developers pre-pay, the commercial path is real; clicks-but-no-buys confirms the moat objection.

**If RESHAPE:** Pick the buyer, then make the claim true for them.
- **Path A (fast, low-risk):** sell it honestly as a premium, opinionated Claude Code project-foundation for
  developers & agencies — BYO-key, one-time $149–299 — and DROP "non-tech-savvy" entirely. The differentiator
  vs. dumb boilerplates is the roast/vetting gate + the 6-rung path-to-production methodology + ongoing updates.
- **Path B (slow, high-ceiling):** if you insist on non-tech users, the ONLY way the UX claim becomes true is
  to build the hosted console on-ramp first (web sign-up → describe → watch it build, BYO-key). That removes
  the terminal — and only then is it both easy AND cleanly licensable as a service.

**Council scores:** Contrarian 3/10 · Expansionist 9/10 · Logician 4/10 · Researcher 7/10 · Buyer 4/10

**Evidence briefing:** ./template-ux-and-licensing-briefing.html

## What the briefing changed

The `storm-research` briefing (5 verified lenses — practitioner/academic/skeptic/economist/historian —
20 citations checked: 0 fabricated, 6 corrected, 3 demoted) **confirmed the RESHAPE verdict and its core
reasoning**, and added three things:

- **Strengthened "not for non-tech users":** every historical "anyone can build" wave (Visual Basic,
  FrontPage, WordPress, Bubble) landed on *semi-technical power-users*, never civilians — the CLI/git barrier
  is a mental-model cliff, and no lens defended non-technical direct use. This is now the load-bearing,
  unanimous finding.
- **Sharpened the licensing read:** legally clean *today* (obra/superpowers MIT — verified; BYO-subscription
  is the ToS-permitted path, routing-through-others' credentials prohibited), but Anthropic re-drew the
  third-party line three times in 2026 (Feb ban → April enforcement → May metering **paused June 15**). The
  README BYO-key notice is confirmed cheap insurance.
- **Added a new frontier the roast under-weighted:** the durable moat may be the **methodology + community/
  certification** (roast→vet→build→ship→polish as a teachable standard), not the forkable files — the one
  asset Anthropic can't Sherlock. Plus a flagged risk the council raised but the economics ignored: the
  **product-liability of AI-generated legal/payments outputs** shipped to non-experts.

**Verdict unchanged: RESHAPE** — the evidence tightens the "pick one honest buyer, drop the non-tech claim,
BYO-key is clean-but-watch-Anthropic" call rather than moving it.
