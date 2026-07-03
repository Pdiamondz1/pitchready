# maintain-app — the scheduled "operate & maintain" loop (path-to-production rung 7) — design

## Context

**What prompted this.** The user asked for *"an automated solution for scheduled maintenance/improvements
post production/shipped — where security, bugs, improvements are identified and then patched."* The template
takes an idea to a shipped app (rungs 1–6: `build-backend` → `test-app` → `audit-app` → `deploy` →
`ship-check` → `polish`), but stops the day it ships. There is **no "operate & maintain" rung** — nothing
watches a shipped app over time. `maintenance-loop` exists but maintains the **knowledge base**, not the app;
`audit-app` identifies app issues but is one-shot, attended, and propose-only. This spec adds the missing
recurring rung.

**What the two vettings decided (this is load-bearing).** The user drove the idea through `/brainstorming`
then `/roast` then `/storm-research` (artifacts: `outputs/vetting/2026-07-03-maintain-app/roast-verdict.md`
+ `maintain-app-briefing.html`, 22 citations verified: 0 fabricated, 8 corrected, 7 demoted).

- The user resolved the **autonomy fork** in brainstorming: **auto-patch to a gated PR** (not propose-only,
  not fully autonomous), combined with **loop-engineering strategies** (scheduled/cron loops, goal/"Ralph"
  loops with a Judge + stop-clean condition, lifecycle hooks as guardrails, subagents) from Austin Marchese's
  *"8 Claude Loops to Build 10x Faster."* The **architecture fork** resolved to **hybrid scaffold** (a local
  Routine + a keyed CI workflow, `deploy`-style).
- **The roast returned RESHAPE (high)** — `Contrarian 3 · Expansionist 9 · Logician 7 · Researcher 6 ·
  Buyer 5`. Convergent finding across four of five personas: dependency auto-bumps are *simultaneously* the
  redundant part (Dependabot does it free), the dangerous part (Axios Mar-2026 + Shai-Hulud Sep-2025 both
  arrived as green-CI-passing minor/patch bumps), and the wrong-buyer part (commodity, not LLM value).
- **The storm sharpened the reshape further** (report-first) and confirmed it against primary sources.

**The defining trait — REPORT-FIRST, PR-AS-EXCEPTION.** The single design principle both passes converge on:
*the automation's fluency is exactly what erodes the human oversight it depends on — attention is the scarce
resource, and every output spends it.* Therefore the **primary artifact is one sparse, plain-language health
report** (the Renovate *Dependency Dashboard* pattern — one digest per repo, one prioritized next action), and
an auto-opened **SAFE-PR is a rare exception**, not the deliverable. Dependency/CVE patching is **delegated to
Dependabot/Renovate** (surfaced + explained in the report, never auto-applied), behind a scaffolded **~7-day
release cooldown** (`min-release-age`). The one irreversible act (merge/deploy/publish/key-entry) is blocked
by a **real mechanical hook** and stays the human's — the template's permanent invariant.

**Intended outcome.** A new `maintain-app` skill that, on a schedule, reads a shipped `app/`, re-runs the
quality signals the template already produces, and writes one prioritized health report to
`outputs/maintenance/`; delegates dependency/CVE handling to Dependabot/Renovate (config scaffolded); opens a
gated SAFE-PR only for the narrow, reversible, mechanically-verifiable fix class; and never merges, deploys,
publishes, or enters keys. Scaffolds **both** a local Claude Code Routine (Tier-0, offline) and a
ready-to-enable keyed GitHub Actions workflow (disabled until the user adds the CI secret). Attended setup
(one confirm gate), unattended-but-propose-only ticks. **Its own schedule — never inside `maintenance-loop`;
deliberately not in `autopilot`** (like `deploy`/`polish`/`build-mcp`).

---

## Design

### The skill: `maintain-app` (`.claude/skills/maintain-app/{SKILL.md,config.json}`)

