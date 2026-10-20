"use client";

import { useId, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { startOfDay, DAY } from "@/features/admin/format";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import { services } from "@/services";
import type { Booking, Driver } from "@/types";
import { useAdmin } from "./admin-provider";
import { DriverStatusBadge } from "./badges";
import { useAdminFormat, useFleetLookups } from "./use-lookups";

/** Workload = trips assigned for today; drives the ranking and the meter. */
export function useWorkload(key: unknown = 0) {
  const today = useServiceQuery(() => {
    const start = startOfDay(Date.now());
    return services.bookings.list({ filters: { from: new Date(start).toISOString(), to: new Date(start + DAY).toISOString() }, perPage: 1000 });
  }, ["workload", key]);
  return useMemo(() => {
    const counts = new Map<string, number>();
    today.data?.data.forEach((b) => {
      if (b.driverId && b.status !== "cancelled") counts.set(b.driverId, (counts.get(b.driverId) ?? 0) + 1);
    });
    return counts;
  }, [today.data]);
}

export function WorkloadMeter({ count, max = 8 }: { count: number; max?: number }) {
  const pct = Math.min(100, (count / max) * 100);
  const tone = pct >= 85 ? "bg-danger" : pct >= 60 ? "bg-warning" : "bg-success";
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-sunken">
        <span className={cn("block h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    </span>
  );
}

export function AssignDriverModal({
  booking,
  onClose,
  onAssigned,
}: {
  booking: Booking | null;
  onClose: () => void;
  onAssigned: (booking: Booking) => void;
}) {
  const { t, dict } = useAdmin();
  const { toast } = useToast();
  const f = useAdminFormat();
  const lookups = useFleetLookups(booking?.id);
  const workload = useWorkload(booking?.id);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = useId();

  const ranked = useMemo(() => {
    if (!booking) return [];
    const score = (d: Driver) => {
      const vehicle = d.vehicleId ? lookups.vehicleMap.get(d.vehicleId) : undefined;
      const eligible = d.status !== "suspended" && vehicle?.status === "active";
      return {
        driver: d,
        vehicle,
        eligible,
        classMatch: vehicle?.vehicleClass === booking.vehicleClass,
        load: workload.get(d.id) ?? 0,
      };
    };
    return lookups.drivers
      .map(score)
      .sort((a, b) => {
        const rank = (x: ReturnType<typeof score>) =>
          (x.eligible ? 0 : 1000) + (x.driver.status === "available" ? 0 : x.driver.status === "on_trip" ? 100 : 500) + (x.classMatch ? 0 : 50) + x.load;
        return rank(a) - rank(b);
      });
  }, [booking, lookups, workload]);

  const best = ranked.find((r) => r.eligible && r.driver.status === "available")?.driver.id;
  const chosen = selected ?? best ?? null;

  async function assign() {
    if (!booking || !chosen) return;
    setSaving(true);
    try {
      const updated = await services.bookings.assignDriver(booking.id, chosen);
      toast({ tone: "success", title: interpolate(t.dispatch.assigned, { driver: lookups.driverName(chosen) ?? "", reference: booking.reference }) });
      onAssigned(updated);
      setSelected(null);
      onClose();
    } catch {
      toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={booking !== null}
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      size="lg"
      dismissible={!saving}
      title={booking ? interpolate(t.dispatch.assignTitle, { reference: booking.reference }) : ""}
      description={booking ? interpolate(t.dispatch.assignSubtitle, { route: f.route(booking), time: f.dateTime(booking.scheduledAt) }) : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button onClick={assign} loading={saving} disabled={!chosen}>
            {t.dispatch.assign}
          </Button>
        </>
      }
    >
      {!lookups.drivers.length ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <fieldset>
          <legend className="sr-only">{t.dispatch.driversTitle}</legend>
          <ul className="flex flex-col gap-2">
            {ranked.map(({ driver, vehicle, eligible, classMatch, load }) => (
              <li key={driver.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                    chosen === driver.id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-border hover:border-border-strong",
                    !eligible && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={driver.id}
                    checked={chosen === driver.id}
                    disabled={!eligible}
                    onChange={() => setSelected(driver.id)}
                    className="sr-only"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold" dir="ltr">
                        {driver.firstName} {driver.lastName}
                      </span>
                      {driver.id === best && (
                        <Badge tone="accent" size="sm">
                          {t.dispatch.bestMatch}
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {vehicle ? (
                        <>
                          <span dir="ltr">
                            {vehicle.make} {vehicle.model} · {vehicle.plateNumber}
                          </span>{" "}
                          · {interpolate(classMatch ? t.dispatch.classMatch : t.dispatch.otherClass, { class: dict.vehicleClass[vehicle.vehicleClass].name })}
                        </>
                      ) : (
                        t.dispatch.noVehicle
                      )}
                    </span>
                  </span>
                  <span className="hidden flex-col items-end gap-1 sm:flex">
                    <DriverStatusBadge status={driver.status} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star aria-hidden className="size-3 fill-accent text-accent" />
                      {driver.rating.toFixed(2)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1" title={t.dispatch.workloadLabel}>
                    <span className="sr-only">{interpolate(t.dispatch.workload, { count: load })}</span>
                    <WorkloadMeter count={load} />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
    </Modal>
  );
}
