"use client";

import { cn } from "@/lib/cn";

/**
 * 100% stacked bar for a part-to-whole state breakdown. Segments are separated
 * by a 2px surface gap; the legend (label + count) carries identity, so
 * color is never the only channel.
 */
export function StackedBar({
  segments,
  label,
}: {
  segments: Array<{ key: string; label: string; value: number; className: string }>;
  label: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <figure className="flex flex-col gap-4">
      <div role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`} className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-surface">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.key} className={cn("h-full first:rounded-s-full last:rounded-e-full", s.className)} style={{ width: `${(s.value / total) * 100}%` }} />
          ))}
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {segments.map((s) => (
          <li key={s.key} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden className={cn("size-2.5 rounded-sm", s.className)} />
              {s.label}
            </span>
            <span className="text-h4 font-bold tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
