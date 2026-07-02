# ship-check — design spec (Phase 22, path-to-production rung 5)

**Status:** approved design, ready for planning
**Branch:** `phase-22-ship-check`
**Author arc:** define → vet → design → build → test → audit → **ship** → advise

## Context

The template takes a user from an idea to a themed working prototype, and — after Phases 18–21 — through
real data (`build-backend`), testing (`test-app`), a security/a11y/perf audit (`audit-app`), and a deploy
scaffold + go-live checklist (`deploy` + `sync-metrics`). Each rung proves **one** thing. Nothing ties them
together into a single answer to the only question that matters at launch: **"is this actually ready to go
live?"** — and nothing checks the rung-6 prerequisites (real content, legal) that also gate a real launch.
That judgment currently lives only in the user's head.

`ship-check` is **rung 5** of `docs/PATH-TO-PRODUCTION.md`: a **GO / NOT-YET production-readiness gate**, the
production analog of `roast`'s idea gate (the roadmap's exact framing). It reads the state the prior rungs
left behind plus a few lightweight inline checks, and returns one verdict naming the exact blocking gaps and
the skill/step that closes each. It **changes nothing** — a propose-only report.

## Intended outcome

A new **`ship-check`** skill (`.claude/skills/ship-check/{SKILL.md,config.json}`) that, given a built web
`app/`, reads eight readiness signals, computes a **GO / NOT-YET** verdict, and writes one
`outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` report — offline, propose-only, no confirm gate — plus the
light wiring and docs a new skill needs.

## Shape — propose-only, mirroring `audit-app`

`ship-check` is the app-readiness sibling of `audit-app`; it adopts `audit-app`'s shape (both read the built
`app/` and emit a severity-tagged report), **not** the `build-*` shape:

- **Propose-only.** Writes **only** `outputs/ship-check/<YYYY-MM-DD>-<slug>/SHIP-CHECK.md` (+ run-state
  `outputs/runs/ship-check.json`). It **never** modifies the app, **never** auto-fixes, and **never** writes
  the `raw/builds/` / `wiki/build.md` / `outputs/change-log.md` provenance spine — a readiness verdict is a
  *proposal*, not an applied change. `improve-system` stays the single applier. (This is the
  `audit-app` / `codex-review` model — stronger than `build-*`. Note the deliberate divergence from `roast`,
  which additionally indexes `wiki/vetting.md` and writes an `auto` change-log line: **ship-check does
  neither** — it stays in the `audit-app` lane, `outputs/` only.)
- **No confirm gate** — it changes nothing (not an omission; the `codex-review` shape).
- **Reasoning-first and fully offline.** It reads artifacts and reasons. The deeper, tool-assisted
  confirmations (running the test suite for a green/red signal, `npm audit`, `npm run build`, Lighthouse) are
  **offered, never run** for the user — run one only on an **explicit yes** (`cd app && npm install && npm
  test`), never the browser download unprompted. Matches `audit-app` / `test-app` / `build-app`.
- **Requires a built `app/`;** routes to `build-app` if absent. **Web `app/` only (v1)** — auditing
  `mobile/` / `plugin/` readiness is a later phase.

## The gauntlet — `config.checks` (eight readiness gates)

Each check reads the artifact a prior rung produces and/or does a lightweight inline scan, then yields a
**status** (✅ pass · ⚠️ advisory · ❌ blocking) and any **findings** tagged `CRITICAL > MAJOR > MINOR >
INFO` (the `audit-app` / `codex-review` canon), each with a `file`/path pointer where applicable and **the
exact skill or step that closes it**.

A check's **status is a rollup of its findings against `block_severity`**: ❌ blocking if it has any finding
at/above the threshold, ⚠️ advisory if only below it, ✅ pass if none — so the per-check status and the
verdict can never disagree (the status is derived, not an independent judgment). **Default severity scales by
charter relevance:** a gap is **MAJOR (blocking, at the default threshold)** when the rung it represents is
required for *this* app's stated purpose/audience, and **MINOR (advisory)** when it isn't. Some rungs —
`build`, `tests`, `audit`, `deploy`, `content` — are treated as **universally ship-required** and pin a flat
default; only `data`, `legal`, and `criteria` actually scale to the charter. Each check below pins its
default:

