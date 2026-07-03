---
title: Roast Verdict — Agent-accessibility capability for the template
source_id: outputs/vetting/2026-07-03-agent-accessibility/roast-verdict.md
path: outputs/vetting/2026-07-03-agent-accessibility/roast-verdict.md
tags: [vetting, roast, verdict, ai-agility, mcp, future-proofing]
updated: 2026-07-03
---

# Roast Verdict — Agent-accessibility capability for the template

**The brief:** A self-improving "project-foundation" template (a meta-tool that builds apps via
Claude Code skills, Tier-0/offline-first, aimed at solo builders / indie devs) wants to add an
"agent-accessibility" capability so the apps it *generates* are operable and discoverable by AI
agents (Claude/ChatGPT) and OS voice assistants (Siri) — not just usable by humans. Inspired by
Chris Raroque's video *"How I'm Rebuilding My App for the AI Era."* Concretely a new `build-*`
sibling skill (working name `agentify`/`build-mcp`) that (1) generates an MCP server over the app's
existing `DataStore` interface (`listX/getX/createX/updateX/deleteX`) with agent-tuned tool
descriptions; (2) adds a thin API layer leaning on Supabase's auto-generated REST/GraphQL; (3)
reuses already-scaffolded Supabase auth + owner-scoped RLS to scope what an agent can do; (4) adds
Siri / Apple App Intents voice integration for the Expo mobile target; (5) auto-generates
`llms.txt` + schema.org / semantic markup for the web target. The template already produces the
`DataStore` interface, Supabase auth, and owner-scoped RLS on a 6-rung path-to-production ladder,
so the video's hard parts map onto seams it already owns. It must honor the template invariants:
Tier-0 / graceful-off, attended for anything irreversible, keys-in-env-never-in-chat,
scaffold+checklist for go-live, new-skill = NEEDS SIGN-OFF. The bet: is agent-accessibility a
*durable* direction to build in NOW, or hype that ages badly?

## THE VERDICT: RESHAPE
Confidence: high

**The call in one line:** The direction is real and evidence-backed — but not as one welded
five-piece bundle. Split it along the discoverability↔operability fault line: ship the cheap
static-discovery slice now, make MCP its own backend-gated skill built to the *new* (July 2026) spec,
and cut Siri from scope for now.

**Why:** The council's scores spread wide (3→9) but the *substance* converged hard. Four of five —
and even the bull, who said "sequence Siri last, never gate the bundle" — agree the valuable pieces
(MCP-over-DataStore, RLS-scoping, schema.org) are the *safe* ones and the speculative pieces
(Siri, llms.txt) are either near-free or must be deferred. The two coolest heads, Logician (5) and
Researcher (7), independently arrived at the identical restructuring, which is the tell. The
Expansionist's leverage thesis is genuinely valid (a uniform `DataStore` contract means
agent-accessibility is written once and applies to every app the template ever makes) — but only if
built the right way, which the bundle-as-pitched is not.

**Biggest risk:** Two genuine collisions with the template's own invariants, plus timing. (a)
*Invariant collision:* agent-driven `createX/updateX/deleteX` + prompt injection = an unattended
irreversible action — exactly what "attended for anything irreversible" forbids; owner-scoped RLS
scopes *whose* data, not *whether* an agent destroys it, and it also bypasses the domain validation
that lives in the form/UI layer (raw CRUD is the wrong altitude). (b) *Logical contradiction:*
"graceful-off / no keys" cannot coexist with "remote agent scoped by owner RLS" — scoping *requires*
a credential; graceful-off can only mean the skill *scaffolds* offline, never *operates* offline. (c)
*Timing:* the MCP spec had its largest-ever breaking revision finalize 2026-07-28 (stateless, no
`initialize`/`Mcp-Session-Id`/SSE, OAuth now standardized) — build against pre-May-2026 tutorials and
you write it twice.

