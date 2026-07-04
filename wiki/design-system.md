---
title: Design System
source_id: wiki:design-system
path: wiki/design-system.md
tags: [design, design-system, ui, brand, meta]
updated: 2026-07-04
---

# Design System

**Direction:** Elegant / premium, restrained — Stripe/Linear-grade polish that reads *credible, well-funded, investor-grade*. Applies to **both** surfaces: the builder UI (wizard, editor, coaching panel) **and** the decks it generates (slide templates inherit this DNA). The look is part of the value prop — a founder must feel the output is investor-ready the instant they see it.

## Palette
"Ink & gold" — navy ink on warm white, deep indigo primary, refined gold accent (sparingly, for highlights / key metrics / "the ask"), emerald success. HSL token triplets in `aios/src/index.css` shape (`--token: H S% L%`, no `hsl()` wrapper).

**`:root` (light):**
```
--background: 40 30% 99%
--foreground: 222 47% 11%
--card: 0 0% 100%
--card-foreground: 222 47% 11%
--popover: 0 0% 100%
--popover-foreground: 222 47% 11%
--primary: 232 52% 28%
--primary-foreground: 40 30% 99%
--secondary: 220 14% 96%
--secondary-foreground: 222 47% 11%
--muted: 220 14% 96%
--muted-foreground: 220 12% 40%
--accent: 38 92% 50%
--accent-foreground: 222 47% 11%
--destructive: 0 72% 51%
--destructive-foreground: 0 0% 100%
--success: 152 55% 38%
--success-foreground: 0 0% 100%
--warning: 38 92% 50%
--warning-foreground: 222 47% 11%
--border: 220 13% 91%
--input: 220 13% 91%
--ring: 232 52% 28%
```

**`.dark`:**
```
--background: 222 47% 8%
--foreground: 40 30% 96%
--card: 222 44% 11%
--card-foreground: 40 30% 96%
--popover: 222 44% 11%
--popover-foreground: 40 30% 96%
--primary: 231 60% 68%
--primary-foreground: 222 47% 11%
--secondary: 222 30% 18%
--secondary-foreground: 40 30% 96%
--muted: 222 30% 18%
--muted-foreground: 220 15% 65%
--accent: 38 92% 55%
--accent-foreground: 222 47% 11%
--destructive: 0 63% 50%
--destructive-foreground: 0 0% 100%
--success: 152 50% 45%
--success-foreground: 222 47% 11%
--warning: 38 92% 55%
--warning-foreground: 222 47% 11%
--border: 222 25% 20%
--input: 222 25% 20%
--ring: 231 60% 68%
```

**Usage rules:** indigo `primary` for main actions/brand; **gold `accent` is reserved** — use it only for the highest-signal moments (key metrics, the funding ask, one hero CTA), never as a general button color, or it stops feeling premium. Emerald `success` doubles as the "growth/traction" positive color.

## Typography & shape
- **Display / headlines / slide titles:** **Fraunces** (modern old-style serif), weights 500–600. The premium/editorial signal; differentiates from all-sans generic-AI tools and makes generated decks look expensive.
- **UI / body / labels / forms:** **Inter**, 400 body · 500 medium · 600 semibold.
- Both are free Google Fonts (no licensing cost).
- **Corner radius:** `--radius: 0.5rem` (8px) — modern but refined.
- **Density:** airy — generous whitespace and padding; premium products breathe.

## Components & layout
- **Buttons:** solid indigo `primary` for main actions; subtle `secondary` (light gray) for secondary; gold reserved for one hero moment per view.
- **Cards:** white on warm-white background, hairline `border`, subtle shadow (low elevation — no heavy drop shadows).
- **Inputs:** clean, `input` border, clear focus `ring` (indigo). Generous field padding.
- **Nav:** minimal, typographic; the app chrome recedes so content/decks lead.
- **Spacing scale:** 4px base; lean toward larger steps (16/24/32/48) for the airy feel.
- **Motion:** quiet and functional — short fades and slides (~150–200ms), nothing bouncy or attention-seeking.
- **Deck templates:** inherit the same palette + Fraunces headlines; clean, one-idea-per-slide, lots of whitespace, gold used only for the standout number on a slide.

## Voice & imagery
- **Microcopy voice:** plain, confident, and encouraging — a **sharp fundraising coach, not a hype-bot.** Direct and specific ("Your ask is vague — investors want a number and what it buys"), never cutesy, exclamation-heavy, or corporate-stiff. The coaching copy IS the product's differentiator, so it carries the brand.
- **Imagery:** restrained and functional — typography-led, subtle **Lucide** line icons, palette-only accent visuals. **No** stock photos of people shaking hands, **no** generic AI gradients/blobs — both undercut the premium/credible signal.

## Accessibility & targets
- **Platforms:** web — desktop-first (the builder is a desktop-leaning workflow), fully responsive to tablet/mobile (the landing/marketing surface must look great on a phone for short-form traffic).
- **Theme:** light-first, dark mode included (both token sets above).
- **Contrast:** WCAG AA (≥4.5:1 for normal text) — palette built to clear it (`muted-foreground` darkened to `220 12% 40%` for AA).
- **Brand marks:** none locked yet (name/logo TBD).

## Regeneration prompt
Paste into a design tool (e.g. Stitch / Claude Design) to regenerate or iterate this look:

> Design an elegant, premium, restrained web app UI — Stripe/Linear-grade polish, "investor-grade and credible." It's a pitch-deck builder + fundraising coach for founders raising capital. Palette "ink & gold": warm-white background (`hsl(40 30% 99%)`), navy ink text (`hsl(222 47% 11%)`), deep indigo primary (`hsl(232 52% 28%)`), a refined gold accent (`hsl(38 92% 50%)`) used sparingly for key metrics and the funding ask, emerald success (`hsl(152 55% 38%)`). Typography: Fraunces (modern serif) for headlines and slide titles, Inter for all UI and body. 8px corner radius, airy/generous whitespace, subtle low-elevation cards, Lucide line icons, quiet motion. Include: a guided intake wizard, a slide editor with an inline "investor-lens" coaching panel, and clean investor-ready deck slide templates (one idea per slide, serif headline, gold reserved for the standout number). Light and dark modes. Confident, encouraging, plain-spoken microcopy — a fundraising coach, not a hype-bot. No stock photos, no gradient blobs.

## Open questions / assumptions
- **App name / logo** *(assumed — confirm later; working name "PitchReady")*.

---
*Source: raw/design/2026-07-04-ink-and-gold-premium/ (design discovery interview).*
