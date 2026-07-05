import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Trash2, LayoutTemplate } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { updateSlide } from "@/data/store";
import { DECK_STRUCTURE, isPlaceholder, templateFor } from "@/data/deckStructure";
import { fileToResizedDataUrl } from "@/lib/image";
import type { Deck, Slide } from "@/data/types";

/** The editable slide surface — content editing + an optional image. */
export function SlideCanvas({ deck, slide }: { deck: Deck; slide: Slide }) {
  const spec = DECK_STRUCTURE.find((s) => s.type === slide.type);
  const template = templateFor(slide.type);
  const canFill = (slide.body.trim() === "" || isPlaceholder(slide.body)) && !!template;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await fileToResizedDataUrl(file);
      updateSlide(deck.id, slide.id, { image: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that image.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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

          {slide.image && (
            <img
              src={slide.image}
              alt="This slide"
              className="mt-4 max-h-40 self-start rounded-lg border border-border object-contain"
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {canFill && template && (
          <button
            type="button"
            onClick={() => updateSlide(deck.id, slide.id, { body: template })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LayoutTemplate className="h-3.5 w-3.5" /> Fill template
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
          aria-label="Upload an image for this slide"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {busy ? "Adding…" : slide.image ? "Replace image" : "Add image"}
        </button>
        {slide.image && (
          <button
            type="button"
            onClick={() => updateSlide(deck.id, slide.id, { image: undefined })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
      {spec && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {spec.purpose} · images show in Present &amp; PDF
        </p>
      )}
    </div>
  );
}
