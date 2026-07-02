---
name: sync-metrics
description: Use to feed the project advisor with real usage numbers. Pulls the latest metrics from your configured analytics provider and writes a dated snapshot to raw/metrics/<date>-dau.json in the shape advise-project reads (dau/wau/mau, retention, signups, errors, feature usage). Graceful-off — with no provider/keys configured it skips and logs, so it's safe to schedule. One snapshot per day (idempotent). Reads keys from env only — never entered in chat. Incremental via run-state. Rides data-ingestion / maintenance-loop like the other sync skills. Zero-argument safe.
---

# sync-metrics

The metrics connector — the missing producer for the advisor's feed. `advise-project` already reads
`raw/metrics/*.json` (comparing the two most recent snapshots for trend direction), but until now nothing
wrote them (`docs/METRICS-FEED.md`: *"you own the wiring"*). This skill closes that loop: it pulls your live
usage numbers from a configured analytics provider and drops a dated snapshot into `raw/metrics/` in the
exact shape the advisor consumes.

## When to use

On demand, or automatically as part of `data-ingestion` / `maintenance-loop`. Run it manually with zero
arguments first to test. **It only does something once you have a live app + analytics configured** — until
then it skips gracefully.

## State

- **Config:** `.claude/skills/sync-metrics/config.json`:
  - `provider` (default `""`) — the analytics source (`"vercel"` / `"plausible"` / `"ga4"` / …); **empty ⇒
    the skill skips** (nothing to pull).
  - `metrics` (default the standard key list) — which metric keys to pull/emit.
  - `lookback` (default `"1d"`) — the window each snapshot covers.
- **Run-state:** `outputs/runs/sync-metrics.json` — `{ last_run, last_captured_at }`.
- **Credentials:** the analytics API key is read from the **environment only** (the env var the provider
  documents). This skill **never asks for, stores, or echoes a key.**

## Procedure

1. **No provider / no keys → skip.** If `config.provider` is empty or the provider's env credential is
   absent, **log "skipped (unconfigured)" and exit cleanly** — never block, never interview (same discipline
   as the other sync skills' unattended mode).
2. **One snapshot per day (idempotent).** If `raw/metrics/<today>-dau.json` already exists (checked via
   run-state + the file), **skip + log** — the advisor wants one snapshot per day for its trend delta. A
   deliberate re-pull writes a disambiguating `<today>-dau-2.json`; **never overwrite** an existing snapshot
   (`raw/` is append-only).
3. **Pull the latest metrics.** From the configured provider, over `lookback`, fetch the `metrics` keys.
4. **Write the snapshot → `raw/metrics/<YYYY-MM-DD>-dau.json`** in the `docs/METRICS-FEED.md` schema:
   `{ "captured_at": "<ISO8601>", "metrics": { "dau": …, "wau": …, "mau": …, "d1_retention": …, "d7_retention": …, "signups": …, "errors": …, "feature_usage": { … } }, "notes": "sync-metrics — <provider>" }`.
   All fields optional — emit whatever the provider returns; unknown keys pass through to the advisor.
5. **Record state + log.** Set `last_run` / `last_captured_at`, and append one line to
   `outputs/change-log.md`:
   `- <date> — sync-metrics — wrote metrics snapshot raw/metrics/<date>-dau.json — auto`
   (an `auto` ingestion line, exactly like the other three sync skills).

## Unattended invocation

When fired by `data-ingestion` / `maintenance-loop` (no human present), never interview. If `provider` is
empty or the credential is missing, **skip + log "skipped (unconfigured)"**; otherwise write today's
snapshot (or skip if it already exists). Never block on a question. Because it runs in the tick **before**
`advise-project`, a fresh snapshot is in `raw/metrics/` by the time the advisor reads it — closing the loop.

## Output

A short summary: whether it ran or skipped (and why), the provider, the snapshot path written (or the
existing one it left in place), and the new `last_captured_at`.
