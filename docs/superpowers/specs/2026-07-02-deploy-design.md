# deploy & operate — "ship it & watch it" (path-to-production rung 4) — design

## Context

**What prompted this.** The user is walking `docs/PATH-TO-PRODUCTION.md` rung by rung. Rungs 1–3 shipped —
`build-backend` (real data, Phase 18), `test-app` (testing, Phase 19), `audit-app` (audit, Phase 20). **Rung
4 is deploy & operate** — the user's instruction: *"Deploy."* An audited, tested, real-data app still lives
only on the developer's machine; this rung gets it **live** and then **watches it**.

**What the roadmap committed to.** `docs/PATH-TO-PRODUCTION.md` rung 4 reads: *"A `deploy` skill: a hosting
target + CI/CD + env/secrets management as **scaffold + guided checklist** (you pull the go-live trigger),
plus **observability** — error tracking, logging, and real analytics that feed `raw/metrics/`, closing the
loop with `advise-project` (which today consumes metrics nothing produces)."*

**The reframing that shapes the design.** The observability half is not new plumbing — it **closes a loop
that has been open since Phase 6.** `advise-project` already reads `raw/metrics/*.json` (computing trend
deltas between the two most recent snapshots), and `docs/METRICS-FEED.md` documents the exact schema — but it
also says plainly *"no connector ships with the foundation… you own the wiring."* Nothing produces the feed.
This rung finally provides the producer.

**The two forks the user resolved (brainstorming):**
1. **Scope → two skills: `deploy` + `sync-metrics`.** `deploy` (attended, scaffold + checklist) ships the
   app; `sync-metrics` (a new graceful-off sync skill) writes `raw/metrics/` snapshots and rides the
   `maintenance-loop`, closing the `advise-project` loop. (Rejected: deploy-only leaves the loop open — the
   roadmap's headline value; a hand-wired metrics *recipe* instead of a first-class graceful-off skill is
   weaker than a sync skill that rides the existing loop.)
2. **Hosting target → Vercel default** (first-class Vite, per-PR previews, built-in analytics, trivial Git
   integration), with a `provider` config key leaving room to swap hosts.

**Two design decisions the user accepted (presented as recommendations):**
- **No autopilot wiring for `deploy`.** Unlike the backend/test/audit tails, *deciding to ship* is a
  deliberate human moment, not something to fold into a "build my whole project" run — so **autopilot is not
  modified this phase.** (`sync-metrics` rides the `maintenance-loop`, the right home for a sync skill, not
  autopilot.)
