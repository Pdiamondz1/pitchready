---
name: musk-algorithm
description: Use when someone wants to pressure-test a spec, feature, process, system, or the app for over-engineering / bloat — "apply the algorithm", "run the Musk algorithm", "delete-first review", "question the requirements", "make this less dumb", "simplify this / cut the fat", or /musk-algorithm. Walks Musk's 5-step algorithm IN ORDER (question requirements → delete → simplify → accelerate → automate) and returns concrete cuts + a report. Propose-only: it recommends deletions, it never applies them.
---

# musk-algorithm

The anti-bloat discipline. Where `roast` tests whether an **idea** is worth building, the algorithm
tests whether a **build / spec / process** is as *lean* as it should be. It is Elon Musk's 5-step
engineering algorithm, applied faithfully — and the **order is the whole point.**

Claude's default is to add. This skill's default is to **delete**.

## When to use

When someone says "apply the algorithm", "run the Musk algorithm", "question the requirements",
"delete-first review", "cut the fat", "why is this so complex", "make it less dumb", or
`/musk-algorithm`. Point it at a **target**: a spec/plan doc, a feature, a process/pipeline, a
file or folder, a dependency list, or the whole app. On-demand only; it changes nothing.

## The 5 steps — walk them IN ORDER

The order is sacred. The most common failure — even for smart engineers — is jumping to step 3/4/5
(optimize, accelerate, automate) on something that should have been **deleted** in step 2.

1. **Question every requirement.** Every requirement must carry a **name** — a specific person who
   owns it, never a department ("Legal says…", "best practice says…" ≠ a requirement). Requirements
   from *smart, experienced* people are the **most dangerous**, because they get questioned least.
   Make each one earn its place; kill the dumb ones.
2. **Delete the part / step / feature.** Bias hard to remove. Musk's rule: **"if you're not adding
   things back at least 10% of the time, you didn't delete enough."** Over-delete on purpose — adding
   back later is cheap; carrying dead weight forever is not.
3. **Simplify & optimize** — but *only what survived steps 1–2.* "The most common error of a smart
   engineer is to optimize a thing that should not exist." Simplify the remainder; don't polish
   corpses.
4. **Accelerate cycle time.** Speed up the loop — but never accelerate a process you haven't first
   questioned, deleted, and simplified (you'd just get to the wrong place faster).
5. **Automate — LAST.** Musk's own confessed mistake was automating before deleting/simplifying.
   Only automate what is now stable, necessary, and repetitive.

## Procedure

### Phase 0 — Get the target
If the invocation names a target (a file, feature, process, or "the app / the pipeline / the
dependencies"), use it. Otherwise ask, in one line, what to run the algorithm on. Read it (the
spec, the code, the process description, the `package.json`, the charter — whatever the target is).

### Phase 1 — Walk the five steps (reasoning-first, offline)
For each step, produce **concrete, specific findings** tied to the target — not platitudes:

1. **Requirements:** list every requirement / assumption the target rests on. For each: *who* owns
   it (a name, or "unowned")? Is it real, or inherited/cargo-culted? Flag the ones to **kill** and
   the ones that are actually load-bearing.
2. **Delete:** the sharpest section. List every part / step / feature / file / dependency you could
   **remove entirely**, ranked by leverage. Aim to over-cut. Name the single highest-leverage
   deletion. (If you can't find anything to delete, you didn't look hard enough — say so.)
3. **Simplify:** for what *survives* deletion, the concrete simplifications (merge, inline, replace
   with something dumber-but-sufficient).
4. **Accelerate:** the slowest parts of the build/feedback loop and how to shorten them.
5. **Automate:** what's now stable + repetitive enough to be worth automating (and explicitly, what
   is **not yet** — don't automate the deletable).

Keep the emphasis where Musk puts it: **steps 1–2 do most of the work.** A run that mostly
"simplifies and optimizes" without questioning or deleting has missed the point — call that out.

### Phase 2 — Verdict & report
Write **`outputs/algorithm/<YYYY-MM-DD>-<slug>/ALGORITHM.md`** (RAG frontmatter: `title`,
`source_id`, `path`, `tags: [algorithm, review]`, `updated`), then:
- a one-line **headline** (the biggest cut),
- the five steps each with its concrete findings (deletions ranked),
- **The single highest-leverage deletion** (the one thing to remove first),
- a short **"add-back watch"** — if nothing here would ever need adding back, you didn't cut deep enough.

Append one line to `outputs/change-log.md` (newest first):
`- <YYYY-MM-DD> — musk-algorithm — ran the algorithm on <target> → outputs/algorithm/<date>-<slug>/ALGORITHM.md — auto`

### Phase 3 — Hand over (propose-only)
State the verdict plainly: the biggest cut, the ranked deletions, and the one thing to delete first.
**Never apply the cuts** — deleting is a human decision (and you want the 10% add-back safety). Offer
to action a specific deletion if the user picks one.

## Rules & guardrails
- **Propose-only.** Writes only to `outputs/algorithm/` + one `change-log.md` line. It recommends
  cuts; it never deletes code, files, or requirements itself.
- **Order is non-negotiable.** Never present optimize/accelerate/automate before question/delete.
- **Delete is the point.** If a run surfaces no real deletions, that's a finding to challenge, not a pass.
- **Offline, no keys.** Reasons from the target; needs no tools beyond reading it.
- **On-demand only** — not in the unattended `maintenance-loop`, not in `autopilot`.
