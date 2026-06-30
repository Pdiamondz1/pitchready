# Idea Vetting (`roast` + `storm-research`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed two supplied skill packages — `roast` (a 5-persona council + GO/RESHAPE/KILL Judge) and `storm-research` (a citation-verified, multi-perspective HTML briefing) — as a vet-before-you-build gate, with artifacts saved to `outputs/vetting/` and indexed in `wiki/vetting.md`.

**Architecture:** Two new attended, interview-first Claude Code skills under `.claude/skills/`, embedded faithfully from the source packages with a small set of documented template-fit adaptations (persist to the KB; `roast` orchestrates `storm-research`; `storm-research` refuses rather than fabricates when web is unavailable). Light wiring into `define-project`, `what-can-i-do`, `advise-project`, `CLAUDE.md`, and the docs. No code, no tests harness — these are skill/markdown deliverables.

**Tech Stack:** Markdown skill files (YAML frontmatter), one static HTML template (copied verbatim), Git. No build step, no runtime dependencies, no API keys.

---

## Testing note (read first)

These deliverables are skill instructions and docs, not code, so there is **no unit-test harness**. Each task therefore uses a **Definition of Done = a concrete verification command** (file exists, required string present via `grep`, line count via `wc -l`, byte-identical copy via `git diff --no-index`). The pattern per task is: state the DoD command up front → make the change → run the command and confirm it passes → commit. This is the honest TDD-equivalent for authoring work: define the observable check first, then satisfy it.

## Hard guardrails (apply to EVERY task)

- **Do NOT run `roast` or `storm-research` for real** against this repo. We are *authoring* the skills, not exercising them.
- **Do NOT create** a real `wiki/vetting.md`, any `outputs/vetting/<date>-<slug>/` run folder, or any verdict/briefing. The ONLY thing that ships under `outputs/vetting/` is `.gitkeep`.
- **Do NOT append to `outputs/change-log.md`** during the build — the change-log lines described in the skills are written by the skills *at runtime*, not by us now.
- **Do NOT touch `raw/`** (immutable) or `.claude/skills/improve-system/` (it stays the single applier for the self-improvement lanes).
- Work on branch **`phase-10-idea-vetting`** (already created and checked out). Commit after each task.
- The repo is on Windows; the Bash tool runs Git Bash. Use forward slashes and `cp`/`grep`/`wc`/`diff` in the Bash tool. Keep `CLAUDE.md` under **125 lines** (`wc -l`).

---

## File Structure

**Create:**
- `.claude/skills/roast/SKILL.md` — the council + Judge skill (source `roast-SKILL.md` + 3 adaptations).
- `.claude/skills/storm-research/SKILL.md` — the STORM pipeline skill (source `storm-research-SKILL.md` + 2 adaptations).
- `.claude/skills/storm-research/report-template.html` — the report template, copied **verbatim** from the source (renamed from `storm-research-report-template.html` to the name the SKILL.md reads).
- `outputs/vetting/.gitkeep` — makes the empty output dir tracked.
- `docs/IDEA-VETTING.md` — the detail-holder (council/lens design, storm pipeline, web requirement, where artifacts land, provenance/credit + the two video links).

**Modify:**
- `.claude/skills/define-project/SKILL.md` — optional roast offer at the draft-confirm gate + a `## Vetting` section in the charter template.
- `.claude/skills/what-can-i-do/SKILL.md` — one new menu item.
- `.claude/skills/advise-project/SKILL.md` — one additive, on-demand-only clause (never auto-runs in the tick).
- `CLAUDE.md` — two Skills bullets + an `outputs/vetting/` bullet; stay under 125 lines.
- `README.md` — one Phase 10 build-status line.
- `docs/USING-THIS-FOR-ANY-PROJECT.md` — a "vet the idea" step + an optional-capability line.
- `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md` — a short Phase 10 addendum pointer.

**Source packages (read-only, do not modify):**
- `C:\Users\dwill\Desktop\skill-packages\Roast-skill\roast-SKILL.md`
- `C:\Users\dwill\Desktop\skill-packages\Storm-research\storm-research-SKILL.md`
- `C:\Users\dwill\Desktop\skill-packages\Storm-research\storm-research-report-template.html`

