import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("ui-skeleton animate-shimmer rounded-sm", className)}
      {...props}
    />
  );
}

/** Multi-line paragraph placeholder; the last line is shorter. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/** Centered spinner for a page or section that is loading. */
export function PageLoader({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
    >
      <Spinner size="lg" className="text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
