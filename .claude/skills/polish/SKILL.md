---
name: polish
description: Use when someone asks to "polish my app", "make it launch-ready", "add real content", "replace the placeholder text", "add a privacy policy / terms / cookie consent", "add onboarding", "add loading/error/empty states", "add payments / Stripe", "write user docs", "make it legitimate", or says "/polish". Modifies the already-built web app in app/ across configurable areas — content (real charter-derived copy), states (onboarding + empty/error/loading), legal (privacy/terms/cookie-consent TEMPLATES), docs (user-facing docs), and an OPT-IN graceful-off Stripe payments scaffold — turning a themed prototype into a launch-ready product. Attended, one confirm gate; writes the build provenance (raw/builds layer: polish + wiki/build.md + change-log). Legal pages are TEMPLATES, not legal advice; payments NEVER enter keys or charge (graceful-off, you own the keyed go-live). Requires a built app/. Tier 0 (offline; the one keyed step stays yours). Attended-only — never in the maintenance loop, never in autopilot. Re-runnable. Zero-argument safe.
argument-hint: "[leave blank to run your configured areas, or name one: content / states / legal / docs / payments]"
---

# polish

The "make it legitimate" step — the final rung of the path to production. `build-app` builds a themed shell
with **placeholder copy and no empty/error/loading states**; `polish` turns that shell into a **launch-ready
product**: real content, complete UX states, legal pages, user docs, and (opt-in) a payments scaffold. It's
the rung that **closes the `content` and `legal` gaps `ship-check` flags** — after a polish pass, a re-run of
`ship-check` can flip them to ✅.

Unlike the propose-only `audit-app`/`ship-check`, `polish` **modifies the built `app/`** — so it takes the
**`build-*` shape**: **attended, one confirm gate**, and it writes the build provenance spine
(`raw/builds/<date>-<slug>.md` tagged `layer: polish` + a `## Polish` section in `wiki/build.md` + one
`change-log.md` `applied` line). Everything is scaffolded **offline, no keys**; the one keyed step (payments
go-live) stays yours.

## When to use

When the user says "polish my app", "make it launch-ready / make it legitimate", "add real content / replace
the placeholder text", "add a privacy policy / terms / cookie consent", "add onboarding / loading states",
"add payments / Stripe", "write user docs", or `/polish`. Also offered by `what-can-i-do` and pointed to by
`advise-project` after a build. It **requires an already-built `app/`** (from `build-app`). It is **attended**
(one confirm gate) and **never runs in the unattended `maintenance-loop`**; it is **deliberately not part of
`autopilot`** (see *Autonomous invocation*) — "make it legitimate" involves brand, legal, and (if enabled)
financial decisions that are yours.

## Configuration

Read `.claude/skills/polish/config.json` (all values default; never block on absence):
- `app_dir` (default `"app"`) — the built web app to polish.
- `areas` (default `["content","states","legal","docs"]`) — the enabled polish passes.
- `include_payments` (default `false`) — opt-in: append the graceful-off Stripe payments scaffold.

## The areas

Each area is a focused pass over `app/`. Run `config.areas` (+ `payments` if `include_payments` is true, or
if the user names `payments`); a named-area invocation argument runs just that area.

