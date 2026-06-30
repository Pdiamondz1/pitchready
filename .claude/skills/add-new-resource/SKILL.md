---
name: add-new-resource
description: Use when adding a new asset or file into the knowledge base. Copies the original, unaltered, into the correct raw/ folder, then creates or updates the wiki/ pages that should reference it. Never edits or reorganizes anything already in raw/.
---

# add-new-resource

Utility skill that ingests one asset into the knowledge base while honoring the
three-folder rules in `CLAUDE.md` (`raw/` is immutable; `wiki/` is AI-written; `outputs/`
is generated).

## When to use

When the user hands you a file, a snippet, a link, or any asset they want captured into
the second brain.

## Inputs (interview first; zero-argument safe)

If anything is unclear, ask before writing. Establish:

1. **The asset** — path to the file, pasted content, or a URL.
2. **Where it belongs in `raw/`** — pick the best subfolder:
   - `raw/inputs/processed/` — a summary of a Claude Code session
   - `raw/ecosystem/` — a personal/work file, email, transcript, or connected-source export
   - `raw/curated/` — content from a tracked creator/publication
   - `raw/` (root) — a top-level personal asset (e.g. `life-story.md`)
   If none fit, propose a new subfolder and confirm.
3. **What it's about** — a title and a few topic tags (for the wiki frontmatter).

## Procedure

1. **Land the original in `raw/`, unaltered.** Copy the asset into the chosen subfolder
   with a clear, dated filename (e.g. `raw/curated/2026-06-29-<slug>.md`). Do not reformat,
   summarize, or trim it. If the source is a URL, save the fetched content verbatim and
   record the URL in the wiki entry — not by editing the raw file. **Never touch files
   already in `raw/`.**
2. **Index it in `wiki/`.** Create or update the wiki page(s) that should reference this
   asset. This routine indexing is normal AI wiki maintenance and writes to `wiki/`
   directly (no sign-off needed). Each wiki page:
   - starts with the frontmatter schema from `CLAUDE.md`
     (`title`, `source_id`, `path`, `tags`, `updated`);
   - gives a short distilled summary (a few sentences), not a copy of the raw content;
   - links to the `raw/` file by relative path;
   - is cross-linked from `wiki/index.md` (add it under "By area" and "Recent additions").
   Prefer updating an existing topical page over creating a near-duplicate.
3. **Escalate only structural change.** If indexing this asset would require a *structural*
   wiki rewrite (reorganizing, merging/renaming many pages, or changing conventions), don't
   do it inline — write the proposal to `wiki/_candidates/` for sign-off instead.
4. **Log it.** Append one attributed line to `outputs/change-log.md`:
   `- <date> — add-new-resource — added <raw path>, indexed in <wiki path> — auto`.

## Output

End with a short summary: what was added to `raw/`, which `wiki/` entries were
created/updated, and anything parked in `wiki/_candidates/` for review.
