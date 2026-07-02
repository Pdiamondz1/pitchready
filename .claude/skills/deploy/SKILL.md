---
name: deploy
description: Use when someone asks to "deploy my app", "ship it", "put it live", "publish my app", "set up hosting", "add CI/CD", "host my app", or says "/deploy". Scaffolds hosting (Vercel by default) + a CI quality-gate workflow + an env template + graceful-off observability (error tracking + analytics) for the already-built web app in app/, then hands you a go-live checklist. It NEVER deploys, publishes, enters keys, or creates accounts — you pull the trigger (deploying/publishing is yours alone). Reads wiki/charter.md and the built app/; one confirm gate; scaffolds fully OFFLINE. Requires a built app/. Attended-only — never runs in the maintenance loop, never in autopilot. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to use your charter + app, or name a hosting provider]"
---

# deploy

The "ship it" step. `build-app` builds it, `build-backend` makes its data real, `test-app` proves it works,
`audit-app` checks it's safe — this skill takes that same `app/` from "runs on my machine" to **ready to go
live on the internet**. **Deploying and publishing are yours alone** — this skill **never deploys, publishes,
enters a key, or creates an account.** It scaffolds everything offline and hands you a short **go-live
checklist**; you pull the trigger (the same boundary `build-backend` draws at go-live).

What it produces (all **offline, no keys, nothing deployed**): a host config (`app/vercel.json`), a CI
quality-gate workflow (`.github/workflows/deploy-app.yml`), an env template (`app/.env.production`),
**graceful-off** error tracking + analytics wired into the app (inert without keys), and a **go-live
checklist** at `outputs/deploy/<date>-<slug>/GO-LIVE.md`.

## When to use

When the user says "deploy my app", "ship it / put it live / publish my app", "set up hosting", "add CI/CD",
or `/deploy`. Also offered by `what-can-i-do` and pointed to by `advise-project` after a build. It
**requires an already-built `app/`** (from `build-app`) and works with or without a `build-backend` backend.
It is **attended** — one confirm gate — and **never runs in the unattended `maintenance-loop`**. It is
**deliberately not part of `autopilot`**: deciding to ship is a decision you make when you're ready, not a
hands-off step.

## Configuration

