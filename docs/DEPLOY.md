# deploy — put your app live (and watch it)

`build-app` builds your app, `build-backend` makes its data real, `test-app` proves it works, `audit-app`
checks it's safe — `deploy` gets it **ready to go live on the internet**, and sets up the watching
(error tracking + analytics) so you can see how it's doing.

Say **"deploy my app"**, **"ship it"**, **"put it live"**, **"set up hosting"**, or **`/deploy`**.

## The one rule: you pull the trigger

Deploying and publishing are **yours alone**. This skill **never deploys, publishes, enters a key, or
creates an account.** It scaffolds everything offline, then hands you a short checklist for the one step
that's yours — connect the repo and hit deploy. (Same boundary as the backend go-live.)

## What it sets up (offline, no keys)

- **Hosting config** for Vercel (a free, first-class host for Vite apps): the right build settings + a rule
  so your app's page routing works.
- **A CI check** (GitHub Actions): every push builds your app and runs your tests, so a broken build is
  caught. (Vercel does the actual deploying.)
- **An env template** (`app/.env.production`) with the empty slots to fill in Vercel.
- **Error tracking + analytics**, wired but **inert until you add keys** — so nothing breaks before you're
  ready, and it just turns on when you are.

## Going live (your ~10-minute step)

When it's done it hands you `outputs/deploy/<date>-<slug>/GO-LIVE.md`:

1. Create a free Vercel account, install its GitHub app.
2. Import this repo in Vercel; set the root directory to `app/`.
3. Paste your env values in Vercel (they stay there — never in chat or git).
4. Deploy — Vercel gives you a live URL; every push auto-deploys, every PR gets a preview.
5. Verify, then optionally add a custom domain + turn on analytics.

## Closing the loop: `sync-metrics`

Once you're live with analytics, **`sync-metrics`** (a companion skill) pulls your real usage numbers into
`raw/metrics/` on a schedule — which is exactly what the **project advisor** (`advise-project`) reads to
suggest what to improve, scale, or fix next. Set your analytics provider in
`.claude/skills/sync-metrics/config.json` and it feeds the advisor automatically; until then it skips
quietly. See `docs/METRICS-FEED.md`.

## What it is (and isn't)

- **Is:** everything you need to go live, scaffolded — you do the ~10-minute connect-and-deploy step.
- **Isn't:** an automatic deploy. It never ships for you (that's deliberate — shipping is your call), and
  it's the only rung deliberately left out of the hands-off `autopilot` run.
- **Web app (`app/`) first;** phone (app stores) and extension (web store) publishing come later.

## Safety

Keys live only in Vercel (and `app/.env.production`, which is gitignored) — never in chat, never committed.
The scaffold is attended (it asks once) and **never runs in the unattended maintenance loop or autopilot.**
Deploying is the fourth rung of the **path to production** (`docs/PATH-TO-PRODUCTION.md`).
