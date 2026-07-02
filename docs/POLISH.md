# polish — make your app launch-ready

`build-app` gives you a themed app with **placeholder text and no loading/error/empty screens**. `polish`
turns that into a **launch-ready product**: real words, the missing UX moments, legal pages, user docs, and
(if you want) a payments scaffold. It's the last step of the **path to production** — and it closes the exact
`content` and `legal` gaps that `ship-check` points at.

Say **"polish my app"**, **"make it launch-ready"**, **"add a privacy policy"**, **"add payments"**, or
**`/polish`**.

## What it does

You pick the areas (or run the default set); each is a focused pass over your app:

- **Content** — swaps the placeholder copy for real, on-brand words written in your design system's voice.
  Where it can't make a real logo or photo, it drops in a clearly-labelled placeholder and tells you to
  replace it — it never pretends an asset is real.
- **States** — adds the screens a prototype skips: a first-run welcome, "nothing here yet" empty states,
  friendly error states, and loading spinners/skeletons.
- **Legal** — scaffolds a privacy policy, terms of service, and a cookie-consent banner **as starting
  templates** with fill-in fields. Every page carries a clear notice: **this is a template, not legal advice —
  have a lawyer review it, and it doesn't by itself make you GDPR/CCPA compliant.**
- **Docs** — writes a real README and a short "how to use it" guide from your charter.
- **Payments (optional)** — a Stripe scaffold that's **inert until you configure it**. It never enters a key,
  never creates an account, and never charges anything — you do the go-live from a checklist it hands you.

Everything is written into `app/`, recorded in `raw/builds/` + `wiki/build.md`, and (for payments) accompanied
by `outputs/polish/<date>-<slug>/GO-LIVE.md`.

## The two boundaries it never crosses

- **Legal is a starting point, not advice.** The templates get you a structure and a checklist — a qualified
  lawyer finishes them. Having the pages present is not the same as being compliant, and the skill says so.
- **Payments never touch your money or keys.** The scaffold does the client-side half and hands you a
  checklist for the one keyed step (create the Stripe account, paste the publishable key, add a server
  endpoint for the secret). Your keys stay yours; nothing is charged.

## What it is (and isn't)

- **Is:** the "make it legitimate" pass that takes a themed prototype to launch-ready — real content, complete
  UX, legal scaffolding, docs, optional payments.
- **Isn't:** a lawyer, a live payment processor, or a deploy button. It scaffolds and hands you the human
  steps.
- **Web app (`app/`) first;** phone/extension polish comes later.

## Safety

It changes only your app (and records what it did), works fully offline, and **never enters a key, charges a
card, or claims legal compliance**. It's attended (it shows you the plan and asks first), never runs in the
maintenance loop, and is deliberately not part of `autopilot` — making it legitimate is a call you make.
Polish is the sixth and final rung of the **path to production** (`docs/PATH-TO-PRODUCTION.md`).
