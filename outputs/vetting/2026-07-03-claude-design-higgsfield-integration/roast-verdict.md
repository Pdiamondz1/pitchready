---
title: Roast Verdict — Add Claude Design + Higgsfield to define-design
source_id: outputs/vetting/2026-07-03-claude-design-higgsfield-integration/roast-verdict.md
path: outputs/vetting/2026-07-03-claude-design-higgsfield-integration/roast-verdict.md
tags: [vetting, roast, verdict, define-design, design-tools]
updated: 2026-07-03
---

# Roast Verdict — Add Claude Design + Higgsfield to define-design

**The brief:** Enhance the template's `define-design` skill — which interviews a user into a portable
design system (`wiki/design-system.md`) and already integrates Google Stitch via a graceful-off,
manual-paste-back-default + optional-MCP pattern (Generate → Export to `raw/design/` → Distill), keys
only in `aios/.env` — by adding TWO more optional design-tool integrations alongside Stitch, each a
distinct job: (1) **Claude Design 2.0** (from the video "Anthropic just dropped Claude Design 2.0"; MCP
connectors, canvas editing, markups, a "design system" feature) as a native peer to Stitch for
generating the look + design system, possibly consuming the template's `build-mcp` servers; (2)
**Higgsfield** (paid generative image/video, the video's affiliate sponsor) as an optional keyed
imagery/asset generator. Both Tier-0-first / graceful-off (default OFF, no keys), keys-in-`aios/.env`.
The bet: durable, Tier-0-implementable enhancement worth the skill complexity — or tool-chasing that
ages badly? Judge the two pieces separately.

## THE VERDICT: RESHAPE
Confidence: high

**The call in one line:** Don't add "Claude Design" and "Higgsfield" as two named, automated
integrations — the automation premise is factually wrong; instead generalize `define-design`'s proven
Stitch pattern into ONE vendor-neutral "bring-your-own design tool" adapter, add Claude Design as an
honestly-framed manual paste-back example, and drop Higgsfield from the design skill.

**Why:** The bull case (a Claude Design ↔ `build-mcp` "flywheel") rests on a false assumption: per the
Researcher, Claude Design's "MCP connectors" are **output/export destinations** (push finished designs
to Canva/Vercel/Figma), *not* an inbound API a skill can drive, and it **consumes** a design system
rather than **emitting** a portable one. So "Claude Design integration" can only ever be a third manual
paste-back option — identical to what Stitch already does. Higgsfield has no first-party API, is paid
raster video, and was the video's affiliate sponsor. Three reasoning personas (Contrarian, Logician,
Buyer) independently converge on the durable move: stop hardcoding churning vendor names into a
load-bearing skill; encode the *role*, list vendors as examples.

**Biggest risk:** Skill-bloat + staleness — hardcoding two commercial product names (one mis-described
as "2.0", one an affiliate placement) into a monthly-churn space, and cluttering the keyless happy-path
with prompts the indie buyer will skip.

**Biggest upside:** The vendor-neutral abstraction itself — `wiki/design-system.md` as a stable
"compiler target" any design tool distills into — is the real methodology-as-moat asset; it makes tools
disposable and the template durable.

**Money read:** Internal enhancement, not a SKU, but it feeds the licensing/methodology-as-moat
positioning. The generic-adapter + Claude-Design-doc-example is cheap (one `define-design` edit + doc,
no new skill, no keys). Higgsfield adds maintenance for ~zero indie uptake — negative value.

**The cheapest 48-hour test:** Verify the two load-bearing facts *before writing any skill prose* — (a)
does Claude Design expose any inbound/programmatic surface or emit a portable design-system file, and
(b) does Higgsfield have a real first-party API. That is the `storm-research` citation pass (roast's
Researcher is unverified); it confirms/corrects before the design is locked.