The **"operate & maintain"** step. `deploy` ships it, `ship-check` gates it, `polish` legitimizes it —
`maintain-app` **keeps it healthy over time**. It reads the shipped `app/` on a schedule and produces one
prioritized health report; the report is the product, a SAFE-PR is the exception, and dependency patching is
delegated. Report/PR are **proposals** — `maintain-app` never touches `main`, never merges, never deploys.

**When to use.** "keep my app maintained", "watch my app for security/bugs", "set up scheduled maintenance",
"maintain my app post-launch", `/maintain-app`. Also offered by `what-can-i-do` and pointed to by
`ship-check`/`advise-project` as the after-ship step. It **requires a built `app/`** (route to `build-app`
otherwise). Setup is attended; thereafter it runs on its schedule.

**Report-first, PR-as-exception (the reshape).** Unlike an auto-patcher, the default output is **one health
report**. A SAFE-PR is opened only when a fix is in the narrow safe class AND the gates stay green; otherwise
the finding is explained in the report for a human to act on. No-op ticks are **suppressed** (no report when
nothing materially changed) — protecting attention is a first-class requirement, not a nicety.

**Inputs it reads (all offline for the local tier, no keys):**
- The built **`app/`** — `package.json` (deps → delegated to Dependabot; scripts), `src/` (→ the reused
  `audit-app`/`test-app`/`codex-review` signal collectors), the Vite config, any `.env.example` (flag a
  committed real `.env`).
- **`wiki/charter.md`** — audience/sensitivity (sets the a11y bar + what "healthy" means for this app);
  **missing → defaults + flag.**
- **`wiki/build.md`** + latest `raw/builds/` record — what exists, whether a backend/deploy is wired.
- **`outputs/runs/maintain-app.json`** — the prior tick's state (last-run, last-scan fingerprint) → the
  cheap "did anything materially change?" trigger.
- **Live signals (graceful-off, keyed):** error-tracking from `deploy` (e.g. Sentry) when keys are present;
  **absent → skipped + noted**, never blocks.

**Configuration (`config.json`, all default; never block on absence):**
- `app_dir` (default `"app"`).
- `cadence` (default `"weekly"`) — documentation for the Routine/CI schedule the user registers.
- `signals` (default `["deps","tests","audit"]`; `"codex-review"` opt-in) — the collectors, each mapped to
  an existing surface: **`deps`** = the `npm audit` / Dependabot-Renovate dependency+CVE surface (enumerate
  only; always → REVIEW, never a SAFE-PR); **`tests`** = the `test-app` fast Vitest suite (regressions);
  **`audit`** = an `audit-app` re-run (security/a11y/perf); **`codex-review`** = optional cross-model review.
- `safe_pr_classes` (default `["lint","format","mechanical-a11y","dead-code","doc-drift"]`) — the **only**
  fixes eligible for an auto-opened SAFE-PR. Dependency bumps are **never** in this list.
- `safe_pr_min_precision` (default `0.9`) — a **static per-class confidence threshold**. Each `safe_pr_class`
  carries a baked confidence (e.g. lint/format high, doc-drift lower); a class below the threshold is never
  SAFE-PR-eligible (→ REVIEW). This is a fixed per-class judgment, **not** a runtime-measured precision (one
  tick has no ground truth to measure) — the "10–20% FP collapses trust" guardrail, applied statically.
- `dependency_cooldown_days` (default `7`) — scaffolded `min-release-age`; the loop never rushes a fresh
  release.
- `max_safe_prs_per_tick` (default `3`) — a hard cap; excess safe fixes are listed in the report, not opened
  as PRs (attention protection).
- `caution_severity` (default `"CRITICAL"`) — findings at/above this are surfaced prominently.

