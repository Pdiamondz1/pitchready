# Design Spec: `hma_project_foundation` — a self-improving, RAG-ready project foundation with a file-first AIOS GUI

> Status: Approved (2026-06-29); v1 (Phases 0–3) shipped. **Update 2026-06-30:** Phase 4 (the optional, local-first intelligence layer + the any-project extension kit) also shipped — see `docs/USING-THIS-FOR-ANY-PROJECT.md` and `docs/EXTENDING.md`. **Update 2026-06-30 (Phase 5):** guided setup (`setup-project`) + autonomous scheduling (`maintenance-loop` + Claude Code Routines) shipped — see the Phase 5 addendum at the end and `docs/SCHEDULING.md`.

## Context

**Why this is being built.** A single, reusable **project foundation** to clone when starting new projects, with four capabilities built in from day one: self-learning, self-healing, auto-researching, and 2nd-brain knowledge. The desired behavior is specified by a 13-slide prompt series from @austin.marchese (his reference project is named `personal-os`), plus a "GUI wrapper / AIOS" modeled on `internal.dragoncandy.io` and `aios.harbormill.net`, plus a RAG agent modeled on dragoncandy's "Donny".

**The key reframe from exploration.** `hma_project_foundation` is an empty git repo, but two sibling repos already implement most of this:
- `C:\GIT\dragoncandy-v3-d783432b` — **DC AIOS** (`internal.dragoncandy.io`): an 11-section role-gated React/Supabase operator console + **Donny**, a full RAG agent (OpenAI embeddings + pgvector/FTS retrieval, tool framework, cost ledger, `aios-report-ingest` approval choke point). Business-specific.
- `C:\GIT\harbormill-aios` — **HMA AIOS** (`aios.harbormill.net`): an actively-developed, **already white-label, multi-tenant AIOS** — the generalized version of DC AIOS. Ships the React/Vite/Tailwind/shadcn shell, one-file rebrand (`brand.ts` + `features.ts` + CSS vars), **Aria** (generalized Donny: pluggable tool registry, pgvector RAG), the `report-ingest` choke point, Findings/Corrections approval queues, pg_cron loops, a `docs/wiki/` knowledge base, and `autoresearch`/`wiki-gardener`/`loop-audit` skills.

**Decisions (made with the user this session):**
1. **Foundation strategy → "Distill a generic base."** `hma_project_foundation` becomes the brand-neutral, canonical clone-to-start template, distilled from `harbormill-aios`, with the *missing* austin.marchese skills folded in and RAG-ready seams added. `harbormill-aios` and `dragoncandy` are conceptually instances of it (refactoring them to consume it is **future work, out of this v1**).
2. **v1 GUI → "File-first shell, no DB."** Port the AIOS shell but back it with the on-disk markdown KB + `outputs/` files via a tiny local file API — **no Supabase, no vector DB**. Supabase + vector RAG + a live agent are a later phase.
3. **v1 scope → "Full self-improving suite"** (all seven skills) **+ the file-first GUI.** RAG stays *ready but inert*.

**Intended outcome.** A cloneable repo that, on `git clone`, provides: the strict 3-folder knowledge system + pinned `CLAUDE.md`; the complete austin.marchese skill suite (ingest, sync, orchestrate, self-improve with human gates); and a local AIOS web console that surfaces the knowledge base and the approval queues — all white-label and structured so a Supabase/RAG upgrade is purely additive.

## Architecture

Two cleanly separated layers in one repo, communicating only through files:

```
            ┌─────────────────────────────────────────────────────┐
            │  AIOS GUI (aios/)  — Vite + React + Tailwind + shadcn │
            │  read-only dashboards + review-queue approve actions  │
            └───────────────▲───────────────────┬─────────────────┘
                            │ GET (read)         │ POST (write to outputs/ only)
                ┌───────────┴────────────────────▼────────┐
                │  Local File API (Vite dev middleware)    │
                │  reads raw/ wiki/ outputs/, writes outputs/ │
                └───────────▲──────────────────────────────┘
                            │ files
   ┌────────────────────────┴───────────────────────────────────────┐
   │  Knowledge core (file-based)                                     │
   │  raw/ (immutable) → wiki/ (AI-written TOC) → outputs/ (reports)  │
   │  driven by .claude/skills/* (ingest / sync / improve)            │
   └─────────────────────────────────────────────────────────────────┘
```

- **The skills are the "backend brain"** (Claude Code skills, no runtime). They ingest data into `raw/`, distill it into `wiki/`, and write reports/approval-queues into `outputs/`.
- **The GUI is a read-mostly window** onto those files. Its *only* write is toggling a NEEDS SIGN-OFF checkbox in `outputs/review-*.md` — mirroring the `report-ingest` "single write seam" guarantee from harbormill-aios. It never writes `change-log.md`; skills own that ledger.
- **RAG-ready, not RAG-on:** `wiki/` pages carry frontmatter (`title`, `path`, `tags`, `source_id`); the file API exposes a swappable `search(query)` (lexical now, vector later); the Assistant page and a `tools.ts`-shaped registry exist as stubs. Phase 4 swaps lexical search for pgvector + embeddings and wires a live agent — no structural change.

## Repository structure (target)

```
hma_project_foundation/
├── CLAUDE.md                     # <100 lines: pins the raw/wiki/outputs rules + skill index + approval discipline
├── README.md                     # what this is, quickstart, how to clone for a new project
├── raw/                          # ORIGINAL, immutable assets — never edited/reorganized by hand or AI
│   ├── inputs/processed/.gitkeep #   per-session summaries (sync-claude-sessions)
│   ├── ecosystem/.gitkeep        #   files/email/connected sources (sync-ecosystem-data)
│   ├── curated/.gitkeep          #   creator/publication content (sync-curated-content)
│   └── .gitkeep
├── wiki/                         # AI-written table-of-contents over raw/ — never hand-edited
│   ├── index.md
│   ├── sources.md                #   creators/publications to track (read by sync-curated-content)
│   └── _candidates/.gitkeep      #   proposed wiki changes parked here until approved
├── outputs/                      # generated reports + the self-improving buckets
│   ├── change-log.md             #   AUTO-APPROVE / applied changes ledger
│   └── .gitkeep                  #   review-*.md (NEEDS SIGN-OFF) and needs-context-*.md (MORE CONTEXT) land here
├── .claude/skills/               # the 7 skills (see below)
├── aios/                         # the file-first GUI, distilled from harbormill-aios
│   ├── package.json              #   Vite + React + TS + Tailwind + shadcn (deps mirrored from harbormill-aios)
│   ├── vite.config.ts            #   includes the local file-API middleware plugin
│   ├── src/config/brand.ts       #   white-label words/logos (generic defaults)
│   ├── src/config/features.ts    #   feature flags per surface
│   ├── src/components/layout/AppLayout.tsx   # shell + nav + atmosphere (ported, auth stripped)
│   ├── src/components/ui/*        #   shadcn primitives (ported)
│   ├── src/lib/fileApi.ts         #   typed client for the local file API
│   ├── src/pages/*                #   Overview, Wiki, Raw, Review, NeedsContext, ChangeLog, Assistant
│   └── server/fileApi.ts          #   the read/write file endpoints (mounted as Vite middleware)
└── docs/
    └── superpowers/specs/2026-06-29-hma-project-foundation-design.md   # this spec
```

