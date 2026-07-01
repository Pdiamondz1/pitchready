# Design Spec: `build-backend` — the real-data / backend tier (Phase 18)

> Status: Approved (2026-07-01). Not yet implemented. The first rung of the **path to production** and the
> biggest single jump past Tier 0: a new attended `build-backend` skill turns the just-built, mock-data
> `app/` into a **real-data, backend-ready** web app — a Supabase schema + a **graceful-off** pluggable data
> layer + auth + tests + a go-live checklist — **scaffolded fully unattended**, with the one human step
> (create the account, paste two keys, run the migration) deliberately left to the user. Ships a captured
> `docs/PATH-TO-PRODUCTION.md` roadmap alongside. Backend = Supabase; web-first (mobile/plugin later).
> Autopilot integration is an opt-in, default-off backend-wire tail of Phase C. Keys never in chat; never in `maintenance-loop`.

## Context

**What prompted this.** After Phase 17 the user asked: *what else is needed to take a user all the way to a
"fully-tested, fully-audited, ready-for-production, finished product?"* Today the template delivers a themed
**front-end prototype with mock data** (define → vet → design → build → advise, all Tier 0) — a prototype,
not a product. The user chose to (1) capture the path-to-production roadmap and (2) start the first and
biggest tier — real data / backend — granting decision latitude, and asked the load-bearing question:
**can this be built unattended, without their attention, until it's done?**

**The honest answer (the design turns on it).** A real backend needs credentials and a live service (a
Supabase project) that only the human can create — the standing rule is *never enter keys in chat, never
publish/deploy for the user*. A fully-unattended run to a **live** backend is therefore impossible without
breaking that rule. But the tier splits so **the whole scaffold builds hands-off** and the human's role
collapses to one ~5-minute, well-marked step:

- **Part 1 — Scaffold (fully unattended, offline, Tier-0-safe):** derive the data model, generate the DB
  schema/migrations, generate a **graceful-off pluggable data layer**, rewire pages off the mock getters,
  scaffold auth, write `.env.example` slots, generate tests, write a go-live checklist. No keys; never
  breaks the app.
- **Part 2 — Go-live (the ONE human step; never automated):** the human creates the Supabase project, pastes
  two keys into `app/.env`, and runs the migration, following the generated `GO-LIVE.md`. Until then the app
  runs on mock data. This step is theirs by the safety rule.

**The graceful-off masterstroke (why an unattended run never hands back a broken app).** The generated data
layer mirrors `aios/server/kb/store.ts`: a `DataStore` interface with a `MockStore` (today's `src/data/`
fixtures) and a `SupabaseStore` (inert unless env present), chosen by a `getActiveStore()` that reads env.
**With no keys the app still runs on mock data; the moment both keys are present it uses the real backend —
automatically.** So autopilot can scaffold a backend-ready app hands-off and hand over a checklist, staying
Tier 0 (it never touches a key) while producing a production-ready-to-flip app.

**Why it's a clean fit (the groundwork exists).** All three build targets already store data as a
`src/data/` layer of typed arrays + `getX()`/`listX()` accessors imported directly by pages
(`build-app/SKILL.md:140-142`) — the explicit, designed swap point (`docs/BUILD-APP.md:63-66` already names
*"swap mock data for a real backend (e.g. Supabase)"*). The console already ships the pluggable-store +
graceful-off pattern (`aios/server/kb/store.ts`, `aios/server/env.ts:hasSupabaseEnv`), the empty-`.env`-slot
discipline (`aios/.env.example`, `setup-project/SKILL.md`), and a migration shape
(`aios/supabase/migrations/0001_knowledge.sql`). This tier **reuses those patterns**, it does not invent
them.

**Intended outcome.** A captured roadmap doc; a `build-backend` skill that upgrades the built `app/` to
real-data/backend-ready (fully scaffolded unattended, one human go-live step); and an opt-in autopilot Phase
tail so the hands-off arc can extend **define → vet → design → build (+ wire backend) → advise**.

## Architecture

A new skill in the `build-*` family + a captured roadmap doc + light, additive wiring (the autopilot
backend-wire is opt-in and off by default):

```
  build-app (Tier 0)            build-backend (Tier 1, THIS)              go-live (human)
  app/ + src/data/ mock   →     + app/supabase/migrations/0001_init.sql   →  create Supabase project
  getX()/listX()                + app/src/data/store/ (DataStore:            paste 2 keys → app/.env
  imported by pages               MockStore | SupabaseStore | getActiveStore) run the migration
                                + auth (inert w/o keys) + tests           →  app now uses real backend
                                + app/.env.example (empty slots)             (was mock until keys present)
                                + outputs/backend/<date>-<slug>/GO-LIVE.md
  ─────────────────────────────────────────────────────────────────────
  graceful-off: no keys ⇒ MockStore (app runs on mock);  both VITE_SUPABASE_* present ⇒ SupabaseStore
```

