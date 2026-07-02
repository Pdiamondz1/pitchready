# ship-check (Phase 22) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `ship-check` skill (the propose-only "go/no-go" gate — one **GO / NOT-YET** production-readiness verdict across eight checks) and the roadmap/docs wiring — the fifth rung of `docs/PATH-TO-PRODUCTION.md`.

**Architecture:** A pure **authoring** phase — every task writes a skill file, a config, a doc, or an exact additive edit. Content is transcribed **verbatim**; Definition-of-Done is `grep`/`wc`/`git`. It ships **author-only / clean**: NO real `outputs/ship-check/<date>-*` report is ever created (only `outputs/ship-check/.gitkeep`). `ship-check` is **propose-only** (mirrors `audit-app`): it adds **no** subagent (so `docs/SUBAGENTS.md` and `.claude/agents/` are NOT touched), writes no `raw/`/`wiki/`/`change-log` provenance, and is **deliberately NOT in `autopilot`** (so `.claude/skills/autopilot/*` and `docs/AUTOPILOT.md` are NOT touched — the exclusion lives in `ship-check`'s own `## Autonomous invocation` note, mirroring `deploy`).

**Tech Stack:** Markdown skills (`.claude/skills/<name>/SKILL.md` + `config.json`), Markdown docs. Spec: `docs/superpowers/specs/2026-07-02-ship-check-design.md`. Branch: `phase-22-ship-check` (spec committed at `614164f`).

**Verbatim-transcription rule (every task):** transcribe fenced file content BYTE-FOR-BYTE; for edits, match the `OLD` block exactly and replace with `NEW`. Do not paraphrase, reflow, or add anything. LF→CRLF git warnings on Windows are harmless. **If a DoD grep fails but the file content is a faithful transcription of this plan, report it as a DoD-grep mismatch — do NOT alter the file's wording/casing to force the grep (the Phase 21 catch).**

---

### Task 1: The `ship-check` skill (`SKILL.md` + `config.json`)

**Files:**
- Create: `.claude/skills/ship-check/config.json`
- Create: `.claude/skills/ship-check/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/ship-check/config.json`** with exactly:

```json
{
  "app_dir": "app",
  "checks": ["build", "data", "tests", "audit", "deploy", "content", "legal", "criteria"],
  "block_severity": "MAJOR"
}
```

- [ ] **Step 2: Create `.claude/skills/ship-check/SKILL.md`** with exactly (byte-for-byte):

````markdown
---
name: ship-check
description: Use when someone asks "is my app ready to ship/launch?", "is it production-ready?", "can I go live?", "am I ready to launch?", "readiness check", "ship check", or says "/ship-check". Reads the already-built web app in app/ + the artifacts the prior rungs left (backend wiring, test suite, audit report, deploy config) and returns ONE GO / NOT-YET production-readiness verdict — the production analog of roast's idea gate — naming the exact blocking gaps and the skill/step that closes each. PROPOSE-ONLY: writes only a report to outputs/ship-check/, never modifies the app, never auto-fixes, never writes raw/wiki/change-log (mirrors audit-app). Reasoning-first and fully OFFLINE; the test suite / npm audit / build are OFFERED, never run unprompted. No confirm gate (it changes nothing). Requires a built app/. Tier 0. On-demand; never in the maintenance loop; deliberately not in autopilot. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to run the full gauntlet, or name one check: build / data / tests / audit / deploy / content / legal / criteria]"
---

# ship-check

The go/no-go gate. `build-app` builds it, `build-backend` makes its data real, `test-app` proves it works,
`audit-app` checks it's safe, `deploy` scaffolds hosting — this skill runs the **whole gauntlet at once** and
returns one **GO / NOT-YET** verdict: is this app actually **ready to go live?** It's the production analog of
`roast`'s idea gate — where `roast` pressure-tests an *idea* before you build, `ship-check` pressure-tests a
*built app* before you ship.

It is **propose-only**, mirroring `audit-app`: it writes **only** a readiness report to
`outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` (+ its run-state). It **never modifies the app, never
auto-fixes a gap, and never writes** the `raw/builds/` / `wiki/build.md` / `change-log.md` provenance spine
that the `build-*` skills use — a readiness verdict is a *proposal*, not an applied change. Because it changes
nothing, it has **no confirm gate**: it reads and reports, like `audit-app`.

The verdict is **reasoning-first and fully offline** — it always works with no tools. The deeper,
tool-assisted confirmations (running the test suite for a real green/red signal, `npm audit`, `npm run build`
+ Lighthouse) are **offered, never run** for you (they need `npm install` / a browser); the report lists the
exact commands.

## When to use

When the user says "is my app ready to ship / launch", "is it production-ready", "can I go live", "readiness
check", or `/ship-check`. Also offered by `what-can-i-do` and pointed to by `advise-project` after a build. It
**requires an already-built `app/`** (from `build-app`). **On-demand only** — it is propose-only and safe, but
a readiness verdict is a human decision point, so it is **not** wired into the unattended `maintenance-loop`
and is **deliberately not part of `autopilot`** (see *Autonomous invocation*).

## Configuration

Read `.claude/skills/ship-check/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the built web app to check.
- `checks` (default all eight — `build`, `data`, `tests`, `audit`, `deploy`, `content`, `legal`, `criteria`)
  — the enabled readiness gates (narrow to a subset, e.g. `["tests","audit"]`, to run fewer).
- `block_severity` (default `"MAJOR"`) — the threshold at/above which a finding is **blocking** (→ NOT-YET);
  findings below it are **advisory** (listed but non-blocking). It borrows the *mechanism* of `audit-app`'s
  `caution_severity` but it *gates* the verdict (audit-app's merely *surfaces* — and defaults to `CRITICAL`).

## Severity scale & the verdict

Every finding is tagged (the `audit-app` / `codex-review` canon): **CRITICAL > MAJOR > MINOR > INFO** — plus
the check it came from, a `file`/path pointer where applicable, why it blocks (or doesn't), and the exact
skill/step that closes it. A finding **at/above `block_severity`** (MAJOR by default) is **blocking**; below
it is **advisory**. The verdict:
- **NOT-YET** — one or more blocking findings. The report ranks them and names the single most important next
  step.
- **GO** — no blocking findings (advisories may still be listed — a GO can carry known, non-blocking gaps).

**Default severity scales by charter relevance** — a gap is **MAJOR (blocking)** when the rung it represents
is required for *this* app's stated purpose/audience, **MINOR (advisory)** when it isn't. `build`, `tests`,
`audit`, `deploy`, and `content` are treated as **universally ship-required** (flat defaults); only `data`,
`legal`, and `criteria` scale to the charter (see each check below).

## Procedure

`ship-check` runs like `audit-app` — **no interview, no confirm gate.** It reads, reasons, and writes a
verdict; it changes nothing.

### Phase 0 — Pre-flight (require the app; read it; route, don't guess)

1. **A built app (required) — at `config.app_dir` (default `app/`).** There is nothing to ship-check without
   it. Read `app_dir` from config first; everywhere below, "`app/`" means that configured directory.
   - **Missing →** offer `build-app` first: *"A ship-check gates an app you've already built. Want me to build
     the app first, then check it?"* On yes, run `build-app`, then continue. On no, stop gracefully.
   - Read the app: `package.json` (scripts → `build` / `test`; deps), `src/` (the `content` scan + `criteria`
     cross-reference), `src/data/store/` + `supabase/` (backend wiring → the `data` check), `vercel.json` +
     `.github/workflows/deploy-app.yml` + any `.env*` (→ the `deploy` check).
2. **Charter — `wiki/charter.md` (recommended).** Read `## Audience & users` (a broad/public audience raises
   the `legal` bar) and `## Success & outcomes` (the `criteria` check). **Missing →** run the gauntlet with
   default assumptions and flag `(assumed)`.