---

### Task 1: Scaffold `outputs/vetting/`

**Files:**
- Create: `outputs/vetting/.gitkeep`

- [ ] **Step 1: Definition of done**

The dir is tracked with a single empty keep file and nothing else.
Run (expect the path to print, and `git status` to show it staged): `ls outputs/vetting/.gitkeep`

- [ ] **Step 2: Create the keep file**

Create an empty file at `outputs/vetting/.gitkeep` (no content).

- [ ] **Step 3: Verify**

Run: `test -f outputs/vetting/.gitkeep && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add outputs/vetting/.gitkeep
git commit -m "feat(vetting): scaffold outputs/vetting/ keep dir (Phase 10)"
```

---

### Task 2: The `storm-research` skill (template + SKILL.md)

Embed the source faithfully, then apply exactly two adaptations (KB output path; pre-flight web guard). The template is copied byte-for-byte and renamed.

**Files:**
- Create: `.claude/skills/storm-research/report-template.html`
- Create: `.claude/skills/storm-research/SKILL.md`

- [ ] **Step 1: Definition of done**

`report-template.html` is byte-identical to the source; `SKILL.md` keeps the 5 lenses + 4 phases + citation verification verbatim, reads `report-template.html`, writes to `outputs/vetting/...`, and has a pre-flight web guard. Checks (run after the steps below):
```bash
git diff --no-index "C:/Users/dwill/Desktop/skill-packages/Storm-research/storm-research-report-template.html" ".claude/skills/storm-research/report-template.html"   # expect: no output (identical)
grep -c "report-template.html" .claude/skills/storm-research/SKILL.md                 # expect: >= 2 (Portability + Phase 3)
grep -q "outputs/vetting" .claude/skills/storm-research/SKILL.md && echo OUT_OK       # expect: OUT_OK
grep -q "Pre-flight" .claude/skills/storm-research/SKILL.md && echo GUARD_OK          # expect: GUARD_OK
grep -q "storm-reports/" .claude/skills/storm-research/SKILL.md && echo STILL_HAS_OLD || echo REMAPPED   # expect: REMAPPED
```

- [ ] **Step 2: Copy the template verbatim (renamed)**

```bash
mkdir -p .claude/skills/storm-research
cp "C:/Users/dwill/Desktop/skill-packages/Storm-research/storm-research-report-template.html" ".claude/skills/storm-research/report-template.html"
```
Do **not** edit the copied HTML — keep its `<style>` block and all `{{TOKEN}}` placeholders exactly as-is.

- [ ] **Step 3: Copy the source SKILL.md as the starting point**

```bash
cp "C:/Users/dwill/Desktop/skill-packages/Storm-research/storm-research-SKILL.md" ".claude/skills/storm-research/SKILL.md"
```
Keep the frontmatter (`name: storm-research`, `description:`, `argument-hint:`), all five lens prompts, the contradiction map, Phase 3 (clone template / keep `<style>` verbatim), Phase 4 (self-review + parallel primary-source verification), and the Notes & guardrails **unchanged** except for the three edits below.

- [ ] **Step 4: Adaptation A — insert the pre-flight web guard**

Insert this section **immediately before** the line `## Phase 0: Scope the topic` (i.e., right after the `## Portability` section):

```markdown
## Pre-flight: web access required (run this first)

Before Phase 0, confirm you have the built-in web tools (`WebSearch` / `WebFetch`). This skill
verifies every claim against a primary source and **must not fabricate**. If web access is
unavailable, **STOP immediately** and tell the user:

> "storm-research needs web access to find and verify primary sources — unavailable now. Try
> again where web is enabled, or use `roast` for a brutal reasoning-only take."

Do not invent studies, numbers, or URLs to work around missing web access. No web → no report.
```

- [ ] **Step 5: Adaptation B — remap the output path in Phase 3**

