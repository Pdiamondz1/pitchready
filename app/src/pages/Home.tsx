import { Link } from "react-router-dom";
import { ArrowRight, Target, TrendingUp, Sparkles } from "lucide-react";
import { app } from "@/config/app";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDecks } from "@/data/store";
import { analyzeDeck } from "@/data/coaching";
import { DeckScoreRing } from "@/components/DeckScoreRing";

const PILLARS = [
  {
    icon: Target,
    title: "Structured like investors read",
    body: "Problem → solution → market → traction → team → the ask. The 11 slides every fundable deck has, in the order funders expect.",
  },
  {
    icon: Sparkles,
    title: "Coached, not just generated",
    body: "The Investor Lens flags a vague ask, thin traction, or a missing team story — the way a real advisor would, on every slide.",
  },
  {
    icon: TrendingUp,
    title: "A readiness score",
    body: "See how investor-ready your deck is at a glance, and exactly which slides to fix next before you send it.",
  },
];

export default function Home() {
  const decks = useDecks();
  const examples = decks.slice(0, 2);

  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> For founders raising capital
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          An investor-ready deck,
          <br />
          <span className="text-primary">and a coach to make it fundable.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{app.shortDescription}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/score" className={cn(buttonVariants({ size: "lg" }))}>
            Score my pitch — free <ArrowRight />
          </Link>
          <Link to="/new" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Build a full deck
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          30 seconds · no sign-up · see how investor-ready you are
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-xl border border-border bg-card p-6 shadow-card-sm">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl">See the coaching in action</h2>
          <Link to="/decks" className="text-sm font-medium text-primary hover:underline">
            All decks →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((d) => {
            const { score, summary } = analyzeDeck(d);
            return (
              <Link
                key={d.id}
                to={`/decks/${d.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card-sm transition-shadow hover:shadow-card-md"
              >
                <DeckScoreRing score={score} />
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg">{d.name}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