## Components

### A. Knowledge core (3-folder system + pinned CLAUDE.md)
- `raw/` immutable; `wiki/` AI-written only; `outputs/` generated. `CLAUDE.md` (<100 lines) pins these rules, the skill index, and the approval discipline so every session honors them. Faithful to slides 1–2.
- Seed `wiki/index.md` + `wiki/sources.md` as empty-but-structured starting points (do **not** compile the wiki — raw starts empty).

### B. The 7 skills (`.claude/skills/<name>/SKILL.md` + folder)
Each follows its slide exactly; each **interviews before building** and **runs manually with zero arguments** before any scheduling. Routine wiki maintenance (e.g. `add-new-resource` and the sync skills creating/updating topical index pages) writes to `wiki/` directly; only *structural* rewrites and *new/edited skills* require sign-off (proposals go to `wiki/_candidates/`).

| Skill | Job (from slides) | Reads | Writes |
|---|---|---|---|
| `add-new-resource` | Utility: add a file to `raw/`, then update/create the `wiki/` entries that reference it | a dropped file | `raw/`, `wiki/` |
| `sync-claude-sessions` | New sessions in `~/.claude/projects/` since last run → one clean summary each | session history | `raw/inputs/processed/` |
| `sync-ecosystem-data` | Pull new data from connected sources (files, email, Slack, transcripts) since last run, tag by topic | `[LOCATIONS]` | `raw/ecosystem/` + light wiki indexes |
| `sync-curated-content` | Read `wiki/sources.md`, pull new posts, extract key claims, tag | `wiki/sources.md` | `raw/curated/` |
| `data-ingestion` | Orchestrator: run the 3 sync skills back-to-back; log run history (no gaps, no re-ingest) | run-log | run-log JSON + summary |
| `improve-system` | Self-improvement pass → sort every change into AUTO-APPROVE / NEEDS SIGN-OFF / MORE CONTEXT | recent activity | `outputs/change-log.md`, `outputs/review-*.md`, `outputs/needs-context-*.md` |
| `human-improve-system` | Human-in-the-loop: walk through review / notify on Slack when needed | `outputs/review-*.md` | (notifications) |

Run-history is a small JSON per sync skill (`last_run`, `cursor`) so re-runs are incremental and idempotent. Concretely: per-skill config (sources/filters) lives in `.claude/skills/<skill>/config.json`; run-state in `outputs/runs/<skill>.json`; the orchestrator's run log in `outputs/runs/data-ingestion.md` — the pattern proven by harbormill-aios's loops + dragoncandy's `donny-knowledge-sync`. `human-improve-system`'s notify target (e.g. Slack) lives in `.claude/skills/human-improve-system/config.json`.

### C. File-first AIOS GUI (`aios/`) — distilled from `harbormill-aios`
- **Port and keep (generic):** `src/config/brand.ts`, `src/config/features.ts`, `components/layout/AppLayout.tsx` (strip `useAuth`/`useAccess` → local single-user/no-auth), `components/ui/*` (shadcn), `PageHeader`/`StatCard`/`MarkdownProse`/`EmptyState` primitives, Tailwind theme tokens (`src/index.css`), the atmosphere/blueprint-grid styling.
- **Replace the data layer:** harbormill's hooks call `supabase.rpc(...)`; here the same TanStack-Query hooks call the **local file API** (`src/lib/fileApi.ts` → `fetch('/api/...')`).
- **Local file API** (`aios/server/fileApi.ts`, mounted as a Vite dev-server middleware so `npm run dev` serves app + API with no separate process):
  - `GET /api/kb/stats` — counts of raw/wiki/outputs + recent `change-log` entries
  - `GET /api/wiki`, `GET /api/wiki/:path` — list (frontmatter) + render
  - `GET /api/raw` — list raw assets (read-only)
  - `GET /api/outputs/reviews` — parse `review-*.md` into checkbox items (each with a stable `id`); `POST /api/outputs/reviews/:id/check` — toggle that item's box in place (the only GUI write; does **not** touch `change-log.md`)
  - `GET /api/outputs/needs-context`, `GET /api/outputs/change-log`
  - `GET /api/search?q=` — lexical search over `wiki/` (the swappable RAG-ready seam)
- **Pages** (each feature-flagged + brand-driven), mapping austin.marchese buckets → AIOS surfaces:
  Overview (KB stats + recent activity) · Wiki (browse/render) · Raw (read-only asset list) · **Review Queue** (`review-*.md` → checkbox approve = NEEDS SIGN-OFF) · **Needs Context** (`needs-context-*.md` = MORE CONTEXT) · **Change Log** (`change-log.md` = applied) · Assistant (a simple "ask the knowledge base" panel that renders `/api/search` results — not a simulated chat; this is the RAG seam, not a live agent).

### C.1 `outputs/` file contracts (pinned for cross-phase agreement)

`improve-system` (Phase 2) writes these; the GUI Review Queue (Phase 3) reads/toggles them. Pinning the format now keeps the Phase 2 → Phase 3 boundary safe.

- **`review-*.md`** — YAML frontmatter (`title`, `source_id: outputs:review-<date>`, `generated_by`, `updated`) followed by checkbox items, each with a stable id that is never renumbered or rewritten once issued (new items are appended):

      - [ ] `rv-YYYYMMDD-NNN` — <concise change>  ·  target: <path>  ·  detail: <what changes>

  The file API's `:id` is this `rv-...` token. `improve-system` reads which ids are checked and applies only those on its next run.
- **`needs-context-*.md`** — frontmatter + a list of open questions for the human (free text).
- **`change-log.md`** — append-only, **written by skills only** (never the GUI). One attributed line per applied change: `- <date> — <skill> — <what> — <auto|applied>`.

### D. RAG-ready seams (inert in v1)
- `wiki/` frontmatter schema (`source_id`, `title`, `path`, `tags`) compatible with dragoncandy's `donny_knowledge` rows.
- `aios/src/lib/tools.ts` — a `harbormill-aios/assistant-chat/tools.ts`-shaped registry (search_knowledge, get_latest_briefing…) as stubs.
- A documented Phase-4 upgrade path: add Supabase + pgvector, point a `knowledge-sync` at `wiki/`, swap `/api/search` lexical → vector, wire `assistant-chat`. Reference: `dragoncandy-v3/supabase/functions/donny-orchestrator/rag.ts`, `dragoncandy-v3/supabase/functions/donny-knowledge-sync/index.ts`.

## Build phasing (delivery order within v1)

- **Phase 0 — Knowledge foundation (slides 1–2).** Repo scaffold, 3 folders + `.gitkeep`s, `CLAUDE.md` (<100 lines), `README.md`, seeded `wiki/index.md` + `wiki/sources.md`, and the `add-new-resource` skill. *Shippable: the immutable-raw / AI-wiki / outputs system works.*
- **Phase 1 — Ingest + sync (auto-research / self-learning).** `sync-claude-sessions`, `sync-ecosystem-data`, `sync-curated-content`, `data-ingestion` orchestrator + run-history JSON.
- **Phase 2 — Self-improvement (self-healing).** `improve-system` (the 3 approval buckets writing to `outputs/`) + `human-improve-system`.
- **Phase 3 — File-first AIOS GUI.** Scaffold `aios/`, port the shell + ui + config from harbormill-aios, build the file-API middleware + the 7 pages, white-label defaults.
- **Phase 4 — DEFERRED (not this v1):** Supabase + pgvector + embeddings + live Aria/Donny agent; and refactoring `harbormill-aios`/`dragoncandy` to consume the distilled base.