In Phase 3, replace the write-target step. Change:
```
3. Write to `storm-reports/{topic-slug}-briefing.html` (relative to the current working directory; create the folder if needed).
```
to:
```
3. Write to `outputs/vetting/<YYYY-MM-DD>-{topic-slug}/{topic-slug}-briefing.html` (use today's date; create the dated folder if needed). If `roast` commissioned this briefing, write into the **same** `outputs/vetting/<YYYY-MM-DD>-{topic-slug}/` folder it already created. Same-day reruns suffix the folder `-2`, `-3`, …
```

- [ ] **Step 6: Adaptation B (cont.) — remap the Output section and add KB indexing**

Replace the entire `## Output` section with:
```markdown
## Output

1. Final deliverable: `outputs/vetting/<YYYY-MM-DD>-{topic-slug}/{topic-slug}-briefing.html` (the v2, post-verification version).
2. Best-effort open it for the user with the platform's default opener (macOS `open <path>`, Linux `xdg-open <path>`, Windows `start "" <path>` / PowerShell `Start-Process <path>`). Never block on it; if it fails or the OS is unclear, just give the path.
3. **Index it in the KB.** Update `wiki/vetting.md` (create it with the wiki RAG frontmatter if absent) with a row for this idea: idea · date · verdict (if it came from a roast, else `—`) · a link to this briefing. The first time you create `wiki/vetting.md`, cross-link it in `wiki/index.md` (pinned under "By area" + a "Recent additions" line). This is normal wiki maintenance — no sign-off.
4. **Log it.** Append one line to `outputs/change-log.md` (newest at top):
   `- <YYYY-MM-DD> — storm-research — wrote briefing outputs/vetting/<YYYY-MM-DD>-{topic-slug}/{topic-slug}-briefing.html — auto`
5. In chat, give: the file path, the verification tally (`N/N checked, X fabricated, Y corrected, Z demoted`), the one universal finding, the frontier question, and the claim safety summary (what is safe to assert vs avoid). Keep it tight.
```

- [ ] **Step 7: Run the DoD checks from Step 1**

Confirm all five checks pass (identical template; `report-template.html` referenced ≥ 2×; `outputs/vetting` present; `Pre-flight` present; `storm-reports/` REMAPPED/gone).

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/storm-research/
git commit -m "feat(storm-research): embed STORM briefing skill, output to outputs/vetting/, add web guard (Phase 10)"
```

---

### Task 3: The `roast` skill

Embed the source faithfully, then apply exactly three adaptations (persist verdict; orchestrate storm; graceful-off note).

**Files:**
- Create: `.claude/skills/roast/SKILL.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q "name: roast" .claude/skills/roast/SKILL.md && echo FM_OK                    # frontmatter kept
grep -q "GO / RESHAPE / KILL" .claude/skills/roast/SKILL.md && echo VERDICT_OK        # verdict template kept
grep -q "outputs/vetting" .claude/skills/roast/SKILL.md && echo PERSIST_OK            # adaptation 1
grep -q "storm-research" .claude/skills/roast/SKILL.md && echo ORCH_OK                # adaptation 2
grep -qi "reasoning-only\|web access" .claude/skills/roast/SKILL.md && echo OFF_OK    # adaptation 3
```
Expect: `FM_OK VERDICT_OK PERSIST_OK ORCH_OK OFF_OK`.

- [ ] **Step 2: Copy the source SKILL.md as the starting point**

```bash
mkdir -p .claude/skills/roast
cp "C:/Users/dwill/Desktop/skill-packages/Roast-skill/roast-SKILL.md" ".claude/skills/roast/SKILL.md"
```
Keep the frontmatter (`name: roast`, `description:`, `argument-hint: "[the idea to roast]"`), Step 1 (the brief), Step 2 (the five persona prompts verbatim, spun up in parallel in one message), Step 3 (the Judge + the exact verdict block + the one-line council scores), and the Rules **unchanged** except for the additions below.

- [ ] **Step 3: Adaptation 3 — graceful-off note (in Step 2)**

Immediately after the fifth persona prompt (**5. The Buyer …**) and before `## Step 3:`, insert:
```markdown
**Web-availability note.** The Researcher relies on web search. If web access is unavailable,
instruct the Researcher to reason from general knowledge instead and flag that its evidence is
unverified — the council still runs and the Judge still delivers a verdict (Tier 0, no web, no keys).
```

