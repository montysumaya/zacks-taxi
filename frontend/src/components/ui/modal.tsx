"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DialogBase, DialogCloseButton } from "./dialog";

const sizes = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Action buttons; stacked full-width on mobile, end-aligned on desktop. */
  footer?: ReactNode;
  size?: keyof typeof sizes;
  dismissible?: boolean;
}

/** Centered dialog on desktop, bottom sheet on mobile. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogBase
      open={open}
      onClose={onClose}
      variant="modal"
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
      dismissible={dismissible}
      className={sizes[size]}
    >
      <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border-strong sm:hidden" aria-hidden />
      <header className="flex items-start gap-4 px-5 pt-4 sm:px-6 sm:pt-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={titleId} className="text-h4 font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {dismissible && <DialogCloseButton onClick={onClose} className="-me-2 -mt-1" />}
      </header>
      {children && <div className="overflow-y-auto px-5 py-4 sm:px-6">{children}</div>}
      {footer && (
        <footer
          className={cn(
            "flex flex-col-reverse gap-2.5 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-6",
            !children && "pt-5",
          )}
        >
          {footer}
        </footer>
      )}
    </DialogBase>
  );
}