- **This phase touches the unattended loop's orchestration** (`data-ingestion` + a one-line `maintenance-
  loop` note) to wire `sync-metrics` into the tick — the first time we edit the loop. It is **additive and
  graceful-off**: the existing three sync skills and the loop's behavior are unchanged; an unconfigured clone
  logs a skip.

**Intended outcome.** (a) A `deploy` skill that scaffolds hosting + CI/CD + env + graceful-off observability
+ a go-live checklist, **never deploying/publishing/entering keys** (the human pulls the trigger); (b) a
`sync-metrics` skill that finally produces the `raw/metrics/` feed, closing the `advise-project` loop, riding
the `maintenance-loop` and graceful-off when unconfigured; (c) the roadmap/docs wiring. All **author-only** —
the template ships clean.

---

## Design

### Skill 1 — `deploy` (`.claude/skills/deploy/{SKILL.md,config.json}`)

The **"ship it"** step — the `build-*` sibling that takes a built `app/` from "runs on my machine" to
"live on the internet." **Deploying / publishing is a prohibited action**, so `deploy` **never deploys,
publishes, enters keys, or creates accounts** — it scaffolds everything offline and hands over a go-live
checklist; the human pulls the trigger. This is the `build-backend` go-live boundary, applied to shipping.

**When to use.** "deploy my app", "ship it / put it live / publish my app", "set up hosting", "add CI/CD",
"host my app", `/deploy`. Also offered by `what-can-i-do` and pointed to by `advise-project` after a build.
It **requires a built `app/`** (routes to `build-app` if absent); it works with or without a `build-backend`
backend (if backend-wired, the env template includes the Supabase vars). **Attended** (one confirm gate) and
**never in the unattended `maintenance-loop`**.

**Configuration (`config.json`, all default; never block on absence):**
- `app_dir` (default `"app"`) — the built app to deploy.
- `provider` (default `"vercel"`) — the hosting target (Vercel first; the key leaves room for
  Netlify / Cloudflare Pages / GitHub Pages later).
- `ci` (default `"github-actions"`) — the CI provider for the quality-gate workflow.
- `include_error_tracking` (default `true`) — scaffold graceful-off error tracking (Sentry).
- `include_analytics` (default `true`) — scaffold a graceful-off analytics hook (feeds `sync-metrics`).

**What it scaffolds (offline; no keys; Vercel default):**
1. **Host config → `app/vercel.json`** — an SPA rewrite (all routes → `/index.html` so client-side routing
   works on a static host), the build command (`npm run build`), and the `dist` output dir. (Per `provider`,
   the equivalent `netlify.toml` + `_redirects` / Cloudflare / GitHub-Pages `404.html` shape is a later
   provider option; v1 ships Vercel.)
2. **CI/CD → `.github/workflows/deploy-app.yml`** (at the **repo root**, not inside `app/`, because GitHub
   Actions requires it there) — a **quality gate**: checkout → `npm --prefix app ci` → `npm --prefix app run
   typecheck` → run the `test-app` suite **if present** (`npm --prefix app test`) → `npm --prefix app run
   build`. **Deploy itself is handled by Vercel's Git integration** (connect the repo once in the Vercel
   dashboard → auto-build/deploy on push), so **no deploy token ever lives in Actions** — the workflow only
   proves the build is green. (This composes cleanly with `test-app` and `audit-app`.)
3. **Env template → `app/.env.production`** — the `VITE_*` vars (incl. `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` if backend-wired, plus `VITE_SENTRY_DSN` if error-tracking) as empty slots with
   fill-in comments; ensure `app/.gitignore` covers `.env.production`. (Keys are never entered in chat.)
4. **Graceful-off observability** (mirrors `build-backend`'s inert-without-keys pattern):
   - **Error tracking** — if `include_error_tracking`: a small `app/src/lib/observability.ts` that initializes
     `@sentry/react` **only when `import.meta.env.VITE_SENTRY_DSN` is present** (dynamic import, so the
     no-DSN bundle never loads it — "inert unless env present" is structurally guaranteed, exactly like
     `SupabaseStore`), called from `app/src/main.tsx`. No DSN → no-op, app unaffected.
   - **Analytics** — if `include_analytics`: a vendor-neutral `track()` hook (a thin wrapper that no-ops
     unless an analytics env/provider is present) that page views and key actions call. This is the
     **client half** of the metrics loop; `sync-metrics` is the server half that turns provider analytics
     into `raw/metrics/` snapshots.
   - Deps added to `app/package.json`: `@sentry/react` (only if `include_error_tracking`); the analytics
     hook is dependency-free by default. Each added **only if not already present**.
5. **Go-live checklist → `outputs/deploy/<date>-<slug>/GO-LIVE.md`** — the exact human steps: create a free
   Vercel account, connect the GitHub repo (set the **root directory to `app/`**), paste the env vars in the
   Vercel dashboard (Settings → Environment Variables), trigger the first deploy, verify the live URL, and
   (optional) add a custom domain + turn on Vercel Analytics. **Marked offer-don't-run** — `deploy` never
   runs `npm install`, never deploys, and never enters a key.

**Runtime shape (mirrors `build-backend` Phase 0–5).** Phase 0 pre-flight (require a built `app/` → offer
`build-app` if absent; detect a backend → include Supabase env; read the charter for the app name/domain
intent) → Phase 1 derive the deploy plan (provider, what gets scaffolded, whether backend env is included) →
Phase 2 **one confirm gate** → Phase 3 scaffold offline → Phase 4 provenance → Phase 5 **offer-don't-run**
the go-live checklist.

**Provenance (rides the shared build spine).** `raw/builds/<date>-<slug>.md` tagged **`layer: deploy`**
(append-only) + a **`## Deploy`** section in `wiki/build.md` (preserving the Web/Mobile/Extension/Backend/
Tests sections) + one attributed `applied` `change-log.md` line. Code lives in `app/` + the repo-root
workflow; only the record enters `raw/`. `improve-system` stays the single applier.

