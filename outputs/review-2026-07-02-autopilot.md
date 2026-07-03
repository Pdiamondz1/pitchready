# NEEDS SIGN-OFF — autopilot (multi-target dogfood fixes)

Proposed by an end-to-end `autopilot` stress-drive — a clone→run dogfood of *Tend* (a home-upkeep
companion), taking **all three targets** (web + mobile + plugin) through the full capstone chain: one
grill → `define-project` → `roast` (5-persona council, verdict **RESHAPE**, auto-adopted) →
`storm-research` → one confirm gate → `define-design` → `build-app`/`build-mobile`/`build-plugin`
(3-for-3, zero failures) → hand-over → `advise-project` (Phase E). The orchestration held up; these two
seams surfaced specifically because the run exercised the **auto-adopted RESHAPE** path and the
**multi-target** build phase that single-skill drives never touch.

**How to apply:** both boxes were **approved in-session** (the user selected both fixes to ship).
`improve-system` applies checked items on its next run and logs each to `outputs/change-log.md`. Do not
renumber or rewrite existing ids.

---

- [x] `rv-20260702-010` — autopilot's Phase B/C wording hardcodes "already vetted (**GO**)", which is inaccurate for the **auto-adopted RESHAPE** path its own Phase A produces  ·  target: `.claude/skills/autopilot/SKILL.md` (Phase B plan bullet + confirm-gate prompt; Phase C header + the `build-<target>` input list)  ·  detail: Phase A step 3 auto-adopts a non-KILL **RESHAPE** (config `auto_adopt_reshape`) and continues to the **same** single confirm gate — but Phase B's plan bullet ("the GO verdict + cheapest test"), the gate prompt ("already vetted (**GO**) and researched"), the Phase C header ("No vetting stop (already GO)"), and the Phase C step-2 input ("+ the GO verdict") all assume the verdict is GO. In the dogfood the verdict **was** RESHAPE, so the skill's own gate could not be spoken truthfully. **Fix (applied):** reword all four to name both cleared verdicts — "the verdict (GO or adopted RESHAPE)", "already vetted (**GO**, or an adopted **RESHAPE**)", "No vetting stop (already cleared — GO or an adopted RESHAPE)". Accuracy-only; no behavior change (RESHAPE was already auto-adopted). autopilot-only.

- [x] `rv-20260702-011` — under a single all-three `autopilot` run the three `raw/builds/` records collide on the same `<date>-<slug>` and disambiguate only via the `-N` "same-day re-run" counter (`…slug.md` / `…-2.md` / `…-3.md`) — which reads like three **re-runs**, not web/mobile/plugin, and risks the ledger's `<date>-<slug>` links not matching each builder's independently-derived slug  ·  target: `.claude/skills/autopilot/SKILL.md` (Phase C step 2) + `.claude/skills/build-app/SKILL.md` + `.claude/skills/build-mobile/SKILL.md` + `.claude/skills/build-plugin/SKILL.md` (the `## Autonomous invocation` notes)  ·  detail: autopilot Phase C relied on "the builder's own `-N` same-day rule keeps each target's record distinct" — mechanically distinct but semantically wrong (target lived only in frontmatter; the web record had **no** `target:` tag at all), and nothing guaranteed each builder's derived slug matched the run slug the ledger references. **Corroborated in the run:** the plugin builder, told not to write provenance, independently referenced its record as `…-plugin.md` (a target suffix), not `…-3.md`. **Fix (applied):** autopilot now passes each builder a **canonical run slug + a per-target suffix** so records are `raw/builds/<date>-<slug>-web|mobile|plugin.md` — self-describing, collision-free, and matching the ledger's slug (no `-N` reliance); each `build-*` autonomous note now says to use the autopilot-provided target-suffixed name verbatim (and `build-app` tags its record `target: web` for symmetry with mobile/plugin). Attended behavior of all four skills is byte-for-byte unchanged (the change lives only in the autopilot-invocation path). improve-system stays the single applier.

---

*Source: `autopilot` end-to-end stress-drive (Tend, all-three targets). The full run's artifacts (intake ·
plan · decisions ledger · run log · vetting verdict + briefing · 3 build records · advise ideas) were
produced in a throwaway sandbox; the template repo stays clean. A third finding — the **KILL-stop**
upfront-pause path — was **not** exercised (the idea drew RESHAPE, which auto-adopts); a separate
micro-test with a deliberately KILL-worthy idea would cover reshape/proceed-anyway/stop.*