**If RESHAPE:** (1) Generalize `define-design`'s Stitch pattern into a **vendor-neutral "design-tool
adapter" role** (Generate → `raw/design/` → Distill) with vendors as swappable config/examples. (2) Add
**Claude Design as one honestly-framed manual paste-back example** — interactive claude.ai (Pro/Max),
not automatable, consumes-not-emits — quiet on the keyless default path (zero new prompts). (3) **Drop
Higgsfield** as a design-skill integration; at most a generic, off-by-default "keyed asset-generation
tool" role in docs with the "no stock photography" voice explicitly reconciled — or defer to a later
assets tier.

**Council scores:** Contrarian 3/10 · Expansionist 8/10 · Logician 7/10 · Researcher 2/10 · Buyer 4/10

**Evidence briefing:** [./design-tool-integrations-briefing.html](./design-tool-integrations-briefing.html) (storm-research; 16 sources verified, 0 fabricated, 5 corrected, 4 demoted)

## What the briefing changed
The citation-verified pass **confirmed and sharpened the RESHAPE — it did not reverse it.**
- **Confirmed (5/5, Anthropic's own page):** Claude Design is interactive-only, outbound-export-only, its Claude Code handoff is a *manual* action, and it **consumes** a design system (reads your codebase) rather than **emitting** a portable file. So it can't be automated *and* doesn't produce a distillable artifact → "manual example only" is right, and even that is weaker than Stitch (which does emit `DESIGN.md`). Launch date corrected: **April 17, 2026** (not June).
- **Corrected (overturned a roast claim):** Higgsfield **does** have a first-party API + MCP (`cloud.higgsfield.ai`, official SDK, `mcp.higgsfield.ai/mcp`) — but it's **raster image/video only**, so the conclusion stands: it's an *asset* tool, not a design-system tool. Keep it out of `define-design`.
- **Strengthened the core prescription:** the durable move is **format-over-vendor**, now backed by verified history — Galileo AI → Google Stitch acqui-hire (May 2025), CRA sunset (Feb 2025), and the **W3C Design Tokens stable spec 2025.10** (Oct 2025) built to kill vendor lock-in. Even the incumbent Stitch MCP is a **Google Labs "not officially supported"** project → *all* named tools churn; the template's `wiki/design-system.md` is the real, durable asset.
- **Demoted (do not assert):** Higgsfield "$400M ARR" (single-source), the "196 tools died" stat (single blog), Stitch "90-day token"/"Q4-2026 paid plans" (unsourced).

## Council notes (condensed)
- **Contrarian (3):** Higgsfield is scope creep in a graceful-off costume (off-Tier-0, off-brand vs "no
  stock photography"); Claude Design's "integration" is probably just a doc line. Generalize the Stitch
  pattern into ONE vendor-neutral adapter; name tools only as doc examples.
- **Expansionist (8):** Reframe `define-design` as a tool-agnostic "design-system compiler"; the Claude
  Design ↔ `build-mcp` loop as flywheel. *(The Researcher's evidence undercuts the flywheel — see Why.)*
- **Logician (7):** Split the decision — Claude Design widens an existing slot (near-zero marginal
  complexity); Higgsfield opens a NEW slot AND contradicts the "no stock photography" voice. New seam:
  a precedence rule when two look-and-feel generators feed one north star.
- **Researcher (2, web):** "Claude Design 2.0" is a video title, not a product; Claude Design (claude.ai,
  Pro/Max, interactive beta) has **no inbound API/MCP-automation** — its MCP connectors are export
  destinations, and it **consumes** design systems, not emits them. Higgsfield = paid raster video, no
  first-party API (only Segmind/Pixazo resellers), affiliate origin. Stitch already has the programmatic
  path (official MCP + DESIGN.md export, free tier). *Claims to be verified by storm-research.*
- **Buyer (4):** Onboarding bloat is the real risk — graceful-off means nothing if the interview makes
  the keyless user say "no" three times. Ship Claude Design as a *quiet* peer to Stitch; Higgsfield
  off-by-default, never-mentioned-unless-asked.
