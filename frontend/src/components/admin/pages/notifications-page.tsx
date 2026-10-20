"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, BellRing, CalendarClock, CheckCheck, FileWarning, UserCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { relativeTime } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { cn } from "@/lib/cn";
import { services } from "@/services";
import type { NotificationType } from "@/types";
import { useAdmin } from "../admin-provider";
import { notificationMessage } from "../notification-message";
import { PageHeader, Panel, QueryBoundary } from "../page-parts";
import { Badge } from "@/components/ui/badge";

const icons: Record<NotificationType, LucideIcon> = {
  booking_created: BellRing,
  scheduled_reminder: CalendarClock,
  driver_assigned: UserCheck,
  booking_cancelled: Ban,
  document_expiring: FileWarning,
};

export function NotificationsPage() {
  const { t, locale } = useAdmin();
  const { toast } = useToast();
  const now = useNow();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const query = useServiceQuery(() => services.notifications.list({ filters: { unreadOnly: filter === "unread" }, page, perPage: 20 }), [filter, page]);
  const items = query.data?.data ?? [];

  return (
    <>
      <PageHeader
        title={t.notifications.title}
        subtitle={t.notifications.subtitle}
        actions={
          <Button
            variant="secondary"
            onClick={async () => {
              await services.notifications.markAllRead();
              toast({ tone: "success", title: t.common.saved });
              query.reload();
            }}
          >
            <CheckCheck aria-hidden />
            {t.notifications.markAllRead}
          </Button>
        }
      />
      <SegmentedControl
        legend={t.notifications.title}
        hideLegend
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        className="max-w-xs"
        options={[
          { value: "all", label: t.notifications.filters.all },
          { value: "unread", label: t.notifications.filters.unread },
        ]}
      />
      <Panel bodyClassName="p-0">
        <QueryBoundary status={query.status} hasData={!!query.data} onRetry={query.reload} empty={items.length === 0 && t.notifications.empty} skeleton={<Skeleton className="m-5 h-80" />}>
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = icons[n.type];
              const message = notificationMessage(n, t);
              return (
                <li key={n.id} className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-info-soft/40")}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-foreground">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      {n.bookingId ? (
                        <Link href={adminPath(locale, `/bookings/${n.bookingId}`)} className="text-sm font-semibold hover:underline">
                          {message}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold">{message}</span>
                      )}
                      {!n.read && (
                        <Badge tone="info" size="sm" dot>
                          {t.notifications.unread}
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.notifications.types[n.type]} · {now ? relativeTime(n.createdAt, now, t.time) : ""}
                    </span>
                  </div>
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await services.notifications.markRead(n.id);
                        query.reload();
                      }}
                    >
                      <CheckCheck aria-hidden />
                      <span className="sr-only sm:not-sr-only">{t.notifications.markRead}</span>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          {query.data && query.data.meta.lastPage > 1 && (
            <div className="flex justify-center gap-2 border-t border-border p-3">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t.common.previous}
              </Button>
              <Button size="sm" variant="secondary" disabled={page >= query.data.meta.lastPage} onClick={() => setPage((p) => p + 1)}>
                {t.common.next}
              </Button>
            </div>
          )}
        </QueryBoundary>
      </Panel>
    </>
  );
}
