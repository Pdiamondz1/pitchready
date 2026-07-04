import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { EMPTY_INPUT, type StartupInput } from "@/data/types";
import { createDeck } from "@/data/store";
import { DECK_STRUCTURE } from "@/data/deckStructure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Field = keyof StartupInput;

interface Step {
  title: string;
  help: string;
  fields: Field[];
}

const tipFor = (type: string) => DECK_STRUCTURE.find((s) => s.type === type)?.investorWants ?? "";

const STEPS: Step[] = [
  {
    title: "The basics",
    help: "Your company name and a one-liner an investor could repeat back to you.",
    fields: ["name", "oneLiner"],
  },
  { title: "The problem", help: tipFor("problem"), fields: ["problem"] },
  { title: "Your solution", help: tipFor("solution"), fields: ["solution"] },
  { title: "The market", help: tipFor("market"), fields: ["market"] },
  { title: "Business model", help: tipFor("businessModel"), fields: ["businessModel"] },
  { title: "Traction", help: tipFor("traction"), fields: ["traction"] },
  { title: "The team", help: tipFor("team"), fields: ["team"] },
  { title: "The ask", help: tipFor("ask"), fields: ["ask"] },
];

const LABELS: Record<Field, string> = {
  name: "Company name",
  oneLiner: "One-liner",
  problem: "The problem you solve",
  solution: "Your solution",
  market: "Market size",
  businessModel: "How you make money",
  traction: "Traction so far",
  team: "The team",
  ask: "What you're raising",
};

const PLACEHOLDERS: Record<Field, string> = {
  name: "e.g. NimbusAI",
  oneLiner: "e.g. The AI copilot that files your SOC 2 evidence continuously.",
  problem: "Who has this problem, and why is it urgent and painful right now?",
  solution: "How you solve it — the before → after in a sentence or two.",
  market: "How big can this get? A number (TAM) makes it real.",
  businessModel: "Who pays, how much, how often — plus unit economics if you have them.",
  traction: "Revenue, users, growth rate, retention — numbers and their trend.",
  team: "Founders + the unfair advantage that means you'll win.",
  ask: "e.g. Raising $1.5M pre-seed to reach $100k MRR — funds 3 hires + 18 months runway.",
};

export default function NewDeck() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<StartupInput>({ ...EMPTY_INPUT });

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const set = (f: Field, v: string) => setInput((prev) => ({ ...prev, [f]: v }));

  const finish = () => {
    const deck = createDeck(input);
    navigate(`/decks/${deck.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{current.title}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card-sm sm:p-8">
        <h1 className="font-serif text-2xl">{current.title}</h1>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          {current.help}
        </p>

        <div className="mt-6 space-y-5">
          {current.fields.map((f) => (
            <div key={f} className="space-y-1.5">
              <Label htmlFor={f}>{LABELS[f]}</Label>
              {f === "name" || f === "oneLiner" ? (
                <Input
                  id={f}
                  value={input[f]}
                  onChange={(e) => set(f, e.target.value)}
                  placeholder={PLACEHOLDERS[f]}
                />
              ) : (
                <Textarea
                  id={f}
                  value={input[f]}
                  onChange={(e) => set(f, e.target.value)}
                  placeholder={PLACEHOLDERS[f]}
                  rows={4}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft /> Back
          </Button>
          {isLast ? (
            <Button onClick={finish}>
              <Sparkles /> Generate deck
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              Next <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        You can edit everything after — and the Investor Lens will coach you on each slide.
      </p>
    </div>
  );
}
