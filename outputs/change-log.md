---
title: Change Log
source_id: outputs:change-log
updated: 2026-06-29
---

# Change Log

- 2026-07-04 — build-app — added localStorage persistence to app/src/data/store.ts (graceful-off) so created/edited decks survive a page refresh; closes the most jarring part of the data gap without a backend; found by the end-to-end stress test, verified locally (rename survives full reload) — applied
- 2026-07-04 — deploy — scaffolded vercel hosting (app/vercel.json SPA rewrite) + CI quality-gate (.github/workflows/deploy-app.yml) + graceful-off observability (app/src/lib/observability.ts, CDN Sentry + no-op analytics) for app/; nothing deployed, no keys; go-live checklist at outputs/deploy/2026-07-04-pitchready/GO-LIVE.md — applied
- 2026-07-04 — build-app — repo model switched to ONE self-contained project repo (template + app together, per user): removed app/.git, un-ignored /app/, renamed template remote → template-upstream + cleared push-tracking (no default push target, original template protected) — applied
- 2026-07-04 — build-app — scaffolded web app (app/) from wiki/charter.md MVP; themed from wiki/design-system.md; app is its own git repo, gitignored from the foundation — applied
- 2026-07-04 — define-design — wrote design system (wiki/design-system.md) from raw/design/2026-07-04-ink-and-gold-premium/ — auto
- 2026-07-04 — define-project — wrote project charter (wiki/charter.md) from raw/project/2026-07-04-discovery.md — auto
- 2026-07-04 — roast — wrote roast verdict outputs/vetting/2026-07-04-margin-guard/roast-verdict.md (RESHAPE med-high: coupon-blocking niche occupied by KeepCart 5★; pivot to provable found-money wedge) — auto
- 2026-07-04 — roast — appended re-test of sharpened "investor-raise cockpit" (~3/10 as framed; surfaced always-in-market free-wedge + integrate-don't-replace follow-up radar; flagged weak founder-idea fit) to outputs/vetting/2026-07-04-pitch-deck-generator/roast-verdict.md — auto
- 2026-07-04 — roast — appended fork pressure-test (Fork 1 vs Fork 2, both 2/10 for the $0/no-audience/weeks founder) to outputs/vetting/2026-07-04-pitch-deck-generator/roast-verdict.md — auto
- 2026-07-04 — storm-research — wrote briefing outputs/vetting/2026-07-04-pitch-deck-generator/pitch-deck-generator-briefing.html — auto
- 2026-07-04 — roast — wrote roast verdict outputs/vetting/2026-07-04-pitch-deck-generator/roast-verdict.md — auto
- 2026-07-03 — storm-research — wrote briefing outputs/vetting/2026-07-03-maintain-app/maintain-app-briefing.html — auto
- 2026-07-03 — roast — wrote roast verdict outputs/vetting/2026-07-03-maintain-app/roast-verdict.md — auto
- 2026-07-03 — define-design — generalized to vendor-neutral design-tool providers (Stitch silent default + Claude Design manual example + bring-your-own); ## Stitch prompt → ## Regeneration prompt; assets/Higgsfield deferred to a later keyed tier — applied
- 2026-07-03 — storm-research — wrote briefing outputs/vetting/2026-07-03-claude-design-higgsfield-integration/design-tool-integrations-briefing.html — auto
- 2026-07-03 — roast — wrote roast verdict outputs/vetting/2026-07-03-claude-design-higgsfield-integration/roast-verdict.md — auto
- 2026-07-03 — improve-system — applied rv-20260703-007: build-app contrast-remedy guidance prefers flipping the --*-foreground to dark ink (keep the brand hue) over darkening a saturated brand token; only darken when no foreground clears AA (build-app SKILL.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-004: build-mcp store.mjs bridge honest about the TS-import gap — Tier-0 default is a self-contained JS mirror of app/src/data fixtures (a plain .mjs can't import the app's TS/@-aliased data layer), with a drift note + tsx/getActiveStore zero-drift alternatives; Phase 1 notes list-only entities need a synthesized getX (build-mcp SKILL.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-005: build-app drops @tailwindcss/typography from the copied tailwind.config.ts unless the design uses prose (else the excluded dep breaks the build) (build-app SKILL.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-006: build-app strips console-only baggage from the copied tsconfig.app.json (vitest/globals type + server include) and vite.config.ts so a from-the-aios-shape scaffold typechecks clean (build-app SKILL.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-001: new read-only build-mcp skill (.claude/skills/build-mcp/ + assets/adapter.mjs + docs/BUILD-MCP.md + PATH-TO-PRODUCTION rung + CLAUDE.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-002: schema.org + llms.txt discovery layer in build-app (SKILL.md + config.json + docs/BUILD-APP.md) — applied
- 2026-07-03 — improve-system — applied rv-20260703-003: recorded agent-accessibility deferrals (Siri/App Intents, no new API layer) in PATH-TO-PRODUCTION.md + BUILD-MOBILE.md — applied
- 2026-07-03 — storm-research — wrote briefing outputs/vetting/2026-07-03-agent-accessibility/agent-accessibility-briefing.html — auto
- 2026-07-03 — roast — wrote roast verdict outputs/vetting/2026-07-03-agent-accessibility/roast-verdict.md — auto

Append-only ledger of changes the system has applied. Written **by skills only** (the AIOS
GUI never writes here). Newest entries at the top.

Format: `- YYYY-MM-DD — <skill> — <what changed> — <auto | applied>`

- `auto` — an AUTO-APPROVE fix applied directly by `improve-system`, or a routine
  ingest/index by another skill.
- `applied` — a NEEDS SIGN-OFF item the human checked in a `review-*.md` file, applied by
  `improve-system` on a later run.

---

- 2026-07-02 — improve-system — applied rv-20260702-011: autopilot passes each builder a canonical run slug + per-target record suffix (raw/builds/<date>-<slug>-web|mobile|plugin.md) so multi-target build records are self-describing and match the ledger — not the -N re-run counter; build-app/mobile/plugin autonomous notes honor it (build-app also tags its record target: web) — applied
- 2026-07-02 — improve-system — applied rv-20260702-010: autopilot Phase B/C wording no longer hardcodes "GO" — it also names the auto-adopted RESHAPE path its own Phase A produces (plan bullet, confirm-gate prompt, Phase C header, build-<target> input) — applied
- 2026-07-02 — improve-system — applied rv-20260702-009: build-mobile makes the scaffold reproducible so the Metro/web bundle builds — create-expo-app is now the recommended default scaffold; hand-authored package.json must tilde-pin nativewind, drop default reanimated, and add an overrides block pinning react-native + the metro family; Phase 5 web-preview note updated — applied
- 2026-07-02 — improve-system — applied rv-20260702-008: build-mobile package.json lists expo-router peer deps + a typecheck script; Phase 5 honest about the web-preview path (create-expo-app alternative noted) — applied
- 2026-07-02 — improve-system — applied rv-20260702-007: web-only production tiers (build-backend/test-app/audit-app/deploy/ship-check/polish) say so when a plugin/ or mobile/ exists instead of routing to build-app — applied
- 2026-07-02 — improve-system — applied rv-20260702-006: build-app notes the copied Button has no asChild (Link-as-button uses buttonVariants) — applied
- 2026-07-02 — improve-system — applied rv-20260702-005: polish payments flags marketplace payouts need Stripe Connect (single-seller Checkout out of scope) — applied
- 2026-07-02 — improve-system — applied rv-20260702-004: build-backend owner-scopes private-per-user tables by default (owner_id + auth.uid()=owner_id RLS; public tables stay shared-read) — applied
- 2026-07-02 — improve-system — applied rv-20260702-003: build-app scaffolds accessible-by-default markup (aria-labels, labels, one h1) — applied
- 2026-07-02 — improve-system — applied rv-20260702-002: build-app verifies theme contrast clears WCAG AA (≥4.5:1) — applied
- 2026-07-02 — improve-system — applied rv-20260702-001: build-app generated .gitignore covers .env* — applied
