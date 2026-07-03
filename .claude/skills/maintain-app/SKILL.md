---
name: maintain-app
description: Use when someone asks to "maintain my app", "keep my app healthy", "watch my app for security/bugs post-launch", "set up scheduled maintenance", or says "/maintain-app". The "operate & maintain" step (path-to-production rung 7) for an already-shipped app/. On a schedule it re-runs your quality signals (npm audit / the test suite / an audit-app re-run) into ONE plain-language health report, delegates dependency/CVE patching to Dependabot/Renovate (with a ~7-day cooldown — surfaced, never auto-bumped), and opens a gated SAFE-PR only for a narrow reversible fix class (lint/format/mechanical-a11y/dead-code/doc-drift) — never for a dependency bump. Report-first: the PR is the exception, not the deliverable. It NEVER merges, deploys, publishes, or enters keys — a real PreToolUse guard hook enforces that. Scaffolds a local Routine (offline sandbox) + a ready-to-enable keyed CI workflow. Attended setup (one confirm gate); its own schedule — never in maintenance-loop, never in autopilot. Requires a built app/. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to set up scheduled maintenance for your app, or say 'run a tick now']"
---

# maintain-app

The **"operate & maintain"** step. `deploy` ships it, `ship-check` gates it, `polish` legitimizes it —
`maintain-app` **keeps it healthy over time**. On a schedule it reads the shipped `app/`, re-runs the quality
signals the template already produces, and writes **one plain-language health report**. The report is the
product; a SAFE-PR is the rare exception; dependency patching is delegated to Dependabot/Renovate. Everything
it emits is a **proposal** — it never touches `main`, never merges, never deploys, never enters a key. A real
`PreToolUse` guard hook enforces that boundary mechanically, not by good intentions.

## When to use

"maintain my app", "keep my app healthy", "watch my app for security/bugs", "set up scheduled maintenance",
"maintain my app post-launch", or `/maintain-app`. Also offered by `what-can-i-do` and pointed to by
`ship-check` (after a GO) and `advise-project` as the after-ship step. It **requires a built `app/`** (route to
`build-app` otherwise). **Setup is attended** (one confirm gate); after that it runs on its own schedule,
unattended-but-propose-only.

## Configuration

Read `.claude/skills/maintain-app/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the shipped app to maintain.
- `cadence` (default `"weekly"`) — the schedule the Routine/CI runs on (documentation for the registered cron).
- `signals` (default `["deps","tests","audit"]`; `"codex-review"` opt-in) — the reused collectors: **`deps`** =
  the `npm audit` / Dependabot–Renovate dependency+CVE surface (**enumerate only; always → REVIEW, never a
  SAFE-PR**); **`tests`** = the `test-app` fast Vitest suite (regressions); **`audit`** = an `audit-app` re-run
  (security/a11y/perf); **`codex-review`** = optional cross-model review.
- `safe_pr_classes` (default `["lint","format","mechanical-a11y","dead-code","doc-drift"]`) — the **only** fix
  classes eligible for an auto-opened SAFE-PR. **Dependency bumps are never in this list.**
- `safe_pr_min_precision` (default `0.9`) — a **static per-class confidence threshold** (each class carries a
  baked confidence — lint/format high, doc-drift lower); a class below it is never SAFE-PR-eligible (→ REVIEW).
  Not a runtime measurement.
- `dependency_cooldown_days` (default `7`) — the scaffolded `min-release-age` cooldown; the loop never rushes a
  fresh release.
- `max_safe_prs_per_tick` (default `3`) — a hard cap; extra safe fixes are listed in the report, not opened.
- `caution_severity` (default `"CRITICAL"`) — findings at/above this are surfaced prominently.

## The triage buckets (the `improve-system` three-bucket model, app-shaped)

- **SAFE-PR** — in `safe_pr_classes`, reversible, mechanically-verifiable, at/above `safe_pr_min_precision`,
  and the gates stay green → open a PR (or, offline, stage the branch — see Phase 3), capped at
  `max_safe_prs_per_tick`.
- **REVIEW** — everything else, **including every dependency/CVE bump** → surfaced + explained in the report
  with a priority and a release-age note; the human (or Dependabot's own PR) decides. Never auto-applied.
- **ASK** — genuinely ambiguous → a plain-language question in the report.

## Procedure (Goal → Act → Judge → Deliver → Stop-clean)

### Phase 0 — Setup (attended, one confirm gate — the ONLY attended step)

Require a built `app/` (missing → offer `build-app` first, then continue on yes; stop gracefully on no).
Show the plan in **one message** and ask **one** question: *"Set up scheduled maintenance for your app? I'll
scaffold a health-report loop offline — Dependabot with a 7-day cooldown, a local weekly check, and a
ready-to-enable CI workflow — and a guard that makes sure the loop can only ever open a PR, never merge or
deploy. Nothing runs until you turn it on. (yes / tweak)"* On "tweak", revise and re-ask. On yes, **scaffold
offline** (into the user's project, not the template):

1. **Dependency cooldown → `.github/dependabot.yml`** (delegate patching; never auto-bump). Write:

   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/app"
       schedule:
         interval: "weekly"
       cooldown:
         default-days: 7   # min-release-age: don't open PRs for versions < 7 days old
       open-pull-requests-limit: 5
   ```

   *(Renovate equivalent, if the user prefers it: `renovate.json` with `"minimumReleaseAge": "7 days"`.)*