1. **`build`** (← `build-app`) — `app/package.json` declares a real `build` script and `app/src/` is a real
   app (not the empty template shell). A `dist/` output is a **generated** artifact (not committed; this skill
   never builds) — its absence is expected and **not** a finding; a clean production build is the offered
   `npm run build`. Present → ✅. No `build` script / empty shell → **CRITICAL** (nothing to ship). *(Rare —
   Phase 0 routes an absent `app/` to `build-app`.)*
2. **`data`** (← `build-backend`) — is a real backend wired (`app/src/data/store/` +
   `app/supabase/migrations/` + `VITE_SUPABASE_*` env slots), or still mock-only? Mock-only → a finding
   (graceful-off means it *runs*, but it isn't a real-data product) → run `build-backend`. **Default: MAJOR**
   if the charter implies persistence/accounts, else **MINOR/advisory** (a static/informational site needs no
   backend).
3. **`tests`** (← `test-app`) — a suite present (`app/` `test` script + `outputs/tests/*/TEST-PLAN.md`)? Read
   the manifest: how many charter criteria map to automated tests vs. flagged manual/metric. No suite → run
   `test-app`; suite present but never verified green → note + **offer to run it** (offer-don't-run).
   **Default: MAJOR** if no suite (shipping untested); **MINOR/advisory** if a suite exists but wasn't
   verified green.
4. **`audit`** (← `audit-app`) — latest `outputs/audits/*/AUDIT.md` present? Read its `max_severity` + counts.
   **Default: inherit the audit's highest open severity** (an open CRITICAL/MAJOR audit finding is blocking
   here too); **no audit on record → MAJOR** (safety unverified) → run `audit-app`.
5. **`deploy`** (← `deploy`) — `app/vercel.json` + `.github/workflows/deploy-app.yml` + an env template
   present? **Missing → MAJOR** (no hosting/CI config to go live with) → run `deploy`. Present → ✅.
6. **`content`** (rung-6 prereq) — inline scan of `app/src/` for placeholder copy (lorem ipsum, `TODO` /
   `FIXME`, "Example Corp", dummy text). **Placeholder copy in shipped UI → MAJOR** (a real product isn't
   shippable with lorem). Clean → ✅.
7. **`legal`** (rung-6 prereq) — inline check for a privacy policy / terms / cookie consent (files or routes).
   Absent → severity **scaled**: **MAJOR** if the app collects user data (backend/auth wired), **MINOR/advisory**
   for a pure static demo.
8. **`criteria`** (← `define-project`) — read `wiki/charter.md` `## Success & outcomes`; for each criterion,
   cross-reference build/tests/audit to judge met / tested / still-open. **Default:** a core criterion with no
   corresponding built feature → **MAJOR**; a criterion that's built-but-unverified or measured post-launch →
   **MINOR/advisory** (success metrics are often measured live, not ship-blockers).

The set is configurable via `config.checks`; the default runs all eight.

The net effect is the intuitive one: a freshly built Tier-0 app (mock data, no tests, no audit, no deploy
config, possibly placeholder copy) accrues several MAJOR findings → **NOT-YET**, which is the correct verdict
for a prototype; as each rung is completed the MAJORs clear and the verdict flips to **GO**.

## The verdict — GO / NOT-YET

- A `config.block_severity` threshold (default **`"MAJOR"`**) splits findings into **blocking** (at/above the
  threshold) and **advisory** (below it). It borrows the *mechanism* of `audit-app`'s `caution_severity` (a
  config-driven severity threshold) but differs in default and purpose: `caution_severity` defaults to
  `CRITICAL` and merely *surfaces* findings prominently (audit-app has no gate), whereas `block_severity`
  defaults to `MAJOR` and *gates* the verdict.
- **NOT-YET** if any blocking finding exists; **GO** otherwise. Advisories are always listed (under either
  verdict — a GO can still carry known non-blocking gaps).
- The report ranks the blocking gaps, names the closing skill/step for each, and calls out **the single most
  important next step**.

### `SHIP-CHECK.md` structure

