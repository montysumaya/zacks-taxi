import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function IconTile({ children, tone = "brand", className }: { children: ReactNode; tone?: "brand" | "accent" | "inverse"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-lg [&_svg]:size-6",
        tone === "brand" && "bg-primary-soft text-primary-soft-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "inverse" && "bg-white/10 text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FeatureCard({
  icon,
  title,
  body,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card padding="lg" className={cn("flex flex-col gap-4", className)}>
      <IconTile>{icon}</IconTile>
      <div className="flex flex-col gap-2">
        <h3 className="text-h5 font-semibold text-foreground">{title}</h3>
        <p className="text-[0.9375rem] text-muted-foreground">{body}</p>
      </div>
      {children}
    </Card>
  );
}

export function CheckList({ items, tone = "default", className }: { items: string[]; tone?: "default" | "inverse"; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
              tone === "inverse" ? "bg-accent text-accent-foreground" : "bg-success-soft text-success",
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className={cn("text-[0.9375rem]", tone === "inverse" ? "text-white/85" : "text-foreground")}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