- [ ] **Step 4: Adaptation 1 + 2 — add Step 4 (persist) and Step 5 (orchestrate) before `## Rules`**

Insert these two sections **immediately before** the `## Rules` heading:
```markdown
## Step 4: Persist the verdict (save to the knowledge base)

After you deliver the verdict in chat, ALSO save it so the idea is vetted on the record.

1. Derive a kebab-case `<slug>` from the idea. The run folder is
   `outputs/vetting/<YYYY-MM-DD>-<slug>/` (today's date). If that folder already exists from an
   earlier run today, suffix it `-2`, `-3`, … Use the **real folder name** everywhere you
   reference it below (provenance rule).
2. Write `outputs/vetting/<YYYY-MM-DD>-<slug>/roast-verdict.md`:

   ```markdown
   ---
   title: Roast Verdict — <idea, short>
   source_id: outputs/vetting/<YYYY-MM-DD>-<slug>/roast-verdict.md
   path: outputs/vetting/<YYYY-MM-DD>-<slug>/roast-verdict.md
   tags: [vetting, roast, verdict]
   updated: <YYYY-MM-DD>
   ---

   # Roast Verdict — <idea, short>

   **The brief:** <the one-paragraph brief the council judged>

   <the full verdict block exactly as shown to the user — GO/RESHAPE/KILL, confidence, the call,
   why, biggest risk, biggest upside, money read, the cheapest 48-hour test, the RESHAPE pivot>

   **Council scores:** Contrarian X/10 · Expansionist X/10 · Logician X/10 · Researcher X/10 · Buyer X/10

   <if a storm-research briefing was produced, link it:>
   **Evidence briefing:** ./<slug>-briefing.html
   ```
3. Index it in `wiki/vetting.md` (create it with the wiki RAG frontmatter if absent): one row —
   idea · date · verdict · link to `roast-verdict.md` (and the briefing if present). The first time
   you create the page, cross-link it in `wiki/index.md` (pinned under "By area" + a "Recent
   additions" line). Normal wiki maintenance — no sign-off.
4. Append one line to `outputs/change-log.md` (newest at top):
   `- <YYYY-MM-DD> — roast — wrote roast verdict outputs/vetting/<YYYY-MM-DD>-<slug>/roast-verdict.md — auto`

## Step 5: Offer the deep, citation-verified briefing (optional)

A roast is a fast reasoning pass. For an evidence-backed second layer, offer to run
`storm-research` on the same idea:

> "Want the deep, citation-verified briefing backing this? It runs `storm-research` — five expert
> lenses with primary-source fact-checking — takes a few minutes and needs web access."

- **On yes, and web access is available:** run the `storm-research` skill on the idea, telling it to
  write into the **same** `outputs/vetting/<YYYY-MM-DD>-<slug>/` folder (`<slug>-briefing.html`).
  When it returns, fold its key findings and contradictions into the verdict: append a short **"What
  the briefing changed"** note to the chat verdict and to `roast-verdict.md`, adjusting
  GO/RESHAPE/KILL if the evidence warrants, and add the **Evidence briefing** link.
- **If web access is unavailable:** skip the offer with one line — "(Skipping the deep briefing — it
  needs web access, which isn't available right now.)" The verdict still stands.
```

- [ ] **Step 5: Run the DoD checks from Step 1**

Confirm `FM_OK VERDICT_OK PERSIST_OK ORCH_OK OFF_OK`.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/roast/
git commit -m "feat(roast): embed council+Judge skill, persist verdict to outputs/vetting/, orchestrate storm-research (Phase 10)"
```

---

### Task 4: `docs/IDEA-VETTING.md`

**Files:**
- Create: `docs/IDEA-VETTING.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q "youtu.be/iTY8Q449YNQ" docs/IDEA-VETTING.md && echo ROAST_VID
grep -q "youtu.be/Tj3018n5MVg" docs/IDEA-VETTING.md && echo STORM_VID
grep -q "outputs/vetting" docs/IDEA-VETTING.md && echo PATHS
grep -qi "refuses rather than fabricates\|never fabricate" docs/IDEA-VETTING.md && echo GUARD
```
Expect all four markers.

- [ ] **Step 2: Write the doc**

Write `docs/IDEA-VETTING.md` with exactly this content:
```markdown
# Idea Vetting — vet before you build

