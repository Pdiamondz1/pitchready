---
title: Roast Verdict — maintain-app (operate-&-maintain rung / scheduled post-production loop)
source_id: outputs/vetting/2026-07-03-maintain-app/roast-verdict.md
path: outputs/vetting/2026-07-03-maintain-app/roast-verdict.md
tags: [vetting, roast, verdict]
updated: 2026-07-03
---

# Roast Verdict — maintain-app (operate-&-maintain rung / scheduled post-production loop)

**The brief:** `maintain-app` — a proposed new skill for `hma_project_foundation`, the missing
"operate & maintain" rung 7 of the path-to-production. It keeps an already-shipped `app/` healthy on a
schedule. Loop: scheduled tick → scan (npm audit, the test-app suite, an audit-app re-run, optional
codex-review; graceful-off live error-tracking when keys exist) → triage into three buckets (AUTO-FIX
safe class / SIGN-OFF / MORE-CONTEXT, reusing improve-system's model) → auto-fix only a narrow "safe
class" (security dependency patch/minor bumps that keep tests green, lockfile refreshes, trivial fixes)
onto a new branch → verify-or-demote (run test-app + audit-app gates; green → open a PR; not green →
revert + demote to SIGN-OFF) → open a PR (never merge/deploy) + write outputs/maintenance/. Architecture:
hybrid — scaffolds both a local weekly Claude Code Routine (Tier-0, offline) and a ready-to-enable
GitHub Actions workflow (keyed, CI, disabled until the user adds a secret), mirroring how `deploy`
scaffolds hosting but never deploys. Invariant: never merge/deploy/publish/enter-keys for the user; a
lifecycle hook guardrail hard-blocks the loop from reaching the irreversible step; the PR is the gate.
Inspired by loop-engineering (scheduled/cron loops, goal/Ralph loops with a Judge + stop-clean, hooks
as guardrails, subagents). Judge: is auto-patching a shipped app wise; is the safe class genuinely safe;
does it belong in the template vs. just recommending Dependabot/Renovate; is the local-vs-CI split right.

## THE VERDICT: RESHAPE
Confidence: high

**The call in one line:** Build it — but as the operate-&-maintain *orchestrator* (scheduled
audit/test/review → plain-language report + genuinely-safe PRs), and cut dependency version-bumps out of
auto-fix entirely, delegating those to Dependabot.

**Why:** Four of five lenses — and even the Contrarian's own fallback — agree the gap is real and the
core architecture (PR-only, verify-or-demote, the reversible/irreversible boundary) is sound; the only
real fight is over *what* it auto-fixes and *who* it's for. The evidence resolves it: dependency
auto-bumps are simultaneously the redundant part (Dependabot does it free), the dangerous part (Axios
Mar-2026 and Shai-Hulud Sep-2025 both arrived as green-CI-passing minor/patch bumps and propagated via
auto-merge), and the wrong-buyer part (commodity, not LLM value). Removing them from auto-fix fixes three
objections in one cut while keeping the recurring-cadence upside.

**Biggest risk:** The rubber-stamp — a reliable weekly stream of green PRs trains a non-expert to
click-merge, and the one the thin test suite missed sails through (Logician/Buyer/Contrarian converge
here). Mitigated by report-first, legible PRs with an explicit "what I did NOT verify" block, and never
adding auto-merge.

**Biggest upside:** It's the only rung with a recurring cadence — it completes the lifecycle (idea →
shipped → *stays* shipped) and is the concrete recurring-revenue wedge the licensing strategy has been
missing (Expansionist).