- **`content`** — replace `build-app`'s placeholder/mock copy + generic labels with **real, charter-derived
  copy** (headlines, section text, CTAs, button/label microcopy) written in the design-system **Voice**
  (`wiki/design-system.md`). Where a real brand asset (logo, hero photo) can't be generated, scaffold a
  clearly-labelled placeholder and **list it for the user to replace** — never claim an asset it can't make.
  Keep the main UI free of lorem/dummy text (this closes `ship-check`'s `content` check).
- **`states`** — add the UX states `build-app` omits, across pages/components: a **first-run / onboarding**
  moment, **empty** states (no data yet, with a helpful next action), **error** states (something went wrong
  + a retry), and **loading** states (skeletons/spinners). Use the app's existing mock/graceful data
  patterns; no backend required.
- **`legal`** — scaffold a **privacy policy**, **terms of service**, and a **cookie-consent banner** as
  **TEMPLATES** — pages/routes + a consent component — with clearly-marked `[FILL IN: …]` fields (company,
  contact, jurisdiction, what data you collect) and a **prominent, unremovable notice at the top of each:
  "⚠️ This is a starting template, not legal advice. Have a qualified lawyer review it before you rely on it —
  it does not by itself make you GDPR/CCPA compliant."** Scaffold the structure + a fill-in/verify-with-counsel
  checklist; **never claim the app IS compliant** (that's a legal determination you + counsel make). This
  closes `ship-check`'s `legal` check (which verifies the pages exist), while being honest that presence ≠
  compliance. The `[FILL IN: …]` legal fields are your documented legal fill-ins — distinct from the lorem
  copy the `content` area removes from the main UI.
- **`docs`** — write real user-facing docs from the charter + what's built: a real `app/README.md` (replacing
  `build-app`'s "placeholder-powered" note) + a short "how to use it" guide (what the app does, the main
  flows, how to run it).
- **`payments`** (opt-in; `include_payments`, default off) — a **graceful-off Stripe scaffold** mirroring
  `build-backend`'s `SupabaseStore` + `deploy`'s Sentry. Create `app/src/lib/payments.ts` + a pricing/checkout
  UI with **three honest states so the app never breaks**:
  1. **no publishable key** → an inert *"payments not configured"* state (`@stripe/stripe-js` is never even
     `import()`ed);
  2. **publishable key present but no checkout endpoint yet** → a *"checkout isn't fully set up — finish the
     server step in GO-LIVE.md"* state that **never calls a missing endpoint and never errors** (the analogue
     of `build-backend`'s keys-present-but-schema-missing resilience);
  3. **publishable key + a configured checkout endpoint** → **dynamic-`import()` `@stripe/stripe-js`** and run
     the real Stripe Checkout redirect.
  The client env template carries **only `VITE_STRIPE_PUBLISHABLE_KEY`** (in `app/.env.example` — an empty
  slot + a fill-in comment, never a value). The **`STRIPE_SECRET_KEY` is documented ONLY in `GO-LIVE.md` as a
  server-side secret — never templated into any `app/.env*` file, never in the client bundle.** Write
  `outputs/polish/<date>-<slug>/GO-LIVE.md`: create a Stripe account, add products/prices, paste the
  publishable key, put the secret + a checkout-session endpoint in **a Supabase edge function you add**
  (server-side), and test in Stripe test mode. **NEVER enter a key, NEVER create an account, NEVER charge** —
  financial transactions are a permanent human-only boundary; you do the keyed go-live. The scaffold does the
  **client half** honestly and **documents the server half** in the checklist.
  **If the charter describes a two-sided marketplace or any multi-party payout** (money moving *between
  users* — a buyer pays and a seller/pro gets paid, minus a platform cut), say so plainly: this
  single-seller Checkout scaffold covers charging users for the **platform's own** product (e.g. a
  subscription), **not** marketplace payouts. Those need **Stripe Connect** (destination charges /
  transfers + connected-account onboarding + KYC), which is **out of scope** here — flag it as
  required-and-not-scaffolded in `GO-LIVE.md` and build only the single-seller half honestly.

## Procedure (mirrors `build-app` Phase 0–5; one confirm gate)

### Phase 0 — Pre-flight (require the app; read it; route, don't guess)

