# Metrics feed

Drop a dated JSON snapshot into `raw/metrics/` to feed the project advisor. That's it —
no connector ships with the foundation; anything that can write a file can produce the feed.

## How to add a snapshot

Name the file by date, e.g. `raw/metrics/2026-06-29-dau.json`, and place it beside this
example. Because `raw/` is **append-only**, each snapshot is a **new file** — you never
overwrite the previous one. That append-only discipline is what lets `advise-project`
compute trend deltas: it compares the two most-recent snapshots and surfaces directional
signals (up, down, flat) without you doing any math.

## Who / what can write a snapshot

The feed is deliberately vendor-neutral. Any of these works:

- The app itself (write on cron or on shutdown)
- A cron job / scheduled script
- A webhook handler
- A Zapier, Make, or n8n step that writes a file
- A manual paste from your analytics dashboard

No connector is bundled; you own the wiring.

## What files are ignored

`advise-project` skips:

- Files whose name starts with `EXAMPLE` (like the sample below)
- Dotfiles (e.g. `.gitkeep`)

## Schema

All fields are optional — partial data degrades gracefully. The advisor uses whatever
keys are present and skips the rest.

```json
{
  "captured_at": "2026-06-29T00:00:00Z",
  "metrics": {
    "dau": 100,
    "wau": 420,
    "mau": 1200,
    "d1_retention": 0.22,
    "d7_retention": 0.09,
    "signups": 35,
    "errors": 12,
    "feature_usage": { "search": 540, "upload": 88 }
  },
  "notes": "Example only. Files named EXAMPLE* are ignored by advise-project. Drop real dated snapshots like 2026-06-29-dau.json beside this one."
}
```

| Field | Type | Meaning |
|---|---|---|
| `captured_at` | ISO 8601 string | When the snapshot was taken |
| `metrics.dau` | number | Daily active users |
| `metrics.wau` | number | Weekly active users |
| `metrics.mau` | number | Monthly active users |
| `metrics.d1_retention` | 0–1 float | Day-1 retention rate |
| `metrics.d7_retention` | 0–1 float | Day-7 retention rate |
| `metrics.signups` | number | New signups in the period |
| `metrics.errors` | number | Error count in the period |
| `metrics.feature_usage` | object | Arbitrary feature-name → count pairs |
| `notes` | string | Free-form note; logged but not analyzed |

Add any extra keys under `metrics` — unknown keys are passed through to the advisor prompt
as-is, so custom signals (revenue, tickets, deploy count, …) work without any schema change.
