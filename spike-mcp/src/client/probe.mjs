// ---------------------------------------------------------------------------
// A real MCP client (the SAME protocol Claude Desktop / ChatGPT speak) that
// launches the server over stdio and drives it. It proves two things:
//   1. the read-only tools work over the wire (initialize -> tools/list -> tools/call)
//   2. a real "get-paid" question is answerable purely from read-only tools.
// The final aggregation (summing) is done here in JS; an LLM agent would do that
// reasoning itself. What the spike proves is that the DATA the task needs is all
// reachable through the generated read-only surface, and how many calls it takes.
// ---------------------------------------------------------------------------
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";

const serverPath = fileURLToPath(new URL("../mcp/server.mjs", import.meta.url));

const transport = new StdioClientTransport({
  command: process.execPath,           // node
  args: [serverPath],
});

const client = new Client({ name: "spike-probe", version: "0.0.0" });

let calls = 0;
async function call(name, args) {
  calls++;
  const res = await client.callTool({ name, arguments: args ?? {} });
  return JSON.parse(res.content[0].text);
}

const money = (n) => `$${n.toLocaleString("en-US")}`;

await client.connect(transport);

// ---- 1. Discovery: what does the agent see? ----
const { tools } = await client.listTools();
console.log(`\n=== TOOLS DISCOVERED (${tools.length}) ===`);
for (const t of tools) {
  const ro = t.annotations?.readOnlyHint ? "read-only" : "MUTATES";
  console.log(`  • ${t.name.padEnd(16)} [${ro}]  ${t.description}`);
}

// ---- 2. A real task: "Where do I stand on getting paid, and taxes?" ----
const { invoices } = await call("list_invoices");
const { clients } = await call("list_clients");
const { payments } = await call("list_payments");
const settings = await call("get_settings");

const clientName = (id) => clients.find((c) => c.id === id)?.name ?? id;
const openInv = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
const outstanding = openInv.reduce((s, i) => s + i.amount, 0);
const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

const byClient = {};
for (const i of openInv) byClient[i.clientId] = (byClient[i.clientId] ?? 0) + i.amount;
const [topId, topAmt] = Object.entries(byClient).sort((a, b) => b[1] - a[1])[0];

const collected = payments.reduce((s, p) => s + p.amount, 0);
const shouldReserve = Math.round((collected * settings.taxReservePercent) / 100);
const shortfall = shouldReserve - settings.reserveSetAside;

console.log(`\n=== TASK: "Where do I stand on getting paid, and am I set for taxes?" ===`);
console.log(`Answer (assembled from ${calls} read-only tool calls):\n`);
console.log(`  Outstanding (sent + overdue): ${money(outstanding)} across ${openInv.length} invoices`);
console.log(`      of which OVERDUE:         ${money(overdue)} — chase these first`);
console.log(`  Client who owes the most:     ${clientName(topId)} (${money(topAmt)})`);
console.log(`  Collected so far:             ${money(collected)}`);
console.log(`  Tax reserve @ ${settings.taxReservePercent}%:            should be ${money(shouldReserve)}, set aside ${money(settings.reserveSetAside)}`);
console.log(shortfall > 0
  ? `  ⚠ You are ${money(shortfall)} SHORT on your tax set-aside.`
  : `  ✓ Tax set-aside is on track.`);

// ---- 3. Prove get_<id> works too ----
const one = await call("get_invoice", { id: "in_1006" });
console.log(`\n=== get_invoice("in_1006") ===\n  ${one.number} · ${clientName(one.clientId)} · ${money(one.amount)} · ${one.status}`);

console.log(`\nTotal tool calls for the whole session: ${calls}`);
await client.close();