Two skills give a project's core idea a hard look *before* time goes into building it. They turn a
vague idea into (a) a brutal, decisive verdict and (b) — on request — a verified, multi-perspective
evidence briefing, both saved to the knowledge base.

## `roast` — the council + the Judge

`roast` convenes a **five-persona council** that attacks the idea from every angle in parallel, then
the running agent acts as the **Judge** and returns one decisive verdict.

- **The council (5 parallel agents):** the Contrarian (find the fatal flaw), the Expansionist (the
  10× upside), the Logician (first-principles, no web), the Researcher (real-world evidence, web), and
  the Buyer (role-plays the target customer). Each returns a stance, 3–5 sharp points, the one
  must-hear thing, and a 1–10 score.
- **The Judge (the running agent, not a 6th agent):** weighs the council, resolves the tension, folds
  in the economics, and returns **GO / RESHAPE / KILL** with confidence, the biggest risk and upside,
  a money read, and — the most important output — **the cheapest 48-hour test** to validate the
  riskiest assumption before building anything.

Triggers: "roast", "convene the council", "brutal/second opinion", "pressure/stress-test", "validate
this business idea", or `/roast <idea>`. Runs at **Tier 0** — no web, no keys (offline, the Researcher
reasons without sources and says so).

## `storm-research` — the verified briefing

`storm-research` runs Stanford's **STORM** method as a 4-phase pipeline:

1. **Five expert lenses** (Practitioner, Academic, Skeptic, Economist, Historian) research the topic
   in parallel, each citing real sources.
2. **Contradiction map** — where the lenses agree, where they clash, and the single question that
   would settle the biggest conflict.
3. **HTML synthesis** — a single self-contained briefing, cloned from `report-template.html` (the CSS
   is kept verbatim), with findings ranked by reliability.
4. **Adversarial peer review + primary-source verification** — it critiques its own draft, then spawns
   parallel agents that verify **every citation against its primary source** (CONFIRMED / PARTIALLY
   CONFIRMED / UNVERIFIED / FALSE), applies corrections, and fills a truthful verification banner.

**It requires the built-in web tools** (`WebSearch` / `WebFetch` — no API key). If web access is
unavailable it **refuses rather than fabricates**: no invented studies, numbers, or URLs, ever.

## How they work together

`roast` is the front door. After the verdict it offers to commission a `storm-research` briefing as
the evidence layer; on yes (and with web available) the briefing lands in the same run folder and the
Judge folds its findings into the verdict. `storm-research` also runs standalone for any topic.

## Where the artifacts land

Every run writes to a dated folder under `outputs/vetting/`:

```
outputs/vetting/<YYYY-MM-DD>-<slug>/
  roast-verdict.md        # the GO/RESHAPE/KILL verdict + council scores (if roasted)
  <slug>-briefing.html    # the verified STORM briefing (if storm ran)
```

`wiki/vetting.md` is the AI-written index of vetted ideas (idea · date · verdict · links), cross-linked
from `wiki/index.md`. Each run appends one attributed line to `outputs/change-log.md`. The template
ships only `outputs/vetting/.gitkeep`; real verdicts and briefings appear once you vet something.

## The "vet before you build" workflow

`define-project` offers a roast at its draft-confirm gate, so a charter can be pressure-tested before
it hardens; the charter records a one-line `## Vetting` pointer. You can also pressure-test any idea
on demand via `what-can-i-do` or by saying `/roast`.

## Provenance & credit

Both skills are embedded from packages shared by the community, kept faithful to their original design:

- **`roast`** — from the "make Claude Code a money-making partner" upgrades. Video:
  https://youtu.be/iTY8Q449YNQ
- **`storm-research`** — Stanford's STORM method as a self-contained Claude skill. Video:
  https://youtu.be/Tj3018n5MVg
