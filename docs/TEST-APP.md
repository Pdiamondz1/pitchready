# test-app — prove your app works

`build-app` gives you a themed, working web app in `app/`, and `build-backend` can make its data real — but
a prototype has **no tests**. `test-app` gives that same app a **real, runnable test suite** and maps it to
*your* success criteria, so the tests check your definition of "working," not just that the code runs.

Say **"test my app"**, **"add tests"**, **"does my app actually work?"**, or **`/test-app`**.

## What it does

It reads your app and your charter, then scaffolds — **fully offline, nothing installed**:

- **Unit tests** — your helpers and your data accessors return what they should.
- **Component tests** — each screen renders, shows its data, and its forms validate.
- **End-to-end (browser) tests** — Playwright walks the main paths through your app.
- **A success-criteria map** — each goal from your charter (`## Success & outcomes`) becomes either an
  automated test or a clearly flagged "manual / metric — can't automate this one" note (a target like "10
  paying customers" isn't a browser test).
- **Coverage** and the `npm test` commands, plus a plan at `outputs/tests/<date>-<slug>/TEST-PLAN.md`
  showing exactly what's covered and what's flagged manual.

## Running the tests

Everything is scaffolded offline; running the tests is the one step that's yours (it downloads the testing
tools). When it's done it offers:

- `cd app && npm install` (one time), then `npm test` — runs the fast unit + component tests.
- For the browser tests: `npx playwright install` once (a bigger one-time download), then `npm run test:e2e`.

If you say yes, it'll run the unit tests for you — exactly like `build-app` offers to start your app. The
browser download stays yours to run.

## What it is (and isn't)

- **Is:** a real, runnable suite (Vitest + Testing Library + Playwright + coverage) mapped to your goals —
  a genuine safety net and a foundation to grow.
- **Isn't:** exhaustive. Deep behavioral tests and the criteria it flags "manual" are yours to add over
  time. It never claims your app is "fully tested."
- **Web app (`app/`) first;** phone/extension test tiers come later.

## Safety

It writes only test files (never changes your app's code), scaffolds fully offline, asks once before
generating, and **never runs in the unattended maintenance loop**. Nothing installs or runs without your
say-so. Testing is the second rung of the **path to production** (`docs/PATH-TO-PRODUCTION.md`).
