# Multi-target Autopilot Implementation Plan (Phase 16)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended)
> or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Extend `autopilot` so one grill can build any combination of web (`app/`) + phone (`mobile/`) +
browser extension (`plugin/`) in a single hands-off run, from the same charter + design + vetting. An
**autopilot-only** change (SKILL.md + config.json + docs) — the `build-*` skills are untouched.

**Architecture:** Edit the existing `.claude/skills/autopilot/{SKILL.md,config.json}`: grill target →
multi-select; `default_target` → `default_targets`; Phase C loops `build-<target>` per selection with
per-target independence; run-state + edge-cases carve out build-target failures (continue) from
`define-design`/upstream failures (halt). Then update `docs/AUTOPILOT.md`, README/USING, and a master-spec
addendum. Source of truth: `docs/superpowers/specs/2026-07-01-multi-target-autopilot-design.md`.

**Tech Stack:** Markdown/JSON authoring (no code/tests). Verification is by `grep`/`wc`/`git` DoD checks.

**Branch:** all work on `phase-16-multi-target` (already created off `main`; the spec is committed there).
Task 6's `git diff main..HEAD` checks depend on it — do not commit on `main`.

**Discipline (every task):** Edit ONLY `autopilot/{SKILL.md,config.json}` + `docs/AUTOPILOT.md` + README +
USING + the master spec. **Never** touch the `build-*` skills, `define-*`, `roast`, `storm-research`,
`maintenance-loop`, `improve-system`, or `raw/`. All edits are the exact "Replace <old> with <new>" below.

---

### Task 1: Config + the Configuration section (`default_targets`)

**Files:**
- Modify: `.claude/skills/autopilot/config.json`
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: `config.json`** — Replace:

```
  "default_target": "",
```

with:

```
  "default_targets": [],
```

- [ ] **Step 2: `SKILL.md` Configuration — `default_target` line.** Replace:

```
- `default_target` (default `""`) — `""` = ask/infer the build target in the grill; else `web|mobile|plugin`.
```

with:

```
- `default_targets` (default `[]`) — `[]` = ask/infer in the grill; else a subset of `["web","mobile","plugin"]` to pre-select.
```

- [ ] **Step 3: `SKILL.md` Configuration — `build_chain` line.** Replace:

```
- `build_chain` (default `["define-design","build-<target>"]`) — the HANDS-OFF phase, after the gate; the `build-<target>` step resolves to the target-specific skill `build-app` | `build-mobile` | `build-plugin` chosen in the grill (there is no skill literally named `build`).
```

with:

```
- `build_chain` (default `["define-design","build-<target>"]`) — the HANDS-OFF phase, after the gate; `define-design` runs once, then the `build-<target>` step runs the target-specific skill `build-app` | `build-mobile` | `build-plugin` **for each target selected in the grill** (there is no skill literally named `build`).
```

- [ ] **Step 4: Verify DoD**
```bash
node -e "const c=require('./.claude/skills/autopilot/config.json'); if(!Array.isArray(c.default_targets)) process.exit(1); if('default_target' in c) process.exit(2); console.log('CONFIG_OK')"
grep -q "default_targets" .claude/skills/autopilot/SKILL.md && ! grep -q 'default_target`' .claude/skills/autopilot/SKILL.md && echo SKILL_CONFIG_OK
grep -q "for each target selected in the grill" .claude/skills/autopilot/SKILL.md && echo BUILDCHAIN_OK
```
Expect: CONFIG_OK SKILL_CONFIG_OK BUILDCHAIN_OK.

- [ ] **Step 5: Commit**
```bash
git add .claude/skills/autopilot/config.json .claude/skills/autopilot/SKILL.md
git commit -m "feat(multi-target): config default_targets (array) + Configuration section"
```

---

### Task 2: Phase A grill (multi-select) + Phase B (pluralize + plan.md keyed)

**Files:**
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: Phase A — the Target question → multi-select.** Replace:

```
- **Target (1)** — web (`app/`) / phone (`mobile/`) / browser extension (`plugin/`); recommend
  `config.default_target` if set, else infer from purpose/audience.