```

- [ ] **Step 3: Run the DoD checks; Step 4: Commit**

```bash
git add docs/IDEA-VETTING.md
git commit -m "docs(idea-vetting): add IDEA-VETTING.md (council/STORM design, web requirement, provenance)"
```

---

### Task 5: Wire `define-project` (roast gate + charter `## Vetting`)

**Files:**
- Modify: `.claude/skills/define-project/SKILL.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q "brutal second opinion" .claude/skills/define-project/SKILL.md && echo GATE_OK
grep -q "## Vetting" .claude/skills/define-project/SKILL.md && echo CHARTER_OK
```
Expect: `GATE_OK CHARTER_OK`.

- [ ] **Step 2: Add the optional roast offer at the draft-confirm gate**

In the `#### Draft-confirm gate` subsection, **after** the line
`Only proceed to Phase 2 after the user confirms (or makes corrections — then show the updated draft and confirm again).`
and before the following `---`, insert:
```markdown

#### Optional: roast the idea before locking it in

Right after the user confirms the draft (and before Phase 2), offer one optional gut-check:

> "Before we lock this in, want a brutal second opinion on the core idea? It convenes a quick council
> that pressure-tests it and gives a GO / RESHAPE / KILL call. Totally optional — say skip and I'll
> write the charter as-is."

- **On yes:** run the `roast` skill on the project idea. When it returns, fill the charter's
  `## Vetting` section with the verdict + a link to the `outputs/vetting/<date>-<slug>/` folder. If the
  verdict is RESHAPE or KILL, surface it and ask whether they want to adjust the charter before writing it.
- **On skip/no:** proceed exactly as today; the charter's `## Vetting` line stays
  `Not yet vetted — run `roast` any time for a second opinion.`
```

- [ ] **Step 3: Add the `## Vetting` section to the charter template**

In the `## The charter (wiki/charter.md) shape` template, insert a `## Vetting` block **after** the
`## Open questions / assumptions` block and **before** the closing `---`/`*Source: …*` footer:
```markdown
## Vetting
<If roasted: the verdict — GO / RESHAPE / KILL — in one line, with a link to
`outputs/vetting/<date>-<slug>/`. Otherwise: "Not yet vetted — run `roast` for a second opinion.">

```

- [ ] **Step 4: Run the DoD checks; Step 5: Commit**

```bash
git add .claude/skills/define-project/SKILL.md
git commit -m "feat(define-project): offer roast at the draft-confirm gate + charter ## Vetting section (Phase 10)"
```

---

### Task 6: Wire `what-can-i-do` (menu item)

**Files:**
- Modify: `.claude/skills/what-can-i-do/SKILL.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q "Pressure-test an idea" .claude/skills/what-can-i-do/SKILL.md && echo MENU_OK
```
Expect: `MENU_OK`.

- [ ] **Step 2: Add the menu item**

In the default menu (step 1 of the Procedure), insert **immediately after** the
`- **Get clear on your project** … → runs `define-project`` line:
```markdown
   - **Pressure-test an idea** — get a brutal second opinion before you build → runs `roast`
```

- [ ] **Step 3: Run the DoD check; Step 4: Commit**

```bash
git add .claude/skills/what-can-i-do/SKILL.md
git commit -m "feat(what-can-i-do): add 'Pressure-test an idea' menu item (Phase 10)"
```

---

### Task 7: Wire `advise-project` (one on-demand-only clause)

**Files:**
- Modify: `.claude/skills/advise-project/SKILL.md`

- [ ] **Step 1: Definition of done**

The clause is additive, scoped to on-demand, and explicitly never auto-runs in the tick. The
propose-only safety invariants are unchanged.
```bash
grep -q "Never auto-run a roast" .claude/skills/advise-project/SKILL.md && echo CLAUSE_OK
grep -c "propose-only" .claude/skills/advise-project/SKILL.md   # expect: unchanged (still present, invariants intact)
```
Expect: `CLAUSE_OK`.

- [ ] **Step 2: Add the clause to the `project` lane bullet in §6 (Promote approved)**

