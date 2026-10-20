import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-surface-sunken text-muted-foreground before:bg-subtle-foreground",
  brand: "bg-primary-soft text-primary-soft-foreground before:bg-brand-500",
  accent: "bg-accent-soft text-accent-soft-foreground before:bg-accent-active",
  success: "bg-success-soft text-success-soft-foreground before:bg-success",
  warning: "bg-warning-soft text-warning-soft-foreground before:bg-warning",
  danger: "bg-danger-soft text-danger-soft-foreground before:bg-danger",
  info: "bg-info-soft text-info-soft-foreground before:bg-info",
  solid: "bg-primary text-primary-foreground before:bg-accent",
} as const;

export type BadgeTone = keyof typeof tones;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  /** Leading status dot. */
  dot?: boolean;
}

export function Badge({ tone = "neutral", size = "md", dot, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap [&_svg]:size-3.5",
        size === "sm" ? "h-6 px-2 text-xs" : "h-7 px-2.5 text-[0.8125rem]",
        tones[tone],
        dot ? "before:size-1.5 before:rounded-full" : "before:hidden",
        className,
      )}
      {...props}
    />
  );
}