```

with:

```
- **Target(s)** — web (`app/`) · phone (`mobile/`) · browser extension (`plugin/`); **multi-select — pick
  one or more (up to all three)**. Recommend a primary from purpose/audience (and pre-select
  `config.default_targets` if set), but let the user choose several; the whole set is built from the same
  charter + design.
```

- [ ] **Step 2: Phase A — the exit criterion (pluralize).** Replace:

```
dimensions are answered-or-defaulted, a target is chosen, and no unresolved either/or would change scope.
```

with:

```
dimensions are answered-or-defaulted, a **target set** (one or more) is chosen, and no unresolved either/or would change scope.
```

- [ ] **Step 3: Phase B — plan.md keyed by folder.** Replace:

```
research findings**, the design direction, the target + what it will build, and the
`(assumed — confirm later)` list.
```

with:

```
research findings**, the design direction, **the target set + what each target will build (keyed by its
folder `app/`/`mobile/`/`plugin/` so each builder finds its own slice)**, and the
`(assumed — confirm later)` list.
```

- [ ] **Step 4: Phase B — the confirm question (pluralize).** Replace:

```
> *"This is the plan — already vetted (**GO**) and researched. After you say go, I'll design it and build
> it end-to-end **without stopping**. Every judgment call I make gets logged for you to review after.
```

with:

```
> *"This is the plan — already vetted (**GO**) and researched. After you say go, I'll design it and build
> **them** end-to-end **without stopping**. Every judgment call I make gets logged for you to review after.
```

- [ ] **Step 5: Verify DoD**
```bash
grep -q "multi-select — pick" .claude/skills/autopilot/SKILL.md && echo GRILL_MULTI_OK
grep -q "a \*\*target set\*\* (one or more) is chosen" .claude/skills/autopilot/SKILL.md && echo EXIT_OK
grep -q "keyed by its" .claude/skills/autopilot/SKILL.md && echo PLANKEY_OK
grep -q "build\n> \*\*them\*\*" .claude/skills/autopilot/SKILL.md || grep -q "build" .claude/skills/autopilot/SKILL.md; grep -q '> \*\*them\*\* end-to-end' .claude/skills/autopilot/SKILL.md && echo CONFIRM_OK
```
Expect: GRILL_MULTI_OK EXIT_OK PLANKEY_OK CONFIRM_OK.

- [ ] **Step 6: Commit**
```bash
git add .claude/skills/autopilot/SKILL.md
git commit -m "feat(multi-target): Phase A multi-select grill + Phase B pluralize + plan.md keyed by folder"
```

---

### Task 3: Phase C loop + independence, Phase D per-target preview, run-state, edge-case split

**Files:**
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: Phase C — the intro (define-design once; targets independent).** Replace:

```
Run `config.build_chain` in order, driving each sub-skill in autonomous mode, logging each step to
`run.md`. **No vetting stop (already GO); halt only on a genuine failure** (graceful + resumable):
```

with:

```
Run `config.build_chain` in order, driving each sub-skill in autonomous mode, logging each step to
`run.md`. **No vetting stop (already GO).** `define-design` runs once (a failure there halts — everything
depends on it); then `build-<target>` runs **once per selected target**, and the targets are
**independent** — a per-target build failure is logged and the run **continues to the next target**
(graceful + resumable):
```

- [ ] **Step 2: Phase C — the build step (loop over targets).** Replace:

```
2. **`build-<target>` (autonomous)** — read `plan.md` + `wiki/charter.md` + `wiki/design-system.md` + the
   GO verdict; **skip the Phase 2 confirm gate** (your gate covered it); the RESHAPE pivot is already
   folded; scaffold `app/`|`mobile/`|`plugin/` **offline** (do NOT run `npm install`) →
   `raw/builds/<date>-<slug>.md` + `wiki/build.md` + its own `applied` change-log line.
