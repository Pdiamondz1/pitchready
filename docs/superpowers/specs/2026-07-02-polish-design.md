# polish — design spec (Phase 23, path-to-production rung 6 — the final rung)

**Status:** approved design, ready for planning
**Branch:** `phase-23-polish`
**Author arc:** define → vet → design → build → test → audit → ship → **polish**

## Context

The template carries a project from idea → vetted → designed → built → tested → audited → deploy-scaffolded →
readiness-gated (`ship-check`, rung 5). But the built app is still a **themed prototype**: exploration
confirms `build-app` produces placeholder/mock content and generic labels — **no real charter-derived copy,
no empty/error/loading states, no onboarding** — and that **nothing legal/privacy/Stripe exists anywhere** in
the template. `ship-check`'s `content` and `legal` checks *flag* these gaps but build nothing.

`polish` is **rung 6** of `docs/PATH-TO-PRODUCTION.md`: **make it legitimate — polish & compliance.** It is
the skill that **closes** the gaps `ship-check` names — turning a themed prototype into a launch-ready product
(real copy, complete UX states, legal pages, optional payments, user docs). It completes the ladder:
**define → vet → design → build → test → audit → ship → polish.**

## Intended outcome

A new **`polish`** skill (`.claude/skills/polish/{SKILL.md,config.json}`) — an attended `build-*` sibling that
**modifies the built `app/`** across configurable **areas** — plus the light wiring/docs a new skill needs.
After a polish pass, a re-run of `ship-check` can flip `content`/`legal` to ✅.

