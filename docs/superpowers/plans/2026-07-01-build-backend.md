# build-backend (Phase 18) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended)
> or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship a new attended `build-backend` skill that upgrades the already-built, mock-data web `app/`
into a real-data, backend-ready app (Supabase schema + a graceful-off pluggable data layer + auth + tests +
a go-live checklist), scaffolded fully offline/hands-off with one human go-live step; plus a captured
`docs/PATH-TO-PRODUCTION.md` roadmap and light additive wiring (incl. an opt-in, default-off autopilot
backend-wire).

**Architecture:** Authoring task (Claude Code skill Markdown + one JSON config + docs). New skill mirrors
`build-app`'s Phase 0–5 + `## Autonomous invocation` shape. The generated data layer mirrors the console's
pluggable store (`aios/server/kb/store.ts`): `DataStore` interface + `MockStore` | `SupabaseStore` +
`getActiveStore()` graceful-off fallback. Keys never in chat; the human owns go-live.

**Tech Stack:** Markdown/JSON authoring (no runtime code, no test suite here). Verification via `grep`/`wc`/
`git` DoD checks. The *generated* app (documented, not built against this template) uses Vite/React/TS +
`@supabase/supabase-js` + `@tanstack/react-query` + Vitest + Playwright.

**Branch:** all work on `phase-18-build-backend` (already created off `main`; the spec is committed there).
Task 8's `git diff main..HEAD` checks depend on it — do not commit on `main`.

**Source of truth:** `docs/superpowers/specs/2026-07-01-build-backend-design.md`.

**Discipline (every task):** Author ONLY the files each task names. **Never** touch `improve-system`,
`maintenance-loop`, the `build-app`/`build-mobile`/`build-plugin` SKILL.md files, `define-*`, `roast`,
`storm-research`, or `raw/`. The `advise-project` edit is a single additive clause (no deletions). Autopilot
edits are additive (new config key + a Phase C tail + a Configuration bullet); Phases A/B/D/E untouched.
**Never run `build-backend`/`autopilot` for real** — author only; the template ships clean.

---

### Task 1: Scaffolding — `outputs/backend/.gitkeep` + `build-backend/config.json`

**Files:**
- Create: `outputs/backend/.gitkeep`
- Create: `.claude/skills/build-backend/config.json`

- [ ] **Step 1: Create `outputs/backend/.gitkeep`** — empty file (ships the folder; the real
  `outputs/backend/<date>-<slug>/` run folders are runtime-only).

- [ ] **Step 2: Create `.claude/skills/build-backend/config.json`** with EXACTLY:

```json
{
  "app_dir": "app",
  "provider": "supabase",
  "include_auth": true,
  "max_entities": 12
}
```

- [ ] **Step 3: Verify DoD**
```bash
test -f outputs/backend/.gitkeep && echo GITKEEP_OK
node -e "const c=require('./.claude/skills/build-backend/config.json'); if(c.app_dir==='app'&&c.provider==='supabase'&&c.include_auth===true&&c.max_entities===12) console.log('CONFIG_OK'); else process.exit(1)"
```
Expect: GITKEEP_OK CONFIG_OK.

- [ ] **Step 4: Commit**
```bash
git add outputs/backend/.gitkeep .claude/skills/build-backend/config.json
git commit -m "feat(build-backend): config.json + outputs/backend/ scaffolding"
```

---

### Task 2: The roadmap — `docs/PATH-TO-PRODUCTION.md`

**Files:**
- Create: `docs/PATH-TO-PRODUCTION.md`

- [ ] **Step 1: Create `docs/PATH-TO-PRODUCTION.md`** with EXACTLY this content:

````markdown
# The path to production

This template takes you from an idea to a **themed, working front-end prototype with mock data** (the
`define → vet → design → build → advise` arc, all **Tier 0** — no keys, offline). That's a prototype, not a
finished product. This page is the honest, ordered map of what stands between that prototype and a
**fully-tested, fully-audited, ready-for-production** product — and how the template grows to cover it.

Each rung is a future skill in the template's own idiom: a skill that writes provenance to `raw/`, a report
to `outputs/`, optionally an autopilot step, keys-in-env (never in chat), graceful-off, and **attended for
anything irreversible**. The safety-sensitive rungs (keys, deploy, payments, publish) always stay
**scaffold + checklist + guide** — the template prepares everything, but *you* do the actual key entry and
go-live. That boundary is deliberate and permanent.

## The rungs (in order)

1. **Real data & identity — `build-backend`** *(shipped, Phase 18 — the biggest jump).*
   Turn the mock-data app into a real, backend-ready app: a Supabase schema derived from your data, a
   graceful-off data layer (runs on mock with no keys; uses the real backend the moment keys are present),
   sign-in/auth, and a go-live checklist. Scaffolds hands-off; you do the one go-live step. See
   `docs/BUILD-BACKEND.md`.

2. **Prove it works — testing.**
   A `test-app` skill: generate unit + integration + end-to-end (Playwright) tests against your app *and*
   the charter's success criteria, produce a runnable suite + coverage, and wire it into the subagent fleet.
   A prototype has no tests; a product does.