```

with:

```
2. **`build-<target>` (autonomous) — once per selected target** (`web`→`build-app`, `mobile`→`build-mobile`,
   `plugin`→`build-plugin`) — read `plan.md` + `wiki/charter.md` + `wiki/design-system.md` + the GO verdict;
   **skip the Phase 2 confirm gate** (your gate covered it); the RESHAPE pivot is already folded; scaffold
   that target's `app/`|`mobile/`|`plugin/` folder **offline** (do NOT run `npm install`) → its
   `raw/builds/<date>-<slug>.md` (target-tagged) + its section of the shared `wiki/build.md` + its own
   `applied` change-log line. Record each target's outcome (built / failed / skipped) in `run.md` +
   `decisions.md`; a failed target does not stop the others.
```

- [ ] **Step 3: Phase D — per-target preview.** Replace:

```
the one-command preview path for the built target (copied from the build skill's close-out). Approval has
```

with:

```
the one-command preview path for **each** built target (`app/` → `npm run dev`; `mobile/` → `npm run
start` / Expo Go QR; `plugin/` → `npm run build` + Chrome Load unpacked). Approval has
```

- [ ] **Step 4: Run-state — per-target outcomes.** Replace:

```
Run-state lives in `outputs/runs/autopilot.json` (`last_run`, `current_slug`, `phase`, `status`,
`step_index`, counts, error) for resumability.
```

with:

```
Run-state lives in `outputs/runs/autopilot.json` (`last_run`, `current_slug`, `phase`, `status`,
`step_index`, counts, error, **plus a per-target `targets` map — `{web|mobile|plugin: built|failed|pending}` — and a `completed_with_failures` status**) for resumability, so a resume retries only the unbuilt/failed targets.
```

- [ ] **Step 5: Edge-cases — split the failure bullet.** Replace:

```
- **Sub-skill failure mid-run** — stop gracefully (log, set `status=failed` + `step_index`); re-invoking
  resumes from the failed step.
```

with:

```
- **A build-target failure** — is **independent**: log it (mark that target `failed` in the `targets` map)
  and **continue to the next target**; the run ends `completed_with_failures` and a re-run retries only the
  failed/unbuilt targets. **A `define-design` or upstream (Phase A) failure** — halts (everything depends
  on it): log, set `status=failed` + `step_index`, and re-invoking resumes from that step.
```

- [ ] **Step 6: Verify DoD**
```bash
grep -q "once per selected target" .claude/skills/autopilot/SKILL.md && echo LOOP_OK
grep -q "a failed target does not stop the others" .claude/skills/autopilot/SKILL.md && echo INDEP_OK
grep -q "for \*\*each\*\* built target" .claude/skills/autopilot/SKILL.md && echo PREVIEW_OK
grep -q "completed_with_failures" .claude/skills/autopilot/SKILL.md && grep -q "targets. map" .claude/skills/autopilot/SKILL.md && echo RUNSTATE_OK
grep -q "A build-target failure" .claude/skills/autopilot/SKILL.md && grep -q "A .define-design. or upstream" .claude/skills/autopilot/SKILL.md && echo EDGECASE_OK
```
Expect: LOOP_OK INDEP_OK PREVIEW_OK RUNSTATE_OK EDGECASE_OK.

- [ ] **Step 7: Commit**
```bash
git add .claude/skills/autopilot/SKILL.md
git commit -m "feat(multi-target): Phase C loop + per-target independence, per-target preview, run-state, edge-case split"
```

---

### Task 4: SKILL.md description + `docs/AUTOPILOT.md`

**Files:**
- Modify: `.claude/skills/autopilot/SKILL.md`
- Modify: `docs/AUTOPILOT.md`

- [ ] **Step 1: SKILL.md frontmatter description.** Replace:

```
→ define-design → build hands-off, pausing only on a KILL verdict.
```

with:

```
→ define-design → build (one or more of web/mobile/plugin) hands-off, pausing only on a KILL verdict.
```

- [ ] **Step 2: AUTOPILOT.md — the grill step.** Replace:

```
2. **It grills you once** — a single, fast interview (what you're building, who it's for, how it should
   look, and whether it's a web app / phone app / browser extension), always offering options + a
   recommended pick so it moves quickly.
```

with:

```
2. **It grills you once** — a single, fast interview (what you're building, who it's for, how it should
   look, and which platforms — a web app, a phone app, a browser extension, **or any combination**),
   always offering options + a recommended pick so it moves quickly.
```

- [ ] **Step 3: AUTOPILOT.md — the build step.** Replace:

```
5. **It builds hands-off** — designs it, then scaffolds your `app/` / `mobile/` / `plugin/` — no more
   questions.
```

with:

```
5. **It builds hands-off** — designs it once, then scaffolds **each app you picked** (`app/` and/or
   `mobile/` and/or `plugin/`) — no more questions.
```

- [ ] **Step 4: AUTOPILOT.md — "What you end up with".** Replace:

```
built app with mock data — plus the decision log. Preview the app with the one command it prints.
```

with:

```
built app (or **several — one per platform you picked**) with mock data — plus the decision log. Preview
each app with the one command it prints.
```

- [ ] **Step 5: Verify DoD**
```bash
grep -q "one or more of web/mobile/plugin" .claude/skills/autopilot/SKILL.md && echo DESC_OK
grep -q "or any combination" docs/AUTOPILOT.md && grep -q "each app you picked" docs/AUTOPILOT.md && grep -q "one per platform you picked" docs/AUTOPILOT.md && echo DOC_OK
```
Expect: DESC_OK DOC_OK.

- [ ] **Step 6: Commit**
```bash
git add .claude/skills/autopilot/SKILL.md docs/AUTOPILOT.md
git commit -m "docs(multi-target): SKILL description + AUTOPILOT.md — one grill, one or more apps"
```

---

### Task 5: `README.md` + `docs/USING-THIS-FOR-ANY-PROJECT.md` + master-spec Phase 16 addendum

**Files:**
- Modify: `README.md`
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md`
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`

- [ ] **Step 1: README — the autopilot "What you get" bullet.** Replace:

```
- 🚀 **Or do it all in one go** — say **"build my whole project"** and it grills you once, vets + researches the idea, confirms one plan, then builds it end-to-end hands-off — pausing only if the idea gets a "stop" verdict (see [autopilot](docs/AUTOPILOT.md)).
```

with:

```
- 🚀 **Or do it all in one go** — say **"build my whole project"** and it grills you once, vets + researches the idea, confirms one plan, then builds it end-to-end hands-off — for **one platform or several** (web + phone + extension from a single run) — pausing only if the idea gets a "stop" verdict (see [autopilot](docs/AUTOPILOT.md)).
```

- [ ] **Step 2: README — build-status.** After the Phase 15 line, add:

```
- Phase 16 — `autopilot` multi-target: one grill builds any combination of web + mobile + plugin in a single run ✅
```

(Insert immediately after the line `- Phase 15 — \`autopilot\`: describe once → grill + vet + research + confirm → hands-off design+build (the capstone) ✅`.)

- [ ] **Step 3: USING — the one-go line.** Replace:

```
**Or do it all in one go:** run **`autopilot`** — describe your goal once and it grills you, vets + researches the idea, shows you one plan to confirm, then runs the whole define→vet→design→build chain hands-off (pausing only on a "stop" verdict), logging every call for you to review after. Tier 0; user-initiated, never unattended. See `docs/AUTOPILOT.md`.
```

with:

```
**Or do it all in one go:** run **`autopilot`** — describe your goal once and it grills you, vets + researches the idea, shows you one plan to confirm, then runs the whole define→vet→design→build chain hands-off, **building one platform or several (web + phone + extension in a single run)** (pausing only on a "stop" verdict), logging every call for you to review after. Tier 0; user-initiated, never unattended. See `docs/AUTOPILOT.md`.
```

- [ ] **Step 4: Master spec — Phase 16 addendum.** Find the `## Phase 15 addendum` section (it ends the
  file) and append a **Phase 16 addendum** after it, in the same single-dense-paragraph voice (with the
  `(2026-07-01)` date suffix). Cover: Phase 16 makes `autopilot` **multi-target** — the grill's target
  question becomes multi-select (any combination of web `app/` / phone `mobile/` / browser extension
  `plugin/`), and Phase C runs `define-design` once then `build-<target>` per selected target from the
  same shared charter + design + vetting, so the platforms are coherent; **targets are independent** (a
  failed one is logged and the rest still build — `completed_with_failures`; only a shared `define-design`
  failure halts), tracked by a per-target `targets` map in `outputs/runs/autopilot.json`; config
  `default_target` → `default_targets` (array). It is an **autopilot-only** change — the `build-*` skills
  are byte-for-byte unchanged because they already build their own folder and compose into the shared
  `wiki/build.md` (Web/Mobile/Browser-extension sections). Tier 0, still user-initiated / never in
  `maintenance-loop`. Deferred: parallel target builds, and the other three autopilot tiers (loop-aware
  build→improve, real-data/keyed builds, silent no-grill mode). Point to `docs/AUTOPILOT.md` and
  `docs/superpowers/specs/2026-07-01-multi-target-autopilot-design.md`.

- [ ] **Step 5: Verify DoD**
```bash
grep -q "one platform or several" README.md && grep -q "Phase 16" README.md && echo README_OK
grep -q "one platform or several" docs/USING-THIS-FOR-ANY-PROJECT.md && echo USING_OK
grep -q "Phase 16 addendum" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && grep -q "multi-target" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo ADDENDUM_OK
```
Expect: README_OK USING_OK ADDENDUM_OK.

- [ ] **Step 6: Commit**
```bash
git add README.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(multi-target): README + USING + Phase 16 addendum"
```

---

### Task 6: Final verification (autopilot-only + no-pollution)

**Files:** none (verification only).

- [ ] **Step 1: build-* + upstream + invariants untouched (expect EMPTY).**
```bash
git diff --name-only main..HEAD -- .claude/skills/build-app .claude/skills/build-mobile .claude/skills/build-plugin .claude/skills/define-project .claude/skills/define-design .claude/skills/roast .claude/skills/storm-research .claude/skills/maintenance-loop .claude/skills/improve-system raw
```
Expect: EMPTY (the multi-target change is autopilot-only).

- [ ] **Step 2: No pollution.**
```bash
test ! -e app && test ! -e mobile && test ! -e plugin && echo NO_APPS_OK
test ! -e wiki/charter.md && test ! -e outputs/runs/autopilot.json && echo NO_RUNTIME_OK
ls outputs/autopilot | grep -v '^\.gitkeep$' | grep -q . && echo "POLLUTION" || echo NO_RUNDIR_OK
git status --porcelain   # expect clean
```
Expect: NO_APPS_OK, NO_RUNTIME_OK, NO_RUNDIR_OK, clean tree.

- [ ] **Step 3: Only intended files changed + cap.**
```bash
git diff --name-only main..HEAD | sort
LINES=$(wc -l < CLAUDE.md); echo "CLAUDE.md: $LINES"; [ "$LINES" -lt 125 ] && echo CAP_OK
```
Expect exactly: `.claude/skills/autopilot/SKILL.md`, `.claude/skills/autopilot/config.json`,
`docs/AUTOPILOT.md`, `README.md`, `docs/USING-THIS-FOR-ANY-PROJECT.md`,
`docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` + the two session spec/plan docs.
Nothing else; CAP_OK (CLAUDE.md unchanged at 108).

- [ ] **Step 4:** No commit (verification only). Proceed to the final gates (tuned `code-reviewer` agent
  whole-branch review + Codex `codex review --base main`), then `finishing-a-development-branch`.
  Merge/push only on the user's explicit request.

---

## Notes for the executor
- **DRY/YAGNI:** ship exactly the spec — autopilot-only; the `build-*` skills stay byte-for-byte unchanged.
- **Voice:** match the existing autopilot SKILL.md + `docs/AUTOPILOT.md`.
- **Every edit is a quoted Replace** — match the `old` text verbatim (em-dashes, `·`, arrows, backticks).
- After all tasks: dispatch the tuned `code-reviewer` for the whole-branch review, run the Codex gate,
  then use `finishing-a-development-branch`. Merge/push only on the user's explicit request.