1. **A built app (required) — at `config.app_dir` (default `app/`).** There is nothing to polish without it.
   - **Missing →** offer `build-app` first: *"Polishing makes an app you've already built launch-ready. Want
     me to build the app first, then polish it?"* On yes, run `build-app`, then continue. On no, stop
     gracefully.
     *(If a `plugin/` or `mobile/` exists here instead, say so plainly: these production tiers cover the
     web `app/` only today — mobile and browser-extension have their own later-phase tiers, so there's
     nothing to polish for them yet — don't steer a plugin/mobile builder to build a web app.)*
   - Read the app: `src/` (the pages/components that get real copy + states), `package.json`, `src/data/`
     (mock fixtures → what the empty/loading states show), any `.env.example`.
2. **North stars.** Read `wiki/charter.md` (brand/purpose/audience → the real copy; audience + data-collected
   → the legal bar) and `wiki/design-system.md` (the **Voice** → microcopy tone). Read `wiki/build.md` + the
   latest `raw/builds/` record for what exists. **Missing →** proceed with default assumptions and flag
   `(assumed)`.
3. **Scope.** If the user named an area in the invocation argument, run only that area; else run `config.areas`
   (+ `payments` if `include_payments`).

### Phase 1 — Derive the polish plan

Per enabled area, list the concrete changes: which files get real copy, which pages get which states, which
legal pages + the consent banner, which docs, and — if payments — the scaffold + env slot + go-live checklist.

### Phase 2 — Confirm once, then apply

Show the plan in **one message** and ask **one** question. Include the areas + what each changes, and surface
the safety notes: **legal pages are templates, not legal advice** (you + a lawyer finish them); **payments (if
on) is graceful-off and you own the keyed go-live** (no keys entered, nothing charged). Ask: *"Polish your app
this way? (yes / tweak something)"* On "tweak", revise and show again.

### Phase 3 — Apply (offline; no keys; nothing charged/deployed)

Make the edits per enabled area. For `content`, keep the main UI free of lorem. For `legal`, include the
not-legal-advice notice on every page. For `payments`, scaffold the three-state graceful-off module + the
`app/.env.example` publishable-key slot; **never** enter a key, run a build, or charge anything.

### Phase 4 — Record it (provenance)

The **code** lives in `app/` (a build target outside the knowledge folders). The **record** lands in the KB:
- **`raw/builds/<YYYY-MM-DD>-<slug>.md`** *(immutable, append-only; `-2` for same-day re-runs)* — RAG
  frontmatter, then: the areas polished, what changed per area, any flagged placeholder assets, and (if
  payments) the go-live pointer. **Tag it `layer: polish`.**
- **`wiki/build.md`** — add a **`## Polish`** section (preserving the existing sections): the areas polished,
  where the legal pages / payments module live, and a link to the `raw/builds/` record (+ the `GO-LIVE.md` if
  payments).
- **`outputs/change-log.md`** — append one attributed line (newest-at-top):
  `- <YYYY-MM-DD> — polish — polished app/ (<areas>) — applied`

`improve-system` stays the single applier — this skill writes only its own `applied` line.

### Phase 5 — Hand over (offer-don't-run)

Summarize what changed per area; **flag every placeholder asset** the user must replace. If payments was
included, point to `outputs/polish/<date>-<slug>/GO-LIVE.md` for the one keyed step (**never** enter a key).
Suggest re-running **`ship-check`** to confirm the `content`/`legal` gates now pass. Close plainly: *"Your app
is polished — <areas>. The legal pages are starting templates a lawyer should review; if payments, they're
scaffolded and inert until you do the go-live in GO-LIVE.md. Want me to re-run ship-check?"*

## Re-running (incremental, never clobber)

Each run writes a **new** dated `raw/builds/` record. On a re-run, **never clobber a user's real edits** — if
a file already carries real (non-placeholder) content or filled-in legal fields, show a diff and confirm
before overwriting. Re-run to polish more areas or refine existing ones.

## Rules & guardrails

- **Legal = templates, not legal advice.** Every legal page carries the unremovable not-legal-advice notice;
  the skill scaffolds structure + a fill-in/verify-with-counsel checklist and **never claims the app IS
  GDPR/CCPA compliant.** Compliance is a legal determination the user + counsel make.
- **Payments never touch money or keys.** Graceful-off scaffold + `GO-LIVE.md` only; **never enters a key,
  creates an account, or charges** (financial transactions are a prohibited action). Opt-in, default off; the
  secret key is server-only, never in the client bundle.
- **Assets = honest, flagged placeholders** — never claim a real brand asset the skill can't create.
- **Modifies only `app/` + writes its own provenance.** `raw/` stays append-only (`raw/builds/`);
  `improve-system` stays the single applier; code lives in `app/`.
- **Attended, one confirm gate; never in `maintenance-loop`; deliberately not in `autopilot`.**
- **Requires a built `app/`; web-only (v1).** Polishing `mobile/` / `plugin/` is a later phase.

## Output

A launch-ready `app/` (real content, UX states, legal templates, user docs, and — if opted in — a graceful-off
payments scaffold), an immutable `raw/builds/<date>-<slug>.md` record tagged `layer: polish`, a `## Polish`
section in `wiki/build.md`, one `change-log.md` line, and — if payments — `outputs/polish/<date>-<slug>/GO-LIVE.md`.
Nothing is charged, deployed, or keyed until you do the one go-live step.

## Autonomous invocation

**`polish` is deliberately NOT driven by `autopilot`.** "Make it legitimate" involves brand/content, legal,
and (if enabled) financial decisions that are inherently the user's — not a hands-off step. So there is **no
autonomous procedure and no `autopilot` config flag** for `polish` (mirroring `deploy`'s exclusion). This note
documents that exclusion; the attended behavior above is the only way `polish` runs — and `autopilot` is
user-initiated and never part of the unattended `maintenance-loop` (that rule is untouched).
