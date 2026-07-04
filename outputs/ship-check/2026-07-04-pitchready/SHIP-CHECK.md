---
title: Ship-Check — PitchReady
source_id: outputs:ship-check:2026-07-04-pitchready
verdict: NOT-YET
max_severity: MAJOR
counts: { blocking: 4, advisory: 4 }
updated: 2026-07-04
---

# Ship-Check — PitchReady

## Verdict: NOT-YET
**Confidence: high**

**The call in one line:** Not ready for a *real product launch* (4 gaps) — but only **one** of those (no
live URL) actually blocks the founder's stated near-term goal, a **cheap demand test led by the coaching**.

**Read this correctly:** "NOT-YET" here means *not a finished, production-grade product* — untested,
unaudited, no persistence, not hosted. That's expected and honest for a Tier-0 build. It does **not** mean
"can't be put in front of people this week." The gauntlet is strict on purpose; the pragmatic path is below.

## Readiness table

| Check | Status | Severity | One line |
|---|---|---|---|
| **build** | ✅ | — | Real Vite+React app; typecheck **and** production build verified clean. |
| **data** | ❌ | MAJOR | Mock in-memory store only — a user's deck **resets on refresh** (no save/accounts). |
| **tests** | ❌ | MAJOR | No test suite (no `test` script, no TEST-PLAN). Shipping untested. |
| **audit** | ❌ | MAJOR | No security / a11y / performance audit on record. Safety unverified. |
| **deploy** | ❌ | MAJOR | No hosting/CI/env scaffold; not live. **Nothing to share yet.** |
| **content** | ✅ | MINOR (adv) | Real, specific copy — no lorem/TODO. First-draft; worth a polish pass. |
| **legal** | ⚠️ | MINOR (adv) | No privacy/terms — advisory *now* (nothing is collected/transmitted); becomes **MAJOR** the moment accounts land. |
| **criteria** | ⚠️ | MINOR (adv) | Coaching criterion **met & working**; "investor-grade generation" only **partial** (templated, not real AI); traction criteria are post-launch. |

## Blocking gaps — ranked by what actually unblocks *your* goal

1. **`deploy` — no live URL (MAJOR).** This is the *only* gap that blocks even a scrappy demand test — you
   can't run SEO/short-form/community validation without something to link to. **Closes with:** `deploy`
   (scaffolds Vercel + CI + env template; you pull the go-live trigger). ← **the one that matters now.**
2. **`data` — no persistence (MAJOR).** Refresh wipes the user's deck. Tolerable for a *one-session "score
   your deck" wedge*; a real gap before you call it a product people return to. **Closes with:**
   `build-backend` (also where **real AI generation** lands).
3. **`tests` — untested (MAJOR).** Fine to defer for a validation test; required before a real launch.
   **Closes with:** `test-app`.
4. **`audit` — unaudited (MAJOR).** Same — defer for validation, close before real launch. **Closes with:**
   `audit-app`.

## Advisories (non-blocking)

- **SEO / SPA (tied to deploy):** client-rendered — search crawlers may not see content without
  prerender/SSR. Matters for the SEO channel specifically; `deploy` is where prerender is addressed.
- **Legal:** add privacy/terms **before** `build-backend` wires accounts (then it's blocking).
- **Content:** home copy is genuine but first-draft — a `polish` pass sharpens it.
- **Criteria — generation quality:** templated decks are *structured* but not *AI-written*; the
  "investor-grade output in <15 min" criterion is only fully met once real AI lands (`build-backend`).

## The single most important next step

**Run `deploy`** to get a free live URL, then **lead with the coaching** ("free investor-readiness score /
deck critique" — the part that's genuinely real at Tier 0) rather than "AI writes your deck" (not real yet).
That turns this NOT-YET into a *shareable demand test* for ~$0. Hold `build-backend` / `test-app` /
`audit-app` until the coaching wedge shows a pulse — spending on them first is the "build before demand"
trap the vetting kept flagging.

## Confirm it live (offered, not run)

- `cd app && npm install && npm run build` — production bundle. **(Already run this session: clean.)**
- `cd app && npm audit` — dependency CVEs (only 8 runtime deps; low surface).
- No test suite exists yet, so there's nothing to run green — that's the `tests` gap.
- Lighthouse (perf/a11y/SEO) — needs a browser; run against the `deploy` preview once hosted.

---
*Propose-only readiness read — nothing in the app was changed. Re-run after closing gaps for a fresh verdict.*
