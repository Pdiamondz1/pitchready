# New project walkthrough

The simple, repeatable flow for starting **any** new project from this foundation. You're
not cloning an app — you're cloning a **brain + console**: an immutable `raw/` →
AI-written `wiki/` → `outputs/` approval queues, driven by skills and surfaced in the
`aios/` console. You turn a few knobs to make it yours.

For the deeper version, see `docs/USING-THIS-FOR-ANY-PROJECT.md`.

## One-time (already done on the template repo)

The source repo is marked a **GitHub template repository**, so each new project starts with
**"Use this template" → Create a new repository.**

## Each new project

**1. Create + clone the new repo**

```
# After "Use this template" makes e.g. you/my-new-project:
git clone https://github.com/<you>/my-new-project.git
cd my-new-project
```

*(Manual alternative: `git clone` the foundation into a new folder, then
`git remote set-url origin <new-repo-url>` so you don't push back into the template.)*

**2. Specialize it — run the setup skill**

Open the folder in Claude Code and run:

```
/setup-project
```

It interviews you (project name, what you're building, brand words, capability tier, which
console surfaces to keep), writes the config, and scaffolds `aios/.env`. It will **not** ask
for API keys — it leaves those slots empty for you to paste in yourself.

**3. Add your first knowledge**

```
/add-new-resource
```

Drop in a file, note, or link → it lands in `raw/` and is indexed in `wiki/`. For recurring
sources (your Claude sessions, email/Drive, creators you follow), run the sync skills once to
configure them, or `/data-ingestion` to run them all.

**4. Open the console (optional)**

```
cd aios
npm install
npm run dev
```

Browse the wiki, raw assets, and the review/approval queues in your browser.

**5. Go autonomous (optional)**

Let `/setup-project` offer it at the end, or ask Claude Code:

> "Create a weekly routine, Mondays 9am, that runs the maintenance-loop skill."

Now it ingests new knowledge and self-improves on its own, behind the approval gates.
Details + alternatives in `docs/SCHEDULING.md`.

## Capability tiers (what keys unlock what)

Start at **Tier 0 — nothing required.** Climb only as far as you need, by editing `aios/.env`
(copy from `aios/.env.example`). After adding knowledge or changing tiers, run
`npm run kb:index` (in `aios/`) to refresh search.

| Tier | You get | Turn on |
|---|---|---|
| **0** (default) | Console + skills + keyword search | nothing |
| **1** | Offline semantic search | `EMBEDDINGS=local` + `npm run kb:enable-local-embeddings` |
| **2** | Live chat agent | paste `ANTHROPIC_API_KEY` |
| **3** | Higher-quality search | `OPENAI_API_KEY` + `EMBEDDINGS=openai` |
| **4** | Cloud / multi-user | `KB_STORE=supabase` + Supabase keys |

## Set the new repo's metadata

GitHub does **not** copy a template's description or topics into repos made from it — each new
repo starts blank. Set them per project so it's discoverable. A good starting point to adapt:

**Description** (tailor the first clause to your project):

> `<Your project> — built on a self-improving foundation: a file-first second brain (raw → AI-written wiki → approval queues) + Claude Code skills that vet, design, build, and ship it, with an opt-in AIOS console.`

**Topics** (keep the ones that fit, add domain-specific ones):

```
claude-code  claude  ai-agents  agentic-ai  knowledge-base  second-brain
rag  anthropic  self-improving  automation  starter-kit  pkm
```

Set them in the repo's GitHub page (the ⚙ next to **About**), or from the CLI:

```
gh repo edit <you>/my-new-project \
  --description "..." \
  --add-topic claude-code,ai-agents,knowledge-base,second-brain
```

## Updating from the foundation later

A project created from this template is a **snapshot**, not a live dependency — there's no
git link back. So:

- **New projects** you create *after* the foundation is updated start from the newer snapshot
  automatically.
- **Existing projects** stay frozen at the day you created them; foundation updates do **not**
  flow in on their own.

To pull a specific foundation update into an existing project, do it manually — cherry-pick the
files you want rather than merging the whole thing:

```
# inside the existing project
git remote add foundation https://github.com/Pdiamondz1/hma_project_foundation.git
git fetch foundation
# bring over just what you want, e.g. a new skill + doc:
git checkout foundation/main -- .claude/skills/maintenance-loop docs/SCHEDULING.md
git commit -m "chore: pull maintenance-loop + scheduling from foundation"
```

Rule of thumb: **new self-contained pieces** (a whole new skill folder, a new doc) backport
cleanly. **Edits to files you've rebranded** (`aios/src/config/brand.ts`, `CLAUDE.md`, etc.)
will conflict — pull those by hand. A full `git merge foundation/main` works too but tends to
fight your specialization, so prefer the targeted `checkout` above.

## When you want more

- `docs/USING-THIS-FOR-ANY-PROJECT.md` — fuller mental model + project-type recipes.
- `docs/EXTENDING.md` — add your own agent tool / skill / source / page / store.
- `docs/SCHEDULING.md` — autonomy options and tradeoffs.

---

**The whole loop:** clone → `/setup-project` → `/add-new-resource` → (optional) console + schedule. From
there you can go further — **define → vet → design → build → take it to production**; see
`docs/USING-THIS-FOR-ANY-PROJECT.md` and `docs/PATH-TO-PRODUCTION.md`.
