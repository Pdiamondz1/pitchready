# CLAUDE.md — Project Foundation operating rules

This repository is a **self-improving project foundation**. It pairs a file-based
knowledge base (the "second brain") with Claude Code skills that grow and maintain it,
plus a file-first AIOS web console (`aios/`) that surfaces it.

These rules are load-bearing. Honor them in every session.

**Maintaining this file:** Keep it lean — invariants and pointers only; elaboration goes in docs/skills.
Cap: **150 lines** (raise it further, or offload a section to a referenced `docs/*.md`, before dropping a
directive); condense *wording*, never a *rule*.

## The three-folder knowledge system

- **`raw/` — original, immutable assets.** Anything ingested lands here *unaltered*.
  Never edit, rewrite, reorganize, rename, or delete anything inside `raw/`. It is
  append-only: add new files, never mutate existing ones. `raw/` is the ground truth
  everything else points back to.
  - `raw/inputs/processed/` — clean per-session summaries of Claude Code history
  - `raw/ecosystem/` — files, email, transcripts, and connected-source data
  - `raw/curated/` — content pulled from tracked creators/publications
  - `raw/metrics/` — live usage snapshots (DAU etc.) the advisor reads
  - `raw/project/` — `define-project` discovery record; the north star lives at `wiki/charter.md`
  - `raw/design/` — `define-design` design-tool exports; the look-and-feel north star lives at `wiki/design-system.md`
  - `raw/builds/` — `build-app`/`build-mobile`/`build-plugin`/`build-mcp` build records; the apps live in `app/` (web), `mobile/` (phone), `plugin/` (browser extension), and `mcp/` (a read-only agent server) — build targets outside the knowledge system, like `aios/`

- **`wiki/` — the AI-written table of contents over `raw/`.** Written and maintained
  *only* by AI, never by hand. Every wiki page is a distilled, navigable index that
  references the underlying `raw/` files it summarizes. Keep pages small and
  cross-linked. Do not paste raw content here — reference it.
  - `wiki/index.md` — the master index
  - `wiki/sources.md` — creators/publications to track
  - `wiki/_candidates/` — proposed wiki changes await sign-off here (see below)

- **`outputs/` — generated reports and the self-improvement queues.**
  - `outputs/change-log.md` — append-only ledger of applied changes
  - `outputs/review-*.md` — NEEDS SIGN-OFF checkbox lists (do not apply until checked)
  - `outputs/needs-context-*.md` — MORE CONTEXT questions for the human
  - `outputs/ideas-*.md` — ranked project ideas from the proactive advisor (approve by checkbox)
  - `outputs/vetting/` — `roast` verdicts + `storm-research` briefings (indexed in `wiki/vetting.md`)
  - `outputs/backend/` — `build-backend` go-live checklists (`<date>-<slug>/GO-LIVE.md`)
  - `outputs/tests/` — `test-app` coverage/criteria manifests (`<date>-<slug>/TEST-PLAN.md`)
  - `outputs/audits/` — `audit-app` security/a11y/perf findings reports (`<date>-<slug>/AUDIT.md`)
  - `outputs/deploy/` — `deploy` go-live checklists (`<date>-<slug>/GO-LIVE.md`)
  - `outputs/ship-check/` — `ship-check` GO / NOT-YET readiness verdicts (`<date>-<slug>/SHIP-CHECK.md`)
  - `outputs/polish/` — `polish` payments go-live checklists (`<date>-<slug>/GO-LIVE.md`, when payments opted in)

## Wiki page frontmatter (RAG-ready)

Every `wiki/` page opens with YAML frontmatter — `title`, `source_id`, `path`, `tags`,
`updated` — so it can later be embedded into a vector store with no rework. Exact template +
field notes: `docs/WIKI-FRONTMATTER.md` (or copy the header of any existing `wiki/` page).

## Approval discipline (how the system stays safe)

- **Normal wiki maintenance is allowed directly.** Skills doing their job — e.g.
  `add-new-resource` and the sync skills creating/updating topical index pages — write to
  `wiki/` directly. What needs sign-off is *structural* change (reorganizing, merging or
  renaming many pages, changing conventions) and any *new or edited skill*; those go to
  `wiki/_candidates/` or `outputs/review-*.md` and wait.
- The `improve-system` skill sorts every proposed change into one of three buckets:
  - **AUTO-APPROVE** — low-risk fixes; apply directly and log to `outputs/change-log.md`.
  - **NEEDS SIGN-OFF** — skill edits, new skills, structural rewrites, contradictions;
    write to `outputs/review-*.md` as a checkbox list and wait.
  - **MORE CONTEXT** — ambiguous calls; write to `outputs/needs-context-*.md` as questions.
- **`review-*.md` item format.** Each item carries a stable id the GUI and the skill both
  depend on; never renumber or rewrite existing pending items — append new ones:

      - [ ] `rv-YYYYMMDD-NNN` — <concise change>  ·  target: <path>  ·  detail: <what changes>

