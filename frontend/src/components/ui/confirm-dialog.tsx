"use client";

import type { ReactNode } from "react";
import { CircleAlert, CircleHelp } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "./button";
import { Modal } from "./modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions (cancel booking, delete...). */
  tone?: "default" | "danger";
  /** Shows a spinner on the confirm button and locks the dialog. */
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  loading,
}: ConfirmDialogProps) {
  const { dict } = useI18n();
  const Icon = tone === "danger" ? CircleAlert : CircleHelp;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      dismissible={!loading}
      title={
        <span className="flex flex-col gap-4">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-full",
              tone === "danger" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-soft-foreground",
            )}
          >
            <Icon aria-hidden className="size-5" />
          </span>
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel ?? dict.common.cancel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel ?? dict.common.confirm}
          </Button>
        </>
      }
    />
  );
}