3. **Prove it's safe — audit.**
   A `security-audit` skill (dependency + secret scanning, authorization / input-validation / injection
   review, an OWASP-style checklist → a findings report in `outputs/`, mirroring `codex-review`'s pattern),
   with **accessibility (WCAG)** and **performance (Lighthouse)** audit siblings.

4. **Ship it — deploy & operate.**
   A `deploy` skill: a hosting target + CI/CD + env/secrets management as **scaffold + guided checklist**
   (you pull the go-live trigger), plus **observability** — error tracking, logging, and real analytics that
   *feed* `raw/metrics/`, closing the loop with `advise-project` (which today consumes metrics nothing
   produces).

5. **The go/no-go gate — `ship-check`.**
   A production-readiness skill that runs the whole gauntlet — tests green? security clean? a11y/perf
   thresholds met? deploy config present? legal present? real content? — and returns a **GO / NOT-YET**
   verdict naming the exact blocking gaps. It's the production analog of `roast`'s idea gate. The arc
   becomes **define → vet → design → build → test → audit → ship → advise**.

6. **Make it legitimate — polish & compliance.**
   Real content/copy/assets (no more placeholder text), onboarding, empty/error/loading states;
   legal/privacy (privacy policy, terms, cookie consent, GDPR/CCPA); optional payments (a Stripe scaffold);
   and user docs.

## The rule that never changes

The template never enters your API keys, never charges your card, and never publishes or deploys on your
behalf. For every rung above, it does all the preparation it safely can **unattended**, then hands you a
short, well-marked checklist for the one step that must be yours. That's what keeps "hands-off" and "safe"
true at the same time.
````

- [ ] **Step 2: Verify DoD**
```bash
grep -q "The path to production" docs/PATH-TO-PRODUCTION.md && echo TITLE_OK
grep -q "build-backend" docs/PATH-TO-PRODUCTION.md && grep -q "ship-check" docs/PATH-TO-PRODUCTION.md && grep -q "The rule that never changes" docs/PATH-TO-PRODUCTION.md && echo RUNGS_OK
```
Expect: TITLE_OK RUNGS_OK.

- [ ] **Step 3: Commit**
```bash
git add docs/PATH-TO-PRODUCTION.md
git commit -m "docs(build-backend): capture the path-to-production roadmap"
```

---

### Task 3: The core skill — `.claude/skills/build-backend/SKILL.md`

**Files:**
- Create: `.claude/skills/build-backend/SKILL.md`

- [ ] **Step 1: Create `.claude/skills/build-backend/SKILL.md`** with EXACTLY this content (transcribe
  verbatim):

````markdown
---
name: build-backend
description: Use when someone asks to "add a backend", "add real data", "add a database", "add sign-in / login / accounts", "make the data real", "wire up Supabase", "make it save data", or says "/build-backend". Upgrades the already-built mock-data web app in app/ into a real-data, backend-ready app — a Supabase schema (from your data) + a graceful-off data layer + email sign-in + tests + a go-live checklist. Reads wiki/charter.md and the app's own src/data/ fixtures; one confirm gate; scaffolds fully OFFLINE (no keys). The app keeps running on mock data until you paste two keys and run the migration — the one step it never does for you. Tier 1 (real data) but the scaffold is key-free. Attended-only — never runs in the maintenance loop. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to use your charter + app, or name the entities to wire]"
---

# build-backend

The "make it real" step. `build-app` gives a non-technical user a themed, working web app in `app/` — but
its data is **placeholder** (a `src/data/` folder of typed arrays). This skill upgrades that same app into a
**real-data, backend-ready** app: a real database schema derived from their own data, a data layer that
talks to a real backend, sign-in, and tests — without making them write any of it.

What it produces (all **offline, no keys**): a Supabase migration (`app/supabase/migrations/0001_init.sql`),
a **graceful-off data layer** in `app/src/data/store/`, email auth, an `app/.env.example` with the two
empty key slots, tests, and a **go-live checklist** at `outputs/backend/<date>-<slug>/GO-LIVE.md`. The
**one** thing it never does — by design — is enter keys or run the migration: the user creates a Supabase
project, pastes two keys into `app/.env`, and runs the migration themselves (a ~5-minute step). **Until they
do, the app keeps running on mock data** — the graceful-off layer means the scaffold never breaks the app.

## When to use

When the user says "add a backend / real data / a database / sign-in", "make the data real / save data",
"wire up Supabase", or `/build-backend`. Also offered by `what-can-i-do` and pointed to by `advise-project`
as the next step after a build. It **requires an already-built `app/`** (from `build-app`). It is
**attended** — one confirm gate before wiring — and **never runs in the unattended `maintenance-loop`**.

## Configuration

Read `.claude/skills/build-backend/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the built web app to upgrade.
- `provider` (default `"supabase"`) — the backend. Supabase first; the key leaves room for others later.
- `include_auth` (default `true`) — scaffold email sign-in (inert until keys are present).
- `max_entities` (default `12`) — the cap on tables wired in one pass (the runaway-scope guard).

## Procedure

### Phase 0 — Pre-flight (require the app; read the data; route, don't guess)

1. **A built `app/` (required).** There is nothing to wire without it.
   - **Missing →** offer `build-app` first: *"A backend upgrades an app you've already built. Want me to
     build the app first (a quick, themed front-end), then wire the backend into it?"* On yes, run
     `build-app`, then continue. On no, stop gracefully (nothing to upgrade).
   - Read the app's **`src/data/` fixtures** — the typed arrays + `getX()`/`listX()` accessors. **These are
     the source of truth for the data shapes** (the columns and the seed).
2. **Charter — `wiki/charter.md` (recommended).** Read `## Scope` / `## Audience` for **which** entities
   matter, their **relationships**, and any per-user ownership intent (→ RLS). The charter informs
   *relationships and RLS intent*, **not** column types (those come from the fixtures, so schema ⟷ seed ⟷
   pages can never diverge). Missing → infer relationships from the fixtures and flag `(assumed)`.
3. **Existing backend (`app/supabase/` or `app/src/data/store/`) →** switch to **incremental mode** (see
   *Re-running*).

### Phase 1 — Derive the data model

From the `src/data/` fixtures, derive one **entity** per fixture module: its table name, **columns typed
from the fixture's TypeScript shape** (string→text, number→numeric/int, boolean→bool, Date/ISO→timestamptz,
arrays/objects→jsonb; an `id` field → primary key), and **foreign keys** from the charter's relationships
(or inferred `<entity>_id` fields in the fixtures). Cap at `config.max_entities`; if the app has more,
wire the **core** entities and list the rest under `Later (not in this pass)`.

