"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleCheck, Info } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { statusTones } from "@/features/booking/status";
import { localizePath } from "@/i18n/config";
import { formatMoney, localize } from "@/lib/format";
import type { Booking } from "@/types";

export function BookingSuccess({ booking, onBookAnother }: { booking: Booking; onBookAnother: () => void }) {
  const { locale, dict } = useI18n();
  const t = dict.bookingFlow.success;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="flex animate-fade-up flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 text-center shadow-lg sm:p-10">
      <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success ring-8 ring-success-soft/50">
        <CircleCheck aria-hidden className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-h2 font-bold outline-none">
          {t.title}
        </h2>
        <p className="text-muted-foreground">{t.body}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-1 rounded-xl bg-surface-muted p-5">
        <span className="text-xs font-semibold tracking-wider text-subtle-foreground uppercase">{t.reference}</span>
        <span className="font-mono text-h2 font-bold tracking-wider" dir="ltr" data-testid="booking-reference">
          {booking.reference}
        </span>
        <span className="mt-2 flex items-center justify-center gap-2 text-sm">
          <Badge tone={statusTones[booking.status]} dot>
            {dict.status.booking[booking.status]}
          </Badge>
          <span className="tabular-nums text-muted-foreground">{formatMoney(booking.estimatedFare, locale)}</span>
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          {localize(booking.pickup.name, locale)} → {localize(booking.dropoff.name, locale)}
        </span>
      </div>

      <p className="flex max-w-md gap-2 rounded-md bg-info-soft p-3 text-start text-sm text-info-soft-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        {dict.booking.demoNotice}
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href={localizePath(`/bookings/${booking.reference}`, locale)} className={buttonStyles({ size: "lg" })}>
          {t.viewStatus}
        </Link>
        <Button variant="secondary" size="lg" onClick={onBookAnother}>
          {t.bookAnother}
        </Button>
      </div>
    </div>
  );
}
