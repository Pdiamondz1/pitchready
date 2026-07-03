// ---------------------------------------------------------------------------
// The whole app-specific server. Note how little there is: import the store +
// catalog, hand them to the generic adapter, connect stdio. No keys, no network
// — a local stdio MCP server over mock data (the "scaffolds offline" tier).
// A real deployment swaps StdioServerTransport for Streamable HTTP + OAuth and
// the MockStore for the SupabaseStore — same tools, same adapter.
// ---------------------------------------------------------------------------
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { store, catalog } from "../datastore/store.mjs";
import { mountReadOnlyTools } from "./adapter.mjs";

const server = new McpServer({ name: "kept-mcp", version: "0.1.0" });

const tools = mountReadOnlyTools(server, store, catalog);

const transport = new StdioServerTransport();
await server.connect(transport);

// stderr is safe to log to (stdout is the JSON-RPC channel).
console.error(`[kept-mcp] read-only server up — ${tools.length} tools: ${tools.join(", ")}`);