**RLS (row-level security) — the default is shared-read / authenticated-write.** Enable RLS on every table
with: `SELECT` allowed to everyone (so the mock-derived **seed rows stay visible** — no empty screens after
go-live), and `INSERT`/`UPDATE`/`DELETE` allowed only to authenticated users (so it is never anon-writable).
*(Owner-scoped private RLS — `auth.uid() = owner_id` — is a later refinement for data with genuine per-user
ownership; v1 defaults to shared-read so seed-from-mock is coherent. Note it in the go-live checklist as an
option.)*

### Phase 2 — Confirm once, then wire

Show the plan in **one message** and ask **one** question. Include:
- the entity/table list — one line each (columns + relationships),
- what will be generated: the migration, the graceful-off data layer, sign-in, `.env.example`, tests, and
  the go-live checklist,
- the **RLS default** (shared-read / authenticated-write) in plain words,
- the key promise: **it stays graceful-off** — *"your app keeps working on its sample data with no keys; it
  switches to the real database automatically the moment you add your two keys,"*
- that nothing here needs a key and nothing is installed or deployed.

Ask: *"Wire this backend into your app? I'll scaffold everything offline — then hand you a short checklist
for the one step that's yours (create the database, paste two keys, run the migration).
(yes / tweak something)"* On "tweak", revise and show again. **No per-table interrogation.**

### Phase 3 — Scaffold the backend (offline; no keys)

Build **in-session, in order** — all offline, no network, no keys:

1. **Migration → `app/supabase/migrations/0001_init.sql`.** For each entity: `create table`, columns typed
   from the fixtures, primary/foreign keys, `alter table … enable row level security`, and the two RLS
   policies (public `SELECT`; authenticated `INSERT`/`UPDATE`/`DELETE`). Then **seed** each table with
   `insert` rows **derived directly from the `src/data/` mock arrays** (the fixtures become the seed — zero
   data invented).
2. **Graceful-off data layer → `app/src/data/store/`** (mirrors `aios/server/kb/store.ts`):
   - `types.ts` — a `DataStore` interface (`listX()` / `getX(id)` / `createX()` / `updateX()` / `deleteX()`
     per entity, all `Promise`-returning).
   - `mockStore.ts` — `MockStore` implementing `DataStore` over the existing `src/data/` fixtures (works
     with **zero keys**, fully offline).
   - `supabaseStore.ts` — `SupabaseStore` implementing `DataStore` via Supabase. It **dynamically
     `import()`s `@supabase/supabase-js` only when env is present** (as `aios/server/kb/store.ts` does), so
     the mock/no-keys bundle never loads it — "inert unless env present" is *structurally* guaranteed.
   - `index.ts` — `getActiveStore()`: if `import.meta.env.VITE_SUPABASE_URL` **and**
     `VITE_SUPABASE_ANON_KEY` are both present, return `SupabaseStore`; else **fall back to `MockStore`**.
3. **Page rewire (minimal).** Pages call `store.listX()` / `store.getX()` (async) via
   `@tanstack/react-query` instead of importing the mock getters directly. Add a `QueryClientProvider` wrap
   in `app/src/main.tsx`. Do not touch routing or the theme.
4. **Auth → sign-in/up page + session context + protected routes** (Supabase email auth). **Inert without
   keys** — with no keys the app still runs and auth simply isn't enforced (the `MockStore` path needs no
   session), so the scaffold never breaks Tier 0.
