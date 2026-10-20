import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const headingSizes = {
  display: "text-display font-extrabold",
  h1: "text-h1 font-bold",
  h2: "text-h2 font-bold",
  h3: "text-h3 font-semibold",
  h4: "text-h4 font-semibold",
  h5: "text-h5 font-semibold",
  h6: "text-h6 font-semibold",
} as const;

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level (h1–h6). Independent of visual size. */
  level?: HeadingLevel;
  size?: keyof typeof headingSizes;
}

export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn("text-foreground", headingSizes[size ?? (`h${level}` as const)], className)}
      {...props}
    />
  );
}

const textSizes = {
  lead: "text-lead",
  lg: "text-lg",
  md: "text-base",
  sm: "text-sm",
  xs: "text-xs",
} as const;

const tones = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-subtle-foreground",
  inverse: "text-surface-inverse-foreground",
  danger: "text-danger",
  success: "text-success",
} as const;

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: keyof typeof textSizes;
  tone?: keyof typeof tones;
  weight?: "regular" | "medium" | "semibold";
}

export function Text({
  as: Tag = "p",
  size = "md",
  tone = "default",
  weight = "regular",
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        textSizes[size],
        tones[tone],
        weight === "medium" && "font-medium",
        weight === "semibold" && "font-semibold",
        className,
      )}
      {...props}
    />
  );
}

/** Small uppercase label above a section heading. */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-overline font-bold uppercase text-accent-soft-foreground",
        "inline-flex items-center gap-2 before:h-px before:w-6 before:bg-accent",
        className,
      )}
      {...props}
    />
  );
}
