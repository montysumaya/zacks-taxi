"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

/** Pill-style single choice built on native radios (arrow-key navigation for free). */
export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onChange,
  hideLegend,
  className,
}: {
  legend: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  hideLegend?: boolean;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={className}>
      <legend className={cn("mb-2 text-sm font-semibold text-foreground", hideLegend && "sr-only")}>{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-surface-sunken p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--radius-control)-0.25rem)] px-3 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring [&_svg]:size-4",
              value === option.value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon}
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
