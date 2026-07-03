// ---------------------------------------------------------------------------
// GENERIC DataStore -> MCP adapter. This is the "compiler pass": it knows
// NOTHING about Kept. Given any store + entity catalog it auto-registers
// read-only list_<plural> and get_<name> tools. This one file works for every
// app the template generates. Everything app-specific lives in the catalog.
//
// READ-ONLY BY CONSTRUCTION: this adapter has no code path that registers a
// create/update/delete tool. Write tools would be a separate, opt-in adapter
// gated behind confirmation — they are simply absent here.
// ---------------------------------------------------------------------------
import { z } from "zod";

const asText = (value) => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

const READONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };

export function mountReadOnlyTools(server, store, catalog) {
  const registered = [];
  const app = catalog.appName;

  for (const e of catalog.entities ?? []) {
    // list_<plural>
    const listName = `list_${e.plural}`;
    server.registerTool(
      listName,
      {
        title: `List ${e.plural}`,
        description: `${e.summary} Returns every ${e.name} in ${app}. ${e.hint ?? ""}`.trim(),
        annotations: { title: `List ${e.plural}`, ...READONLY },
      },
      async () => {
        const rows = await store[e.list]();
        return asText({ count: rows.length, [e.plural]: rows });
      }
    );
    registered.push(listName);

    // get_<name>
    const getName = `get_${e.name}`;
    server.registerTool(
      getName,
      {
        title: `Get ${e.name}`,
        description: `${e.summary} Fetch one ${e.name} by id.`,
        inputSchema: { id: z.string().describe(e.keyDesc) },
        annotations: { title: `Get ${e.name}`, ...READONLY },
      },
      async ({ id }) => {
        const row = await store[e.get](id);
        return row ? asText(row) : asText({ error: `no ${e.name} with id ${id}` });
      }
    );
    registered.push(getName);
  }

  for (const s of catalog.singletons ?? []) {
    const name = `get_${s.name}`;
    server.registerTool(
      name,
      {
        title: `Get ${s.name}`,
        description: `${s.summary} ${s.hint ?? ""}`.trim(),
        annotations: { title: `Get ${s.name}`, ...READONLY },
      },
      async () => asText(await store[s.get]())
    );
    registered.push(name);
  }

  return registered;
}
