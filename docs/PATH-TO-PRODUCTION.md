# The path to production

This template takes you from an idea to a **themed, working front-end prototype with mock data** (the
`define → vet → design → build → advise` arc, all **Tier 0** — no keys, offline). That's a prototype, not a
finished product. This page is the honest, ordered map of what stands between that prototype and a
**fully-tested, fully-audited, ready-for-production** product — and how the template grows to cover it.

Each rung is a future skill in the template's own idiom: a skill that writes provenance to `raw/`, a report
to `outputs/`, optionally an autopilot step, keys-in-env (never in chat), graceful-off, and **attended for
anything irreversible**. The safety-sensitive rungs (keys, deploy, payments, publish) always stay
**scaffold + checklist + guide** — the template prepares everything, but *you* do the actual key entry and
go-live. That boundary is deliberate and permanent.

## The rungs (in order)

1. **Real data & identity — `build-backend`** *(shipped, Phase 18 — the biggest jump).*
   Turn the mock-data app into a real, backend-ready app: a Supabase schema derived from your data, a
   graceful-off data layer (runs on mock with no keys; uses the real backend the moment keys are present),
   sign-in/auth, and a go-live checklist. Scaffolds hands-off; you do the one go-live step. See
   `docs/BUILD-BACKEND.md`.

2. **Prove it works — testing — `test-app`** *(shipped, Phase 19).*
   Generate unit + component + end-to-end (Playwright) tests against your app *and* the charter's success
   criteria (each criterion becomes an automated test or a flagged manual/metric note), produce a runnable
   suite + coverage, and a coverage/criteria manifest in `outputs/tests/`. Adds a `test-writer` agent to the
   fleet. Scaffolds offline; the run stays yours. See `docs/TEST-APP.md`.

3. **Prove it's safe — audit — `audit-app`** *(shipped, Phase 20).*
   One `audit-app` skill runs three lenses — security (dependency + secret scanning, authorization /
   input-validation / injection review, an OWASP-style checklist), **accessibility (WCAG)**, and
   **performance** — into one prioritized findings report in `outputs/audits/`, mirroring `codex-review`'s
   propose-only pattern (it writes only a report — never modifies the app or auto-fixes). Reasoning-first and
   offline; `npm audit` / Lighthouse / axe are offered, not run. *(The roadmap's `security-audit` + a11y/perf
   siblings resolved to one skill with three lenses, matching how rungs 1–2 were reconciled.)* See
   `docs/AUDIT-APP.md`.

4. **Ship it — deploy & operate — `deploy` + `sync-metrics`** *(shipped, Phase 21).*
   A `deploy` skill scaffolds a hosting target (Vercel) + a CI quality-gate + env/secrets management +
   graceful-off observability as **scaffold + guided checklist** — it never deploys, publishes, or enters
   keys; **you pull the go-live trigger**. A companion `sync-metrics` skill (graceful-off, riding the
   `maintenance-loop`) pulls real analytics into dated `raw/metrics/` snapshots, **closing the loop with
   `advise-project`** (which consumed metrics nothing produced since Phase 6). See `docs/DEPLOY.md`.

5. **The go/no-go gate — `ship-check`** *(shipped, Phase 22).*
   A production-readiness skill that runs the whole gauntlet across eight checks — a real app? real data?
   tests present? audit clean? deploy config present? real content? legal present? charter criteria met? —
   and returns a **GO / NOT-YET** verdict naming the exact blocking gaps and the skill that closes each.
   **Propose-only** (mirrors `audit-app`): it writes only a report and changes nothing. It's the production
   analog of `roast`'s idea gate. The arc becomes **define → vet → design → build → test → audit → ship →
   advise**. See `docs/SHIP-CHECK.md`.

6. **Make it legitimate — polish & compliance — `polish`** *(shipped, Phase 23 — the final rung).*
   A `polish` skill modifies the built `app/` across areas — real content/copy (assets flagged), onboarding +
   empty/error/loading states, **legal templates** (privacy policy, terms, cookie consent — *not legal
   advice*; presence, not a compliance claim), user docs, and an **opt-in graceful-off Stripe payments
   scaffold** (never enters keys or charges — you own the keyed go-live). A `build-*` sibling (attended, one
   confirm gate, `layer: polish` provenance) that closes the `content`/`legal` gaps `ship-check` flags. See
   `docs/POLISH.md`.

## Agent-accessibility — making built apps usable by AI (a parallel track)

Vetted 2026-07-03 (`roast` RESHAPE + `storm-research` + a 48h spike —
`outputs/vetting/2026-07-03-agent-accessibility/`): the durable way to future-proof a built app for the AI
era splits cleanly into **discovery** (static, ship-now) and **operability** (a real agent surface), and two
tempting pieces were deliberately cut. This is a **parallel track**, not a rung in the 1–6 sequence — it can
follow `build-app` (mock, Tier-0) and gains a real backend once `build-backend` has run.

- **Discovery — in `build-app` (`include_discovery`).** schema.org structured data (as full entity pages) +
  a static `llms.txt`. Static, keyless, Tier-0; it *aids* AI/search legibility but is **not** a claim of AI
  visibility. Ships as part of the front-end build. See `docs/BUILD-APP.md`.
- **Operability — `build-mcp`** *(shipped).* Generates a **read-only** MCP server over the app's `DataStore`
  so AI agents (Claude/ChatGPT) can query it in natural language. Read-only **by construction** (no
  create/update/delete tool), Tier-0 local stdio over mock data; the **remote** go-live (Streamable HTTP +
  OAuth + real backend) is a keyed checklist step the user owns — so it's attended, never in the loop, and
  **deliberately not in `autopilot`** (like `deploy`/`polish`). See `docs/BUILD-MCP.md`.
- **Deliberately deferred / out of scope:**
  - **Siri / Apple App Intents** — can't run at Tier-0 (needs a native EAS build + an Apple Developer
    account; SiriKit is deprecated and Expo's `expo-app-intents` is still an unmerged PR), and it's
    single-vendor with no neutral governance. A later native-build tier, noted in `docs/BUILD-MOBILE.md` —
    not scaffolded today.
  - **A new API layer** — not added. Where `build-backend` ran, Supabase already exposes PostgREST +
    GraphQL; the value-add is the RLS-aware, DataStore-native, read-first wiring in `build-mcp`, not
    re-wrapping an API.
  - **Agent write tools** — a later opt-in, confirmation-gated tier; v1 is read-only so an agent can never
    take an irreversible action.

## The rule that never changes

The template never enters your API keys, never charges your card, and never publishes or deploys on your
behalf. For every rung above, it does all the preparation it safely can **unattended**, then hands you a
short, well-marked checklist for the one step that must be yours. That's what keeps "hands-off" and "safe"
true at the same time.
