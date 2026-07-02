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
   - **Missing →** there is nothing to ship-check yet. **Route, don't run:** report the trivial verdict —
     *not ready, no app built* — and point the user to `build-app` (*"There's no app to ship-check yet — build
     one first with `build-app`, then come back."*). Do **not** run `build-app` yourself: propose-only means
     ship-check *routes* you to a rung, it never runs one for you. Stop gracefully.
     *(If a `plugin/` or `mobile/` exists here instead, say so plainly: these production tiers cover the
     web `app/` only today — mobile and browser-extension have their own later-phase tiers, so there's
     nothing to ship-check for them yet — don't steer a plugin/mobile builder to build a web app.)*
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

- **`build`** (← `build-app`) — `app/package.json` declares a real `build` script and `app/src/` is a real app
  (not the empty template shell). A `dist/` output is a **generated** artifact — not committed, and this skill
  never builds — so its absence is **expected and not a finding**; confirming a clean production build is the
  offered `npm run build` (offer-don't-run). Pass → ✅. No `build` script / empty shell → **CRITICAL** (nothing
  to ship). *(Rare — Phase 0 routes an absent `app/` to `build-app`.)*
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