5. **Env template → `app/.env.example`** with the two empty slots + fill-in comments (never in chat):
   ```
   # Paste these from your Supabase project (Settings → API) into app/.env (gitignored):
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
   Ensure `app/.gitignore` covers `.env`.
6. **Dependencies → `app/package.json`.** Add `@supabase/supabase-js` + `@tanstack/react-query` (runtime)
   and `vitest` + `@playwright/test` (dev). No other stack drift.
7. **Tests.** Vitest for the data layer (the `getActiveStore()` fallback returns `MockStore` with no env;
   the store CRUD contract) + the auth guard; a Playwright E2E smoke that the app renders on mock data.
   Runnable `npm test`.

### Phase 4 — Record it (provenance)

The **code** lives in `app/` (a build target outside the knowledge folders, like `aios/`). The **record**
lands in the knowledge base:
- **`raw/builds/<YYYY-MM-DD>-<slug>.md`** *(immutable, append-only; `-2` for same-day re-runs)* — RAG
  frontmatter, then: the entity/table list, the columns typed from fixtures, the RLS model, the seed
  source, the deps added, and anything deferred. **Tag it `layer: backend`** (in the frontmatter `tags` and
  a `layer:` line) so it's distinct from the front-end build record.
- **`wiki/build.md`** — add a **`## Backend (Supabase)`** section (preserving the existing Web/Mobile/
  Browser-extension sections): the entity list, where the store + migration live, the graceful-off note,
  and a link to the `raw/builds/` record + the go-live checklist. Cross-link from `wiki/index.md` if not
  already.
- **`outputs/change-log.md`** — append one attributed line (newest-at-top):
  `- <YYYY-MM-DD> — build-backend — wired Supabase backend (schema + store + auth) into app/ from src/data/ + wiki/charter.md — applied`

`improve-system` stays the single applier — this skill only writes its own `applied` line, exactly as the
other `build-*` skills do.

### Phase 5 — Hand over the go-live checklist (offer-don't-run)

Write the go-live steps to **`outputs/backend/<YYYY-MM-DD>-<slug>/GO-LIVE.md`** (RAG frontmatter + the
steps), then close in plain words. **Never** run the migration, `npm install`, or deploy, and **never**
ask for or enter a key. The checklist says exactly:

> 1. Create a free Supabase project at supabase.com (it gives you a project URL + an anon key).
> 2. In the `app/` folder, copy `.env.example` to `.env` and paste your two values into
>    `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. (`app/.env` is gitignored — your keys stay local.)
> 3. Run the migration: paste `app/supabase/migrations/0001_init.sql` into the Supabase SQL editor (or
>    `supabase db push` if you use the CLI). This creates your tables and loads the sample rows.
> 4. Start the app (`cd app && npm install && npm run dev`). It now reads and writes your real database;
>    sign-in is live.
>
> *Until you do step 2, the app keeps running on its sample data — nothing is broken.* *(Optional: for
> private per-user data, switch the shared-read policy to owner-scoped RLS — see the note in the build
> record.)*

Close: *"Your app is now backend-ready. Everything's scaffolded — the only thing left is yours: create the
database and paste two keys, following `outputs/backend/<date>-<slug>/GO-LIVE.md`. Want me to walk you
through it?"* (Walk-through = explain the steps; still never enter the keys.)

## Re-running (incremental, never clobber)

If `app/supabase/` or `app/src/data/store/` already exists, switch to **incremental mode**: read the
existing store + latest `raw/builds/` backend record, diff the current fixtures/charter against what's
wired, and at the confirm gate offer: **add entities**, **re-derive the schema**, or **both**. Write **new**
files freely; for any **existing** file, show a diff and **confirm before overwriting**. Each re-run writes
a **new** `raw/builds/` record and a new dated migration (`0002_*.sql`, never rewrite `0001`). Never clobber
a user's `app/.env`.

## Rules & guardrails

- **Keys never in chat; the human owns go-live.** This skill writes only empty `.env` slots + the go-live
  checklist. It **never** asks for, stores, or enters a key, and **never** runs the migration, `npm
  install`, or a deploy. That is a permanent boundary.
- **Graceful-off = no broken app.** With no keys the app runs on `MockStore` (its sample data); with both
  `VITE_SUPABASE_*` present it uses the real backend automatically. A scaffold can never hand back a broken
  app.
- **Attended-only — never in `maintenance-loop`.** It writes project source and is built around the one
  confirm gate; the unattended tick never runs it.
- **`improve-system` stays the single applier; `raw/` is immutable.** It writes its own provenance
  (`raw/builds/` record + `wiki/build.md` section + one `change-log.md` line); code lives in `app/`.
- **Tier 1 (real data), key-free scaffold.** The capability is real data, but the scaffold needs no keys
  and runs offline; the keyed step is the human's go-live.
- **Web `app/` only (v1).** Wiring backends for `mobile/` / `plugin/` is a later phase (same `src/data/`
  swap point).

## Output

An upgraded `app/` (a Supabase migration + a graceful-off data layer + email auth + tests + `.env.example`),
an immutable `raw/builds/<date>-<slug>.md` record tagged `layer: backend`, a new `## Backend (Supabase)`
section in `wiki/build.md`, one `change-log.md` line, and `outputs/backend/<date>-<slug>/GO-LIVE.md` — with
the app still running on mock data until the user does the one go-live step.

## Autonomous invocation (driven by `autopilot`)

