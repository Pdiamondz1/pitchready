import { scoreBand, type Severity } from "@/data/coaching";
import { cn } from "@/lib/utils";

const BAND_COLOR: Record<Severity, string> = {
  strong: "text-success",
  warn: "text-accent",
  gap: "text-destructive",
};

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
}

/** A circular readiness-score gauge, colored by band (emerald / gold / red). */
export function DeckScoreRing({ score, size = 64, stroke = 6, className }: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circumference;
  const band = scoreBand(score);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn("transition-[stroke-dasharray] duration-700 ease-out", BAND_COLOR[band])}
        />
      </svg>
      <span
        className="tnum absolute font-serif font-semibold"
        style={{ fontSize: size * 0.28 }}
      >
        {Math.round(pct)}
      </span>
    </div>
  );
}