**Money read:** Cheap to run (< $5/mo per app for a weekly CI tick at Sonnet rates); fast to build
(reuses audit-app, test-app, codex-review, improve-system's buckets, deploy's scaffold-not-do pattern,
maintenance-loop's Routine). As a template feature it's the natural front door to a recurring/managed
SKU — the first thing in the template shaped like a subscription.

**The cheapest 48-hour test:** Don't build the skill yet. Take one already-shipped small app: (1) turn
on Dependabot, (2) hand-run audit-app + test-app + codex-review once, (3) hand-write the health report
and one SAFE-PR (a lint/a11y fix) with the "not-verified" block, then (4) show both to one non-technical
person and one developer. Two questions decide it: does the non-technical person understand the report
and know what to do next, and does the developer say "yes, I'd let this run in CI" — and does anything in
the triage merely duplicate what Dependabot already surfaced? Validates the orchestrator's standalone
value and the anti-rubber-stamp report before a line of code.

**If RESHAPE — the specific pivot:**
- Reframe as the operate-&-maintain **orchestrator**; lead with LLM-only value (scheduled re-run of
  audit-app/test-app/codex-review → three-bucket triage → plain-language report as the primary artifact).
- **Delegate dependency/CVE handling to Dependabot/Renovate** (scaffold the config, deploy-style). The
  report surfaces and explains CVEs and files them as SIGN-OFF with a release-age note — never
  auto-applies a bump.
- Rename **AUTO-FIX → SAFE-PR**, confined to non-dependency, reversible, mechanically-verifiable fixes
  (lint/format, the a11y fixes audit-app already generates, dead code, doc drift); each PR carries a
  "what I did NOT verify" honesty block; never auto-merge.
- **CI is the product, local is the sandbox** — keep the hybrid but frame it honestly; gate the
  expensive steps behind a cheap "did anything actually change since last tick?" trigger.
- Guardrail = a **real mechanical hook** hard-blocking merge/push-to-main/deploy/publish/key-writes —
  not a prompt instruction.

**Council scores:** Contrarian 3/10 · Expansionist 9/10 · Logician 7/10 · Researcher 6/10 · Buyer 5/10

**Evidence briefing:** ./maintain-app-briefing.html (22 citations verified against primary sources: 0 fabricated, 8 corrected, 7 demoted)

## What the briefing changed

The citation-verified storm pass **did not overturn the RESHAPE — it strengthened it and pushed one step further.** It confirmed the reshape's spine with primary sources (delegate dependency patching; "green tests = safe" is false from two directions — APR overfitting *and* install-time malware; PR-only/never-merge is correct) and added three refinements the roast only implied:

1. **Report-first, PR-as-exception.** The durable artifact is a single sparse, high-signal health *digest* (the Renovate *Dependency Dashboard* pattern), not a stream of SAFE-PRs. Operators mute bot-PR floods; AI-authored PRs carry ~1.7× more issues (CodeRabbit) and are a documented maintainer tax (curl ended its bounty Jan 2026 over AI slop). Even the safe-PRs should be rare.
2. **Add a ~7-day dependency cooldown.** `min-release-age` (npm 11.10.0) is the emerging minimum defense — 8 of 10 real attacks had sub-week exploitation windows — so the loop must *never rush* a fresh release; surface CVEs, delegate the bump, wait out the cooldown.
3. **The "human merges" gate is a *decaying* asset, not a safety guarantee** (measured: ICU 72–99% false alarms; aviation vigilance failure; Dependabot's own 75M-PR rubber-stamp/abandon split). Design against the rubber-stamp: minimize outputs, make each maximally legible, mandatory-specific "what I did NOT verify" per PR, and a **real mechanical hook** (never a prompt) blocking merge/deploy/keys. Never add auto-merge (even Snyk's Agent Fix 5.3% regression is "too high for auto-merge").

**Missing 6th lens (blind spot):** all five lenses reasoned as developers. The template's non-technical maker can't operate a PR at all — for them the output must degrade to "healthy / one thing to do / bring a developer," never homework they can't do.

**Net:** verdict stands at **RESHAPE (high)** — now sharpened to *report-first orchestrator + delegated-and-cooled dependencies + rare, radically-honest safe-PRs + a mechanical guardrail.* The hidden connection the briefing surfaced — **the automation's fluency is exactly what erodes the human oversight it depends on; attention is the scarce resource and every output spends it** — is the single principle the build must be designed around.