**`## Autonomous invocation` note.** Present for **completeness/consistency with the family**, but it states
plainly that **`autopilot` does not drive `deploy`** (deploy is a deliberate ship decision, deliberately
excluded from the hands-off arc) — so the note documents that exclusion rather than an autonomous procedure.
(No autopilot config/SKILL change ships this phase.)

**Rules & guardrails.**
- **Never deploys, publishes, enters keys, or creates accounts.** Scaffold + checklist only; the human pulls
  the trigger. This is a permanent boundary (deploy/publish is a prohibited action).
- **Graceful-off observability = no broken app.** Error tracking / analytics are inert without keys; a
  scaffold never breaks the app.
- **Attended-only — never in `maintenance-loop`.** It writes project source + the go-live checklist.
- **`improve-system` stays the single applier; `raw/` immutable.** Writes its own provenance; code in `app/`.
- **Web `app/` only (v1).** Deploying `mobile/` (app stores) / `plugin/` (web store) is a later phase.

### Skill 2 — `sync-metrics` (`.claude/skills/sync-metrics/{SKILL.md,config.json}`)

The **loop-closer** — the missing producer for `raw/metrics/`. A **4th sync skill**, shaped exactly like
`sync-ecosystem-data`: **zero-argument, unattended-safe, graceful-off, incremental.** It reads its config +
analytics credentials **from env**, pulls the latest metrics from the configured analytics provider, and
writes **one dated snapshot** `raw/metrics/<YYYY-MM-DD>-dau.json` in the **exact schema `advise-project`
reads** (`docs/METRICS-FEED.md`): `captured_at` (ISO 8601) + `metrics{ dau, wau, mau, d1_retention,
d7_retention, signups, errors, feature_usage{...} }` + `notes`. Partial data is fine (all fields optional).

**Graceful-off (the load-bearing property).** With **no provider / no keys configured**, it **skips + logs
"skipped (unconfigured)"** and exits cleanly — exactly like the other sync skills when a source is
unconfigured. So the template and every unconfigured clone are completely unaffected; the skill only produces
real snapshots once a user has a live app + analytics.

**Configuration (`config.json`, all default; never block on absence):**
- `provider` (default `""`) — the analytics source (`"vercel"` / `"plausible"` / `"ga4"` / …); empty ⇒ skip.
- `metrics` (default the standard key list) — which metric keys to pull/emit.
- `lookback` (default `"1d"`) — the window per snapshot.

Run-state: `outputs/runs/sync-metrics.json` (`last_run`, `last_captured_at`), created on first run.

**Writes.** Only `raw/metrics/<date>-dau.json` (append-only — a **new dated file** each run, never
overwriting, honoring `raw/` immutability; `EXAMPLE*` and dotfiles untouched) + its run-state. It **never
enters or echoes a key** (read from env only), never writes `change-log.md`, never touches `wiki/` or code.

**Closing the loop.** `sync-metrics` joins the **`data-ingestion`** orchestrator as a 4th sync source, so on
each `maintenance-loop` tick it runs (before `improve-system` → `advise-project`) and fresh metrics land in
`raw/metrics/` **before** the advisor reads them — the producer `advise-project` has lacked since Phase 6.
`docs/METRICS-FEED.md` is updated from "you own the wiring" to note `sync-metrics` as the shipped connector
(the vendor-neutral manual paths still work).

