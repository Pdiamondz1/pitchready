# Loop-aware Autopilot Implementation Plan (Phase 17)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended)
> or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a post-build "what's next" pass to `autopilot` — a new **Phase E** that runs `advise-project`
(propose-only) focused on the just-built project, filing ranked ideas to `outputs/ideas-*.md`. An
autopilot-only change + ONE additive note on `advise-project`; `improve-system`/`maintenance-loop`/`build-*`
untouched.

**Architecture:** Edit `.claude/skills/autopilot/{SKILL.md,config.json}` (new Phase E + `advise_after_build`
flag + description) and add ONE additive `## Post-build invocation` H2 to `.claude/skills/advise-project/SKILL.md`
(its existing content preserved byte-for-byte). Source of truth:
`docs/superpowers/specs/2026-07-01-loop-aware-autopilot-design.md`.

**Sequencing note (Phase E vs Phase D):** Phase E is the **final step**, placed right after Phase D in the
skill. Phase D hands over the built app; Phase E then runs the advise pass and its own closing line points
the user at the ideas — so the user is always pointed at ideas that already exist (the spec's intent).

**Tech Stack:** Markdown/JSON authoring (no code/tests). Verification by `grep`/`wc`/`git` DoD checks.

**Branch:** all work on `phase-17-loop-aware` (already created off `main`; the spec is committed there).
Task 6's `git diff main..HEAD` checks depend on it — do not commit on `main`.

**Discipline (every task):** Edit ONLY `autopilot/{SKILL.md,config.json}`, `advise-project/SKILL.md`,
`docs/AUTOPILOT.md`, README, USING, and the master spec. **Never** touch `improve-system`,
`maintenance-loop`, the `build-*`/`define-*`/`roast`/`storm-research` skills, or `raw/`. The
`advise-project` note is ADDITIVE — never remove or reword its existing content.

---

### Task 1: Config + Configuration section (`advise_after_build`)

**Files:**
- Modify: `.claude/skills/autopilot/config.json`
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: `config.json`** — add the flag. Replace:

```
  "auto_adopt_reshape": true
}
```

with:

```
  "auto_adopt_reshape": true,
  "advise_after_build": true
}
```

- [ ] **Step 2: `SKILL.md` Configuration** — add the config bullet. Replace:

```
- `auto_adopt_reshape` (default `true`) — a non-KILL RESHAPE is auto-adopted (folded in, logged, no pause).
```

with:

```
- `auto_adopt_reshape` (default `true`) — a non-KILL RESHAPE is auto-adopted (folded in, logged, no pause).
- `advise_after_build` (default `true`) — run the Phase E post-build advise pass (propose-only) at the end of a run.
```

- [ ] **Step 3: Verify DoD**
```bash
node -e "const c=require('./.claude/skills/autopilot/config.json'); if(c.advise_after_build!==true) process.exit(1); console.log('CONFIG_OK')"
grep -q '`advise_after_build` (default `true`)' .claude/skills/autopilot/SKILL.md && echo SKILL_CONFIG_OK
```
Expect: CONFIG_OK SKILL_CONFIG_OK.

- [ ] **Step 4: Commit**
```bash
git add .claude/skills/autopilot/config.json .claude/skills/autopilot/SKILL.md
git commit -m "feat(loop-aware): config advise_after_build + Configuration bullet"
```

---

### Task 2: Autopilot SKILL.md — frontmatter description + Phase E

**Files:**
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: Frontmatter description.** Replace:

```
build (one or more of web/mobile/plugin) hands-off, pausing only on a KILL verdict.
```

with:

```
build (one or more of web/mobile/plugin) hands-off, pausing only on a KILL verdict, then proposes ranked next moves for the project (propose-only).
```

- [ ] **Step 2: Insert Phase E.** After the Phase D section (which ends with the line
  `shifted from approve-before-each-step to **decide-then-review-after**.`) and **before** the
  `## The decision ledger + run record` heading, insert this new section:

````markdown

### Phase E — Post-build advise ("what's next")

The final step. After the build (Phase C) and the hand-over (Phase D), if `config.advise_after_build`
(default `true`), run **`advise-project`** in a **post-build focus** — ground it on the just-built project:
the charter's `Later`/`Out` deferred items (→ `scale`/`improve` ideas), the decision ledger's
`(assumed — confirm later)` flags (→ `maintain`/validate ideas), the build record (`raw/builds/` + the
run's `plan.md`/`run.md` + per-target outcomes → what exists now), and the deferred tiers (real data,
deploy, more targets → next-step ideas). It files a ranked "what's next" list to `outputs/ideas-*.md`
exactly as normal. **Propose-only and hands-off** — nothing is applied, so there is **no confirm gate**;
`improve-system` stays the single applier. Log the pass to `run.md`, then close by pointing the user at the
ideas: *"And here's what I'd tackle next — a ranked list in `outputs/ideas-*.md`; approve any you like
(nothing changes until you do)."* (The `raw/metrics/` usage feed is empty for a fresh build — that's
expected; ground on the charter/ledger/build-record instead.)
````

