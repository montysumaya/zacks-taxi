"use client";

import { cn } from "@/lib/cn";
import { ChartTable } from "./chart-table";

export interface Datum {
  /** Short axis label, e.g. "Mon 14". */
  label: string;
  /** Full label for tooltip and table, e.g. "Monday 14 October". */
  fullLabel: string;
  value: number;
}

export function niceMax(max: number) {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s * 4 >= max) ?? magnitude * 10;
  return step * 4;
}

/**
 * Single-series column chart (one hue, no legend — the title names the series).
 * Columns ≤ 24px with 4px rounded data ends; hover/focus shows a tooltip.
 */
export function ColumnChart({
  data,
  format,
  tableColumns,
  highlightLast,
  height = 200,
  labelEvery = 1,
}: {
  data: Datum[];
  format: (value: number) => string;
  tableColumns: [string, string];
  highlightLast?: boolean;
  height?: number;
  labelEvery?: number;
}) {
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <figure className="flex flex-col">
      <div className="flex gap-2" style={{ height }}>
        <div className="relative w-10 shrink-0 text-end text-[0.6875rem] text-subtle-foreground tabular-nums" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="absolute end-0" style={{ bottom: `${(tick / max) * 100}%`, transform: "translateY(50%)" }}>
              {format(tick)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((tick) => (
            <div key={tick} aria-hidden className="absolute inset-x-0 h-px bg-chart-grid" style={{ bottom: `${(tick / max) * 100}%` }} />
          ))}
          <ul className="absolute inset-0 flex items-end gap-px">
            {data.map((d, i) => {
              const last = highlightLast && i === data.length - 1;
              return (
                <li key={d.fullLabel} className="group relative flex h-full flex-1 items-end justify-center">
                  <button
                    type="button"
                    className="absolute inset-0 cursor-default rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                    aria-label={`${d.fullLabel}: ${format(d.value)}`}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none w-full max-w-6 rounded-t-[4px] transition-opacity",
                      last ? "bg-chart-1" : "bg-chart-1/55",
                      "group-hover:bg-chart-1 group-focus-within:bg-chart-1",
                    )}
                    style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-10 mb-1 hidden min-w-max -translate-y-1 flex-col rounded-md bg-surface-inverse px-2.5 py-1.5 text-xs text-white shadow-lg group-focus-within:flex group-hover:flex"
                    style={{ bottom: `${(d.value / max) * 100}%` }}
                  >
                    <span className="text-white/70">{d.fullLabel}</span>
                    <span className="font-semibold tabular-nums">{format(d.value)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="ms-12 mt-1.5 flex gap-px text-[0.6875rem] text-subtle-foreground" aria-hidden>
        {data.map((d, i) => (
          <span key={d.fullLabel} className="flex-1 truncate text-center">
            {i % labelEvery === 0 || i === data.length - 1 ? d.label : ""}
          </span>
        ))}
      </div>
      <ChartTable columns={tableColumns} rows={data.map((d) => [d.fullLabel, format(d.value)])} />
    </figure>
  );
}