**Unattended invocation note.** Standard sync-skill note (like `sync-ecosystem-data`): in `data-ingestion` /
`maintenance-loop` it runs unattended — no interview; unconfigured ⇒ skip + log, never block.

### Wiring the loop (additive, graceful-off)

- **`data-ingestion/SKILL.md`** — add `sync-metrics` as the **4th** sync skill (frontmatter description +
  the "run … back-to-back, in order" list + the run-log block). The "if one fails, continue the others"
  guarantee already covers it.
- **`maintenance-loop/SKILL.md`** — update step 1's parenthetical (which lists the three sync skills inside
  `data-ingestion`) to include `sync-metrics`; step 4 already says `advise-project` reads the `raw/metrics/`
  feed — now it has a producer.
- **`advise-project/SKILL.md`** — its "Metrics feed" input line already reads `raw/metrics/*.json`; add a
  short note that `sync-metrics` now produces it (additive) and add `deploy` to the post-build deferred-tier
  next-step clause.

### Not changed

`improve-system` (single applier), `codex-review`, `build-app/mobile/plugin/backend`, `test-app`,
`audit-app`, `define-*`, `roast`, `storm-research`, `docs/SUBAGENTS.md` (no new agent), `autopilot`
(deliberately not wired — deploy is a human ship decision), `raw/` immutability. The three existing sync
skills are byte-for-byte unchanged (`sync-metrics` is added alongside them).

## Safety / reconciliation

- **Deploy never ships for the user.** `deploy` scaffolds config + a checklist and stops; it never runs
  `npm install`, never deploys/publishes, never enters a key or creates an account. Deploy/publish is a
  prohibited action — this is the permanent boundary, the same one `build-backend` draws at go-live.
- **`sync-metrics` is graceful-off + key-safe.** Unconfigured ⇒ skip + log (template unaffected); keys read
  from env only, never entered or echoed; writes only append-only `raw/metrics/` snapshots + run-state.
- **Loop stays safe.** Adding `sync-metrics` to `data-ingestion` is additive and graceful-off — the tick's
  behavior is unchanged when unconfigured; `improve-system` stays the single applier; `advise-project` stays
  propose-only.
- **Attended vs unattended is correct per skill.** `deploy` is attended / never-in-loop (writes source +
  offers a go-live); `sync-metrics` is unattended / graceful-off / rides the loop (a sync skill).
- **Author-only — never run for real against the template.** No real `app/` deploy config, no `.github/`
  workflow, no real `raw/metrics/<date>-*` snapshot, no `outputs/deploy/<date>-*` committed; the template
  ships clean (both skills + configs + docs + wiring + `outputs/deploy/.gitkeep` only; the existing
  `raw/metrics/EXAMPLE-dau.json` + `.gitkeep` are untouched).

## Critical files

- **Create (shipped):** `.claude/skills/deploy/SKILL.md` + `config.json`; `.claude/skills/sync-metrics/
  SKILL.md` + `config.json`; `docs/DEPLOY.md`; `outputs/deploy/.gitkeep`; this spec.
- **Modify (shipped, light/additive):** `.claude/skills/data-ingestion/SKILL.md` (+ `sync-metrics` as the
  4th source); `.claude/skills/maintenance-loop/SKILL.md` (step-1 parenthetical); `.claude/skills/
  advise-project/SKILL.md` (metrics-producer note + `deploy` next-step); `.claude/skills/what-can-i-do/
  SKILL.md` (menu item); `CLAUDE.md` (2 skill bullets + `outputs/deploy/` pointer, hold < 125 lines);
  `README.md` (build-status Phase 21 line + guide row); `docs/PATH-TO-PRODUCTION.md` (mark rung 4 shipped);
  `docs/USING-THIS-FOR-ANY-PROJECT.md` (a deploy/operate clause); `docs/METRICS-FEED.md` (note `sync-metrics`
  as the shipped connector); `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` (Phase 21
  addendum).
