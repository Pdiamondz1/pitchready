---
title: Design System
source_id: wiki:design-system
path: wiki/design-system.md
tags: [design, design-system, ui, brand, meta]
updated: 2026-07-06
---

# Design System

**Direction:** Bold-but-credible — "modern-corporate with a high-energy edge." **Vibrant violet** primary
with **warm gold** reserved for investor-grade moments, Space Grotesk + Inter, tonal layering, 10px radius.
Linear/Ramp/Mercury energy: fast, precise, confident, credible to a VC. Applies to the whole Big Dreem app
**and** the decks it generates (slides inherit the palette + type; the bold slide layouts are unchanged).
*(Restyled 2026-07-06 from a Stitch export — see Source. Prior "ink & gold" direction retired.)*

## Palette
HSL token triplets in `app/src/index.css` shape (`--token: H S% L%`, no `hsl()` wrapper).

**`:root` (light):**
```
--background: 264 24% 99%
--foreground: 258 28% 12%
--card: 0 0% 100%
--card-foreground: 258 28% 12%
--popover: 0 0% 100%
--popover-foreground: 258 28% 12%
--primary: 262 83% 58%        /* vibrant violet (#7c3aed) */
--primary-foreground: 0 0% 100%
--secondary: 264 24% 96%
--secondary-foreground: 258 28% 14%
--muted: 264 24% 96%
--muted-foreground: 260 12% 42%
--accent: 40 94% 50%          /* warm gold — reserved */
--accent-foreground: 258 30% 12%
--destructive: 0 74% 52%
--destructive-foreground: 0 0% 100%
--success: 150 60% 40%
--success-foreground: 0 0% 100%
--warning: 40 94% 50%
--warning-foreground: 258 30% 12%
--border: 264 22% 91%
--input: 264 22% 91%
--ring: 262 83% 58%
```

**`.dark` (deep violet):**
```
--background: 262 42% 8%
--foreground: 264 30% 96%
--card: 262 36% 12%
--primary: 262 90% 72%
--primary-foreground: 262 45% 12%
--secondary: 262 24% 18%
--muted: 262 24% 18%
--muted-foreground: 264 15% 68%
--accent: 40 96% 58%
--accent-foreground: 262 45% 10%
--destructive: 0 70% 58%
--success: 150 55% 50%
--warning: 40 96% 58%
--border: 262 26% 20%
--input: 262 26% 20%
--ring: 262 90% 72%
```

**Usage rules:** vibrant-violet `primary` for actions/brand; **gold `accent` is scarcity** — investor-grade
metrics, badges, the ask, one hero moment per view (never a general button). `success` = growth/traction.

## Typography & shape
- **Display / headlines / slide titles:** **Space Grotesk** (geometric, tech-forward), weights 500–700,
  tight letter-spacing at large sizes. *(Mapped to the `font-serif` utility so existing markup inherits it.)*
- **Body / UI / labels:** **Inter** (400 body · 500 · 600 for labels/buttons/nav).
- Both free Google Fonts.
- **Corner radius:** `--radius: 0.625rem` (10px) cards/containers; buttons/inputs 8px (`rounded-md`).
- **Density:** "tight-intentional" — close grouping within components, large (80px+) air between sections.

## Components & layout
- **Buttons:** violet `primary`, **10px rounded** (not pills); a subtle raised feel; gold reserved.
- **Elevation:** tonal layering + hairline `border` (1px low-contrast); soft **violet-tinted** ambient
  shadow on hover (`--shadow-md/lg` use `rgba(124,58,237,…)`). No heavy drops.
- **Cards:** white on faint-violet canvas, hairline border, low elevation.
- **Inputs:** clean, violet focus `ring`.
- **Readiness gauge:** circular; color bands (emerald / gold / red). *(Stitch's violet→gold sweep is a later polish.)*
- **Grid:** 12-col, 24px gutters, max-width 1280; single column + 20px margins on mobile.
- **Motion:** quiet, functional (~150–200ms).
- **Decks:** inherit the palette + Space Grotesk; violet hero/ink surfaces, gold on the standout number.

## Voice & imagery
- **Voice:** plain, confident, encouraging — a **sharp fundraising coach, not a hype-bot** (unchanged).
- **Imagery:** minimalist — typography-led, Lucide line icons, palette-only accents. No stock photos, no AI blobs.

## Accessibility & targets
- **Platforms:** web — desktop-first, responsive to mobile.
- **Theme:** light-first, dark mode included.
- **Contrast:** WCAG AA target. **Caveat:** gold-on-light is inherently low-contrast — keep gold for
  **large/bold** metrics + fills, not small body text (ink/violet carries small text).
- **Brand marks:** violet "Big Dreem" wordmark + gold sparkle favicon.

## Regeneration prompt
Paste into Stitch (stitch.withgoogle.com) to regenerate/iterate this look:

> Design a bold, modern, vibrant web-app UI for "Big Dreem" — a pitch-deck builder + fundraising coach.
> Bold-but-credible modern-startup energy (Linear/Framer/Vercel). Palette: vibrant violet primary
> (hsl 262 83% 58%), warm-gold accent (hsl 40 94% 50%) reserved for metrics + the ask, near-white
> violet-tinted canvas, deep violet-black dark mode. Space Grotesk headlines + Inter body, 10px corners,
> confident spacing, tonal layering + 1px outlines + soft violet shadows. Screens: landing hero; deck
> editor (slide rail + editable slide + Investor Lens panel); "My decks" list with score badges. Light + dark.

## Open questions / assumptions
- Readiness-gauge violet→gold sweep + input focus-glow are Stitch details deferred to a later polish pass.

---
*Source: raw/design/2026-07-06-vibrant-violet/ (Stitch export + restyle interview).*
