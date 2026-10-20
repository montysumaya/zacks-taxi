"use client";

import { useId } from "react";
import { Luggage, Users } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { VehicleClass, VehicleClassSummary } from "@/types";
import { VehicleIcon } from "./vehicle-icon";

/** Radio-card picker for vehicle categories, aware of group size. */
export function VehicleClassPicker({
  legend,
  classes,
  value,
  onChange,
  passengers,
  luggage,
  error,
  tooSmallLabel,
}: {
  legend: string;
  classes: VehicleClassSummary[];
  value: VehicleClass | null;
  onChange: (value: VehicleClass) => void;
  passengers: number;
  luggage: number;
  error?: string;
  tooSmallLabel: string;
}) {
  const { locale, dict } = useI18n();
  const name = useId();
  const errorId = `${name}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} data-invalid={error ? true : undefined} className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-semibold text-foreground">
        {legend}
        <span aria-hidden className="ms-0.5 text-danger">*</span>
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {classes.map((c) => {
          const fits = c.seats >= passengers && c.luggageCapacity >= luggage;
          const checked = value === c.vehicleClass;
          return (
            <label
              key={c.vehicleClass}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-[border-color,background-color,box-shadow] duration-150",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                checked ? "border-primary bg-primary-soft/60 ring-1 ring-primary" : "border-border hover:border-border-strong",
                !fits && "opacity-55",
                error && !checked && "border-danger/50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={c.vehicleClass}
                checked={checked}
                onChange={() => onChange(c.vehicleClass)}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-md",
                  checked ? "bg-primary text-primary-foreground" : "bg-surface-sunken text-foreground",
                )}
              >
                <VehicleIcon vehicleClass={c.vehicleClass} className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-foreground">{dict.vehicleClass[c.vehicleClass].name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {dict.common.from} {formatMoney(c.startingFare, locale)}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users aria-hidden className="size-3.5" />
                    {c.seats}
                    <span className="sr-only"> {dict.common.seats}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Luggage aria-hidden className="size-3.5" />
                    {c.luggageCapacity}
                    <span className="sr-only"> {dict.common.bags}</span>
                  </span>
                  {!fits && <span className="font-medium text-warning">{tooSmallLabel}</span>}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
