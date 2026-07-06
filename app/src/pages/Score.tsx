import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { analyzeQuick, quickVerdict, type QuickAnalysis, type Severity } from "@/data/coaching";
import { DECK_STRUCTURE } from "@/data/deckStructure";
import { DeckScoreRing } from "@/components/DeckScoreRing";
import { createDeck, useDecks } from "@/data/store";
import { EMPTY_INPUT } from "@/data/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The "score first" front door — a 30-second read on the three slides investors
// weight most, before the full 8-step builder. Nothing is saved until the
// visitor chooses to "Build my full deck" (the conversion moment).

type QuickField = "traction" | "team" | "ask";

const FIELDS: { key: QuickField; label: string; placeholder: string }[] = [
  {
    key: "traction",
    label: "Traction so far",
    placeholder: "Revenue, users, growth rate, retention — numbers and their trend.",
  },
  {
    key: "team",
    label: "The team",
    placeholder: "Founders + the unfair advantage that means you'll win.",
  },
  {
    key: "ask",
    label: "The ask",
    placeholder:
      "e.g. Raising $1.5M pre-seed to reach $100k MRR — funds 3 hires + 18 months runway.",
  },
];

const tipFor = (type: QuickField) => DECK_STRUCTURE.find((s) => s.type === type)?.investorWants ?? "";

const SEV_STYLE: Record<Severity, { dot: string; label: string; text: string }> = {
  gap: { dot: "bg-destructive", label: "Gap", text: "text-destructive" },
  warn: { dot: "bg-accent", label: "Fix", text: "text-accent" },
  strong: { dot: "bg-success", label: "Strong", text: "text-success" },
};

export default function Score() {
  const navigate = useNavigate();
  const decks = useDecks();
  const sample = decks[0];
  const [values, setValues] = useState<Record<QuickField, string>>({ traction: "", team: "", ask: "" });
  const [analysis, setAnalysis] = useState<QuickAnalysis | null>(null);

  const set = (k: QuickField, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const canScore = Object.values(values).some((v) => v.trim());

  const graduate = () => {
    const deck = createDeck({ ...EMPTY_INPUT, ...values });
    navigate(`/decks/${deck.id}`);
  };

  // ── Result phase ──────────────────────────────────────────────────────────
  if (analysis) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <DeckScoreRing score={analysis.score} size={112} stroke={9} />
          <h1 className="mt-5 font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {quickVerdict(analysis)}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your score on the three slides investors weight most — traction, team, and the ask.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {analysis.notes.map((n) => {
            const s = SEV_STYLE[n.severity];
            return (
              <div key={n.slideType} className="rounded-xl border border-border bg-card p-5 shadow-card-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                  <span className="font-serif text-base font-semibold">{n.label}</span>
                  <span className={cn("ml-auto text-xs font-semibold uppercase tracking-wider", s.text)}>
                    {s.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/85">{n.message}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">Investors want:</span> {n.tip}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button onClick={graduate} size="lg" className="w-full">
            <ArrowRight /> Build my full deck
          </Button>
          <div className="flex items-center gap-5 text-sm">
            {sample && (
              <Link to={`/decks/${sample.id}`} className="font-medium text-primary hover:underline">
                See a sample deck
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAnalysis(null)}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Edit my answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Input phase ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Free · 30 seconds · no sign-up
        </span>
        <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Is your pitch fundable?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Answer the three slides investors weight most. Get a readiness score and the exact fixes —
          before you send a thing.
        </p>
      </div>

      <div className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-card-sm sm:p-8">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
              {tipFor(f.key)}
            </p>
            <Textarea
              id={f.key}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
            />
          </div>
        ))}
        <Button onClick={() => setAnalysis(analyzeQuick(values))} disabled={!canScore} size="lg" className="w-full">
          <Sparkles /> Score my pitch
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Want the whole deck instead?{" "}
        <Link to="/new" className="font-medium text-primary hover:underline">
          Build a full deck
        </Link>
      </p>
    </div>
  );
}
