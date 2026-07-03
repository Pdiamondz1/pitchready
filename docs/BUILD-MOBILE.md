# Building your mobile app — the `build-mobile` skill

`build-mobile` is the phone-app sibling of [`build-app`](BUILD-APP.md). Once you know *what* you're
building (`define-project` → `wiki/charter.md`), that it's *worth* building (`roast`/`storm-research`),
and *how it should look* (`define-design` → `wiki/design-system.md`), `build-mobile` turns those into
an actual, working **phone app** you can open on your own device — without you having to write or wire
up any of it.

## What it makes

A new top-level **`mobile/`** folder: its own **Expo (React Native) + Expo Router + NativeWind +
TypeScript** project — the same React/TypeScript world as your web app and console — themed from your
design system (the *same* 13 color tokens), with one screen per item in your charter's MVP, powered by
**mock (placeholder) data**.

It is a **front-end MVP**: the screens, layout, and theme are real; the data is placeholder. There is
no backend, no accounts, and no app-store build yet — those are **later tiers** (below).

## How it works

1. **Reads your north-stars** — the charter (your MVP list), the design system (your theme), and the
   latest vetting verdict. A missing charter → it offers `define-project` first; a missing design → it
   uses a clean default and offers `define-design`; a **KILL** verdict stops it unless you say "build
   anyway".
2. **Drafts a short screen list** from your MVP (capped so it can't run away) and shows it to you.
3. **Asks once: "build this?"** — then scaffolds and themes `mobile/`, with mock data.
4. **Records what it built** — an immutable note in `raw/builds/` (tagged `target: mobile`), a Mobile
   section in the shared `wiki/build.md` index, and a line in the change log.
5. **Hands it to you** — one command that shows a QR code to preview it on your phone.

## Previewing on your phone (no Mac, no Xcode)

```
cd mobile
npm install       # one time — downloads the building blocks
npm run start     # shows a QR code in the terminal
```

Then open the free **Expo Go** app on your iPhone or Android and **scan the QR code** — your app loads
on your phone in a few seconds, and hot-reloads as changes are made. Nothing to install on your
computer beyond the project itself; this works from Windows.

Prefer your computer? `npm run web` opens the app in a browser (via react-native-web) for a quick look.

## Where things live

- **`mobile/`** — your app's code. Like `aios/` and `app/`, it's a **build target**, not part of the
  knowledge base — so it lives outside the `raw/` / `wiki/` / `outputs/` discipline, and it's yours to
  edit. (Expo Router's own routes live in `mobile/app/`, which is separate from the web app's root
  `app/`.)
- **`raw/builds/<date>-<slug>.md`** — an immutable record of each build (tagged `target: mobile`).
- **`wiki/build.md`** — the shared, AI-written index of everything you've built (a "Web app" section
  and/or a "Mobile app" section), with links back to the records and your charter/design.

## The stack (and keeping it current)

Expo SDK (pinned in `.claude/skills/build-mobile/config.json` as `expo_sdk`) + Expo Router (file-based
navigation) + NativeWind (Tailwind for React Native, which reads the same `--token: H S% L%` design
variables as the web app) + TypeScript. The skill confirms the current stable Expo SDK at build time
and uses `npx expo install` to reconcile native versions — so bumping the SDK later is a one-line
change. If a pinned SDK's `babel-preset-expo` doesn't already include the Reanimated plugin, list
`react-native-reanimated/plugin` **last** in `babel.config.js`.

## Re-running

Run `build-mobile` again any time. It won't clobber your work: it diffs your current MVP against what's
built and offers to **add/update screens**, **re-apply the theme** (after you tweak the design system),
or **both** — showing a diff and asking before it overwrites anything you've edited.

## What ships in the template

Only the skill and this doc ship. **No `mobile/` is ever built into the template itself.** Your
`mobile/` appears only when *you* run `build-mobile` in your own copy.

## Later tiers (not in v1)

- **Installable builds (EAS)** — Expo's cloud build service turns your app into a real installable
  build for **TestFlight** / the **Play Store**. Needs a free Expo account and cloud builds — a bigger
  lift, so it's a dedicated later tier beyond the no-accounts default.
- **Voice assistants (Siri / Apple App Intents)** — letting Siri drive your app is a genuine later tier,
  **not Tier-0**: App Intents is Swift-only and needs a native build (EAS + an Apple Developer account, no
  Expo Go preview), Apple deprecated the older SiriKit, and Expo's `expo-app-intents` module is still an
  unmerged PR — and it's single-vendor. Vetted and **deferred** on 2026-07-03 (see
  `outputs/vetting/2026-07-03-agent-accessibility/`); `build-mobile` won't scaffold it yet. To make your app
  usable by *cross-platform* AI agents today, use [`build-mcp`](BUILD-MCP.md) on the web `app/` instead.
- **Real data, accounts, and backend** — swap mock data for a real backend (e.g. Supabase) and add
  sign-in. These need keys/services, so they're opt-in tiers.
- **Other targets** — the **web** app ([`build-app`](BUILD-APP.md)) and **browser extension**
  ([`build-plugin`](BUILD-PLUGIN.md)) are separate slices; the `raw/builds/` + `wiki/build.md`
  provenance already accommodates them.

## Credit / inspiration

The "scaffold → theme → mock data → preview" flow follows the modern Claude Code build workflow shown
in Chris Raroque's *"How I Build Apps So Fast."*
