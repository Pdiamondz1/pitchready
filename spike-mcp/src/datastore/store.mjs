// ---------------------------------------------------------------------------
// The DataStore — deliberately shaped EXACTLY like what `build-backend` generates
// in a template app (app/src/data/store/). Named async methods listX()/getX(id)
// over typed mock fixtures. This is the MockStore; a real app also has a
// SupabaseStore behind the same interface (graceful-off). The spike wraps THIS.
// ---------------------------------------------------------------------------

const clients = [
  { id: "cl_01", name: "Harbor & Vine",        email: "ap@harborandvine.com",   since: "2024-03" },
  { id: "cl_02", name: "Northlight Weddings",  email: "book@northlight.co",     since: "2023-11" },
  { id: "cl_03", name: "Cedar Realty Group",   email: "billing@cedarrealty.com", since: "2025-01" },
  { id: "cl_04", name: "Bloom Studio",         email: "hello@bloomstudio.art",  since: "2024-08" },
];

// status: draft | sent | paid | overdue.  amount in USD.
const invoices = [
  { id: "in_1001", clientId: "cl_01", number: "2026-001", amount: 1200, status: "paid",    issued: "2026-05-02", due: "2026-05-16" },
  { id: "in_1002", clientId: "cl_02", number: "2026-002", amount: 3500, status: "paid",    issued: "2026-05-10", due: "2026-05-24" },
  { id: "in_1003", clientId: "cl_03", number: "2026-003", amount:  850, status: "sent",    issued: "2026-06-20", due: "2026-07-11" },
  { id: "in_1004", clientId: "cl_01", number: "2026-004", amount:  600, status: "overdue", issued: "2026-05-15", due: "2026-06-14" },
  { id: "in_1005", clientId: "cl_04", number: "2026-005", amount: 2400, status: "sent",    issued: "2026-06-25", due: "2026-07-16" },
  { id: "in_1006", clientId: "cl_03", number: "2026-006", amount: 1750, status: "overdue", issued: "2026-05-01", due: "2026-05-31" },
  { id: "in_1007", clientId: "cl_02", number: "2026-007", amount:  980, status: "draft",   issued: "2026-07-01", due: "2026-07-22" },
  { id: "in_1008", clientId: "cl_04", number: "2026-008", amount: 1100, status: "paid",    issued: "2026-04-18", due: "2026-05-02" },
];

const payments = [
  { id: "pay_01", invoiceId: "in_1001", amount: 1200, date: "2026-05-14", method: "ACH" },
  { id: "pay_02", invoiceId: "in_1002", amount: 3500, date: "2026-05-22", method: "card" },
  { id: "pay_03", invoiceId: "in_1008", amount: 1100, date: "2026-04-30", method: "ACH" },
];

// A singleton settings record (the tax-reserve knobs + running set-aside).
const settings = {
  businessName: "Your Photography",
  currency: "USD",
  taxReservePercent: 25,   // set aside 25% of collected income for taxes
  reserveSetAside: 900,    // how much you've actually moved to the tax pot
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const byId = (arr, id) => arr.find((r) => r.id === id) ?? null;

// The DataStore interface build-backend emits: listX()/getX(id) per entity,
// getSettings() for the singleton. Read + write both exist in the real app;
// the spike only ever wires the READ half (see adapter).
export const store = {
  listClients:  async () => clone(clients),
  getClient:    async (id) => clone(byId(clients, id)),
  listInvoices: async () => clone(invoices),
  getInvoice:   async (id) => clone(byId(invoices, id)),
  listPayments: async () => clone(payments),
  getPayment:   async (id) => clone(byId(payments, id)),
  getSettings:  async () => clone(settings),
  // write half exists in the real store but is intentionally NOT exposed:
  // createInvoice, updateInvoice, deleteInvoice, recordPayment, ...
};

// ---------------------------------------------------------------------------
// The ENTITY DESCRIPTOR — the only per-app input the adapter needs. In the real
// skill this is derived from the DataStore's TypeScript interface + the charter
// (the `summary`/`hint` prose is the charter-derived, non-codegen part).
// ---------------------------------------------------------------------------
export const catalog = {
  appName: "Kept",
  entities: [
    {
      name: "client", plural: "clients", list: "listClients", get: "getClient",
      keyDesc: 'client id, e.g. "cl_03"',
      summary: "A customer you invoice.",
    },
    {
      name: "invoice", plural: "invoices", list: "listInvoices", get: "getInvoice",
      keyDesc: 'invoice id, e.g. "in_1004"',
      summary: "A bill sent to a client. Each has amount (USD), clientId, and status: draft | sent | paid | overdue.",
      // agent-UX hint (the craft the storm-research flagged as 'MCP issue 4'):
      hint: "Use to compute outstanding balance (status sent+overdue), find overdue invoices, or total collected income (status paid).",
    },
    {
      name: "payment", plural: "payments", list: "listPayments", get: "getPayment",
      keyDesc: 'payment id, e.g. "pay_01"',
      summary: "A payment received against an invoice.",
    },
  ],
  singletons: [
    {
      name: "settings", get: "getSettings",
      summary: "Business settings including taxReservePercent and reserveSetAside (the tax pot).",
      hint: "Use with collected income to check whether enough is set aside for taxes.",
    },
  ],
};
