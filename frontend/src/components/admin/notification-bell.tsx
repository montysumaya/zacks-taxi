"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { relativeTime } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { services } from "@/services";
import { cn } from "@/lib/cn";
import { useAdmin } from "./admin-provider";
import { notificationMessage } from "./notification-message";

export function NotificationBell() {
  const { t, locale } = useAdmin();
  const now = useNow();
  // Re-polls whenever the shared clock ticks (every 30 s).
  const unread = useServiceQuery(() => services.notifications.list({ filters: { unreadOnly: true }, perPage: 5 }), [now]);
  const count = unread.data?.meta.total ?? 0;

  return (
    <Popover
      label={t.topbar.notifications}
      className="w-80"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={() => {
            if (!open) unread.reload();
            toggle();
          }}
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${t.topbar.notifications}${count ? ` (${count})` : ""}`}
          className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
        >
          <Bell aria-hidden className="size-5" />
          {count > 0 && (
            <span className="absolute end-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-danger px-1 text-[0.625rem] leading-4.5 font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          <p className="border-b border-border px-4 py-3 text-sm font-bold">{t.topbar.notifications}</p>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {(unread.data?.data ?? []).map((n) => (
              <li key={n.id} className="flex gap-3 px-4 py-3">
                <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-info")} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground">{notificationMessage(n, t)}</span>
                  <span className="text-xs text-subtle-foreground">{now ? relativeTime(n.createdAt, now, t.time) : ""}</span>
                </div>
              </li>
            ))}
            {unread.status === "success" && count === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">{t.notifications.empty}</li>}
          </ul>
          <Link
            href={adminPath(locale, "/notifications")}
            onNavigate={close}
            className="border-t border-border px-4 py-3 text-center text-sm font-semibold text-primary-soft-foreground hover:bg-surface-muted"
          >
            {t.topbar.viewAll}
          </Link>
        </div>
      )}
    </Popover>
  );
}