RAG frontmatter (`title`, `source_id: outputs:ship-check:<date>-<slug>`, `verdict: GO|NOT-YET`,
`max_severity`, `counts: {blocking, advisory}`, `updated`) → **verdict header** (GO / NOT-YET, a one-line
call, and a plain **confidence** read — `low / medium / high`, a judgment call exactly as `roast`'s Judge
gives it, with no scoring model and not a frontmatter field) → a **readiness table** (each check → status +
severity + one line) → **blocking gaps
ranked** (what's missing · why it blocks · the exact skill/step) → **advisories** → **the single most
important next step** → a **"Confirm it live"** section listing the *offered, not run* deeper-check commands
(the test suite / `npm audit` / `npm run build` + Lighthouse) with a plain statement of what only those runs
can confirm (e.g. that the tests are actually green).

## Runtime (mirrors `audit-app` Phase 0–4; no interview, no confirm gate)

- **Phase 0 — Pre-flight.** Read `config.app_dir`; require a built `app/` (missing → **route, don't run:**
  report the trivial *not ready — no app built* verdict and point the user to `build-app`; ship-check never
  runs a rung for you); read `wiki/charter.md` (recommended — sets the audience bar for
  `legal` and supplies `criteria`; infer + flag `(assumed)` if absent). Honor a named-check invocation
  argument (run only that check) else `config.checks`.
- **Phase 1 — Run the gauntlet.** For each enabled check, read the relevant artifact + inline-scan → findings
  + a per-check status. Offline, reasoning-only.
- **Phase 2 — Verdict.** Compute GO / NOT-YET via `block_severity`; rank the blocking gaps → closing skills;
  pick the single most important next step.
- **Phase 3 — Write** `outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` (+ `outputs/runs/ship-check.json`).
- **Phase 4 — Hand over.** Summarize (verdict + top gaps); **offer-don't-run** the deeper checks (explicit yes
  only); **never auto-fix** — closing a gap is a separate, user-picked, attended action (or the routed skill,
  e.g. "run `test-app`").
- **Re-running:** a **new** dated folder each run (`-2`, `-3`, … for same-day re-runs); read the prior
  verdict for a one-line delta.

## `## Autonomous invocation` note — documents the exclusion (like `deploy`)

A short note stating **`ship-check` is deliberately NOT driven by `autopilot`**. Rationale: a readiness
verdict is a human decision point, and it aggregates rungs — `deploy` (which `autopilot` never runs) plus the
default-off test/audit tails — so an `autopilot` ship-check would trivially return NOT-YET on gaps autopilot
chose not to fill. There is **no autonomous procedure and no `autopilot` config flag**; this note documents
the exclusion, and the attended behavior is the only way it runs. (`autopilot`'s SKILL.md and config.json are
untouched — the same posture `deploy` takes.)

## Configuration

`.claude/skills/ship-check/config.json` (all values default; never block on absence):

```json
{
  "app_dir": "app",
  "checks": ["build", "data", "tests", "audit", "deploy", "content", "legal", "criteria"],
  "block_severity": "MAJOR"
}
```

- `app_dir` (default `"app"`) — the built web app to check.
- `checks` (default all eight) — the enabled readiness gates (narrow to run a subset).
- `block_severity` (default `"MAJOR"`) — findings at/above this are **blocking** (→ NOT-YET); below are
  **advisory**.

## Wiring (light / additive)

- **`CLAUDE.md`** — one skill bullet (after the `deploy` bullet) + one `outputs/ship-check/` pointer line
  (after `outputs/deploy/`). Must hold **< 125 lines** (currently 117; +2 → 119).
- **`.claude/skills/what-can-i-do/SKILL.md`** — one menu item ("Check my app is ready to ship…").
- **`.claude/skills/advise-project/SKILL.md`** — extend the deferred-tier / next-step clause to name
  `ship-check` (the readiness gate), exactly as `deploy` was added in Phase 21 — additive.
- **`README.md`** — a Phase 22 build-status row.
- **`docs/PATH-TO-PRODUCTION.md`** — mark rung 5 **shipped (Phase 22)** (align its wording to the
  as-built skill, as rungs 1–4 were).
- **`docs/SHIP-CHECK.md`** — a new user guide.
- **`docs/USING-THIS-FOR-ANY-PROJECT.md`** — a "then ship-check it" paragraph after the rung-4 deploy
  paragraph (the same additive walkthrough each prior rung added).