**Biggest upside:** Because the template owns a *uniform* `DataStore` interface + owner-scoped RLS
across every app it generates, agent-accessibility is a one-time "compiler pass" that agentifies
every current and future app — the leverage a hand-builder (like the video's author, rebuilding one
app by hand) can never have. RLS-aware, DataStore-native wiring is also the real differentiator over
the already-commoditized "OpenAPI→MCP" generators (FastMCP, Speakeasy, Supabase's own MCP server).
It's the technical on-ramp to the "agent-native app factory" positioning and a future hosted
agent-gateway (the licensing memo's horizon-3).

**Money read:** Not a direct revenue feature — a template capability. Discovery slice = hours of
work, present-tense payoff (schema.org drives Google rich-results + measurably higher AI-citation
rates today), near-zero risk → ship now. MCP operability skill = a real new upgrade rung worth a
build cycle, best started after ~4–6 weeks of Tier-1 SDK stabilization on the new spec (or built
straight to the RC knowing it's the final shape). Redundant piece #2 (a new API layer) is free to
drop — Supabase already emits PostgREST REST + GraphQL.

**The cheapest 48-hour test:** Don't write the skill yet. Take an already-built sandbox app that has
a real `DataStore` + Supabase-ready backend (e.g. the "Kept" test-drive app), **hand-wrap its
`DataStore` as a minimal READ-ONLY MCP server** against the July-2026 RC spec, connect it in Claude
or ChatGPT desktop as a remote MCP server, and try to do a real task through the agent ("show my
overdue invoices," "what's my tax reserve"). Two signals fall out for one afternoon of work: (a) how
much of the eventual skill is pure codegen vs. bespoke, and (b) whether operating the app *through*
an agent feels genuinely more useful than opening the app — the demand question the Contrarian and
Buyer say is unproven. In parallel, ship the schema.org + `llms.txt` generator (a few hours) since
it pays off regardless of how the MCP test lands.

**If RESHAPE (the specific pivot):**
1. **Split into two efforts along the discoverability↔operability fault line** (the template's own
   one-skill-per-surface principle):
   - **Discovery (ship now):** auto-generate schema.org / semantic markup (+ `llms.txt` as a cheap,
     explicitly-speculative signal) for `build-app` web output. Static, keyless, genuinely Tier-0,
     on-brand. Could fold into `build-app`/`polish` rather than a new skill.
   - **Operability (`agentify`/`build-mcp`, a real new rung):** MCP server over the `DataStore`,
     **backend-prerequisite** (requires `build-backend`), scaffolds offline but *operates* only past
     a keyed go-live checklist — the exact `build-backend` graceful-off pattern.
2. **Cut Siri / App Intents from scope now → roadmap item.** It can't run in Expo Go / Tier-0 (needs
   a native build + Apple Developer account + Mac/Xcode), SiriKit is deprecated, and the
   `expo-app-intents` module is still an unmerged PR. Shipping "Siri voice integration" on an app
   that can't reach the App Store would also betray the template's multi-target-honesty brand.
3. **Drop the redundant new API layer** — lean on Supabase's existing PostgREST/GraphQL; the
   value-add is the RLS-aware, DataStore-native wiring, not re-wrapping.
4. **Make the MCP tools read-first and write-guarded** to resolve the invariant collision: default to
   read-only (`list`/`get`) tools; gate `create/update/delete` behind explicit opt-in + the
   "attended for irreversible" pattern (scoped tokens / confirmation), and route any writes through
   intent-shaped domain/service functions so domain validation is preserved (not raw
   `DataStore.create`).
5. **Regenerate from one source of truth** (the DataStore/schema) so MCP spec churn stays a cheap
   re-run — consistent with the template's graceful-off + re-runnable ethos. Target the 2026-07-28
   RC spec.

**Council scores:** Contrarian 3/10 · Expansionist 9/10 · Logician 5/10 · Researcher 7/10 · Buyer 4/10

**Evidence briefing:** ./agent-accessibility-briefing.html

## What the briefing changed

The `storm-research` evidence layer (5 lenses + 24 primary-source-verified citations; 3 fabricated, 12
corrected, 6 demoted) **confirmed and sharpened the RESHAPE — it did not flip it.** What it added:

- **The durability test is governance, not popularity.** Standards survive when handed to neutral,
  multi-vendor governance before scale (schema.org 2011; OpenAPI Nov 2015). MCP passed that test —
  donated to the Linux Foundation's Agentic AI Foundation on **Dec 9, 2025** (co-founders Anthropic,
  Block, OpenAI). App Intents/Siri did **not** — it's single-vendor, echoing the dead Alexa Skills /
  Google Actions ecosystems. This is independent, historical support for "build MCP, defer Siri."
- **The security case for read-first is stronger than the roast alone showed.** The **NSA** published an
  MCP security advisory (May 20, 2026); rigorous work confirms identity-scoped RLS does **not** contain
  a prompt-injected agent because injection lands in the reasoning layer, above the database. This
  hardens the RESHAPE's point #4 (read-only default; writes gated + routed through domain functions).
- **schema.org's value is real but was over-marketed.** Verified: full entity-page structured data lifts
  RAG accuracy **+29.6%** (arXiv 2603.10700). Corrected: Google says schema is **not required** for AI
  Overviews (no "gating"), and the viral "2.5x citations / 16%→54%" stats are **unverified marketing**.
  Ship schema.org as full entity pages, framed honestly — not as a magic multiplier.
- **llms.txt is even weaker than assumed** (~408 of ~515M AI-bot requests; "IDE tools auto-fetch it" is
  false — manual config only). Keep it as a labeled near-free hedge, not a headline.
- **Timing correction:** the MCP spec's **final** version ships **2026-07-28**; the RC locked May 21.
  Build the MCP skill to that spec, not pre-May-2026 references.

Net: the verdict stays **RESHAPE (high confidence)** — split discovery (ship now) from operability
(backend-gated, read-first, built to the new spec), cut Siri, drop the redundant API layer.

## 48-hour spike outcome (2026-07-03)

Ran the recommended cheapest test — a read-only MCP server over a template-shaped `DataStore`, driven by a
real MCP client. Result: **the technical risk on piece (1) is removed.** ~90%+ codegen (a 54-line generic
adapter reused for every app + a ~28-line per-app descriptor a skill emits from the DataStore interface);
read-only is enforced **by construction** (0 write tools; a `create_invoice` attempt returns "Tool not
found," data unchanged) — cleanly resolving the "attended-for-irreversible" collision; and a real
cross-entity get-paid/tax question was answered from 4 read-only calls. The only non-codegen input is
tool-description prose (agent-UX). Full write-up: [mcp-spike-findings.md](./mcp-spike-findings.md). The one
thing code can't settle — **demand** — is the remaining open question (the briefing's frontier question).

