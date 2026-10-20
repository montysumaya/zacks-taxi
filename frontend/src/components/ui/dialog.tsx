"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "./button";

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant: "modal" | "drawer";
  labelledBy?: string;
  describedBy?: string;
  /** Prevent closing via Escape / backdrop (e.g. while a request is in flight). */
  dismissible?: boolean;
  className?: string;
}

/**
 * Native <dialog> rendered in the top layer: focus trapping, Escape handling
 * and inert background come from the browser. Transitions live in globals.css.
 */
export function DialogBase({
  open,
  onClose,
  children,
  variant,
  labelledBy,
  describedBy,
  dismissible = true,
  className,
}: DialogBaseProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-variant={variant}
      data-scroll-lock
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="ui-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        // Clicks on the dialog element itself (not its panel) are backdrop clicks.
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
    >
      <div
        className={cn(
          "ui-dialog-panel",
          variant === "modal"
            ? "m-auto mb-0 flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-surface shadow-overlay sm:mb-auto sm:max-w-lg sm:rounded-2xl"
            : "ms-auto flex h-full w-full flex-col bg-surface shadow-overlay",
          className,
        )}
      >
        {children}
      </div>
    </dialog>
  );
}

export function DialogCloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  const { dict } = useI18n();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={dict.common.close}
      className={cn("text-muted-foreground", className)}
    >
      <X />
    </Button>
  );
}
