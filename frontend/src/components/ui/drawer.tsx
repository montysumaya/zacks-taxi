"use client";

import { useId, type ReactNode } from "react";
import { DialogBase, DialogCloseButton } from "./dialog";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "lg";
}

/** Panel sliding in from the inline-end edge (right in LTR, left in RTL). */
export function Drawer({ open, onClose, title, children, footer, size = "sm" }: DrawerProps) {
  const titleId = useId();
  return (
    <DialogBase open={open} onClose={onClose} variant="drawer" labelledBy={titleId} className={size === "lg" ? "max-w-xl" : "max-w-sm"}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-5">
        <div id={titleId} className="min-w-0">
          {title}
        </div>
        <DialogCloseButton onClick={onClose} className="-me-2" />
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer && (
        <footer className="border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </DialogBase>
  );
}
