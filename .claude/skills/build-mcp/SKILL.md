---
name: build-mcp
description: Use when someone asks to "make my app agent-accessible", "add an MCP server", "let Claude/ChatGPT use my app", "expose my app to AI agents", "make my app work with AI assistants", or says "/build-mcp". Generates a READ-ONLY Model Context Protocol server over the already-built app's data layer, so AI agents can query it in natural language. Reads the app's src/data/ (or build-backend's src/data/store/) + wiki/charter.md; one confirm gate; scaffolds fully OFFLINE (a local stdio server over mock data — no keys). Read-only by construction (no create/update/delete tools). Remote go-live (Streamable HTTP + OAuth + real backend) is a keyed checklist step it never does for you. Requires a built app/. Attended-only — never in the maintenance loop, and deliberately not in autopilot. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to use your app + charter, or name the entities to expose]"
---

# build-mcp

The "make it agent-accessible" step. `build-app` gives a human a themed web app; `build-backend` makes its
data real. This skill makes that same app **operable by AI agents** — Claude, ChatGPT, or any MCP client —
by generating a **read-only Model Context Protocol (MCP) server** over the app's existing data layer. A user
can then ask their assistant *"using my app, what's outstanding and who owes me the most?"* and get an answer
assembled from the app's own data, without opening the app.

What it produces (all **offline, no keys**): a new top-level **`mcp/`** folder — a small MCP server that
wraps the app's `DataStore` as **read-only `list_<entity>` / `get_<entity>` tools**, each annotated
`readOnlyHint`, runnable immediately over **local stdio on the app's mock data** (`npm run mcp`), plus a
**go-live checklist** at `outputs/mcp/<date>-<slug>/GO-LIVE.md` for the one keyed step it never does — taking
it **remote** (Streamable HTTP + OAuth over the real backend). It is **read-only by construction**: no
create/update/delete tool is ever generated, so an agent cannot take an irreversible action through it.

## When to use

When the user says "make my app agent-accessible", "add an MCP server", "let Claude/ChatGPT use my app",
"expose my app to AI agents", or `/build-mcp`. Also offered by `what-can-i-do` and pointed to by
`advise-project` as a next step after a build. It **requires an already-built `app/`** (from `build-app`;
richer once `build-backend` has run). It is **attended** — one confirm gate before scaffolding — and **never
runs in the unattended `maintenance-loop`**, and **deliberately not in `autopilot`** (it leads to a keyed
remote go-live, like `deploy`/`polish`).

## Configuration

Read `.claude/skills/build-mcp/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the built app whose data layer is exposed.
- `mcp_dir` (default `"mcp"`) — where the server is written (a build target outside the knowledge folders).
- `transport` (default `"stdio"`) — the Tier-0 transport (local, keyless). Remote (`streamable-http`) is the
  keyed go-live step, not scaffolded live.
- `include_writes` (default `false`) — **keep false.** Write tools (create/update/delete) are a later,
  opt-in, confirmation-gated tier; v1 is read-only by construction.
- `max_entities` (default `12`) — the cap on entities wrapped in one pass (the runaway-scope guard).

## Procedure

### Phase 0 — Pre-flight (require the app; read the data layer; route, don't guess)

1. **A built `app/` (required).** There is nothing to expose without it.
   - **Missing →** offer `build-app` first: *"An MCP server exposes an app you've already built. Want me to
     build the app first, then make it agent-accessible?"* On yes, run `build-app`, then continue. On no,
     stop gracefully (nothing to expose).
     *(If a `plugin/` or `mobile/` exists here instead, say so plainly: this tier covers the web `app/` only
     today — exposing mobile/extension targets is a later phase — don't steer a plugin/mobile builder to
     build a web app.)*
   - Read the app's **data layer** — prefer `build-backend`'s `app/src/data/store/` (the `DataStore`
     interface + `getActiveStore()`); if that's absent, read `app/src/data/`'s `getX()`/`listX()` accessors.
     **This is the source of truth for the entities and their read methods.**
2. **Charter — `wiki/charter.md` (recommended).** Read `## Purpose` / `## Audience` / `## Scope` for what
   each entity *means* — this is the source of the **agent-tuned tool descriptions** (the one non-mechanical
   input; see Phase 1). Missing → derive descriptions from entity/field names and flag `(assumed)`.
3. **Existing `mcp/` →** switch to **incremental mode** (see *Re-running*).

### Phase 1 — Derive the tool catalog (read-only)

From the data layer, derive one **entity descriptor** per entity: its `name` (singular) and `plural` (used
for the `list_<plural>` tool), its `list`/`get` read-method names, an `id` `keyDesc`, a one-line **summary**,
and an optional agent-facing **hint** (*when* to use the tool —
e.g. "use to compute outstanding balance"). This catalog is the only app-specific input; the generic adapter
(below) turns it into tools mechanically.

- **Read-only tools only:** `list_<plural>` and `get_<entity>` per entity, plus `get_<singleton>` for any
  settings/summary record. **Never** emit create/update/delete (regardless of what write methods the
  `DataStore` exposes) — `include_writes` stays false in v1.
- **List-only entities:** the generic adapter registers **both** `list_` and `get_` per entity, so an
  entity the app only *lists* (a `listX` with no `getX` — e.g. sponsors) needs a **synthesized `getX`**
  (find-by-id) added to the `store.mjs` bridge. The bridge may expose read methods the UI never needed.
- **The tool descriptions are the craft** ("MCP issue 4: UX"): draft each from the charter + field names so
  an agent can pick the right tool unaided, and **flag the drafted descriptions for a quick human review** at
  the gate — this is the one part that isn't pure codegen.
- Cap at `config.max_entities`; if the app has more, wrap the **core** entities and list the rest under
  `Later (not in this pass)`.

### Phase 2 — Confirm once, then scaffold

Show the plan in **one message** and ask **one** question. Include:
- the entity list → the read-only tools each becomes (`list_…`, `get_…`),
- the drafted tool descriptions (for the quick review),
- that it is **read-only by construction** — no write tools, so an agent can read but never change or delete
  anything,
- the **Tier-0 promise**: *"it runs locally over your app's sample data with no keys; taking it remote so a
  hosted assistant can reach it is a separate, optional step you own,"*
- that nothing here needs a key and nothing is installed or deployed.

Ask: *"Generate a read-only MCP server for your app? I'll scaffold it offline — you'll be able to run it
locally right away, and I'll hand you a checklist for the optional remote step. (yes / tweak something)"* On
"tweak", revise and show again. **No per-tool interrogation.**

### Phase 3 — Scaffold the MCP server (offline; no keys; read-only)

Create `mcp/` as its own minimal project — all offline, no network, no keys:

```
mcp/
├── package.json          # type:module; deps @modelcontextprotocol/sdk + zod; scripts: mcp (server), probe (smoke)
├── README.md             # what it is, npm run mcp, the Claude Desktop / .mcp.json config, read-only note
├── src/
│   ├── adapter.mjs       # the GENERIC DataStore->MCP compiler pass (copied from this skill's assets/)
│   ├── catalog.mjs       # the per-app entity descriptor derived in Phase 1 (the only app-specific file)
│   ├── store.mjs         # read-only bridge: a self-contained JS mirror of app/src/data fixtures (a plain .mjs can't import the app's TS); a real backend points it at getActiveStore()
│   ├── server.mjs        # ~10 lines: import store+catalog, mount read-only tools, connect stdio transport
│   └── probe.mjs         # a tiny MCP client that lists tools + runs one read to prove it works
```

1. **Copy the generic adapter** from `.claude/skills/build-mcp/assets/adapter.mjs` into `mcp/src/` unchanged
   — it reflects the catalog into `list_`/`get_` tools with `readOnlyHint` annotations and has **no code path
   that registers a write tool** (read-only is structural, not a promise).
2. **Generate `catalog.mjs`** from Phase 1 (entities + singletons + the reviewed descriptions).
3. **Generate `store.mjs`** — a read-only bridge exposing only the read methods the catalog names.
   **Tier-0 default = a self-contained JS mirror**, not a live import: a generated `mcp/` is plain-Node
   ESM (`.mjs`) and **cannot `import` the app's `app/src/data/*.ts`** (TypeScript + `@/` path aliases +
   extensionless imports) without a build step or a TS loader — so `store.mjs` mirrors the app's fixtures
   as plain JS plus the same `listX()/getX(id)` methods (this is exactly what the proven spike does,
   `spike-mcp/src/datastore/store.mjs`). Note the one trade-off in the file's header comment: the mirror
   can **drift** from `app/src/data/` if the app's data changes — re-run `build-mcp` to refresh it.
   *(Zero-drift alternatives, both optional: run the server under a TS runtime like `tsx` so it can import
   the app's accessors directly; or — the real endgame — where `build-backend` ran, point `store.mjs` at
   `getActiveStore()` (stays on `MockStore` with no keys — the same graceful-off switch), which has no
   drift because it reads the app's live data layer.)*
4. **Wire `server.mjs`** — `McpServer` + the adapter + `StdioServerTransport`. Stdio = local, keyless.
5. **`package.json`** — `@modelcontextprotocol/sdk` + `zod`; scripts `mcp` and `probe`. **`.gitignore`**
   node_modules.
6. **`README.md`** — how to run (`cd mcp && npm install && npm run mcp`), the Claude Desktop /
   `.mcp.json` config block pointing at `mcp/src/server.mjs`, and the read-only-by-construction note.

**Graceful-off / read-only are structural, not aspirational:** the server runs on the app's mock data with
zero keys, and there is simply no write tool to call. Confirm both hold before handing over (the `probe`
script lists the tools — every one `readOnlyHint`, none mutating).

### Phase 4 — Record it (provenance)

The **code** lives in `mcp/` (a build target outside the knowledge folders, like `app/`). The **record**
lands in the knowledge base:
- **`raw/builds/<YYYY-MM-DD>-<slug>.md`** *(immutable, append-only; `-2` for same-day re-runs)* — RAG
  frontmatter, then: the entity→tool list, the read methods wrapped, the transport (stdio), the read-only
  posture, and anything deferred. **Tag it `layer: mcp`** (in the frontmatter `tags` and a `layer:` line) so
  it's distinct from the front-end / backend build records.
- **`wiki/build.md`** — add a **`## MCP (agent access)`** section (preserving the Web/Mobile/Browser-extension
  /Backend sections): the tool list, where the server lives (`mcp/`), the read-only note, and links to the
  `raw/builds/` record + the go-live checklist. Cross-link from `wiki/index.md` if not already.
- **`outputs/change-log.md`** — append one attributed line (newest-at-top):
  `- <YYYY-MM-DD> — build-mcp — generated read-only MCP server (mcp/) over app/ data layer — applied`

`improve-system` stays the single applier — this skill only writes its own `applied` line, exactly as the
other `build-*` skills do.

### Phase 5 — Hand over (run locally now; remote is the keyed checklist)

Local is immediate; **remote is offer-don't-run**. Close in plain words, then write the go-live steps to
**`outputs/mcp/<YYYY-MM-DD>-<slug>/GO-LIVE.md`** (RAG frontmatter + the steps). **Never** enter a key, deploy,
or host it for them. The checklist says exactly:

> **Try it locally now (no keys):** `cd mcp && npm install && npm run mcp`. To let your assistant use it, add
> it to Claude Desktop (Settings → Developer → Edit Config) or a project `.mcp.json`:
> ```json
> { "mcpServers": { "<app>": { "command": "node", "args": ["<abs path>/mcp/src/server.mjs"] } } }
> ```
> Then ask, in plain English, a question about your data. It's read-only — the assistant can read but never
> change anything.
>
> **To take it remote (optional, so a hosted assistant can reach it — this is the keyed step, and it's
> yours):** switch the transport to Streamable HTTP, put it behind **OAuth 2.1** (the 2026 MCP spec's auth),
> point `store.mjs` at your real backend (run `build-backend` first if you haven't), and host it. Keys and
> hosting stay with you — this skill never enters them.

Close: *"Your app is now agent-accessible locally — run `npm run mcp` and point Claude Desktop at it. Taking
it remote is the one optional step that's yours (`outputs/mcp/<date>-<slug>/GO-LIVE.md`). Want me to walk you
through the local hookup?"*

## Re-running (incremental, never clobber)

If `mcp/` already exists, switch to **incremental mode**: read the existing `mcp/` + latest `raw/builds/` mcp
record, diff the current data layer against the wrapped catalog, and at the confirm gate offer: **add
entities**, **refresh descriptions**, or **both**. Write **new** files freely; for any **existing** file, show
a diff and **confirm before overwriting**. Each re-run writes a **new** `raw/builds/` record. Never enable
write tools without an explicit, separately-confirmed opt-in.

## Rules & guardrails

- **Read-only by construction.** v1 generates only `list_`/`get_` tools; the adapter has no path to a write
  tool. An agent can read the app's data but can never create, update, or delete — the safe answer to
  "attended for anything irreversible." Write tools are a later, opt-in, confirmation-gated, domain-function-
  routed tier.
- **Keys never in chat; the human owns remote go-live.** The Tier-0 scaffold is local stdio over mock data
  and needs no keys. Taking it remote (Streamable HTTP + OAuth + real backend + hosting) is a checklist step
  the user performs; this skill never enters a key, hosts, or deploys.
- **Graceful-off = no broken server.** With no keys the server runs on the app's mock data over stdio.
- **Attended-only — never in `maintenance-loop`, never in `autopilot`.** It writes project source and leads to
  a keyed remote go-live; the unattended tick never runs it, and it is deliberately excluded from `autopilot`
  (mirroring `deploy`/`polish`).
- **`improve-system` stays the single applier; `raw/` is immutable.** It writes its own provenance
  (`raw/builds/` record + `wiki/build.md` section + one `change-log.md` line); code lives in `mcp/`.
- **Web `app/` only (v1).** Exposing `mobile/` / `plugin/` is a later phase.

## Output

A new `mcp/` folder (a runnable, read-only MCP server over the app's data layer), an immutable
`raw/builds/<date>-<slug>.md` record tagged `layer: mcp`, a new `## MCP (agent access)` section in
`wiki/build.md`, one `change-log.md` line, and `outputs/mcp/<date>-<slug>/GO-LIVE.md` — with the server
runnable locally on mock data immediately and the remote step left to the user.

## Autonomous invocation — deliberately excluded from `autopilot`

Unlike the `build-*` and vet/design skills, `build-mcp` has **no autopilot step**. It produces a
production-ish artifact that leads to a keyed remote go-live (like `deploy` and `polish`), and turning an app
into an agent surface is a decision the human should make explicitly — so `autopilot` never invokes it. This
exclusion is intentional; do not add a `build_mcp_after_build` autopilot hook. It remains **attended-only,
never in the `maintenance-loop`**, run on the user's request.