**Parts:**
1. **`docs/PATH-TO-PRODUCTION.md`** *(new doc)* — the ordered roadmap (real-data → testing → audit → deploy
   → ship-check gate → polish/compliance).
2. **`build-backend` SKILL.md + config.json** *(new skill)* — the attended tier + its `## Autonomous
   invocation` note.
3. **`autopilot` SKILL.md + config.json** *(modified — additive)* — an opt-in, default-off backend-wire
   tail of Phase C.
4. **Light wiring** — `what-can-i-do`, `advise-project` deferred-tier clause, CLAUDE.md, README, USING,
   AUTOPILOT.md, master-spec Phase 18 addendum.

## The changes

### 1. `docs/PATH-TO-PRODUCTION.md` (the roadmap)
The ordered path from prototype to production, each rung a future tier/skill in the template's own idiom
(skill + `raw/` provenance + `outputs/` report + optional autopilot step; keys-in-env; graceful-off;
attended for anything irreversible):
1. **Real data & identity** — `build-backend` (this phase). *The biggest jump.*
2. **Testing** — a `test-app` skill: unit + integration + E2E (Playwright) against the charter's success
   criteria; runnable suite + coverage.
3. **Audit** — a `security-audit` skill (deps/secret scan, authz/injection, OWASP-style) + accessibility
   (WCAG) + performance (Lighthouse) siblings; mirrors `codex-review`'s report pattern.
4. **Deploy & operate** — a `deploy` skill (hosting + CI/CD + env/secrets as *scaffold + guided checklist*,
   human pulls the trigger) + observability that **feeds `raw/metrics/`**, closing the loop with
   `advise-project`.
5. **The `ship-check` gate** — a production-readiness skill returning **GO / NOT-YET** with the exact
   blocking gaps: the production analog of `roast`'s idea gate. Arc becomes **… → build → test → audit →
   ship → advise**.
6. **Polish & compliance** — real content/assets, onboarding, legal/privacy (policy, ToS, consent,
   GDPR/CCPA), optional payments (Stripe scaffold), user docs.

States plainly: the safety-sensitive rungs (keys, deploy, payments, publish) always stay **scaffold +
checklist + guide** — the human does the actual key entry and go-live.

### 2. `build-backend` skill (the substantive deliverable)
A new **attended** skill — the "make it real" sibling of the `build-*` family — that upgrades the built
**web `app/`** (web-first, mirroring how `build-app` preceded mobile/plugin) from mock data to real,
backend-ready. Backend = **Supabase**.

**Inputs (no keys read or requested):** `wiki/charter.md` (the data model — entities/fields/relationships
from scope & audience), the built `app/` (esp. `src/data/` fixtures → schema + seed), `wiki/build.md`, and
(autonomous mode) the confirmed `plan.md`.

**Generates (Part 1, offline, no keys):**
- **DB schema/migrations** → `app/supabase/migrations/0001_init.sql`: one table per entity, **columns typed
  from the concrete `src/data/` fixture shapes** (the source of truth the pages and seed already share; the
  charter informs *which* entities/relationships matter and RLS intent, **not** column types — so schema ⟷
  seed ⟷ pages cannot diverge), relationships as foreign keys, **seed data derived from the existing
  `src/data/` mock arrays** (fixtures become the seed — zero data invented), and **RLS enabled with a
  shared-read / authenticated-write default**: `SELECT` allowed to everyone (so the owner-less seed rows stay
  visible — no empty screens after go-live) and `INSERT`/`UPDATE`/`DELETE` allowed only to authenticated
  users (so it is never anon-writable). *(Owner-scoped private RLS — `auth.uid() = owner_id` — is a
  documented later refinement for data models with genuine per-user ownership; v1 defaults to shared-read so
  seed-from-mock is coherent. The cited `aios/.../0001_knowledge.sql` has no RLS to copy — this policy set is
  written fresh.)*
- **Graceful-off data layer** → `app/src/data/store/`: a `DataStore` interface, `MockStore` (wraps today's
  fixtures), `SupabaseStore`, and `getActiveStore()` (reads `import.meta.env.VITE_SUPABASE_URL`/`_ANON_KEY`;
  falls back to `MockStore` when either is absent) — mirrors `aios/server/kb/store.ts`. `SupabaseStore`
  **dynamically `import()`s `@supabase/supabase-js` only when env is present** (as `aios/server/kb/store.ts`
  does), so the no-keys / mock bundle never loads it — making "inert unless env present" *structurally*
  guaranteed, not merely conventional.
