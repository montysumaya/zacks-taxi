"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Pencil, UserPlus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAccess } from "@/features/admin/access";
import { adminPath } from "@/features/admin/navigation";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { formatLebanesePhone } from "@/features/booking/phone";
import { canCancel, cancellationReasons, manualNextStatus } from "@/features/booking/status";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import { localize } from "@/lib/format";
import { services } from "@/services";
import { ServiceError, type Booking } from "@/types";
import { useAdmin } from "../admin-provider";
import { AssignDriverModal } from "../assign-driver-modal";
import { BookingStatusBadge, DriverStatusBadge } from "../badges";
import { BookingFormModal } from "../booking-form-modal";
import { DetailRows, Panel } from "../page-parts";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

export function BookingDetailPage({ id }: { id: string }) {
  const { t, dict, locale } = useAdmin();
  const { toast } = useToast();
  const { can } = useAccess();
  const f = useAdminFormat();
  const query = useServiceQuery(() => services.bookings.getById(id), [id]);
  const payments = useServiceQuery(() => services.payments.listByBooking(id), [id, query.data?.status]);
  const lookups = useFleetLookups(query.data?.driverId);
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState<string>(cancellationReasons[0]);
  const [busy, setBusy] = useState(false);

  if (query.status === "error" && !query.data) {
    const notFound = query.error instanceof ServiceError && query.error.status === 404;
    return (
      <Card padding="none">
        <EmptyState
          title={notFound ? t.bookings.detail.notFound : t.common.loadFailed}
          actions={
            <Link href={adminPath(locale, "/bookings")} className="text-sm font-semibold text-primary-soft-foreground hover:underline">
              {t.common.back}
            </Link>
          }
        />
      </Card>
    );
  }
  const b = query.data;
  if (!b) return <Skeleton className="h-[32rem] rounded-card" />;

  const manage = can("bookings.manage");
  const dispatch = can("dispatch.manage");
  const editable = manage && !["completed", "cancelled", "no_show", "in_progress"].includes(b.status);
  const next = manualNextStatus[b.status];
  const driver = b.driverId ? lookups.driverMap.get(b.driverId) : undefined;
  const vehicle = b.vehicleId ? lookups.vehicleMap.get(b.vehicleId) : undefined;

  async function run(action: () => Promise<Booking>, message: string) {
    setBusy(true);
    try {
      await action();
      toast({ tone: "success", title: message });
      query.reload();
    } catch {
      toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link href={adminPath(locale, "/bookings")} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {t.nav.bookings}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="flex flex-wrap items-center gap-3 text-h2 font-bold">
              <span className="font-mono" dir="ltr">
                {b.reference}
              </span>
              <BookingStatusBadge status={b.status} />
            </h1>
            <p className="text-muted-foreground">
              {f.route(b)} · {f.dateTime(b.scheduledAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dispatch && next && (next !== "confirmed" || manage) && (
              <Button
                loading={busy}
                onClick={() => run(() => services.bookings.updateStatus(b.id, next), interpolate(t.bookings.detail.statusUpdated, { status: dict.status.booking[next] }))}
              >
                {interpolate(t.bookings.detail.advance, { status: dict.status.booking[next] })}
              </Button>
            )}
            {dispatch && b.status === "driver_arrived" && (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => run(() => services.bookings.updateStatus(b.id, "no_show"), interpolate(t.bookings.detail.statusUpdated, { status: dict.status.booking.no_show }))}
              >
                <UserX aria-hidden />
                {t.bookings.detail.noShow}
              </Button>
            )}
            {dispatch && canCancel(b.status) && (
              <Button variant="secondary" onClick={() => setAssigning(b)}>
                <UserPlus aria-hidden />
                {b.driverId ? t.bookings.detail.reassign : t.bookings.detail.assignDriver}
              </Button>
            )}
            {editable && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil aria-hidden />
                {t.common.edit}
              </Button>
            )}
            {manage && canCancel(b.status) && (
              <Button variant="secondary" className="text-danger" onClick={() => setCancelOpen(true)}>
                <Ban aria-hidden />
                {t.bookings.detail.cancel}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Panel title={t.bookings.detail.trip}>
            <DetailRows
              rows={[
                [t.bookings.form.pickup, localize(b.pickup.name, locale)],
                [t.bookings.form.dropoff, localize(b.dropoff.name, locale)],
                [t.bookings.columns.scheduled, `${f.dateTime(b.scheduledAt)} · ${t.bookingType[b.type]}`],
                [t.bookings.columns.vehicleClass, `${dict.vehicleClass[b.vehicleClass].name} · ${interpolate(t.bookings.detail.passengers, { passengers: b.passengers, luggage: b.luggage })}`],
                !!b.flightNumber && [t.bookings.detail.flight, <span key="f" dir="ltr">{b.flightNumber}</span>],
                !!(b.pickupLandmark || b.pickupInstructions) && [t.bookings.detail.instructions, [b.pickupLandmark, b.pickupInstructions].filter(Boolean).join(" · ")],
                !!b.notes && [t.bookings.detail.notes, b.notes],
                !!b.specialInstructions && [dict.bookingFlow.specialInstructions, b.specialInstructions],
                !!b.cancellationReason && [t.bookings.detail.cancelReason, t.cancellationReasons[b.cancellationReason as keyof typeof t.cancellationReasons] ?? b.cancellationReason],
                [t.bookings.detail.source, t.bookingSource[b.source ?? "web"]],
                [t.bookings.detail.created, f.dateTime(b.createdAt)],
              ]}
            />
          </Panel>
          <Panel title={t.bookings.detail.timeline}>
            <ol className="flex flex-col">
              {b.statusHistory.map((event, i) => (
                <li key={`${event.status}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < b.statusHistory.length - 1 && <span aria-hidden className="absolute start-[0.4375rem] top-5 bottom-0 w-0.5 bg-border" />}
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-1 size-4 shrink-0 rounded-full ring-4 ring-surface",
                      i === b.statusHistory.length - 1 ? (event.status === "cancelled" || event.status === "no_show" ? "bg-danger" : "bg-accent") : "bg-primary",
                    )}
                  />
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-semibold">{dict.status.booking[event.status]}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{f.dateTime(event.at)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title={t.bookings.detail.customer}>
            <DetailRows
              rows={[
                [t.common.name, b.contact.fullName],
                [t.common.phone, <span key="p" dir="ltr">{formatLebanesePhone(b.contact.phone)}</span>],
                !!b.contact.email && [t.common.email, <span key="e" dir="ltr">{b.contact.email}</span>],
              ]}
            />
          </Panel>
          <Panel title={t.bookings.detail.assignment}>
            {driver ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold" dir="ltr">
                    {driver.firstName} {driver.lastName}
                  </span>
                  <DriverStatusBadge status={driver.status} />
                </div>
                {vehicle && (
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {vehicle.make} {vehicle.model} · {vehicle.color} · <span className="font-mono">{vehicle.plateNumber}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {formatLebanesePhone(driver.phone)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-warning">{t.bookings.detail.noDriver}</p>
            )}
          </Panel>
          <Panel title={t.bookings.detail.payment}>
            <DetailRows
              rows={[
                [t.bookings.columns.fare, <span key="fare" className="tabular-nums">{f.usd(b.estimatedFare.amount)}</span>],
                [t.payments.columns.method, dict.paymentMethod[b.paymentMethod]],
                ...(payments.data ?? []).map((p): [string, React.ReactNode] => [
                  f.dateTime(p.paidAt ?? p.createdAt),
                  <Badge key={p.id} size="sm" tone={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "warning"}>
                    {dict.status.payment[p.status]}
                  </Badge>,
                ]),
              ]}
            />
          </Panel>
        </div>
      </div>

      {editing && <BookingFormModal open booking={b} onClose={() => setEditing(false)} onSaved={() => query.reload()} />}
      <AssignDriverModal booking={assigning} onClose={() => setAssigning(null)} onAssigned={() => query.reload()} />
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        dismissible={!busy}
        title={interpolate(t.bookings.detail.cancelTitle, { reference: b.reference })}
        description={t.bookings.detail.cancelBody}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={busy}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                await run(() => services.bookings.cancel(b.id, reason), t.bookings.detail.cancelled);
                setCancelOpen(false);
              }}
            >
              {t.bookings.detail.cancel}
            </Button>
          </>
        }
      >
        <Field label={t.bookings.detail.cancelReason}>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {cancellationReasons.map((r) => (
              <option key={r} value={r}>
                {t.cancellationReasons[r]}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>
    </>
  );
}