Replace the `project` lane bullet:
```
- **`project` lane** → write a starting spec to `outputs/briefs/<id>.md` for the user + Claude
  to carry into brainstorming.
```
with:
```
- **`project` lane** → write a starting spec to `outputs/briefs/<id>.md` for the user + Claude
  to carry into brainstorming. *(On-demand only: the user may `roast` a high-weight project idea for a
  GO/RESHAPE/KILL gut-check before carrying it into brainstorming. Never auto-run a roast inside the
  unattended tick — advise-project stays propose-only and asks no one.)*
```

- [ ] **Step 3: Run the DoD checks; Step 4: Commit**

```bash
git add .claude/skills/advise-project/SKILL.md
git commit -m "feat(advise-project): note optional on-demand roast before promoting a project idea (Phase 10)"
```

---

### Task 8: Wire `CLAUDE.md` (two skill bullets + outputs bullet, stay < 125 lines)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q '`roast`' CLAUDE.md && grep -q '`storm-research`' CLAUDE.md && echo BULLETS_OK
grep -q 'outputs/vetting/' CLAUDE.md && echo OUTPUTS_OK
test "$(wc -l < CLAUDE.md)" -lt 125 && echo UNDER_CAP
```
Expect: `BULLETS_OK OUTPUTS_OK UNDER_CAP`.

- [ ] **Step 2: Add the two Skills bullets**

In `## Skills (the brain)`, insert **immediately after** the `- **`define-design`** …` bullet:
```markdown
- **`roast`** — convene a 5-persona council that pressure-tests an idea, then a Judge returns one **GO / RESHAPE / KILL** verdict + the cheapest 48-hour test; saves the verdict to `outputs/vetting/` and can commission `storm-research`. Triggers: "roast" / "convene the council" / "brutal second opinion" / `/roast`.
- **`storm-research`** — turn a topic or idea into a verified, multi-perspective HTML briefing (5 expert lenses → contradiction map → self-review + primary-source citation checks → `outputs/vetting/<date>-<slug>/`). Needs web; refuses rather than fabricates offline. See `docs/IDEA-VETTING.md`.
```

- [ ] **Step 3: Add the `outputs/vetting/` bullet**

In `## The three-folder knowledge system`, under the `outputs/` list, insert **after** the
`- `outputs/ideas-*.md` …` bullet:
```markdown
  - `outputs/vetting/` — `roast` verdicts + `storm-research` briefings (indexed in `wiki/vetting.md`)
```

- [ ] **Step 4: Run the DoD checks from Step 1**

Confirm `BULLETS_OK OUTPUTS_OK UNDER_CAP` (the file should be ~102 lines — well under 125).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): add roast + storm-research skill bullets and outputs/vetting note (Phase 10)"
```

---

### Task 9: Docs mentions (README, USING, design-spec addendum)

**Files:**
- Modify: `README.md`
- Modify: `docs/USING-THIS-FOR-ANY-PROJECT.md`
- Modify: `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`

- [ ] **Step 1: Definition of done**
```bash
grep -q "Phase 10" README.md && echo README_OK
grep -q "vet the idea\|Then vet" docs/USING-THIS-FOR-ANY-PROJECT.md && echo USING_OK
grep -q "Phase 10" docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md && echo SPEC_OK
```
Expect: `README_OK USING_OK SPEC_OK`.

- [ ] **Step 2: README build-status line**

In the phase build-status list, insert **after** the `- Phase 9 — `define-design` …` line:
```markdown
- Phase 10 — `roast` + `storm-research` idea-vetting gate (vet before you build) ✅
```

- [ ] **Step 3: USING — a "vet the idea" step**

Insert **after** the `**Then define how it looks:** run **`define-design`** …` paragraph:
```markdown
**Then vet the idea:** run **`roast`** for a brutal GO / RESHAPE / KILL second opinion before you build, and (optionally) **`storm-research`** for a citation-verified HTML briefing — both saved to `outputs/vetting/`. See `docs/IDEA-VETTING.md`.
```

- [ ] **Step 4: USING — an optional-capability line**

Insert **after** the `**Optional capability:** the **Stitch MCP** …` paragraph:
```markdown
**Optional capability:** `storm-research` produces a verified, multi-perspective HTML briefing from five expert lenses with primary-source fact-checking (uses the built-in web tools — no key; refuses rather than fabricates offline) — see `docs/IDEA-VETTING.md`.
```

- [ ] **Step 5: Design-spec addendum**

Append to the end of `docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md`:
```markdown

