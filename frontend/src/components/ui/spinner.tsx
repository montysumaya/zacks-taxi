import { cn } from "@/lib/cn";

const sizes = { xs: "size-3.5", sm: "size-4", md: "size-5", lg: "size-8" } as const;

export interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
  /** Accessible label. Omit when the spinner is decorative (e.g. inside a labelled button). */
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", sizes[size], className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
