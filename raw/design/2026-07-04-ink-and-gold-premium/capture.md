---
title: Design Discovery — 2026-07-04
source_id: raw/design/2026-07-04-ink-and-gold-premium/capture.md
path: raw/design/2026-07-04-ink-and-gold-premium/
tags: [design, discovery, interview]
updated: 2026-07-04
---

# Design Discovery — 2026-07-04 — "Ink & gold" premium

Design-system interview for the pitch-deck builder (`wiki/charter.md`). Synthesized from the
interview alone (no external design tool). Efficient propose-and-confirm, given prior session context.

## 1. Style direction
**Proposed & locked:** Elegant / premium, restrained — Stripe/Linear/Notion-grade polish that reads
"credible, well-funded, investor-grade." Chosen over Bold/playful (undercuts trust) and plain Minimal
(risks generic). Rationale: a deck tool is judged on polish instantly, and "looks investor-grade" is
part of the value prop; the same DNA carries into the generated slides.
**A:** Lock Elegant/Premium.

## 2. Color & mood
**Proposed & locked:** "Ink & gold" — navy ink on warm white, deep indigo primary, refined gold accent
(used sparingly for highlights/metrics/"the ask"), emerald success. Reads premium + trustworthy +
high-value. Alternatives offered (emerald-forward, monochrome+blue) declined.
**A:** Go with what you recommend → Ink & gold locked.

## 3. Typography & shape
**Proposed & locked:** Fraunces (modern serif) for display/headlines/slide titles + Inter for UI/body
(both free Google Fonts). Serif headline differentiates from all-sans generic-AI tools and makes the
generated decks look editorial/premium. `--radius: 0.5rem` (8px). Airy density.
**A:** (asked for recommendation) → recommended Fraunces+Inter; locked.

## 4. Voice & imagery
**Proposed & locked:** Plain, confident, encouraging — a sharp fundraising coach, not a hype-bot;
never cutesy or corporate-stiff. Restrained imagery: typography-led, Lucide line icons, palette-only
accents; no stock handshakes, no AI gradient-blobs. Voice matters because the coaching copy IS the
differentiator.
**A:** Lock this.

## 5. Targets & constraints
**Proposed & locked:** Web, desktop-first + responsive to mobile (landing must shine on phones for
short-form traffic). Light-first with dark mode. WCAG AA (≥4.5:1). No must-keep brand marks yet
(name/logo TBD; working name "PitchReady").
**A:** Lock this.

## Draft-confirm gate
Full draft design system (all five dimensions + palette preview) reflected back.
**A:** Yes (confirmed). Console theming skipped (separate product app, not the AIOS console).
