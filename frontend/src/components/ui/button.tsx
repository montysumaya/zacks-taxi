import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active",
  accent:
    "bg-accent text-accent-foreground shadow-xs hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "bg-surface text-foreground border border-border-strong shadow-xs hover:bg-surface-muted hover:border-input active:bg-surface-sunken",
  soft: "bg-primary-soft text-primary-soft-foreground hover:bg-brand-100 active:bg-brand-200",
  ghost: "text-foreground hover:bg-surface-sunken active:bg-border",
  danger: "bg-danger text-white shadow-xs hover:bg-danger-hover",
  inverse:
    "bg-white/10 text-white border border-white/20 hover:bg-white/15 active:bg-white/20 backdrop-blur",
  link: "text-primary-soft-foreground underline-offset-4 hover:underline px-0! h-auto!",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-sm [&_svg]:size-4",
  md: "h-11 px-5 text-[0.9375rem] gap-2 rounded-control [&_svg]:size-[1.125rem]",
  lg: "h-13 px-7 text-base gap-2.5 rounded-control [&_svg]:size-5",
  "icon-sm": "size-9 rounded-sm [&_svg]:size-4",
  icon: "size-11 rounded-control [&_svg]:size-5",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Button classes, for styling links (`<Link className={buttonStyles(...)} />`) as buttons. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth,
}: ButtonStyleProps = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-soft",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {
  /** Shows a spinner, keeps the width stable and blocks interaction. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), "relative", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size="sm" />
        </span>
      )}
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>
        {children}
      </span>
    </button>
  );
}
