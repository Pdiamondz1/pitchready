# Design system (design-tool-provider aware)

The foundation ships a `define-design` skill that grills you into a portable **design
system** at `wiki/design-system.md` — the look-and-feel north star Claude reads before
building any UI. It is **interview-first** and **design-tool-provider aware**: Stitch is
the default example provider; Claude Design and bring-your-own tools are alternatives;
the interview alone produces a usable system without any tool. The format
(`design-system.md`) is the durable contract — providers are swappable. This page holds
the detail; `CLAUDE.md` stays a pointer.

The skill itself is `.claude/skills/define-design/SKILL.md`.

---

## What it is

`wiki/design-system.md` is the **look-and-feel north star**. Just as `wiki/charter.md`
captures *what* you're building, the design system captures *how it should look* — a clear,
portable target any build (plugin, mobile, web, workflow, the AIOS console) reads before
generating a single screen. Without it, UI work defaults to generic, vibe-coded slop; with
it, every build anchors to the same palette, type, voice, and shape.

It's written by `define-design` and maintained as normal AI wiki work (no sign-off, like
the charter). Re-run the skill any time the look, brand, or audience materially changes —
it reads the existing system for defaults, focuses the interview on what's changing, and
updates the page in place.

---

## Design-tool providers

`define-design` supports any design tool you choose; the `design-system.md` format is
the durable contract, not the tool. The core loop is the same for every provider:
**Generate** a look with your tool of choice → **Export** the result into
`raw/design/<YYYY-MM-DD>-<slug>/` → **Distill** into `wiki/design-system.md`. The
interview alone produces a usable system with no tool at all.

| Provider | Job | Access | Keyed? | Notes |
|---|---|---|---|---|
| **Stitch** (default) | look + design system | manual prompt or optional MCP | key in `aios/.env` | Google Labs, "not officially supported"; free tier; emits a portable `DESIGN.md`-style export. |
| **Claude Design** | look (exploration) | **manual only** | account-gated (Pro/Max+) | Interactive claude.ai; outbound-export only; **consumes**, doesn't emit, a design system; **not automatable** — paste the look back into the interview. |
| **Bring your own** | look | manual | — | Figma export, hand-authored, the next tool. The format (`design-system.md`) is the contract. |

> **Deferred — imagery/asset generation.** Tools like Higgsfield (raster image/video, with
> a first-party API/MCP but outputs no tokens/type/palette) do a *different job* — they
> generate visual assets, not a design system. This is a **later, keyed, opt-in "assets"
> tier**, not part of `define-design` today. When/if built it must also reconcile the
> "no stock photography" voice directive. **Not wired now.**

### Stitch — the default provider

