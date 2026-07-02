# audit-app — "prove it's safe" (path-to-production rung 3) — design

## Context

**What prompted this.** The user is walking `docs/PATH-TO-PRODUCTION.md` rung by rung. Rung 1 (real data) shipped
as `build-backend` (Phase 18); rung 2 (testing) shipped as `test-app` (Phase 19). **Rung 3 is the audit tier**
— the user's instruction: *"Let's do it"* (the audit). A tested app can still be insecure, inaccessible, or
slow; this phase adds the skill that checks for those.

**What the roadmap committed to.** `docs/PATH-TO-PRODUCTION.md` rung 3 reads: *"A `security-audit` skill
(dependency + secret scanning, authorization / input-validation / injection review, an OWASP-style checklist →
a findings report in `outputs/`, mirroring `codex-review`'s pattern), with accessibility (WCAG) and
performance (Lighthouse) audit siblings."* This spec honors that — the **"mirroring `codex-review`'s pattern"**
clause is load-bearing (propose-only, outputs-only, graceful-off).

**The two forks the user resolved (brainstorming):**
1. **Scope → one `audit-app` skill with three lenses** (security + accessibility + performance) producing ONE
   prioritized report. The three lenses share the same shape (read → checklist → findings → report), so one
   skill avoids ~3× duplication and gives the user one answer to "is my app safe / accessible / fast?" — the
   roadmap's "skill + two siblings" is satisfied by three lenses in one skill, exactly as `test-app` unified
   three test levels. (Rejected: three sibling skills = heavy duplication + 3× wiring; security-only = leaves
   the rung incomplete.)
2. **Autopilot → opt-in, default OFF** (`audit_after_build`, default `false`), mirroring `test_after_build`
   and `wire_backend_after_build`.

**The defining trait (and the key difference from every prior phase).** `audit-app` is **propose-only**, per
the roadmap's "mirroring `codex-review`". It writes **only** a findings report to `outputs/` — it **never
modifies the app, never auto-fixes a finding, and never writes the `raw/builds` / `wiki/build.md` /
`change-log` provenance spine** that the `build-*` family and `test-app` use. It is the `codex-review` /
`advise-project` shape (advisory, outputs-only), not the `build-*` shape. A direct consequence: **it has no
confirm gate** — because it changes nothing, there is nothing to confirm. It reads and reports, like
`codex-review`.

**Intended outcome.** A new on-demand `audit-app` skill that gives any built `app/` a prioritized
security/accessibility/performance findings report — reasoning-first and fully offline, with tool-assisted
deepening (`npm audit`, Lighthouse, axe) *offered, never run*; propose-only (writes only to `outputs/`);
plus opt-in/default-off autopilot integration and the roadmap/docs wiring. All **author-only** — the template
ships clean, never with a real audit report.

---

## Design

### The skill: `audit-app` (`.claude/skills/audit-app/{SKILL.md,config.json}`)

The **"prove it's safe"** step. `build-app` builds it, `build-backend` makes its data real, `test-app` proves
it works — this skill checks it's **safe, accessible, and fast**. It reads the built `app/` + charter and
produces one prioritized findings report across three lenses, **mirroring `codex-review`**: propose-only,
outputs-only, graceful-off, severity-tagged.

**When to use.** "audit my app", "is my app safe / secure", "security review / check for vulnerabilities",
"check accessibility / is it accessible", "is my app fast / check performance", `/audit-app`. Also offered by
`what-can-i-do` and pointed to by `advise-project` as a next step after a build. It **requires a built `app/`**.

**Propose-only, no confirm gate.** Unlike the `build-*` family (which write app source and gate on one
confirm), `audit-app` changes nothing — it reads and writes a report. So there is **no confirm gate** and **no
interview**; it runs like `codex-review`. The only pre-flight interaction is routing to `build-app` if there
is no app to audit.

**Inputs it reads (all offline, no keys):**
- The built **`app/`** — `package.json` (deps → the dependency lens; scripts), `src/` (JSX → the a11y lens;
  app code → the injection/authz/XSS review), `src/index.css` (the design-system tokens → contrast
  computation), `src/data/store/` + auth if `build-backend` ran (→ deeper authz / RLS review), the Vite
  config, and any `.env.example` (flag a committed real `.env`).
- **`wiki/charter.md`** — `## Audience & users` (a broad/public audience raises the WCAG bar; an internal tool
  lowers it) and any data-sensitivity / compliance constraints. **Missing →** audit with default assumptions
  and flag it.
- **`wiki/build.md`** + the latest `raw/builds/` record — what exists and whether a backend is wired.
- **Autonomous mode only:** the confirmed `outputs/autopilot/<date>-<slug>/plan.md`.

**Configuration (`config.json`, all default; never block on absence):**
- `app_dir` (default `"app"`) — the built app to audit.
- `dimensions` (default `["security","accessibility","performance"]`) — the enabled lenses (a user can narrow
  to one, e.g. `["security"]`).
- `caution_severity` (default `"CRITICAL"`) — the threshold at/above which a finding is surfaced **prominently**
  (in the autopilot ledger/hand-over when chained). **No cap on the number of findings** — a safety audit must
  never hide an issue behind a limit.

**Severity scale (the `codex-review` canon):** **CRITICAL > MAJOR > MINOR > INFO.** Every finding is tagged
with a severity + its dimension + a `file:line` location (where applicable) + why it matters + a concrete
remediation.

**Procedure (codex-review-shaped: no interview, no confirm gate; runs and reports):**

- **Phase 0 — Pre-flight (require the app; read it; route, don't guess).**
  - A built `app/` is **required**. Missing → offer `build-app` first (*"An audit checks an app you've already
    built. Want me to build the app first, then audit it?"*); on yes run `build-app` then continue, on no stop
    gracefully (nothing to audit).
  - Read the app + charter + latest `raw/builds/` record; detect a backend-wired app (a `src/data/store/` or
    `app/supabase/` present → run the deeper authz/RLS security checks). Read `config.dimensions` for which
    lenses to run.

- **Phase 1 — Run the enabled lenses (reasoning-first, offline).**
  - **Security** — (a) **dependency review**: read `package.json` deps, flag outdated/risky patterns, and
    **offer** `npm audit` for the live advisory DB (offer-don't-run — needs `npm install`); (b) **secret
    scan**: offline regex over the app for hardcoded keys/tokens/passwords, and flag any real committed `.env`
    (vs the `.env.example` template); (c) **code review**: authorization (auth guards present? Supabase RLS
    correct — shared-read/authenticated-write, not anon-writable? any client-only "protection"?),
    input-validation / injection, XSS (`dangerouslySetInnerHTML`, unsanitized HTML), insecure config; (d) an
    **OWASP-style checklist** scoped to a Vite + React + Supabase app (injection, broken auth, sensitive-data
    exposure, security misconfig, XSS, vulnerable components, etc.).
  - **Accessibility (WCAG)** — static JSX review: images without `alt`, inputs without labels, controls
    without accessible names, heading order, semantic HTML vs `div` soup, aria misuse, keyboard/focus
    reachability, and **color contrast computed from the design-system tokens in `src/index.css`** against
    WCAG AA. The charter's audience sets the bar. **Offer** axe / Lighthouse-a11y for the dynamic parts
    (offer-don't-run — needs a running app + browser).
  - **Performance** — static review: heavy/duplicate deps, missing code-splitting/lazy-loading, large
    unoptimized images/assets, obvious re-render or blocking-resource risks; explicitly **name what only a
    runtime pass can measure** (LCP / CLS / TBT / bundle size). **Offer** `npm run build` + Lighthouse against
    the preview build (offer-don't-run — needs install + a headless browser).

- **Phase 2 — Prioritize & write the report.** Write
  **`outputs/audits/<YYYY-MM-DD>-<slug>/AUDIT.md`** (RAG frontmatter — `title` / `source_id:
  outputs:audit:<date>-<slug>` / `max_severity` / per-dimension `counts` / `updated`), then a summary header
  and, per dimension, the findings (each: severity, `file:line`, the issue, why it matters, a concrete
  remediation). End with a **"Tool-assisted deepening"** section: the exact `npm audit` / `npm run build` +
  Lighthouse / axe commands to run for the live checks, marked *offered, not run*. State plainly that a static
  audit is real but **not** a substitute for a full pen-test / live scan, and name what only the tool runs can
  surface.

- **Phase 3 — Hand over (propose-only; offer-don't-fix, offer-don't-run).** Point the user at the report and
  summarize (per-dimension counts + `max_severity` + the top findings). **Never auto-fix** any finding
  (propose-only — a fix is a separate, user-picked, attended action). **Offer** the tool-assisted checks and —
  exactly as `test-app` / `build-app` do — run one only on an **explicit yes** (e.g. `cd app && npm install &&
  npm audit`), **never** the Lighthouse browser download unprompted. Nothing runs unprompted; nothing is
  fixed without the user choosing it.

**Re-running.** Each run writes a **new** dated report under `outputs/audits/`; nothing is overwritten. A
re-run after fixes simply produces a fresh report the user can diff against the prior one.

**Provenance — outputs-only (the `codex-review` invariant, NOT the `build-*` spine).** `audit-app` writes
**only** inside `outputs/`: the `outputs/audits/<date>-<slug>/AUDIT.md` report and `outputs/runs/audit-app.json`
run-state (`last_run`, `last_scope`). It writes **no** `raw/builds/` record, **no** `wiki/build.md` section,
**no** `wiki/` index page, and **no** `outputs/change-log.md` line — because it is a *proposal*, not an
applied change. `improve-system` stays the single applier and the single `change-log.md` writer, exactly as
with `codex-review` and `advise-project`.

**Rules & guardrails.**
- **Propose-only — writes only inside `outputs/`.** Never modifies the app, never auto-fixes a finding, never
  writes `raw/` / `wiki/` / `change-log.md`. (Stronger than the `build-*` family; the `codex-review` shape.)
- **Offline, no keys.** The audit reasons offline; tool-assisted checks (`npm audit` / Lighthouse / axe) need
  `npm install` / a browser and are **offer-don't-run** — run only on an explicit yes, never the browser
  download unprompted.
- **Honest about what it is.** A real, useful static audit — **not** a full pen-test, live CVE scan, or
  runtime a11y/perf measurement. Every report names what only the offered tool runs can find.
- **On-demand + autopilot-opt-in; NOT in `maintenance-loop` (this phase).** Because it is propose-only a
  future phase *could* add a loop hook (as `codex-review` has); that is deferred, not built here.
- **Requires a built `app/`; web-only (v1).** Auditing `mobile/` / `plugin/` is a later phase.

**`## Autonomous invocation (driven by `autopilot`)` note (additive).** When `autopilot` drives it, read the
charter + built `app/` + the confirmed `plan.md`, run the lenses **offline (reasoning only — do not run
`npm audit` / Lighthouse / `npm install`)**, write the `outputs/audits/<date>-<slug>/AUDIT.md` report, and
**surface any finding at/above `caution_severity` (CRITICAL by default) — plus the report path — to
`autopilot` for its decision ledger / hand-over.** It fixes nothing and applies nothing (propose-only holds).
This note is additive — the on-demand behavior above is unchanged; `autopilot` is user-initiated and never
part of the unattended `maintenance-loop`.

### No new fleet agent

Unlike `test-app` (which added `test-writer`), this phase adds **no** subagent. The three lenses run in the
skill's own reasoning; where a focused deep-read helps, the skill **may** delegate a lens to the existing
read-only `code-reviewer` fleet agent or the built-in `Explore` agent, but adds none. The roadmap does not call for a fleet agent here,
and audits are read-only reasoning that the existing read-only fleet already covers. (`docs/SUBAGENTS.md` is
therefore **not** modified.)

### Autopilot integration (opt-in, default OFF)

Add an optional **audit phase** to `autopilot`, gated on config **`audit_after_build`** (default `false`),
mirroring `test_after_build`. When enabled — **and only if `web` is among the selected targets** (it audits
the web `app/`; **skipped + logged otherwise**, exactly as the `test` / `backend` tails guard) — after
`build-<target>` (+ any `wire_backend_after_build` + `test_after_build`) and before the Phase D hand-over,
`autopilot` runs `audit-app` **offline** (reasoning only — no tool runs, no install), writes the report, and
adds the report path + **any finding at/above `caution_severity` (CRITICAL by default)** to the decision
ledger and hand-over. Autopilot stays **Tier 0**, **user-initiated**, and **never in `maintenance-loop`**.
Default off, consistent with the backend + test tails; the natural chained order is
**build → (backend) → test → audit → advise**. Also add "audit → `audit-app`" to `autopilot`'s **Phase E
deferred-tiers list** (its own "what's next" enumeration), so it stays in sync with `advise-project`'s
next-step clause.

### Not changed

`improve-system` (single applier), `maintenance-loop`, `codex-review`, `build-app/mobile/plugin/backend` and
`test-app` SKILL.md (untouched — this ADDS a sibling; visibility is wired via `what-can-i-do` +
`advise-project` + docs, exactly as `build-backend`/`test-app` did), `define-*`, `roast`, `storm-research`,
`docs/SUBAGENTS.md` (no new agent), `raw/` immutability. Autopilot's existing phases are unchanged (the audit
phase is additive and off by default).

## Safety / reconciliation

- **Propose-only; nothing applied, nothing fixed, nothing outside `outputs/`.** The strongest safety posture
  of any phase so far — it cannot break the app because it never touches it. `improve-system` stays the single
  applier.
- **Offline / no keys; offer-don't-run for tools.** The reasoning audit needs nothing; `npm audit` / Lighthouse
  / axe are offered and run only on an explicit yes, never the browser download unprompted.
- **No confirm gate is correct here** (not an omission): a read-only, change-nothing skill has nothing to
  confirm — same as `codex-review`.
- **Not in the unattended loop.** On-demand + autopilot-opt-in only this phase; a loop hook is deferred.
- **Author-only — never run for real against the template.** No real `outputs/audits/<date>-*` report
  committed; the template ships clean (skill + config + docs + wiring + `outputs/audits/.gitkeep` only).

## Critical files

- **Create (shipped):** `.claude/skills/audit-app/SKILL.md` + `config.json`; `docs/AUDIT-APP.md`;
  `outputs/audits/.gitkeep`; `docs/superpowers/specs/2026-07-01-audit-app-design.md` (this spec).
- **Modify (shipped, light/additive):** `.claude/skills/autopilot/{SKILL.md,config.json}` (opt-in audit phase
  as a **web-gated Phase C tail** + `audit_after_build:false` + name `audit-app` in the Phase E deferred-tiers
  list); `.claude/skills/what-can-i-do/SKILL.md` (menu item); `.claude/skills/advise-project/SKILL.md` (extend
  the post-build deferred-tier clause to name `audit-app` — additive); `CLAUDE.md` (skill bullet +
  `outputs/audits/` pointer, hold < 125 lines); `README.md` (build-status Phase 20 line + guide row);
  `docs/PATH-TO-PRODUCTION.md` (mark rung 3 shipped — **note the name resolution:** the roadmap's
  `security-audit` + a11y/perf siblings → one `audit-app` skill with three lenses, matching how rungs 1–2 were
  reconciled); `docs/USING-THIS-FOR-ANY-PROJECT.md` (an audit rung/clause); `docs/AUTOPILOT.md` (the optional
  audit-phase note); `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` (Phase 20 addendum).
- **NOT modified:** `docs/SUBAGENTS.md` (no new agent); `codex-review` and the `build-*`/`test-app` SKILLs.
- **Reuse (reference, do not modify):** `.claude/skills/codex-review/SKILL.md` (the propose-only /
  outputs-only / severity-normalization / graceful-off pattern this mirrors), `.claude/skills/test-app/SKILL.md`
  (the offer-don't-run + require-a-built-`app/` + `## Autonomous invocation` shape), `.claude/skills/build-app/
  SKILL.md` (the run-only-on-explicit-yes precedent), `.claude/skills/advise-project/SKILL.md` (the
  propose-only outputs-only invariant list).

## Verification

Authoring task (skill / docs / wiring) → DoD via `grep`/`wc`/`git`, plus (documented, NOT run against the
template) a manual smoke of a generated report:
- **Skill present & shaped:** `audit-app/SKILL.md` has the three lenses + the propose-only / no-confirm-gate
  statement + the `## Autonomous invocation` note + the offer-don't-run + severity scale; `config.json` has
  the three keys (`app_dir`, `dimensions`, `caution_severity`) with the stated defaults.
- **Propose-only / outputs-only is explicit:** SKILL.md states it writes ONLY to `outputs/audits/` +
  `outputs/runs/audit-app.json`, never modifies the app, never auto-fixes, never writes `raw/` / `wiki/` /
  `change-log.md` (grep the wording); `improve-system` stays the single applier.
- **Offer-don't-run + no-keys:** SKILL.md forbids running `npm audit` / Lighthouse / `npm install` / the
  browser download unprompted; runs a tool only on an explicit yes.
- **Autopilot audit phase opt-in/off:** `autopilot/config.json` has `audit_after_build:false`; the SKILL.md
  audit phase is opt-in / offline / web-only; autopilot stays Tier 0 / never in `maintenance-loop` (grep those
  invariants intact).
- **No new agent:** `git diff --name-only main..HEAD` does **not** include `docs/SUBAGENTS.md` or any
  `.claude/agents/` file.
- **Untouched invariants (expect empty):** `git diff --name-only main..HEAD` for `improve-system`,
  `maintenance-loop`, `codex-review`, `build-app/mobile/plugin/backend`, `test-app`, `define-*`, `roast`,
  `storm-research`, `raw`.
- **No pollution:** no real `outputs/audits/<date>-*` report committed; only intended files in the diff;
  `CLAUDE.md` < 125 lines.
- **Roadmap updated:** `docs/PATH-TO-PRODUCTION.md` rung 3 marked shipped (Phase 20), matching rungs 1–2's
  format.

## Execution (after approval)

The project's standard pipeline, **dogfooding the tuned fleet** (as in Phases 16–19): this spec →
`spec-reviewer` → user review → `writing-plans` → `plan-reviewer` → subagent build with `implementer`s
(per-task, verbatim transcription + grep/git DoD + per-task commits) → `code-reviewer` + Codex
`codex review --base main` → `finishing-a-development-branch`. Branch: `phase-20-audit-app`. **Author only —
never run `audit-app`/`autopilot` for real against the template.**
