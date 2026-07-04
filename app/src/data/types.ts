// Core domain types for PitchReady. Mock/templated data — no backend.

export type SlideType =
  | "title"
  | "problem"
  | "solution"
  | "product"
  | "market"
  | "businessModel"
  | "traction"
  | "competition"
  | "team"
  | "ask"
  | "contact";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string; // headline
  body: string; // main content (may be multi-line)
  metric?: string; // optional standout figure (rendered in gold)
  metricLabel?: string;
  chart?: ChartPoint[]; // optional bar chart (traction trend, market TAM/SAM/SOM…)
  image?: string; // optional image as a data URL (user-uploaded)
}

/** What the intake wizard collects. */
export interface StartupInput {
  name: string;
  oneLiner: string;
  problem: string;
  solution: string;
  market: string;
  businessModel: string;
  traction: string;
  team: string;
  ask: string;
}

export interface Deck {
  id: string;
  name: string;
  input: StartupInput;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export const EMPTY_INPUT: StartupInput = {
  name: "",
  oneLiner: "",
  problem: "",
  solution: "",
  market: "",
  businessModel: "",
  traction: "",
  team: "",
  ask: "",
};
