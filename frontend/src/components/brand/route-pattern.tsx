import { useId } from "react";
import { cn } from "@/lib/cn";

/** Decorative background: faint road grid with an amber route. Mirrors in RTL. */
export function RoutePattern({ className }: { className?: string }) {
  const id = `route${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const grid = `${id}-grid`;
  const glow = `${id}-glow`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 size-full rtl:-scale-x-100", className)}
    >
      <defs>
        <pattern id={grid} width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="white" strokeOpacity="0.05" />
        </pattern>
        <radialGradient id={glow} cx="78%" cy="20%" r="60%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${grid})`} />
      <rect width="800" height="600" fill={`url(#${glow})`} />
      <path
        d="M-20 520 C 160 500, 180 380, 320 360 S 520 300, 560 200 S 700 80, 840 60"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <circle cx="320" cy="360" r="5" fill="var(--accent)" fillOpacity="0.6" />
      <circle cx="560" cy="200" r="5" fill="var(--accent)" fillOpacity="0.6" />
    </svg>
  );
}