Read `.claude/skills/deploy/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the built web app to deploy.
- `provider` (default `"vercel"`) — the hosting target (Vercel first; the key leaves room for
  Netlify / Cloudflare Pages / GitHub Pages later).
- `ci` (default `"github-actions"`) — the CI provider for the quality-gate workflow.
- `include_error_tracking` (default `true`) — scaffold graceful-off error tracking (Sentry).
- `include_analytics` (default `true`) — scaffold a graceful-off analytics hook (feeds `sync-metrics`).

## Procedure

### Phase 0 — Pre-flight (require the app; read it; route, don't guess)

1. **A built `app/` (required).** There is nothing to deploy without it.
   - **Missing →** offer `build-app` first: *"Deploying puts an app you've already built online. Want me to
     build the app first, then set up hosting?"* On yes, run `build-app`, then continue. On no, stop
     gracefully.
     *(If a `plugin/` or `mobile/` exists here instead, say so plainly: these production tiers cover the
     web `app/` only today — mobile and browser-extension have their own later-phase tiers, so there's
     nothing to deploy for them yet — don't steer a plugin/mobile builder to build a web app.)*
   - Read `app/package.json` (the `build` script + the `dist` output), and detect a **backend**
     (`app/src/data/store/` or `app/supabase/`) → the env template must include the Supabase vars.
2. **Charter — `wiki/charter.md` (recommended).** Read the app name/one-liner (for the project name + a
   domain suggestion). Missing → infer from `app/` and flag `(assumed)`.
3. **Existing deploy config (`app/vercel.json` / `.github/workflows/deploy-app.yml`) →** switch to
   **re-run mode** (diff + confirm before overwriting; see *Re-running*).

### Phase 1 — Derive the deploy plan

From `config.provider` (default Vercel) + what the app needs, derive the plan: the host config, the CI
quality-gate workflow, the env vars (the `VITE_*` set — including `VITE_SUPABASE_*` if backend-wired and
`VITE_SENTRY_DSN` if error-tracking), and the graceful-off observability to wire.

### Phase 2 — Confirm once, then scaffold

Show the plan in **one message** and ask **one** question. Include:
- the provider (Vercel) + what gets scaffolded (host config, CI workflow, env template, observability),
- the env vars the user will paste at go-live (names only — never values),
- the key promise: **nothing is deployed and no key is entered** — *"I'll scaffold everything offline, then
  hand you a checklist for the one step that's yours: connect the repo and pull the deploy trigger,"*
- that CI is a **quality gate** (build + tests), not the deployer (Vercel's Git integration deploys).

Ask: *"Scaffold deployment for your app? I'll set up hosting config + CI offline — then hand you a short
go-live checklist. (yes / tweak something)"* On "tweak", revise and show again.

### Phase 3 — Scaffold (offline; no keys; nothing deployed)

Build **in-session, in order** — all offline, no network, no keys, nothing deployed:

1. **Host config → `app/vercel.json`.** An SPA rewrite (all routes → `/index.html` so client-side routing
   works), the build command (`npm run build`), and the output dir (`dist`). *(For other providers the
   `netlify.toml` + `_redirects` / Cloudflare / GitHub-Pages `404.html` equivalents are a later option; v1
   ships Vercel.)*
2. **CI quality-gate → `.github/workflows/deploy-app.yml`** (at the **repo root** — GitHub Actions requires
   it there). On push/PR: checkout → `npm --prefix app install` → `npm --prefix app run typecheck` → **run the
   `test-app` suite if present** (`npm --prefix app test`) → `npm --prefix app run build`. *(Use `install`,
   not `npm ci`: this scaffold never runs install, so the app may have no `package-lock.json` yet — or, once
   `@sentry/react` is added below, an out-of-sync one — and `npm ci` errors on both; `install` resolves from
   `package.json` and regenerates the lockfile.)* **No deploy token
   and no deploy step** — Vercel's Git integration deploys on push; this workflow only **proves the build is
   green**. (Composes with `test-app` + `audit-app`.)
3. **Env template → `app/.env.production`** with the empty `VITE_*` slots + fill-in comments (never in chat):
   the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if backend-wired, `VITE_SENTRY_DSN` if error-tracking,
   and any analytics var. Ensure `app/.gitignore` covers `.env.production`.
4. **Graceful-off observability** (mirrors `build-backend`'s inert-without-keys pattern):
   - if `include_error_tracking`: `app/src/lib/observability.ts` — an `initObservability()` that
     **dynamically `import()`s `@sentry/react` only when `import.meta.env.VITE_SENTRY_DSN` is present**
     (so the no-DSN bundle never loads it — inert unless env present, exactly like `SupabaseStore`), called
     from `app/src/main.tsx`. No DSN → no-op.
   - if `include_analytics`: a vendor-neutral `track(event, props?)` hook in the same file that no-ops
     unless an analytics provider is configured; page views + key actions call it. **A one-line comment
     marks where a real analytics provider's SDK/script wires in** — the client half of the metrics loop
     (`sync-metrics` is the server half).
   - Deps → `app/package.json`: `@sentry/react` **only if `include_error_tracking`** and **only if not
     already present**; the analytics hook is dependency-free.
5. **Never** run `npm install`, a build, or a deploy; **never** enter a key.

### Phase 4 — Record it (provenance)

The **code** lives in `app/` + the repo-root workflow (build targets outside the knowledge folders). The
**record** lands in the knowledge base:
- **`raw/builds/<YYYY-MM-DD>-<slug>.md`** *(immutable, append-only; `-2` for same-day re-runs)* — RAG
  frontmatter, then: the provider, what was scaffolded, the env vars declared, the observability wired, and
  anything deferred. **Tag it `layer: deploy`** (in the frontmatter `tags` and a `layer:` line).
- **`wiki/build.md`** — add a **`## Deploy`** section (preserving the existing sections): the provider,
  where the config lives, the graceful-off note, and links to the `raw/builds/` record + the go-live
  checklist.
