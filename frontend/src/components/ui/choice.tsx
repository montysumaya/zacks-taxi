"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

const boxStyles = cn(
  "peer mt-0.5 size-5 shrink-0 cursor-pointer appearance-none border border-input bg-surface shadow-xs",
  "transition-colors duration-150",
  "hover:border-subtle-foreground",
  "checked:border-primary checked:bg-primary",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

function ChoiceLabel({ id, label, description }: { id: string; label: ReactNode; description?: ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer flex-col gap-0.5 text-[0.9375rem]">
      <span className="font-medium text-foreground">{label}</span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
    </label>
  );
}

export function Checkbox({ label, description, className, id: idProp, ...props }: ChoiceProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className={cn("relative flex items-start gap-3", className)}>
      <input id={id} type="checkbox" className={cn(boxStyles, "rounded-xs")} {...props} />
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-0.5 start-0 size-5 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
      >
        <path d="M5.5 10.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <ChoiceLabel id={id} label={label} description={description} />
    </div>
  );
}

export function Radio({ label, description, className, id: idProp, ...props }: ChoiceProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className={cn("relative flex items-start gap-3", className)}>
      <input
        id={id}
        type="radio"
        className={cn(
          boxStyles,
          "rounded-full checked:bg-surface checked:border-[6px]",
        )}
        {...props}
      />
      <ChoiceLabel id={id} label={label} description={description} />
    </div>
  );
}

export function RadioGroup({
  legend,
  children,
  className,
}: {
  legend: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="mb-3 text-sm font-semibold text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function Switch({ label, description, className, id: idProp, ...props }: ChoiceProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <ChoiceLabel id={id} label={label} description={description} />
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={cn(
            "peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-border-strong transition-colors duration-200",
            "checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0.5 start-0.5 size-5 rounded-full bg-white shadow-sm",
            "transition-transform duration-200 ease-out-soft",
            "peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5",
          )}
        />
      </span>
    </div>
  );
}
