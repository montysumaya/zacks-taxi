import type { ReactNode } from "react";
import { RoutePattern } from "@/components/brand/route-pattern";
import { Container } from "@/components/ui/layout";

export function CtaBand({ title, body, actions }: { title: string; body: string; actions: ReactNode }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-2xl bg-surface-inverse px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
          <RoutePattern />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 className="text-h2 font-bold text-white">{title}</h2>
              <p className="text-lead text-white/75">{body}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
