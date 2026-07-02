# NEEDS SIGN-OFF — marketplace hardening (build-backend RLS · polish payments · build-app note)

Proposed by a second template stress-drive (a full clone→launch dogfood of **NeighborFix**, a
two-sided home-services marketplace). Three real seams surfaced when a complex, multi-user, paid
idea outgrew the template's Tier-0 / single-seller defaults. These are **additive guidance/behavior**
edits to three skills — each contained to one `SKILL.md`; none changes a skill's structure, shape, or
provenance rules.

**How to apply:** check a box to approve; `improve-system` applies approved items on its next run and
logs each to `outputs/change-log.md`. Leave a box unchecked to defer/decline. Do not renumber or
rewrite existing ids.

---

- [x] `rv-20260702-004` — build-backend should owner-scope private-per-user data by default (not ship it anon-readable)  ·  target: `.claude/skills/build-backend/SKILL.md` (Phase 1 data model + RLS; Phase 2 confirm gate; Phase 3 migration; Phase 5 go-live)  ·  detail: Add an entity-classification step to Phase 1 — mark each table **public/reference** (everyone reads the same rows: catalogs, listings, public profiles, published reviews) vs **private/per-user** (a row belongs to one user: bookings, orders, messages, personal items). Replace the "default is shared-read; owner-scoped is a later refinement" RLS paragraph with a **two-track policy**: public tables keep shared-read/authenticated-write; **private tables add an `owner_id uuid references auth.users (id)` column (the Tier-0 fixtures have none — the skill adds it), set `owner_id` from `auth.uid()` on insert, get `auth.uid() = owner_id` RLS, and get NO public-read policy.** Default a table to private whenever the charter implies per-user ownership; when unsure, treat as private and confirm at the gate (over-scoping is safe, over-sharing leaks). Update Phase 3's migration bullet (owner_id column + owner-scoped policies; private tables seed without owner_id / skip seeding), Phase 2's confirm line (state which tables are public vs owner-scoped, e.g. "anyone can see listings; only you can see your own bookings"), and Phase 5's go-live note (private tables are owner-scoped → each user sees only their own rows → those lists start empty until they create data; public tables show the seed). **Why:** the current shared-read default made a marketplace's private `bookings` (homeowners' job details) publicly readable, and because build-app's mock fixtures carry no owner column, owner-scoped RLS could not be derived — audit-app + ship-check both flagged it. Safe-by-default beats a go-live footnote.

- [x] `rv-20260702-005` — polish payments must be honest when the app is a marketplace (single-seller Checkout ≠ marketplace payouts)  ·  target: `.claude/skills/polish/SKILL.md` (the `payments` area bullet)  ·  detail: Append to the `payments` area a marketplace clause: if the charter describes a **two-sided marketplace or any multi-party payout** (money moving *between users* — a buyer pays, a seller/pro gets paid, minus a platform cut), state plainly that the single-seller Stripe Checkout scaffold covers charging users for the **platform's own** product (e.g. a subscription) and **does NOT** do marketplace payouts, which need **Stripe Connect** (destination charges/transfers + connected-account onboarding + KYC) — **out of scope**; flag it as required-and-not-scaffolded in `GO-LIVE.md` and build only the single-seller half honestly. **Why:** the payments scaffold silently fit a single-seller model; a founder building a marketplace could mistake it for the whole payment story. (Scope note: this fixes the single-seller-only half of the seam; ladder ordering is left advisory — `roast` already warns marketplaces not to defer payments.)

- [x] `rv-20260702-006` — build-app should note the copied `Button` has no `asChild` (Link-as-button uses `buttonVariants()`)  ·  target: `.claude/skills/build-app/SKILL.md` (Phase 3 "Routes & components")  ·  detail: Add one sentence: the copied `Button` primitive (from `aios/`) has **no `asChild`/Slot** prop, so to render a router `<Link>` styled as a button, apply `buttonVariants()` to the `<Link>` (`className={cn(buttonVariants({ variant }), …)}`) rather than wrapping it in `<Button>`. **Why:** unlike upstream shadcn, aios's `Button` has no Slot, so `<Button asChild><Link/></Button>` both fails typecheck and nests `<button><a>`; a builder wiring a Link-styled-as-button can trip on it (I did, during the dogfood).

---

*Source: second stress-drive of the full path-to-production (build-app → … → polish) on a
marketplace. All three seams were surfaced by the template's own `audit-app` / `ship-check` gates
(seam 1) or hit directly during the build (seams 2–3). See the memory note
`stress-test-marketplace-2026-07-02`.*