- **NOT modified:** `autopilot` (deploy is not autopilot-driven); `docs/SUBAGENTS.md` (no new agent);
  `codex-review`, `build-*`, `test-app`, `audit-app`, the three existing sync skills, `improve-system`.
- **Reuse (reference, do not modify):** `.claude/skills/build-backend/SKILL.md` (Phase 0–5 + graceful-off
  inert-without-keys + go-live-checklist + `layer:` provenance shape), `.claude/skills/sync-ecosystem-data/
  SKILL.md` (the graceful-off / unattended / incremental sync-skill shape `sync-metrics` mirrors),
  `docs/METRICS-FEED.md` + `raw/metrics/EXAMPLE-dau.json` (the exact snapshot schema `sync-metrics` emits),
  `.claude/skills/build-app/SKILL.md` (the app it deploys: Vite build → `dist`, the `@` alias, `main.tsx`).

## Verification

Authoring task (skills / docs / wiring) → DoD via `grep`/`wc`/`git`, plus (documented, NOT run against the
template) a manual smoke of the scaffold:
- **`deploy` present & shaped:** `deploy/SKILL.md` has Phase 0–5 + the never-deploy/never-publish/never-keys
  boundary + the Vercel `vercel.json` + the CI quality-gate workflow (no deploy token) + graceful-off
  observability + the `outputs/deploy/<date>-<slug>/GO-LIVE.md` offer; `config.json` has the five keys.
- **`sync-metrics` present & shaped:** `sync-metrics/SKILL.md` is a graceful-off/unattended sync skill that
  writes `raw/metrics/<date>-dau.json` in the METRICS-FEED schema, skips + logs when unconfigured, reads keys
  from env only; `config.json` has `provider` defaulting to `""`.
- **Loop wired:** `data-ingestion/SKILL.md` lists `sync-metrics` as the 4th sync skill; `maintenance-loop/
  SKILL.md` step-1 parenthetical includes it; `advise-project/SKILL.md` notes the producer.
- **Deploy-not-in-autopilot + no new agent:** `git diff --name-only main..HEAD` includes **no** `autopilot`
  file, **no** `docs/SUBAGENTS.md`, **no** `.claude/agents/` file.
- **Untouched invariants (expect empty):** `git diff --name-only main..HEAD` for `improve-system`,
  `codex-review`, `build-app/mobile/plugin/backend`, `test-app`, `audit-app`, `define-*`, `roast`,
  `storm-research`, `sync-claude-sessions`, `sync-curated-content`, `sync-ecosystem-data`.
- **No pollution:** no real `app/`, `.github/workflows/`, `raw/metrics/<date>-*` snapshot, or
  `outputs/deploy/<date>-*` committed; `raw/metrics/EXAMPLE-dau.json` untouched; only intended files in the
  diff; `CLAUDE.md` < 125 lines.
- **Roadmap updated:** `docs/PATH-TO-PRODUCTION.md` rung 4 marked shipped (Phase 21), matching rungs 1–3.

## Execution (after approval)

The project's standard pipeline, **dogfooding the tuned fleet** (as in Phases 16–20): this spec →
`spec-reviewer` → user review → `writing-plans` → `plan-reviewer` → subagent build with `implementer`s
(per-task, verbatim transcription + grep/git DoD + per-task commits) → `code-reviewer` + Codex
`codex review --base main` → `finishing-a-development-branch`. Branch: `phase-21-deploy`. Because it is a
two-skill rung, `writing-plans` will decompose it into bite-sized tasks (deploy skill · sync-metrics skill ·
loop wiring · visibility/CLAUDE · docs · final verification). **Author only — never run `deploy`/`sync-
metrics` for real against the template.**
