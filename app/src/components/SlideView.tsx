import type { Slide } from "@/data/types";
import { DECK_STRUCTURE } from "@/data/deckStructure";
import { SlideChart } from "./SlideChart";
import { cn } from "@/lib/utils";

// The rich, designed READ-ONLY slide renderer — used by Present + PDF export.
// Picks a distinct layout by slide type (or by whether an image/chart is present)
// so a deck reads as a designed pitch, not the same text box repeated.

function labelFor(slide: Slide): string {
  return DECK_STRUCTURE.find((s) => s.type === slide.type)?.label ?? slide.type;
}

type Layout = "cover" | "metricChart" | "split" | "image" | "default";

function layoutFor(slide: Slide): Layout {
  if (slide.type === "title") return "cover";
  if (slide.image) return "image";
  if (slide.chart && slide.chart.length > 0) return "metricChart";
  if (slide.type === "problem" || slide.type === "solution") return "split";
  return "default";
}

const Eyebrow = ({ children }: { children: string }) => (
  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
    <span className="h-1 w-8 rounded bg-accent" />
    {children}
  </div>
);

function Cover({ slide }: { slide: Slide }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-primary to-[hsl(232_54%_16%)] p-10 text-primary-foreground sm:p-16">
      {slide.image && (
        <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <div className="relative">
        <div className="mb-5 h-1.5 w-14 rounded bg-accent" />
        <h2 className="font-serif text-4xl font-semibold leading-[1.05] sm:text-6xl">{slide.title}</h2>
        <p className="mt-5 max-w-2xl text-lg leading-snug opacity-90 sm:text-2xl">{slide.body}</p>
      </div>
    </div>
  );
}

function MetricChart({ slide }: { slide: Slide }) {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-6 bg-card p-8 sm:p-12">
      <div className="flex flex-col justify-center">
        <Eyebrow>{labelFor(slide)}</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{slide.title}</h2>
        {slide.metric && (
          <div className="tnum mt-3 font-serif text-4xl font-bold text-accent sm:text-5xl">{slide.metric}</div>
        )}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 sm:text-base">
          {slide.body}
        </p>
      </div>
      <div className="flex items-center">
        {slide.chart && <SlideChart data={slide.chart} className="h-40 sm:h-56" />}
      </div>
    </div>
  );
}

function Split({ slide }: { slide: Slide }) {
  return (
    <div className="grid h-full w-full grid-cols-5 bg-card">
      <div className="col-span-2 flex flex-col justify-center bg-primary p-8 text-primary-foreground sm:p-10">
        <div className="mb-3 h-1 w-10 rounded bg-accent" />
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">{labelFor(slide)}</div>
        <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{slide.title}</h2>
      </div>
      <div className="col-span-3 flex flex-col justify-center p-8 sm:p-12">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/85 sm:text-lg">
          {slide.body}
        </p>
      </div>
    </div>
  );
}

function ImageForward({ slide }: { slide: Slide }) {
  return (
    <div className="grid h-full w-full grid-cols-2 bg-card">
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <Eyebrow>{labelFor(slide)}</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{slide.title}</h2>
        {slide.metric && (
          <div className="tnum mt-2 font-serif text-3xl font-bold text-accent">{slide.metric}</div>
        )}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 sm:text-base">
          {slide.body}
        </p>
      </div>
      <div className="relative bg-muted">
        {slide.image && <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      </div>
    </div>
  );
}

function Default({ slide }: { slide: Slide }) {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-card p-8 sm:p-14">
      <Eyebrow>{labelFor(slide)}</Eyebrow>
      <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-5xl">{slide.title}</h2>
      {slide.metric && (
        <div className="mt-3 flex items-baseline gap-3">
          <span className="tnum font-serif text-4xl font-bold text-accent sm:text-6xl">{slide.metric}</span>
          <span className="text-sm text-muted-foreground">{slide.metricLabel}</span>
        </div>
      )}
      <p className="mt-5 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-foreground/85 sm:text-lg">
        {slide.body}
      </p>
    </div>
  );
}

export function SlideView({ slide, className }: { slide: Slide; className?: string }) {
  const layout = layoutFor(slide);
  return (
    <div className={cn("relative aspect-[16/9] w-full overflow-hidden bg-card", className)}>
      {layout === "cover" && <Cover slide={slide} />}
      {layout === "metricChart" && <MetricChart slide={slide} />}
      {layout === "split" && <Split slide={slide} />}
      {layout === "image" && <ImageForward slide={slide} />}
      {layout === "default" && <Default slide={slide} />}
    </div>
  );
}
