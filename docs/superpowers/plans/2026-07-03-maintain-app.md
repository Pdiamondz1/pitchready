# maintain-app — the "operate & maintain" rung (path-to-production rung 7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship path-to-production rung 7 as one skill — `maintain-app` — a **report-first** scheduled "operate & maintain" loop for a shipped `app/`: it re-runs the app's quality signals into one plain-language health report, delegates dependency/CVE patching to Dependabot/Renovate (with a ~7-day cooldown), opens a gated SAFE-PR only for the narrow reversible fix class, and **never merges/deploys/publishes/enters keys** — a real, sentinel-scoped `PreToolUse` guard hook enforces that boundary. Plus the docs + light additive wiring.

**Architecture:** A pure **authoring** phase — every task writes a skill/hook/doc file verbatim or applies an exact `OLD→NEW` edit, with grep/git DoD. Ships **author-only / clean**: NO real `outputs/maintenance/<date>-*` report, NO `.github/workflows/` file, NO `.github/dependabot.yml`, NO registered Routine, NO active `.claude/settings.json` hook. Two deliberate **spec reconciliations** (both keep the template's ship-clean/opt-in invariant, matching how `deploy` handles its workflow): (1) the CI workflow, the Dependabot config, and the `.claude/settings.json` hook registration ship as **fenced templates inside `SKILL.md`** that Phase 0 *scaffolds into the user's clone at setup* — the template commits none of them active; (2) the committed `guard.mjs` is inert until that setup registers it, so the template's own dev sessions stay hook-free and untaxed. `maintain-app` is deliberately **not** wired into `autopilot` and runs on **its own schedule** (never inside `maintenance-loop`); **no** new fleet agent (so `docs/SUBAGENTS.md` and `.claude/agents/` are NOT touched).

**Tech Stack:** Markdown skills (`.claude/skills/<name>/SKILL.md` + `config.json`), one Node ESM hook script (`hooks/guard.mjs`), Markdown docs. Spec: `docs/superpowers/specs/2026-07-03-maintain-app-design.md`. Vetting: `outputs/vetting/2026-07-03-maintain-app/`. Branch: `maintain-app-operate-maintain` (spec committed at `178d7b0`).

**Verbatim-transcription rule (every task):** transcribe fenced content BYTE-FOR-BYTE; for edits, match `OLD` exactly and replace with `NEW`. Do not paraphrase, reflow, or add anything. LF→CRLF git warnings on Windows are harmless.

---

### Task 1: The `maintain-app` machinery (`config.json` + the `guard.mjs` hook)

**Files:**
- Create: `.claude/skills/maintain-app/config.json`
- Create: `.claude/skills/maintain-app/hooks/guard.mjs`

- [ ] **Step 1: Create `.claude/skills/maintain-app/config.json`** with exactly:

```json
{
  "app_dir": "app",
  "cadence": "weekly",
  "signals": ["deps", "tests", "audit"],
  "safe_pr_classes": ["lint", "format", "mechanical-a11y", "dead-code", "doc-drift"],
  "safe_pr_min_precision": 0.9,
  "dependency_cooldown_days": 7,
  "max_safe_prs_per_tick": 3,
  "caution_severity": "CRITICAL"
}
```

- [ ] **Step 2: Create `.claude/skills/maintain-app/hooks/guard.mjs`** with exactly (byte-for-byte):

```javascript
#!/usr/bin/env node
/**
 * maintain-app guardrail — a PreToolUse(Bash) hook, registered in .claude/settings.json by
 * `maintain-app` setup (Phase 0). It is a NO-OP unless a maintain-app tick is actually running
 * (sentinel outputs/runs/maintain-app.lock present AND fresh). During a tick it hard-blocks the
 * irreversible actions the loop must never take — merge, push to the default branch, gh pr merge,
 * deploy/publish, secret/key writes — while still allowing the tick's own legitimate work
 * (feature-branch push, `gh pr create`).
 *
 * Contract: exit 0 = allow; exit 2 = block (stderr is surfaced to the agent). The sentinel-scoping
 * is what makes a session-global hook safe: outside a tick it always exits 0, so ordinary developer
 * sessions are never affected, and a crashed tick can never leave a lasting block (stale-lock check).
 */
import { readFileSync } from 'node:fs';

const LOCK = 'outputs/runs/maintain-app.lock';
const MAX_TICK_MS = 2 * 60 * 60 * 1000; // 2h — an older lock is stale => treat as "no tick"

// 1) No fresh tick => allow everything (normal dev unaffected; crashed-tick-safe).
let lock;
try {
  lock = JSON.parse(readFileSync(LOCK, 'utf8'));
} catch {
  process.exit(0); // sentinel absent/unreadable => allow
}
const startedAt = Date.parse(lock && lock.started_at);
if (!startedAt || Date.now() - startedAt > MAX_TICK_MS) process.exit(0); // stale => allow

// 2) A tick is running: inspect the Bash command from the hook payload on stdin.
let cmd = '';
try {
  cmd = (JSON.parse(readFileSync(0, 'utf8')).tool_input || {}).command || '';
} catch {
  process.exit(0);
}
if (!cmd) process.exit(0);

const BLOCKED = [
  [/\bgit\s+merge\b/, 'git merge'],
  [/\bgit\s+push\b[^\n|&;]*\b(?:main|master)\b/, 'git push to the default branch'],
  [/\bgh\s+pr\s+merge\b/, 'gh pr merge'],
  [/\b(?:vercel|netlify)\b[^\n]*\b(?:deploy|--prod)\b/, 'deploy'],
  [/\b(?:npm|pnpm|yarn)\s+publish\b/, 'publish'],
  [/\bgh\s+release\s+create\b/, 'gh release create'],
  [/\bgh\s+secret\s+set\b/, 'writing a repo secret'],
  [/(?:>|>>|tee)\s+[^\n|&;]*\.env(?:\b|$)/, 'writing a .env / key file'],
];

for (const [re, why] of BLOCKED) {
  if (re.test(cmd)) {
    process.stderr.write(
      `maintain-app guardrail: blocked "${why}". The maintenance loop reports and opens PRs only — ` +
        `merging, pushing to the default branch, deploying/publishing, and writing keys are the human's job. ` +
        `If no tick is running, delete ${LOCK} and retry.\n`
    );
    process.exit(2);
  }
}
process.exit(0);
```

- [ ] **Step 3: Definition-of-Done checks** — run (each must print `OK`):

```bash
python -c "import json;d=json.load(open('.claude/skills/maintain-app/config.json'));assert d['safe_pr_classes']==['lint','format','mechanical-a11y','dead-code','doc-drift'];assert 'deps' not in d['safe_pr_classes'];assert d['dependency_cooldown_days']==7;assert d['signals']==['deps','tests','audit'];assert len(d)==8" && echo "OK config keys (deps never a safe-PR class)"
test -f .claude/skills/maintain-app/hooks/guard.mjs && echo "OK guard exists"
grep -q "outputs/runs/maintain-app.lock" .claude/skills/maintain-app/hooks/guard.mjs && echo "OK guard reads the sentinel"
grep -q "process.exit(0); // sentinel absent" .claude/skills/maintain-app/hooks/guard.mjs && echo "OK no-op when absent"
grep -q "git push to the default branch" .claude/skills/maintain-app/hooks/guard.mjs && grep -q "gh pr merge" .claude/skills/maintain-app/hooks/guard.mjs && grep -q "process.exit(2)" .claude/skills/maintain-app/hooks/guard.mjs && echo "OK blocks + exit 2"
grep -q "MAX_TICK_MS" .claude/skills/maintain-app/hooks/guard.mjs && echo "OK stale-lock handling"
node --check .claude/skills/maintain-app/hooks/guard.mjs && echo "OK guard parses"
```
Expected: seven `OK` lines.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/maintain-app/config.json .claude/skills/maintain-app/hooks/guard.mjs
git commit -m "feat(maintain-app): config + the sentinel-scoped PreToolUse guard hook (no-op outside a tick; blocks merge/deploy/publish/keys during one)"
```

