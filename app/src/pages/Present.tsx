import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useDeck } from "@/data/store";
import { cn } from "@/lib/utils";
import type { Slide } from "@/data/types";

function SlideView({ slide, className }: { slide: Slide; className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[16/9] w-full flex-col justify-center bg-card p-10 sm:p-16",
        className
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {slide.type}
      </div>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-5xl">
        {slide.title}
      </h2>
      {slide.metric && (
        <div className="mt-4 flex items-baseline gap-3">
          <span className="tnum font-serif text-4xl font-bold text-accent sm:text-6xl">
            {slide.metric}
          </span>
          <span className="text-sm text-muted-foreground">{slide.metricLabel}</span>
        </div>
      )}
      <p className="mt-5 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-foreground/90 sm:text-lg">
        {slide.body}
      </p>
    </div>
  );
}

export default function Present() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deck = useDeck(id);
  const [i, setI] = useState(0);

  const count = deck?.slides.length ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((v) => Math.min(count - 1, v + 1));
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
      else if (e.key === "Escape" && id) navigate(`/decks/${id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, id, navigate]);

  if (!deck) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Link to="/decks" className="text-primary hover:underline">
          Deck not found — back to my decks
        </Link>
      </div>
    );
  }

  const slide = deck.slides[Math.min(i, count - 1)];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="no-print flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Link
          to={`/decks/${deck.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" /> Exit
        </Link>
        <div className="truncate font-serif text-sm">{deck.name}</div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="no-print flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-8">
        <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-border shadow-card-lg">
          <SlideView slide={slide} />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={i === 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="tnum text-sm text-muted-foreground">
            {Math.min(i + 1, count)} / {count}
          </span>
          <button
            type="button"
            aria-label="Next slide"
            disabled={i >= count - 1}
            onClick={() => setI((v) => Math.min(count - 1, v + 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* print-only: every slide, one per page (see print styles in index.css) */}
      <div className="print-deck">
        {deck.slides.map((s) => (
          <div key={s.id} className="print-slide">
            <SlideView slide={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
