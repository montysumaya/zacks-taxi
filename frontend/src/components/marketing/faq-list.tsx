import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** Accordion built on <details>: keyboard and screen-reader support with no JS. */
export function FaqList({ items, className }: { items: Array<{ q: string; a: string }>; className?: string }) {
  return (
    <div className={cn("divide-y divide-border rounded-card border border-border bg-surface shadow-card", className)}>
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start font-semibold text-foreground transition-colors hover:bg-surface-muted sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-sunken text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:bg-accent group-open:text-accent-foreground"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="px-5 pb-5 text-[0.9375rem] text-muted-foreground sm:px-6">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
