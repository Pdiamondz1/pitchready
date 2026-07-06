import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Boxes,
  Globe,
  DollarSign,
  TrendingUp,
  Swords,
  Users,
  Rocket,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { Slide, SlideType } from "@/data/types";
import { DECK_STRUCTURE } from "@/data/deckStructure";
import { SlideChart } from "./SlideChart";
import { app } from "@/config/app";
import { cn } from "@/lib/utils";

// Bold, designed READ-ONLY slide renderer (Present + PDF). Each slide type gets a
// colored surface (dark / indigo / tinted / light) for rhythm, an icon, a distinct
// layout, and a footer. Responsive: fixed 16:9 on sm+, grows to fit on phones.

type Surface = "light" | "tint" | "ink" | "gradient";

const SURFACE: Record<Surface, { bg: string; onDark: boolean }> = {
  light: { bg: "bg-card", onDark: false },
  tint: { bg: "bg-[hsl(264_44%_97%)]", onDark: false },
  ink: { bg: "bg-[hsl(262_48%_14%)]", onDark: true },
  gradient: { bg: "bg-gradient-to-br from-primary to-[hsl(262_55%_11%)]", onDark: true },
};

const SLIDE_SURFACE: Record<SlideType, Surface> = {
  title: "gradient",
  problem: "ink",
  solution: "light",
  product: "tint",
  market: "light",
  businessModel: "tint",
  traction: "ink",
  competition: "light",
  team: "tint",
  ask: "gradient",
  contact: "gradient",
};

const ICON: Record<SlideType, LucideIcon> = {
  title: Sparkles,
  problem: AlertTriangle,
  solution: Lightbulb,
  product: Boxes,
  market: Globe,
  businessModel: DollarSign,
  traction: TrendingUp,
  competition: Swords,
  team: Users,
  ask: Rocket,
  contact: Mail,
};

function labelFor(slide: Slide): string {
  return DECK_STRUCTURE.find((s) => s.type === slide.type)?.label ?? slide.type;
}

function text(onDark: boolean) {
  return {
    head: onDark ? "text-white" : "text-foreground",
    body: onDark ? "text-white/85" : "text-foreground/80",
    eyebrow: onDark ? "text-white/60" : "text-muted-foreground",
    chipBg: onDark ? "bg-white/10 text-accent" : "bg-primary/10 text-primary",
    cardBorder: onDark ? "border-white/15 bg-white/5" : "border-border bg-card",
  };
}

function Eyebrow({ icon: Icon, label, onDark }: { icon: LucideIcon; label: string; onDark: boolean }) {
  const t = text(onDark);
  return (
    <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", t.eyebrow)}>
      <span className={cn("grid h-6 w-6 place-items-center rounded-md", t.chipBg)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </div>
  );
}

function Footer({ index, total, onDark }: { index?: number; total?: number; onDark: boolean }) {
  if (typeof index !== "number") return null;
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-2.5 text-[10px] font-medium uppercase tracking-wider sm:px-12 sm:py-3.5",
        onDark ? "text-white/45" : "text-muted-foreground/70"
      )}
    >
      <span className="font-serif text-xs normal-case tracking-normal">{app.name}</span>
      {typeof total === "number" && (
        <span className="tnum">
          {index + 1} / {total}
        </span>
      )}
    </div>
  );
}

const PAD = "p-6 pb-12 sm:p-12 sm:pb-16";

