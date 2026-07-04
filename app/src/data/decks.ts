// Seed decks (mock). One strong, investor-ready deck and one weak early draft —
// so the coaching contrast is visible the moment you open the app.

import type { Deck, StartupInput } from "./types";
import { generateSlides } from "./deckStructure";

function makeDeck(id: string, name: string, input: StartupInput, date: string): Deck {
  return { id, name, input, slides: generateSlides(input), createdAt: date, updatedAt: date };
}

const nimbus: StartupInput = {
  name: "NimbusAI",
  oneLiner: "The AI copilot that writes and files your SOC 2 evidence, continuously.",
  problem:
    "Startups lose 3–6 months and $40k+ on their first SOC 2 audit, manually gathering evidence across dozens of disconnected tools — usually right when a big customer is waiting on it.",
  solution:
    "NimbusAI connects to your stack and auto-collects, maps, and files audit evidence continuously — turning a 6-month scramble into a 2-week review, with nothing to chase.",
  market:
    "160,000 US B2B SaaS companies need SOC 2, and compliance software is a $4.3B market growing 18% a year as security reviews become table stakes for every deal.",
  businessModel:
    "SaaS: $850/month per company on annual contracts, 82% gross margin. Land on SOC 2, expand into ISO 27001 and HIPAA (each +$400/mo). CAC ~$2,100, LTV ~$21,000.",
  traction:
    "$18k MRR, up 40% month-over-month for 4 straight months. 32 paying startups, 5% monthly churn, and 3 design partners converting to annual contracts this quarter.",
  team:
    "Two-time founders: Priya (ex-Vanta compliance lead, took 400+ companies through SOC 2) and Marco (ex-AWS security engineer who built audit tooling used by 200+ enterprise customers).",
  ask:
    "Raising a $1.5M pre-seed to reach $100k MRR in 18 months — funds 3 engineers, 2 GTM hires, and 18 months of runway.",
};

const loamly: StartupInput = {
  name: "Loamly",
  oneLiner: "A better way to garden.",
  problem: "Gardening is hard and a lot of people give up.",
  solution: "An app that helps you garden.",
  market: "Everyone gardens, so it's a huge market.",
  businessModel: "",
  traction: "",
  team: "Me and a friend.",
  ask: "Looking for some money to build it out.",
};

export const SEED_DECKS: Deck[] = [
  makeDeck("deck_nimbus", "NimbusAI", nimbus, "2026-06-28T15:20:00.000Z"),
  makeDeck("deck_loamly", "Loamly", loamly, "2026-07-01T09:05:00.000Z"),
];