- **`docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`** — a Phase 22 addendum.
- **`outputs/ship-check/.gitkeep`** — follow the empty-dir convention.

## No new fleet agent

Like `audit-app`, `ship-check` reasons over files — **no new `.claude/agents/` entry**; `docs/SUBAGENTS.md`
is untouched.

## Not changed

`autopilot` (SKILL.md **and** config.json — untouched), `maintenance-loop`, `improve-system` (single
applier), `build-app` / `build-mobile` / `build-plugin`, `build-backend`, `test-app`, `audit-app`, `deploy`,
`sync-metrics`, `define-*`, `roast`, `storm-research`, `codex-review`, `raw/` immutability, the
`.claude/agents/` fleet.

## Safety / reconciliation

- **Propose-only — changes nothing.** Writes only inside `outputs/`; never modifies the app, never
  auto-fixes, never writes `raw/` / `wiki/` / `change-log.md`; no confirm gate. `improve-system` stays the
  single applier. (The `audit-app` / `codex-review` invariant, unbroken.)
- **Never runs anything for the user.** It reads the prior rungs' artifacts and *offers* the deeper checks
  (test suite / `npm audit` / build); it never runs `test-app` / `audit-app` / `deploy` / `npm install` or
  enters a key. The standing never-run-for-you / never-enter-keys rule holds.
- **On-demand only; not in `maintenance-loop`; deliberately not in `autopilot`.** A documented exclusion,
  like `deploy`.
- **Author-only — never run `ship-check` for real against the template.** No real
  `outputs/ship-check/<date>-*` committed; the template ships clean (skill + config + docs + `.gitkeep` +
  light wiring only).
- **`CLAUDE.md` < 125 lines.**

## Verification (DoD)

Authoring task → DoD via `grep` / `wc` / `git`, plus a documented (NOT run) manual dry-run reasoned against a
hypothetical built app:

- **Skill present & shaped:** `ship-check/SKILL.md` has Phase 0–4 + the eight `checks` + the GO / NOT-YET
  verdict logic + `block_severity`; `config.json` has `app_dir` / `checks` / `block_severity`.
- **Propose-only explicit:** SKILL.md states it writes only `outputs/`, never modifies the app, never
  auto-fixes, never writes `raw/` / `wiki/` / `change-log.md`, and has no confirm gate.
- **Offer-don't-run:** SKILL.md offers the test-suite / `npm audit` / build runs on an explicit yes, never
  unprompted, and never auto-fixes.
- **Verdict = GO / NOT-YET:** both tokens present; `block_severity` default `MAJOR`; findings tagged
  `CRITICAL / MAJOR / MINOR / INFO`.
- **Not in autopilot:** `git diff --name-only main..HEAD` shows **neither** `.claude/skills/autopilot/SKILL.md`
  **nor** `.claude/skills/autopilot/config.json`; ship-check's `## Autonomous invocation` note documents the
  exclusion.
- **Untouched invariants (expect empty diff):** `improve-system`, `maintenance-loop`,
  `build-app`/`build-mobile`/`build-plugin`, `build-backend`, `test-app`, `audit-app`, `deploy`, `define-*`,
  `roast`, `storm-research`, `raw`, `.claude/agents`, `docs/SUBAGENTS.md`.
- **No pollution:** no real `outputs/ship-check/<date>-*` (only `.gitkeep`); only intended files in the diff;
  `CLAUDE.md` < 125.
- **Roadmap doc:** `docs/PATH-TO-PRODUCTION.md` marks rung 5 shipped.

## Execution

Standard pipeline, dogfooding the tuned fleet: commit this spec → tuned `spec-reviewer` → user review →
`writing-plans` → tuned `plan-reviewer` → subagent build with tuned `implementer`s (per-task, verbatim
transcription + `grep`/`git` DoD + per-task commits) → tuned `code-reviewer` + Codex `codex review --base
main` → `finishing-a-development-branch`. **Author only — never run `ship-check` for real against the
template.** If a DoD grep fails but the file is a faithful transcription of the plan, report it as a
DoD-grep mismatch — do not mangle wording/casing to force the grep (the Phase 21 catch).