3. **Config + scope.** **If the user named a check in the invocation argument** (e.g. `tests`), run **only**
   that check; otherwise run `config.checks` (all eight by default). Read the prior rungs' artifacts
   (`outputs/tests/*/TEST-PLAN.md`, `outputs/audits/*/AUDIT.md`, `wiki/build.md` + the latest `raw/builds/`
   record) for what exists.

### Phase 1 — Run the gauntlet (reasoning-first, offline)

For each enabled check, read the artifact + inline-scan → findings (severity-tagged) + a per-check **status**
(✅ pass · ⚠️ advisory · ❌ blocking). The status is a **rollup of the check's findings against
`block_severity`**: ❌ if it has any finding at/above the threshold, ⚠️ if only below, ✅ if none — so a
check's status and the verdict can never disagree.

- **`build`** (← `build-app`) — `app/package.json` has a real `build` script + a `dist` output and the app
  isn't the empty template shell. Pass → ✅. Missing/trivial build → **CRITICAL** (nothing to ship). *(Rare —
  Phase 0 routes an absent `app/` to `build-app`.)*
- **`data`** (← `build-backend`) — is a real backend wired (`src/data/store/` + `supabase/migrations/` +
  `VITE_SUPABASE_*` slots), or mock-only? Mock-only → close with `build-backend`. **MAJOR** if the charter
  implies persistence/accounts; **MINOR/advisory** for a static/informational site. *(Graceful-off means a
  mock app still runs — it just isn't a real-data product.)*
- **`tests`** (← `test-app`) — a suite present (`app/` `test` script + `outputs/tests/*/TEST-PLAN.md`)? Read
  the manifest for criteria mapped to automated tests vs. flagged manual/metric. No suite → **MAJOR**
  (shipping untested) → run `test-app`; suite present but never verified green → **MINOR/advisory** + **offer
  to run it** (offer-don't-run).
- **`audit`** (← `audit-app`) — latest `outputs/audits/*/AUDIT.md` present? **Inherit its highest open
  severity** (an open CRITICAL/MAJOR audit finding blocks here too); **no audit on record → MAJOR** (safety
  unverified) → run `audit-app`.
- **`deploy`** (← `deploy`) — `app/vercel.json` + `.github/workflows/deploy-app.yml` + an env template
  present? **Missing → MAJOR** (no hosting/CI to go live with) → run `deploy`. Present → ✅.
- **`content`** (rung-6 prereq) — offline scan of `app/src/` for placeholder copy (lorem ipsum, `TODO` /
  `FIXME`, "Example Corp", dummy text) in shipped UI. **Found → MAJOR** (a real product isn't shippable with
  lorem) → replace with real content (polish / rung 6). Clean → ✅.
- **`legal`** (rung-6 prereq) — inline check for a privacy policy / terms / cookie consent (files or routes).
  Absent → **MAJOR** if the app collects user data (backend/auth wired), else **MINOR/advisory** for a pure
  static demo → add legal pages (rung 6).
- **`criteria`** (← `define-project`) — read `wiki/charter.md` `## Success & outcomes`; for each criterion,
  cross-reference build/tests/audit: a core criterion with no corresponding built feature → **MAJOR**; a
  criterion built-but-unverified or measured post-launch → **MINOR/advisory** → close via `test-app` or by
  shipping + measuring.

### Phase 2 — Verdict & write the report

Compute the verdict: **NOT-YET** if any finding is at/above `block_severity`, else **GO**. Write
**`outputs/ship-check/<YYYY-MM-DD>-<slug>/SHIP-CHECK.md`** — RAG frontmatter (`title`, `source_id:
outputs:ship-check:<date>-<slug>`, `verdict: GO|NOT-YET`, `max_severity`, `counts: {blocking, advisory}`,
`updated`), then: a **verdict header** (GO / NOT-YET + a one-line call + a plain `low / medium / high`
confidence read, like `roast`'s Judge — no scoring model), a **readiness table** (each check → status +
severity + one line), the **blocking gaps ranked** (each: what's missing · why it blocks · the exact
skill/step that closes it), the **advisories** (non-blocking, listed), **the single most important next
step**, and a **"Confirm it live"** section listing the *offered, not run* deeper-check commands (`cd app &&
npm install && npm test`, `npm audit`, `npm run build` + Lighthouse) with a plain note of what only those runs
can confirm (e.g. that the tests are actually green).

### Phase 3 — Hand over (propose-only; offer-don't-fix, offer-don't-run)

Point the user at the report and state the verdict plainly (GO / NOT-YET + the top blocking gaps + the single
most important next step). **Never auto-fix** a gap and **never run** the routed skills for them — closing a
gap is a separate, user-picked action (run `test-app`, `audit-app`, `deploy`, `build-backend`, or add
content/legal). **Offer** the deeper confirmations and — exactly as `audit-app` / `test-app` / `build-app` do
— run one only on an **explicit yes** (e.g. `cd app && npm install && npm test`), **never** the Lighthouse
browser download unprompted. Close plainly: *"Ship-check: **<GO / NOT-YET>**. <N blocking gaps / all clear>.
The one thing to do next: <…>. Nothing's changed — this is a readiness read. Want me to start on any gap, or
run the test suite to confirm it's green?"*

## Re-running

Each run writes a **new** dated report under `outputs/ship-check/` (`-2`, `-3`, … for same-day re-runs);
nothing is overwritten. After closing gaps, re-run for a fresh verdict — the report opens with a one-line
delta against the prior run when one exists.

## Rules & guardrails

- **Propose-only — writes only inside `outputs/`.** The report (`outputs/ship-check/<date>-<slug>/SHIP-CHECK.md`)
  + run-state (`outputs/runs/ship-check.json`). It **never** modifies the app, **never** auto-fixes, and
  **never** writes `raw/` / `wiki/` / `change-log.md`. `improve-system` stays the single applier. (This is the
  `audit-app` shape — and, unlike `roast`, it writes **no** `wiki/vetting.md` index and **no** `auto`
  change-log line.)
- **Offline, no keys.** The verdict reasons offline; the test suite / `npm audit` / `npm run build` +
  Lighthouse need `npm install` / a browser and are **offer-don't-run** — run only on an explicit yes, never
  the browser download unprompted.
- **Never runs the rungs for you.** It reads what `test-app` / `audit-app` / `deploy` / `build-backend` left
  behind and *routes* you to them; it never runs them, never installs, never enters a key.
- **Honest about what it is.** A real, useful **static readiness aggregator** — not a live smoke test. It
  names what only the offered runs can confirm (e.g. that the tests actually pass).
- **No confirm gate** (it changes nothing) — not an omission; the `audit-app` shape.
- **On-demand only; NOT in `maintenance-loop`; deliberately NOT in `autopilot`.** A readiness verdict is a
  human decision point (see *Autonomous invocation*).
- **Requires a built `app/`; web-only (v1).** Ship-checking `mobile/` / `plugin/` is a later phase.

## Output

One GO / NOT-YET readiness report at `outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` (the eight-check
readiness table, the ranked blocking gaps each with its closing skill/step, the advisories, the single most
important next step, and the offered confirm-it-live commands) and `outputs/runs/ship-check.json` run-state —
with nothing in the app changed and nothing fixed unless the user asks.

## Autonomous invocation

**`ship-check` is deliberately NOT driven by `autopilot`.** A production-readiness verdict is a decision point
the user owns — and it aggregates rungs `autopilot` doesn't run (`deploy`, which is human-only, plus the
default-off `test` / `audit` tails), so an `autopilot` ship-check would trivially return NOT-YET on gaps
autopilot chose not to fill. So there is **no autonomous procedure and no `autopilot` config flag** for
`ship-check` (mirroring `deploy`'s exclusion). This note documents that exclusion; the on-demand behavior
above is the only way `ship-check` runs — and `autopilot` is user-initiated and never part of the unattended
`maintenance-loop` (that rule is untouched).
````

- [ ] **Step 3: Definition-of-Done checks** — run (each must print `OK`):

```bash
test -f .claude/skills/ship-check/SKILL.md && echo "OK skill exists"
python -c "import json;d=json.load(open('.claude/skills/ship-check/config.json'));assert d['app_dir']=='app';assert d['checks']==['build','data','tests','audit','deploy','content','legal','criteria'];assert d['block_severity']=='MAJOR'" && echo "OK config keys"
grep -q "### Phase 0" .claude/skills/ship-check/SKILL.md && grep -q "### Phase 3" .claude/skills/ship-check/SKILL.md && echo "OK phases 0-3"
grep -q "## Autonomous invocation" .claude/skills/ship-check/SKILL.md && echo "OK autonomous note"
grep -qi "propose-only" .claude/skills/ship-check/SKILL.md && grep -q "never writes" .claude/skills/ship-check/SKILL.md && echo "OK propose-only"
grep -q "no confirm gate\|No confirm gate" .claude/skills/ship-check/SKILL.md && echo "OK no-confirm-gate"
grep -q "CRITICAL > MAJOR > MINOR > INFO" .claude/skills/ship-check/SKILL.md && echo "OK severity scale"
grep -q "GO / NOT-YET" .claude/skills/ship-check/SKILL.md && echo "OK verdict tokens"
grep -q "offer-don't-run\|offered, never run\|Offer" .claude/skills/ship-check/SKILL.md && echo "OK offer-dont-run"
grep -q "\`content\`" .claude/skills/ship-check/SKILL.md && grep -q "\`legal\`" .claude/skills/ship-check/SKILL.md && grep -q "\`criteria\`" .claude/skills/ship-check/SKILL.md && echo "OK checks present"
grep -q "deliberately NOT in \`autopilot\`\|deliberately NOT driven by \`autopilot\`" .claude/skills/ship-check/SKILL.md && echo "OK not-in-autopilot"
grep -q "NOT in \`maintenance-loop\`" .claude/skills/ship-check/SKILL.md && echo "OK never-in-loop"
grep -q "wiki/vetting.md" .claude/skills/ship-check/SKILL.md && echo "OK roast-divergence noted"
```
Expected: thirteen `OK` lines. If a grep fails but the file is a faithful transcription, report a DoD-grep mismatch (do not mangle content).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/ship-check/SKILL.md .claude/skills/ship-check/config.json
git commit -m "feat(ship-check): the core skill — propose-only GO / NOT-YET production-readiness gate over 8 checks, mirrors audit-app"
```

---

### Task 2: Visibility wiring (`what-can-i-do` + `advise-project`)

**Files:**
- Modify: `.claude/skills/what-can-i-do/SKILL.md` (one menu item)
- Modify: `.claude/skills/advise-project/SKILL.md` (extend the deferred-tier clause)

- [ ] **Step 1: Add the menu item.** In `.claude/skills/what-can-i-do/SKILL.md` find:

OLD:
```
   - **Deploy my app** — already built an app? Set up hosting + CI so you can put it live (say "deploy my app"). *(Runs `deploy`; it scaffolds everything and hands you a short go-live checklist — you pull the trigger.)*
```
NEW:
```
   - **Deploy my app** — already built an app? Set up hosting + CI so you can put it live (say "deploy my app"). *(Runs `deploy`; it scaffolds everything and hands you a short go-live checklist — you pull the trigger.)*
   - **Is my app ready to ship?** — built and thinking about launch? Get one GO / NOT-YET readiness verdict with the exact gaps left to close (say "is my app ready to ship?"). *(Runs `ship-check`; propose-only — it changes nothing, just tells you what's left.)*
```

- [ ] **Step 2: Extend the advise-project deferred-tier clause.** In `.claude/skills/advise-project/SKILL.md` find:

OLD:
```
ideas; the deferred tiers (real data → the `build-backend` skill, testing → the `test-app` skill, audit → the `audit-app` skill, deploy → the `deploy` skill, more build targets) → next-step ideas; the build record
```
NEW:
```
ideas; the deferred tiers (real data → the `build-backend` skill, testing → the `test-app` skill, audit → the `audit-app` skill, deploy → the `deploy` skill, readiness → the `ship-check` skill, more build targets) → next-step ideas; the build record
```

- [ ] **Step 3: Definition-of-Done checks** — run (each must print `OK`):

```bash
grep -q "Is my app ready to ship?" .claude/skills/what-can-i-do/SKILL.md && grep -q "Runs \`ship-check\`" .claude/skills/what-can-i-do/SKILL.md && echo "OK menu item"
grep -q "readiness → the \`ship-check\` skill" .claude/skills/advise-project/SKILL.md && echo "OK advise clause"
```
Expected: two `OK` lines.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/what-can-i-do/SKILL.md .claude/skills/advise-project/SKILL.md
git commit -m "feat(ship-check): wire visibility — what-can-i-do menu + advise-project next-step clause"
```

---

### Task 3: `CLAUDE.md` + `outputs/ship-check/.gitkeep` + roadmap rung 5

**Files:**
- Modify: `CLAUDE.md` (outputs pointer + skill bullet)
- Create: `outputs/ship-check/.gitkeep` (empty)
- Modify: `docs/PATH-TO-PRODUCTION.md` (mark rung 5 shipped)

- [ ] **Step 1: Add the `outputs/ship-check/` pointer.** In `CLAUDE.md` find:

OLD:
```
  - `outputs/deploy/` — `deploy` go-live checklists (`<date>-<slug>/GO-LIVE.md`)
```
NEW:
```
  - `outputs/deploy/` — `deploy` go-live checklists (`<date>-<slug>/GO-LIVE.md`)
  - `outputs/ship-check/` — `ship-check` GO / NOT-YET readiness verdicts (`<date>-<slug>/SHIP-CHECK.md`)
```

- [ ] **Step 2: Add the skill bullet.** In `CLAUDE.md` find:

OLD:
```
- **`deploy`** — the "ship it" tier: scaffolds hosting (Vercel) + a CI quality-gate + an env template + graceful-off error tracking/analytics for the built `app/`, then hands you a go-live checklist. **Never deploys, publishes, or enters keys** — you pull the trigger. Attended; never in the loop; deliberately not in `autopilot`. See `docs/DEPLOY.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
```
NEW:
```
- **`deploy`** — the "ship it" tier: scaffolds hosting (Vercel) + a CI quality-gate + an env template + graceful-off error tracking/analytics for the built `app/`, then hands you a go-live checklist. **Never deploys, publishes, or enters keys** — you pull the trigger. Attended; never in the loop; deliberately not in `autopilot`. See `docs/DEPLOY.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`ship-check`** — the "go/no-go" gate: runs the whole production-readiness gauntlet on the built `app/` (build · data · tests · audit · deploy · content · legal · charter criteria) and returns ONE **GO / NOT-YET** verdict naming the blocking gaps + the skill that closes each. **Propose-only** (mirrors `audit-app`): writes only `outputs/ship-check/`, changes nothing, no confirm gate. The production analog of `roast`. On-demand; never in the loop; deliberately not in `autopilot`. See `docs/SHIP-CHECK.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
```

- [ ] **Step 3: Create the empty folder-keeper** `outputs/ship-check/.gitkeep`:

```bash
mkdir -p outputs/ship-check && touch outputs/ship-check/.gitkeep
```

- [ ] **Step 4: Mark roadmap rung 5 shipped.** In `docs/PATH-TO-PRODUCTION.md` find:

OLD:
```
5. **The go/no-go gate — `ship-check`.**
   A production-readiness skill that runs the whole gauntlet — tests green? security clean? a11y/perf
   thresholds met? deploy config present? legal present? real content? — and returns a **GO / NOT-YET**
   verdict naming the exact blocking gaps. It's the production analog of `roast`'s idea gate. The arc
   becomes **define → vet → design → build → test → audit → ship → advise**.
```
NEW:
```
5. **The go/no-go gate — `ship-check`** *(shipped, Phase 22).*
   A production-readiness skill that runs the whole gauntlet across eight checks — a real app? real data?
   tests present? audit clean? deploy config present? real content? legal present? charter criteria met? —
   and returns a **GO / NOT-YET** verdict naming the exact blocking gaps and the skill that closes each.
   **Propose-only** (mirrors `audit-app`): it writes only a report and changes nothing. It's the production
   analog of `roast`'s idea gate. The arc becomes **define → vet → design → build → test → audit → ship →
   advise**. See `docs/SHIP-CHECK.md`.
```

- [ ] **Step 5: Definition-of-Done checks** — run (each must print `OK`):

```bash
test -f outputs/ship-check/.gitkeep && echo "OK gitkeep"
grep -q "^- \*\*\`ship-check\`\*\*" CLAUDE.md && echo "OK skill bullet"
grep -q "outputs/ship-check/. — .ship-check. GO / NOT-YET" CLAUDE.md && echo "OK outputs pointer"
grep -q "shipped, Phase 22" docs/PATH-TO-PRODUCTION.md && echo "OK roadmap shipped"
LINES=$(wc -l < CLAUDE.md); test "$LINES" -lt 125 && echo "OK CLAUDE.md $LINES < 125"
```
Expected: five `OK` lines (the last shows the line count).

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md outputs/ship-check/.gitkeep docs/PATH-TO-PRODUCTION.md
git commit -m "feat(ship-check): CLAUDE.md skill+pointer, outputs/ship-check/.gitkeep, roadmap rung 5 shipped"
```

---

### Task 4: User + system docs (`SHIP-CHECK.md` + `README` + `USING` + master spec)

**Files:**
- Create: `docs/SHIP-CHECK.md`
- Modify: `README.md` (guide row + build-status Phase 22 line)
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md` (a "then ship-check it" paragraph)
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` (Phase 22 addendum)

*(Note: this phase does NOT touch `docs/AUTOPILOT.md` — `ship-check` is deliberately not in autopilot, and its exclusion is documented in its own SKILL.md, mirroring `deploy`.)*

- [ ] **Step 1: Create `docs/SHIP-CHECK.md`** with exactly:

```markdown
# ship-check — is your app ready to go live?

`build-app` builds your app, `build-backend` makes its data real, `test-app` proves it works, `audit-app`
checks it's safe, `deploy` sets up hosting — `ship-check` runs the **whole gauntlet at once** and gives you
one answer: **GO** (ready to launch) or **NOT-YET** (here's exactly what's left). It's the launch-day version
of `roast`: where `roast` pressure-tests an *idea* before you build, `ship-check` pressure-tests your *built
app* before you ship. It **changes nothing** — it's a readiness read, not a fix.

Say **"is my app ready to ship?"**, **"is it production-ready?"**, **"can I go live?"**, or **`/ship-check`**.

## What it checks

Eight readiness gates, in one verdict:

- **Built** — is there a real, buildable app (not the empty template)?
- **Real data** — does it save real data with sign-in, or is it still running on mock data?
- **Tested** — is there a test suite mapped to your success criteria?
- **Safe** — has it been audited (security / accessibility / performance), and is the audit clean?
- **Deployable** — is hosting + CI set up so you can actually put it live?
- **Real content** — is the copy real, or is there still placeholder / lorem-ipsum text?
- **Legal** — if it collects data, does it have a privacy policy / terms / cookie consent?
- **Your goals** — does it meet the success outcomes from your charter?

Each gap gets a severity (**critical / major / minor / info**), why it blocks (or doesn't), and **the exact
skill that closes it** — e.g. "no test suite → run `test-app`", "still on mock data → run `build-backend`".
Anything **major or worse** blocks a GO; smaller gaps are listed as advisories. It's all written to
`outputs/ship-check/<date>-<slug>/SHIP-CHECK.md`, with the single most important next step called out.

## Offline first; deeper checks are offered

The verdict is reasoned by reading your app and what the earlier steps left behind — it works fully offline,
no setup. To *confirm* the green-light items for real, it hands you the exact commands (it never runs them for
you):

- `cd app && npm install && npm test` — actually run the test suite to confirm it's green.
- `npm audit` — the live vulnerability database for your dependencies.
- `npm run build` + Lighthouse — real performance/accessibility scores in a browser.

If you say yes, it'll run the test suite for you; the browser-based checks stay yours to run.

## What it is (and isn't)

- **Is:** one honest go/no-go read that ties together everything the earlier steps proved, and a prioritized
  list of what's left before launch.
- **Isn't:** a live smoke test of the running app. It says plainly what only the offered runs can confirm
  (like whether the tests actually pass).
- **Propose-only:** it never changes your app, fixes a gap, or runs the other skills for you — you decide what
  to act on next.
- **Not automatic:** deciding to ship is yours, so `ship-check` is on-demand only — never in the maintenance
  loop, and deliberately not part of `autopilot`.
- **Web app (`app/`) first;** phone/extension readiness comes later.

## Safety

It writes only a report (never touches your app's code), reasons fully offline, and never runs the other
skills, installs anything, or enters a key without your say-so. Ship-check is the fifth rung of the **path to
production** (`docs/PATH-TO-PRODUCTION.md`) — the go/no-go gate before the final polish.
```

- [ ] **Step 2: Add the README guide row.** In `README.md` find:

OLD:
```
| [Deploy your app](docs/DEPLOY.md) | Scaffold hosting + CI + observability, then a go-live checklist. |
| [Path to production](docs/PATH-TO-PRODUCTION.md) | The ordered map from prototype to a shippable product. |
```
NEW:
```
| [Deploy your app](docs/DEPLOY.md) | Scaffold hosting + CI + observability, then a go-live checklist. |
| [Ship-check your app](docs/SHIP-CHECK.md) | One GO / NOT-YET readiness verdict naming what's left before launch. |
| [Path to production](docs/PATH-TO-PRODUCTION.md) | The ordered map from prototype to a shippable product. |
```

- [ ] **Step 3: Add the README build-status line.** In `README.md` find:

OLD:
```
- Phase 21 — `deploy` + `sync-metrics`: scaffold hosting (Vercel) + CI + graceful-off observability + a go-live checklist (you pull the trigger), and a graceful-off metrics connector that feeds `raw/metrics/` — closing the `advise-project` loop ✅
```
NEW:
```
- Phase 21 — `deploy` + `sync-metrics`: scaffold hosting (Vercel) + CI + graceful-off observability + a go-live checklist (you pull the trigger), and a graceful-off metrics connector that feeds `raw/metrics/` — closing the `advise-project` loop ✅
- Phase 22 — `ship-check`: a propose-only GO / NOT-YET production-readiness gate over the built `app/` (build · data · tests · audit · deploy · content · legal · charter criteria) → one verdict in `outputs/ship-check/` naming the blocking gaps (the production analog of `roast`) ✅
```

- [ ] **Step 4: Add the USING "then ship-check it" paragraph.** In `docs/USING-THIS-FOR-ANY-PROJECT.md` find:

OLD:
```
**Then ship it:** run **`deploy`** — it scaffolds hosting (Vercel), a CI check, an env template, and graceful-off error tracking + analytics for your `app/`, then hands you a short go-live checklist. It **never deploys or enters keys** — you pull the trigger. Its companion **`sync-metrics`** then feeds your real usage numbers into `raw/metrics/`, which is exactly what the project advisor reads to suggest what's next — closing the loop. This is the fourth rung of the path to production. See `docs/DEPLOY.md`.
```
NEW:
```
**Then ship it:** run **`deploy`** — it scaffolds hosting (Vercel), a CI check, an env template, and graceful-off error tracking + analytics for your `app/`, then hands you a short go-live checklist. It **never deploys or enters keys** — you pull the trigger. Its companion **`sync-metrics`** then feeds your real usage numbers into `raw/metrics/`, which is exactly what the project advisor reads to suggest what's next — closing the loop. This is the fourth rung of the path to production. See `docs/DEPLOY.md`.

**Then get the go/no-go:** run **`ship-check`** — it runs the whole gauntlet across eight checks (built · real data · tested · safe · deployable · real content · legal · your charter goals) and returns one **GO / NOT-YET** verdict, naming the exact gaps left and the skill that closes each. It's **propose-only** (changes nothing) and the production analog of `roast`'s idea gate. This is the fifth rung of the path to production. See `docs/SHIP-CHECK.md`.
```

- [ ] **Step 5: Append the master-spec Phase 22 addendum.** In `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` find (the final line of the Phase 21 addendum):

OLD:
```
 Full design: `docs/superpowers/specs/2026-07-02-deploy-design.md`; how-to: `docs/DEPLOY.md`.
```
NEW:
```
 Full design: `docs/superpowers/specs/2026-07-02-deploy-design.md`; how-to: `docs/DEPLOY.md`.

## Phase 22 addendum — `ship-check` (the go/no-go gate — path-to-production rung 5) (2026-07-02)

Phase 22 adds a new `ship-check` skill — the "go/no-go" gate and the fifth rung of `docs/PATH-TO-PRODUCTION.md` — that reads the already-built web `app/` + charter + the artifacts the prior rungs left behind and returns **one GO / NOT-YET production-readiness verdict** across **eight checks**: `build` (a real buildable app), `data` (real backend wired vs. mock-only), `tests` (a suite mapped to the charter criteria), `audit` (an `outputs/audits/` report present + clean), `deploy` (hosting/CI/env config present), `content` (no placeholder/lorem copy), `legal` (privacy/terms/consent when data is collected), and `criteria` (the charter's `## Success & outcomes` met). It is the production analog of `roast`'s idea gate — where `roast` pressure-tests an idea before building, `ship-check` pressure-tests a built app before shipping. Its defining trait — **propose-only, mirroring `audit-app`**: it writes **only** `outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` (+ `outputs/runs/ship-check.json`), tagged with the `CRITICAL > MAJOR > MINOR > INFO` canon, and **never modifies the app, never auto-fixes, and never writes the `raw/builds` / `wiki/build.md` / `change-log.md` provenance spine** (a verdict is a proposal, not an applied change) — so `improve-system` stays the single applier; and, unlike `roast`, it writes **no** `wiki/vetting.md` index and **no** `auto` change-log line (it stays purely in the `outputs/` lane). A direct consequence: **no confirm gate** (it changes nothing). The verdict is severity-gated by `block_severity` (default `MAJOR`): findings at/above it are **blocking** (→ NOT-YET), below are **advisory** (a GO can still list them); default severity scales by charter relevance (`build`/`tests`/`audit`/`deploy`/`content` are flat ship-required; `data`/`legal`/`criteria` scale). Reasoning-first and fully offline; the test suite / `npm audit` / `npm run build` + Lighthouse are **offered, never run** (offer-don't-run), and it **never runs the other rungs for you** — it *routes* you to them. It **requires a built `app/`** (routes to `build-app` if absent). **No new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched). Config = `{app_dir:"app", checks:[build,data,tests,audit,deploy,content,legal,criteria], block_severity:"MAJOR"}`. **On-demand only; NOT in `maintenance-loop`; and deliberately NOT in `autopilot`** — a readiness verdict is a human decision point, and it aggregates rungs autopilot doesn't run (`deploy` + the default-off test/audit tails), so an autopilot ship-check would trivially return NOT-YET; the exclusion is documented in its own `## Autonomous invocation` note (mirroring `deploy`), and **no `autopilot` file changes** (SKILL.md + config.json untouched). Web-first (mobile/plugin readiness later). `improve-system` / `maintenance-loop` / `autopilot` / the `build-*` / `test-app` / `audit-app` / `deploy` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Full design: `docs/superpowers/specs/2026-07-02-ship-check-design.md`; how-to: `docs/SHIP-CHECK.md`.
```

- [ ] **Step 6: Definition-of-Done checks** — run (each must print `OK`):

```bash
test -f docs/SHIP-CHECK.md && grep -q "is your app ready to go live" docs/SHIP-CHECK.md && echo "OK SHIP-CHECK.md"
grep -q "\[Ship-check your app\](docs/SHIP-CHECK.md)" README.md && echo "OK readme guide row"
grep -q "Phase 22 — \`ship-check\`" README.md && echo "OK readme build-status"
grep -q "Then get the go/no-go" docs/USING-THIS-FOR-ANY-PROJECT.md && echo "OK using paragraph"
grep -q "Phase 22 addendum" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo "OK master spec addendum"
```
Expected: five `OK` lines.

- [ ] **Step 7: Commit**

```bash
git add docs/SHIP-CHECK.md README.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(ship-check): SHIP-CHECK.md how-to + README + USING + master-spec Phase 22 addendum"
```

---

### Task 5: Final whole-branch verification (no-pollution + untouched invariants)

**Files:** none created/modified (verification only; if a check fails, fix in the owning task's files and amend that task's commit).

- [ ] **Step 1: No-pollution — the template must ship clean.** Run:

```bash
! git ls-files | grep -qE '^app/' && echo "OK no app/ committed" || echo "POLLUTION app/"
! git ls-files | grep -qE '^outputs/ship-check/[0-9]' && echo "OK no dated ship-check report" || echo "POLLUTION report"
test -f outputs/ship-check/.gitkeep && echo "OK .gitkeep present"
ls outputs/ship-check | grep -vq '.gitkeep' && echo "POLLUTION in outputs/ship-check" || echo "OK outputs/ship-check clean"
```
Expected: `OK no app/ committed`, `OK no dated ship-check report`, `OK .gitkeep present`, `OK outputs/ship-check clean`.

- [ ] **Step 2: No new agent + untouched invariants (incl. autopilot + AUTOPILOT.md).** This phase adds NO subagent, touches NO other skill's behavior, and is NOT in autopilot. Run:

```bash
git diff --name-only main..HEAD | grep -E 'docs/SUBAGENTS.md|^\.claude/agents/' && echo "UNEXPECTED — an agent file changed" || echo "OK no agent added"
git diff --name-only main..HEAD | grep -E 'skills/autopilot/|docs/AUTOPILOT.md' && echo "UNEXPECTED — autopilot changed" || echo "OK autopilot untouched"
git diff --name-only main..HEAD | grep -E 'skills/(improve-system|maintenance-loop|codex-review|build-app|build-mobile|build-plugin|build-backend|test-app|audit-app|deploy|sync-metrics|define-project|define-design|roast|storm-research)/|^raw/' && echo "UNEXPECTED — an invariant file changed" || echo "OK invariants untouched"
```
Expected: `OK no agent added`, `OK autopilot untouched`, `OK invariants untouched`.

- [ ] **Step 3: CLAUDE.md line cap.** Run:

```bash
LINES=$(wc -l < CLAUDE.md); test "$LINES" -lt 125 && echo "OK CLAUDE.md $LINES < 125" || echo "OVER CAP: $LINES"
```
Expected: `OK CLAUDE.md <n> < 125`.

- [ ] **Step 4: The full intended file set — confirm the diff is exactly these.** Run:

```bash
git diff --name-only main..HEAD | sort
```
Expected (exactly, in some order — 13 files):
```
.claude/skills/advise-project/SKILL.md
.claude/skills/ship-check/SKILL.md
.claude/skills/ship-check/config.json
.claude/skills/what-can-i-do/SKILL.md
CLAUDE.md
README.md
docs/PATH-TO-PRODUCTION.md
docs/SHIP-CHECK.md
docs/USING-THIS-FOR-ANY-PROJECT.md
docs/superpowers/plans/2026-07-02-ship-check.md
docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
docs/superpowers/specs/2026-07-02-ship-check-design.md
outputs/ship-check/.gitkeep
```
(The spec + this plan + the 11 create/modify targets. No `app/`, no `wiki/`, no `raw/`, no `docs/SUBAGENTS.md`, no `.claude/agents/`, no `.claude/skills/autopilot/`, no `docs/AUTOPILOT.md`.)

- [ ] **Step 5: Report the verification results** to the controller (no commit). If everything passed, the branch is ready for the tuned `code-reviewer` + Codex gate.