## Files to extract / reference (concrete)

- **Port & generalize from `harbormill-aios`:** `src/config/brand.ts`, `src/config/features.ts`, `src/components/layout/AppLayout.tsx`, `src/components/ui/*`, `src/index.css`, `package.json` (deps + `dev/build/typecheck/lint/test` scripts), `scripts/setup-client.mjs` + `scripts/sync-wiki.mjs`, `docs/{white-label,extending,client-setup}.md`; model the write-seam on `supabase/functions/report-ingest/index.ts`; model the RAG-ready registry on `supabase/functions/assistant-chat/tools.ts`.
- **Skill specs:** the 13 slides in `C:\Users\dwill\Desktop\AI_project_foundation\` (IMG_8436–8448).
- **Phase-4 RAG reference:** `dragoncandy-v3/supabase/functions/donny-orchestrator/rag.ts`, `dragoncandy-v3/supabase/functions/donny-knowledge-sync/index.ts`.

## Verification

- **Skills (run each manually, zero args):**
  - `add-new-resource`: drop a sample file → it lands in `raw/`, a `wiki/` entry referencing it is created/updated; `raw/` original untouched.
  - sync skills: each writes to its target `raw/*` folder and records run-history; a second run is incremental (no re-ingest).
  - `data-ingestion`: runs all three; run-log shows no gaps.
  - `improve-system`: produces `outputs/review-*.md` (checkbox list) + `needs-context-*.md`; applies only checked items on the next run; logs to `change-log.md`. **Assert the guarantee:** no edits to `.claude/skills/` or `wiki/` root for a NEEDS SIGN-OFF item without an approved checkbox.
- **GUI:** `cd aios && npm install && npm run dev`; load the app and confirm Overview stats reflect the files, Wiki/Raw render, the Review Queue lists checkbox items, and checking one writes back to the `.md` **and** appends to `change-log.md`. Then `npm run typecheck && npm run lint && npm run build` pass. Optionally screenshot the running console via the Claude-in-Chrome MCP.
- **White-label sanity:** edit `brand.ts` (productName/assistantName) + a `features.ts` flag → nav + titles update and the disabled surface disappears, with zero component edits.

## Out of scope for v1
- Supabase, auth, vector DB, embeddings, and a live RAG agent (Phase 4).
- Refactoring `harbormill-aios` / `dragoncandy` to consume the distilled base.
- Personal-data ingest specifics (life-story recording, full email export) beyond providing the `raw/ecosystem/` + `sync-ecosystem-data` plumbing.

## Phase 5 addendum — guided setup + autonomous scheduling (2026-06-30)

Two additions that turn "built" into "usable by anyone, autonomously." They add no new
runtime dependencies and change no existing contracts — both are skills plus docs.

- **`setup-project` skill** (`.claude/skills/setup-project/`). The guided "make this clone
  your project" flow. Interviews for name, project type, brand words, capability tier, and
  surfaces, then makes targeted edits to `aios/src/config/{brand,project,features}.ts` and
  `aios/index.html`, and scaffolds `aios/.env` from `aios/.env.example`. **Safety:** it never
  collects API keys in chat — it sets only non-secret env values and leaves each secret slot
  empty with a fill-in comment (`env.ts` already treats an absent key as "capability off", so
  this degrades gracefully). It logs one `applied` line to `change-log.md` and, on an explicit
  yes, offers to register the maintenance Routine. Idempotent: a re-run reads current config
  for its defaults. It does NOT mutate `raw/` beyond optionally clearing seed placeholders.
- **`maintenance-loop` skill** (`.claude/skills/maintenance-loop/`) + **Claude Code Routines**.
  The portable autonomous tick a schedule fires: run `data-ingestion`, then `improve-system`,
  unattended, logging a block to `outputs/runs/maintenance-loop.md`. Safety rides entirely on
  the existing approval gates — `improve-system` only auto-applies its AUTO-APPROVE bucket and
  already-checked items; nothing structural/skill-related is applied without a checked box. To
  support unattended runs, the three sync skills + `data-ingestion` gained an "Unattended
  invocation" note: no first-run interview; skip unconfigured/unreachable sources with a logged
  "skipped (unconfigured)". Scheduling is via a Claude Code Routine firing `maintenance-loop`
  (recommended weekly); the repo ships **no live trigger** (it wouldn't generalize across
  clones) — `setup-project` registers one in the user's environment on opt-in. Alternatives
  (Windows Task Scheduler, GitHub Actions) and tradeoffs are documented in `docs/SCHEDULING.md`.

## Phase 6 addendum — proactive project advisor (2026-06-30)

The `advise-project` skill ships as the outward-facing counterpart to `improve-system`. It
reads the KB, ingested activity, and the `raw/metrics/` feed, then files ranked project ideas
to `outputs/ideas-*.md` for the user's approval across four lenses (improve / scale / maintain /
pattern). It is propose-only and never applies changes — `improve-system` stays the single
applier. It rides the `maintenance-loop` tick as step 3, so ideas accumulate on the same weekly
schedule with no new scheduling needed. Full design:
`docs/superpowers/specs/2026-06-30-proactive-project-advisor-design.md`.

## Phase 8 addendum — Project discovery (`define-project`) (2026-06-30)

The `define-project` skill ships a discovery-interview flow that grills the user — one
question at a time, with proposed options and a recommended default when answers are thin —
across five dimensions: purpose, audience, success, scope, and constraints. The raw Q&A
record lands append-only in `raw/project/<YYYY-MM-DD>-discovery.md`; the distilled north
star is written (or updated on a pivot) to `wiki/charter.md` and pinned at the top of
`wiki/index.md`.

Integration wired in this phase:
- **`setup-project`** — charter check runs before the interview; pre-fills name/type/tagline
  from the charter if present, or offers to run `define-project` first.
- **`advise-project`** — "Project identity" signal now reads `wiki/charter.md` (richer
  purpose/audience/success/constraints) when present, falling back to `project.ts`/`brand.ts`.
- **`what-can-i-do`** — "Get clear on your project" is the first menu item.
- **`CLAUDE.md`** — `define-project` listed in the skills index; `raw/project/` added to the
  `raw/` subfolder list with a pointer to `wiki/charter.md` as the north star.

## Phase 9 addendum — Design discovery (`define-design`) (2026-06-30)

Phase 9 adds the design layer: the `define-design` skill grills the user into a **design
system** (`wiki/design-system.md`, the look-and-feel north star Claude reads before building
any UI) covering style, color, type, and voice, with append-only Stitch exports landing in
`raw/design/`. It is Google Stitch–aware (manual default; optional Stitch MCP when a Google
AI key is present) and offers to theme the console. Full design:
`docs/superpowers/specs/2026-06-30-define-design-design.md`.

## Phase 10 addendum — Idea vetting (`roast` + `storm-research`)

A vet-before-you-build gate: two embedded skills — `roast` (a 5-persona council + GO/RESHAPE/KILL
Judge) and `storm-research` (a citation-verified, multi-perspective HTML briefing) — write vetting
artifacts to `outputs/vetting/<date>-<slug>/` and index them in `wiki/vetting.md`. `roast` is Tier 0;
`storm-research` needs the built-in web tools and refuses rather than fabricates offline. Wired into
`define-project` (draft-gate offer), `what-can-i-do`, and `advise-project` (on-demand only). Full
design: `docs/superpowers/specs/2026-06-30-idea-vetting-design.md`; how-to: `docs/IDEA-VETTING.md`.

## Phase 11 addendum — Build the app (`build-app`) (2026-06-30)

Phase 11 closes the loop from **define → vet → design → build**: the `build-app` skill turns the
charter (the MVP scope) + design system (the theme) + latest vetting verdict into a working, themed
front-end **web app** in a new top-level `app/` folder — its own minimal Vite + React + TypeScript +
Tailwind project (mirroring the `aios/` stack), wired to mock/local data and runnable with
`npm run dev`. It is attended-only (one screen-plan confirm gate; never in the unattended
`maintenance-loop`), Tier 0 (no keys, no backend, offline-safe scaffolding), and re-runnable
(incremental, never clobbers). Provenance lands in the knowledge base — an immutable
`raw/builds/<date>-<slug>.md` record per build and an AI-written `wiki/build.md` index — while `app/`
itself is a build target outside the three-folder discipline, like `aios/`. Wired into
`what-can-i-do`, `setup-project` (propose-only once a charter + design exist), and `advise-project`
(a GO-vetted brief may point to it). The `raw/builds/` + `wiki/build.md` provenance is written
generically so future `build-mobile` / `build-plugin` slices slot in without rework. Full design:
`docs/superpowers/specs/2026-06-30-build-app-design.md`; how-to: `docs/BUILD-APP.md`.

## Phase 12 addendum — Build the mobile app (`build-mobile`) (2026-06-30)

Phase 12 adds the phone sibling of `build-app`: the build step is now **web *or* mobile**. The
`build-mobile` skill turns the same three north-stars — charter (the MVP scope) + design system (the
theme) + latest vetting verdict — into a working, themed **Expo (React Native)** app in a new top-level
`mobile/` folder: its own **Expo + Expo Router + NativeWind + TypeScript** project, themed from the same
13 HSL tokens as the web app. You preview it on a phone by scanning a QR code with the free **Expo Go**
app — no Mac, no Xcode. Like `build-app` it is attended-only (one screen-plan confirm gate; never in the
unattended `maintenance-loop`), Tier 0 (mock/local data, no keys/accounts/backend, offline-safe
scaffolding), and re-runnable (incremental, never clobbers — it owns everything under `mobile/`,
including its theme). Expo Router's routes live in `mobile/app/`, distinct from the web `app/` (no
collision); `mobile/` is a build target outside the three-folder discipline, like `aios/` and `app/`.
Provenance rides the **shared** `raw/builds/` + `wiki/build.md` spine — now carrying a `target`
dimension (records tagged `target: mobile`; `wiki/build.md` gains a Mobile app section alongside Web).
Wired into `what-can-i-do`, `setup-project` (propose-only once a charter + design exist), and
`advise-project` (a GO-vetted brief may point to it). Installable app-store builds (EAS + an Expo
account) and plugins remain later slices. Full design:
`docs/superpowers/specs/2026-06-30-build-mobile-design.md`; how-to: `docs/BUILD-MOBILE.md`.

## Phase 13 addendum — Build the browser extension (`build-plugin`) (2026-06-30)

Phase 13 adds the browser-extension sibling of `build-app`: the build step is now **web, mobile, *or*
browser extension**. The `build-plugin` skill turns the same three north-stars — charter (the MVP
scope) + design system (the theme) + latest vetting verdict — into a working, themed **Manifest V3**
browser extension (a **popup** + an **options page**) in a new top-level `plugin/` folder: its own plain
**Vite + React + TypeScript + Tailwind** project (the same proven stack as the web app) that builds to
an MV3 extension with a hand-written `manifest.json`. Plain Vite + a hand-authored manifest is chosen
deliberately over a framework like WXT or @crxjs so the scaffold mirrors `build-app` exactly, with no
generated-manifest magic (the tradeoff is no live popup hot-reload — the dev loop is `build:watch` +
click-reload). You preview it in Chrome by turning on **Developer mode** and clicking **Load unpacked**
on the built `dist/` folder — no store, no account, no packaging. The 13 HSL tokens carry over
**unchanged** — a popup is just a themed web page, so the same palette, contrast pairs, `--radius`, and
shadows apply (the one platform nuance: the popup gets an explicit ~380px width so it renders as a proper
popup, not a sliver). Like its siblings it is attended-only (one view-plan confirm gate; never in the
unattended `maintenance-loop`), Tier 0 (mock/local data, no keys/permissions/accounts/backend,
offline-safe scaffolding), and re-runnable (incremental, never clobbers — it owns everything under
`plugin/`, including its theme). `plugin/` is a build target outside the three-folder discipline, like
`aios/`, `app/`, and `mobile/`. Provenance rides the **shared** `raw/builds/` + `wiki/build.md` spine —
records tagged `target: plugin`, and `wiki/build.md` gains a Browser-extension section alongside Web and
Mobile. Wired into `what-can-i-do`, `setup-project` (propose-only once a charter + design exist), and
`advise-project` (a GO-vetted brief may point to it, propose-only). Packaging + Chrome Web Store
submission (a paid developer account), cross-browser packaging, real permissions/host access, and a
background service worker remain later slices. Full design:
`docs/superpowers/specs/2026-06-30-build-plugin-design.md`; how-to: `docs/BUILD-PLUGIN.md`.

## Phase 14 addendum — The subagent fleet (`.claude/agents/`) (2026-07-01)

Phase 14 gives the template a tuned fleet of six reusable custom subagents in `.claude/agents/` —
**web-researcher**, **spec-reviewer**, **plan-reviewer**, **implementer**, **code-reviewer**, and
**doc-writer** — so its grunt work (reading many files, web research, reviewing a diff, transcribing a
plan task) runs in a **second Claude's own context window** and hands back a short summary, keeping the
main chat clean. Each file follows the practices from the "Complete Guide to Claude Code Subagents":
**one agent, one job** (if the description needs an "and also," it should be two); a **trigger-rule
`description`** that says *when* to fire and names the signal phrases (with "use proactively" where it
should self-invoke), not a vague label that misroutes; **fewest tools it needs, read-only by default** —
the four review/research agents carry no `Write`/`Edit` — three of them (`web-researcher` with web+read,
`spec-reviewer` and `plan-reviewer` with read/grep/glob) are **tool-enforced** read-only, while
`code-reviewer` additionally holds `Bash` to run `git diff` for whole-branch review (no `Write`/`Edit`;
body-instructed to inspect only) — and only `implementer` and `doc-writer` hold `Write`/`Edit`; and the **model-mix** — **haiku** to scan/summarize/write docs cheaply,
**sonnet** for the default build/review/research work, **opus** for the high-stakes reasoning of
`spec-reviewer` and `code-reviewer` — the per-task cost dial the template had never used before. A new
`docs/SUBAGENTS.md` policy documents the fleet, the conventions, the when-to-use gut check, and the
orchestration patterns (sequential phase pipeline `spec-reviewer → plan-reviewer → implementer →
code-reviewer`; fan-out for `roast`/`storm-research`; builder/validator), plus the composition rule that
**agents cannot call agents** — the main conversation is always the conductor. Unlike the `build-*`
runtime *outputs* (`app/`, `mobile/`, `plugin/`), **everything here ships**: the agents are reusable
*capabilities* committed to the repo, so every clone of the template inherits the fleet automatically.
Wiring is deliberately **light and additive**: `storm-research`'s five lenses (and its Phase 4b citation
verifiers) and `roast`'s Researcher persona **may** now be dispatched as `web-researcher` for its Sonnet
+ web-restricted tooling — but each keeps its exact persona/lens prompt and "Return EXACTLY…" output
contract; a lean `CLAUDE.md` Pointers bullet and the README/USING surfaces point at the doc. **Nothing is
rewired and no skill's attended behavior is touched** — `maintenance-loop`, `improve-system`, the
`build-*` skills, the sync skills, and `raw/` are untouched; the personas and output contracts are
additive notes only. This fleet is the foundation the next slice stands on: **autopilot (Phase 15) is
sequenced next and will delegate to these agents** rather than inventing its own. Full design:
`docs/superpowers/specs/2026-07-01-subagent-fleet-design.md`; how-to: `docs/SUBAGENTS.md`.

## Phase 15 addendum — The `autopilot` capstone (2026-07-01)

Phase 15 adds `autopilot`, the capstone skill that collapses the whole define→vet→design→build journey
into **one goal, one grill, one confirm** — removing the friction that made the *user* the orchestrator of
five separate interviews and confirm gates. It is **attended-started, hands-off-executed**: a human types
the goal and gives a single plan-confirm, and after that it runs to completion untouched. The procedure
front-loads **all** the engagement into Phase A — one concentrated grill (ten dimensions across project /
design / target, each question proposing 2–4 options + a recommended default, capped at
`grill_round_cap` rounds so a thin answer becomes a flagged assumption rather than a blocking loop) —
then runs the UPFRONT confidence chain autonomously: `define-project` writes `wiki/charter.md` from the
consolidated `intake.md`, `roast` convenes its 5-persona council to VET the charter into a
**GO / RESHAPE / KILL** verdict, and (web-gated, graceful-off) `storm-research` RESEARCHES the vetted idea
into a citation-verified briefing — so the **one stop is a KILL verdict, and it surfaces *before* the
confirm** (reshape / proceed-anyway / stop, while the human is still present), a non-KILL RESHAPE being
auto-adopted. Phase B shows a single vetted + researched `plan.md` and asks once; that lone gate
**satisfies each build skill's own confirm gate**, and Phase C then runs `define-design` →
`build-<target>` **hands-off** (offline scaffold, no `npm install`), halting only on a genuine failure.
The wiring into the existing pipeline is **additive**: each of the seven sub-skills
(`define-project`, `roast`, `storm-research`, `define-design`, `build-app`/`-mobile`/`-plugin`) gains a
`## Autonomous invocation (driven by `autopilot`)` note — infer the recommended defaults, flag each
`(assumed — confirm later)` and report it upward, skip its own interview/confirm gate, hand the KILL/RESHAPE
decision to `autopilot` — with **every skill's attended interview and gates left byte-for-byte unchanged**
(the note mirrors the sync skills' `## Unattended invocation` note). A **decision ledger** under
`outputs/autopilot/<date>-<slug>/` (`intake.md` · `plan.md` · `decisions.md` · `run.md`, run-state in
`outputs/runs/autopilot.json`) records every autonomous call with stable `ap-YYYYMMDD-NNN` ids, shifting
approval from **approve-before-each-step to decide-then-review-after**. Autopilot **delegates its grunt
work to the Phase 14 `.claude/agents/` fleet** (research lenses → `web-researcher`, etc.) rather than
inventing its own workers, and reconciles the `build-*` "never unattended" rule cleanly: that rule is
about the cron loop, so `autopilot` is **user-initiated and NEVER added to `maintenance-loop`** — the
unattended tick never chains into it or the build skills. It stays **Tier 0** (mock/local data, no
backend, keys, or accounts; nothing collected in chat), and it **writes no `change-log.md` line of its
own** — the sub-skills write their own provenance and `improve-system` remains the single applier, with
`raw/` immutable and only the run folder + the sub-skills' canonical artifacts touched. Deferred to later
tiers: looping `improve-system`/`advise-project` into the run, multi-target builds in one pass,
deeper/keyed (Tier 1+) builds, and a silent no-grill mode for the confident user. Full design:
`docs/superpowers/specs/2026-07-01-autopilot-design.md`; how-to: `docs/AUTOPILOT.md`.

## Phase 16 addendum — `autopilot` multi-target (2026-07-01)

Phase 16 makes `autopilot` **multi-target**: the Phase A grill's target question becomes a **multi-select** — the user picks any combination of web (`app/`) / phone (`mobile/`) / browser extension (`plugin/`), with `config.default_targets` (now an array, replacing the single `default_target` string) pre-seeding the recommendation — so one grill, one plan-confirm, and one run can produce all three platforms from the same charter + design + vetting north-stars. Phase C's build sequence is updated accordingly: **`define-design` runs once** (a failure there still halts everything, since every build target depends on it), and then `build-<target>` runs **once per selected target** from the shared `wiki/design-system.md`; each build is **independent** — a failure on one target is logged (marking that target `failed` in the new per-target `targets` map in `outputs/runs/autopilot.json`) and the run **continues to the next target**, ending with a `completed_with_failures` status so a re-run retries only the unbuilt or failed targets. The `plan.md` keys its target-specific sections by folder (`app/` / `mobile/` / `plugin/`) so each builder finds its own slice, and Phase D's preview lists one launch command per built platform. This is an **autopilot-only change** — the `build-*` skills are **byte-for-byte unchanged**: they already scaffold their own folder and compose into the shared `wiki/build.md` (Web / Mobile / Browser-extension sections), so they compose cleanly into the loop with no modification. `autopilot` remains **Tier 0** (mock/local data, no keys or accounts), **user-initiated**, and **never added to `maintenance-loop`** — the unattended tick is still barred from chaining into it or the build skills. Deferred to later tiers: parallel (concurrent) target builds, looping `improve-system`/`advise-project` into the run, deeper/keyed (Tier 1+) builds, and a silent no-grill mode. Full design: `docs/superpowers/specs/2026-07-01-multi-target-autopilot-design.md`; how-to: `docs/AUTOPILOT.md`.

## Phase 17 addendum — `autopilot` loop-aware (post-build advise) (2026-07-01)

Phase 17 makes `autopilot` **loop-aware**: a new **Phase E** — the final step, placed after Phase D's hand-over — runs **`advise-project`** in a **post-build focus** grounded on the just-built project: the charter's `Later`/`Out` deferred items (→ `scale`/`improve` ideas), the decision ledger's `(assumed — confirm later)` flags in `outputs/autopilot/<date>-<slug>/decisions.md` (→ `maintain`/validate ideas), the build record (`raw/builds/` + the run's `plan.md`/`run.md` + per-target outcomes, so advise-project knows what exists now), and the deferred tiers (real data, deploy, more build targets → next-step ideas) — filing a ranked "what's next" list to `outputs/ideas-*.md` exactly as in a normal advise run. **Nothing is applied and there is no confirm gate**: `advise-project` is propose-only by design, `improve-system` remains the single applier, and the user approves any idea they like before anything changes. A config flag `advise_after_build` (default `true`) gates Phase E so it can be disabled without touching the skill. The wiring into `advise-project` is **additive**: a single `## Post-build invocation` H2 is appended (focusing its four lenses on the just-built context, noting that `raw/metrics/` will be empty for a fresh build and to ground on the charter/ledger/build-record instead) — its attended behavior and maintenance-loop (unattended) behavior are byte-for-byte unchanged. This is therefore an **autopilot-only change**: `improve-system`, `maintenance-loop`, the `build-*` skills, the `define-*`/`roast`/`storm-research` skills, and `raw/` are all untouched. `improve-system` was deliberately excluded from Phase E — it is inward-facing (applies changes to the knowledge system), the wrong tool for improving the user's just-built product. The arc is now **define → vet → design → build → advise**; `autopilot` remains **Tier 0** (mock/local data, no keys or accounts), **user-initiated**, and **never added to `maintenance-loop`**. Remaining deferred tiers: real-data/keyed builds and a silent no-grill mode for the confident user. Full design: `docs/superpowers/specs/2026-07-01-loop-aware-autopilot-design.md`; how-to: `docs/AUTOPILOT.md`.

## Phase 18 addendum — `build-backend` (real-data/backend tier) (2026-07-01)

Phase 18 adds a new attended `build-backend` skill — the "make it real" `build-*` sibling — that upgrades the built mock-data web `app/` into a real-data, backend-ready app: a Supabase migration (columns typed from `src/data/` fixtures, relationships/RLS-intent from the charter, seed derived directly from the mock arrays, RLS = shared-read/authenticated-write by default) + a **graceful-off** pluggable data layer (`DataStore` / `MockStore` / `SupabaseStore` [dynamic-import] / `getActiveStore()` mirroring `aios/server/kb/store.ts`) + email auth (inert without keys) + tests + `app/.env.example` — **scaffolded fully offline (no keys)**, with the one keyed **go-live** step (create the project, paste two keys, run the migration) deliberately the human's, per the standing "keys never in chat / never publish" rule; the graceful-off layer means the app runs on mock data until go-live so a scaffold never breaks it; provenance rides the shared spine (`raw/builds/` tagged `layer: backend` + a `## Backend (Supabase)` section in `wiki/build.md` + one `change-log.md` line); an **opt-in, default-off** autopilot backend-wire runs it as a tail of Phase C (web target only) so the hands-off arc can reach a backend-ready app; a captured `docs/PATH-TO-PRODUCTION.md` roadmap places this as the first of six rungs (real-data → testing → audit → deploy/observability → a `ship-check` GO/NOT-YET gate → polish/compliance); **web-first** (mobile/plugin backends + non-Supabase providers + realtime/storage/payments deferred); attended-only, never in `maintenance-loop`; `improve-system` stays the single applier and `raw/` immutable; the `build-app`/`build-mobile`/`build-plugin` skills are byte-for-byte unchanged. Full design: `docs/superpowers/specs/2026-07-01-build-backend-design.md`; how-to: `docs/BUILD-BACKEND.md`.

## Phase 19 addendum — `test-app` (testing tier — path-to-production rung 2) (2026-07-01)

Phase 19 adds a new attended `test-app` skill — the "prove it works" `build-*` sibling and the second rung of `docs/PATH-TO-PRODUCTION.md` — that gives the already-built web `app/` a **real, runnable test suite**: Vitest + Testing Library (jsdom) + a Playwright `e2e/` layer + `@vitest/coverage-v8` + `test`/`test:watch`/`test:coverage`/`test:e2e` scripts, generated **offline (nothing installed)** and, the differentiator, **mapped to the charter's `## Success & outcomes` criteria** — each criterion becomes either an automatable Playwright flow or a flagged `manual/metric — not automatable` note (honest coverage, no "fully tested" overclaim). Levels: unit (utils + `src/data/` accessors + the store fallback), component (each page mounts + shows a known fixture value + forms validate), E2E (per-route smoke + the automatable criteria flows). It **requires a built `app/`** (routes to `build-app` if absent), one confirm gate, and **extends** an existing test setup (from `build-backend` or a prior run) rather than duplicating it (deps added only if absent). It **offers** the run and — exactly as `build-app` offers to start the dev server — runs the unit tests only on an explicit yes (`cd app && npm install && npm test`); the Playwright browser download stays the user's. Provenance rides the shared spine (`raw/builds/` tagged `layer: tests` + a `## Tests` section in `wiki/build.md` + one `change-log.md` line) plus a coverage/criteria manifest at `outputs/tests/<date>-<slug>/TEST-PLAN.md`. A new **`test-writer`** agent joins the fleet (7th; sonnet; Read/Write/Edit/Bash) — a *scoped writer* like `implementer` (test files only) whose job is write-tests → run `vitest` → iterate to green (authors-not-runs when deps aren't installed). An **opt-in, default-off** autopilot integration (`test_after_build`) runs `test-app` as a tail of Phase C (web only, after any backend wire, before the hand-over). Attended-only, never in `maintenance-loop`; `improve-system` stays the single applier and `raw/` immutable; the `build-app`/`build-mobile`/`build-plugin`/`build-backend` skills are byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Full design: `docs/superpowers/specs/2026-07-01-test-app-design.md`; how-to: `docs/TEST-APP.md`.

## Phase 20 addendum — `audit-app` (audit tier — path-to-production rung 3) (2026-07-01)

Phase 20 adds a new `audit-app` skill — the "prove it's safe" tier and the third rung of `docs/PATH-TO-PRODUCTION.md` — that reads the already-built web `app/` + charter and produces **one prioritized findings report** across three lenses in a single skill (the roadmap's `security-audit` + accessibility/performance siblings resolved to one `audit-app` with three lenses, matching how rungs 1–2 were reconciled): **security** (dependency review + `npm audit` offered, offline secret scan, authz/RLS + input-validation/injection/XSS code review, an OWASP-style checklist), **accessibility (WCAG)** (static JSX review + color-contrast from the design-system tokens; axe/Lighthouse offered), and **performance** (static bundle/asset/render review; `npm run build` + Lighthouse offered). Its defining trait — **propose-only, mirroring `codex-review`**: it writes **only** `outputs/audits/<date>-<slug>/AUDIT.md` (+ `outputs/runs/audit-app.json`), tagged with the `CRITICAL > MAJOR > MINOR > INFO` severity canon, and **never modifies the app, never auto-fixes, and never writes the `raw/builds` / `wiki/build.md` / `change-log.md` provenance spine** that the `build-*`/`test-app` skills use (an audit is a proposal, not an applied change) — so `improve-system` stays the single applier. A direct consequence: **no confirm gate** (it changes nothing, like `codex-review`). Reasoning-first and fully offline; `npm audit` / Lighthouse / axe are **offered, never run** (offer-don't-run — run only on an explicit yes, never the browser download unprompted). It **requires a built `app/`** (routes to `build-app` if absent). **No new fleet agent** (it reasons in-skill, may delegate a deep-read to the read-only `code-reviewer` or the built-in `Explore`, adds none — `docs/SUBAGENTS.md` untouched). An **opt-in, default-off** autopilot integration (`audit_after_build`) runs it as a web-gated Phase C tail (after build + any backend-wire + test, before hand-over; chain = build → backend → test → audit → advise), surfacing at/above-`caution_severity` findings to the ledger. **On-demand + autopilot-opt-in; NOT in `maintenance-loop`** (propose-only makes a loop hook possible later, as `codex-review` has — deferred). Web-first (mobile/plugin audits later). `improve-system`/`maintenance-loop`/`codex-review`/the `build-*`+`test-app` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Full design: `docs/superpowers/specs/2026-07-01-audit-app-design.md`; how-to: `docs/AUDIT-APP.md`.

## Phase 21 addendum — deploy & operate (`deploy` + `sync-metrics`) (path-to-production rung 4) (2026-07-02)

Phase 21 ships the fourth path-to-production rung as **two skills**. **`deploy`** (attended, `build-*` sibling, web-first) scaffolds — fully offline — a hosting target (**Vercel** default, `provider`-configurable), a CI **quality-gate** workflow (`.github/workflows/deploy-app.yml` at the repo root: install → typecheck → the `test-app` suite if present → build; **no deploy token / no deploy step** — Vercel's Git integration deploys on push, so the workflow only proves the build is green), an `app/.env.production` env template, and **graceful-off observability** (a `@sentry/react` error tracker that dynamic-`import()`s only when `VITE_SENTRY_DSN` is present + a vendor-neutral analytics `track()` hook — inert without keys, mirroring `build-backend`'s SupabaseStore pattern), then hands over `outputs/deploy/<date>-<slug>/GO-LIVE.md`. **It never deploys, publishes, enters keys, or creates accounts** — deploying/publishing is a prohibited action, so the human pulls the trigger (the `build-backend` go-live boundary, applied to shipping); attended, one confirm gate, **never in `maintenance-loop`**, and **deliberately NOT wired into `autopilot`** (deciding to ship is a human decision, not a hands-off step — its `## Autonomous invocation` note documents that exclusion; no autopilot change ships). Provenance rides the build spine (`raw/builds/` tagged `layer: deploy` + a `## Deploy` section in `wiki/build.md` + one `applied` change-log line). config = `{app_dir:"app", provider:"vercel", ci:"github-actions", include_error_tracking:true, include_analytics:true}`. **`sync-metrics`** (a new **4th sync skill**, unattended, graceful-off, shaped like `sync-ecosystem-data`) closes a loop open since Phase 6: `advise-project` already read `raw/metrics/*.json` but nothing produced it (`docs/METRICS-FEED.md`: "you own the wiring"). It pulls the latest numbers from a configured analytics provider and writes an **idempotent daily** snapshot `raw/metrics/<date>-dau.json` in the exact METRICS-FEED schema (`captured_at` + `metrics{dau,wau,mau,d1_retention,d7_retention,signups,errors,feature_usage}`), skipping+logging when unconfigured (keys from env only, never entered), one-per-day (skip-if-exists; `-2` on a forced re-pull, never overwriting — honoring `raw/` append-only), + an `auto` change-log line like its siblings. It joins the **`data-ingestion`** orchestrator (3 sync skills → 4) so on each `maintenance-loop` tick it runs **before** `advise-project` — finally feeding the advisor. config = `{provider:"" (empty ⇒ skip), metrics:[…], lookback:"1d"}`. Loop wiring is additive/graceful-off (data-ingestion frontmatter+list, maintenance-loop step-1 parenthetical, an advise-project metrics-producer note + the bare "deploy" deferred-tier upgraded to `deploy → the deploy skill` + a latent "single change-log.md writer" phrasing tightened to "single applier of the self-improvement lanes"); the three existing sync skills + the loop's safety unchanged. **No new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched). `improve-system`/`codex-review`/`build-*`/`test-app`/`audit-app` byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Web-first (mobile app-store / plugin web-store publishing later; other hosting providers behind the `provider` key). Full design: `docs/superpowers/specs/2026-07-02-deploy-design.md`; how-to: `docs/DEPLOY.md`.

## Phase 22 addendum — `ship-check` (the go/no-go gate — path-to-production rung 5) (2026-07-02)

Phase 22 adds a new `ship-check` skill — the "go/no-go" gate and the fifth rung of `docs/PATH-TO-PRODUCTION.md` — that reads the already-built web `app/` + charter + the artifacts the prior rungs left behind and returns **one GO / NOT-YET production-readiness verdict** across **eight checks**: `build` (a real buildable app), `data` (real backend wired vs. mock-only), `tests` (a suite mapped to the charter criteria), `audit` (an `outputs/audits/` report present + clean), `deploy` (hosting/CI/env config present), `content` (no placeholder/lorem copy), `legal` (privacy/terms/consent when data is collected), and `criteria` (the charter's `## Success & outcomes` met). It is the production analog of `roast`'s idea gate — where `roast` pressure-tests an idea before building, `ship-check` pressure-tests a built app before shipping. Its defining trait — **propose-only, mirroring `audit-app`**: it writes **only** `outputs/ship-check/<date>-<slug>/SHIP-CHECK.md` (+ `outputs/runs/ship-check.json`), tagged with the `CRITICAL > MAJOR > MINOR > INFO` canon, and **never modifies the app, never auto-fixes, and never writes the `raw/builds` / `wiki/build.md` / `change-log.md` provenance spine** (a verdict is a proposal, not an applied change) — so `improve-system` stays the single applier; and, unlike `roast`, it writes **no** `wiki/vetting.md` index and **no** `auto` change-log line (it stays purely in the `outputs/` lane). A direct consequence: **no confirm gate** (it changes nothing). The verdict is severity-gated by `block_severity` (default `MAJOR`): findings at/above it are **blocking** (→ NOT-YET), below are **advisory** (a GO can still list them); default severity scales by charter relevance (`build`/`tests`/`audit`/`deploy`/`content` are flat ship-required; `data`/`legal`/`criteria` scale). Reasoning-first and fully offline; the test suite / `npm audit` / `npm run build` + Lighthouse are **offered, never run** (offer-don't-run), and it **never runs the other rungs for you** — it *routes* you to them. It **requires a built `app/`** (routes to `build-app` if absent). **No new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched). Config = `{app_dir:"app", checks:[build,data,tests,audit,deploy,content,legal,criteria], block_severity:"MAJOR"}`. **On-demand only; NOT in `maintenance-loop`; and deliberately NOT in `autopilot`** — a readiness verdict is a human decision point, and it aggregates rungs autopilot doesn't run (`deploy` + the default-off test/audit tails), so an autopilot ship-check would trivially return NOT-YET; the exclusion is documented in its own `## Autonomous invocation` note (mirroring `deploy`), and **no `autopilot` file changes** (SKILL.md + config.json untouched). Web-first (mobile/plugin readiness later). `improve-system` / `maintenance-loop` / `autopilot` / the `build-*` / `test-app` / `audit-app` / `deploy` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Full design: `docs/superpowers/specs/2026-07-02-ship-check-design.md`; how-to: `docs/SHIP-CHECK.md`.

## Phase 23 addendum — `polish` (make it legitimate — path-to-production rung 6, the final rung) (2026-07-02)

Phase 23 adds a new `polish` skill — the "make it legitimate" tier and the sixth and final rung of `docs/PATH-TO-PRODUCTION.md` — completing the ladder define → vet → design → build → test → audit → ship → **polish**. Unlike the propose-only `audit-app`/`ship-check`, `polish` **modifies the built web `app/`** and so takes the **`build-*` shape** (attended, one confirm gate, provenance spine: `raw/builds/<date>-<slug>.md` tagged `layer: polish` + a `## Polish` section in `wiki/build.md` + one `change-log.md` `applied` line — `improve-system` stays the single applier). It runs configurable **areas** over the app: **`content`** (real charter-derived copy in the design-system Voice, replacing `build-app`'s placeholder/mock text; assets it can't generate are scaffolded as flagged placeholders — never claimed), **`states`** (onboarding/first-run + empty/error/loading states `build-app` omits), **`legal`** (privacy policy + terms + cookie-consent banner as **TEMPLATES** with `[FILL IN]` fields + a prominent unremovable **"not legal advice — have a lawyer review; does not by itself make you GDPR/CCPA compliant"** notice — scaffolds presence + a fill-in checklist, **never claims compliance**), **`docs`** (a real `app/README.md` + a user guide), and an **opt-in, default-off `payments`** area — a **graceful-off Stripe scaffold** (mirroring `build-backend`'s SupabaseStore + `deploy`'s Sentry) with **three honest states so the app never breaks** (no key → inert "not configured"; key present but no checkout endpoint → "not fully set up — finish the server step" [never calls a missing endpoint — the Phase-18 keys-present-schema-missing analogue]; key + endpoint → dynamic-`import()` Stripe + real Checkout), with only `VITE_STRIPE_PUBLISHABLE_KEY` in `app/.env.example` and `STRIPE_SECRET_KEY` documented **only** in `GO-LIVE.md` as a server-only secret. Three load-bearing safety boundaries: **legal = templates not legal advice / never claims compliance**; **payments never enter keys / create an account / charge** (financial transactions are a prohibited action — the human does the keyed go-live via `outputs/polish/<date>-<slug>/GO-LIVE.md`); **assets = honest flagged placeholders**. It **closes the `content`/`legal` gaps `ship-check` flags** (re-run ship-check → ✅). Config = `{app_dir:"app", areas:["content","states","legal","docs"], include_payments:false}`. **NO new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched). **Attended, one confirm gate; NOT in `maintenance-loop`; and deliberately NOT in `autopilot`** — "make it legitimate" involves brand/legal/financial decisions that are the user's; the exclusion is documented in its own `## Autonomous invocation` note (mirroring `deploy`), and **no `autopilot` file changes**. Web-first (mobile/plugin polish later). This phase also **raised the CLAUDE.md line cap 125 → 150** (self-contained; the "Maintaining this file" note now documents offloading a section to a referenced `docs/*.md` as the next lever) to give the skills list durable room. `improve-system` / `maintenance-loop` / `autopilot` / the `build-*` / `test-app` / `audit-app` / `deploy` / `ship-check` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `advise-project` + docs). Full design: `docs/superpowers/specs/2026-07-02-polish-design.md`; how-to: `docs/POLISH.md`.

## Phase 24 addendum — `maintain-app` (operate & maintain — path-to-production rung 7) (2026-07-03)

Phase 24 adds a new `maintain-app` skill — the "operate & maintain" tier and **rung 7** of `docs/PATH-TO-PRODUCTION.md` — the first rung that runs *after* launch, keeping a shipped `app/` healthy on a schedule. It was brainstormed to "auto-patch to a gated PR" + loop-engineering strategies, then **reshaped by `roast` (RESHAPE, high) and a citation-verified `storm-research`** (`outputs/vetting/2026-07-03-maintain-app/`; 22 sources, 0 fabricated / 8 corrected / 7 demoted) into a **report-first** design: the deliverable is ONE plain-language health report (the Renovate *Dependency Dashboard* pattern), a SAFE-PR is the rare exception, and dependency/CVE patching is **delegated to Dependabot/Renovate** behind a **~7-day `min-release-age` cooldown** (surfaced + explained, **never auto-bumped** — "green tests" is not a supply-chain safety proof: the Axios Mar-2026 + Shai-Hulud Sep-2025 attacks arrived as green-CI-passing bumps). Each tick: write the sentinel → cheap "did anything change?" trigger (no-op ticks suppressed) → reused collectors (`deps`=npm-audit/Dependabot enumerate-only, `tests`=test-app, `audit`=audit-app, `codex-review`=opt-in) → three-bucket triage (SAFE-PR / REVIEW [all deps here] / ASK, `improve-system`'s model) → SAFE-PR onto a new branch with **verify-or-demote** (test-app + audit-app gates green → open PR / offline stage the branch; not green → revert + demote) each carrying a mandatory "what I did NOT verify" block → ONE `outputs/maintenance/<date>-<slug>/REPORT.md` with a non-technical "healthy / one thing to do / bring a developer" degradation. **Propose-only/outputs-only** (PRs are proposals; `improve-system` stays the single applier; no `raw/` mutation, no `change-log.md` line). The hardest requirement — **never merge/deploy/publish/enter-keys** — is enforced by a **real, sentinel-scoped `PreToolUse` guard hook** (`hooks/guard.mjs`, registered in `.claude/settings.json` at setup, no-op unless `outputs/runs/maintain-app.lock` is present + fresh, stale-lock-safe), not a prompt. **Hybrid scaffold**: a local Routine (offline sandbox — stages branches + reports) + a keyed GitHub Actions workflow (the real home — opens PRs; inert until the `ANTHROPIC_API_KEY` secret is added) — the CI workflow, the `.github/dependabot.yml` cooldown config, and the settings-hook registration ship as **templates inside `SKILL.md`** that setup scaffolds into the *user's clone* (the template commits none active; `guard.mjs` ships inert), matching how `deploy` handles its workflow and keeping the template ship-clean. Config = `{app_dir:"app", cadence:"weekly", signals:["deps","tests","audit"], safe_pr_classes:["lint","format","mechanical-a11y","dead-code","doc-drift"], safe_pr_min_precision:0.9, dependency_cooldown_days:7, max_safe_prs_per_tick:3, caution_severity:"CRITICAL"}`. **Attended setup, one confirm gate; runs on its OWN schedule — NEVER inside `maintenance-loop`** (which maintains the KB) **and deliberately NOT an `autopilot` phase** (like `deploy`/`polish`/`build-mcp`); its `## Autonomous invocation` note documents that placement. **NO new fleet agent** (`docs/SUBAGENTS.md` + `.claude/agents/` untouched; reuses `implementer` for SAFE-PRs + `audit-app`/`test-app`/`codex-review` as collectors). The **48-hour validation gate** (a hand-run tick on a real shipped app, judged by a technical + a non-technical reader) is a documented precondition to trusting it. `improve-system` / `maintenance-loop` / `autopilot` / the `build-*` / `test-app` / `audit-app` / `deploy` / `ship-check` / `polish` skills byte-for-byte unchanged (visibility wired via `what-can-i-do` + `ship-check` + `advise-project` + docs). Web-first (mobile/plugin maintenance later). Full design: `docs/superpowers/specs/2026-07-03-maintain-app-design.md`; how-to: `docs/MAINTAIN-APP.md`.
