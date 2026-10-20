"use client";

import { useId } from "react";
import { CalendarClock, Zap } from "lucide-react";
import type { RideType } from "@/features/booking/draft";
import { cn } from "@/lib/cn";
import type { StepProps } from "./types";

export function RideStep({ draft, change, t }: StepProps) {
  const name = useId();
  const options: Array<{ value: RideType; icon: typeof Zap; title: string; body: string }> = [
    { value: "now", icon: Zap, ...t.rideNow },
    { value: "scheduled", icon: CalendarClock, ...t.rideLater },
  ];

  return (
    <fieldset>
      <legend className="sr-only">{t.steps.ride.heading}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(({ value, icon: Icon, title, body }) => {
          const checked = draft.rideType === value;
          return (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-5 transition-[border-color,background-color] duration-150",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                checked ? "border-primary bg-primary-soft/50" : "border-border hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => change({ rideType: value }, ["date", "time"])}
                className="sr-only"
              />
              <span className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-lg [&_svg]:size-6",
                    checked ? "bg-accent text-accent-foreground" : "bg-surface-sunken text-foreground",
                  )}
                >
                  <Icon aria-hidden />
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "size-5 rounded-full border-2 transition-all",
                    checked ? "border-[6px] border-primary" : "border-border-strong",
                  )}
                />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-h5 font-bold text-foreground">{title}</span>
                <span className="text-sm text-muted-foreground">{body}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
