# NEEDS SIGN-OFF — build-mcp + build-app stress-test seams (Convene drive)

Found on 2026-07-03 by stress-testing the two just-shipped agent-accessibility features against a
**complex** target — a full multi-track conference companion (**Convene**: 29 sessions · 16 speakers
· 5 tracks · 6 rooms · 8 sponsors, with real schedule-conflict logic) built end-to-end in a throwaway
sandbox, then operated by two "test users": me driving the app in Chrome, and a **live Claude agent**
(`claude -p --mcp-config --strict-mcp-config`) driving the generated MCP server.

**What held up (no change needed):**
- **`build-app`'s discovery layer (schema.org + `llms.txt`) — validated clean.** Real
  `Event`/`Person`/`Place` builders as *full entity pages* mirroring visible content, honest framing
  (comments + README + `llms.txt`), correctly injected, and confirmed **served at runtime** (Overview
  `Event` with 29 `subEvent`s; `/llms.txt` 2122 bytes). Zero console errors.
- **`build-mcp` works and is provably safe.** 12 read-only tools, **read-only-by-construction proven**
  (a `create_session` attempt → "Tool not found", data unchanged 29→29), and a live agent answered a
  hard cross-entity question (Friday AI+Security conflict-free plan + busiest-speaker/self-clash) with
  **factually exact** results.

Each item below is a **skill edit** → NEEDS SIGN-OFF per CLAUDE.md (never auto-applied). Check a box to
approve; `improve-system` applies checked items on its next run and logs each to `outputs/change-log.md`.
Do not renumber existing ids.

---

- [x] `rv-20260703-004` — `build-mcp`: make the Tier-0 store bridge honest about the TS-import gap (+ list-only entities)  ·  target: `.claude/skills/build-mcp/SKILL.md` (Phase 3 step 3 "Generate `store.mjs`" + the `mcp/` file-tree note)  ·  detail: Phase 3.3 says `store.mjs` is "a read-only bridge that **imports the app's existing read accessors** … wraps `app/src/data/` getters." A generated `mcp/` is plain-Node ESM (`.mjs`), which **cannot `import` the app's `app/src/data/*.ts`** (TypeScript + `@/` path aliases + extensionless relative imports) without a build step or a TS loader — so a literal reader produces a server that won't start (`ERR_MODULE_NOT_FOUND` / can't resolve `@/…`). The skill's own proven blueprint (`spike-mcp/src/datastore/store.mjs`) is in fact a **self-contained mirror**, not a live import. Fix: reword Phase 3.3 so the **Tier-0 default is explicit** — `store.mjs` is a *self-contained JS mirror* of the app's fixtures + the same `listX()/getX(id)` read methods (because the TS/aliased data layer can't be imported by a plain-node server), carrying a one-line **drift caveat** (re-run `build-mcp` to refresh the mirror after the app's data changes) alongside the existing backend-swap note (a real deployment replaces `store.mjs` with a `getActiveStore()` bridge — no drift). Optionally mention a live-import variant via a TS runtime (e.g. `tsx`) as a later option for someone who wants zero drift now. Also add a one-line Phase-1 note: a **list-only** app entity (a `listX` with no `getX`, e.g. Convene's sponsors) needs a **synthesized `getX`** in the bridge, since the generic adapter registers both `list_` and `get_` per entity.  Why: the store bridge is the one place `build-mcp` meets the real (TypeScript) app, and the current wording would break a literal build; the fix matches the template's honesty brand *and* what the skill's own spike blueprint actually does. This is the one real seam in the otherwise-clean new feature.

- [x] `rv-20260703-005` — `build-app`: "copy `tailwind.config.ts` unchanged" breaks against the typography-dep exclusion  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 — the "copy `tailwind.config.ts` unchanged" line)  ·  detail: Phase 3 says *"Copy `tailwind.config.ts` unchanged (it only reads the CSS vars)"*, but `aios/tailwind.config.ts` also `import`s and registers the **`@tailwindcss/typography`** plugin (`plugins: [tailwindcssAnimate, typography]`), while the **same phase's dep list excludes `@tailwindcss/typography`** unless the design uses prose. A literal copy + excluded dep → the app **fails to build** (missing module). Fix: change the instruction to *"copy `tailwind.config.ts` but **drop the `@tailwindcss/typography` import and its `plugins` entry unless the design uses prose** (keep the dep only if you keep the plugin)"* — and soften "it only reads the CSS vars" to "it resolves the CSS vars **and loads plugins**." Why: prevents a guaranteed build break for the common no-prose app; a naive literal reader can't satisfy "copy unchanged" and "exclude the dep" at once.

- [x] `rv-20260703-006` — `build-app`: copying the aios `tsconfig.app.json` shape leaks console-only baggage beyond fileApi/react-query  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 — the "copied from the aios shape" scaffold notes)  ·  detail: The skill flags the **fileApi middleware** + **react-query** as aios-console-only, but `aios/tsconfig.app.json` also carries **`"types": ["vitest/globals", "node"]`** and **`"include": ["src", "server"]`**. Copied literally into a vitest-free, server-less `build-app` app, the `vitest/globals` type reference (its dep is excluded) + the missing `server/` dir make **`tsc` fail**. Fix: add a one-line "strip these too" note to Phase 3 — when copying the aios `tsconfig.app.json`, **drop `vitest/globals` from `types`** (keep `node`) and **drop `"server"` from `include`** (that's the aios fileApi backend). Why: closes the last copy-paste typecheck failures a literal scaffold hits; complements rv-005 so a from-the-aios-shape scaffold builds clean without hand-editing.

- [x] `rv-20260703-007` — `build-app`: contrast-remedy guidance should prefer flipping the foreground to dark ink over darkening a saturated brand token  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 theming step, the WCAG-AA sentence from rv-002)  ·  detail: The AA step said *"darken a too-light token rather than ship a sub-AA CTA."* For a **saturated brand** token (e.g. a cyan accent CTA) darkening the token fights the design intent and yields an off-palette, muddy color — the cleaner fix is to keep the hue and swap the text color. Reworded: *to fix a sub-AA pair, **first flip the `--*-foreground` to dark ink (keep the brand hue), and only darken the token itself if no foreground choice clears AA.***  Why: keeps a saturated brand color on-brand while still clearing AA — the exact bind this drive's cyan CTA hit (the builder correctly chose dark ink; the skill only mentioned darkening). Filed + shipped at the user's explicit request after the drive (originally held back as lower-confidence / partly provoked by a self-contradictory design system, but the principle is sound independent of the input).

---

*Source: sandbox drive (throwaway); the app's discovery output + the `mcp/` server were built, run, and
operated live. rv-004/005/006 shipped at `cceddfe`; rv-007 filed + shipped on follow-up request.
Memory: `build-mcp-app-stress-2026-07-03`.*
