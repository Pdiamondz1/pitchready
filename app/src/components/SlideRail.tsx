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

// Horizontal scrolling strip on phones (tap to switch slides); vertical list with
// reorder controls on desktop (lg+).
export function SlideRail({ deck, selectedId, onSelect }: Props) {
  const { bySlide } = analyzeDeck(deck);

  return (
    <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-x-visible lg:pb-0">
      {deck.slides.map((s, i) => {
        const sev = bySlide[s.type]?.severity ?? "warn";
        const active = s.id === selectedId;
        return (
          <li key={s.id} className="max-w-[10rem] shrink-0 lg:max-w-none lg:shrink">
            <div
              className={cn(
                "group flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors",
                active
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 hover:bg-muted lg:border-transparent"
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
              <span className="hidden shrink-0 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
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