- [ ] **Step 3: Verify DoD**
```bash
grep -q "Phase E — Post-build advise" .claude/skills/autopilot/SKILL.md && echo PHASEE_OK
grep -q "propose ranked next moves for the project" .claude/skills/autopilot/SKILL.md && echo DESC_OK
grep -q "post-build focus" .claude/skills/autopilot/SKILL.md && grep -q "no confirm gate" .claude/skills/autopilot/SKILL.md && echo PROPOSE_ONLY_OK
# Phase E sits before the ledger section
awk '/### Phase E/{e=NR} /## The decision ledger/{d=NR} END{ if(e>0 && e<d) print "ORDER_OK" }' .claude/skills/autopilot/SKILL.md
```
Expect: PHASEE_OK DESC_OK PROPOSE_ONLY_OK ORDER_OK.

- [ ] **Step 4: Commit**
```bash
git add .claude/skills/autopilot/SKILL.md
git commit -m "feat(loop-aware): autopilot Phase E (post-build advise) + description"
```

---

### Task 3: `advise-project` — additive `## Post-build invocation` note

**Files:**
- Modify: `.claude/skills/advise-project/SKILL.md`

- [ ] **Step 1: Append the note at the END of the file** (after the `## Output` section — additive; do NOT
  change any existing content):

````markdown

## Post-build invocation (driven by `autopilot`)

