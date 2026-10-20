"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, FlaskConical, Info, RefreshCw, SearchX, Star, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { formatLebanesePhone } from "@/features/booking/phone";
import { bookingLifecycle, canCancel, isTerminal, lifecycleIndex, nextStatus, statusTones } from "@/features/booking/status";
import { localizePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney, initials, localize } from "@/lib/format";
import { demoSimulator, services } from "@/services";
import { ServiceError, type Booking, type BookingStatus, type Driver, type Vehicle } from "@/types";
import { VehicleIcon } from "../vehicle-icon";

type ViewState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "ready"; booking: Booking; driver: Driver | null; vehicle: Vehicle | null };

async function loadBooking(reference: string): Promise<ViewState> {
  try {
    const booking = await services.bookings.getByReference(reference);
    const [driver, vehicle] = await Promise.all([
      booking.driverId ? services.drivers.getById(booking.driverId) : null,
      booking.vehicleId ? services.vehicles.getById(booking.vehicleId) : null,
    ]);
    return { kind: "ready", booking, driver, vehicle };
  } catch (error) {
    return error instanceof ServiceError && error.status === 404 ? { kind: "not-found" } : { kind: "error" };
  }
}

export function BookingStatusView({ reference }: { reference: string }) {
  const { locale, dict } = useI18n();
  const { toast } = useToast();
  const t = dict.bookingStatus;
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setState(await loadBooking(reference));
    setRefreshing(false);
  }, [reference]);

  useEffect(() => {
    let ignore = false;
    loadBooking(reference).then((next) => {
      if (!ignore) setState(next);
    });
    return () => {
      ignore = true;
    };
  }, [reference]);

  if (state.kind === "loading") return <StatusSkeleton />;

  if (state.kind === "not-found") {
    return (
      <Card padding="none">
        <EmptyState
          icon={<SearchX aria-hidden />}
          title={t.notFoundTitle}
          description={t.notFoundBody}
          actions={
            <Link href={localizePath("/book", locale)} className={buttonStyles()}>
              {t.newBooking}
            </Link>
          }
        />
      </Card>
    );
  }

  if (state.kind === "error") {
    return (
      <Card padding="none">
        <ErrorState
          title={t.loadFailed}
          description={dict.states.errorBody}
          actions={
            <Button onClick={refresh} loading={refreshing}>
              {dict.common.retry}
            </Button>
          }
        />
      </Card>
    );
  }

  const { booking, driver, vehicle } = state;
  const upcoming = nextStatus(booking.status);

  async function cancel() {
    setCancelling(true);
    try {
      await services.bookings.cancel(booking.id);
      toast({ tone: "success", title: t.cancelled });
      setCancelOpen(false);
      await refresh();
    } catch {
      toast({ tone: "error", title: t.cancelFailed });
    } finally {
      setCancelling(false);
    }
  }

  async function advance() {
    if (!demoSimulator) return;
    setAdvancing(true);
    try {
      await demoSimulator.advance(booking.id);
      toast({ tone: "info", title: t.advanced });
      await refresh();
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <Card padding="lg" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wider text-subtle-foreground uppercase">{t.reference}</span>
              <span className="font-mono text-h3 font-bold tracking-wider" dir="ltr">
                {booking.reference}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={refresh} loading={refreshing}>
              <RefreshCw aria-hidden />
              {t.refresh}
            </Button>
          </div>
          <div role="status" aria-live="polite" className="flex flex-col gap-2">
            <Badge tone={statusTones[booking.status]} dot className="self-start" data-testid="booking-status">
              {dict.status.booking[booking.status]}
            </Badge>
            <p className="text-lead text-foreground">{t.descriptions[booking.status]}</p>
          </div>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            {t.noLiveTracking}
          </p>
        </Card>

        <Card padding="lg">
          <h2 className="mb-5 text-h5 font-bold">{t.timeline}</h2>
          <Timeline booking={booking} />
        </Card>

        {demoSimulator && upcoming && (
          <section className="flex flex-col gap-3 rounded-card border-2 border-dashed border-accent bg-accent-soft p-5">
            <div className="flex items-center gap-2">
              <FlaskConical aria-hidden className="size-5 text-accent-soft-foreground" />
              <h2 className="font-bold text-accent-soft-foreground">{t.demoPanelTitle}</h2>
              <Badge tone="accent" size="sm">
                {dict.common.demo}
              </Badge>
            </div>
            <p className="text-sm text-accent-soft-foreground">{t.demoPanelBody}</p>
            <Button variant="secondary" onClick={advance} loading={advancing} className="self-start">
              {interpolate(t.advance, { status: dict.status.booking[upcoming] })}
            </Button>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {driver && (
          <Card padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-h6 font-bold">{t.driver}</h2>
              <Badge tone="warning" size="sm">
                {t.demoDriver}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name={`${driver.firstName} ${driver.lastName}`} initials={initials(driver.firstName, driver.lastName)} size="lg" />
              <div className="flex flex-col">
                <span className="font-semibold" dir="ltr">
                  {driver.firstName} {driver.lastName}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Star aria-hidden className="size-3.5 fill-accent text-accent" />
                  {driver.rating.toFixed(2)}
                </span>
              </div>
            </div>
            {vehicle && (
              <div className="flex items-center justify-between gap-3 rounded-md bg-surface-muted p-3 text-sm">
                <span className="inline-flex items-center gap-2" dir="ltr">
                  <VehicleIcon vehicleClass={vehicle.vehicleClass} className="size-4 text-subtle-foreground" />
                  {vehicle.make} {vehicle.model} · {vehicle.color}
                </span>
                <span className="font-mono font-semibold" dir="ltr" aria-label={`${t.plate}: ${vehicle.plateNumber}`}>
                  {vehicle.plateNumber}
                </span>
              </div>
            )}
          </Card>
        )}

        <Card padding="lg" className="flex flex-col gap-4">
          <h2 className="text-h6 font-bold">{t.trip}</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <Detail label={dict.booking.pickup}>
              {localize(booking.pickup.name, locale)}
              {(booking.pickupLandmark || booking.pickupInstructions) && (
                <span className="block text-muted-foreground">
                  {[booking.pickupLandmark, booking.pickupInstructions].filter(Boolean).join(" · ")}
                </span>
              )}
            </Detail>
            <Detail label={dict.booking.dropoff}>{localize(booking.dropoff.name, locale)}</Detail>
            <Detail label={dict.booking.when}>
              {booking.type === "immediate" ? dict.booking.now : formatDateTime(booking.scheduledAt, locale)}
            </Detail>
            <Detail label={dict.booking.vehicle}>
              {dict.vehicleClass[booking.vehicleClass].name} · {booking.passengers} {dict.common.seats} · {booking.luggage} {dict.common.bags}
            </Detail>
            {booking.flightNumber && (
              <Detail label={dict.booking.flightNumber}>
                <span dir="ltr">{booking.flightNumber}</span>
              </Detail>
            )}
            <Detail label={dict.booking.fare}>
              <span className="font-semibold tabular-nums">{formatMoney(booking.estimatedFare, locale)}</span> · {dict.paymentMethod[booking.paymentMethod]}
            </Detail>
            <Detail label={dict.bookingFlow.contactSection}>
              {booking.contact.fullName} · <span dir="ltr">{formatLebanesePhone(booking.contact.phone)}</span>
            </Detail>
          </dl>
        </Card>

        <div className="flex flex-col gap-3">
          {canCancel(booking.status) && (
            <Button variant="secondary" onClick={() => setCancelOpen(true)} className="text-danger">
              <X aria-hidden />
              {t.cancel}
            </Button>
          )}
          <Link href={localizePath("/book", locale)} className={buttonStyles({ variant: isTerminal(booking.status) ? "primary" : "ghost" })}>
            {t.newBooking}
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancel}
        loading={cancelling}
        tone="danger"
        title={t.cancelTitle}
        description={t.cancelBody}
        confirmLabel={t.cancelConfirm}
        cancelLabel={t.keep}
      />
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-subtle-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{children}</dd>
    </div>
  );
}

function Timeline({ booking }: { booking: Booking }) {
  const { locale, dict } = useI18n();
  const cancelled = booking.status === "cancelled" || booking.status === "no_show";
  const reached = new Map(booking.statusHistory.map((e) => [e.status, e.at]));
  // When cancelled, show the lifecycle steps that actually happened, then the cancellation.
  const steps: BookingStatus[] = cancelled
    ? [...bookingLifecycle.filter((s) => reached.has(s)), booking.status]
    : [...bookingLifecycle];
  const currentIndex = cancelled ? steps.length - 1 : lifecycleIndex(booking.status);

  return (
    <ol className="flex flex-col">
      {steps.map((status, i) => {
        const done = i < currentIndex || (i === currentIndex && status === "completed");
        const current = i === currentIndex && !done;
        const at = reached.get(status);
        const failed = cancelled && i === steps.length - 1;
        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={current ? "step" : undefined}>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn("absolute start-[0.6875rem] top-7 bottom-1 w-0.5", done ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
                done && "bg-primary text-primary-foreground",
                current && "bg-accent ring-4 ring-accent/25",
                failed && "bg-danger text-white ring-4 ring-danger/20",
                !done && !current && !failed && "border-2 border-border bg-surface",
              )}
            >
              {done && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
              {failed && <X aria-hidden className="size-3.5" strokeWidth={3} />}
              {current && !failed && <span className="size-2 rounded-full bg-accent-foreground" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <span className={cn("font-semibold", !done && !current && !failed ? "text-subtle-foreground" : "text-foreground")}>
                {dict.status.booking[status]}
              </span>
              {at && <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(at, locale, { dateStyle: "medium", timeStyle: "short" })}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" role="status" aria-busy>
      <div className="flex flex-col gap-6">
        <Card padding="lg" className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <SkeletonText lines={2} />
        </Card>
        <Card padding="lg" className="flex flex-col gap-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </Card>
      </div>
      <Skeleton className="h-80 rounded-card" />
    </div>
  );
}
