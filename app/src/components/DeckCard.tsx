import { Link } from "react-router-dom";
import { Trash2, Presentation, PencilLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeckScoreRing } from "./DeckScoreRing";
import { analyzeDeck } from "@/data/coaching";
import { deleteDeck } from "@/data/store";
import { cn, formatDate } from "@/lib/utils";
import type { Deck } from "@/data/types";

export function DeckCard({ deck }: { deck: Deck }) {
  const { score, summary } = analyzeDeck(deck);

  return (
    <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-card-md sm:flex-row sm:items-center">
      <DeckScoreRing score={score} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-lg">{deck.name}</h3>
        <p className="truncate text-sm text-muted-foreground">
          {deck.input.oneLiner || summary}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(deck.updatedAt)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/decks/${deck.id}`}
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          <PencilLine /> Edit
        </Link>
        <Link
          to={`/decks/${deck.id}/present`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Presentation /> Present
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${deck.name}`}
          onClick={() => deleteDeck(deck.id)}
        >
          <Trash2 />
        </Button>
      </div>
    </Card>
  );
}