When invoked by `autopilot` rather than a human, read `wiki/charter.md` + the built `app/` (its `src/data/`
fixtures) + the confirmed `outputs/autopilot/<date>-<slug>/plan.md`, and **skip your Phase 2 confirm gate**
— `autopilot`'s single plan-confirm already covered it. Scaffold **offline in graceful-off mode** (no keys —
the app ships backend-ready but running on mock data until the human does go-live); do **not** run the
migration, `npm install`, or deploy, and never collect a key. Flag any `(assumed — confirm later)` choice
(inferred relationships, RLS intent) to `autopilot` for its decision ledger, write your `raw/builds/` record
+ `wiki/build.md` section + `change-log.md` line as usual, and surface the `outputs/backend/<date>-<slug>/
GO-LIVE.md` path for `autopilot`'s hand-over. This note is additive — your attended behavior above is
unchanged; `autopilot` is user-initiated and never part of the unattended `maintenance-loop` (that rule is
untouched).
````

- [ ] **Step 2: Verify DoD**
```bash
grep -q "^name: build-backend" .claude/skills/build-backend/SKILL.md && echo NAME_OK
for h in "### Phase 0" "### Phase 1" "### Phase 2" "### Phase 3" "### Phase 4" "### Phase 5" "## Autonomous invocation" "## Re-running" "## Rules & guardrails"; do grep -q "$h" .claude/skills/build-backend/SKILL.md || { echo "MISSING: $h"; exit 1; }; done; echo SECTIONS_OK
grep -q "getActiveStore" .claude/skills/build-backend/SKILL.md && grep -q "MockStore" .claude/skills/build-backend/SKILL.md && grep -q "falls back to" .claude/skills/build-backend/SKILL.md && echo GRACEFUL_OK
grep -q "Keys never in chat" .claude/skills/build-backend/SKILL.md && grep -qi "never.*run the migration" .claude/skills/build-backend/SKILL.md && echo KEYS_OK
grep -q "never runs in the unattended" .claude/skills/build-backend/SKILL.md && echo LOOP_OK
```
Expect: NAME_OK SECTIONS_OK GRACEFUL_OK KEYS_OK LOOP_OK.

- [ ] **Step 3: Commit**
```bash
git add .claude/skills/build-backend/SKILL.md
git commit -m "feat(build-backend): the core skill — Supabase schema + graceful-off store + auth + go-live checklist"
```

---

### Task 4: The user doc — `docs/BUILD-BACKEND.md`

**Files:**
- Create: `docs/BUILD-BACKEND.md`

- [ ] **Step 1: Create `docs/BUILD-BACKEND.md`** with EXACTLY this content:

````markdown
# build-backend — make your app's data real

`build-app` gives you a themed, working web app in `app/` — but the data is **placeholder** (sample rows
baked into the code). `build-backend` upgrades that same app into a **real-data, backend-ready** app: a real
database, sign-in, and everything wired — so the app actually saves and loads data.

Say **"add a backend"**, **"add real data / sign-in"**, **"make it save data"**, or **`/build-backend`**.

## What it does

It reads your app's own sample data and your charter, then scaffolds — **fully offline, with no keys**:

- **A database schema** (a Supabase migration) with a table per kind of thing in your app, and your sample
  rows loaded as starting data.
- **A data layer that's "graceful-off"** — your app keeps working on its sample data with no setup, and
  switches to the real database **automatically** the moment you add your keys. You can never end up with a
  broken app because you haven't finished setup.
- **Sign-in** (email accounts) — ready, and switched on once your database is live.
- **Tests** and an `.env` template with the two empty slots to fill.

## The one step that's yours: go-live

A real database needs an account and keys that only you can create — so the template **never** enters keys
or publishes for you. When it's done scaffolding, it hands you a short checklist
(`outputs/backend/<date>-<slug>/GO-LIVE.md`):

1. Create a free Supabase project (you get a URL + a key).
2. Paste the two values into `app/.env` (they stay on your machine — that file is gitignored).
3. Run the one migration (paste the SQL into Supabase, or use the CLI).
4. Start the app — it now uses your real database.

Until you do step 2, the app keeps running on its sample data. Nothing breaks; you flip it to real whenever
you're ready.

## What it is (and isn't) yet

- **Is:** a real, backend-ready app — schema, data layer, sign-in, tests — that goes live with a 5-minute,
  well-marked step.
- **Backend:** Supabase (a free, hosted Postgres). Web app (`app/`) first; phone/extension backends come
  later.
- **Isn't yet:** deployment/hosting, realtime, file uploads, or payments — those are later rungs on
  `docs/PATH-TO-PRODUCTION.md`.

## Safety

Keys live only in `app/.env` (gitignored) — never in chat, never committed. The scaffold is attended (it
asks once before wiring) and **never runs in the unattended maintenance loop**. Your keys, your go-live —
always.
````

- [ ] **Step 2: Verify DoD**
```bash
grep -q "make your app's data real" docs/BUILD-BACKEND.md && grep -q "graceful-off" docs/BUILD-BACKEND.md && grep -qi "the one step that's yours" docs/BUILD-BACKEND.md && echo DOC_OK
```
Expect: DOC_OK.

- [ ] **Step 3: Commit**
```bash
git add docs/BUILD-BACKEND.md
git commit -m "docs(build-backend): user-facing how-to"
```

---

### Task 5: Autopilot backend-wire (opt-in, default OFF)

**Files:**
- Modify: `.claude/skills/autopilot/config.json`
- Modify: `.claude/skills/autopilot/SKILL.md`

- [ ] **Step 1: `config.json` — add the flag.** Replace:

```
  "advise_after_build": true
}
```

with:

