# Making your app agent-accessible — the `build-mcp` skill

`build-mcp` is the "make it usable by AI agents" sibling of [`build-app`](BUILD-APP.md) and
[`build-backend`](BUILD-BACKEND.md). Once you have a built app — a themed front-end (`build-app`), ideally
with real data (`build-backend`) — `build-mcp` generates a **read-only MCP server** over the app's own data
layer, so an AI assistant (Claude, ChatGPT, or any MCP client) can answer questions about your data in plain
English, without you opening the app.

It came out of a vetted decision: a `roast` **RESHAPE** verdict + a citation-verified `storm-research`
briefing + a 48-hour spike (all in `outputs/vetting/2026-07-03-agent-accessibility/`). The spike proved the
approach is ~90% mechanical codegen and that a real agent, given only these read-only tools, answers
cross-entity questions better than clicking through the app — and even drafts follow-ups (like a payment
reminder) from the data.

## What it makes

A new top-level **`mcp/`** folder: a small [Model Context Protocol](https://modelcontextprotocol.io) server
that wraps your app's data as **read-only tools** — a `list_<things>` and `get_<thing>` for each entity
(clients, invoices, orders, whatever your app has). Every tool is annotated read-only. It runs immediately
over **local stdio on your app's sample data**, with **no keys**.

It is **read-only by construction**: the generator never emits a create/update/delete tool, so an agent can
*read* your data but can never change or delete anything. (Write tools are a deliberate later, opt-in tier.)

## How it works

1. **Reads your app's data layer** — the `list`/`get` accessors in `app/src/data/` (or the `DataStore`
   interface `build-backend` generated in `app/src/data/store/`). A missing `app/` → it offers `build-app`
   first.
2. **Derives a tool catalog** — one read-only `list_`/`get_` pair per entity, with **agent-facing
   descriptions** drafted from your charter (the one part that isn't pure codegen — it shows you the drafts
   to review).
3. **Asks once: "generate it?"** — then scaffolds `mcp/` offline: it copies a proven generic
   `DataStore → MCP` adapter, generates the small per-app catalog, and wires a stdio server.
4. **Records what it built** — an immutable note in `raw/builds/` (tagged `layer: mcp`), an MCP section in
   the shared `wiki/build.md` index, and a change-log line.
5. **Hands it to you** — run it locally right away, plus a checklist for the optional remote step.

## Trying it (no keys)

```
cd mcp
npm install       # one time — downloads the MCP SDK
npm run mcp       # starts the read-only server (local stdio)
npm run probe     # optional: lists the tools + runs one read to prove it works
```

To let your assistant use it, add it to **Claude Desktop** (Settings → Developer → Edit Config) or a project
`.mcp.json`, then ask a question about your data in plain English:

```json
{ "mcpServers": { "myapp": { "command": "node", "args": ["<abs path>/mcp/src/server.mjs"] } } }
```

Because it's read-only, the assistant can read but never change anything.

## Where things live

- **`mcp/`** — your MCP server's code. Like `app/` and `aios/`, it's a **build target**, not part of the
  knowledge base — yours to edit, outside the `raw/` / `wiki/` / `outputs/` discipline.
- **`raw/builds/<date>-<slug>.md`** — an immutable record of the build (tagged `layer: mcp`).
- **`wiki/build.md`** — the shared index gains a **MCP (agent access)** section.
- **`outputs/mcp/<date>-<slug>/GO-LIVE.md`** — the checklist for the optional remote step.

## The one step it never does — going remote

The Tier-0 server is **local** (stdio, on your mock/sample data) and needs no keys. To let a *hosted*
assistant reach it over the internet, you take it **remote**: switch the transport to **Streamable HTTP**,
put it behind **OAuth 2.1** (the 2026 MCP spec's auth), point it at your real backend (run `build-backend`
first), and host it. **That keyed, hosted go-live is yours** — `build-mcp` scaffolds everything it safely can
offline and writes the checklist, but it never enters a key, hosts, or deploys. Same boundary as
`build-backend` and `deploy`.

## Read-only now; writes later

v1 is read-only on purpose — it's the safe, useful 90%, and it sidesteps the real security surface of letting
an agent *act* (prompt-injection driving a delete, etc.). Letting an agent create/update/delete is a separate,
opt-in, confirmation-gated tier routed through your app's own validation — not something turned on by default.

## What ships in the template

Only the skill (including its generic adapter asset) and this doc ship. **No `mcp/` is ever built into the
template itself.** Your `mcp/` appears only when *you* run `build-mcp` in your own copy.

## Later tiers (not in v1)

- **Remote / hosted** (Streamable HTTP + OAuth + real backend) — the keyed go-live above.
- **Write tools** — opt-in, confirmation-gated agent actions.
- **Other targets** — exposing `mobile/` / `plugin/` is a later phase; the `raw/builds/` + `wiki/build.md`
  provenance already accommodates new targets.

## Credit / inspiration

The "make your app work with AI agents" direction follows Chris Raroque's *"How I'm Rebuilding My App for the
AI Era,"* vetted and reshaped for this template (read-only-first, DataStore-native) via `roast` +
`storm-research` — see `docs/IDEA-VETTING.md` and `outputs/vetting/2026-07-03-agent-accessibility/`.
