import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Presentation } from "lucide-react";
import { useDeck, renameDeck } from "@/data/store";
import { SlideRail } from "@/components/SlideRail";
import { SlideCanvas } from "@/components/SlideCanvas";
import { InvestorLensPanel } from "@/components/InvestorLensPanel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DeckEditor() {
  const { id } = useParams();
  const deck = useDeck(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!deck) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-2xl">Deck not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been deleted.</p>
        <Link
          to="/decks"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          Back to my decks
        </Link>
      </div>
    );
  }

  const selected = deck.slides.find((s) => s.id === selectedId) ?? deck.slides[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link
          to="/decks"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back to my decks"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <input
          value={deck.name}
          onChange={(e) => renameDeck(deck.id, e.target.value)}
          className="min-w-0 flex-1 bg-transparent font-serif text-2xl font-semibold outline-none"
          aria-label="Deck name"
        />
        <Link
          to={`/decks/${deck.id}/present`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Presentation /> Present
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[200px_1fr_320px]">
        {/* On phones: horizontal slide strip on top → canvas → coaching. On lg+: three columns. */}
        <SlideRail deck={deck} selectedId={selected.id} onSelect={setSelectedId} />
        <SlideCanvas deck={deck} slide={selected} />
        <InvestorLensPanel deck={deck} selectedType={selected.type} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