---

### Task 2: The `maintain-app` skill (`SKILL.md`)

**Files:**
- Create: `.claude/skills/maintain-app/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/maintain-app/SKILL.md`** with exactly (byte-for-byte):

````markdown
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

For each SAFE-PR item (up to `max_safe_prs_per_tick`): apply onto a **new branch** (via the reused
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
push to the default branch, `gh pr merge`, deploy/publish, or a secret/key write (a non-zero exit denies the
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
````

- [ ] **Step 2: Definition-of-Done checks** — run (each must print `OK`):

```bash
test -f .claude/skills/maintain-app/SKILL.md && echo "OK skill exists"
grep -q "Report-first, PR-as-exception" .claude/skills/maintain-app/SKILL.md && echo "OK report-first"
grep -q "Dependency bumps are never in this list" .claude/skills/maintain-app/SKILL.md && echo "OK deps never a safe-PR"
grep -q "what I did NOT verify" .claude/skills/maintain-app/SKILL.md && echo "OK not-verified block"
grep -q "never auto-merge" .claude/skills/maintain-app/SKILL.md && echo "OK never-auto-merge"
grep -q "outputs/runs/maintain-app.lock" .claude/skills/maintain-app/SKILL.md && grep -q "no-op unless a" .claude/skills/maintain-app/SKILL.md && echo "OK sentinel-scoped guard"
grep -q "min-release-age" .claude/skills/maintain-app/SKILL.md && grep -q "dependency_cooldown_days" .claude/skills/maintain-app/SKILL.md && echo "OK cooldown"
grep -q "NEVER inside \`maintenance-loop\`" .claude/skills/maintain-app/SKILL.md && grep -q "NOT an \`autopilot\` phase\|NOT driven by \`autopilot\`" .claude/skills/maintain-app/SKILL.md && echo "OK placement invariants"
grep -q "48-hour test" .claude/skills/maintain-app/SKILL.md && echo "OK 48h validation gate"
grep -q "inert until the user adds the \`ANTHROPIC_API_KEY\`\|inert until you add the \`ANTHROPIC_API_KEY\`" .claude/skills/maintain-app/SKILL.md && echo "OK CI keyed-off"
```
Expected: ten `OK` lines. Fix any slip and re-run.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/maintain-app/SKILL.md
git commit -m "feat(maintain-app): the operate-and-maintain skill — report-first loop, delegated+cooled deps, gated SAFE-PRs, mechanical guard, hybrid scaffold"
```

---

### Task 3: The how-to doc (`docs/MAINTAIN-APP.md`)

**Files:**
- Create: `docs/MAINTAIN-APP.md`

- [ ] **Step 1: Create `docs/MAINTAIN-APP.md`** with exactly:

```markdown
# maintain-app — keep your shipped app healthy

`build-app` builds it, `deploy` ships it, `ship-check` gives the go/no-go, `polish` makes it legitimate —
`maintain-app` **keeps it healthy after launch**. On a schedule it checks your app and writes you **one
plain-language health report**: is it still safe, still working, and what's the single next thing to do.

Say **"keep my app healthy"**, **"maintain my app"**, **"set up scheduled maintenance"**, or **`/maintain-app`**.

## The one rule: it reports and proposes — you decide

`maintain-app` **never merges, never deploys, never publishes, and never enters a key.** Everything it does is
a proposal you can accept: a report to read, and — for a few genuinely safe, mechanical fixes — a pull request
you can merge if you like. A built-in guard makes it *impossible* for the loop to do the irreversible step; a
human always pulls that trigger. (Same boundary as `deploy` and the backend go-live.)

## What a weekly check does (report-first)

1. **Re-runs your quality signals** — a security/accessibility/performance audit, your test suite, and (opt-in)
   a cross-model code review.
2. **Delegates dependency updates to Dependabot** — with a **7-day cooldown** so a brand-new (possibly
   compromised) release is never pulled in a hurry. New security updates are **explained in your report** for
   you to decide on — never auto-applied.
3. **Opens a "safe" pull request only for small, reversible fixes** (formatting, a mechanical accessibility
   fix, dead code, doc drift) — and only if your tests stay green. Each one honestly lists **what it did NOT
   check**. It never touches your app's real logic, and it caps how many it opens.
4. **Writes you one report** with a plain verdict, the REVIEW items, any safe PRs, and — most importantly —
   **the single next thing to do**. If nothing changed, it stays quiet (no noise).

## Where it runs

- **On your machine (the sandbox)** — a weekly Claude Code Routine, offline, no keys. Good for trying it. It
  stages fixes as branches and writes the report; a shipped app shouldn't depend on your laptop being awake.
- **In the cloud (the real home)** — a GitHub Actions workflow that runs whether or not your machine is on,
  and opens the PRs. It's **scaffolded but off** until you add one secret (`ANTHROPIC_API_KEY`) — that one
  keyed step is yours.

It runs on **its own schedule**, separate from the knowledge-base upkeep (`maintenance-loop`), and it is
**deliberately not part of the hands-off `autopilot` run** — maintaining a live app is an ongoing operation,
not a one-shot build step.

## Before you rely on it: the 48-hour test

The honest way to know this is worth turning on: **hand-run one check** on a real shipped app, then show two
people the result — the health report and one safe PR (with its "what I did NOT verify" note):

- a **non-technical** person: do they understand the report and know the next action?
- a **developer**: would they let this run in their CI?

If both are yes, turn it on. If the report just becomes another notification nobody reads, tune it (fewer,
higher-signal items) before trusting it. (This guards the one real risk: a stream of green PRs that trains you
to rubber-stamp — the report, not the PRs, is the point.)

## What it is (and isn't)

- **Is:** an ongoing health report + a few genuinely safe, opt-in fixes, on a schedule — with the irreversible
  step always yours.
- **Isn't:** an auto-patcher. It **delegates** dependency patching to Dependabot and never auto-bumps or
  auto-merges anything; "the tests pass" is never treated as "safe to ship."
- **Web app (`app/`) first;** phone/extension maintenance comes later.

## Safety

Keys live only where you put them (never in chat, never committed). A real guard hook blocks the loop from
merging, deploying, publishing, or writing keys. It runs **its own schedule — never in the unattended
`maintenance-loop`, never in `autopilot`.** Maintaining is the seventh rung of the **path to production**
(`docs/PATH-TO-PRODUCTION.md`). Vetted 2026-07-03 (`roast` RESHAPE + a citation-verified `storm-research` —
`outputs/vetting/2026-07-03-maintain-app/`).
```

- [ ] **Step 2: Definition-of-Done checks** — run (each must print `OK`):

```bash
test -f docs/MAINTAIN-APP.md && grep -q "keep your shipped app healthy" docs/MAINTAIN-APP.md && echo "OK doc exists"
grep -q "48-hour test" docs/MAINTAIN-APP.md && echo "OK 48h gate documented"
grep -q "7-day cooldown" docs/MAINTAIN-APP.md && echo "OK cooldown documented"
grep -q "never merges, never deploys" docs/MAINTAIN-APP.md && echo "OK never-irreversible"
grep -q "its own schedule" docs/MAINTAIN-APP.md && echo "OK own-schedule"
```
Expected: five `OK` lines.

- [ ] **Step 3: Commit**

```bash
git add docs/MAINTAIN-APP.md
git commit -m "docs(maintain-app): MAINTAIN-APP.md how-to — report-first, delegated+cooled deps, the guard, and the 48h validation gate"
```

---

### Task 4: Visibility wiring (`what-can-i-do` + `ship-check` + `advise-project` + `CLAUDE.md` + `.gitkeep`)

**Files:**
- Modify: `.claude/skills/what-can-i-do/SKILL.md` (menu item)
- Modify: `.claude/skills/ship-check/SKILL.md` (after-GO next step)
- Modify: `.claude/skills/advise-project/SKILL.md` (deferred-tiers chain)
- Modify: `CLAUDE.md` (outputs pointer + skill bullet)
- Create: `outputs/maintenance/.gitkeep` (empty)

- [ ] **Step 1: `what-can-i-do` menu item.** In `.claude/skills/what-can-i-do/SKILL.md` find:

OLD:
```
   - **Make it launch-ready** — built an app? Add real content, onboarding + loading/error states, legal pages (privacy/terms), user docs, and optional payments (say "polish my app"). *(Runs `polish`; legal pages are templates to review with a lawyer; payments never touch your keys — you do the go-live.)*
```
NEW:
```
   - **Make it launch-ready** — built an app? Add real content, onboarding + loading/error states, legal pages (privacy/terms), user docs, and optional payments (say "polish my app"). *(Runs `polish`; legal pages are templates to review with a lawyer; payments never touch your keys — you do the go-live.)*
   - **Keep my app healthy** — already shipped? Set up a scheduled health check that reports what needs attention and opens only safe fixes (say "keep my app healthy"). *(Runs `maintain-app`; report-first — it never merges or deploys, you pull that trigger.)*
```

- [ ] **Step 2: `ship-check` after-GO next step.** In `.claude/skills/ship-check/SKILL.md` find:

OLD:
```
run one only on an **explicit yes** (e.g. `cd app && npm install && npm test`), **never** the Lighthouse
browser download unprompted. Close plainly: *"Ship-check: **<GO / NOT-YET>**. <N blocking gaps / all clear>.
The one thing to do next: <…>. Nothing's changed — this is a readiness read. Want me to start on any gap, or
run the test suite to confirm it's green?"*
```
NEW:
```
run one only on an **explicit yes** (e.g. `cd app && npm install && npm test`), **never** the Lighthouse
browser download unprompted. Close plainly: *"Ship-check: **<GO / NOT-YET>**. <N blocking gaps / all clear>.
The one thing to do next: <…>. Nothing's changed — this is a readiness read. Want me to start on any gap, or
run the test suite to confirm it's green?"* On a **GO**, name the after-ship step too: **`maintain-app`** keeps
the shipped app healthy on a schedule (see `docs/MAINTAIN-APP.md`).
```

- [ ] **Step 3: `advise-project` deferred-tiers chain.** In `.claude/skills/advise-project/SKILL.md` find:

OLD:
```
ideas; the deferred tiers (real data → the `build-backend` skill, testing → the `test-app` skill, audit → the `audit-app` skill, deploy → the `deploy` skill, readiness → the `ship-check` skill, polish → the `polish` skill, more build targets) → next-step ideas; the build record
```
NEW:
```
ideas; the deferred tiers (real data → the `build-backend` skill, testing → the `test-app` skill, audit → the `audit-app` skill, deploy → the `deploy` skill, readiness → the `ship-check` skill, polish → the `polish` skill, maintain → the `maintain-app` skill, more build targets) → next-step ideas; the build record
```

- [ ] **Step 4: `CLAUDE.md` outputs pointer.** In `CLAUDE.md` find:

OLD:
```
  - `outputs/polish/` — `polish` payments go-live checklists (`<date>-<slug>/GO-LIVE.md`, when payments opted in)
```
NEW:
```
  - `outputs/polish/` — `polish` payments go-live checklists (`<date>-<slug>/GO-LIVE.md`, when payments opted in)
  - `outputs/maintenance/` — `maintain-app` scheduled health reports (`<date>-<slug>/REPORT.md`)
```

- [ ] **Step 5: `CLAUDE.md` skill bullet.** In `CLAUDE.md` find:

OLD:
```
- **`autopilot`** — the capstone: describe your goal once → it grills you once, **vets + researches** it, shows one plan to confirm, then runs `define-project → roast → storm-research → define-design → build-*` **hands-off**,
```
NEW:
```
- **`maintain-app`** — the "operate & maintain" tier (path-to-production rung 7): a **report-first** scheduled loop for a shipped `app/` — re-runs the quality signals (`npm audit`/`test-app`/`audit-app`) into ONE plain-language health report, **delegates** dependency/CVE patching to Dependabot/Renovate (~7-day cooldown; surfaced, never auto-bumped), and opens a gated **SAFE-PR** only for a narrow reversible fix class (never a dep bump) — the PR is the exception, not the deliverable. **Never merges/deploys/publishes/enters keys** — a real sentinel-scoped `PreToolUse` guard hook enforces it. Hybrid scaffold (local Routine sandbox + keyed CI); attended setup; **its own schedule — never in `maintenance-loop`, deliberately not in `autopilot`**. See `docs/MAINTAIN-APP.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`autopilot`** — the capstone: describe your goal once → it grills you once, **vets + researches** it, shows one plan to confirm, then runs `define-project → roast → storm-research → define-design → build-*` **hands-off**,
```

- [ ] **Step 6: Create the folder-keeper** `outputs/maintenance/.gitkeep`:

```bash
mkdir -p outputs/maintenance && touch outputs/maintenance/.gitkeep
```

- [ ] **Step 7: Definition-of-Done checks** — run (each must print `OK`):

```bash
grep -q "Keep my app healthy" .claude/skills/what-can-i-do/SKILL.md && grep -q "Runs \`maintain-app\`" .claude/skills/what-can-i-do/SKILL.md && echo "OK menu item"
grep -q "On a \*\*GO\*\*, name the after-ship step too: \*\*\`maintain-app\`\*\*" .claude/skills/ship-check/SKILL.md && echo "OK ship-check after-GO"
grep -q "maintain → the \`maintain-app\` skill" .claude/skills/advise-project/SKILL.md && echo "OK advise chain"
grep -q "^- \*\*\`maintain-app\`\*\*" CLAUDE.md && echo "OK CLAUDE skill bullet"
grep -q "outputs/maintenance/. — .maintain-app. scheduled health reports" CLAUDE.md && echo "OK CLAUDE outputs pointer"
test -f outputs/maintenance/.gitkeep && echo "OK gitkeep"
LINES=$(wc -l < CLAUDE.md); test "$LINES" -le 150 && echo "OK CLAUDE.md $LINES <= 150"
```
Expected: seven `OK` lines (the last shows the line count).

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/what-can-i-do/SKILL.md .claude/skills/ship-check/SKILL.md .claude/skills/advise-project/SKILL.md CLAUDE.md outputs/maintenance/.gitkeep
git commit -m "feat(maintain-app): wire visibility — what-can-i-do menu + ship-check after-GO + advise-project chain + CLAUDE.md bullet + outputs/maintenance/.gitkeep"
```

---

### Task 5: Roadmap + user/system docs (`README` + `PATH-TO-PRODUCTION` rung 7 + `USING` + `SCHEDULING` + master spec)

**Files:**
- Modify: `README.md` (guide row + build-status Phase 24 line)
- Modify: `docs/PATH-TO-PRODUCTION.md` (add rung 7)
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md` (a "then keep it healthy" paragraph)
- Modify: `docs/SCHEDULING.md` (the second, app-maintenance schedule)
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` (Phase 24 addendum)

- [ ] **Step 1: README guide row.** In `README.md` find:

OLD:
```
| [Polish your app](docs/POLISH.md) | Real content, UX states, legal pages, docs, and optional payments — make it launch-ready. |
| [Path to production](docs/PATH-TO-PRODUCTION.md) | The ordered map from prototype to a shippable product. |
```
NEW:
```
| [Polish your app](docs/POLISH.md) | Real content, UX states, legal pages, docs, and optional payments — make it launch-ready. |
| [Keep your app healthy](docs/MAINTAIN-APP.md) | Scheduled, report-first maintenance for a shipped app — safe fixes only, you pull the trigger. |
| [Path to production](docs/PATH-TO-PRODUCTION.md) | The ordered map from prototype to a shippable product. |
```

- [ ] **Step 2: README build-status line.** In `README.md` find:

OLD:
```
- Phase 23 — `polish`: a build-* pass over the built `app/` — real content, onboarding/empty/error/loading states, legal templates (privacy/terms/consent), user docs, and an opt-in graceful-off Stripe scaffold — closing rung 6, the final path-to-production rung ✅
```
NEW:
```
- Phase 23 — `polish`: a build-* pass over the built `app/` — real content, onboarding/empty/error/loading states, legal templates (privacy/terms/consent), user docs, and an opt-in graceful-off Stripe scaffold — closing rung 6, the final path-to-production rung ✅
- Phase 24 — `maintain-app`: a report-first scheduled "operate & maintain" loop (path-to-production rung 7) for a shipped `app/` — re-runs the quality signals into one health report in `outputs/maintenance/`, delegates dependency patching to Dependabot (7-day cooldown), opens gated SAFE-PRs only, and a real sentinel-scoped guard hook makes merge/deploy/publish/keys impossible for the loop (roast RESHAPE + verified storm) ✅
```

- [ ] **Step 3: `PATH-TO-PRODUCTION` — add rung 7 (appended after rung 6, in order).** In `docs/PATH-TO-PRODUCTION.md` find (rung 6's full block):

OLD:
```
6. **Make it legitimate — polish & compliance — `polish`** *(shipped, Phase 23 — the final rung).*
   A `polish` skill modifies the built `app/` across areas — real content/copy (assets flagged), onboarding +
   empty/error/loading states, **legal templates** (privacy policy, terms, cookie consent — *not legal
   advice*; presence, not a compliance claim), user docs, and an **opt-in graceful-off Stripe payments
   scaffold** (never enters keys or charges — you own the keyed go-live). A `build-*` sibling (attended, one
   confirm gate, `layer: polish` provenance) that closes the `content`/`legal` gaps `ship-check` flags. See
   `docs/POLISH.md`.
```
NEW:
```
6. **Make it legitimate — polish & compliance — `polish`** *(shipped, Phase 23 — the final build rung).*
   A `polish` skill modifies the built `app/` across areas — real content/copy (assets flagged), onboarding +
   empty/error/loading states, **legal templates** (privacy policy, terms, cookie consent — *not legal
   advice*; presence, not a compliance claim), user docs, and an **opt-in graceful-off Stripe payments
   scaffold** (never enters keys or charges — you own the keyed go-live). A `build-*` sibling (attended, one
   confirm gate, `layer: polish` provenance) that closes the `content`/`legal` gaps `ship-check` flags. See
   `docs/POLISH.md`.

7. **Operate & maintain — `maintain-app`** *(shipped, Phase 24).*
   A **report-first** scheduled loop that keeps a shipped `app/` healthy: it re-runs the quality signals
   (`npm audit` / `test-app` / `audit-app`) into **one plain-language health report**, **delegates**
   dependency/CVE patching to Dependabot/Renovate behind a **~7-day cooldown** (surfaced, never auto-bumped),
   and opens a gated **SAFE-PR** only for a narrow reversible fix class (never a dependency bump) — the PR is
   the exception, not the deliverable. It **never merges, deploys, publishes, or enters keys** — a real
   sentinel-scoped `PreToolUse` guard hook enforces that boundary. Hybrid scaffold (a local Routine sandbox +
   a keyed CI workflow that ships inert). Attended setup, one confirm gate; it runs on **its own schedule —
   never inside `maintenance-loop`, and deliberately not in `autopilot`** (like `deploy`/`polish`/`build-mcp`).
   Vetted 2026-07-03 (`roast` RESHAPE + a citation-verified `storm-research` —
   `outputs/vetting/2026-07-03-maintain-app/`). See `docs/MAINTAIN-APP.md`.
```

- [ ] **Step 4: `USING` — the "then keep it healthy" paragraph.** In `docs/USING-THIS-FOR-ANY-PROJECT.md` find:

OLD:
```
**Then make it legitimate:** run **`polish`** — it turns your themed prototype into a launch-ready product: real content replacing the placeholders, onboarding + empty/error/loading states, legal pages (privacy policy, terms, cookie consent — as **templates a lawyer should review**, not legal advice), user docs, and an optional Stripe payments scaffold that **never touches your keys or charges anything** (you do the go-live). It's the sixth and final rung of the path to production. See `docs/POLISH.md`.
```
NEW:
```
**Then make it legitimate:** run **`polish`** — it turns your themed prototype into a launch-ready product: real content replacing the placeholders, onboarding + empty/error/loading states, legal pages (privacy policy, terms, cookie consent — as **templates a lawyer should review**, not legal advice), user docs, and an optional Stripe payments scaffold that **never touches your keys or charges anything** (you do the go-live). It's the sixth and final build rung of the path to production. See `docs/POLISH.md`.

**Then keep it healthy:** run **`maintain-app`** — it sets up a scheduled, **report-first** health check for your shipped app: it re-runs your security/accessibility/performance audit and tests into **one plain-language report** (is it still safe, still working, what's the one next thing), **delegates** dependency updates to Dependabot with a 7-day cooldown, and opens a **safe** pull request only for small, reversible fixes. It **never merges, deploys, or enters keys** — a built-in guard makes that impossible; you pull that trigger. It runs on its own schedule (never in the maintenance loop or autopilot). This is the seventh rung — operating what you shipped. See `docs/MAINTAIN-APP.md`.
```

- [ ] **Step 5: `SCHEDULING` — the second schedule.** In `docs/SCHEDULING.md` find:

OLD:
```
This is a template that gets cloned. A baked-in Routine would be bound to one account and
one environment, so it wouldn't travel. Instead the repo ships the portable `maintenance-loop`
tick and this doc, and `setup-project` offers to register the Routine in *your* environment
on an explicit yes. That keeps the clone generic and puts you in control of the one
side-effectful, account-bound step.
```
NEW:
```
This is a template that gets cloned. A baked-in Routine would be bound to one account and
one environment, so it wouldn't travel. Instead the repo ships the portable `maintenance-loop`
tick and this doc, and `setup-project` offers to register the Routine in *your* environment
on an explicit yes. That keeps the clone generic and puts you in control of the one
side-effectful, account-bound step.

## A second, separate schedule: `maintain-app`

Once you've shipped an app, **`maintain-app`** (path-to-production rung 7) runs on **its own schedule**,
distinct from the knowledge-base `maintenance-loop` above. Its setup offers to register a *separate* weekly
Routine (prompt: *"Run the maintain-app skill for one scheduled tick."*) for the offline **sandbox** tier, and
scaffolds a keyed **GitHub Actions** workflow for the real, laptop-independent home (inert until you add the
`ANTHROPIC_API_KEY` secret). Keep the two schedules separate: `maintenance-loop` maintains the *knowledge
base*; `maintain-app` maintains the *shipped app* (report-first, propose-only, never merging or deploying).
See `docs/MAINTAIN-APP.md`.
```

- [ ] **Step 6: Master-spec Phase 24 addendum.** In `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` find (the final line of the Phase 23 addendum):

OLD:
```
 Full design: `docs/superpowers/specs/2026-07-02-polish-design.md`; how-to: `docs/POLISH.md`.
```
NEW:
```
 Full design: `docs/superpowers/specs/2026-07-02-polish-design.md`; how-to: `docs/POLISH.md`.

## Phase 24 addendum — `maintain-app` (operate & maintain — path-to-production rung 7) (2026-07-03)

Phase 24 adds a new `maintain-app` skill — the "operate & maintain" tier and **rung 7** of `docs/PATH-TO-PRODUCTION.md` — the first rung that runs *after* launch, keeping a shipped `app/` healthy on a schedule. It was brainstormed to "auto-patch to a gated PR" + loop-engineering strategies, then **reshaped by `roast` (RESHAPE, high) and a citation-verified `storm-research`** (`outputs/vetting/2026-07-03-maintain-app/`; 22 sources, 0 fabricated / 8 corrected / 7 demoted) into a **report-first** design: the deliverable is ONE plain-language health report (the Renovate *Dependency Dashboard* pattern), a SAFE-PR is the rare exception, and dependency/CVE patching is **delegated to Dependabot/Renovate** behind a **~7-day `min-release-age` cooldown** (surfaced + explained, **never auto-bumped** — "green tests" is not a supply-chain safety proof: the Axios Mar-2026 + Shai-Hulud Sep-2025 attacks arrived as green-CI-passing bumps). Each tick: write the sentinel → cheap "did anything change?" trigger (no-op ticks suppressed) → reused collectors (`deps`=npm-audit/Dependabot enumerate-only, `tests`=test-app, `audit`=audit-app, `codex-review`=opt-in) → three-bucket triage (SAFE-PR / REVIEW [all deps here] / ASK, `improve-system`'s model) → SAFE-PR onto a new branch with **verify-or-demote** (test-app + audit-app gates green → open PR / offline stage the branch; not green → revert + demote) each carrying a mandatory "what I did NOT verify" block → ONE `outputs/maintenance/<date>-<slug>/REPORT.md` with a non-technical "healthy / one thing to do / bring a developer" degradation. **Propose-only/outputs-only** (PRs are proposals; `improve-system` stays the single applier; no `raw/` mutation, no `change-log.md` line). The hardest requirement — **never merge/deploy/publish/enter-keys** — is enforced by a **real, sentinel-scoped `PreToolUse` guard hook** (`hooks/guard.mjs`, registered in `.claude/settings.json` at setup, no-op unless `outputs/runs/maintain-app.lock` is present + fresh, stale-lock-safe), not a prompt. **Hybrid scaffold**: a local Routine (offline sandbox — stages branches + reports) + a keyed GitHub Actions workflow (the real home — opens PRs; inert until the `ANTHROPIC_API_KEY` secret is added) — the CI workflow, the `.github/dependabot.yml` cooldown config, and the settings-hook registration ship as **templates inside `SKILL.md`** that setup scaffolds into the *user's clone* (the template commits none active; `guard.mjs` ships inert), matching how `deploy` handles its workflow and keeping the template ship-clean. Config = `{app_dir:"app", cadence:"weekly", signals:["deps","tests","audit"], safe_pr_classes:["lint","format","mechanical-a11y","dead-code","doc-drift"], safe_pr_min_precision:0.9, dependency_cooldown_days:7, max_safe_prs_per_tick:3, caution_severity:"CRITICAL"}`. **Attended setup, one confirm gate; runs on its OWN schedule — NEVER inside `maintenance-loop`** (which maintains the KB) **and deliberately NOT an `autopilot` phase** (like `deploy`/`polish`/`build-mcp`); its `## Autonomous invocation` note documents that placement. **NO new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched; reuses `implementer` for SAFE-PRs + `audit-app`/`test-app`/`codex-review` as collectors). The **48-hour validation gate** (a hand-run tick on a real shipped app, judged by a technical + a non-technical reader) is a documented precondition to trusting it. `improve-system` / `maintenance-loop` / `autopilot` / the `build-*` / `test-app` / `audit-app` / `deploy` / `ship-check` / `polish` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `ship-check` + `advise-project` + docs). Web-first (mobile/plugin maintenance later). Full design: `docs/superpowers/specs/2026-07-03-maintain-app-design.md`; how-to: `docs/MAINTAIN-APP.md`.
```

- [ ] **Step 7: Definition-of-Done checks** — run (each must print `OK`):

```bash
grep -q "\[Keep your app healthy\](docs/MAINTAIN-APP.md)" README.md && echo "OK readme guide row"
grep -q "Phase 24 — \`maintain-app\`" README.md && echo "OK readme build-status"
grep -q "7. \*\*Operate & maintain — \`maintain-app\`\*\*" docs/PATH-TO-PRODUCTION.md && echo "OK roadmap rung 7"
grep -q "Then keep it healthy:" docs/USING-THIS-FOR-ANY-PROJECT.md && echo "OK using paragraph"
grep -q "A second, separate schedule: \`maintain-app\`" docs/SCHEDULING.md && echo "OK scheduling second-schedule"
grep -q "Phase 24 addendum — \`maintain-app\`" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo "OK master spec addendum"
```
Expected: six `OK` lines.

- [ ] **Step 8: Commit**

```bash
git add README.md docs/PATH-TO-PRODUCTION.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/SCHEDULING.md docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(maintain-app): README + PATH-TO-PRODUCTION rung 7 + USING + SCHEDULING second-schedule + master-spec Phase 24 addendum"
```

---

### Task 6: Final whole-branch verification (no-pollution + untouched invariants)

**Files:** none created/modified (verification only; if a check fails, fix in the owning task's files and amend that task's commit).

- [ ] **Step 1: No-pollution — the template must ship clean.** Run:

```bash
! git ls-files | grep -qE '^app/' && echo "OK no app/ committed" || echo "POLLUTION app/"
! git ls-files | grep -qE '^\.github/workflows/' && echo "OK no workflow committed" || echo "POLLUTION workflow"
! git ls-files | grep -qE '^\.github/dependabot|^renovate\.json' && echo "OK no dependabot/renovate committed" || echo "POLLUTION dependabot"
! git ls-files | grep -qE '^\.claude/settings\.json$' && echo "OK no active settings.json committed" || echo "POLLUTION settings.json"
! git ls-files | grep -qE '^outputs/maintenance/[0-9]' && echo "OK no dated maintenance report" || echo "POLLUTION maintenance report"
! git ls-files | grep -qE '^outputs/runs/maintain-app' && echo "OK no run-state/lock committed" || echo "POLLUTION run-state"
test -f outputs/maintenance/.gitkeep && echo "OK maintenance gitkeep present"
```
Expected: `OK no app/ committed`, `OK no workflow committed`, `OK no dependabot/renovate committed`, `OK no active settings.json committed`, `OK no dated maintenance report`, `OK no run-state/lock committed`, `OK maintenance gitkeep present`.

- [ ] **Step 2: maintain-app not-in-autopilot / not-in-loop + no new agent + untouched invariants.** Run:

```bash
git diff --name-only main..HEAD | grep -E 'skills/autopilot/|docs/AUTOPILOT.md|docs/SUBAGENTS.md|^\.claude/agents/' && echo "UNEXPECTED — autopilot/agent file changed" || echo "OK autopilot+agents untouched"
git diff --name-only main..HEAD | grep -E 'skills/(improve-system|maintenance-loop|codex-review|build-app|build-mobile|build-plugin|build-backend|build-mcp|test-app|audit-app|deploy|polish|define-project|define-design|roast|storm-research|sync-claude-sessions|sync-ecosystem-data|sync-curated-content|sync-metrics)/' && echo "UNEXPECTED — an invariant skill changed" || echo "OK invariant skills untouched"
grep -q "NEVER inside \`maintenance-loop\`" .claude/skills/maintain-app/SKILL.md && grep -q "NOT driven by \`autopilot\`" .claude/skills/maintain-app/SKILL.md && echo "OK placement invariants stated in SKILL"
```
Expected: `OK autopilot+agents untouched`, `OK invariant skills untouched`, `OK placement invariants stated in SKILL`.

- [ ] **Step 3: CLAUDE.md line cap.** Run:

```bash
LINES=$(wc -l < CLAUDE.md); test "$LINES" -le 150 && echo "OK CLAUDE.md $LINES <= 150" || echo "OVER CAP: $LINES"
```
Expected: `OK CLAUDE.md <n> <= 150`.

- [ ] **Step 4: The full intended file set — confirm the diff is exactly these.** Run:

```bash
git diff --name-only main..HEAD | sort
```
Expected (exactly, in some order — 16 paths: the 4 new maintain-app files + 9 modified files + the `.gitkeep` + the spec + this plan):
```
.claude/skills/advise-project/SKILL.md
.claude/skills/maintain-app/SKILL.md
.claude/skills/maintain-app/config.json
.claude/skills/maintain-app/hooks/guard.mjs
.claude/skills/ship-check/SKILL.md
.claude/skills/what-can-i-do/SKILL.md
CLAUDE.md
README.md
docs/MAINTAIN-APP.md
docs/PATH-TO-PRODUCTION.md
docs/SCHEDULING.md
docs/USING-THIS-FOR-ANY-PROJECT.md
docs/superpowers/plans/2026-07-03-maintain-app.md
docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
docs/superpowers/specs/2026-07-03-maintain-app-design.md
outputs/maintenance/.gitkeep
```
(That is 16 paths = the 13 named targets + the spec + this plan + the `.gitkeep`. No `app/`, no `.github/`, no `.claude/settings.json`, no `outputs/maintenance/<date>`, no `outputs/runs/maintain-app*`, no `autopilot`, no `docs/SUBAGENTS.md`, no `.claude/agents/`.)

- [ ] **Step 5: Report the verification results** to the controller (no commit). If everything passed, the branch is ready for the tuned `code-reviewer` + Codex `codex review --base main` gate, then `finishing-a-development-branch`. **Author only — never register the Routine, enable the workflow, add a key, or run `maintain-app` for real against the template.**
