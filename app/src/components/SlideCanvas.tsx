import { Textarea } from "@/components/ui/textarea";
import { updateSlide } from "@/data/store";
import { DECK_STRUCTURE } from "@/data/deckStructure";
import type { Deck, Slide } from "@/data/types";

/** The editable slide surface — WYSIWYG-ish, styled like the final deck. */
export function SlideCanvas({ deck, slide }: { deck: Deck; slide: Slide }) {
  const spec = DECK_STRUCTURE.find((s) => s.type === slide.type);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card-md">
        <div className="flex min-h-[380px] flex-col p-8 sm:p-12">
          <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="h-1 w-8 rounded bg-accent" />
            {spec?.label}
          </div>

          <input
            value={slide.title}
            onChange={(e) => updateSlide(deck.id, slide.id, { title: e.target.value })}
            className="w-full bg-transparent font-serif text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60 sm:text-4xl"
            placeholder="Headline"
            aria-label="Slide headline"
          />

          {slide.metric !== undefined && (
            <div className="mt-5 flex items-baseline gap-3">
              <input
                value={slide.metric}
                onChange={(e) => updateSlide(deck.id, slide.id, { metric: e.target.value })}
                className="tnum w-44 max-w-full bg-transparent font-serif text-4xl font-bold text-accent outline-none placeholder:text-accent/40"
                placeholder="—"
                aria-label="Standout metric"
              />
              <span className="text-sm text-muted-foreground">{slide.metricLabel}</span>
            </div>
          )}

          <Textarea
            value={slide.body}
            onChange={(e) => updateSlide(deck.id, slide.id, { body: e.target.value })}
            className="mt-6 flex-1 resize-none border-0 bg-transparent px-0 py-0 text-base leading-relaxed shadow-none focus-visible:ring-0"
            placeholder="Write this slide…"
            aria-label="Slide content"
          />
        </div>
      </div>
      {spec && <p className="mt-3 text-center text-xs text-muted-foreground">{spec.purpose}</p>}
    </div>
  );
}
