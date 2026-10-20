"use client";

import { useState } from "react";
import { ChartTable } from "./chart-table";
import { niceMax, type Datum } from "./column-chart";

/**
 * Single-series line + 10% area wash. The SVG scales to its box with a
 * non-scaling 2px stroke; labels, crosshair and tooltip are HTML so text never
 * stretches. Mirrors in RTL so time flows with the reading direction.
 */
export function LineChart({
  data,
  format,
  tableColumns,
  height = 200,
  labelEvery = 1,
}: {
  data: Datum[];
  format: (value: number) => string;
  tableColumns: [string, string];
  height?: number;
  labelEvery?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const x = (i: number) => (data.length === 1 ? 50 : (i / (data.length - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 100;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;
  const point = active !== null ? data[active] : null;

  return (
    <figure className="flex flex-col">
      <div className="flex gap-2" style={{ height }}>
        <div className="relative w-12 shrink-0 text-end text-[0.6875rem] text-subtle-foreground tabular-nums" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="absolute end-0" style={{ bottom: `${(tick / max) * 100}%`, transform: "translateY(50%)" }}>
              {format(tick)}
            </span>
          ))}
        </div>
        <div className="relative flex-1" onMouseLeave={() => setActive(null)}>
          {ticks.map((tick) => (
            <div key={tick} aria-hidden className="absolute inset-x-0 h-px bg-chart-grid" style={{ bottom: `${(tick / max) * 100}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full overflow-visible rtl:-scale-x-100">
            <path d={area} fill="var(--chart-1)" fillOpacity="0.1" />
            <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* End marker */}
          {data.length > 0 && (
            <span
              aria-hidden
              className="absolute size-2.5 -translate-y-1/2 rounded-full bg-chart-1 ring-2 ring-surface ltr:-translate-x-1/2 rtl:translate-x-1/2"
              style={{ insetInlineStart: `${x(data.length - 1)}%`, top: `${y(data.at(-1)!.value)}%` }}
            />
          )}
          {/* Crosshair + hover targets */}
          {point && active !== null && (
            <>
              <span aria-hidden className="absolute inset-y-0 w-px bg-border-strong" style={{ insetInlineStart: `${x(active)}%` }} />
              <span
                aria-hidden
                className="absolute size-3 -translate-y-1/2 rounded-full bg-chart-1 ring-2 ring-surface ltr:-translate-x-1/2 rtl:translate-x-1/2"
                style={{ insetInlineStart: `${x(active)}%`, top: `${y(point.value)}%` }}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute z-10 flex min-w-max -translate-y-full flex-col rounded-md bg-surface-inverse px-2.5 py-1.5 text-xs text-white shadow-lg ltr:-translate-x-1/2 rtl:translate-x-1/2"
                style={{ insetInlineStart: `${x(active)}%`, top: `calc(${y(point.value)}% - 10px)` }}
              >
                <span className="text-white/70">{point.fullLabel}</span>
                <span className="font-semibold tabular-nums">{format(point.value)}</span>
              </span>
            </>
          )}
          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <button
                key={d.fullLabel}
                type="button"
                className="h-full flex-1 cursor-default focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`${d.fullLabel}: ${format(d.value)}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative ms-14 mt-1.5 h-4 text-[0.6875rem] text-subtle-foreground" aria-hidden>
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <span key={d.fullLabel} className="absolute whitespace-nowrap ltr:-translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${x(i)}%` }}>
              {d.label}
            </span>
          ) : null,
        )}
      </div>
      <ChartTable columns={tableColumns} rows={data.map((d) => [d.fullLabel, format(d.value)])} />
    </figure>
  );
}
