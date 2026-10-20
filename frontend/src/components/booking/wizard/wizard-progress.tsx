"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { stepIndex, wizardSteps, type WizardStep } from "@/features/booking/draft";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";

/**
 * Desktop: numbered stepper (completed steps are clickable to go back).
 * Mobile: "Step 2 of 6" with a progress bar.
 */
export function WizardProgress({ current, onSelect }: { current: WizardStep; onSelect: (step: WizardStep) => void }) {
  const { dict } = useI18n();
  const t = dict.bookingFlow;
  const index = stepIndex(current);
  const total = wizardSteps.length;

  return (
    <nav aria-label={t.progressLabel}>
      <div className="md:hidden">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-foreground">{t.steps[current].label}</span>
          <span className="text-muted-foreground">{interpolate(t.stepOf, { current: index + 1, total })}</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-valuetext={interpolate(t.stepOf, { current: index + 1, total })}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out-soft"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center gap-2 md:flex">
        {wizardSteps.map((step, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={!done}
                onClick={() => onSelect(step)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-full py-1 pe-2 text-start text-sm font-semibold whitespace-nowrap transition-colors",
                  done ? "cursor-pointer text-foreground hover:text-primary-soft-foreground" : "cursor-default",
                  active ? "text-foreground" : !done && "text-subtle-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-accent text-accent-foreground ring-4 ring-accent/25",
                    !done && !active && "bg-surface-sunken text-subtle-foreground",
                  )}
                >
                  {done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden lg:inline">{t.steps[step].label}</span>
                <span className="sr-only lg:hidden">{t.steps[step].label}</span>
              </button>
              {i < total - 1 && (
                <span aria-hidden className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
