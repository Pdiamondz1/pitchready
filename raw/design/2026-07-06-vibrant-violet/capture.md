---
title: Design Discovery — 2026-07-06
source_id: raw/design/2026-07-06-vibrant-violet/capture.md
path: raw/design/2026-07-06-vibrant-violet/
tags: [design, discovery, interview, stitch, restyle]
updated: 2026-07-06
---

# Design Discovery — 2026-07-06 — "Vibrant violet" (restyle via Stitch)

Whole-app aesthetic overhaul of Big Dreem, from "ink & gold" elegant/premium →
**bold-but-credible vibrant violet**. Source: a Google **Stitch** export the user generated
(manual paste-back path) + the focused restyle interview.

## Interview answers
- **Bold flavor:** Bold but credible (modern-startup with backbone — Linear/Ramp/Mercury energy).
- **Palette:** Vibrant violet primary + punchy warm-gold accent (gold reserved for highlights).
- **Type:** Space Grotesk (display) + Inter (body); ~10px radius; confident (not airy) spacing.
- **Voice / targets:** unchanged — confident fundraising coach; web, light + dark, WCAG AA.

## Distilled from the Stitch export
- **Aesthetic:** "Modern-corporate with a high-energy edge" — Linear precision + vibrant fundraising
  optimism; generous whitespace, razor-sharp type, tonal "high-resolution" finish. Emotion: "hyper-competence."
- **Primary (vibrant violet):** `#7c3aed` (≈ hsl 262 83% 58%) — buttons, active states, progress.
  (Stitch also gave a deeper `#630ed4` primary role; used the brighter #7c3aed for vibrancy.)
- **Accent (warm gold):** intentional scarcity — `#ffc329` fills / `~#e0a51a` for legible metric text;
  reserved for investor-ready metrics, badges, the ask.
- **Surface:** near-white with a faint violet tint (not flat gray); deep violet-black in dark mode.
- **Typography:** Space Grotesk headlines (tight tracking at large sizes), Inter body/labels.
- **Shape:** precision-rounded — 10px cards/containers, 8px buttons/inputs, 4px checkboxes.
- **Elevation:** tonal layering + 1px low-contrast outlines (not heavy shadows); soft violet ambient
  shadow on hover: `0 12px 32px rgba(124,58,237,0.08)`.
- **Spacing:** base-4; sm(16) internal padding, md(24) between components, 80px+ air between sections;
  12-col grid, 24px gutters, max-width 1280.
- **Components:** violet "New Deck" button w/ 1px top-highlight; readiness gauge violet→gold as score
  rises; Investor Lens panel on a Surface-2 tint; metric cards (Space Grotesk value + Inter label,
  gold only when "investor grade"); inputs w/ 3px soft violet focus glow.

The full Stitch YAML+markdown export was pasted by the user (Material-3 token naming). The values
above are the distilled subset mapped onto the design-system token contract.
