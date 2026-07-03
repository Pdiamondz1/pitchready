# spike-mcp — read-only MCP server over a template-shaped DataStore

**This is a throwaway spike, not part of the template.** It exists to answer the demand question behind the
`build-mcp` reshape (`outputs/vetting/2026-07-03-agent-accessibility/`): *does operating an app through an
AI agent actually beat opening it?* Delete this folder when you're done — nothing depends on it.

It wraps a *Kept*-style get-paid app's `DataStore` (clients, invoices, payments, tax-reserve settings — the
exact shape `build-backend` generates) as a **read-only MCP server**, over stdio, on mock data. No keys, no
network. Stack: `@modelcontextprotocol/sdk` 1.29, Node ≥ 20, zod 4.

## What's here

| File | What it is |
|---|---|
| `src/datastore/store.mjs` | The mock `DataStore` (`listX/getX`) + the per-app entity `catalog` a skill would generate |
| `src/mcp/adapter.mjs` | **The generic `DataStore → MCP` compiler pass** — 54 lines, reused for any app, read-only by construction |
| `src/mcp/server.mjs` | 9 lines wiring store + catalog + stdio |
| `src/client/probe.mjs` | A real MCP client that drives the server and answers a get-paid/tax question |

## Run the built-in probe

```bash
npm install     # once
npm run probe   # launches the server + drives it end-to-end
```

## Try it with a real agent (the actual demand test)

Add it to **Claude Desktop** (Settings ▸ Developer ▸ Edit Config → `claude_desktop_config.json`) or a
project **`.mcp.json`** for Claude Code, then restart the client:

```json
{
  "mcpServers": {
    "kept": {
      "command": "node",
      "args": ["C:/GIT/hma_project_foundation/spike-mcp/src/mcp/server.mjs"]
    }
  }
}
```

Then ask, in plain English:

> *Using the kept tools, where do I stand on getting paid, who owes me the most, and am I setting aside
> enough for taxes?*

The honest test: does that beat opening the app? Aggregate/"where do I stand" questions are where it should
win; single-record lookups won't.

## Safety

Every tool is annotated `readOnlyHint: true`; there are **no** create/update/delete tools. The adapter has
no code path that registers one, so a write is impossible, not just discouraged (a `create_invoice` call
returns `-32602 Tool not found`; data is unchanged). Writes would be a separate, opt-in, confirmation-gated
adapter — deliberately absent here.