```
  "advise_after_build": true,
  "wire_backend_after_build": false
}
```

- [ ] **Step 2: `SKILL.md` Configuration — add the bullet.** After the `advise_after_build` bullet
  (`- \`advise_after_build\` (default \`true\`) — run the Phase E post-build advise pass (propose-only) at
  the end of a run.`), add:

```
- `wire_backend_after_build` (default `false`) — opt-in: after the web build, run `build-backend` (offline, graceful-off) to make the app backend-ready; the go-live step stays the user's. Off by default.
```

- [ ] **Step 3: `SKILL.md` Phase C — add the opt-in backend-wire tail.** In `### Phase C — Hands-off build`,
  after list item **2** (`**`build-<target>` (autonomous) — once per selected target**` … `a failed target
  does not stop the others.`) and before `### Phase D — Hand it over`, add this new list item:

```
3. **`build-backend` (autonomous) — OPTIONAL, only if `config.wire_backend_after_build` is true AND `web`
   is among the selected targets** (it wires only the web `app/`; skipped + logged otherwise). Runs as a
   **tail of Phase C** (after `build-<target>`, before the Phase D hand-over) so the hand-over includes the
   go-live checklist and the Phase E advise sees the backend-ready app. It scaffolds the Supabase schema +
   graceful-off data layer + auth **offline (no keys)** so the app stays runnable on mock data; it does NOT
   run the migration/`npm install`/deploy and never collects a key. Log the step + the
   `outputs/backend/<date>-<slug>/GO-LIVE.md` path to `run.md`. **Default off** — autopilot stays Tier 0
   (it never touches a key) and this changes the app's shape (adds sign-in), so it's opt-in.
```

- [ ] **Step 4: Verify DoD**
```bash
node -e "const c=require('./.claude/skills/autopilot/config.json'); if(c.wire_backend_after_build===false) console.log('CONFIG_OK'); else process.exit(1)"
grep -q '`wire_backend_after_build` (default `false`)' .claude/skills/autopilot/SKILL.md && echo BULLET_OK
grep -q "build-backend.*autonomous.*OPTIONAL" .claude/skills/autopilot/SKILL.md && echo TAIL_OK
# tail sits inside Phase C, before Phase D
awk '/### Phase C/{c=NR} /build-backend.* OPTIONAL/{t=NR} /### Phase D/{d=NR} END{ if(c>0 && c<t && t<d) print "ORDER_OK" }' .claude/skills/autopilot/SKILL.md
# Phases A/B/D/E headings still present (untouched)
for h in "### Phase A" "### Phase B" "### Phase D" "### Phase E"; do grep -q "$h" .claude/skills/autopilot/SKILL.md || { echo "MISSING $h"; exit 1; }; done; echo PHASES_OK
```
Expect: CONFIG_OK BULLET_OK TAIL_OK ORDER_OK PHASES_OK.

- [ ] **Step 5: Commit**
```bash
git add .claude/skills/autopilot/config.json .claude/skills/autopilot/SKILL.md
git commit -m "feat(build-backend): opt-in autopilot backend-wire (default off) as a Phase C tail"
```

---

### Task 6: Skill wiring — `what-can-i-do` + `advise-project` + `CLAUDE.md`

**Files:**
- Modify: `.claude/skills/what-can-i-do/SKILL.md`
- Modify: `.claude/skills/advise-project/SKILL.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: `what-can-i-do` — add a menu item.** Find the build-app/mobile/plugin menu entries; after
  the build entries add a line offering `build-backend` in the same plain-language style, e.g.:

```
- **Make your app's data real** — already built an app? Add a real database + sign-in so it saves data (say "add a backend"). *(Runs `build-backend`; you do a quick 5-minute go-live at the end.)*
```
  (Match the file's exact existing bullet format; if entries are numbered, continue the numbering.)

- [ ] **Step 2: `advise-project` — extend the deferred-tier clause (additive).** In the `## Post-build
  invocation` note, the phrase `the deferred tiers (real data, deploy, more build targets) → next-step
  ideas` appears. Extend the "real data" mention to name the skill — replace that phrase with:

```
the deferred tiers (real data → the `build-backend` skill, deploy, more build targets) → next-step ideas
```
  (Additive within the new note — do not touch any pre-existing advise-project content; 0 deletions to
  content that existed before Phase 17.)

- [ ] **Step 3: `CLAUDE.md` — add the skill bullet + the `outputs/backend/` pointer.** In the Skills
  section, after the `build-plugin` bullet, add a `build-backend` bullet (one line, same style):

```
- **`build-backend`** — the "make it real" tier: upgrades the built `app/` (mock data) into a real-data, backend-ready app — a Supabase schema (from `src/data/` + charter) + a graceful-off data layer + email auth + tests + a go-live checklist; scaffolds offline (no keys), the one keyed go-live step stays the user's. Attended, Tier 1 scaffold-key-free; never in the loop. See `docs/BUILD-BACKEND.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
```
  And in the `outputs/` section, after the `outputs/vetting/` line, add:

```
  - `outputs/backend/` — `build-backend` go-live checklists (`<date>-<slug>/GO-LIVE.md`)
