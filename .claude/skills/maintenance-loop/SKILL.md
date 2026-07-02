---
name: maintenance-loop
description: The autonomous maintenance tick a scheduler fires. Runs data-ingestion (gather new knowledge), then improve-system (one self-improvement pass), then an optional codex-review step (cross-model code review, graceful-off if CLI unavailable), then advise-project (propose-only idea engine), unattended, and appends a unified run log. Safe to run with no human present — it never applies anything beyond improve-system's own AUTO-APPROVE bucket, and advise-project only files proposals, never applies changes.
---

# maintenance-loop

The heartbeat of the self-improving system. One tick = ingest everything new, then run one
self-improvement pass, then log the result. It is the single entry point a schedule should
fire (see `docs/SCHEDULING.md`); everything it does already honors `CLAUDE.md`'s approval
gates, so it is safe to run unattended.

## When to use

On a schedule (recommended: weekly, via a Claude Code Routine), or on demand when you want
a full ingest-then-improve pass in one step.

## State

- **Run log:** `outputs/runs/maintenance-loop.md` — append-only, newest first. One block per
  tick: timestamp, `data-ingestion` per-skill totals, `improve-system` bucket counts
  (auto-applied / needs sign-off / more context), `codex-review` line (availability,
  max severity, per-severity counts, report path, and whether a caution item was appended),
  `advise-project` advisor counts (ideas proposed / promoted / alerted), and any errors.

## Procedure

Run unattended — **do not ask the user questions.** If a step needs configuration that is
missing, skip it and log "skipped (unconfigured)" rather than blocking on an interview.

1. **Ingest.** Run `data-ingestion` (it runs `sync-claude-sessions`, `sync-ecosystem-data`,
   `sync-curated-content`, `sync-metrics` back-to-back, each incremental via its own cursor). Sources without
   a `config.json` entry are skipped and logged, not interviewed.
2. **Improve.** Run `improve-system`. Its existing three-bucket logic does the safe thing on
   its own: it applies previously human-approved (`- [x]`) items and the low-risk
   AUTO-APPROVE bucket, and only *queues* NEEDS SIGN-OFF and MORE CONTEXT items for a human.
   Nothing structural or skill-related is applied without a checked box — that guarantee
   holds here exactly as in a manual run.
3. **Code review (optional).** If `codex-review` is enabled and the `codex` CLI is
   available, run it on `improve-system`'s `--uncommitted` changes. It writes a findings
   report to `outputs/code-reviews/`; on a CRITICAL finding it appends ONE NEEDS SIGN-OFF
   item to `review-*.md` (advisory — it never un-applies or blocks). If `codex` is
   unavailable, it logs `skipped (unavailable)` and the tick proceeds. `improve-system` is
   unchanged by this step.
4. **Advise.** Run `advise-project` unattended — it reads the KB, the ingested activity, the
   `raw/metrics/` feed, and its own prior reasoning, then files ranked project ideas to
   `outputs/ideas-*.md`, promotes any approved ideas, ages out stale ones, and alerts on
   high-weight ideas. It is propose-only and safe unattended: it never applies a change and
   never writes `change-log.md`.
5. **Log the tick.** Prepend a block to `outputs/runs/maintenance-loop.md` with the ingest
   totals, the improve-system bucket counts, the codex-review line (availability, max
   severity, report path, and codex caution item if one was appended), the advisor counts
   (ideas proposed / promoted / alerted), and any errors. (The per-change `change-log.md`
   lines are written by the sub-skills; this is the tick-level record.)
6. **Flag the human if needed.** If this tick created new NEEDS SIGN-OFF or MORE CONTEXT
   items (including any codex caution item appended in step 3), note the count in the log
   block. If `human-improve-system` is configured to notify (e.g. Slack), hand off to it
   so the human learns items are waiting.

## Output

A short summary: items ingested per source, improve-system's per-bucket counts, what was
auto-applied, codex-review availability and max severity (or `skipped` if CLI is
unavailable) and the report path when run, advisor counts (ideas proposed / promoted /
alerted), how many items now await a human, and the path to the run-log block written.
