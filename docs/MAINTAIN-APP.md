# maintain-app — keep your shipped app healthy

`build-app` builds it, `deploy` ships it, `ship-check` gives the go/no-go, `polish` makes it legitimate —
`maintain-app` **keeps it healthy after launch**. On a schedule it checks your app and writes you **one
plain-language health report**: is it still safe, still working, and what's the single next thing to do.

Say **"keep my app healthy"**, **"maintain my app"**, **"set up scheduled maintenance"**, or **`/maintain-app`**.

## The one rule: it reports and proposes — you decide

`maintain-app` **never merges, never deploys, never publishes, and never enters a key.** Everything it does is
a proposal you can accept: a report to read, and — for a few genuinely safe, mechanical fixes — a pull request
you can merge if you like. A built-in guard blocks it during a run, and **GitHub branch protection on your default branch is the authoritative
backstop** (the go-live checklist sets it up) — a human always pulls that trigger. (Same boundary as `deploy` and the backend go-live.)

## What a weekly check does (report-first)

1. **Re-runs your quality signals** — a security/accessibility/performance audit, your test suite, and (opt-in)
   a cross-model code review.
2. **Delegates dependency updates to Dependabot** — with a **7-day cooldown** so a brand-new (possibly
   compromised) release is never pulled in a hurry. New security updates are **explained in your report** for
   you to decide on — never auto-applied.
3. **Opens a "safe" pull request only for small, reversible fixes** (formatting, a mechanical accessibility
   fix, dead code, doc drift) — and only if your tests stay green. Each one honestly lists **what it did NOT
   check**. It never touches your app's real logic, and it caps how many it opens.
4. **Writes you one report** with a plain verdict, the REVIEW items, any safe PRs, and — most importantly —
   **the single next thing to do**. If nothing changed, it stays quiet (no noise).

## Where it runs

- **On your machine (the sandbox)** — a weekly Claude Code Routine, offline, no keys. Good for trying it. It
  stages fixes as branches and writes the report; a shipped app shouldn't depend on your laptop being awake.
- **In the cloud (the real home)** — a GitHub Actions workflow that runs whether or not your machine is on,
  and opens the PRs. It's **scaffolded but off** until you add one secret (`ANTHROPIC_API_KEY`) — that one
  keyed step is yours.

It runs on **its own schedule**, separate from the knowledge-base upkeep (`maintenance-loop`), and it is
**deliberately not part of the hands-off `autopilot` run** — maintaining a live app is an ongoing operation,
not a one-shot build step.

## Before you rely on it: the 48-hour test

The honest way to know this is worth turning on: **hand-run one check** on a real shipped app, then show two
people the result — the health report and one safe PR (with its "what I did NOT verify" note):

- a **non-technical** person: do they understand the report and know the next action?
- a **developer**: would they let this run in their CI?

If both are yes, turn it on. If the report just becomes another notification nobody reads, tune it (fewer,
higher-signal items) before trusting it. (This guards the one real risk: a stream of green PRs that trains you
to rubber-stamp — the report, not the PRs, is the point.)

## What it is (and isn't)

- **Is:** an ongoing health report + a few genuinely safe, opt-in fixes, on a schedule — with the irreversible
  step always yours.
- **Isn't:** an auto-patcher. It **delegates** dependency patching to Dependabot and never auto-bumps or
  auto-merges anything; "the tests pass" is never treated as "safe to ship."
- **Web app (`app/`) first;** phone/extension maintenance comes later.

## Safety

Keys live only where you put them (never in chat, never committed). A guard hook blocks the loop from
merging, deploying, publishing, or writing keys during a tick — **defense-in-depth**; **GitHub branch
protection on your default branch is the authoritative gate** (the go-live checklist sets it up). It runs
**its own schedule — never in the unattended `maintenance-loop`, never in `autopilot`.** Maintaining is the seventh rung of the **path to production**
(`docs/PATH-TO-PRODUCTION.md`). Vetted 2026-07-03 (`roast` RESHAPE + a citation-verified `storm-research` —
`outputs/vetting/2026-07-03-maintain-app/`).