```

- [ ] **Step 4: Verify DoD (incl. the line cap)**
```bash
grep -q "build-backend" .claude/skills/what-can-i-do/SKILL.md && echo MENU_OK
grep -q "the .build-backend. skill" .claude/skills/advise-project/SKILL.md && echo ADVISE_OK
grep -q "\`build-backend\`" CLAUDE.md && grep -q "outputs/backend/" CLAUDE.md && echo CLAUDE_OK
L=$(wc -l < CLAUDE.md); echo "CLAUDE.md: $L"; [ "$L" -lt 125 ] && echo CAP_OK || echo CAP_FAIL
# advise-project: no deletions of pre-existing content (only additive within the Phase-17 note)
git diff --numstat main..HEAD -- .claude/skills/advise-project/SKILL.md | awk '{print "advise-project deletions:", $2}'
```
Expect: MENU_OK ADVISE_OK CLAUDE_OK, CLAUDE.md < 125 (CAP_OK), advise-project deletions: 0.

- [ ] **Step 5: Commit**
```bash
git add .claude/skills/what-can-i-do/SKILL.md .claude/skills/advise-project/SKILL.md CLAUDE.md
git commit -m "feat(build-backend): wire what-can-i-do + advise-project + CLAUDE.md"
```

---

### Task 7: Doc wiring — README + USING + AUTOPILOT + master-spec addendum

**Files:**
- Modify: `README.md`
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md`
- Modify: `docs/AUTOPILOT.md`
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`

- [ ] **Step 1: README — build-status line.** After the Phase 17 build-status line
  (`- Phase 17 — \`autopilot\` loop-aware: after building, it proposes ranked "what's next" ideas
  (propose-only) ✅`), add:

```
- Phase 18 — `build-backend`: upgrades the built web app to real data — Supabase schema + graceful-off data layer + auth + go-live checklist (offline scaffold; keyed go-live stays the user's) ✅
```

- [ ] **Step 2: README — guide row.** In the guides/docs table (the `| Guide | Read it for… |` table, near
  the BUILD-APP/BUILD-MOBILE/BUILD-PLUGIN rows), add a row:

```
| [Make data real](docs/BUILD-BACKEND.md) | Add a real Supabase backend + sign-in to your built app |
```
  And add the roadmap:
