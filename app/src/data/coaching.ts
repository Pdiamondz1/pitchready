// The Investor Lens — rule-based fundraising coaching (the differentiator).
// Reads a deck's slides against DECK_STRUCTURE and returns per-slide notes + a
// weighted readiness score. No LLM — deterministic rules a founder can trust.

import type { Deck, Slide } from "./types";
import type { SlideType } from "./types";
import { DECK_STRUCTURE, isPlaceholder, type SlideSpec } from "./deckStructure";

export type Severity = "strong" | "warn" | "gap";

export interface CoachNote {
  slideType: SlideType;
  label: string;
  severity: Severity;
  message: string;
  tip: string; // the underlying investor guidance
}

export interface DeckAnalysis {
  score: number; // 0–100
  notes: CoachNote[]; // one per structural slide, in deck order
  bySlide: Partial<Record<SlideType, CoachNote>>;
  counts: { strong: number; warn: number; gap: number };
  summary: string;
}

const FRACTION: Record<Severity, number> = { strong: 1, warn: 0.5, gap: 0 };

const hasNumber = (s: string) => /\d/.test(s);
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

type CoachBase = Pick<CoachNote, "slideType" | "label" | "tip">;
function make(base: CoachBase, severity: Severity, message: string): CoachNote {
  return { ...base, severity, message };
}

function analyzeSlide(spec: SlideSpec, slide: Slide | undefined): CoachNote {
  const base: CoachBase = { slideType: spec.type, label: spec.label, tip: spec.investorWants };
  const body = slide?.body ?? "";

  if (body.trim() === "") {
    return make(base, "gap", `This slide is empty. ${spec.investorWants}`);
  }
  if (isPlaceholder(body)) {
    return make(base, "warn", `Still a draft placeholder — make it yours. ${spec.investorWants}`);
  }

  switch (spec.type) {
    case "ask":
      return hasNumber(body)
        ? make(base, "strong", "Specific ask — good. Make sure the milestones it funds are clear.")
        : make(base, "gap", "Your ask has no number. Investors want a specific amount and what it buys.");
    case "traction":
      return hasNumber(body)
        ? make(base, "strong", "Real numbers — this is the slide that moves rounds.")
        : make(base, "warn", "Add numbers and their trend (revenue, users, growth, retention).");
    case "market":
      return hasNumber(body)
        ? make(base, "strong", "Quantified market — good.")
        : make(base, "warn", "Put a number on the market (TAM). A figure makes it real.");
    case "team":
      return wordCount(body) >= 6
        ? make(base, "strong", "Names and why-you-win — exactly what investors read first.")
        : make(base, "warn", "Investors fund teams first — name the founders and your unfair advantage.");
    case "problem":
    case "solution":
      return wordCount(body) >= 8
        ? make(base, "strong", "Specific and clear.")
        : make(base, "warn", "Add specifics — one vague sentence won't land.");
    case "businessModel":
      return wordCount(body) >= 5
        ? make(base, "strong", "Clear on who pays and how.")
        : make(base, "warn", "Spell out who pays, how much, and how often.");
    default:
      return wordCount(body) >= 4
        ? make(base, "strong", "Looks solid.")
        : make(base, "warn", "A little thin — add a concrete detail.");
  }
}

function summarize(score: number, counts: DeckAnalysis["counts"]): string {
  if (score >= 80) return "Investor-ready. Tighten the few flagged slides and you're good to send.";
  if (score >= 55) return `Solid draft. ${counts.gap + counts.warn} slide(s) need work before you send it.`;
  if (score >= 30) return `Early draft. Close the ${counts.gap} gap(s) — especially traction, team, and the ask.`;
  return "Just getting started. Fill in the empty slides, then come back for the read.";
}

export function analyzeDeck(deck: Deck): DeckAnalysis {
  const bySlideType = new Map<SlideType, Slide>();
  for (const s of deck.slides) if (!bySlideType.has(s.type)) bySlideType.set(s.type, s);

  const notes: CoachNote[] = [];
  const bySlide: Partial<Record<SlideType, CoachNote>> = {};
  const counts = { strong: 0, warn: 0, gap: 0 };
  let earned = 0;
  let total = 0;

  for (const spec of DECK_STRUCTURE) {
    const note = analyzeSlide(spec, bySlideType.get(spec.type));
    notes.push(note);
    bySlide[spec.type] = note;
    counts[note.severity] += 1;
    total += spec.weight;
    earned += FRACTION[note.severity] * spec.weight;
  }

  const score = total ? Math.round((earned / total) * 100) : 0;
  return { score, notes, bySlide, counts, summary: summarize(score, counts) };
}

/** Color band for a readiness score. */
export function scoreBand(score: number): Severity {
  if (score >= 70) return "strong";
  if (score >= 40) return "warn";
  return "gap";
}
