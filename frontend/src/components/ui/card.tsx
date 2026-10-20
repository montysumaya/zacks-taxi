import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  elevated: "bg-surface border border-border/70 shadow-card",
  outline: "bg-surface border border-border",
  muted: "bg-surface-muted border border-transparent",
  inverse: "bg-surface-inverse text-surface-inverse-foreground border border-white/10",
} as const;

const paddings = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" } as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  /** Lift on hover — for cards that are clickable as a whole. */
  interactive?: boolean;
}

export function Card({
  variant = "elevated",
  padding = "md",
  interactive,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card",
        variants[variant],
        paddings[padding],
        interactive &&
          "transition-[box-shadow,transform,border-color] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-card-hover hover:border-border",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h5 font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-5 flex items-center gap-3 border-t border-border pt-4", className)}
      {...props}
    />
  );
}
