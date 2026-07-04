import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { analyzeDeck, type Severity } from "@/data/coaching";
import { DeckScoreRing } from "./DeckScoreRing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Deck } from "@/data/types";

const SEVERITY_RANK: Record<Severity, number> = { gap: 0, warn: 1, strong: 2 };

const ICON: Record<Severity, typeof AlertCircle> = {
  gap: AlertCircle,
  warn: AlertTriangle,
  strong: CheckCircle2,
};

const TONE: Record<Severity, string> = {
  gap: "text-destructive",
  warn: "text-accent",
  strong: "text-success",
};

interface Props {
  deck: Deck;
  selectedType?: string;
  onSelect: (slideId: string) => void;
}

/** The Investor Lens — the coaching differentiator. */
export function InvestorLensPanel({ deck, selectedType, onSelect }: Props) {
  const { score, notes, counts, summary } = analyzeDeck(deck);
  const idByType = new Map(deck.slides.map((s) => [s.type, s.id]));

  const ordered = [...notes].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-accent" />
          Investor Lens
        </div>
        <div className="mt-4 flex items-center gap-4">
          <DeckScoreRing score={score} size={72} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Readiness score
            </div>
            <p className="mt-1 text-sm leading-snug text-foreground">{summary}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="destructive">{counts.gap} gaps</Badge>
          <Badge variant="warning">{counts.warn} to improve</Badge>
          <Badge variant="success">{counts.strong} strong</Badge>
        </div>
      </div>

      <ul className="space-y-1.5">
        {ordered.map((note) => {
          const Icon = ICON[note.severity];
          const active = note.slideType === selectedType;
          const id = idByType.get(note.slideType);
          return (
            <li key={note.slideType}>
              <button
                type="button"
                onClick={() => id && onSelect(id)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TONE[note.severity])} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{note.label}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {note.message}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
