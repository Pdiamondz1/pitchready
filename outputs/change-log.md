---
title: Change Log
source_id: outputs:change-log
updated: 2026-06-29
---

# Change Log

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
