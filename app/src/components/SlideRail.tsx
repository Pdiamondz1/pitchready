import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { moveSlide } from "@/data/store";
import { analyzeDeck, type Severity } from "@/data/coaching";
import type { Deck } from "@/data/types";

const DOT: Record<Severity, string> = {
  strong: "bg-success",
  warn: "bg-accent",
  gap: "bg-destructive",
};

interface Props {
  deck: Deck;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SlideRail({ deck, selectedId, onSelect }: Props) {
  const { bySlide } = analyzeDeck(deck);

  return (
    <ol className="space-y-1">
      {deck.slides.map((s, i) => {
        const sev = bySlide[s.type]?.severity ?? "warn";
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <div
              className={cn(
                "group flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors",
                active ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted"
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[sev])} aria-hidden />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left"
                onClick={() => onSelect(s.id)}
              >
                <span className="tnum mr-1.5 text-xs text-muted-foreground">{i + 1}</span>
                {s.title || s.type}
              </button>
              <span className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                  aria-label={`Move ${s.title || s.type} up`}
                  disabled={i === 0}
                  onClick={() => moveSlide(deck.id, i, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                  aria-label={`Move ${s.title || s.type} down`}
                  disabled={i === deck.slides.length - 1}
                  onClick={() => moveSlide(deck.id, i, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