```
| [Path to production](docs/PATH-TO-PRODUCTION.md) | The ordered map from prototype to a shippable product |
```
  (Match the table's exact column shape.)

- [ ] **Step 3: USING — a "make it real" clause + a real-data rung.** After the `autopilot` "do it all in
  one go" paragraph, add a short paragraph:

```
**Then make it real:** once you've built an app, run **`build-backend`** — it upgrades your `app/` from placeholder data to a real Supabase backend (schema derived from your data + a graceful-off data layer that keeps the app running on sample data until you add keys + email sign-in + tests), then hands you a 5-minute go-live checklist. Real data is the first rung of the full **path to production** (`docs/PATH-TO-PRODUCTION.md`): real data → testing → audit → deploy → a go/no-go ship-check → polish. The safety-sensitive rungs (keys, deploy, publish) always stay scaffold-and-checklist — you do the actual go-live. See `docs/BUILD-BACKEND.md`.
```

- [ ] **Step 4: AUTOPILOT — the optional backend-wire note.** After the Tier-0 note (`Tier 0 — mock data,
  no keys, no accounts. Real data, accounts, deployment … are later tiers …`), add:

```
Optionally, autopilot can make the built web app **backend-ready** in the same hands-off run: set `wire_backend_after_build: true` in `.claude/skills/autopilot/config.json` and, after the build, it runs `build-backend` (offline, graceful-off — no keys) so you finish with a real schema + data layer + sign-in scaffolded, and a go-live checklist. It's **off by default** (it adds sign-in, which changes the app's shape) and autopilot still never touches a key. See `docs/BUILD-BACKEND.md`.
```

- [ ] **Step 5: master spec — Phase 18 addendum.** Append after the `## Phase 17 addendum …` section a new
  `## Phase 18 addendum — `build-backend` (real-data/backend tier) (2026-07-01)` in the same single-dense-
  paragraph voice, covering: a new attended `build-backend` skill (the "make it real" `build-*` sibling)
  that upgrades the built mock-data web `app/` into a real-data, backend-ready app — a Supabase migration
  (columns typed from `src/data/` fixtures, relationships/RLS-intent from the charter, seed from the mock
  arrays, RLS = shared-read/authenticated-write by default) + a **graceful-off** pluggable data layer
  (`DataStore` / `MockStore` / `SupabaseStore` [dynamic-import] / `getActiveStore()` mirroring
  `aios/server/kb/store.ts`) + email auth (inert without keys) + tests + `app/.env.example` — **scaffolded
  fully offline (no keys)**, with the one keyed **go-live** step (create the project, paste two keys, run
  the migration) deliberately the human's, per the standing "keys never in chat / never publish" rule; the
  graceful-off layer means the app runs on mock data until go-live so a scaffold never breaks it; provenance
  rides the shared spine (`raw/builds/` tagged `layer: backend` + a `## Backend (Supabase)` section in
  `wiki/build.md` + one `change-log.md` line); an **opt-in, default-off** autopilot backend-wire runs it as
  a tail of Phase C (web target only) so the hands-off arc can reach a backend-ready app; a captured
  `docs/PATH-TO-PRODUCTION.md` roadmap places this as the first of six rungs (real-data → testing → audit →
  deploy/observability → a `ship-check` GO/NOT-YET gate → polish/compliance); **web-first** (mobile/plugin
  backends + non-Supabase providers + realtime/storage/payments deferred); attended-only, never in
  `maintenance-loop`; `improve-system` stays the single applier and `raw/` immutable; the `build-app`/
  `build-mobile`/`build-plugin` skills are byte-for-byte unchanged. Full design:
  `docs/superpowers/specs/2026-07-01-build-backend-design.md`; how-to: `docs/BUILD-BACKEND.md`.

- [ ] **Step 6: Verify DoD**
```bash
grep -q "Phase 18 — \`build-backend\`" README.md && grep -q "BUILD-BACKEND.md" README.md && grep -q "PATH-TO-PRODUCTION.md" README.md && echo README_OK
grep -q "Then make it real" docs/USING-THIS-FOR-ANY-PROJECT.md && echo USING_OK
grep -q "wire_backend_after_build" docs/AUTOPILOT.md && echo AUTOPILOT_OK
grep -q "Phase 18 addendum" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo ADDENDUM_OK
```
Expect: README_OK USING_OK AUTOPILOT_OK ADDENDUM_OK.

- [ ] **Step 7: Commit**
```bash
git add README.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/AUTOPILOT.md docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(build-backend): README + USING + AUTOPILOT + master-spec Phase 18 addendum"
```

---

### Task 8: Final verification (additive + no-pollution + invariants)

**Files:** none (verification only).

- [ ] **Step 1: Untouched invariants (expect EMPTY).**
```bash
git diff --name-only main..HEAD -- .claude/skills/improve-system .claude/skills/maintenance-loop .claude/skills/build-app .claude/skills/build-mobile .claude/skills/build-plugin .claude/skills/define-project .claude/skills/define-design .claude/skills/roast .claude/skills/storm-research raw
```
Expect: EMPTY.

- [ ] **Step 2: advise-project additive-only + autopilot phases intact.**
```bash
git diff --numstat main..HEAD -- .claude/skills/advise-project/SKILL.md | awk '{print "advise-project deletions:", $2}'   # expect 0
for h in "### Phase A" "### Phase B" "### Phase D" "### Phase E"; do grep -q "$h" .claude/skills/autopilot/SKILL.md || { echo "MISSING $h"; exit 1; }; done; echo AUTOPILOT_PHASES_OK
```
Expect: `advise-project deletions: 0`, AUTOPILOT_PHASES_OK.

- [ ] **Step 3: No pollution (no real build/backend artifacts committed).**
```bash
test ! -e app && test ! -e app/supabase && test ! -e app/.env && echo NO_APP_OK
test ! -e wiki/build.md && echo NO_BUILDINDEX_OK
ls outputs/backend 2>/dev/null | grep -vq gitkeep && echo "POLLUTION: real backend run" || echo NO_BACKEND_RUN_OK
git status --porcelain   # expect clean
```
Expect: NO_APP_OK NO_BUILDINDEX_OK NO_BACKEND_RUN_OK, clean tree.

- [ ] **Step 4: Only intended files changed + cap.**
```bash
git diff --name-only main..HEAD | sort
L=$(wc -l < CLAUDE.md); echo "CLAUDE.md: $L"; [ "$L" -lt 125 ] && echo CAP_OK
```
Expect exactly: `.claude/skills/build-backend/SKILL.md`, `.claude/skills/build-backend/config.json`,
`.claude/skills/autopilot/SKILL.md`, `.claude/skills/autopilot/config.json`,
`.claude/skills/what-can-i-do/SKILL.md`, `.claude/skills/advise-project/SKILL.md`, `CLAUDE.md`, `README.md`,
`docs/AUTOPILOT.md`, `docs/BUILD-BACKEND.md`, `docs/PATH-TO-PRODUCTION.md`,
`docs/USING-THIS-FOR-ANY-PROJECT.md`, `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`,
`docs/superpowers/specs/2026-07-01-build-backend-design.md`, `outputs/backend/.gitkeep` — plus this plan
doc. Nothing else; CAP_OK.

- [ ] **Step 5:** No commit (verification only). Proceed to the final gates (tuned `code-reviewer` + Codex
  `codex review --base main`), then `finishing-a-development-branch`. **Merge/push only on the user's
  explicit request.**

---

## Notes for the executor
- **Author only — never run `build-backend`/`autopilot` for real** against this template (no real `app/`,
  `app/supabase/`, `app/.env`, `wiki/build.md`, or `outputs/backend/<date>-*`).
- **Verbatim transcription** for Tasks 2–4 (the two docs + the SKILL.md) — they carry full content.
- **Additive is load-bearing:** `advise-project` gets one clause inside its Phase-17 note (0 deletions);
  autopilot Phases A/B/D/E and all `build-*` SKILL.md files stay byte-for-byte unchanged.
- **Keys-never-in-chat + go-live-is-human** is the crux invariant — the SKILL.md must forbid entering keys
  and running migrations/install/deploy.
- After all tasks: dispatch the tuned `code-reviewer` (whole-branch), run the Codex gate, then
  `finishing-a-development-branch`. Merge/push only on the user's explicit request.
