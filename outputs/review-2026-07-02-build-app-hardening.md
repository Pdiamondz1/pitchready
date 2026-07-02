# NEEDS SIGN-OFF — build-app hardening (a11y + .gitignore)

Proposed by a test-drive of the template (a full clone→launch dogfood of Sprout, a sample app).
Two real, avoidable gaps surfaced in `build-app`'s generated output. These are **additive
guidance** edits to `.claude/skills/build-app/SKILL.md` — they raise the quality bar of every
future generated app; they change no skill structure or behavior.

**How to apply:** check a box to approve; `improve-system` applies approved items on its next run
and logs each to `outputs/change-log.md`. Leave a box unchecked to defer/decline. Do not renumber
or rewrite existing ids.

---

- [x] `rv-20260702-001` — build-app generated `.gitignore` should cover `.env*`  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 file tree)  ·  detail: change the `.gitignore` line comment from `# node_modules, dist` to `# node_modules, dist, coverage, .env* (keep !.env.example) — future-proofs backend/deploy`, and have the generated `app/.gitignore` include `node_modules`, `dist`, `coverage`, `*.local`, `.env`, `.env.*`, and `!.env.example`. Why: build-app's current `.gitignore` omits `.env`, so downstream skills (build-backend, deploy) must each remember to add it — a miss risks committing keys.

- [x] `rv-20260702-002` — build-app must verify theme contrast clears WCAG AA  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 "Theme it")  ·  detail: extend the "re-derive and eyeball the contrast pairs … so text stays legible" sentence to require that the `--primary` / `--*-foreground` pairs clear **WCAG AA (≥4.5:1 for normal text)** — darken a too-light token rather than ship a sub-AA CTA. Why: a generated app shipped a primary button at ~3.8:1 (below AA 4.5:1); audit-app caught it, but build-app should not emit it.

- [x] `rv-20260702-003` — build-app should scaffold accessible-by-default markup  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 "Routes & components")  ·  detail: append an "**Accessible by default**" note: give every icon-only control (nav links, icon buttons) an `aria-label`, associate inputs with `<label htmlFor>`, and keep one `<h1>` per page. Why: a generated app had icon-only mobile nav links with no accessible name (label hidden below the `sm` breakpoint); the audit caught it, but it's avoidable at build time.

---

*Source: test-drive of the full path-to-production (build-app → … → ship-check) on a sample app.
Both findings were flagged by the template's own `audit-app` / `ship-check` gates.*
