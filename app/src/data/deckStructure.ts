// The canonical investor deck structure + the templated generator.
// DECK_STRUCTURE drives BOTH generation (here) and coaching (coaching.ts), so
// the two never drift.

import type { Slide, SlideType, StartupInput } from "./types";
import { uid } from "@/lib/utils";

export interface SlideSpec {
  type: SlideType;
  label: string; // short label (rail + coaching)
  headline: string; // default slide headline
  purpose: string; // one-line "what this slide must do" (editor help)
  investorWants: string; // coaching guidance
  weight: number; // contribution to the readiness score
}

export const DECK_STRUCTURE: SlideSpec[] = [
  {
    type: "title",
    label: "Title",
    headline: "Your company",
    purpose: "Company name + a one-liner an investor can repeat.",
    investorWants: "A crisp one-liner: what you do, for whom, in one breath.",
    weight: 1,
  },
  {
    type: "problem",
    label: "Problem",
    headline: "The problem",
    purpose: "The painful, specific problem you solve.",
    investorWants: "A real, urgent problem for a specific customer — not 'the world is inefficient'.",
    weight: 2,
  },
  {
    type: "solution",
    label: "Solution",
    headline: "Our solution",
    purpose: "How you solve it, simply.",
    investorWants: "A clear before → after. What's the magic in one sentence?",
    weight: 2,
  },
  {
    type: "product",
    label: "Product",
    headline: "How it works",
    purpose: "What it actually is / how it works.",
    investorWants: "Show the product — a screenshot or concrete walkthrough beats adjectives.",
    weight: 1,
  },
  {
    type: "market",
    label: "Market",
    headline: "The opportunity",
    purpose: "How big this can get (TAM/SAM/SOM).",
    investorWants: "A credible, ideally bottom-up number. Investors fund big markets.",
    weight: 2,
  },
  {
    type: "businessModel",
    label: "Model",
    headline: "How we make money",
    purpose: "Who pays, how much, how often.",
    investorWants: "Pricing + unit economics if you have them (margin, CAC/LTV).",
    weight: 2,
  },
  {
    type: "traction",
    label: "Traction",
    headline: "Traction",
    purpose: "Proof it's working.",
    investorWants: "Numbers and their trend — revenue, users, growth rate, retention. This slide moves rounds.",
    weight: 3,
  },
  {
    type: "competition",
    label: "Competition",
    headline: "Why we win",
    purpose: "The landscape and your durable edge.",
    investorWants: "Honest competitors + your moat. Never say 'we have no competition'.",
    weight: 1,
  },
  {
    type: "team",
    label: "Team",
    headline: "The team",
    purpose: "Why you're the ones to win.",
    investorWants: "Founders fund teams first — relevant, unfair-advantage backgrounds.",
    weight: 3,
  },
  {
    type: "ask",
    label: "The ask",
    headline: "The ask",
    purpose: "How much you're raising and what it buys.",
    investorWants: "A specific amount, the milestones it funds, and the runway it buys.",
    weight: 2,
  },
  {
    type: "contact",
    label: "Contact",
    headline: "Let's talk",
    purpose: "How to reach you + the next step.",
    investorWants: "Name, email, and one clear call to action.",
    weight: 1,
  },
];

/** Bodies whose text is a bracketed prompt are unfilled drafts. */
export function isPlaceholder(body: string): boolean {
  return body.trim().startsWith("(");
}

/** Pull the first impressive figure out of a string (e.g. "$1.5M", "40%", "3x"). */
export function extractMetric(text: string): string | undefined {
  if (!text) return undefined;
  const m = text.match(
    /\$\s?\d[\d.,]*\s?(?:k|m|b|bn|million|billion)?|\d[\d.,]*\s?%|\d[\d.,]*x\b/i
  );
  return m ? m[0].replace(/\s+/g, "") : undefined;
}

interface GenContent {
  body: string;
  metric?: string;
  metricLabel?: string;
}

function contentFor(type: SlideType, input: StartupInput): GenContent {
  switch (type) {
    case "title":
      return { body: input.oneLiner };
    case "problem":
      return { body: input.problem };
    case "solution":
      return { body: input.solution };
    case "product":
      return {
        body: "(Show the product — a screenshot, a short demo, or a concrete walkthrough. What is the 'aha' moment?)",
      };
    case "market":
      return { body: input.market, metric: extractMetric(input.market), metricLabel: "market size" };
    case "businessModel":
      return { body: input.businessModel };
    case "traction":
      return { body: input.traction, metric: extractMetric(input.traction), metricLabel: "key metric" };
    case "competition":
      return {
        body: "(Name 2–3 real alternatives and the one durable edge that lets you win. Never say 'we have no competition'.)",
      };
    case "team":
      return { body: input.team };
    case "ask":
      return { body: input.ask, metric: extractMetric(input.ask), metricLabel: "raising" };
    case "contact":
      return {
        body: "(Your name, email, and the one next step you want — e.g. 'Book a 20-minute call'.)",
      };
    default:
      return { body: "" };
  }
}

/** Turn intake answers into a full templated deck (Tier 0 — no LLM). */
export function generateSlides(input: StartupInput): Slide[] {
  return DECK_STRUCTURE.map((spec) => {
    const gen = contentFor(spec.type, input);
    const headline = spec.type === "title" ? input.name.trim() || spec.headline : spec.headline;
    return {
      id: uid("s"),
      type: spec.type,
      title: headline,
      body: gen.body ?? "",
      metric: gen.metric,
      metricLabel: gen.metric ? gen.metricLabel : undefined,
    } satisfies Slide;
  });
}
