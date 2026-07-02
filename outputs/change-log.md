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

- 2026-07-02 — improve-system — applied rv-20260702-003: build-app scaffolds accessible-by-default markup (aria-labels, labels, one h1) — applied
- 2026-07-02 — improve-system — applied rv-20260702-002: build-app verifies theme contrast clears WCAG AA (≥4.5:1) — applied
- 2026-07-02 — improve-system — applied rv-20260702-001: build-app generated .gitignore covers .env* — applied