When invoked by `autopilot` right after a build (its **Phase E** — a distinct trigger from the build-chain
`## Autonomous invocation` notes on the build skills), focus your four lenses on the **just-built project**:
the charter's `Later`/`Out` deferred items → `scale`/`improve` ideas; the decision ledger's
`(assumed — confirm later)` flags (`outputs/autopilot/<date>-<slug>/decisions.md`) → `maintain`/validate
ideas; the deferred tiers (real data, deploy, more build targets) → next-step ideas; the build record
(`raw/builds/` + the run's `plan.md`/`run.md`) → what exists now. The `raw/metrics/` usage feed will be
empty for a fresh build — that's fine; skip it and ground on the charter/ledger/build-record. Write to
`outputs/ideas-*.md` exactly as in your normal run, honoring every rule above — stable ids, the
`max_ideas_per_tick` cap, `ideas-log.md` dedup, and the propose-only invariants (write only in `outputs/`,
never apply, `improve-system` stays the single applier). This note is additive — your attended and
maintenance-loop (unattended) behavior above is unchanged.
````

- [ ] **Step 2: Verify DoD**
```bash
grep -q "^## Post-build invocation (driven by \`autopilot\`)" .claude/skills/advise-project/SKILL.md && echo NOTE_OK
# additive proof: existing sections intact
grep -q "^## Safety invariants" .claude/skills/advise-project/SKILL.md && grep -q "^## The .ideas-\*.md. contract" .claude/skills/advise-project/SKILL.md && grep -q "Propose-only" .claude/skills/advise-project/SKILL.md && echo INTACT_OK
git diff --numstat main..HEAD -- .claude/skills/advise-project/SKILL.md | awk '{print "deletions:", $2}'
```
Expect: NOTE_OK, INTACT_OK, and `deletions: 0`.

- [ ] **Step 3: Commit**
```bash
git add .claude/skills/advise-project/SKILL.md
git commit -m "feat(loop-aware): additive '## Post-build invocation' note on advise-project"
```

---

### Task 4: `docs/AUTOPILOT.md` + `README.md` + `docs/USING-THIS-FOR-ANY-PROJECT.md`

**Files:**
- Modify: `docs/AUTOPILOT.md`, `README.md`, `docs/USING-THIS-FOR-ANY-PROJECT.md`

- [ ] **Step 1: `docs/AUTOPILOT.md`** — add a "what's next" step. After the decision-log step (step 6,
  ending `for you to review after (not before).`) and before the `## What you end up with` heading, add:

```
7. **It tells you what's next** — once it's built, it files a ranked list of next moves (from your deferred
   "later" items, the assumptions it flagged, and the next tiers) to `outputs/ideas-*.md` — for you to
   approve; nothing is applied.
```

- [ ] **Step 2: README — autopilot "What you get" bullet.** Replace:

```
- 🚀 **Or do it all in one go** — say **"build my whole project"** and it grills you once, vets + researches the idea, confirms one plan, then builds it end-to-end hands-off — for **one platform or several** (web + phone + extension from a single run) — pausing only if the idea gets a "stop" verdict (see [autopilot](docs/AUTOPILOT.md)).
```

with:

```
- 🚀 **Or do it all in one go** — say **"build my whole project"** and it grills you once, vets + researches the idea, confirms one plan, then builds it end-to-end hands-off — for **one platform or several** (web + phone + extension from a single run) — pausing only if the idea gets a "stop" verdict, then proposing what to build next (see [autopilot](docs/AUTOPILOT.md)).
```

- [ ] **Step 3: README — build-status.** After the Phase 16 line, add:

```
- Phase 17 — `autopilot` loop-aware: after building, it proposes ranked "what's next" ideas (propose-only) ✅
```

(Insert immediately after the line `- Phase 16 — \`autopilot\` multi-target: one grill builds any combination of web + mobile + plugin in a single run ✅`.)

- [ ] **Step 4: USING — the one-go line.** Replace:

```
logging every call for you to review after. Tier 0; user-initiated, never unattended. See `docs/AUTOPILOT.md`.
```

with:

```
logging every call for you to review after — and, once it's built, filing a ranked list of next moves to `outputs/ideas-*.md` (propose-only). Tier 0; user-initiated, never unattended. See `docs/AUTOPILOT.md`.
```

- [ ] **Step 5: Verify DoD**
```bash
grep -q "It tells you what's next" docs/AUTOPILOT.md && echo DOC_OK
grep -q "then proposing what to build next" README.md && grep -q "Phase 17" README.md && echo README_OK
grep -q "filing a ranked list of next moves" docs/USING-THIS-FOR-ANY-PROJECT.md && echo USING_OK
```
Expect: DOC_OK README_OK USING_OK.

- [ ] **Step 6: Commit**
```bash
git add docs/AUTOPILOT.md README.md docs/USING-THIS-FOR-ANY-PROJECT.md
git commit -m "docs(loop-aware): AUTOPILOT + README + USING — the post-build what's-next pass"
```

---

### Task 5: Phase 17 addendum to the master design spec

**Files:**
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`

- [ ] **Step 1:** Find the `## Phase 16 addendum` section (it ends the file) and append a **Phase 17
  addendum** after it, in the same single-dense-paragraph voice (with the `(2026-07-01)` date suffix).
  Cover: Phase 17 makes `autopilot` **loop-aware** — a new **Phase E** runs after the build, invoking
  `advise-project` (propose-only) in a post-build focus grounded on the just-built project (the charter's
  `Later`/`Out` items, the decision ledger's `(assumed — confirm later)` flags, the build record, the
  deferred tiers) to file ranked "what's next" ideas to `outputs/ideas-*.md`; **nothing is applied — no
  confirm gate** (advise-project never applies; `improve-system` stays the single applier); a config
  `advise_after_build` (default true) gates it; `advise-project` gains one **additive** `## Post-build
  invocation` note (its attended + maintenance-loop behavior byte-for-byte unchanged), so this is an
  autopilot-only change with `improve-system`/`maintenance-loop`/`build-*`/`raw/` untouched. Note the
  arc is now **define → vet → design → build → advise**; Tier 0; still user-initiated / never in
  `maintenance-loop`. Note `improve-system` was deliberately excluded (it's inward/applies changes, the
  wrong tool for improving the user's built product). Remaining deferred tiers: real-data/keyed builds and
  a silent no-grill mode. Point to `docs/AUTOPILOT.md` and
  `docs/superpowers/specs/2026-07-01-loop-aware-autopilot-design.md`.

- [ ] **Step 2: Verify DoD**
```bash
grep -q "Phase 17 addendum" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && grep -q "loop-aware" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo ADDENDUM_OK
```
Expect: ADDENDUM_OK.

- [ ] **Step 3: Commit**
```bash
git add docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(loop-aware): Phase 17 addendum in the master design spec"
```

---

### Task 6: Final verification (autopilot-only + additive + no-pollution)

**Files:** none (verification only).

- [ ] **Step 1: Untouched invariants (expect EMPTY).**
```bash
git diff --name-only main..HEAD -- .claude/skills/improve-system .claude/skills/maintenance-loop .claude/skills/build-app .claude/skills/build-mobile .claude/skills/build-plugin .claude/skills/define-project .claude/skills/define-design .claude/skills/roast .claude/skills/storm-research raw
```
Expect: EMPTY.

- [ ] **Step 2: advise-project additive-only + no pollution.**
```bash
git diff --numstat main..HEAD -- .claude/skills/advise-project/SKILL.md | awk '{print "advise-project deletions:", $2}'   # expect 0
test ! -e app && test ! -e wiki/charter.md && echo NO_BUILD_ARTIFACTS_OK
ls outputs 2>/dev/null | grep -E '^ideas-' | grep -q . && echo "POLLUTION: real ideas file" || echo NO_IDEAS_OK
git status --porcelain   # expect clean
```
Expect: `advise-project deletions: 0`, NO_BUILD_ARTIFACTS_OK, NO_IDEAS_OK, clean tree.

- [ ] **Step 3: Only intended files changed + cap.**
```bash
git diff --name-only main..HEAD | sort
L=$(wc -l < CLAUDE.md); echo "CLAUDE.md: $L"; [ "$L" -lt 125 ] && echo CAP_OK
```
Expect exactly: `.claude/skills/autopilot/SKILL.md`, `.claude/skills/autopilot/config.json`,
`.claude/skills/advise-project/SKILL.md`, `docs/AUTOPILOT.md`, `README.md`,
`docs/USING-THIS-FOR-ANY-PROJECT.md`, `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`
+ the 2 session spec/plan docs. Nothing else; CAP_OK (CLAUDE.md unchanged at 108).

- [ ] **Step 4:** No commit (verification only). Proceed to the final gates (tuned `code-reviewer` +
  Codex `codex review --base main`), then `finishing-a-development-branch`. Merge/push only on the user's
  explicit request.

---

## Notes for the executor
- **DRY/YAGNI:** ship exactly the spec — autopilot Phase E + the one additive advise-project note; nothing else.
- **Voice:** match the existing autopilot SKILL.md + `docs/AUTOPILOT.md`.
- **Additive is load-bearing:** the `advise-project` note only ADDs (0 deletions); never touch
  `improve-system`/`maintenance-loop`/`build-*`.
- **Do NOT run `autopilot`/`advise-project`** for real against this template.
- After all tasks: dispatch the tuned `code-reviewer` for the whole-branch review, run the Codex gate,
  then use `finishing-a-development-branch`. Merge/push only on the user's explicit request.