[Google Stitch](https://stitch.withgoogle.com) generates UI from natural-language prompts
or from screenshots you upload, and lets you iterate on the result (e.g. "warm the palette,
tighten the spacing"). The skill folds it in like this:

1. **Generate.** `define-design` assembles a ready-to-paste Stitch prompt from your
   interview answers. You take it to `stitch.withgoogle.com`, generate, and iterate there
   until the look is right.
2. **Export.** Drop Stitch's export — its `design.md` plus any screenshots (and exported
   code, if any) — into a **new dated folder** for this run:

       raw/design/<YYYY-MM-DD>-<slug>/

   where `<slug>` is a short kebab-case label (e.g. `calm-dashboard`).
3. **Distill.** `define-design` reads that folder and distills it (plus the interview) into
   `wiki/design-system.md`, writing a capture file alongside the export.

`raw/design/` is **immutable and append-only** — every run (including restyle re-runs)
writes a *new* dated folder; nothing already in `raw/` is edited, renamed, or deleted.
Stitch is an accelerator, not a dependency: if you skip it, the skill synthesizes the
system from the interview alone.

---

## Stitch tiers

Stitch use is gated by a single toggle — `mcp_enabled` in
`.claude/skills/define-design/config.json`.

**Tier 0 — manual paste-back (default, no keys).** `mcp_enabled: false`. The skill emits
the Stitch prompt, you generate on the Stitch site yourself, and you paste the export back
into `raw/design/<date>-<slug>/`. Nothing is sent on your behalf; no key is needed.

**Optional climb — the Stitch MCP.** Set `mcp_enabled: true`, put `STITCH_API_KEY` (a Stitch /
Google AI key) in `aios/.env` (an empty slot you fill — **never paste a key into chat**), and register
the Stitch MCP server. Then Claude can drive Stitch directly and save the result into the
same `raw/design/` folder. This is **graceful-off**: if the key or the MCP is absent at
runtime, or you decline, the skill notes the skip and **falls back cleanly to the manual
path** — it never blocks.

The other config keys:

| Key | Default | What it does |
|---|---|---|
| `mcp_enabled` | `false` | `false` = manual paste-back; `true` + key in `aios/.env` = drive the Stitch MCP (graceful-off if absent). |
| `default_archetype` | `""` | Optional pre-pick of a style archetype (e.g. `"professional-dashboard"`); `""` infers from the charter. |
| `theme_console` | `true` | Whether to offer the opt-in console-theming step (see below). `false` skips the offer. |

---

## The `design-system.md` shape

`wiki/design-system.md` opens with the standard RAG-ready frontmatter
(`title`, `source_id`, `path`, `tags`, `updated`) and then fills a fixed set of named
sections — see "The design system (wiki/design-system.md) shape" in
`.claude/skills/define-design/SKILL.md` for the exact template:

- **Direction** — the archetype plus the feeling (e.g. "Professional dashboard, calm and precise").
- **Palette** — HSL token triplets for `:root` (light) and `.dark` (see the mapping below).
- **Typography & shape** — type pairing (display/body), weights, `--radius`, density.
- **Components & layout** — buttons, cards, inputs, nav; spacing scale; elevation/shadow; motion.
- **Voice & imagery** — microcopy tone; illustration / photo / flat; iconography.
- **Accessibility & targets** — contrast targets, dark-first?, web / mobile / both, must-keep brand marks.
- **Regeneration prompt** — the ready-to-paste prompt that regenerates or iterates this system in your chosen design tool (e.g. Stitch).
- **Open questions / assumptions** — anything flagged `(assumed — confirm later)`.

A *Source* footer points back at the `raw/design/<date>-<slug>/` record it was distilled from.

---

## The console-token mapping

The Palette section records colors in the **exact shape the AIOS console uses** so they map
1:1 onto its tokens with no translation. The console's single source of truth for color is
`aios/src/index.css`, where each token is a **space-separated HSL triplet with no `hsl()`
wrapper** — `--token: H S% L%` — defined twice, under `:root` (light) and `.dark`.

The **13 base tokens** the design system carries are:

    background  foreground  card  primary  secondary  muted  accent
    destructive  success  warning  border  input  ring

When the palette is applied to the console, the **paired contrast tokens** are re-derived
and sanity-checked against the new colors too, so text stays legible on every surface:
`--card-foreground`, `--primary-foreground`, `--secondary-foreground`,
`--muted-foreground`, `--accent-foreground`, `--destructive-foreground`, plus
`--popover` / `--popover-foreground`. Words and names (product name, tagline, assistant
persona) live separately in `aios/src/config/brand.ts`.

**Applied only on opt-in.** If `theme_console` is enabled, `define-design` *offers* a final
theming step. **Only on an explicit "yes"** does it edit exactly two files —
`aios/src/index.css` (regenerating token *values*, preserving the file's comments and
structure) and `aios/src/config/brand.ts` (only if the voice changed). This is the same
attended, user-approved, logged config-edit pattern `setup-project` uses for `aios/`
source. It is **never** automatic, touches no other source, and **never** runs in the
unattended `maintenance-loop`. Decline, and nothing is written to `aios/`.

> **W3C alignment.** `design-system.md`'s 13-token palette is compatible-in-spirit with
> the **W3C Design Tokens 2025.10** standard and Stitch's `DESIGN.md` interchange — we
> speak a standard, not a vendor dialect. Honest note: external tools churn — we integrate
> the format, not the vendor.

---

## Privacy note

Using **Google Stitch — or the Stitch MCP — sends your prompt, and any screenshots you
upload, to Google.** It runs on **your own authorized key** and is strictly **opt-in**: the
manual path only sends what you choose to type or upload on the Stitch site, and the MCP
path activates only when you set `mcp_enabled: true`, supply the key in `aios/.env`, and
opt in at runtime. Clones that leave the default (`mcp_enabled: false`, no key) send nothing
on your behalf and work exactly as before. `STITCH_API_KEY` (the Stitch / Google AI key) lives
**only** in `aios/.env` (a gitignored file you fill) — it is never collected, read back, or written
anywhere by the skill, and you should **never paste it into chat**.
