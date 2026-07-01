# build-mobile Implementation Plan (Phase 12)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author the `build-mobile` skill (+ doc + wiring) — the phone-app sibling of `build-app` —
that turns a project's charter, design system, and vetting verdict into a themed Expo (React Native)
app in a new top-level `mobile/` folder, previewed on a phone via Expo Go QR. Author only; never build
a real app into this template.

**Architecture:** One attended Claude Code skill (`.claude/skills/build-mobile/SKILL.md` +
`config.json`) plus a detail doc (`docs/BUILD-MOBILE.md`) and eight small wiring edits. The skill mirrors
`build-app` (same phases, guardrails, provenance) but scaffolds an **Expo + Expo Router + NativeWind +
TypeScript** project into `mobile/`, themed from the same 13 HSL tokens, and records the build on the
**shared** `raw/builds/` + `wiki/build.md` spine tagged `target: mobile`. `mobile/` is a build target
outside the three-folder knowledge discipline.

**Tech Stack:** Markdown/JSON skill authoring (no code/tests). Source of truth: the committed spec
`docs/superpowers/specs/2026-06-30-build-mobile-design.md`. Verification is by `grep`/`wc`/`git` DoD
checks (documentation, not code — there is no test suite).

**Branch:** all work happens on `phase-12-build-mobile` (already created off `main`). The Task 8
`git diff main..HEAD` checks depend on it — do not commit on `main`.

**Discipline (every task):** Ship ONLY the skill + doc + wiring edits. **No new `.gitkeep`**
(`raw/builds/.gitkeep` already ships). **Never** create a real `mobile/`, `raw/builds/<date>-<slug>.md`,
or `wiki/build.md`. **Never** run a real build. Keep `CLAUDE.md` under 125 lines. Leave `build-app`,
`improve-system`, and `raw/` immutability untouched (this phase only ADDS the mobile skill + additive
wiring).

---

### Task 1: Skill config — `config.json`

**Files:**
- Create: `.claude/skills/build-mobile/config.json`

- [ ] **Step 1: Create `.claude/skills/build-mobile/config.json`** with exactly:

````json
{
  "mobile_dir": "mobile",
  "expo_sdk": "56",
  "max_screens": 6
}
````

- [ ] **Step 2: Verify DoD**