- **Write ownership.** `outputs/change-log.md` is an append-only ledger written *by skills*
  when they apply a change (each line attributed to its skill, `auto` or `applied`). The
  AIOS GUI never writes it — the GUI's *only* mutation is toggling a checkbox in
  `outputs/review-*.md`, which `improve-system` reads on its next run.

## Skills (the brain)

Run any skill manually with zero arguments first; it interviews you before acting. Sync
skills are incremental: per-skill config (sources/filters) lives in the skill's folder as
`config.json`; run-state (last run + cursor) in `outputs/runs/<skill>.json`; the
orchestrator's run log in `outputs/runs/data-ingestion.md`.

- **`setup-project`** — specialize a fresh clone (brand, project type, capability tier, `aios/.env`); offers to schedule autonomy. Run this first after cloning.
- **`define-project`** — interview that grills you into a clear **project charter** (`wiki/charter.md`): purpose, audience, success, scope; proposes options when unsure; re-run on a pivot. The north star other skills read.
- **`define-design`** — interview that grills you into a **design system** (`wiki/design-system.md`, the look-and-feel north star Claude reads before building any UI): style, color, type, voice. design-tool-provider aware (Stitch · Claude Design · bring-your-own; interview alone suffices); offers to theme the console. See `docs/DESIGN-SYSTEM.md`.
- **`roast`** — convene a 5-persona council that pressure-tests an idea, then a Judge returns one **GO / RESHAPE / KILL** verdict + the cheapest 48-hour test; saves the verdict to `outputs/vetting/` and can commission `storm-research`. Triggers: "roast" / "convene the council" / "brutal second opinion" / `/roast`.
- **`storm-research`** — turn a topic or idea into a verified, multi-perspective HTML briefing (5 expert lenses → contradiction map → self-review + primary-source citation checks → `outputs/vetting/<date>-<slug>/`). Needs web; refuses rather than fabricates offline. See `docs/IDEA-VETTING.md`.
- **`build-app`** — turn the charter (the MVP scope) + design system (the theme) into a working, themed front-end **web app** in a new top-level `app/` folder (its own Vite+React project, like `aios/`), runnable with `npm run dev`. Attended, Tier 0 (mock data, no keys); one confirm gate; re-runnable; **never in the unattended loop**. Its siblings: `build-mobile` (phone) and `build-plugin` (browser extension). See `docs/BUILD-APP.md`.
- **`build-mobile`** — the phone sibling of `build-app`: turn the charter + design system into a themed **Expo (React Native)** app in a new top-level `mobile/` folder, previewed on a phone by scanning a QR code (Expo Go — no Mac/Xcode). Attended, Tier 0 (mock data, no keys/accounts); one confirm gate; re-runnable; **never in the unattended loop**. Installable app-store builds (EAS) are a later tier. See `docs/BUILD-MOBILE.md`.
- **`build-plugin`** — the browser-extension sibling of `build-app`: turn the charter + design system into a themed **Manifest V3** browser extension (popup + options page) in a new top-level `plugin/` folder (plain Vite+React, like `app/`), previewed in Chrome via **Load unpacked**. Attended, Tier 0 (mock data, no keys/permissions); one confirm gate; re-runnable; **never in the unattended loop**. Packaging + Chrome Web Store are a later tier. See `docs/BUILD-PLUGIN.md`.
- **`build-backend`** — the "make it real" tier: upgrades the built `app/` (mock data) into a real-data, backend-ready app — a Supabase schema (from `src/data/` + charter) + a graceful-off data layer + email auth + tests + a go-live checklist; scaffolds offline (no keys), the one keyed go-live step stays the user's. Attended, Tier 1 scaffold-key-free; never in the loop. See `docs/BUILD-BACKEND.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`build-mcp`** — the "make it agent-accessible" tier: generates a **read-only** MCP server in a new top-level `mcp/` folder over the built app's data layer (`DataStore`), so AI agents (Claude/ChatGPT) can query it in natural language. Read-only **by construction** (no write tools); Tier-0 local stdio over mock data (no keys); the remote go-live (Streamable HTTP + OAuth + real backend) is a keyed checklist the user owns. Attended, one confirm gate, re-runnable; never in the loop, and **deliberately not in `autopilot`** (like `deploy`/`polish`). Vetted → `outputs/vetting/2026-07-03-agent-accessibility/`. See `docs/BUILD-MCP.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`test-app`** — the "prove it works" tier: generates a real, runnable test suite (Vitest + Testing Library + Playwright + coverage) for the built `app/` and maps it to the charter's success criteria (each → an automated test or a flagged manual/metric note). Scaffolds offline; extends an existing setup; offers the run (unit tests on explicit yes, like `build-app`). Attended, Tier 0; never in the loop. See `docs/TEST-APP.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`audit-app`** — the "prove it's safe" tier: reads the built `app/` and writes ONE prioritized security + accessibility + performance findings report to `outputs/audits/`. **Propose-only** (mirrors `codex-review`): never modifies the app, never auto-fixes, no confirm gate. Reasoning-first/offline; `npm audit`/Lighthouse offered, not run. Tier 0; never in the loop. See `docs/AUDIT-APP.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`deploy`** — the "ship it" tier: scaffolds hosting (Vercel) + a CI quality-gate + an env template + graceful-off error tracking/analytics for the built `app/`, then hands you a go-live checklist. **Never deploys, publishes, or enters keys** — you pull the trigger. Attended; never in the loop; deliberately not in `autopilot`. See `docs/DEPLOY.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`ship-check`** — the "go/no-go" gate: runs the whole production-readiness gauntlet on the built `app/` (build · data · tests · audit · deploy · content · legal · charter criteria) and returns ONE **GO / NOT-YET** verdict naming the blocking gaps + the skill that closes each. **Propose-only** (mirrors `audit-app`): writes only `outputs/ship-check/`, changes nothing, no confirm gate. The production analog of `roast`. On-demand; never in the loop; deliberately not in `autopilot`. See `docs/SHIP-CHECK.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`polish`** — the "make it legitimate" tier (path-to-production rung 6): a `build-*` sibling that modifies the built `app/` across areas — content (real copy) · states (onboarding/empty/error/loading) · legal (privacy/terms/consent **templates**, not legal advice) · docs · opt-in **Stripe payments** (graceful-off, you own go-live). Attended, one confirm gate, `layer: polish` provenance; closes `ship-check`'s content/legal gaps. Never enters keys/charges; never in the loop; deliberately not in `autopilot`. See `docs/POLISH.md` and the roadmap `docs/PATH-TO-PRODUCTION.md`.
- **`autopilot`** — the capstone: describe your goal once → it grills you once, **vets + researches** it, shows one plan to confirm, then runs `define-project → roast → storm-research → define-design → build-*` **hands-off**, pausing only on a KILL verdict; logs every call to `outputs/autopilot/<date>-<slug>/`; delegates grunt work to the `.claude/agents/` fleet. **Attended-started, hands-off-executed — never in `maintenance-loop`.** Tier 0. See `docs/AUTOPILOT.md`.
- **`what-can-i-do`** — show a friendly menu of everyday actions for anyone unsure what to do next.
- **`add-new-resource`** — add a file into `raw/`, then index it in `wiki/`.
- **`sync-claude-sessions`** — summarize new `~/.claude/projects/` sessions → `raw/inputs/processed/`.
- **`sync-ecosystem-data`** — pull new connected-source data → `raw/ecosystem/` (+ light wiki indexes).
- **`sync-curated-content`** — pull new posts from `wiki/sources.md` → `raw/curated/`.
- **`sync-metrics`** — pull live usage numbers from a configured analytics provider → dated `raw/metrics/` snapshots that feed `advise-project` (graceful-off; skips when unconfigured). See `docs/METRICS-FEED.md`.
- **`data-ingestion`** — orchestrator: run the four sync skills back-to-back (no gaps, no re-ingest).
- **`improve-system`** — single self-improvement pass; sorts changes into the three buckets, applies approved ones.
- **`human-improve-system`** — walk you through pending reviews / notify on Slack.
- **`maintenance-loop`** — the autonomous tick a schedule fires: `data-ingestion` → `improve-system` → `codex-review (optional)` → `advise-project`, unattended (no interviews, skips unconfigured sources), logged to `outputs/runs/maintenance-loop.md`.
- **`advise-project`** — propose-only: reads the KB + activity + `raw/metrics/` and files ranked project ideas to `outputs/ideas-*.md` for your approval; never applies changes; rides the `maintenance-loop` tick.
- **`codex-review`** — optional, graceful-off: cross-model code review via the Codex CLI; writes findings to `outputs/code-reviews/`; in the loop a CRITICAL finding files a sign-off item (advisory, never blocks); off unless the Codex CLI is installed — see `docs/CODE-REVIEW.md`.

**Autonomy.** Schedule `maintenance-loop` weekly via a Claude Code Routine — see `docs/SCHEDULING.md`.
The template ships no live trigger; `setup-project` offers to register one in your environment.

## Be welcoming to everyone

- Greet each person as a capable, normal user; keep it plain by default. On a fresh clone offer `setup-project` (explained simply — no need to know skill names); accept everyday requests and pick the right skill, or offer `what-can-i-do` if they seem unsure. Default to Tier 0 (no keys, offline); bring up tiers/keys/the console only if asked.
- Report back plainly; if something breaks, explain it simply and offer to fix it.

## Pointers

- Design spec: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`. The AIOS console (`aios/`) is file-first — reads this KB, writes only to `outputs/`.
- Subagents: the tuned `.claude/agents/` fleet (web-researcher · spec-reviewer · plan-reviewer · implementer · test-writer · code-reviewer · doc-writer) does the grunt work — least-tools (read-only by default), model per task (haiku scan / sonnet build+review / opus reason); the phase-build pipeline delegates to spec-reviewer/plan-reviewer/implementer/code-reviewer. See `docs/SUBAGENTS.md`.