- **Page rewire** → the minimal change: pages call `store.listX()`/`store.getX()` (async) instead of
  importing mock getters directly; `@tanstack/react-query` is turned on here (build-app defaults it off) for
  async fetch/cache, which adds a `QueryClientProvider` wrap in `src/main.tsx`.
- **Dependencies** → add to `app/package.json` the packages `build-app` deliberately excludes
  (`build-app/SKILL.md:128-130`): `@supabase/supabase-js` + `@tanstack/react-query` (runtime) and `vitest` +
  `@playwright/test` (dev). No other stack drift.
- **Auth scaffolding** → Supabase email auth: sign-in/up page, session context, protected routes — **inert
  without keys** (the app still runs; auth simply not enforced) so the scaffold never breaks Tier 0.
- **Env template** → `app/.env.example` with empty `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` slots +
  fill-in comments (never in chat; `app/.env` gitignored).
- **Tests** → Vitest for the data layer + store fallback + auth guards; a Playwright E2E smoke; runnable
  `npm test`.
- **Go-live checklist** → `outputs/backend/<date>-<slug>/GO-LIVE.md`: the exact human steps (create a
  Supabase project, paste the two keys into `app/.env`, run the migration, verify) + what's assumed.

**Provenance (rides the shared spine):** `raw/builds/<date>-<slug>.md` tagged `layer: backend` (append-only)
+ a new `## Backend (Supabase)` section in `wiki/build.md` + one `applied` `change-log.md` line. Code stays
in `app/` (a build target outside the knowledge folders, like `aios/`); only the record enters `raw/`.

**Runtime shape (mirrors build-app Phase 0–5):** pre-flight routing (charter HARD → offer `define-project`;
a built `app/` is REQUIRED → offer `build-app` first if absent) → derive the data model + entity list →
**ONE draft-confirm gate** (attended) → scaffold offline → provenance → **offer-don't-run** the go-live
checklist (never run migrations, `npm install`, or deploy for the user). Re-run = incremental/never-clobber
(diff the model; add-entities / re-wire / both; confirm before overwrite). `config.json` =
`{ "app_dir": "app", "provider": "supabase", "include_auth": true, "max_entities": 12 }`.