Run: `node -e "console.log(require('./.claude/skills/build-mobile/config.json').mobile_dir)"` → expect `mobile`.
(No `raw/builds/.gitkeep` to create — it already ships from Phase 11.)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/build-mobile/config.json
git commit -m "feat(build-mobile): skill config"
```

---

### Task 2: The `build-mobile` SKILL.md

**Files:**
- Create: `.claude/skills/build-mobile/SKILL.md`

**Context for the implementer:** The core artifact. Write it in the voice/structure of
`.claude/skills/build-app/SKILL.md` (its web sibling) — calm, plain, procedural. The full content is
given below; write it verbatim (it encodes the committed spec `2026-06-30-build-mobile-design.md`). Do
not invent extra features.

- [ ] **Step 1: Create `.claude/skills/build-mobile/SKILL.md`** with exactly this content:

````markdown
---
name: build-mobile
description: Use when someone asks to "build my mobile app", "build the mobile app", "make a mobile app", "build it for phones", "turn my idea into a phone app", or says "/build-mobile". Turns the project's charter (the MVP scope) + design system (the theme) into a working, themed Expo (React Native) mobile app in a new top-level mobile/ folder, previewed on a phone by scanning a QR code with the free Expo Go app. Reads wiki/charter.md, wiki/design-system.md, and the latest outputs/vetting/ verdict; one screen-plan confirm gate; Tier 0 (mock/local data — no backend, auth, deploy, accounts, or keys). Attended-only — never runs in the maintenance loop. Re-runnable: adds screens incrementally and never overwrites a file without asking. Zero-argument safe.
argument-hint: "[what to build, or leave blank to use your charter]"
---

# build-mobile

The phone-app sibling of `build-app`. The foundation already helps a non-technical user get clear on
*what* they're building (`define-project` → `wiki/charter.md`), *whether it's worth building*
(`roast`/`storm-research` → `outputs/vetting/`), and *how it should look* (`define-design` →
`wiki/design-system.md`). This skill turns those three north-stars into an actual, working, on-brand
**phone app** they can open on their own device — without making them figure out any of the building
themselves.

What it produces: a new top-level **`mobile/`** folder — its own **Expo (React Native) + Expo Router +
NativeWind + TypeScript** project, themed from the design system (the same 13 tokens as the web app),
with a screen for each item in the charter's MVP, wired to **mock/local data**. You preview it on your
phone by scanning a QR code with the free Expo Go app — no Mac, no Xcode. It is a **front-end MVP with
placeholder data** — no backend, accounts, or app-store build (those are later tiers).

## When to use

When the user says "build my mobile app", "build the mobile app", "make a mobile app", "build it for
phones", "turn my idea into a phone app", or `/build-mobile`. Also offered by `what-can-i-do`, by
`setup-project` once a charter + design exist, and pointed to by `advise-project` for a GO-vetted idea.
It is **attended** — it asks one confirming question before building — and **never runs in the
unattended `maintenance-loop`**. This is the phone sibling of `build-app` (which builds a web app into
`app/`).

## Configuration

Read `.claude/skills/build-mobile/config.json` (all values default; never block on absence):
- `mobile_dir` (default `"mobile"`) — where the app is written.
- `expo_sdk` (default `"56"`) — the pinned Expo SDK. **Confirm the current stable SDK at build time**
  rather than trusting the default on faith; bumping is a one-line change and `npx expo install`
  reconciles native versions.
- `max_screens` (default `6`) — the cap on screens built in one pass (the runaway-scope guard).

## Procedure

### Phase 0 — Pre-flight (read the north-stars; route, don't guess)

Read the three inputs, in order, and **route** rather than guess:

1. **Charter — `wiki/charter.md` (required).** There is nothing to build without a scope.
   - **Missing →** offer to run `define-project` first: *"To build the right thing, I need to know
     what we're building. Want me to run a quick discovery interview first? It only takes a few
     minutes, then I'll build straight from it."* On yes, run `define-project`, then read the charter.
     On no, accept a **one-paragraph scope in chat** as a degraded fallback (record it in the build
     record as "scope supplied in chat — no charter").
   - Read `## Purpose & problem`, `## Audience & users`, and especially `## Scope` → the **In / MVP**
     list. Treat `Out` and `Later` as hard exclusions.
2. **Design system — `wiki/design-system.md` (recommended).**
   - **Missing →** offer `define-design`: *"Want to set how it looks first, so it isn't generic?"* If
     declined, proceed with the default tokens (the `aios/src/index.css` reference values) and say so
     plainly: *"I'll use a clean default theme — run `define-design` any time and I'll re-theme the
     app."*
   - When present, use its **Palette** (the 13 HSL tokens + their contrast pairs), **Typography &
     shape** (`--radius`, the type pairing), and **Voice** (microcopy tone).