function Hero({ slide, icon }: { slide: Slide; icon: LucideIcon }) {
  const Icon = icon;
  return (
    <div className={cn("relative flex h-full w-full flex-col justify-center", PAD, "sm:p-16")}>
      {slide.image && <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
      <div className="relative">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
          <Icon className="h-3.5 w-3.5 text-accent" />
          {labelFor(slide)}
        </span>
        <h2 className="font-serif text-4xl font-semibold leading-[1.05] text-white sm:text-6xl">{slide.title}</h2>
        <p className="mt-4 max-w-2xl whitespace-pre-wrap text-base leading-snug text-white/90 sm:text-2xl">
          {slide.body}
        </p>
      </div>
    </div>
  );
}

function Statement({ slide, icon }: { slide: Slide; icon: LucideIcon }) {
  const Icon = icon;
  const t = text(true);
  return (
    <div className={cn("flex h-full w-full flex-col justify-center", PAD, "sm:p-14")}>
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
        <Icon className="h-6 w-6" />
      </span>
      <div className={cn("text-xs font-semibold uppercase tracking-wider", t.eyebrow)}>{labelFor(slide)}</div>
      <h2 className={cn("mt-2 font-serif text-3xl font-semibold leading-tight sm:text-5xl", t.head)}>{slide.title}</h2>
      <p className={cn("mt-5 max-w-3xl whitespace-pre-wrap text-base leading-relaxed sm:text-xl", t.body)}>
        {slide.body}
      </p>
    </div>
  );
}

function Split({ slide, icon }: { slide: Slide; icon: LucideIcon }) {
  const Icon = icon;
  return (
    <div className="grid h-full w-full grid-cols-1 sm:grid-cols-5">
      <div className="flex flex-col justify-center bg-primary p-6 text-white sm:col-span-2 sm:p-10">
        <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/70">{labelFor(slide)}</div>
        <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-4xl">{slide.title}</h2>
      </div>
      <div className={cn("flex flex-col justify-center sm:col-span-3", PAD, "sm:p-12")}>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/85 sm:text-lg">{slide.body}</p>
      </div>
    </div>
  );
}

function MetricChart({ slide, icon, onDark }: { slide: Slide; icon: LucideIcon; onDark: boolean }) {
  const t = text(onDark);
  return (
    <div className={cn("grid h-full w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6", PAD, "sm:p-12")}>
      <div className="flex flex-col justify-center">
        <Eyebrow icon={icon} label={labelFor(slide)} onDark={onDark} />
        <h2 className={cn("mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-4xl", t.head)}>
          {slide.title}
        </h2>
        {slide.metric && (
          <div className="tnum mt-2 font-serif text-3xl font-bold text-accent sm:mt-3 sm:text-5xl">{slide.metric}</div>
        )}
        <p className={cn("mt-3 whitespace-pre-wrap text-sm leading-relaxed sm:mt-4 sm:text-base", t.body)}>
          {slide.body}
        </p>
      </div>
      <div className="flex items-end sm:items-center">
        {slide.chart && <SlideChart data={slide.chart} onDark={onDark} className="h-32 sm:h-56" />}
      </div>
    </div>
  );
}

function Cards({ slide, icon, onDark }: { slide: Slide; icon: LucideIcon; onDark: boolean }) {
  const t = text(onDark);
  const items = slide.body
    .split(/\n|·|;/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
  return (
    <div className={cn("flex h-full w-full flex-col justify-center", PAD, "sm:p-12")}>
      <Eyebrow icon={icon} label={labelFor(slide)} onDark={onDark} />
      <h2 className={cn("mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-4xl", t.head)}>{slide.title}</h2>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={i} className={cn("rounded-lg border p-4", t.cardBorder)}>
            <div className="mb-1 h-1 w-6 rounded bg-accent" />
            <p className={cn("text-sm leading-snug", t.body)}>{it}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Team({ slide, icon, onDark }: { slide: Slide; icon: LucideIcon; onDark: boolean }) {
  const t = text(onDark);
  const people = slide.body
    .split(/\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const showCards = people.length >= 2;
  const initials = (line: string) =>
    (line.replace(/^[[(]/, "").trim().slice(0, 2) || "?").toUpperCase();
  return (
    <div className={cn("flex h-full w-full flex-col justify-center", PAD, "sm:p-12")}>
      <Eyebrow icon={icon} label={labelFor(slide)} onDark={onDark} />
      <h2 className={cn("mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-4xl", t.head)}>{slide.title}</h2>
      {showCards ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {people.slice(0, 4).map((p, i) => (
            <div key={i} className={cn("flex items-start gap-3 rounded-lg border p-4", t.cardBorder)}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-serif text-sm font-semibold text-white">
                {initials(p)}
              </span>
              <p className={cn("text-sm leading-snug", t.body)}>{p}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={cn("mt-4 max-w-3xl whitespace-pre-wrap text-base leading-relaxed sm:text-lg", t.body)}>
          {slide.body}
        </p>
      )}
    </div>
  );
}

function ImageForward({ slide, icon }: { slide: Slide; icon: LucideIcon }) {
  const t = text(false);
  return (
    <div className="grid h-full w-full grid-cols-1 sm:grid-cols-2">
      <div className={cn("order-2 flex flex-col justify-center sm:order-1", PAD, "sm:p-12")}>
        <Eyebrow icon={icon} label={labelFor(slide)} onDark={false} />
        <h2 className={cn("mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-4xl", t.head)}>{slide.title}</h2>
        {slide.metric && <div className="tnum mt-2 font-serif text-2xl font-bold text-accent sm:text-3xl">{slide.metric}</div>}
        <p className={cn("mt-3 whitespace-pre-wrap text-sm leading-relaxed sm:mt-4 sm:text-base", t.body)}>{slide.body}</p>
      </div>
      <div className="relative order-1 min-h-[10rem] bg-muted sm:order-2 sm:min-h-0">
        {slide.image && <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      </div>
    </div>
  );
}

function Default({ slide, icon, onDark }: { slide: Slide; icon: LucideIcon; onDark: boolean }) {
  const t = text(onDark);
  return (
    <div className={cn("flex h-full w-full flex-col justify-center", PAD, "sm:p-14")}>
      <Eyebrow icon={icon} label={labelFor(slide)} onDark={onDark} />
      <h2 className={cn("mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-5xl", t.head)}>{slide.title}</h2>
      {slide.metric && (
        <div className="mt-3 flex items-baseline gap-3">
          <span className="tnum font-serif text-4xl font-bold text-accent sm:text-6xl">{slide.metric}</span>
          <span className={t.eyebrow}>{slide.metricLabel}</span>
        </div>
      )}
      <p className={cn("mt-5 max-w-3xl whitespace-pre-wrap text-base leading-relaxed sm:text-lg", t.body)}>
        {slide.body}
      </p>
    </div>
  );
}

interface Props {
  slide: Slide;
  index?: number;
  total?: number;
  className?: string;
}

export function SlideView({ slide, index, total, className }: Props) {
  const isHero = slide.type === "title" || slide.type === "contact";
  const surfaceKey: Surface = isHero ? SLIDE_SURFACE[slide.type] : slide.image ? "light" : SLIDE_SURFACE[slide.type];
  const surface = SURFACE[surfaceKey];
  const icon = ICON[slide.type] ?? Sparkles;

  let content;
  if (isHero) content = <Hero slide={slide} icon={icon} />;
  else if (slide.image) content = <ImageForward slide={slide} icon={icon} />;
  else if (slide.type === "problem") content = <Statement slide={slide} icon={icon} />;
  else if (slide.type === "solution") content = <Split slide={slide} icon={icon} />;
  else if (slide.chart && slide.chart.length > 0)
    content = <MetricChart slide={slide} icon={icon} onDark={surface.onDark} />;
  else if (slide.type === "businessModel" || slide.type === "competition")
    content = <Cards slide={slide} icon={icon} onDark={surface.onDark} />;
  else if (slide.type === "team") content = <Team slide={slide} icon={icon} onDark={surface.onDark} />;
  else content = <Default slide={slide} icon={icon} onDark={surface.onDark} />;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden min-h-[13rem] sm:min-h-0 sm:aspect-[16/9]",
        surface.bg,
        className
      )}
    >
      {content}
      <Footer index={index} total={total} onDark={surface.onDark} />
    </div>
  );
}
