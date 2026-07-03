# Design-Tool Providers (define-design) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize `define-design`'s Google-Stitch-specific integration into a vendor-neutral "design-tool provider" model, add Claude Design as an honest manual provider example, and defer Higgsfield — additively, backward-compatibly, Tier-0-preserving.

**Architecture:** `wiki/design-system.md` is the durable, vendor-neutral **contract**; external tools are swappable **providers** whose only job is to help populate it via the unchanged Generate → Export (`raw/design/<date>-<slug>/`) → Distill flow. A new *descriptive*, additive `providers` array in config documents the model; the existing `mcp_enabled`/`STITCH_API_KEY` Stitch control stays the source of truth (absent `providers` ⇒ today's behavior). Stitch remains the **silent default** — no new prompt on the keyless path.

**Tech Stack:** Claude Code skill prose (`SKILL.md`), JSON config, Markdown docs. No code, no tests, no keys, no new dependencies.

**Source spec:** `docs/superpowers/specs/2026-07-03-design-tool-providers-design.md` (committed 64d54f2). Vetting: `outputs/vetting/2026-07-03-claude-design-higgsfield-integration/`.

**Sign-off note:** This is a **user-driven, spec-reviewed, deliberately-planned** skill edit (not an autonomous `improve-system` proposal). It follows the house "phase build" pattern every existing skill used — spec → plan → implement → **code-review** → commit on the user's explicit approval. The CLAUDE.md "edited skill = NEEDS SIGN-OFF" clause is satisfied by the human-in-the-loop approval at each gate; the final commit to `main` is gated on the user's go (Task 7), and the `change-log` line is written `applied`. (If the user prefers the `review-*.md` → `improve-system` route instead, Task 7 files an `rv-` item rather than committing — a one-line branch.)

**Guardrail checklist (must hold at every task):** Tier-0/graceful-off · keys only in `aios/.env`, never chat · `raw/design/` immutable/append-only · **zero new prompts on the keyless default path** · backward-compatible (no `providers` key ⇒ unchanged) · never claim Claude Design is automatable or emits a design system · the build-consumed **13-token Palette contract is untouched**.

---

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `.claude/skills/define-design/config.json` | skill config | **Modify** — additive `providers` array |
| `.claude/skills/define-design/SKILL.md` | the skill | **Modify** — vendor-neutral reframe across 6 enumerated spots |
| `docs/DESIGN-SYSTEM.md` | user-facing design doc | **Modify** — "Stitch workflow" → "Design-tool providers" + table + deferred-assets + alignment note |
| `docs/PATH-TO-PRODUCTION.md` | roadmap | **Modify** — one-line assets-later-tier note |
| `CLAUDE.md` | operating rules / skills list | **Modify** — one-line `define-design` description; verify 150-line cap |
| `outputs/change-log.md` | ledger | **Modify** — one `applied` line (Task 7) |

Order: config → SKILL.md → docs → CLAUDE.md → provenance/commit. SKILL.md is one task (its spots are interdependent; splitting risks a half-converted, internally-inconsistent skill).

---

### Task 1: Additive `providers` array in config

**Files:**
- Modify: `.claude/skills/define-design/config.json`

- [ ] **Step 1: Read the current config** so the existing keys are preserved verbatim.

Run: `cat .claude/skills/define-design/config.json`
Expected: an object with `mcp_enabled`, `default_archetype`, `theme_console` (and possibly others).

- [ ] **Step 2: Add the `providers` array** (do not remove or reorder existing keys). Append this key:

```json
"providers": [
  {
    "name": "Stitch",
    "kind": "look",
    "access": "mcp",
    "keyed": true,
    "default": true,
    "status_note": "Google Labs — 'not officially supported'; pin the package. Free tier; drive via the existing mcp_enabled + STITCH_API_KEY (aios/.env). Emits a portable design export (DESIGN.md-style)."
  },
  {
    "name": "Claude Design",
    "kind": "look",
    "access": "manual",
    "keyed": false,
    "default": false,
    "status_note": "Interactive claude.ai (Pro/Max/Team/Enterprise). Outbound-export only; CONSUMES a design system, does not emit one; NOT automatable. Use it to explore a look, then describe/paste the result back into the interview."
  },
  {
    "name": "Bring your own",
    "kind": "look",
    "access": "manual",
    "keyed": false,
    "default": false,
    "status_note": "Any tool (Figma export, a hand-authored file, the next tool). Its output is distilled into wiki/design-system.md the same way — the format is the contract, not the vendor."
  }
]
```

- [ ] **Step 3: Verify the JSON is valid and existing keys survive.**

Run: `node -e "const c=require('./.claude/skills/define-design/config.json'); console.log('mcp_enabled' in c, 'default_archetype' in c, 'theme_console' in c, Array.isArray(c.providers), c.providers.length)"`
Expected: `true true true true 3`

- [ ] **Step 4: Commit.**

```bash
git add .claude/skills/define-design/config.json
git commit -m "define-design: additive providers registry in config (Stitch/Claude Design/BYO)"
```

---

### Task 2: Vendor-neutral reframe of `SKILL.md` (all six spots, one commit)

**Files:**
- Modify: `.claude/skills/define-design/SKILL.md` (frontmatter line ~3; intro ~19–22; Configuration ~49–52; `Phase 2` Stitch step ~117–133; `## Stitch prompt` template section ~265 + Source footer ~272; Safety/Privacy ~287–294)

Read the whole file first (`sed -n '1,300p' .claude/skills/define-design/SKILL.md`) so each edit keeps surrounding structure. Make ALL six edits before verifying — a partial conversion leaves the skill internally inconsistent.

- [ ] **Step 1: Frontmatter `description` (line ~3).** Replace the "Google Stitch–aware" framing so the routing surface reflects the model. New description must convey: *design-discovery skill that grills the user into `wiki/design-system.md`; **design-tool-provider aware** — Stitch (optional MCP or manual), Claude Design (manual), or bring-your-own — providers are optional accelerators, the interview alone suffices; re-runnable; zero-argument safe.* Keep it one sentence, same style as the current line.

- [ ] **Step 2: Intro (~19–22).** Light reframe: the skill produces a usable system from the interview alone; optionally an external **design-tool provider** accelerates it, distilled the same way. Stitch named as *the first example provider*, not the only path.

- [ ] **Step 3: Configuration docs (~49–52).** Document the additive `providers` array next to the existing keys (`mcp_enabled`, `default_archetype`, `theme_console`), noting it is descriptive/optional and that Stitch's actual control remains `mcp_enabled` + `STITCH_API_KEY` (backward-compatible).

- [ ] **Step 4: `Phase 2` provider step (~117–133) — the silent-default rule (load-bearing).** Generalize the Stitch step into "Optional: use a design-tool provider" with this behavior, stated explicitly so it can't be built as a menu:
  - The **default provider is Stitch**; the skill emits its ready-to-paste prompt on the current path with **no added question** — identical keyless/default sequence to today.
  - Surface the **registry/alternatives only** when the user asks for a different tool or declines Stitch ("prefer another tool, or none?").
  - The interview-only path is reached by declining the accelerator (as today).
  - For a `manual` provider, emit its instructions (Stitch → existing prompt; Claude Design → "explore the look in claude.ai, then describe/hand it back — it can't be driven and doesn't emit a file, so you translate it back into the interview"). For an `mcp` provider with its key present, drive it (Stitch's existing MCP path, unchanged).
  - Add the honesty line: *"External design tools change monthly; we integrate the format (`wiki/design-system.md`), not the vendor."*

- [ ] **Step 5: Rename the `## Stitch prompt` template section (~265) → `## Regeneration prompt`** with Stitch as the example filler ("a ready-to-paste prompt that regenerates/iterates this system in your chosen design tool, e.g. Stitch"). Generalize the **Source footer (~272)**: "Google Stitch export…" → "design-tool export / discovery interview". **Do NOT touch** the Palette section or the 13 HSL token names/contract.

- [ ] **Step 6: Safety/Privacy (~287–294).** Keep the Stitch-specific privacy fact but frame it as a **per-provider note** ("Using Stitch sends your prompt/screenshots to Google on your key…"), and add Claude Design's note (interactive claude.ai on a paid plan; you paste back; nothing sent by the skill on your behalf).

- [ ] **Step 7: Verify vendor-neutrality + backward-compat + the keyless path.**

Run: `grep -n -i "stitch" .claude/skills/define-design/SKILL.md`
Expected: Stitch still appears (as the default/example + its real privacy note), but NOT as the *only* framing — the frontmatter description, the Phase 2 step header, and the template section are provider-general. Manually confirm: (a) the frontmatter no longer says the skill is only "Stitch-aware"; (b) `## Stitch prompt` is now `## Regeneration prompt`; (c) the Palette/13-token block is byte-identical to before.

Run: `grep -n -i "claude design\|provider" .claude/skills/define-design/SKILL.md`
Expected: Claude Design present as a manual provider with the honest caveats; "provider" framing present in Phase 2 + Configuration.

- [ ] **Step 8: Keyless-path prose diff (the zero-new-prompts DoD).**

Run: `git diff .claude/skills/define-design/SKILL.md` and read the Phase 0–2 hunks.
Expected: the **default/keyless question sequence is unchanged** — no new "which provider?" question on the default path; the registry only appears on an explicit "different tool / none" branch. If a new prompt landed on the default path, revise Step 4.

- [ ] **Step 9: Commit.**

```bash
git add .claude/skills/define-design/SKILL.md
git commit -m "define-design: vendor-neutral design-tool-provider reframe (Stitch silent default; Claude Design manual example; Regeneration prompt)"
```

---

### Task 3: Reframe `docs/DESIGN-SYSTEM.md`

**Files:**
- Modify: `docs/DESIGN-SYSTEM.md` ("The Google Stitch workflow" section, line ~30; the two-tiers ~55–77)

- [ ] **Step 1: Reframe the page to be vendor-neutral — three spots, not just the workflow section** (a partial reframe that leaves the title/intro "Stitch-aware" is an inconsistency an implementer would trip on):
  - **Page title (line 1):** `# Design system (Stitch-aware)` → `# Design system (design-tool-provider aware)`.
  - **Intro paragraph (lines ~3–9):** change "Google Stitch–aware" to the provider framing (Stitch is the default example provider; Claude Design + bring-your-own are alternatives; the interview alone suffices).
  - **The workflow section (line ~30):** rename "The Google Stitch workflow" → "Design-tool providers." Keep the Generate → Export → Distill explanation (tool-agnostic); present **Stitch as the first example provider**; keep the existing "two tiers" (manual default / optional MCP) as *Stitch's* tiers under the provider framing.
  - **The shape-description bullet (line ~94):** `- **Stitch prompt** — …regenerates or iterates this system in Stitch.` → `- **Regeneration prompt** — the ready-to-paste prompt that regenerates or iterates this system in your chosen design tool (e.g. Stitch).` This keeps DESIGN-SYSTEM.md in sync with the `## Regeneration prompt` rename in Task 2 Step 5.

- [ ] **Step 2: Add a provider table:**

```markdown
| Provider | Job | Access | Keyed? | Notes |
|---|---|---|---|---|
| **Stitch** (default) | look + design system | manual prompt or optional MCP | key in `aios/.env` | Google Labs, "not officially supported"; free tier; emits a portable `DESIGN.md`-style export. |
| **Claude Design** | look (exploration) | **manual only** | account-gated (Pro/Max+) | Interactive claude.ai; outbound-export only; **consumes**, doesn't emit, a design system; **not automatable** — paste the look back into the interview. |
| **Bring your own** | look | manual | — | Figma export, hand-authored, the next tool. The format (`design-system.md`) is the contract. |
```

- [ ] **Step 3: Add the deferred-assets note** — imagery/asset generation (e.g. Higgsfield: raster image/video, has a first-party API/MCP but outputs no tokens/type/palette) is a **different job** and a **later, keyed, opt-in "assets" tier**, not part of `define-design`; when/if built it must reconcile the "no stock photography" voice. **Not wired now.**

- [ ] **Step 4: Add the alignment note** — `design-system.md`'s 13-token palette is compatible-in-spirit with the **W3C Design Tokens 2025.10** standard and Stitch's `DESIGN.md` interchange (we speak a standard, not a vendor dialect). Add a one-line honesty note: external tools churn — we integrate the format, not the vendor.

- [ ] **Step 5: Verify.**

Run: `grep -n -i "provider\|higgsfield\|claude design\|w3c\|design token" docs/DESIGN-SYSTEM.md`
Expected: provider framing + the table + the deferred Higgsfield/assets note + the W3C alignment note all present; Stitch retained as the default example.

- [ ] **Step 6: Commit.**

```bash
git add docs/DESIGN-SYSTEM.md
git commit -m "docs: DESIGN-SYSTEM reframed to design-tool providers (Stitch default, Claude Design manual, assets deferred)"
```

---

### Task 4: One-line assets-tier note in `docs/PATH-TO-PRODUCTION.md`

**Files:**
- Modify: `docs/PATH-TO-PRODUCTION.md` (its later-tiers / deferred area)

- [ ] **Step 1: Read** the file to choose the correct placement. **Do NOT** insert into the `## Agent-accessibility` section's "Deliberately deferred" sub-list (line ~76) — asset/imagery generation is not an agent-accessibility concern. The file has no standalone "later tiers" area, so add a **new short note as its own mini-section immediately before the closing `## The rule that never changes` heading (line ~87)** — e.g. a `## Assets / imagery (a later, separate tier)` note.

- [ ] **Step 2: Add the note** (as that new mini-section): *"Asset/imagery generation (e.g. Higgsfield — raster image/video, and note it does have a first-party API/MCP, but it outputs no design tokens/type/palette so it is not a design system) is a later, keyed, opt-in 'assets' tier, separate from `define-design`; when built it must reconcile the design system's 'no stock photography' voice. Vetted + deferred 2026-07-03 (`outputs/vetting/2026-07-03-claude-design-higgsfield-integration/`)."*

- [ ] **Step 3: Verify + commit.**

Run: `grep -n -i "assets\|higgsfield" docs/PATH-TO-PRODUCTION.md` → expect the new mini-section, positioned before `## The rule that never changes` (confirm with `grep -n "^## " docs/PATH-TO-PRODUCTION.md`).
```bash
git add docs/PATH-TO-PRODUCTION.md
git commit -m "docs: note assets/imagery generation as a later keyed tier (path-to-production)"
```

---

### Task 5: One-line `CLAUDE.md` description tweak (+ cap verify)

**Files:**
- Modify: `CLAUDE.md` (the `define-design` skills-list bullet)

- [ ] **Step 1: Update the `define-design` bullet** — "Google Stitch–aware" → "design-tool-provider aware (Stitch · Claude Design · bring-your-own; interview alone suffices)". Keep it to the existing one-line style.

- [ ] **Step 2: Verify the 150-line cap.**

Run: `wc -l CLAUDE.md`
Expected: ≤ 150. If the edit pushed it over, tighten the wording (condense, don't drop a rule).

- [ ] **Step 3: Commit.**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: define-design is design-tool-provider aware (not Stitch-only)"
```

---

### Task 6: Code-review the whole change

**Files:** none (review only)

- [ ] **Step 1: Dispatch the `code-reviewer` agent** on the uncommitted-to-`main` branch diff (all of Tasks 1–5). Ask it to verify: vendor-neutral framing is internally consistent (frontmatter ↔ Phase 2 ↔ template ↔ docs ↔ CLAUDE.md); backward-compat holds (no `providers` ⇒ unchanged; `mcp_enabled`/`STITCH_API_KEY` untouched); **zero new prompts on the keyless default path** (Phase 0–2 diff); the 13-token Palette contract is byte-identical; no key/`raw/` invariant regressions; Claude Design never described as automatable or as emitting a design system; Higgsfield not wired in.

- [ ] **Step 2: Fold in any blocking findings**, re-review if needed (max 2 iterations, then surface to the user).

---

### Task 7: Provenance + apply (user-gated)

**Files:**
- Modify: `outputs/change-log.md`; (optionally) `wiki/index.md` if a cross-link needs updating.

- [ ] **Step 1: Append the `change-log` line** (newest at top): `- 2026-07-03 — define-design — generalized to vendor-neutral design-tool providers (Stitch default + Claude Design manual example); assets/Higgsfield deferred — applied`

- [ ] **Step 2: On the user's explicit go**, integrate to `main` and push (branch → `--ff-only` → `push origin main` → delete branch), matching the house phase-build pattern. Exclude the pre-existing untracked `outputs/vetting/2026-07-02-*` folder.
  - *Alternative branch (if the user prefers the self-improvement gate):* instead of committing to `main`, file a NEEDS-SIGN-OFF `rv-YYYYMMDD-NNN` item in `outputs/review-2026-07-03-*.md` summarizing the applied change, and let `improve-system` apply on the checked box.

- [ ] **Step 3: Update memory** — a short project memory noting the vetting outcome (RESHAPE → format-first providers, Claude Design manual, Higgsfield deferred) + the shipped commit.

- [ ] **Step 4: Record the deferred out-of-scope cleanup** so stale "Google Stitch–aware" `define-design` descriptions elsewhere aren't forgotten — note them in the memory (or a `needs-context`/follow-up line): `README.md` (~lines 53, 181), `docs/USING-THIS-FOR-ANY-PROJECT.md` (~line 26), and `CLAUDE.md` line 24 (`raw/design/` — "define-design Stitch exports"). These are narrower-than-reality after this change but not incorrect; a future doc-sweep can generalize them. Out of scope for this change (the spec scoped the skill + its two primary docs), listed so they're tracked.

---

## Definition of Done

- `define-design` run keyless, no `providers`, no keys → usable `wiki/design-system.md` from the interview alone; **keyless question sequence identical to today** (Phase 0–2 prose diff).
- Existing Stitch users (`mcp_enabled:true` + key) → identical behavior.
- `SKILL.md` frontmatter, Phase 2, and the (renamed) `## Regeneration prompt` section are vendor-neutral; the 13-token Palette contract is byte-identical.
- `DESIGN-SYSTEM.md` documents the provider model + table + deferred assets + W3C/`DESIGN.md` alignment; Claude Design honestly framed; Higgsfield not wired in.
- `CLAUDE.md` ≤ 150 lines; `define-design` bullet reflects the provider model.
- code-reviewer: Approved. Change committed on the user's go with a `change-log` `applied` line.
