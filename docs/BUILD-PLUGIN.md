# Building your browser extension — the `build-plugin` skill

`build-plugin` is the browser-extension sibling of [`build-app`](BUILD-APP.md) and
[`build-mobile`](BUILD-MOBILE.md). Once you know *what* you're building (`define-project` →
`wiki/charter.md`), that it's *worth* building (`roast`/`storm-research`), and *how it should look*
(`define-design` → `wiki/design-system.md`), `build-plugin` turns those into an actual, working
**browser extension** you can load into Chrome and try — without you having to write or wire up any of
it.

## What it makes

A new top-level **`plugin/`** folder: its own minimal **Vite + React + TypeScript + Tailwind** project
— the same proven stack as the `aios/` console and your web app — that builds to a **Manifest V3**
extension with a **popup** and an **options page**, themed from your design system (the *same* 13 color
tokens), with your MVP's views wired to **mock (placeholder) data**.

It is a **front-end MVP**: the surfaces, layout, and theme are real; the data is placeholder. There is
no backend, no accounts, no permissions, and no store submission yet — those are **later tiers** (below).

## How it works

1. **Reads your north-stars** — the charter (your MVP list), the design system (your theme), and the
   latest vetting verdict. A missing charter → it offers `define-project` first; a missing design → it
   uses a clean default and offers `define-design`; a **KILL** verdict stops it unless you say "build
   anyway".
2. **Drafts a short view list** from your MVP (capped so it can't run away) and shows it to you.
3. **Asks once: "build this?"** — then scaffolds and themes `plugin/`, with mock data.
4. **Records what it built** — an immutable note in `raw/builds/` (tagged `target: plugin`), a Browser-
   extension section in the shared `wiki/build.md` index, and a line in the change log.
5. **Hands it to you** — the few clicks to load it into Chrome.

## Trying it in Chrome (no store, no account)

```
cd plugin
npm install       # one time — downloads the building blocks
npm run build     # creates the dist/ folder Chrome loads
```

Then, in Chrome:
1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and pick the **`plugin/dist`** folder.
4. The extension's icon appears in your toolbar — click it for the popup; right-click → **Options** for
   the settings page.

After any change, run `npm run build` again and click the reload (↻) icon on the extension's card.
Plain Vite doesn't hot-reload a popup (Manifest V3's security rules block the dev server inside the
extension context), so the dev loop is `npm run build:watch` + click reload — that's the one tradeoff of
the no-framework scaffold. Prefer a quick look without Chrome? `npm run preview` opens a page linking to
the popup and options in a browser tab.

## Where things live

- **`plugin/`** — your extension's code. Like `aios/`, `app/`, and `mobile/`, it's a **build target**,
  not part of the knowledge base — so it lives outside the `raw/` / `wiki/` / `outputs/` discipline, and
  it's yours to edit.
- **`raw/builds/<date>-<slug>.md`** — an immutable record of each build (tagged `target: plugin`).
- **`wiki/build.md`** — the shared, AI-written index of everything you've built (a "Web app", "Mobile
  app", and/or "Browser extension" section), with links back to the records and your charter/design.

## The stack (and why not a framework)

Plain **Vite + React + TypeScript + Tailwind** (the same majors as `aios/`) building to **Manifest V3**
— the popup and options page are ordinary web pages, so your 13 design tokens carry over **unchanged** (a
popup is just a themed page). The only extension-specific addition is the dev-only `@types/chrome`.

We deliberately use plain Vite + a hand-written `manifest.json` rather than a framework like WXT or
CRXJS: it mirrors your web app's scaffold exactly, with no generated-manifest "magic" — and a
popup+options MVP needs no background worker or content script at all. The tradeoff is no live popup
hot-reload (see above); if that friction ever matters, adopting a framework is a later, opt-in step.

## Re-running

Run `build-plugin` again any time. It won't clobber your work: it diffs your current MVP against what's
built and offers to **add/update surfaces or views**, **re-apply the theme** (after you tweak the design
system), or **both** — showing a diff and asking before it overwrites anything you've edited.

## What ships in the template

Only the skill and this doc ship. **No `plugin/` is ever built into the template itself.** Your
`plugin/` appears only when *you* run `build-plugin` in your own copy.

## Later tiers (not in v1)

- **Packaging + Chrome Web Store** — zip the build and submit it to the Chrome Web Store (needs a
  one-time paid developer account and a review). A bigger lift, so it's a dedicated later tier beyond the
  no-accounts default.
- **Cross-browser (Firefox / Edge / Safari)** — one codebase, per-store packaging (Firefox wants a small
  polyfill). A later slice.
- **Real permissions, host access, a background service worker, storage, network** — swap mock data for
  real behavior. These need permissions/keys, so they're opt-in tiers beyond Tier 0.
- **Other targets** — the **web** app ([`build-app`](BUILD-APP.md)) and **mobile** app
  ([`build-mobile`](BUILD-MOBILE.md)) are separate slices; the `raw/builds/` + `wiki/build.md`
  provenance already accommodates them.

## Credit / inspiration

The "scaffold → theme → mock data → preview" flow follows the modern Claude Code build workflow shown
in Chris Raroque's *"How I Build Apps So Fast."*
