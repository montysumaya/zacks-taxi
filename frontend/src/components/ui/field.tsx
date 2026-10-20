"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
  disabled?: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Wiring for controls rendered inside a <Field>; returns nothing outside one. */
export function useField() {
  return useContext(FieldContext);
}

export interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Text shown next to the label for optional fields, e.g. "Optional". */
  optionalLabel?: string;
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
  id?: string;
  className?: string;
}

export function Field({
  label,
  children,
  hint,
  error,
  required,
  disabled,
  optionalLabel,
  hideLabel,
  id: idProp,
  className,
}: FieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext value={{ id, describedBy, invalid: Boolean(error), required, disabled }}>
      <div className={cn("flex flex-col gap-1.5", disabled && "opacity-60", className)}>
        <label
          htmlFor={id}
          className={cn(
            "flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground",
            hideLabel && "sr-only",
          )}
        >
          <span>
            {label}
            {required && (
              <span aria-hidden className="ms-0.5 text-danger">
                *
              </span>
            )}
          </span>
          {!required && optionalLabel && (
            <span className="text-xs font-normal text-subtle-foreground">{optionalLabel}</span>
          )}
        </label>
        {children}
        {error ? (
          <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext>
  );
}