**`## Autonomous invocation (driven by autopilot)` note (additive):** when `autopilot` drives it, read the
north-stars + `plan.md`, **skip the confirm gate** (autopilot's single gate covered it), scaffold offline in
**graceful-off mode** (no keys — the app ships backend-ready but running on mock until the human does
go-live), flag every `(assumed — confirm later)` to the ledger, write provenance as usual, and surface the
`GO-LIVE.md` path for the hand-over. Attended behavior above is byte-for-byte unchanged.

### 3. Optional autopilot backend wire (opt-in, default OFF) — a tail of Phase C
Add an optional backend-wire step (config `wire_backend_after_build`, **default `false`**) as a **tail of
Phase C — after the per-target `build-<target>` step and before the Phase D hand-over** (so the hand-over
naturally includes the go-live checklist and the Phase E advise pass sees the backend-ready app). When
enabled **and `web` is among the selected targets** (the grill is multi-select; this wires only the web
`app/` — it is skipped otherwise, logged), it runs `build-backend` in scaffold-only / graceful-off mode.
**Default off** because adding auth + a store abstraction materially changes the app's shape — a user who
said "build my app" shouldn't silently get a login screen; it's one config flag / one grill answer to opt
in. Autopilot stays **Tier 0** (never touches a key), **user-initiated**, and **never in
`maintenance-loop`**. Autopilot's Phases A, B, D, E are unchanged; this is an additive, default-off tail of
the existing Phase C build loop (no new lettered phase, avoiding any "after Phase E" ordering ambiguity).

### 4. Wiring (additive; light)
`what-can-i-do` menu item; `advise-project` deferred-tier clause extended to name `build-backend` as the
next step (additive); CLAUDE.md skill bullet + `outputs/backend/` pointer (hold < 125 lines); README
build-status Phase 18 line + guide row; USING one clause + a real-data rung; `docs/AUTOPILOT.md` optional
optional backend-wire note; master-spec Phase 18 addendum.

## Not changed

`improve-system` (single applier), `maintenance-loop`, `build-app/mobile/plugin` SKILL.md (untouched — this
ADDS a sibling; wiring backends for `mobile/`/`plugin/` is a later phase), `define-*`, `roast`,
`storm-research`, `advise-project`'s scoring/lenses/propose-only role, `raw/` immutability. Autopilot's
existing Phases A, B, D, E are unchanged; the backend-wire is an additive, default-off tail of Phase C.

## Safety / reconciliation

- **Keys never in chat; the human owns go-live.** `build-backend` only writes empty `.env` slots + a
  checklist; it never asks for, stores, or enters a key, and never runs migrations / `npm install` / deploy
  for the user. The standing rule is unbroken.
- **Graceful-off = no broken app.** With no keys the generated app runs on mock; keys flip it to real
  automatically. An unattended scaffold can never hand back a broken app.
- **Attended for the irreversible; Tier 0 preserved for autopilot.** The skill's own run has a confirm gate;
  autopilot's backend-wire is opt-in and only does the key-free scaffold. Neither is ever added to
  `maintenance-loop`.
- **`improve-system` stays the single applier; `raw/` immutable.** `build-backend` writes its own provenance
  (`raw/builds/` record + `wiki/build.md` section + one `change-log.md` line); code lives in `app/`, outside
  the knowledge folders.
- **Author-only — never run for real against the template.** No real `app/supabase/`, `app/.env`,
  `outputs/backend/<date>-*`, or `wiki/build.md` committed; the template ships clean (skill + config + docs +
  `outputs/backend/.gitkeep` + wiring only).

## Files

**Create (shipped):** `.claude/skills/build-backend/SKILL.md`, `.claude/skills/build-backend/config.json`,
`docs/BUILD-BACKEND.md`, `docs/PATH-TO-PRODUCTION.md`, `outputs/backend/.gitkeep`,
`docs/superpowers/specs/2026-07-01-build-backend-design.md` (this spec).

**Modify (shipped, light/additive):** `.claude/skills/autopilot/SKILL.md`,
`.claude/skills/autopilot/config.json`, `.claude/skills/what-can-i-do/SKILL.md`,
`.claude/skills/advise-project/SKILL.md`, `CLAUDE.md`, `README.md`, `docs/USING-THIS-FOR-ANY-PROJECT.md`,
`docs/AUTOPILOT.md`, `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`.

**Reuse (reference, do not modify):** `aios/server/kb/store.ts`, `aios/server/env.ts`, `aios/.env.example`,
`.claude/skills/setup-project/SKILL.md`, `aios/supabase/migrations/0001_knowledge.sql`,
`.claude/skills/build-app/SKILL.md`.

**Runtime-only (not shipped):** the generated `app/supabase/`, `app/src/data/store/`, `app/.env`, the
`raw/builds/<date>-<slug>.md` record, the `wiki/build.md` backend section, and
`outputs/backend/<date>-<slug>/` — all created only when a user runs `build-backend`.

## Verification

Authoring task (skill/docs) → DoD via `grep`/`wc`/`git`, plus a documented (NOT run against the template)
manual smoke of a generated app:
- **Skill present & shaped:** `build-backend/SKILL.md` has Phase 0–5 + a `## Autonomous invocation` note +
  the graceful-off store description; `config.json` has the four keys (`app_dir`, `provider`, `include_auth`,
  `max_entities`).
- **Graceful-off is explicit:** SKILL.md states the app runs on mock with no keys and switches to Supabase
  when both `VITE_SUPABASE_*` are present.
- **Keys-never-in-chat + go-live-is-human:** SKILL.md forbids collecting keys and running
  migrations/install/deploy; only writes empty `.env` slots + `outputs/backend/<date>-<slug>/GO-LIVE.md`.
- **Autopilot backend-wire opt-in/off:** `autopilot/config.json` `wire_backend_after_build` defaults `false`;
  autopilot stays Tier 0 / never in `maintenance-loop`.
- **Untouched invariants (expect empty):** `git diff --name-only main..HEAD` for `improve-system`,
  `maintenance-loop`, `build-app/mobile/plugin`, `define-*`, `roast`, `storm-research`, `raw`.
- **No pollution:** no real `app/supabase/`, `app/.env`, `outputs/backend/<date>-*`, or `wiki/build.md`
  committed; only intended files in the diff; `CLAUDE.md` < 125.
- **Roadmap doc:** `docs/PATH-TO-PRODUCTION.md` lists the six rungs in order with the keys-are-human note.

## Out of scope (this tier)

- **Backends for `mobile/` and `plugin/`** — web `app/` first; the sibling targets get their own later
  phase (they share the same `src/data/` swap point).
- **Non-Supabase providers** (Firebase, custom/Postgres, etc.) — Supabase first (already the template's
  opt-in); the `provider` config key leaves room.
- **Realtime, storage/file uploads, advanced RLS/roles, edge functions** — v1 is CRUD + email auth.
- **The other roadmap rungs** — testing, audit, deploy/observability, ship-check gate, polish/compliance —
  each a separate later phase, captured in `docs/PATH-TO-PRODUCTION.md`.
- **Running go-live for the user** (creating the account, entering keys, running migrations, deploying) —
  permanently out of scope by the standing safety rule.
- Any change to `improve-system`'s single-applier role, `raw/` immutability, or autopilot's Tier-0 /
  never-in-`maintenance-loop` posture.