## Phase 10 addendum — Idea vetting (`roast` + `storm-research`)

A vet-before-you-build gate: two embedded skills — `roast` (a 5-persona council + GO/RESHAPE/KILL
Judge) and `storm-research` (a citation-verified, multi-perspective HTML briefing) — write vetting
artifacts to `outputs/vetting/<date>-<slug>/` and index them in `wiki/vetting.md`. `roast` is Tier 0;
`storm-research` needs the built-in web tools and refuses rather than fabricates offline. Wired into
`define-project` (draft-gate offer), `what-can-i-do`, and `advise-project` (on-demand only). Full
design: `docs/superpowers/specs/2026-06-30-idea-vetting-design.md`; how-to: `docs/IDEA-VETTING.md`.
```

- [ ] **Step 6: Run the DoD checks; Step 7: Commit**

```bash
git add README.md docs/USING-THIS-FOR-ANY-PROJECT.md docs/superpowers/specs/2026-06-29-hma-project-foundation-design.md
git commit -m "docs: mention Phase 10 idea-vetting in README, USING, and the design spec"
```

---

### Task 10: Whole-branch verification (no pollution; everything wired)

**Files:** none (verification only).

- [ ] **Step 1: Authoring fidelity & adaptations**
```bash
# storm: identical template, both adaptations, citation verification kept
git diff --no-index "C:/Users/dwill/Desktop/skill-packages/Storm-research/storm-research-report-template.html" ".claude/skills/storm-research/report-template.html"
grep -q "Practitioner" .claude/skills/storm-research/SKILL.md && grep -q "CONFIRMED" .claude/skills/storm-research/SKILL.md && echo STORM_FIDELITY
# roast: verdict template + parallel council + adaptations
grep -q "GO / RESHAPE / KILL" .claude/skills/roast/SKILL.md && grep -q "48-hour test" .claude/skills/roast/SKILL.md && echo ROAST_FIDELITY
```
Expect: no diff output, `STORM_FIDELITY`, `ROAST_FIDELITY`.

- [ ] **Step 2: No pollution / invariants intact**
```bash
test "$(wc -l < CLAUDE.md)" -lt 125 && echo CAP_OK
ls outputs/vetting/                      # expect ONLY .gitkeep
test ! -f wiki/vetting.md && echo NO_REAL_WIKI         # must NOT exist (runtime-only)
git status --porcelain                   # expect: clean (all committed)
git log --oneline main..HEAD             # review the Phase 10 commits
```
Confirm: `outputs/vetting/` has only `.gitkeep`; no `wiki/vetting.md`; no `outputs/vetting/<date>-…` folder; `outputs/change-log.md` and `raw/` and `.claude/skills/improve-system/` are unchanged (`git log main..HEAD -- outputs/change-log.md raw .claude/skills/improve-system` returns nothing).

- [ ] **Step 3: Final whole-branch review + Codex cross-model gate**

Hand the whole branch to a final reviewer subagent (spec-vs-implementation) and run the Codex gate
(`codex review --base main`) per the established pipeline. Fix any P0/P1 findings, then proceed to
`finishing-a-development-branch`. **Do not** push or merge without explicit user request.

---

## Plan Review Loop (controller)

After this plan is written, dispatch a single plan-document-reviewer subagent with the plan path and
the spec path (`docs/superpowers/specs/2026-06-30-idea-vetting-design.md`). Fix issues and re-dispatch
until approved (max 3 iterations), then hand off to execution.

## Execution Handoff

Once approved: **Subagent-Driven (recommended)** — fresh implementer subagent per task + two-stage
review (spec compliance, then code/authoring quality), then the final whole-branch review + Codex gate,
then `finishing-a-development-branch` (fast-forward merge on request; push only when explicitly asked).