**Decisions (with the user):** one consolidated `polish` skill (the recommended shape — a cohesive "make it
legitimate" pass, mirroring how `audit-app` consolidated its lenses); the **Stripe payments scaffold is
included as an opt-in, default-off area**; the skill is **not in `autopilot`** (attended-only, like
`deploy`/`ship-check`). Separately, at the user's request this phase **raises the CLAUDE.md line cap
125 → 150** (a one-line edit to the file's own "Maintaining this file" policy — kept self-contained, no
section offloaded to a sub-file) so the skills list has durable room for this and future phases.

## Shape — a `build-*` sibling (it modifies the app)

Unlike the propose-only `audit-app`/`ship-check`, `polish` **modifies the built `app/`**, so it takes the
**`build-*` shape** (like `build-app`/`build-backend`/`deploy`):

- **Attended, one confirm gate** (Phase 2), mirroring `build-app`.
- **Writes the build provenance spine:** `raw/builds/<date>-<slug>.md` tagged **`layer: polish`** (append-only,
  `-2` for same-day re-runs) + a `## Polish` section in `wiki/build.md` + one `outputs/change-log.md`
  `applied` line. `improve-system` stays the single applier; `raw/` stays append-only. *(This is the `build-*`
  provenance shape — it applies a real change, unlike the propose-only `audit-app`/`ship-check`.)*
- **Requires a built `app/`** (routes to `build-app` if absent). **Web `app/` only (v1)** — polishing
  `mobile/` / `plugin/` is a later phase.
- **Offline; no keys.** Everything is scaffolded offline; the one keyed step (payments go-live) stays the
  human's.

## The areas — `config.areas` (+ opt-in `payments`)

Each area is a focused pass over `app/`. `config.areas` defaults to the four offline areas; `payments` is a
fifth area that runs **only when `config.include_payments` is true** (or the user names `payments` in the
invocation argument):

1. **`content`** — replace `build-app`'s placeholder/mock copy + generic labels with **real, charter-derived
   copy** (headlines, descriptions, CTAs, microcopy) in the design-system **Voice** (`wiki/design-system.md`).
   Real assets where derivable; where it cannot create real brand photos/logos it scaffolds **flagged
   placeholders** and lists them for the user to replace — **honest; never claims assets it can't make.**
   → closes `ship-check`'s `content` gap.
2. **`states`** — add the missing UX states across pages/components: **onboarding / first-run**, **empty**
   (no-data-yet), **error**, and **loading** states. Uses the existing mock/graceful data patterns; no backend
   needed.
3. **`legal`** — scaffold a **privacy policy + terms of service + a cookie-consent banner** as **TEMPLATES**
   (pages/routes + a consent component) with `[PLACEHOLDER]` fields (company, contact, jurisdiction, data
   collected) **and a prominent, unremovable notice: "⚠️ This is a starting template, not legal advice — have
   a qualified lawyer review it before you rely on it; it does not by itself make you GDPR/CCPA compliant."**
   It scaffolds **structure + a fill-in/verify-with-counsel checklist**; it **never claims the app IS
   compliant** (compliance is a legal determination the human + counsel make). → closes `ship-check`'s `legal`
   gap (presence), while being honest that presence ≠ compliance.
4. **`docs`** — generate real user-facing docs from the charter + what's built: a real `app/README.md`
   (replacing `build-app`'s placeholder note) + a short "how to use it" user guide.
5. **`payments`** (opt-in; `include_payments`, default **false**) — a **graceful-off Stripe scaffold**
   mirroring `build-backend`'s `SupabaseStore` + `deploy`'s Sentry: `app/src/lib/payments.ts` + a
   pricing/checkout UI that **dynamic-`import()`s `@stripe/stripe-js` only when
   `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` is present**, and renders an inert **"payments not
   configured"** state without it (the app never breaks). Env-template slots (publishable key client-side; the
   **`STRIPE_SECRET_KEY` marked server-only, never in the client bundle**) with fill-in comments, never
   values. A **`outputs/polish/<date>-<slug>/GO-LIVE.md`** keyed-go-live checklist (create a Stripe account,
   add products/prices, paste the publishable key, put the secret + a checkout-session endpoint **server-side**
   — pointing to `build-backend`'s Supabase edge function — test in Stripe test mode). **NEVER enters keys,
   NEVER creates an account, NEVER charges** — financial transactions are a prohibited action; the human does
   the keyed go-live. The scaffold does the **client half** honestly and **documents the server half** in the
   checklist (a real Stripe charge needs a server for the secret key).

The set is configurable via `config.areas` + `config.include_payments`; a named-area invocation argument runs
just that area.

## Runtime (mirrors `build-app` Phase 0–5; one confirm gate)

- **Phase 0 — Pre-flight.** Read `config.app_dir` / `areas` / `include_payments`; require a built `app/`
  (missing → offer `build-app`, then continue on yes or stop gracefully on no); read `wiki/charter.md` (the
  content source — brand/audience/purpose → real copy; audience + data-collected → the legal bar),
  `wiki/design-system.md` (Voice → microcopy), `wiki/build.md` + the latest `raw/builds/` (what exists). Honor
  a named-area argument else `config.areas` (+ `payments` if `include_payments`).
- **Phase 1 — Derive the polish plan.** Per enabled area, list what changes (which files get real copy, which
  pages get states, which legal pages/consent, which docs, whether payments).
- **Phase 2 — Confirm once.** Show the plan in one message (areas + what each does) with the **safety notes
  surfaced**: legal = templates, not legal advice; payments (if on) = graceful-off, you own the keyed go-live.
  Ask one question; on "tweak", revise and show again.
- **Phase 3 — Apply (offline; no keys; nothing charged/deployed).** Make the edits per area. Payments:
  scaffold graceful-off + env-template slots; never a key.
- **Phase 4 — Record (provenance).** `raw/builds/<date>-<slug>.md` tagged `layer: polish` + a `## Polish`
  section in `wiki/build.md` + one `change-log.md` `applied` line.
- **Phase 5 — Hand over (offer-don't-run).** Summarize what changed; flag placeholder assets to replace; if
  payments included, point to `outputs/polish/<date>-<slug>/GO-LIVE.md` (never enter keys); suggest re-running
  `ship-check` to confirm `content`/`legal` now pass.
- **Re-running:** a new dated `raw/builds/` record; incremental and **never clobbers** a user's real
  content/legal edits — diff + confirm before overwriting an existing file.

## `## Autonomous invocation` note — documents the exclusion (like `deploy`)

A short note stating **`polish` is deliberately NOT driven by `autopilot`** — "make it legitimate" involves
brand/content, legal, and (if enabled) financial decisions that are inherently the user's, not a hands-off
step. There is **no autonomous procedure and no `autopilot` config flag**; `autopilot`'s SKILL.md +
config.json stay **untouched**.

## Configuration

`.claude/skills/polish/config.json` (all values default; never block on absence):

```json
{
  "app_dir": "app",
  "areas": ["content", "states", "legal", "docs"],
  "include_payments": false
}
```

- `app_dir` (default `"app"`) — the built web app to polish.
- `areas` (default the four offline areas) — the enabled polish passes.
- `include_payments` (default `false`) — opt-in: append the graceful-off Stripe payments scaffold.

## Wiring (light / additive; the CLAUDE.md cap is now 150 — see Context — so the budget is comfortable)

- **`CLAUDE.md`** — the cap-note edit (Context) + one skill bullet (after the `ship-check` bullet) + one
  `outputs/polish/` pointer (after `outputs/ship-check/`). ~120 → ~123 (well under the 150 cap).
- **`.claude/skills/what-can-i-do/SKILL.md`** — one menu item.
- **`README.md`** — a Phase 23 build-status row + a `[Polish your app](docs/POLISH.md)` guide-table row.
- **`docs/PATH-TO-PRODUCTION.md`** — mark rung 6 **shipped (Phase 23)** (align wording to the as-built skill).
- **`docs/POLISH.md`** — a new user guide.
- **`docs/USING-THIS-FOR-ANY-PROJECT.md`** — a "then make it legitimate" paragraph after the ship-check para.
- **`docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`** — a Phase 23 addendum.
- **`outputs/polish/.gitkeep`** — follow the empty-dir convention.

## No new fleet agent

Like `deploy`/`audit-app`/`ship-check`, `polish` reasons/authors in-skill (may delegate to the read-only
`doc-writer` or the scoped `implementer`, adds none) — no new `.claude/agents/` entry; `docs/SUBAGENTS.md`
untouched.

## Not changed

`autopilot` (SKILL.md **and** config.json — untouched), `maintenance-loop`, `improve-system` (single applier),
`build-app`/`build-mobile`/`build-plugin`, `build-backend`, `test-app`, `audit-app`, `deploy`, `sync-metrics`,
`ship-check`, `define-*`, `roast`, `storm-research`, `codex-review`, `raw/` immutability, the `.claude/agents/`
fleet.

## Safety / reconciliation

- **Legal = templates, not legal advice; never claims compliance.** Prominent unremovable not-legal-advice
  notice; scaffolds structure + a fill-in/verify-with-counsel checklist; GDPR/CCPA named as a legal
  determination, not something the scaffold achieves.
- **Payments never touch money or keys.** Graceful-off scaffold + `GO-LIVE.md` only; never enters keys, never
  creates an account, never charges (financial transactions are a prohibited action). Opt-in, default off.
  The secret key is **server-only**, never in the client bundle.
- **Assets = honest placeholders, flagged** — never claims real brand assets it can't create.
- **Attended, one confirm gate; never in `maintenance-loop`; deliberately not in `autopilot`** (documented
  exclusion; no autopilot file touched).
- **Modifies only `app/` + writes its own provenance;** `raw/` immutable (append-only `raw/builds/`);
  `improve-system` stays the single applier.
- **Author-only — never run `polish` for real against the template.** No real `app/` edits,
  `outputs/polish/<date>-*`, `raw/builds/`, or `wiki/build.md` committed; the template ships clean (skill +
  config + docs + `.gitkeep` + light wiring only).
- **`CLAUDE.md` < 150 lines** (cap raised from 125 this phase).

## Verification (DoD)

Authoring task → DoD via `grep`/`wc`/`git`, plus a documented (NOT run) reasoned dry-run:

- **Skill present & shaped:** `polish/SKILL.md` has Phase 0–5 + the five areas (content/states/legal/docs +
  opt-in payments) + one confirm gate; `config.json` has `app_dir` / `areas` / `include_payments`.
- **`build-*` provenance (not propose-only):** SKILL.md writes `raw/builds/` `layer: polish` + `wiki/build.md`
  `## Polish` + one `change-log.md` `applied` line.
- **Safety wording present:** legal = "not legal advice" + never-claims-compliance; payments = graceful-off
  dynamic-`import()` + "never enters keys" / "never charges" + opt-in default-off + secret server-only;
  assets = flagged-placeholders.
- **Not in autopilot:** `git diff --name-only main..HEAD` shows **neither** `.claude/skills/autopilot/SKILL.md`
  **nor** `.claude/skills/autopilot/config.json`; `polish`'s `## Autonomous invocation` note documents the
  exclusion.
- **Untouched invariants (expect empty diff):** `improve-system`, `maintenance-loop`, `autopilot`,
  `build-app`/`build-mobile`/`build-plugin`, `build-backend`, `test-app`, `audit-app`, `deploy`, `ship-check`,
  `define-*`, `roast`, `storm-research`, `raw`, `.claude/agents`, `docs/SUBAGENTS.md`, `docs/AUTOPILOT.md`.
- **No pollution:** no real `app/`, no `outputs/polish/<date>-*` (only `.gitkeep`), no `raw/builds/` /
  `wiki/build.md` committed; only intended files in the diff; `CLAUDE.md` < 150.
- **Roadmap doc:** `docs/PATH-TO-PRODUCTION.md` marks rung 6 shipped (the ladder is complete).

## Execution

Standard pipeline, dogfooding the tuned fleet: commit this spec → tuned `spec-reviewer` → user review →
`writing-plans` → tuned `plan-reviewer` → subagent build with tuned `implementer`s (per-task, verbatim
transcription + `grep`/`git` DoD + per-task commits) → tuned `code-reviewer` + Codex `codex review --base
main` → `finishing-a-development-branch`. Branch: `phase-23-polish`. **Author only — never run `polish` for
real against the template.** If a DoD grep fails but the file is a faithful transcription of the plan, report
a DoD-grep mismatch — do not mangle wording/casing to force the grep (the Phase 21 catch).
