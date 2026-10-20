"use client";

import Link from "next/link";
import { Ban, CalendarClock, CarFront, CircleCheck, ClipboardList, Hourglass, Route, UserCheck, Wallet } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPath } from "@/features/admin/navigation";
import { relativeTime } from "@/features/admin/format";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import { useAdmin } from "../admin-provider";
import { BookingStatusBadge } from "../badges";
import { ColumnChart } from "../charts/column-chart";
import { StackedBar } from "../charts/stacked-bar";
import { PageHeader, Panel, QueryBoundary, StatCard } from "../page-parts";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

export function OverviewPage() {
  const { t, locale } = useAdmin();
  const f = useAdminFormat();
  const now = useNow();
  const lookups = useFleetLookups();
  const overview = useServiceQuery(() => services.dashboard.getOverview(), ["overview"]);
  const upcoming = useServiceQuery(() => {
    const start = Date.now();
    return services.bookings.list({
      filters: { status: ["pending", "confirmed", "driver_assigned"], type: "scheduled", from: new Date(start).toISOString(), to: new Date(start + 86_400_000).toISOString() },
      sort: "scheduledAt",
      perPage: 6,
    });
  }, ["upcoming"]);
  const recent = useServiceQuery(() => services.bookings.list({ sort: "-createdAt", perPage: 7 }), ["recent"]);
  const o = overview.data;
  const loading = !o;
  const revenueDelta = o ? o.revenueToday.amount - o.revenueYesterday.amount : 0;

  return (
    <>
      <PageHeader
        title={t.overview.title}
        subtitle={t.overview.subtitle}
        actions={
          <Link href={adminPath(locale, "/dispatch")} className={buttonStyles({ variant: "primary" })}>
            {t.overview.goToDispatch}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={loading} label={t.overview.bookingsToday} value={o?.bookingsToday} icon={<ClipboardList />} />
        <StatCard loading={loading} label={t.overview.pending} value={o?.pending} icon={<Hourglass />} tone="warning" />
        <StatCard loading={loading} label={t.overview.activeTrips} value={o?.activeTrips} icon={<Route />} tone="info" />
        <StatCard loading={loading} label={t.overview.completedToday} value={o?.completedToday} icon={<CircleCheck />} tone="success" />
        <StatCard loading={loading} label={t.overview.availableDrivers} value={o?.driversAvailable} icon={<UserCheck />} tone="success" />
        <StatCard loading={loading} label={t.overview.busyDrivers} value={o?.driversBusy} icon={<CarFront />} tone="info" />
        <StatCard loading={loading} label={t.overview.cancelledToday} value={o?.cancelledToday} icon={<Ban />} tone="danger" />
        <StatCard
          loading={loading}
          label={t.overview.revenueToday}
          value={o ? f.usd(o.revenueToday.amount, 0) : null}
          icon={<Wallet />}
          hint={o ? interpolate(t.overview.vsYesterday, { value: `${revenueDelta >= 0 ? "+" : "−"}${f.usd(Math.abs(revenueDelta), 0)}` }) : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title={t.overview.trendTitle} subtitle={t.overview.trendSubtitle} className="xl:col-span-2">
          <QueryBoundary status={overview.status} hasData={!!o} onRetry={overview.reload} skeleton={<Skeleton className="h-56" />}>
            {o && (
              <ColumnChart
                data={o.bookingsTrend.map((p) => ({ label: f.dayShort(p.date), fullLabel: f.dayLong(p.date), value: p.value }))}
                format={(v) => f.number(v)}
                tableColumns={[t.common.date, t.nav.bookings]}
                highlightLast
                labelEvery={2}
              />
            )}
          </QueryBoundary>
        </Panel>
        <Panel title={t.overview.availabilityTitle}>
          <QueryBoundary status={overview.status} hasData={!!o} onRetry={overview.reload}>
            {o && (
              <StackedBar
                label={t.overview.availabilityTitle}
                segments={[
                  { key: "available", label: t.overview.available, value: o.driversAvailable, className: "bg-success" },
                  { key: "busy", label: t.overview.onTrip, value: o.driversBusy, className: "bg-info" },
                  { key: "offline", label: t.overview.offline, value: o.driversOffline, className: "bg-border-strong" },
                ]}
              />
            )}
          </QueryBoundary>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={t.overview.upcomingTitle} className="xl:col-span-2" bodyClassName="p-0">
          <QueryBoundary
            status={upcoming.status}
            hasData={!!upcoming.data}
            onRetry={upcoming.reload}
            empty={upcoming.data?.data.length === 0 && t.overview.upcomingEmpty}
            skeleton={<Skeleton className="m-5 h-48" />}
          >
            <ul className="divide-y divide-border">
              {upcoming.data?.data.map((b) => (
                <li key={b.id}>
                  <Link href={adminPath(locale, `/bookings/${b.id}`)} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-soft-foreground">
                      <CalendarClock aria-hidden className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">{f.route(b)}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.time(b.scheduledAt)} · {now ? relativeTime(b.scheduledAt, now, t.time) : ""} · {lookups.driverName(b.driverId) ?? t.common.unassigned}
                      </span>
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </QueryBoundary>
        </Panel>

        <Panel
          title={t.overview.recentTitle}
          className="xl:col-span-3"
          bodyClassName="p-0"
          actions={
            <Link href={adminPath(locale, "/bookings")} className="text-sm font-semibold text-primary-soft-foreground hover:underline">
              {t.nav.bookings}
            </Link>
          }
        >
          <QueryBoundary status={recent.status} hasData={!!recent.data} onRetry={recent.reload} skeleton={<Skeleton className="m-5 h-48" />}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <caption className="sr-only">{t.overview.recentTitle}</caption>
                <thead className="bg-surface-muted text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 text-start font-semibold">{t.bookings.columns.reference}</th>
                    <th scope="col" className="px-3 py-2.5 text-start font-semibold">{t.bookings.columns.customer}</th>
                    <th scope="col" className="px-3 py-2.5 text-start font-semibold">{t.bookings.columns.scheduled}</th>
                    <th scope="col" className="px-5 py-2.5 text-end font-semibold">{t.bookings.columns.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.data?.data.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-muted">
                      <td className="px-5 py-2.5">
                        <Link href={adminPath(locale, `/bookings/${b.id}`)} className="font-mono text-xs font-semibold hover:underline" dir="ltr">
                          {b.reference}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">{b.contact.fullName}</td>
                      <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{f.dateTime(b.scheduledAt)}</td>
                      <td className="px-5 py-2.5 text-end">
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryBoundary>
        </Panel>
      </div>
    </>
  );
}
