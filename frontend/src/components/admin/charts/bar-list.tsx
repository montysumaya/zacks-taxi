"use client";

import { cn } from "@/lib/cn";
import { ChartTable } from "./chart-table";

/**
 * Horizontal labelled bars (ranking / meter). Values are direct-labelled, so no
 * legend is needed; the track is a lighter step of the same hue.
 */
export function BarList({
  items,
  format,
  max,
  tableColumns,
  tone = "chart-1",
}: {
  items: Array<{ label: string; value: number; hint?: string }>;
  format: (value: number) => string;
  /** Scale maximum; defaults to the largest value (use 100 for percentages). */
  max?: number;
  tableColumns: [string, string];
  tone?: "chart-1" | "chart-2" | "chart-3";
}) {
  const scale = max ?? Math.max(...items.map((i) => i.value), 1);
  const fill = { "chart-1": "bg-chart-1", "chart-2": "bg-chart-2", "chart-3": "bg-chart-3" }[tone];
  const track = { "chart-1": "bg-chart-1/12", "chart-2": "bg-chart-2/12", "chart-3": "bg-chart-3/12" }[tone];

  return (
    <figure>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-foreground">
                {item.label}
                {item.hint && <span className="ms-1.5 text-xs text-subtle-foreground">{item.hint}</span>}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{format(item.value)}</span>
            </div>
            <div className={cn("h-2 overflow-hidden rounded-full", track)} aria-hidden>
              <div className={cn("h-full rounded-full", fill)} style={{ width: `${Math.min(100, (item.value / scale) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <ChartTable columns={tableColumns} rows={items.map((i) => [i.label, format(i.value)])} />
    </figure>
  );
}