**The triage buckets (reusing `improve-system`'s three-bucket model, app-shaped):**
- **SAFE-PR** — in `safe_pr_classes`, reversible, mechanically-verifiable, ≥ `safe_pr_min_precision`, and the
  gates stay green → open a PR (or, offline, stage the branch — per tier, see Phase 3), capped at
  `max_safe_prs_per_tick`.
- **REVIEW** — everything else, **including every dependency/CVE bump** → surfaced + explained in the report
  with a priority and a release-age note; the human (or Dependabot's own PR) acts. Never auto-applied.
- **ASK** — genuinely ambiguous → a plain-language question in the report.

**Procedure (loop-engineering-shaped: Goal → Act → Judge → Deliver → Stop-clean):**

- **Phase 0 — Setup (attended, one confirm gate — the ONLY attended step).** Require a built `app/`
  (route to `build-app` otherwise). Scaffold, on one confirm: (a) `config.json`; (b) a **Dependabot/Renovate
  config** with the `dependency_cooldown_days` cooldown; (c) a **local Routine** registration offer (Tier-0);
  (d) a **ready-to-enable GitHub Actions workflow** (`.github/workflows/maintain-app.yml`) that is **disabled
  until the user adds the `ANTHROPIC_API_KEY` CI secret** — scaffold-and-checklist, `deploy`-style, never
  enabling it for them; (e) the **mechanical guardrail hook** — a `PreToolUse` guard **registered in
  `.claude/settings.json`**, scoped by the `outputs/runs/maintain-app.lock` sentinel (below). Nothing runs on
  a schedule until the user registers the Routine or enables the workflow.

- **Phase 1 — Scan / identify (act; cheap-trigger-gated).** First run the cheap "did anything materially
  change since last tick?" check (new commits? `npm audit` delta? new error-tracking events?). **No change →
  suppress: write no report, log a no-op tick, stop.** On change, run the enabled `signals`, each a **reused
  collector** (see config): **`deps`** → the `npm audit` / Dependabot-Renovate dependency+CVE surface
  (enumerate only — never bump); **`tests`** → `test-app`'s fast Vitest suite (regressions); **`audit`** → an
  `audit-app` re-run (security/a11y/perf, offline); **`codex-review`** → optional cross-model. Expensive
  collectors run only behind the cheap trigger (cost gating).

- **Phase 2 — Triage (judge).** Sort every finding into SAFE-PR / REVIEW / ASK per the rules above. All
  dependency bumps → REVIEW with a release-age note. Apply the **static** per-class confidence: a class below
  `safe_pr_min_precision` is never SAFE-PR-eligible (→ REVIEW) — no runtime precision computation.

- **Phase 3 — SAFE-PR with verify-or-demote (act + Judge + Stop-clean).** For each SAFE-PR item (up to the
  cap): apply onto a **new branch** (via the reused `implementer` fleet agent), then **run `test-app` +
  `audit-app` gates**. **Green →** in the **keyed CI tier (or when a git remote + `gh` CLI are present)**,
  push the branch and **open a PR**; in the **offline/local tier**, **stage the branch locally and describe
  it in the report** (no push, no PR — offline can't reach a remote). Either way the change carries a
  mandatory, *specific* **"what I did NOT verify"** block (the exact unsampled behavior — never boilerplate).
  **Not green → revert the branch and demote the item to REVIEW** (never leave the repo half-patched).
  **Never merge; never auto-merge.** (`gh` + a git remote are prerequisites for actually opening the PR;
  absent → stage-and-report, gracefully.)

- **Phase 4 — Deliver the report + log (stop-clean).** Write **one**
  `outputs/maintenance/<YYYY-MM-DD>-<slug>/REPORT.md` (RAG frontmatter — `title` / `source_id:
  outputs:maintenance:<date>-<slug>` / `max_severity` / per-bucket `counts` / `updated`): a plain-language
  health verdict, the **single next action**, the REVIEW items (with priorities + release-age notes), any
  opened SAFE-PR links, and the ASK questions. **For a non-technical reader** the top of the report degrades
  to *"your app is healthy" / "one thing to do" / "one thing needs a developer — here's what to ask for"* —
  never homework they can't act on. Update `outputs/runs/maintain-app.json`. If SIGN-OFF-worthy items exist
  and `human-improve-system` notify is configured, hand off so the human learns items wait.

**Provenance — outputs-only for the report; branch/PR are proposals (NOT the `build-*` main-line spine).**
`maintain-app` writes the `outputs/maintenance/<date>-<slug>/REPORT.md` report + `outputs/runs/maintain-app.json`
run-state, and opens **branches/PRs** (proposals awaiting a human merge). It writes **no** `raw/builds/`
record on `main`, **no** `wiki/build.md` change, and **no** `outputs/change-log.md` line — because everything
it emits is a *proposal*, not an applied change to the shipped artifact. `improve-system` stays the single
applier and single `change-log.md` writer. (Same invariant family as `audit-app`/`codex-review`; the one
addition is that a proposal may take the form of a PR, never a merge.)

**The mechanical guardrail hook (not a prompt — a real, registered, scoped block).** Ship a `PreToolUse`
guard script (`.claude/skills/maintain-app/hooks/guard.*`) **registered in `.claude/settings.json`** — which
this phase **creates**, since the template currently ships none; a script sitting in a skill folder is never
invoked without that registration. The guard is **scoped by a sentinel lock file**: the maintain-app tick
writes `outputs/runs/maintain-app.lock` at Phase 1 start and removes it at Phase 4 / on exit. **Lock absent →
the guard is a no-op (exit 0)**, so ordinary developer sessions are never affected; **lock present (a tick is
running) → the guard hard-blocks** any command attempting `git merge`, a push to the default branch,
`gh pr merge`, a deploy/publish command, or a write to a secret/key file. Enforcement is by the harness (a
non-zero hook exit denies the tool call), not by asking the model to honor a prompt — the reshape's "real
mechanical hook, never a prompt" requirement. There is **no in-repo hook precedent**; the external
`hook-development` plugin skill is *guidance* for building it, not a file to transcribe. (The sentinel-scoping
is what solves "PreToolUse is session-global" — the block is active only during an actual tick.) The tick
writes the lock with its PID + a timestamp and clears it on exit (including an **exit trap**); a **stale lock**
(dead PID, or older than a max-tick-duration bound) is treated as absent, so a crashed/killed tick can never
silently block an unrelated developer's `git merge`.

### No new fleet agent

Like `audit-app`, this phase adds **no** subagent. It **reuses** the existing read-only `code-reviewer` /
`Explore` agents for scanning and the `implementer` agent for SAFE-PR edits, and reuses `audit-app` /
`test-app` / `codex-review` as signal collectors. `docs/SUBAGENTS.md` is **not** modified.

### Hybrid scaffold — CI is the product, local is the sandbox

Both tiers are scaffolded **offline**, and the storm's honesty note is encoded in the docs: the **local
Routine is the try-it/sandbox** tier (a shipped app can't depend on a laptop being awake); the **keyed CI
workflow is the real home**. Accordingly the local tier **stages SAFE-PR branches + writes the report**
(fully offline — no remote reached), while **opening PRs is the CI/remote tier's job** (see Phase 3). The CI
workflow ships **disabled**, with a `deploy`-style go-live checklist for the one keyed step (add
`ANTHROPIC_API_KEY` as a repo secret, enable the workflow) — `maintain-app` never adds the secret, never
enables the workflow, never runs it for the user.

### Not in `autopilot`; its own schedule, never inside `maintenance-loop`

`maintain-app` is **deliberately not an `autopilot` phase** (like `deploy`/`polish`/`build-mcp`) — it touches
a shipped artifact. It is **its own scheduled loop** (a second Routine, or the CI cron), **never nested inside
`maintenance-loop`** (which maintains the KB). It is unattended-*safe* only because every tick is
propose-only (report + PR, never a merge) and the mechanical hook blocks the irreversible step.

### Validation before trust (the roast's cheapest-48h-test, encoded as a gate)

Before `maintain-app` is recommended for real use (and before any "it maintains your app" claim), the roast's
48-hour test is a **required validation milestone**, documented in `docs/MAINTAIN-APP.md`: hand-run one tick
on a real shipped app — produce the health report + one SAFE-PR with the "what I did NOT verify" block — and
show both to one technical and one non-technical reader. Ship-readiness depends on two answers: the
non-technical reader understands the report and knows the next action, and the developer would let it run in
CI. This guards the storm's frontier question (does the report get acted on, or join the alert graveyard?).

### Not changed

`improve-system` (single applier), `maintenance-loop` (KB loop — `maintain-app` is separate), `codex-review`,
`audit-app`/`test-app`/`build-*`/`deploy`/`polish`/`ship-check` SKILLs (untouched — this ADDS a sibling and
reuses them as collectors; visibility wired via `what-can-i-do` + `ship-check`/`advise-project` next-step
clauses + docs), `define-*`, `roast`, `storm-research`, `autopilot` (NOT a phase here), `docs/SUBAGENTS.md`
(no new agent), `raw/` immutability.

## Safety / reconciliation

- **Report-first, propose-only outputs; PR-as-exception; never merges/deploys/publishes/enters keys.** Every
  tick emits only proposals (a report + at most `max_safe_prs_per_tick` PRs on branches). `improve-system`
  stays the single applier to `main`.
- **Mechanical hook, not a prompt.** The irreversible step is blocked by a `PreToolUse` hook — the reshape's
  hardest requirement.
- **Dependencies delegated + cooled.** No auto-bumps; Dependabot/Renovate + a scaffolded ~7-day cooldown
  (`min-release-age`) — directly answers the verified supply-chain evidence (install-time payloads;
  green-tests ≠ safe).
- **Attention-protected.** No-op ticks suppressed; SAFE-PRs capped and precision-gated; the report is one
  sparse digest with a single next action.
- **Tiered + graceful-off.** Scaffold is Tier-0/offline; the CI path is keyed and ships disabled; live
  signals are graceful-off. The one keyed/irreversible step stays the user's (`deploy` precedent).
- **Its own loop, never in `maintenance-loop`, never in `autopilot`.** Unattended-safe by construction
  (propose-only), but isolated from the KB loop and the build capstone.
- **Author-only — never run for real against the template.** No real `outputs/maintenance/<date>-*` report,
  no `.github/workflows/maintain-app.yml` enabled, no Routine registered against this repo; ships clean.

## Critical files

- **Create (shipped):** `.claude/skills/maintain-app/SKILL.md` + `config.json` +
  `hooks/guard.*` (the `PreToolUse` guard script — reads the `outputs/runs/maintain-app.lock` sentinel;
  no-op when absent, blocks merge / push-to-default / `gh pr merge` / deploy/publish / secret-writes when
  present) + **`.claude/settings.json`** (registers that `PreToolUse` hook — the template currently ships
  none) + a scaffold template for `.github/workflows/maintain-app.yml` (shipped as an inert template, not an
  active workflow) + the Dependabot/Renovate config template; `docs/MAINTAIN-APP.md`;
  `outputs/maintenance/.gitkeep`; `docs/superpowers/specs/2026-07-03-maintain-app-design.md` (this spec).
- **Modify (shipped, light/additive):** `.claude/skills/what-can-i-do/SKILL.md` (menu item);
  `.claude/skills/ship-check/SKILL.md` + `.claude/skills/advise-project/SKILL.md` (name `maintain-app` as the
  after-ship next step — additive); `CLAUDE.md` (skill bullet + `outputs/maintenance/` pointer, hold ≤ 150
  lines); `README.md` (build-status line + guide row); `docs/PATH-TO-PRODUCTION.md` (add **rung 7 — operate &
  maintain — `maintain-app`**, shipped); `docs/USING-THIS-FOR-ANY-PROJECT.md` (a maintain rung/clause);
  `docs/SCHEDULING.md` (note the *second*, app-maintenance schedule, distinct from the KB `maintenance-loop`);
  `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` (phase addendum).
- **NOT modified:** `docs/SUBAGENTS.md` (no new agent); `autopilot` (not a phase); `maintenance-loop`,
  `improve-system`, `codex-review`, `audit-app`/`test-app`/`build-*`/`deploy`/`polish`/`ship-check` SKILLs.
- **Reuse (reference, do not modify):** `audit-app` (propose-only/outputs-only/severity + offer-don't-run),
  `deploy` (hybrid scaffold + keyed go-live checklist + never-deploy invariant), `maintenance-loop` (the
  Routine/scheduling + unattended-safe pattern), `improve-system` (three-bucket triage), `test-app` (the
  fast-Vitest-run precedent), the external `hook-development` plugin skill (guidance only — the `PreToolUse`
  guard is net-new; there is no in-repo hook precedent to transcribe).

## Verification

Authoring task (skill / hook / templates / docs / wiring) → DoD via `grep`/`wc`/`git`, plus (documented, NOT
run against the template) a manual smoke of a generated report:
- **Skill present & shaped:** `maintain-app/SKILL.md` states report-first / PR-as-exception; the SAFE-PR safe
  class **excludes dependency bumps**; verify-or-demote + "what I did NOT verify" block + never-auto-merge;
  the cheap change-trigger + no-op suppression; `config.json` has the keys with stated defaults
  (`safe_pr_classes` has no dependency class; `dependency_cooldown_days: 7`).
- **Mechanical hook real, registered, and scoped:** `.claude/settings.json` registers a `PreToolUse` hook
  pointing at `hooks/guard.*`; the guard reads the `outputs/runs/maintain-app.lock` sentinel — **no-op when
  absent** (normal dev unaffected), blocks merge / push-to-default-branch / `gh pr merge` / deploy/publish /
  secret writes **when present** (grep the settings registration + the guard + the lock write/remove, not
  just the prose).
- **Hybrid scaffold + keyed-off + local-stages/CI-opens:** the CI workflow ships as an inert template,
  disabled until the user adds the secret; SKILL.md never enables it / never enters keys (grep the invariant);
  the local tier stages branches + writes the report offline while PR-opening is the CI/remote tier's job
  (grep Phase 3); Dependabot/Renovate config carries the cooldown.
- **Propose-only / outputs-only + PR-as-proposal:** SKILL.md states it writes ONLY `outputs/maintenance/` +
  `outputs/runs/maintain-app.json`, opens branches/PRs but never merges/deploys, never writes
  `raw/`/`wiki/`/`change-log.md`; `improve-system` stays the single applier.
- **Placement invariants:** NOT an `autopilot` phase; its own schedule; NEVER nested in `maintenance-loop`
  (grep those statements intact).
- **No new agent:** `git diff --name-only main..HEAD` includes no `docs/SUBAGENTS.md` / `.claude/agents/` file.
- **Untouched invariants (expect empty):** `git diff --name-only main..HEAD` for `improve-system`,
  `maintenance-loop`, `codex-review`, `autopilot`, `audit-app`, `test-app`, `build-*`, `deploy`, `polish`,
  `ship-check`, `define-*`, `roast`, `storm-research`, `raw`.
- **No pollution:** no real `outputs/maintenance/<date>-*` report, no enabled `.github/workflows/maintain-app.yml`,
  no Routine committed; only intended files in the diff; `CLAUDE.md` ≤ 150 lines.
- **Roadmap updated:** `docs/PATH-TO-PRODUCTION.md` gains rung 7 (operate & maintain), matching rungs 1–6's
  format; the vetting provenance (`outputs/vetting/2026-07-03-maintain-app/`) is referenced.

## Execution (after approval)

The project's standard pipeline, **dogfooding the tuned fleet**: this spec → `spec-reviewer` → user review →
`writing-plans` → `plan-reviewer` → subagent build with `implementer`s (per-task, verbatim transcription +
grep/git DoD + per-task commits) → `code-reviewer` + Codex `codex review --base main` →
`finishing-a-development-branch`. Branch: `maintain-app-operate-maintain`. **Author only — never register the
Routine / enable the workflow / run `maintain-app` for real against the template.** The roast's 48-hour
validation milestone (a manual dry-run on a real shipped app, judged by a technical + a non-technical reader)
precedes any recommendation of the skill for real use.
