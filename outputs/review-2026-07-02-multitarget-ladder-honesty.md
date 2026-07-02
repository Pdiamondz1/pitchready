# NEEDS SIGN-OFF — multi-target ladder honesty (web-only production tiers)

Proposed by a `build-plugin` stress-drive (a clone→build dogfood of *Clipmark*, a Manifest V3
browser extension). `build-plugin` itself passed cleanly (loadable MV3 `dist/`, correct theming,
build + typecheck green, both surfaces working). The seam is at the **boundary**: the whole
path-to-production ladder is **web-only**, and when a user builds a `plugin/` (or `mobile/`) and then
tries to advance it, the production-tier skills silently route them to `build-app` ("build a web app
first") without noticing what they built or saying these tiers are web-only. This is an
**honesty/messaging** edit — same spirit as rv-005 (be honest about a limit at the moment the user
hits it); it changes no behavior on the web path.

**How to apply:** check a box to approve; `improve-system` applies approved items on its next run and
logs each to `outputs/change-log.md`. Leave a box unchecked to defer/decline. Do not renumber or
rewrite existing ids.

---

- [x] `rv-20260702-007` — the web-only production tiers should say so when a plugin/ or mobile/ exists (not just route to build-app)  ·  target: `.claude/skills/{build-backend,test-app,audit-app,deploy,ship-check,polish}/SKILL.md` (each Phase 0, the "no `app/`" branch)  ·  detail: In each of the six web-only production-tier skills, extend the Phase-0 "a built `app/` is missing" branch: **before** offering/ routing to `build-app`, check whether a `plugin/` or `mobile/` directory exists; if one does, state plainly that these production tiers currently cover the **web `app/` only** — mobile/ and plugin/ have their **own later-phase** production tiers, so there's nothing to `<back / test / audit / deploy / ship-check / polish>` for them yet — rather than telling a plugin/mobile builder to "build a web app first." Keep the existing web-app offer/route for the genuine no-build case unchanged. Honesty-only; **no behavior change to the web path**, no new config, no new files. Example clause (ship-check): *"There's no web `app/` to ship-check. I do see a `plugin/` — but the production tiers (test/audit/deploy/ship-check/polish) currently cover the web app only; mobile and browser-extension production tiers are a later phase. To ship-check a web app, build one first with `build-app`."*  Why: a `build-plugin`/`build-mobile` user who then asks to test/audit/ship-check/deploy their built target is told to "build a web app first," which ignores what they built and hides that these tiers are web-only — a small, avoidable dead-end the roadmap already knows is deferred but the runtime never says.

---

*Source: `build-plugin` target stress-drive (Clipmark). build-plugin passed; the seam is the
web-only production ladder's routing message for non-web targets. See the memory note
`shipped-test-kept-2026-07-02` / the plugin dogfood. Related prior fixes: rv-004/005/006
(marketplace hardening).*
