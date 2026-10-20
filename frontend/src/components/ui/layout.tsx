import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const containerSizes = {
  page: "max-w-(--container-page)",
  content: "max-w-(--container-content)",
  prose: "max-w-(--container-prose)",
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: keyof typeof containerSizes;
}

/** Horizontally centered, responsive gutters. */
export function Container({ as: Tag = "div", size = "page", className, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)}
      {...props}
    />
  );
}

const sectionSpacing = {
  sm: "py-10 sm:py-14",
  md: "py-16 sm:py-20 lg:py-24",
  lg: "py-20 sm:py-28 lg:py-32",
} as const;

const sectionTones = {
  default: "",
  muted: "bg-surface-muted",
  surface: "bg-surface",
  inverse: "bg-surface-inverse text-surface-inverse-foreground",
} as const;

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: keyof typeof sectionSpacing;
  tone?: keyof typeof sectionTones;
}

/** Vertical rhythm for page sections. */
export function Section({ spacing = "md", tone = "default", className, ...props }: SectionProps) {
  return <section className={cn(sectionSpacing[spacing], sectionTones[tone], className)} {...props} />;
}

const gaps = { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8", 10: "gap-10", 12: "gap-12" } as const;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  gap?: keyof typeof gaps;
  direction?: "col" | "row" | "responsive";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}

/** Flex stack. `direction="responsive"` stacks on mobile and goes horizontal from `sm`. */
export function Stack({
  as: Tag = "div",
  gap = 4,
  direction = "col",
  align,
  justify,
  wrap,
  className,
  ...props
}: StackProps) {
  return (
    <Tag
      className={cn(
        "flex",
        direction === "col" && "flex-col",
        direction === "row" && "flex-row",
        direction === "responsive" && "flex-col sm:flex-row",
        gaps[gap],
        align && { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" }[align],
        justify && { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" }[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Columns at the widest breakpoint; collapses responsively. */
  cols?: keyof typeof gridCols;
  gap?: keyof typeof gaps;
}

export function Grid({ as: Tag = "div", cols = 3, gap = 6, className, ...props }: GridProps) {
  return <Tag className={cn("grid", gridCols[cols], gaps[gap], className)} {...props} />;
}

/** Centered section intro: eyebrow, heading and supporting copy. */
export function SectionHeader({
  className,
  align = "center",
  ...props
}: HTMLAttributes<HTMLDivElement> & { align?: "center" | "start" }) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
      {...props}
    />
  );
}
