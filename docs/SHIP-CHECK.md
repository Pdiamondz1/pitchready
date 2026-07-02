# ship-check — is your app ready to go live?

`build-app` builds your app, `build-backend` makes its data real, `test-app` proves it works, `audit-app`
checks it's safe, `deploy` sets up hosting — `ship-check` runs the **whole gauntlet at once** and gives you
one answer: **GO** (ready to launch) or **NOT-YET** (here's exactly what's left). It's the launch-day version
of `roast`: where `roast` pressure-tests an *idea* before you build, `ship-check` pressure-tests your *built
app* before you ship. It **changes nothing** — it's a readiness read, not a fix.

Say **"is my app ready to ship?"**, **"is it production-ready?"**, **"can I go live?"**, or **`/ship-check`**.

## What it checks

Eight readiness gates, in one verdict:

- **Built** — is there a real, buildable app (not the empty template)?
- **Real data** — does it save real data with sign-in, or is it still running on mock data?
- **Tested** — is there a test suite mapped to your success criteria?
- **Safe** — has it been audited (security / accessibility / performance), and is the audit clean?
- **Deployable** — is hosting + CI set up so you can actually put it live?
- **Real content** — is the copy real, or is there still placeholder / lorem-ipsum text?
- **Legal** — if it collects data, does it have a privacy policy / terms / cookie consent?
- **Your goals** — does it meet the success outcomes from your charter?

Each gap gets a severity (**critical / major / minor / info**), why it blocks (or doesn't), and **the exact
skill that closes it** — e.g. "no test suite → run `test-app`", "still on mock data → run `build-backend`".
Anything **major or worse** blocks a GO; smaller gaps are listed as advisories. It's all written to
`outputs/ship-check/<date>-<slug>/SHIP-CHECK.md`, with the single most important next step called out.

## Offline first; deeper checks are offered

The verdict is reasoned by reading your app and what the earlier steps left behind — it works fully offline,
no setup. To *confirm* the green-light items for real, it hands you the exact commands (it never runs them for
you):

- `cd app && npm install && npm test` — actually run the test suite to confirm it's green.
- `npm audit` — the live vulnerability database for your dependencies.
- `npm run build` + Lighthouse — real performance/accessibility scores in a browser.

If you say yes, it'll run the test suite for you; the browser-based checks stay yours to run.

## What it is (and isn't)

- **Is:** one honest go/no-go read that ties together everything the earlier steps proved, and a prioritized
  list of what's left before launch.
- **Isn't:** a live smoke test of the running app. It says plainly what only the offered runs can confirm
  (like whether the tests actually pass).
- **Propose-only:** it never changes your app, fixes a gap, or runs the other skills for you — you decide what
  to act on next.
- **Not automatic:** deciding to ship is yours, so `ship-check` is on-demand only — never in the maintenance
  loop, and deliberately not part of `autopilot`.
- **Web app (`app/`) first;** phone/extension readiness comes later.

## Safety

It writes only a report (never touches your app's code), reasons fully offline, and never runs the other
skills, installs anything, or enters a key without your say-so. Ship-check is the fifth rung of the **path to
production** (`docs/PATH-TO-PRODUCTION.md`) — the go/no-go gate before the final polish.
