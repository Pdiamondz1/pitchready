import { Link } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { useDecks } from "@/data/store";
import { DeckCard } from "@/components/DeckCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Decks() {
  const decks = useDecks();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">My decks</h1>
          <p className="text-sm text-muted-foreground">
            {decks.length} deck{decks.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link to="/new" className={cn(buttonVariants())}>
          <Plus /> New deck
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg">No decks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Start your first investor-ready deck.</p>
          <Link to="/new" className={cn(buttonVariants(), "mt-5")}>
            <Plus /> Build your deck
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map((d) => (
            <DeckCard key={d.id} deck={d} />
          ))}
        </div>
      )}
    </div>
  );
}
