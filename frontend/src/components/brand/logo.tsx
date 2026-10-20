import { cn } from "@/lib/cn";

/** Brand mark: a winding route between two stops, inside an amber tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9 shrink-0", className)}>
      <rect width="40" height="40" rx="11" fill="var(--accent)" />
      <path
        d="M11 28.5c0-5 4.2-6.5 9-6.5s9-1.5 9-6.5"
        fill="none"
        stroke="var(--palette-brand-950)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="28.5" r="3.4" fill="var(--palette-brand-950)" />
      <circle cx="29" cy="12" r="4.4" fill="var(--palette-brand-950)" />
      <circle cx="29" cy="12" r="1.7" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({
  name,
  tone = "default",
  className,
}: {
  name: string;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "text-[1.375rem] leading-none font-extrabold tracking-tight",
          tone === "inverse" ? "text-white" : "text-primary",
        )}
      >
        {name}
      </span>
    </span>
  );
}
