# Code review (optional, cross-model)

The foundation ships an optional `codex-review` skill that wraps the
[Codex CLI](https://github.com/openai/codex) to get an OpenAI model's eye on your
diffs — on demand, automatically during the weekly loop, or as a project git hook.
If you haven't installed the CLI, nothing changes: every other skill works exactly as
before, and the step simply logs `skipped (unavailable)` and moves on.

---

## What it is

`codex-review` is a **propose-only** cross-model reviewer. It calls the `codex` CLI to
analyse the current diff, writes a RAG-ready report to `outputs/code-reviews/`, and (only
when running unattended and a critical issue is found) files a single advisory item in
the NEEDS SIGN-OFF queue. It never edits code, never applies fixes, and never blocks.

Think of it as a second opinion from a different model, delivered as a file you can read
whenever you're ready.

---

## Enable it

Two steps — then it lights up everywhere automatically.

1. **Install the Codex CLI.**
   Follow the installation steps at <https://github.com/openai/codex> (typically
   `npm install -g @openai/codex` or a platform binary).

2. **Authenticate.** Either:
   - Run `codex login` and follow the prompts, **or**
   - Set `OPENAI_API_KEY` in your shell / `aios/.env`.

   > This is the same key slot the Tier 3 (API embeddings) option uses, so if you're
   > already on Tier 3 you're already authenticated.

Once the CLI is present and authenticated, the `codex-review` skill and the
`maintenance-loop` step light up automatically — no other configuration is needed.

To tune behaviour, edit `.claude/skills/codex-review/config.json`:

| Key | Default | What it does |
|---|---|---|
| `enabled` | `true` | Set to `false` to disable entirely. |
| `default_base` | `"main"` | Branch used as the base for on-demand reviews. |
| `caution_severity` | `"CRITICAL"` | Minimum severity that files a NEEDS SIGN-OFF item in the loop. |
| `loop_scope` | `"uncommitted"` | Scope used when the loop calls it. |
| `model` | `""` | Pass a model name to `codex review`; empty = codex CLI default. |

---

## On-demand review

Ask Claude: *"review my changes"* (or *"run codex-review"*). The skill:

1. Checks that the Codex CLI is available and authenticated.
2. Runs `codex review --base main` (or whatever `default_base` is set to).
3. Writes the findings report to `outputs/code-reviews/<date>-<scope>.md`.
4. Summarizes findings — severity counts, max severity, report path.

No item is added to the review queue on an on-demand run — that is only for the loop.

---

## Autonomous loop

When `codex-review` is enabled and the Codex CLI is available, `maintenance-loop` runs it
**after** `improve-system` on each tick:

- It reviews `improve-system`'s uncommitted changes (`--uncommitted` scope).
- It writes a report to `outputs/code-reviews/`.
- If the maximum finding severity is at or above `caution_severity` (default `CRITICAL`),
  it appends **exactly one** NEEDS SIGN-OFF item to this tick's `review-*.md`:

      - [ ] `rv-YYYYMMDD-NNN` — codex-review flagged CRITICAL issues — review before relying on them  ·  target: <files>  ·  detail: see outputs/code-reviews/<report>

  This is **advisory**: it flags something worth reading, but it never un-applies what
  `improve-system` did and never blocks the tick from completing. `improve-system` remains
  the sole applier.

- If the CLI is unavailable, the step logs `skipped (unavailable)` and the tick proceeds.

---

## Project hook (optional)

The `.githooks/` directory ships a sample pre-commit hook that calls `codex-review`.
Activate it with:

```sh
git config core.hooksPath .githooks
```

Behaviour:

- **Advisory by default** — the hook prints findings and exits 0 (never blocks a commit).
- **Strict mode** — set `CODEX_REVIEW_STRICT=1` in your environment to exit non-zero on a
  CRITICAL finding, which blocks the commit.
- **Bypass** — pass `git commit --no-verify` to skip the hook entirely (standard git).

The hook handles all git plumbing itself; the `codex-review` skill does not touch hooks.

---

## Severity model

All findings are normalized to four levels, highest to lowest:

| Level | Meaning | Example Codex label |
|---|---|---|
| **CRITICAL** | Must fix before relying on this change | `[P0]`, `[P1]`, top tier |
| **MAJOR** | Significant issue worth addressing soon | `[P2]`, `[P3]`, mid tier |
| **MINOR** | Small concern or best-practice note | `[P4]`, low tier |
| **INFO** | Informational / style note | Informational |

The `caution_severity` config key (default `CRITICAL`) is the threshold the maintenance
loop uses to decide whether to file a NEEDS SIGN-OFF item. Only findings at or above that
level trigger the advisory item.

---

## Privacy note

`codex review` sends the reviewed diff to OpenAI using your authorized API key. This is
an **explicit opt-in** — the skill only runs if you have installed and authenticated the
Codex CLI. Clones that have not set up the CLI are completely unaffected: no data leaves
your machine, and nothing errors. If you want to review a diff locally without sending
data to OpenAI, simply don't install the CLI.
