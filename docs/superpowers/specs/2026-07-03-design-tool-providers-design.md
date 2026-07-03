# define-design: design-tool providers — design spec (format-first, vendor-neutral)

**Status:** approved design, ready for planning
**Branch:** `design-tool-providers`
**Scope:** an **edit to the existing `define-design` skill** + its config + `docs/DESIGN-SYSTEM.md` (no new skill, no keys)

## Context

`define-design` interviews a user into `wiki/design-system.md` — the portable look-and-feel north star every
build reads — and today it is **Google Stitch–aware**: it emits a ready-to-paste Stitch prompt (Tier-0 manual
default) with an optional Stitch MCP (`mcp_enabled` + `STITCH_API_KEY` in `aios/.env`, graceful-off), via a
**Generate → Export (`raw/design/<date>-<slug>/`) → Distill (`wiki/design-system.md`)** flow. See
`docs/DESIGN-SYSTEM.md` and `.claude/skills/define-design/SKILL.md`.

A user asked whether to add **Claude Design** and **Higgsfield** (from a creator video, "Anthropic just
dropped Claude Design 2.0") as new design-tool integrations alongside Stitch. The idea was vetted with `roast`
(verdict **RESHAPE**, high) and a citation-verified `storm-research` briefing
(`outputs/vetting/2026-07-03-claude-design-higgsfield-integration/`; 16 sources, 0 fabricated, 5 corrected, 4
demoted). The verified findings **kill the naive version** and point at a better one:

- **Claude Design** (real product name, launched **April 17, 2026**, Pro/Max/Team/Enterprise) is
  **interactive-only**: its "MCP connectors" are **outbound export destinations** (Canva/PDF/PPTX/HTML), its
  Claude Code handoff is a **manual** action, and it **consumes** a design system (reads your codebase) rather
  than **emitting** a portable one. A skill **cannot drive it**; "integration" can only ever be a manual
  paste-back — and it doesn't even produce a distillable artifact the way Stitch's `DESIGN.md` does.
- **Higgsfield** *does* have a first-party API + MCP (this **corrected** a roast-stage claim), but outputs
  **raster image/video only** — no tokens/type/palette. It is an **asset** generator, not a design-system
  tool, and it collides with the design system's "no stock photography" voice.
- **Every named tool churns** (Galileo AI → Google Stitch acqui-hire in ~12 months; Create React App sunset;
  even Stitch's MCP is an **unsupported Google Labs** project). The **W3C Design Tokens spec went stable
  (2025.10, Oct 2025)** to kill vendor lock-in. **The durable asset is the format** (`wiki/design-system.md`),
  not any vendor.

## Intended outcome

Improve `define-design` so it is **format-first and vendor-neutral**: `wiki/design-system.md` is the stable
contract, and any external tool is a **swappable "design-tool provider"** whose only job is to help populate
it via the existing Generate → Export → Distill flow. This **implements the verified RESHAPE** with the
cheapest, most durable change — an edit to one skill + its docs, **no new skill, no keys, Tier-0 preserved**.

## Decisions (with the user)

- **Approach: format-first vendor-neutral providers** (chosen over a minimal doc-only patch and over the
  bigger "interview/token-hardening" bet).
- **Backward-compatible, additive:** keep the existing `mcp_enabled` / `STITCH_API_KEY` Stitch behavior working
  exactly as-is; layer a descriptive `providers` registry on top as the documentation/extension surface — **do
  not** rip Stitch out into a new structure or break existing clones.
- **Claude Design** ships as a documented **manual** provider example, honestly framed (interactive claude.ai
  Pro+, outbound-only, consumes-not-emits, not automatable). It adds **zero prompts to the keyless default
  path**.
- **Higgsfield** is **not** wired into `define-design` — recorded as a deferred, later, keyed, opt-in
  **"assets"** tier (raster media ≠ design system), with the "no stock photography" voice reconciliation
  flagged for that future tier.
- **W3C Design Tokens / `DESIGN.md` alignment** is a **note only** in this scope (record the direction); a full
  token emitter is out of scope.

## The design

### 1. The "design-tool provider" concept
Generalize the skill's "Google Stitch workflow" framing into **design-tool providers**: a provider is any
external tool that helps produce a look; its output is distilled into `wiki/design-system.md`. The
interview-first, zero-tool, keyless path remains the **default** and is unchanged — providers are **optional
accelerators, never dependencies** (the skill already produces a usable system from the interview alone).

### 2. Provider registry — additive config + doc table
Add an **additive** `providers` array to `.claude/skills/define-design/config.json`; each entry:
`{ "name", "kind": "look" | "assets", "access": "manual" | "mcp", "keyed": bool, "status_note" }`.
Ship it populated with:
- **Stitch** — `kind:"look"`, `access:"mcp"`, `keyed:true` — note: *Google Labs, "not officially supported";
  pin the package; free tier; key in `aios/.env` via the existing `mcp_enabled`/`STITCH_API_KEY`.*
- **Claude Design** — `kind:"look"`, `access:"manual"`, `keyed:false` — note: *interactive claude.ai (Pro/Max+);
  outbound-export only; consumes-not-emits — explore a look there, then describe/paste it back into the
  interview. Not automatable.*
- **"Bring your own"** — a documented pattern (Figma export, hand-authored, the next tool) so nothing is
  hardcoded as the only path.

The existing config keys (`mcp_enabled`, `default_archetype`, `theme_console`) are **unchanged**; `providers`
is new and read defensively (absent ⇒ behave exactly as today). The human-readable table lives in
`docs/DESIGN-SYSTEM.md`.

### 3. Skill procedure — minimal, additive
In `SKILL.md`, generalize the current **`Phase 2 — Stitch step`** (the "Optional: roast/Stitch" area around
lines 117–133) into a tool-agnostic **"Optional: use a design-tool provider"** step. The flow is unchanged in
shape (Generate → Export → Distill); only the framing becomes vendor-neutral:
1. **Provider selection is silent-default, never a menu (resolves the zero-new-prompts invariant).** The
   default provider is **Stitch** (kind `look`), surfaced exactly as today — the skill emits its ready-to-paste
   prompt on the current path with **no added question**. The registry/alternatives are surfaced **only when
   the user asks for a different tool or declines Stitch** ("prefer another tool, or none? — here's the list").
   The keyless interview-only path is reachable exactly as today (decline the accelerator). **Do not implement
   a "which provider?" prompt on the default path** — that would reintroduce the onboarding-bloat the RESHAPE
   exists to kill.
2. **Generate** the provider-appropriate output: for a `manual` provider, emit its instructions (Stitch → the
   existing ready-to-paste prompt; Claude Design → "explore the look in claude.ai, then describe/hand it back");
   for an `mcp` provider with its key present, drive it (Stitch's existing MCP path, unchanged).
3. **Export** into `raw/design/<date>-<slug>/` (unchanged, immutable/append-only).
4. **Distill** into `wiki/design-system.md` (unchanged).
Add a one-line **honesty note**: *"External design tools change monthly; we integrate the format
(`wiki/design-system.md`), not the vendor,"* plus the per-provider `status_note`s surfaced at the point of
offer.

### 4. Assets tier — explicitly deferred
A short paragraph in `docs/DESIGN-SYSTEM.md`, plus a one-line "later tier" note in
`docs/PATH-TO-PRODUCTION.md` (its existing later-tiers/roadmap area): imagery/asset generation (e.g.
Higgsfield) is a **different job** (raster media, not a design system) and a **later, keyed, opt-in "assets"
tier** — not part of `define-design`. When/if built, it must reconcile the design system's "no stock
photography" voice (placeholder/mock imagery for Tier-0; real assets only as an explicit keyed tier). **No
wiring in this change.**

### 5. Format alignment — note only
In the `design-system.md` shape docs, note that its palette (13 HSL tokens) is **compatible-in-spirit with the
W3C Design Tokens 2025.10 standard** and Stitch's open-sourced `DESIGN.md` interchange — recording the
direction (speak a standard, not a vendor dialect) without building a token emitter now.

## Invariants (guardrails)

- **Tier-0 / graceful-off:** interview-only path unchanged; no keys required; every provider is optional and
  absent-tolerant (missing tool/key ⇒ note the skip, fall back to manual/interview — never block).
- **Keys only in `aios/.env`, never chat** (Stitch behavior unchanged).
- **`raw/design/` immutable + append-only** (unchanged).
- **Backward compatible:** existing clones with no `providers` key, and existing `mcp_enabled`/`STITCH_API_KEY`
  setups, behave exactly as before.
- **Zero new prompts on the keyless default path** (onboarding-bloat guard).
- **Skill edit = NEEDS SIGN-OFF:** the actual edit is applied via the review → `improve-system` gate; this
  spec/plan does not itself apply it.
- **Honest framing:** never claim Claude Design is automatable or emits a design system; never call the app
  "agent-designed" on the strength of a provider.

## What ships (files touched)

- **`.claude/skills/define-design/SKILL.md`** — the Stitch name is hardcoded in several load-bearing spots; the
  planner must edit each with the decision noted, so a "vendor-neutral" skill isn't internally inconsistent:
  - **frontmatter `description` (line 3)** — **generalize**: "Google Stitch–aware" → design-tool-provider-aware
    (Stitch/Claude Design/bring-your-own). This is the routing surface Claude reads; it must reflect the model.
  - **intro paragraph (lines ~19–22)** — light reframe to the provider concept, **Stitch as the first example**
    (not removed).
  - **Configuration docs (lines ~49–52)** — document the additive `providers` array alongside the existing keys.
  - **`Phase 2 — Stitch step` (lines ~117–133)** — generalize into the optional-provider step **with the
    silent-default rule from §3** (Stitch stays the default; no new prompt).
  - **`## Stitch prompt` template section (line ~265)** — **rename to `## Regeneration prompt`** (Stitch as the
    example filler), so the north-star artifact template is vendor-neutral. **Do not touch** the build-consumed
    13-token Palette contract. Generalize the **Source footer (line ~272)** ("Google Stitch export…" → "design
    tool export / discovery interview").
  - **Safety/Privacy bullets (lines ~287–294)** — **keep** the Stitch-specific privacy fact (it's a real,
    tool-specific "sends to Google on your key" note) but frame it as a **per-provider note**, and add Claude
    Design's account/plan note (Pro+; interactive; you paste back).
- **`.claude/skills/define-design/config.json`** — additive `providers` array (Stitch + Claude Design + BYO);
  existing keys (`mcp_enabled`, `default_archetype`, `theme_console`) unchanged.
- **`docs/DESIGN-SYSTEM.md`** — reframe the "The Google Stitch workflow" section (line 30) → "Design-tool
  providers" (Stitch as the first example), the provider table, the deferred-assets note, the W3C/`DESIGN.md`
  alignment note.
- **`docs/PATH-TO-PRODUCTION.md`** — one-line "assets generation is a later keyed tier" note in its later-tiers
  area.
- **`CLAUDE.md`** — one-line tweak to the `define-design` skills-list description (Stitch-aware →
  design-tool-provider-aware). Verify it stays within the **150-line cap** (currently well under).
- Provenance: one `applied` `change-log.md` line written by `improve-system` after sign-off.

## Non-goals

- No new skill; no `build-*` sibling; no autopilot change.
- No keys entered, no tool driven on the user's behalf beyond the existing opt-in Stitch MCP.
- No Higgsfield/assets wiring; no W3C-token emitter; no interview rewrite (that's the deferred "Approach B").
- No change to how `wiki/design-system.md` is consumed by builds (the 13-token contract is unchanged).

## Verification / DoD

- `define-design` run with **no providers configured and no keys** produces a usable `wiki/design-system.md`
  from the interview alone (Tier-0 path unchanged).
- The keyless default path shows **no new prompts** vs. today — verified by a **step-by-step prose diff of
  Phases 0–2** of `SKILL.md` (skills are prose, not code): the revised default path must present the same
  question sequence as today, with the provider registry surfaced only on an explicit "different tool / none"
  branch. (This check depends on the §3 silent-default rule being implemented as written.)
- Existing Stitch users (`mcp_enabled:true` + key) see identical behavior.
- `docs/DESIGN-SYSTEM.md` documents the provider model, lists Stitch + Claude Design with honest status notes,
  defers assets/Higgsfield, and notes W3C/`DESIGN.md` alignment.
- No invariant regressions (keys, `raw/` immutability, graceful-off, sign-off routing).
- Claude Design is never described as automatable or as emitting a design system.

## Source

Vetting: `outputs/vetting/2026-07-03-claude-design-higgsfield-integration/` (roast RESHAPE + verified
storm-research briefing). Memory: `agent-accessibility-vetting-2026-07-03` (sibling agent-native work),
`build-mcp-app-stress-2026-07-03`.
