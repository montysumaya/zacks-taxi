"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useField } from "./field";

/** Shared surface for text-like controls. */
export const controlStyles = cn(
  "w-full rounded-control border border-input bg-surface text-[0.9375rem] text-foreground shadow-xs",
  "placeholder:text-subtle-foreground",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-border-strong hover:border-subtle-foreground/60",
  "focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/15",
  "disabled:cursor-not-allowed disabled:bg-surface-muted",
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/15",
);

/** Merge props from the surrounding <Field>, letting explicit props win. */
function useControlProps<T extends { id?: string; "aria-describedby"?: string; required?: boolean; disabled?: boolean }>(
  props: T,
) {
  const field = useField();
  return {
    ...props,
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": field?.invalid || undefined,
    required: props.required ?? field?.required,
    disabled: props.disabled ?? field?.disabled,
  };
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icon or text rendered at the inline-start edge (left in LTR, right in RTL). */
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  inputSize?: "md" | "lg";
}

export function Input({
  startAdornment,
  endAdornment,
  inputSize = "md",
  className,
  ...props
}: InputProps) {
  const controlProps = useControlProps(props);
  return (
    <div className="relative flex items-center">
      {startAdornment && (
        <span className="pointer-events-none absolute start-3.5 flex items-center text-subtle-foreground [&_svg]:size-[1.125rem]">
          {startAdornment}
        </span>
      )}
      <input
        className={cn(
          controlStyles,
          inputSize === "md" ? "h-11 px-3.5" : "h-13 px-4 text-base",
          startAdornment && "ps-11",
          endAdornment && "pe-11",
          className,
        )}
        {...controlProps}
      />
      {endAdornment && (
        <span className="absolute end-3.5 flex items-center text-subtle-foreground [&_svg]:size-[1.125rem]">
          {endAdornment}
        </span>
      )}
    </div>
  );
}

/** Lebanese phone input: fixed +961 prefix, always laid out LTR. */
export function PhoneInput({ className, ...props }: Omit<InputProps, "type">) {
  const controlProps = useControlProps(props);
  return (
    <div dir="ltr" className="flex">
      <span className="inline-flex items-center rounded-s-control border border-e-0 border-input bg-surface-muted px-3 text-[0.9375rem] font-medium text-muted-foreground">
        +961
      </span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className={cn(controlStyles, "h-11 rounded-s-none px-3.5", className)}
        {...controlProps}
      />
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const controlProps = useControlProps(props);
  return (
    <textarea
      className={cn(controlStyles, "min-h-28 resize-y px-3.5 py-2.5 leading-relaxed", className)}
      {...controlProps}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const controlProps = useControlProps(props);
  return (
    <div className="relative">
      <select
        className={cn(controlStyles, "h-11 cursor-pointer appearance-none ps-3.5 pe-10", className)}
        {...controlProps}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-3.5 top-1/2 size-[1.125rem] -translate-y-1/2 text-subtle-foreground"
      />
    </div>
  );
}