3. **Vetting verdict — the latest `outputs/vetting/<date>-<slug>/roast-verdict.md`** (via the
   charter's `## Vetting` link, else the newest folder under `outputs/vetting/`):
   - **GO** → proceed.
   - **RESHAPE** → surface the pivot line and **build the reshaped version**; fold it into the plan.
   - **KILL** → **stop.** *"This idea was judged **KILL** — '<one-line why>'. Building it as-is risks
     <biggest risk>. I'd reshape it first (run `define-project`). To build it anyway, say
     'build anyway'."* Continue **only** on that explicit override, and record the override in the
     build record.
   - **No vetting found →** one-line optional offer (*"Want a quick gut-check first? Say `roast`.
     Otherwise I'll go ahead."*) — never force it.
4. **Existing `mobile/` →** switch to **incremental mode** (see *Re-running*).

### Phase 1 — Derive the screen plan

From the charter's **In / MVP** list, derive a **small** set of screens/routes — each becomes an Expo
Router route file, each with the components it needs and the mock entities it shows. Use
`Purpose`/`Audience` to choose a mobile nav archetype (**tabs**, a **stack**, or **list + detail**) and
the design system's **Voice** for the wording.

**Stay scoped (the runaway guard):** cap at `config.max_screens` (default 6). If the MVP implies more,
build the **core slice** — the 3–6 most central screens — and list the rest under
`Later (not in this build)`. Never exceed the cap in one pass.

### Phase 2 — Confirm once, then build

Show the plan in **one message** and ask **one** question. ("Single gate" = the build decision; the
Phase 0 routing above is separate pre-flight.) Include:
- the app's name + one-liner (from the charter),
- the screen list — one line of purpose each,
- the components + mock entities per screen,
- the **theme source** (`wiki/design-system.md`, or "clean default"),
- the **stack** (Expo SDK + Expo Router + NativeWind) and that it lives in `mobile/`, previewed on a
  phone via a QR code,
- anything **deferred** (the core-slice note), and
- the **vetting status** folded in.

Ask: *"Build this? I'll create the `mobile/` folder and you'll be able to preview it on your phone.
(yes / tweak something)"* On "tweak", revise and show again. **No per-screen interrogation.**

### Phase 3 — Scaffold + theme `mobile/`

Build **in-session, in order** (the scaffold is mostly shared spine with hard dependencies — not
something to fan out to parallel agents). Hand-write the project **offline**. Note: Expo Router's
routes dir is **`mobile/app/`**, distinct from the repo-root web `app/` (no collision). Create
`mobile/` as its own minimal project:

```
mobile/
├── package.json          # own; "main":"expo-router/entry" (REQUIRED — no index.html entry); pinned Expo
│                         #   SDK (config.expo_sdk): expo, react, react-native, expo-router, nativewind,
│                         #   react-native-safe-area-context, react-native-reanimated; dev: typescript,
│                         #   tailwindcss@^3.4, babel-preset-expo, @types/*. Scripts: start (expo start),
│                         #   android, ios, web (expo start --web).
├── app.json              # Expo config: name/slug from charter; expo-router plugin; icon/splash placeholders
├── babel.config.js       # babel-preset-expo + nativewind/babel (add react-native-reanimated/plugin LAST if the SDK preset doesn't include it)
├── metro.config.js       # withNativeWind(config, { input: './global.css' })
├── tailwind.config.js    # presets:[nativewind/preset]; content globs; colors → hsl(var(--token)/<alpha-value>); --radius
├── global.css            # the 13 HSL tokens (:root + dark) FROM wiki/design-system.md — mirrors app/src/index.css
├── tsconfig.json         # extends expo/tsconfig.base, strict
├── nativewind-env.d.ts   # NativeWind types reference
├── .gitignore            # node_modules, .expo/, dist/, web-build/, *.log  (Expo's standard ignores)
├── README.md             # how to preview (QR + Expo Go) + "themed mobile MVP, mock data" + raw/builds pointer
├── assets/               # icon/splash placeholders (optional)
├── app/                  # Expo Router routes (mobile/app/, NOT the repo-root web app/)
│   ├── _layout.tsx       # SafeAreaProvider + Stack/Tabs nav; imports global.css
│   ├── index.tsx         # home screen
│   └── <one file per derived screen>   # e.g. items.tsx, [id].tsx for detail
└── src/
    ├── components/ui/    # RN shadcn-style primitives (Button=Pressable+Text, Card=View, Input=TextInput…) via cva + NativeWind
    ├── components/layout/AppShell.tsx   # themed header/nav
    ├── config/app.ts     # app name/tagline from the charter (words only)
    ├── lib/utils.ts      # cn() helper
    └── data/             # typed mock fixtures + getX()/listX() accessors — no fetch, no env, offline
```

**Pin the stack from the Expo SDK.** There is no Expo project in the repo to mirror, so pin the stable
Expo SDK named in `config.expo_sdk` (confirm the current stable SDK at build time) and let
**`npx expo install`** reconcile native-dep versions at install time — the idiomatic RN approach (pin
the SDK; don't hand-pin React Native). Hand-write `package.json` with the SDK-pinned versions, plus
`"main": "expo-router/entry"`.

**Theme it exactly like the web app.** Write the same 13 base tokens (`:root` and dark) into
`mobile/global.css` — identical names/format to `app/src/index.css` (space-separated HSL triplets, no
`hsl()` wrapper) — and **re-derive + eyeball the contrast pairs** (`--*-foreground`, `--popover*`) so
text stays legible; set `--radius` + the shadow vars from *Typography & shape*. `tailwind.config.js`
maps each token to `hsl(var(--token) / <alpha-value>)` (the one theming difference from web: RN needs
the config's colors block; the token *values* are identical). Dark mode via NativeWind `dark:` +
`useColorScheme`. **Fonts:** default to the system stack (SF Pro / Roboto) for v1; only wire a custom
font (expo-font) if the design names one. **Safe area** via `react-native-safe-area-context`; keep icon
use light (the Expo-recommended icon set for the pinned SDK).

**Mock data, not a backend.** Put a typed fixture module per entity in `src/data/` (plain arrays +
`getX()`/`listX()` accessors), imported directly by screens. No fetch, no env, no network. Every screen
is clearly placeholder-powered; say so in `mobile/README.md`.

**Routes & components.** File-based routes in `mobile/app/` (Expo Router) under a shared `_layout.tsx`
(SafeAreaProvider + a Stack or Tabs navigator). Reuse cva + NativeWind primitives (button, card, input,
badge…) so the look matches the design system's quality bar. Copy only the primitives you actually use.

### Phase 4 — Record it (provenance)

The **code** lives in `mobile/` (a build target outside the knowledge folders, like `aios/` and
`app/`). The **record** lands in the knowledge base, on the same spine as `build-app`:
- **`raw/builds/<YYYY-MM-DD>-<slug>.md`** *(immutable, append-only; new dated file per build, `-2` for
  same-day re-runs)* — opens with RAG frontmatter (`title`/`source_id`/`path`/`tags`/`updated`) **with
  `target: mobile`** (+ a `mobile` tag), then captures: the confirmed screen plan, components, mock
  entities, the theme source, the charter version, the vetting verdict referenced (and any KILL
  override), the pinned Expo SDK / stack, and anything deferred.
- **`wiki/build.md`** *(the shared, multi-target build index; created on the first build of any kind,
  like `roast` creates `wiki/vetting.md`; opens with RAG frontmatter — see `docs/WIKI-FRONTMATTER.md`)*
  — add/maintain a **`## Mobile app (`mobile/`)`** section (route list, where it lives, the QR-preview
  instructions, theme source, links to the `raw/builds/` record(s) + `wiki/charter.md` +
  `wiki/design-system.md`). **Preserve any existing web content:** `build-app` writes this file as a
  flat, un-sectioned web index — so if a prior flat web index exists, **first wrap it under a
  `## Web app (`app/`)` heading**, then add the Mobile section below it; never drop or overwrite the web
  content. If the file doesn't exist yet, create it with just the Mobile section. Cross-link from
  `wiki/index.md` (pinned under "By area" + a "Recent additions" line) on first creation. Reference the
  raw record — never paste app code.
- **`outputs/change-log.md`** — append one attributed line (newest-at-top, as the sibling skills write
  it): `- <YYYY-MM-DD> — build-mobile — scaffolded Expo mobile app (mobile/) from wiki/charter.md MVP; themed from wiki/design-system.md — applied`

`raw/builds/.gitkeep` already ships — nothing new. `improve-system` stays the single applier for the
self-improvement lanes — this skill only writes its own `applied` line, exactly as
`build-app`/`define-design` do.

### Phase 5 — Hand it over, simply

Don't run anything that hits the network or installs to disk — **offer** it, keeping `mobile/` as the
working directory (as one compound command, or via `npm --prefix mobile` — don't split a bare `cd`
from a later command, since shell `cd` doesn't persist across separate invocations). Close with the
plain-words preview path:

> *"Your mobile app is ready in the `mobile/` folder. To see it on your phone: run
> `cd mobile && npm install` (one time — this downloads the app's building blocks), then `npm run
> start` (or `npx expo start`) — it shows a QR code. Open the free **Expo Go** app on your phone and
> scan it; your app loads in a few seconds. No Mac or app-store setup needed. Prefer your computer?
> `npm run web` opens it in a browser. Want me to start it for you?"*

If they say yes, run the commands with `mobile/` as the working directory. Optionally offer
`npm --prefix mobile run typecheck` to check it over; offer to fix any type errors on the spot. If
offline, the app is still fully written — install and preview when back online.

## Re-running (incremental, never clobber)

If `mobile/` already exists, switch to **incremental mode**: read the existing `mobile/`, the latest
`raw/builds/` record, and `wiki/build.md`, then diff the current charter MVP against what's already
built. At the confirm gate, offer a small menu:
1. **Add / update screens** — only the deltas,
2. **Re-apply the theme** — from the current `wiki/design-system.md`,
3. **Both.**

Write **new** files freely; for any **existing** file, show the change as a diff and **confirm before
overwriting**. Each re-run writes a **new** `raw/builds/` record and updates the Mobile section of
`wiki/build.md` in place. If a prior build is partial/broken (missing spine files), offer a targeted
repair.

`build-mobile` **owns everything under `mobile/`, including its theme** — so a restyle is just a re-run
(option 2), not a job for `define-design` (which owns `aios/`).

## Rules & guardrails

- **Attended-only — never in `maintenance-loop`.** This skill writes project source and offers
  `npm install` (network + disk); it must never run unattended. It is built around the one confirm
  gate.
- **Tier 0 — no keys, no accounts, mock data.** v1 has no backend, auth, deploy, env, or secrets;
  nothing is collected in chat. **Installable app-store builds (EAS) + an Expo account are a later
  tier.** Scaffolding works fully offline (only the opt-in `npm install` needs the network — if
  offline, the app is still written; install later).
- **Stay scoped.** Honor `max_screens` and the charter's `Out`/`Later`; build the core slice and name
  what's deferred, rather than ballooning.
- **Be honest about what it is.** Every artifact (the `mobile/README.md`, `wiki/build.md`, the
  close-out) calls it a **themed mobile MVP with placeholder data, previewed via Expo Go** (not a
  store-published app), and names the later tiers (installable builds via EAS + a free Expo account,
  real data/accounts/backend, plus web and plugins are other slices).

## Output

A new `mobile/` folder (a runnable, themed Expo mobile MVP), an immutable `raw/builds/<date>-<slug>.md`
record tagged `target: mobile`, a created/updated `wiki/build.md` Mobile section (+ `wiki/index.md`
cross-links), one `change-log.md` line — and a QR-code path to preview it on a phone.
````

- [ ] **Step 2: Verify DoD**

Run (Git Bash), all must print a match:
```bash
cd .claude/skills/build-mobile
grep -q "^name: build-mobile" SKILL.md && echo NAME_OK
grep -q "argument-hint:" SKILL.md && echo HINT_OK
grep -qi "attended-only" SKILL.md && grep -qi "never.*maintenance" SKILL.md && echo ATTENDED_OK
grep -q "raw/builds/" SKILL.md && grep -q "wiki/build.md" SKILL.md && grep -q "target: mobile" SKILL.md && echo PROVENANCE_OK
grep -qi "build anyway" SKILL.md && echo KILL_GATE_OK
grep -q "max_screens" SKILL.md && grep -q "mobile_dir" SKILL.md && grep -q "expo_sdk" SKILL.md && echo CONFIG_OK
grep -qi "mock" SKILL.md && grep -qi "no backend" SKILL.md && echo TIER0_OK
grep -qi "Expo Go" SKILL.md && grep -qi "QR" SKILL.md && grep -q "expo-router/entry" SKILL.md && echo EXPO_OK
grep -q "global.css" SKILL.md && grep -qi "nativewind" SKILL.md && echo THEME_OK
```
Expect: NAME_OK HINT_OK ATTENDED_OK PROVENANCE_OK KILL_GATE_OK CONFIG_OK TIER0_OK EXPO_OK THEME_OK.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/build-mobile/SKILL.md
git commit -m "feat(build-mobile): the build-mobile skill (Expo phone app, QR preview)"
```

---

### Task 3: `docs/BUILD-MOBILE.md`

**Files:**
- Create: `docs/BUILD-MOBILE.md`

- [ ] **Step 1: Create `docs/BUILD-MOBILE.md`** with exactly this content:

````markdown
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
- **Real data, accounts, and backend** — swap mock data for a real backend (e.g. Supabase) and add
  sign-in. These need keys/services, so they're opt-in tiers.
- **Other targets** — the **web** app ([`build-app`](BUILD-APP.md)) and **plugins** are separate
  slices; the `raw/builds/` + `wiki/build.md` provenance already accommodates them.

## Credit / inspiration

The "scaffold → theme → mock data → preview" flow follows the modern Claude Code build workflow shown
in Chris Raroque's *"How I Build Apps So Fast."*
````

- [ ] **Step 2: Verify DoD**

Run: `grep -qi "later tiers" docs/BUILD-MOBILE.md && grep -qi "Expo Go" docs/BUILD-MOBILE.md && grep -qi "ships in the template" docs/BUILD-MOBILE.md && grep -q "target: mobile" docs/BUILD-MOBILE.md && echo DOC_OK` → expect `DOC_OK`.

- [ ] **Step 3: Commit**

```bash
git add docs/BUILD-MOBILE.md
git commit -m "docs(build-mobile): BUILD-MOBILE.md detail page"
```

---

### Task 4: Wire the menu + advisor + setup (`what-can-i-do`, `advise-project`, `setup-project`)

**Files:**
- Modify: `.claude/skills/what-can-i-do/SKILL.md`
- Modify: `.claude/skills/advise-project/SKILL.md`
- Modify: `.claude/skills/setup-project/SKILL.md`

- [ ] **Step 1: `what-can-i-do`** — insert a new menu bullet immediately AFTER the existing
  `- **Build a first version of your app** … → runs \`build-app\`` line (currently line 24) and before
  the `- **Add something**` line:

```
   - **Build a mobile app** — turn your plan into an app you can open on your phone → runs `build-mobile`
```

- [ ] **Step 2: `setup-project`** — in step 8, extend the existing build-app offer to name both. Replace:

```
   - If `wiki/charter.md` and `wiki/design-system.md` both exist, offer: *"Want me to build a
     first version of your app now? → runs `build-app`"* (propose-only — never auto-run).
```

with:

```
   - If `wiki/charter.md` and `wiki/design-system.md` both exist, offer: *"Want me to build a
     first version of your app now? → runs `build-app` (web) or `build-mobile` (phone)"* (propose-only — never auto-run).
```

- [ ] **Step 3: `advise-project`** — in the Procedure step 6 `project`-lane parenthetical, extend the
  build-app mention to include build-mobile. Change the phrase `point to \`build-app\` as the suggested
  next step` to `point to \`build-app\` (web) or \`build-mobile\` (phone) as the suggested next step`,
  and change `Never auto-run a roast or \`build-app\` inside the` to `Never auto-run a roast,
  \`build-app\`, or \`build-mobile\` inside the`. Also tidy the now-three-item grammar: change
  `both are attended` to `all are attended`. (Read the file to match the exact surrounding text;
  make all three edits; preserve the propose-only invariant.)

- [ ] **Step 4: Verify DoD**

```bash
grep -q "Build a mobile app" .claude/skills/what-can-i-do/SKILL.md && echo MENU_OK
grep -q "build-mobile" .claude/skills/setup-project/SKILL.md && echo SETUP_OK
grep -q "build-mobile" .claude/skills/advise-project/SKILL.md && grep -qi "propose-only" .claude/skills/advise-project/SKILL.md && echo ADVISE_OK
```
Expect: MENU_OK SETUP_OK ADVISE_OK. Confirm `advise-project` still says it never auto-applies / stays propose-only.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/what-can-i-do/SKILL.md .claude/skills/advise-project/SKILL.md .claude/skills/setup-project/SKILL.md
git commit -m "feat(build-mobile): wire into what-can-i-do, setup-project, advise-project (propose-only)"
```

---

### Task 5: `CLAUDE.md` — skill bullet + widen the `raw/builds/` line (keep < 125 lines)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Widen the `raw/builds/` subfolder line.** Replace the current line 24:

```
  - `raw/builds/` — `build-app` build records; the app itself lives in `app/` (a build target outside the knowledge system, like `aios/`)
```

with:

```
  - `raw/builds/` — `build-app`/`build-mobile` build records; the apps live in `app/` (web) and `mobile/` (build targets outside the knowledge system, like `aios/`)
```

- [ ] **Step 2: Add the `build-mobile` Skills bullet** immediately after the `build-app` bullet
  (currently line 81):

```
- **`build-mobile`** — the phone sibling of `build-app`: turn the charter + design system into a themed **Expo (React Native)** app in a new top-level `mobile/` folder, previewed on a phone by scanning a QR code (Expo Go — no Mac/Xcode). Attended, Tier 0 (mock data, no keys/accounts); one confirm gate; re-runnable; **never in the unattended loop**. Installable app-store builds (EAS) are a later tier. See `docs/BUILD-MOBILE.md`.
```

- [ ] **Step 3: Verify DoD**

```bash
grep -q '`build-mobile`' CLAUDE.md && echo BULLET_OK
grep -q 'build-app`/`build-mobile' CLAUDE.md && echo RAWLINE_OK
LINES=$(wc -l < CLAUDE.md); echo "CLAUDE.md lines: $LINES"; [ "$LINES" -lt 125 ] && echo CAP_OK
```
Expect: BULLET_OK RAWLINE_OK CAP_OK (lines < 125).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(build-mobile): CLAUDE.md skill bullet + widen raw/builds note"
```

---

### Task 6: `README.md` + `docs/USING-THIS-FOR-ANY-PROJECT.md` + `docs/BUILD-APP.md`

**Files:**
- Modify: `README.md`
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md`
- Modify: `docs/BUILD-APP.md`

- [ ] **Step 1: README — "What you get" bullet.** Replace the current `🛠️ **Built for you**` bullet
  (line 43) with a version that names both web and mobile:

```
- 🛠️ **Built for you** — when you're ready, say **"build my app"** (web) or **"build my mobile app"** (phone) and it scaffolds a working, on-brand first version in an `app/` or `mobile/` folder — the mobile one previews on your phone via a QR code, mock data first, no coding (see [building your app](docs/BUILD-APP.md) · [mobile](docs/BUILD-MOBILE.md)).
```

- [ ] **Step 2: README — the "Build it" journey step** (line 87). Append a mobile sentence to step 4
  so it reads (keep the existing web text, add the mobile option + link):

```
4. **Build it** — when the plan and look are set, run **[`build-app`](.claude/skills/build-app/SKILL.md)** (or just say "build my app") and it scaffolds a working, themed first version of your web app into an `app/` folder, runnable with `npm run dev`. Prefer a phone app? Run **[`build-mobile`](.claude/skills/build-mobile/SKILL.md)** ("build my mobile app") for an Expo app in a `mobile/` folder you preview on your phone via a QR code. Both are front-end MVPs with placeholder data — real data, accounts, and deployment come later. See [building your app](docs/BUILD-APP.md) · [mobile](docs/BUILD-MOBILE.md).
```

- [ ] **Step 3: README — docs table + build-status.** Add a Documentation-table row after the
  `Building your app` row (line 56): `| [Building your mobile app](docs/BUILD-MOBILE.md) | How the system builds a phone app for you. |`
  and add to the phase list after the Phase 11 line (line 126):
  `- Phase 12 — `build-mobile`: turn the charter + design system into a themed Expo phone app (`mobile/`) ✅`

- [ ] **Step 4: USING** — replace the `**Then build it:**` line (line 30) with a version that adds the
  mobile option (keep the web text; append the mobile sentence + link):

```
**Then build it:** run **`build-app`** — it turns the charter (the MVP scope) + design system (the theme) into a working, themed front-end web app in a new top-level `app/` folder, runnable with `npm run dev`. Prefer a phone app? Run **`build-mobile`** for a themed Expo (React Native) app in a `mobile/` folder you preview on your phone via a QR code (Expo Go). Both are Tier-0 front-end MVPs (mock data, no keys); real data/accounts/deploy and app-store/installable builds are later tiers. See `docs/BUILD-APP.md` · `docs/BUILD-MOBILE.md`.
```

- [ ] **Step 5: `docs/BUILD-APP.md`** — add one cross-reference line near the top (after the opening
  paragraph) pointing to the mobile sibling:

```
> For a **phone app**, see the sibling skill [`build-mobile`](BUILD-MOBILE.md).
```

- [ ] **Step 6: Verify DoD**

```bash
grep -q "BUILD-MOBILE.md" README.md && grep -q "Phase 12" README.md && grep -qi "build my mobile app" README.md && echo README_OK
grep -q "build-mobile" docs/USING-THIS-FOR-ANY-PROJECT.md && echo USING_OK
grep -q "BUILD-MOBILE.md" docs/BUILD-APP.md && echo XREF_OK
```
Expect: README_OK USING_OK XREF_OK.

- [ ] **Step 7: Commit**

```bash
git add README.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/BUILD-APP.md
git commit -m "docs(build-mobile): README + USING + BUILD-APP — surface the mobile build option"
```

---

### Task 7: Phase 12 addendum to the master design spec

**Files:**
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`

- [ ] **Step 1:** Read the existing Phase 11 addendum (near the end) and append a **Phase 12 addendum**
  in the same voice/format. It should: name Phase 12 = `build-mobile` (the phone sibling of
  `build-app`); summarize that the build step is now **web *or* mobile**; note the Expo + Expo Router +
  NativeWind stack, the QR/Expo Go preview, the `mobile/` target folder (distinct from the web `app/`),
  and the **shared** `raw/builds/` + `wiki/build.md` provenance now carrying a `target` dimension; and
  note that installable builds (EAS) + plugins remain later slices. Point to
  `docs/BUILD-MOBILE.md` and `docs/superpowers/specs/2026-06-30-build-mobile-design.md`.

- [ ] **Step 2: Verify DoD**

```bash
grep -q "Phase 12" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && grep -q "build-mobile" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo ADDENDUM_OK
```
Expect: ADDENDUM_OK.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs(build-mobile): Phase 12 addendum in the master design spec"
```

---

### Task 8: Final no-pollution + integrity verification

**Files:** none (verification only).

- [ ] **Step 1: No real app/artifacts committed.**

```bash
test ! -e mobile && echo NO_MOBILE_OK
ls raw/builds/ | grep -v '^\.gitkeep$' | grep -q . && echo "POLLUTION: real build record" || echo NO_BUILD_RECORD_OK
test ! -e wiki/build.md && echo NO_WIKI_BUILD_OK
git status --porcelain   # expect: clean
```
Expect: NO_MOBILE_OK, NO_BUILD_RECORD_OK, NO_WIKI_BUILD_OK, clean tree.

- [ ] **Step 2: Invariants intact.** The real invariant: no *existing* `raw/` content mutated (and NO
  new file under `raw/` at all this phase — `raw/builds/.gitkeep` already shipped in Phase 11);
  `improve-system`, `build-app`, and the change-log ledger untouched.

```bash
git diff --name-only main..HEAD -- .claude/skills/improve-system .claude/skills/build-app raw outputs/change-log.md   # expect EMPTY
```
Expect: EMPTY.

- [ ] **Step 3: Only the intended files changed.**

```bash
git diff --name-only main..HEAD
```
Expect exactly: the 3 created (`.claude/skills/build-mobile/SKILL.md`, `.claude/skills/build-mobile/config.json`,
`docs/BUILD-MOBILE.md`) + the 8 modified (`CLAUDE.md`, `README.md`, `docs/USING-THIS-FOR-ANY-PROJECT.md`,
`docs/BUILD-APP.md`, `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`,
`.claude/skills/{what-can-i-do,setup-project,advise-project}/SKILL.md`) + the two spec/plan docs from
this session. Nothing else — and NO `mobile/`.

- [ ] **Step 4:** No commit (verification only). Proceed to the final review gates (Claude whole-branch
  review + Codex `codex review --base main`), then `finishing-a-development-branch`. Merge/push only on
  the user's explicit request.

---

## Notes for the executor
- **DRY/YAGNI:** ship exactly the spec — no extra features, no real `mobile/`.
- **Voice:** mirror `build-app`/`define-design` (calm, plain, procedural); the non-technical user is the reader.
- **Do NOT run a real build** (`build-mobile`) against this template at any point.
- After all tasks: dispatch a final whole-branch Claude review, then run the Codex gate
  (`codex review --base main`), then use `finishing-a-development-branch`. Merge/push only on the
  user's explicit request.
