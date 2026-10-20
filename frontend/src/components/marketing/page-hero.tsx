import type { ReactNode } from "react";
import { RoutePattern } from "@/components/brand/route-pattern";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/cn";

/** Dark intro band used at the top of interior pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-surface-inverse text-white", className)}>
      <RoutePattern />
      <Container className="relative flex flex-col gap-4 py-14 sm:py-20 lg:py-24">
        <p className="text-overline font-bold uppercase text-accent">{eyebrow}</p>
        <h1 className="max-w-3xl animate-fade-up text-h1 font-bold text-white">{title}</h1>
        {subtitle && <p className="max-w-2xl text-lead text-white/75">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </Container>
    </section>
  );
}