- **`outputs/change-log.md`** — append one attributed line (newest-at-top):
  `- <YYYY-MM-DD> — deploy — scaffolded <provider> hosting + CI + observability for app/ — applied`

`improve-system` stays the single applier — this skill writes only its own `applied` line.

### Phase 5 — Hand over the go-live checklist (offer-don't-run)

Write the go-live steps to **`outputs/deploy/<YYYY-MM-DD>-<slug>/GO-LIVE.md`** (RAG frontmatter + the steps),
then close in plain words. **Never** deploy, run `npm install`, or enter a key. The checklist says:

> 1. Create a free Vercel account at vercel.com and install the Vercel GitHub app.
> 2. **Import this repository** in Vercel; set the **Root Directory to `app/`** (so Vercel builds the app,
>    not the whole foundation). Vercel auto-detects Vite (build `npm run build`, output `dist`).
> 3. **Set your environment variables** in Vercel (Settings → Environment Variables): paste the values from
>    `app/.env.production` (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if you have a backend;
>    `VITE_SENTRY_DSN` if you want error tracking). *(Your keys stay in Vercel — never in chat, never in git.)*
> 4. **Deploy** — Vercel builds and gives you a live URL. Every push to `main` now auto-deploys; every PR
>    gets a preview URL.
> 5. **Verify** the live URL, then (optional) add a custom domain and turn on Vercel Analytics.
>
> *The GitHub Actions workflow (`deploy-app.yml`) runs your build + tests as an informational quality gate —
> it proves the build is green but does not itself deploy (Vercel does that). To make a red build block a
> deploy, enable "wait for CI" / required checks in your Vercel + GitHub settings.*

Close: *"Your app is deployment-ready — hosting config, CI, and (graceful-off) error tracking + analytics
are all scaffolded. The only thing left is yours: connect the repo to Vercel and pull the deploy trigger,
following `outputs/deploy/<date>-<slug>/GO-LIVE.md`. Want me to walk you through it?"* (Walk-through =
explain the steps; still never deploy or enter a key.)

## Re-running (incremental, never clobber)

If deploy config already exists, switch to **re-run mode**: read the existing config + latest `raw/builds/`
deploy record, and at the confirm gate offer to update the provider config, the CI workflow, or the
observability. Write **new** files freely; for any **existing** file, show a diff and **confirm before
overwriting**. Each re-run writes a **new** `raw/builds/` record. Never clobber a user's `.env.production`.

## Rules & guardrails

- **Never deploys, publishes, enters keys, or creates accounts.** Scaffold + checklist only; you pull the
  trigger. Deploying/publishing is a permanent human-only boundary.
- **Graceful-off observability = no broken app.** Error tracking + analytics are inert without keys.
- **Attended-only — never in `maintenance-loop`; never in `autopilot`.** Shipping is a deliberate decision.
- **`improve-system` stays the single applier; `raw/` immutable.** Writes its own provenance; code in `app/`.
- **Web `app/` only (v1).** Deploying `mobile/` (app stores) / `plugin/` (web store) is a later phase.

## Output

A deployment-ready `app/` (host config + CI quality gate + env template + graceful-off observability), an
immutable `raw/builds/<date>-<slug>.md` record tagged `layer: deploy`, a `## Deploy` section in
`wiki/build.md`, one `change-log.md` line, and `outputs/deploy/<date>-<slug>/GO-LIVE.md` — with nothing
deployed until you do the one go-live step.

## Autonomous invocation

**`deploy` is deliberately NOT driven by `autopilot`.** Unlike the other post-build tiers (`build-backend`
/ `test-app` / `audit-app`, which have opt-in autopilot tails), *deciding to ship* is a decision the user
makes when they are ready — not a hands-off step folded into a "build my whole project" run. So there is no
autonomous procedure and no `autopilot` config flag for `deploy`. This note documents that exclusion; the
attended behavior above is the only way `deploy` runs.