2. **The guard hook → merge into `.claude/settings.json`** (create it if absent; **merge, never clobber** an
   existing settings file — add this `PreToolUse` entry to any existing `hooks`):

   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Bash",
           "hooks": [
             { "type": "command", "command": "node .claude/skills/maintain-app/hooks/guard.mjs" }
           ]
         }
       ]
     }
   }
   ```

   The guard (`.claude/skills/maintain-app/hooks/guard.mjs`, shipped with this skill) is a **no-op unless a
   tick is running** (see *The guardrail hook* below).

3. **A local Routine** (the offline **sandbox** tier) — offer to register a weekly Claude Code Routine
   (prompt: *"Run the maintain-app skill for one scheduled tick."*), exactly like `maintenance-loop`'s
   Routine but a **separate** schedule (see `docs/SCHEDULING.md`). This is where you try it; a shipped app's
   real maintenance belongs in CI (next).

4. **A ready-to-enable CI workflow** (the keyed **real home**) → write `.github/workflows/maintain-app.yml`,
   **inert until the user adds the `ANTHROPIC_API_KEY` repo secret** (the run step skips without it):

   ```yaml
   name: maintain-app
   on:
     schedule:
       - cron: "0 9 * * 1"   # weekly, Mondays 09:00 UTC — adjust to taste
     workflow_dispatch: {}
   permissions:
     contents: write
     pull-requests: write
   jobs:
     maintain:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: "20"
         - name: Run the maintain-app tick
           env:
             ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
           run: |
             if [ -z "$ANTHROPIC_API_KEY" ]; then
               echo "No ANTHROPIC_API_KEY secret set — maintain-app is inert. Add it to enable."
               exit 0
             fi
             npx @anthropic-ai/claude-code -p "Run the maintain-app skill for one scheduled tick."
   ```

**Never** add the secret, enable a schedule for the user, register the Routine without an explicit yes, or run
a tick during setup. Hand over the go-live checklist (`docs/MAINTAIN-APP.md`) for the one keyed step.

### Phase 1 — Scan / identify (act; cheap-trigger-gated; write the sentinel)

**Write the sentinel first:** `outputs/runs/maintain-app.lock` = `{"pid": <pid>, "started_at": "<ISO8601>"}`
(this arms the guard hook for the tick). Then run the cheap **"did anything materially change since last
tick?"** check (new commits since `outputs/runs/maintain-app.json`'s last SHA? an `npm audit` delta? new
error-tracking events?). **No change → suppress: remove the lock, write no report, log a no-op tick, stop.**
On change, run the enabled `signals`, each a **reused collector**: **`deps`** → the `npm audit` /
Dependabot–Renovate surface (enumerate only — never bump); **`tests`** → `test-app`'s fast Vitest suite;
**`audit`** → an `audit-app` re-run (offline); **`codex-review`** → optional. Expensive collectors run only
behind the cheap trigger (cost gating).

### Phase 2 — Triage (judge)

Sort every finding into **SAFE-PR / REVIEW / ASK**. All dependency bumps → **REVIEW** with a release-age note
(honoring the cooldown). Apply the **static** per-class confidence: a class below `safe_pr_min_precision` is
never SAFE-PR-eligible (→ REVIEW).

### Phase 3 — SAFE-PR with verify-or-demote (act + Judge + Stop-clean)

For each SAFE-PR item (up to `max_safe_prs_per_tick`): apply onto a **new branch** named `maintain-app/<date>-<slug>` (via the reused
`implementer` fleet agent), then **run `test-app` + `audit-app` gates**. **Green →** in the **keyed CI tier
(or when a git remote + `gh` CLI are present)** push the branch and **open a PR**; in the **offline/local
tier** **stage the branch locally and describe it in the report** (no push, no PR). Either way the change
carries a mandatory, *specific* **"what I did NOT verify"** block (the exact unsampled behavior — never
boilerplate). **Not green → revert the branch and demote the item to REVIEW** (never leave the repo
half-patched). **Never merge; never auto-merge.** (`gh` + a git remote are prerequisites for opening the PR;
absent → stage-and-report, gracefully — the guard hook blocks any merge/push-to-default regardless.)

### Phase 4 — Deliver the report + log (stop-clean)

Write **one** `outputs/maintenance/<YYYY-MM-DD>-<slug>/REPORT.md` — RAG frontmatter (`title`, `source_id:
outputs:maintenance:<date>-<slug>`, `max_severity`, per-bucket `counts`, `updated`), then: a plain-language
**health verdict**, the **single next action**, the **REVIEW** items (priorities + release-age notes), any
opened/staged **SAFE-PR** links, and the **ASK** questions. **For a non-technical reader** the top degrades to
*"your app is healthy" / "one thing to do" / "one thing needs a developer — here's what to ask for"* — never
homework they can't act on. Update `outputs/runs/maintain-app.json` (last SHA / last-run), **remove the
sentinel lock**, and if `human-improve-system` notify is configured and REVIEW items exist, hand off so the
human learns items wait.

## Provenance — outputs-only for the report; branch/PR are proposals

`maintain-app` writes `outputs/maintenance/<date>-<slug>/REPORT.md` + `outputs/runs/maintain-app.json`, and
opens **branches/PRs** (proposals awaiting a human merge). It writes **no** `raw/builds/` record on `main`,
**no** `wiki/build.md` change, and **no** `outputs/change-log.md` line — everything it emits is a *proposal*.
`improve-system` stays the single applier and single `change-log.md` writer. (The `audit-app`/`codex-review`
invariant family; the one addition is that a proposal may take the form of a PR, never a merge.)

## The guardrail hook (a real, registered, sentinel-scoped block — not a prompt)

The shipped `hooks/guard.mjs` is registered as a `PreToolUse(Bash)` hook in `.claude/settings.json` at setup.
It is **scoped by the sentinel** `outputs/runs/maintain-app.lock`: **lock absent → no-op (exit 0)** so ordinary
developer sessions are never affected; **lock present (a tick is running) → it hard-blocks** `git merge`, a
push to any branch other than the tick's own `maintain-app/*`, `gh pr merge`, deploy/publish, or a secret/key write (a non-zero exit denies the
tool call). A **stale lock** (older than a max-tick bound) is treated as absent, so a crashed tick can never
silently block a developer's merge. This is the enforcement path — the harness blocks the action; the model is
not merely asked to behave.

## Hybrid scaffold — CI is the product, local is the sandbox

Both tiers scaffold offline. The **local Routine** is the try-it/**sandbox** (a shipped app can't depend on a
laptop being awake) — it **stages SAFE-PR branches + writes the report**; **opening PRs is the CI/remote
tier's job**. The **keyed CI workflow** is the **real home** — it ships **inert until you add the
`ANTHROPIC_API_KEY` secret**; `maintain-app` never adds the secret, never enables it, never runs it for you.

## Rules & guardrails

- **Report-first, PR-as-exception.** One sparse health report per tick is the deliverable; a SAFE-PR is rare,
  capped, precision-gated, and never for a dependency bump.
- **Never merges/deploys/publishes/enters keys.** Every tick emits only proposals; the `guard.mjs` hook
  enforces it mechanically. **Never auto-merge.**
- **Dependencies delegated + cooled.** Dependabot/Renovate + a ~7-day `min-release-age`; surfaced/explained,
  never auto-bumped ("green tests" is not a supply-chain safety proof).
- **Attention-protected.** No-op ticks suppressed; SAFE-PRs capped; the report has a single next action.
- **`improve-system` stays the single applier; `raw/` immutable.** Writes only its `outputs/` report +
  run-state; opens PR proposals.
- **Its own schedule — NEVER inside `maintenance-loop` (that maintains the knowledge base), and deliberately
  NOT an `autopilot` phase** (like `deploy`/`polish`/`build-mcp`). Unattended-*safe* only because every tick is
  propose-only and the hook blocks the irreversible step.
- **Requires a built `app/`; web-first (v1).** Maintaining `mobile/` / `plugin/` is a later phase.

## Validation before trust (the 48-hour test)

Before relying on it, do the **48-hour test** (see `docs/MAINTAIN-APP.md`): hand-run one tick on a real
shipped app — the health report + one SAFE-PR with the "what I did NOT verify" block — and show both to one
technical and one non-technical reader. Two answers decide readiness: the non-technical reader understands the
report and knows the next action, and the developer would let it run in CI.

## Output

A short summary: whether the tick ran or suppressed (and why), the report path (or the no-op note), the
per-bucket counts, any opened/staged SAFE-PRs, and the single next action.

## Autonomous invocation

`maintain-app` is **deliberately NOT driven by `autopilot`**, and it is **NOT part of the unattended
`maintenance-loop`** (which maintains the knowledge base). It runs on **its own schedule** — the local Routine
or the keyed CI workflow registered at setup — and every scheduled tick is **propose-only** (a report + at most
`max_safe_prs_per_tick` PR proposals; the `guard.mjs` hook blocks any merge/deploy/publish/key-write). There is
no `autopilot` config flag for it. This note documents that placement; the attended setup + propose-only ticks
above are the only ways `maintain-app` runs.
