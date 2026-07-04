import type { ChartPoint } from "@/data/types";
import { cn } from "@/lib/utils";

/** A clean, responsive CSS bar chart (no dependency). Bars scale to the max. */
export function SlideChart({ data, className }: { data: ChartPoint[]; className?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex w-full items-end gap-3", className)}>
      {data.map((d, i) => {
        const pct = Math.max(4, (d.value / max) * 100);
        // Last bar highlighted (full gold); earlier bars a lighter gold.
        const emphasis = i === data.length - 1;
        return (
          <div key={`${d.label}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className={cn("w-full rounded-t-md transition-all", emphasis ? "bg-accent" : "bg-accent/45")}
              style={{ height: `${pct}%` }}
            />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
