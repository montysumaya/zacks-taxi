"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlarmClock, Luggage, TriangleAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { HOUR, relativeTime } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { manualNextStatus } from "@/features/booking/status";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import { localize } from "@/lib/format";
import { outlinePoints, project, SCHEMATIC } from "@/lib/schematic-map";
import { placeList } from "@/mocks/fixtures/places";
import { services } from "@/services";
import type { Booking } from "@/types";
import { useAdmin } from "../admin-provider";
import { AssignDriverModal, useWorkload, WorkloadMeter } from "../assign-driver-modal";
import { BookingStatusBadge, DriverStatusBadge } from "../badges";
import { PageHeader, Panel, QueryBoundary } from "../page-parts";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

const ACTIVE = ["driver_assigned", "driver_en_route", "driver_arrived", "in_progress"] as const;

export function DispatchPage() {
  const { t, dict, locale } = useAdmin();
  const { toast } = useToast();
  const f = useAdminFormat();
  const now = useNow();
  const [refresh, setRefresh] = useState(0);
  const [assigning, setAssigning] = useState<Booking | null>(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const lookups = useFleetLookups(refresh);
  const workload = useWorkload(refresh);

  const queue = useServiceQuery(
    () =>
      services.bookings.list({
        filters: { status: ["pending", "confirmed"], unassigned: true, from: new Date(Date.now() - 2 * HOUR).toISOString() },
        sort: "scheduledAt",
        perPage: 50,
      }),
    ["queue", refresh],
  );
  const active = useServiceQuery(() => services.bookings.list({ filters: { status: [...ACTIVE] }, sort: "scheduledAt", perPage: 50 }), ["active", refresh]);
  const reload = () => setRefresh((n) => n + 1);

  const alerts = (queue.data?.data ?? []).filter((b) => now && Date.parse(b.scheduledAt) - now < 2 * HOUR);
  const drivers = useMemo(() => {
    const order = { available: 0, on_trip: 1, offline: 2, suspended: 3 } as const;
    return [...lookups.drivers]
      .filter((d) => showAllDrivers || d.status === "available" || d.status === "on_trip")
      .sort((a, b) => order[a.status] - order[b.status] || (workload.get(a.id) ?? 0) - (workload.get(b.id) ?? 0));
  }, [lookups.drivers, showAllDrivers, workload]);

  async function advance(b: Booking) {
    const next = manualNextStatus[b.status];
    if (!next) return;
    setBusyId(b.id);
    try {
      await services.bookings.updateStatus(b.id, next);
      toast({ tone: "success", title: interpolate(t.bookings.detail.statusUpdated, { status: dict.status.booking[next] }) });
      reload();
    } catch {
      toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader title={t.dispatch.title} subtitle={t.dispatch.subtitle} />

      <section aria-labelledby="alerts-title" className="flex flex-col gap-3">
        <h2 id="alerts-title" className="flex items-center gap-2 text-h6 font-bold">
          <AlarmClock aria-hidden className="size-4 text-warning" />
          {t.dispatch.alertsTitle}
        </h2>
        {queue.data && alerts.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">{t.dispatch.alertsEmpty}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {alerts.slice(0, 4).map((b) => {
              const overdue = now > Date.parse(b.scheduledAt);
              return (
                <li key={b.id} role="alert" className={cn("flex flex-col gap-2 rounded-card border p-4", overdue ? "border-danger/40 bg-danger-soft" : "border-warning/40 bg-warning-soft")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold" dir="ltr">
                      {b.reference}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", overdue ? "text-danger" : "text-warning-soft-foreground")}>
                      <TriangleAlert aria-hidden className="size-3.5" />
                      {overdue ? t.dispatch.overdue : interpolate(t.dispatch.startsIn, { time: relativeTime(b.scheduledAt, now, t.time) })}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{f.route(b)}</span>
                  <Button size="sm" onClick={() => setAssigning(b)} className="self-start">
                    {t.dispatch.assign}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
        <Panel title={t.dispatch.queueTitle} subtitle={t.dispatch.queueSubtitle} bodyClassName="p-0" actions={queue.data && <Badge tone="warning">{queue.data.meta.total}</Badge>}>
          <QueryBoundary status={queue.status} hasData={!!queue.data} onRetry={queue.reload} empty={queue.data?.data.length === 0 && t.dispatch.queueEmpty} skeleton={<Skeleton className="m-5 h-64" />}>
            <ul className="max-h-[32rem] divide-y divide-border overflow-y-auto">
              {queue.data?.data.map((b) => (
                <li key={b.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={adminPath(locale, `/bookings/${b.id}`)} className="font-mono text-xs font-bold hover:underline" dir="ltr">
                        {b.reference}
                      </Link>
                      <BookingStatusBadge status={b.status} />
                      <Badge size="sm" tone={b.type === "scheduled" ? "brand" : "accent"}>
                        {t.bookingType[b.type]}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{f.route(b)}</span>
                    <span className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {f.time(b.scheduledAt)} · {now ? relativeTime(b.scheduledAt, now, t.time) : ""}
                      </span>
                      <span>{dict.vehicleClass[b.vehicleClass].name}</span>
                      <span className="inline-flex items-center gap-1">
                        <Users aria-hidden className="size-3" />
                        {b.passengers}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Luggage aria-hidden className="size-3" />
                        {b.luggage}
                      </span>
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setAssigning(b)}>
                    {t.dispatch.assign}
                  </Button>
                </li>
              ))}
            </ul>
          </QueryBoundary>
        </Panel>

        <Panel title={t.dispatch.mapTitle} subtitle={t.dispatch.mapNote}>
          <DemandMap bookings={[...(queue.data?.data ?? []), ...(active.data?.data ?? [])]} />
        </Panel>

        <Panel
          title={t.dispatch.driversTitle}
          bodyClassName="p-0"
          actions={
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input type="checkbox" checked={showAllDrivers} onChange={(e) => setShowAllDrivers(e.target.checked)} className="accent-[var(--primary)]" />
              {t.dispatch.showAll}
            </label>
          }
        >
          {!lookups.drivers.length ? (
            <Skeleton className="m-5 h-64" />
          ) : drivers.length === 0 ? (
            <EmptyState compact title={t.dispatch.noDrivers} />
          ) : (
            <ul className="max-h-[32rem] divide-y divide-border overflow-y-auto">
              {drivers.map((d) => {
                const vehicle = d.vehicleId ? lookups.vehicleMap.get(d.vehicleId) : undefined;
                return (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold" dir="ltr">
                        {d.firstName} {d.lastName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {vehicle ? `${dict.vehicleClass[vehicle.vehicleClass].name} · ${vehicle.plateNumber}` : t.dispatch.noVehicle}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <DriverStatusBadge status={d.status} />
                      <span title={t.dispatch.workloadLabel}>
                        <span className="sr-only">{interpolate(t.dispatch.workload, { count: workload.get(d.id) ?? 0 })}</span>
                        <WorkloadMeter count={workload.get(d.id) ?? 0} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={t.dispatch.activeTitle} bodyClassName="p-0" actions={active.data && <Badge tone="info">{active.data.meta.total}</Badge>}>
        <QueryBoundary status={active.status} hasData={!!active.data} onRetry={active.reload} empty={active.data?.data.length === 0 && t.dispatch.activeEmpty} skeleton={<Skeleton className="m-5 h-40" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">{t.dispatch.activeTitle}</caption>
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-2.5 text-start font-semibold">{t.bookings.columns.reference}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-semibold">{t.bookings.columns.route}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-semibold">{t.bookings.columns.driver}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-semibold">{t.bookings.columns.status}</th>
                  <th scope="col" className="px-5 py-2.5 text-end font-semibold">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.data?.data.map((b) => {
                  const next = manualNextStatus[b.status];
                  return (
                    <tr key={b.id}>
                      <td className="px-5 py-3">
                        <Link href={adminPath(locale, `/bookings/${b.id}`)} className="font-mono text-xs font-bold hover:underline" dir="ltr">
                          {b.reference}
                        </Link>
                        <span className="block text-xs text-muted-foreground tabular-nums">{f.time(b.scheduledAt)}</span>
                      </td>
                      <td className="px-3 py-3">{f.route(b)}</td>
                      <td className="px-3 py-3" dir="ltr">
                        {lookups.driverName(b.driverId) ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3 text-end">
                        {next && next !== "confirmed" && (
                          <Button size="sm" variant="secondary" loading={busyId === b.id} onClick={() => advance(b)}>
                            {t.dispatch.nextAction[next as keyof typeof t.dispatch.nextAction]}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </QueryBoundary>
      </Panel>

      <AssignDriverModal booking={assigning} onClose={() => setAssigning(null)} onAssigned={reload} />
    </>
  );
}

/** Open pickups per known area on the schematic map (counts, not GPS positions). */
function DemandMap({ bookings }: { bookings: Booking[] }) {
  const { locale, t } = useAdmin();
  const counts = new Map<string, number>();
  bookings.forEach((b) => b.pickup.id && counts.set(b.pickup.id, (counts.get(b.pickup.id) ?? 0) + 1));
  const points = placeList.filter((p) => p.id && counts.has(p.id));
  const max = Math.max(1, ...counts.values());

  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${SCHEMATIC.width} ${SCHEMATIC.height}`} role="img" aria-label={t.dispatch.mapTitle} className="h-80 w-full rounded-lg bg-brand-50">
        <polygon points={outlinePoints} fill="var(--surface)" stroke="var(--palette-brand-200)" strokeWidth="1.5" strokeLinejoin="round" />
        {points.map((p) => {
          const { x, y } = project(p.location);
          const n = counts.get(p.id!)!;
          return (
            <g key={p.id} transform={`translate(${x} ${y})`}>
              <circle r={6 + (n / max) * 12} fill="var(--chart-1)" fillOpacity="0.2" stroke="var(--chart-1)" strokeWidth="1.5" />
              <circle r="3" fill="var(--chart-1)" stroke="white" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {points
          .sort((a, b) => counts.get(b.id!)! - counts.get(a.id!)!)
          .map((p) => (
            <li key={p.id} className="flex justify-between gap-2">
              <span className="truncate text-muted-foreground">{localize(p.name, locale)}</span>
              <span className="font-semibold tabular-nums">{counts.get(p.id!)}</span>
            </li>
          ))}
      </ul>
    </figure>
  );
}
