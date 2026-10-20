"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { localize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { outlinePoints, project, SCHEMATIC } from "@/lib/schematic-map";
import type { Place } from "@/types";

/**
 * Schematic route preview — no map provider, no tiles. Swap for a real map
 * component once a provider is chosen.
 */
const WIDTH = SCHEMATIC.width;
const HEIGHT = SCHEMATIC.height;

export function RouteMapPreview({
  pickup,
  dropoff,
  title,
  caption,
  emptyLabel,
  className,
}: {
  pickup: Place | null;
  dropoff: Place | null;
  title: string;
  caption: string;
  emptyLabel: string;
  className?: string;
}) {
  const { locale } = useI18n();
  const outline = outlinePoints;
  const a = pickup ? project(pickup.location) : null;
  const b = dropoff ? project(dropoff.location) : null;
  // Gentle curve between the two points, bowed towards the sea (west).
  const curve =
    a && b ? `M${a.x},${a.y} Q${Math.min(a.x, b.x) - 30},${(a.y + b.y) / 2} ${b.x},${b.y}` : null;
  const label = [pickup, dropoff].filter(Boolean).map((p) => localize(p!.name, locale)).join(" → ");

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="relative overflow-hidden rounded-lg border border-border bg-brand-50">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={label ? `${title}: ${label}` : `${title}: ${emptyLabel}`}
          className="block h-56 w-full sm:h-64"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width={WIDTH} height={HEIGHT} fill="var(--palette-brand-100)" opacity="0.55" />
          <polygon points={outline} fill="var(--surface)" stroke="var(--palette-brand-200)" strokeWidth="1.5" strokeLinejoin="round" />
          {curve && (
            <>
              <path d={curve} fill="none" stroke="var(--palette-brand-900)" strokeOpacity="0.15" strokeWidth="7" strokeLinecap="round" />
              <path d={curve} fill="none" stroke="var(--palette-brand-900)" strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" />
            </>
          )}
          {a && (
            <g transform={`translate(${a.x} ${a.y})`}>
              <circle r="9" fill="var(--palette-brand-900)" opacity="0.15" />
              <circle r="5" fill="var(--palette-brand-900)" stroke="white" strokeWidth="2" />
            </g>
          )}
          {b && (
            <g transform={`translate(${b.x} ${b.y})`}>
              <path d="M0 0 C -7 -9 -7 -17 0 -19 C 7 -17 7 -9 0 0Z" fill="var(--accent-active)" stroke="var(--palette-brand-950)" strokeWidth="1.2" />
              <circle cy="-13" r="2.5" fill="var(--palette-brand-950)" />
            </g>
          )}
        </svg>
        {!a && !b && (
          <p className="absolute inset-x-4 bottom-4 rounded-md bg-surface/90 px-3 py-2 text-center text-xs text-muted-foreground shadow-sm">
            {emptyLabel}
          </p>
        )}
      </div>
      <figcaption className="text-xs text-subtle-foreground">{caption}</figcaption>
    </figure>
  );
}
