"use client";

import { useEffect, useState } from "react";
import { Clock, Info, RefreshCw, Route } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { bookingDraftStore } from "@/features/booking/draft-store";
import { draftToQuoteRequest } from "@/features/booking/to-input";
import { formatMoney, formatNumber } from "@/lib/format";
import { services } from "@/services";
import type { Money } from "@/types";
import { VehicleIcon } from "../vehicle-icon";
import type { StepProps } from "./types";

/** Fetches a quote whenever the draft has none (first visit or trip edited). */
export function FareStep({ draft, change, errorFor, t }: StepProps) {
  const { locale, dict } = useI18n();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const quote = draft.quote;

  useEffect(() => {
    if (quote) return;
    let ignore = false;
    services.fares
      // Read the freshest draft from the store rather than a render-time closure.
      .getQuote(draftToQuoteRequest(bookingDraftStore.getSnapshot()))
      .then((result) => {
        if (!ignore) change({ quote: result }, ["quote"]);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, [quote, attempt, change]);

  if (failed && !quote) {
    return (
      <ErrorState
        compact
        title={t.fareError}
        description={dict.states.errorBody}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            <RefreshCw aria-hidden />
            {t.recalculate}
          </Button>
        }
      />
    );
  }

  if (!quote) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4">
        <span className="sr-only">{t.calculating}</span>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
        {errorFor("quote") && <p className="text-sm text-danger">{errorFor("quote")}</p>}
      </div>
    );
  }

  const money = (m: Money) => formatMoney(m, locale);
  const lines: Array<[string, Money]> = [
    [t.baseFare, quote.breakdown.baseFare],
    [t.distanceFare, quote.breakdown.distanceFare],
    [t.timeFare, quote.breakdown.timeFare],
    ...quote.breakdown.surcharges.map((s): [string, Money] => [t.surcharges[s.type], s.amount]),
  ];
  const lineSum = lines.reduce((sum, [, m]) => sum + m.amount, 0);
  const minimumAdjustment = Math.round((quote.total.amount - lineSum) * 100) / 100;

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<Route aria-hidden />} label={t.distance} value={`${formatNumber(quote.distanceKm, locale, { maximumFractionDigits: 1 })} ${dict.common.km}`} />
        <Metric icon={<Clock aria-hidden />} label={t.duration} value={`${formatNumber(quote.durationMinutes, locale)} ${dict.common.minutes}`} />
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-surface-inverse p-5 text-white">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white/10 text-accent">
          <VehicleIcon vehicleClass={quote.vehicleClass} className="size-6" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm text-white/70">{dict.vehicleClass[quote.vehicleClass].name}</span>
          <span className="text-h2 font-extrabold tabular-nums" data-testid="fare-total">
            {money(quote.total)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-white/60">{t.currency}</span>
          <Badge tone="accent" size="sm">
            {quote.total.currency}
          </Badge>
        </div>
      </div>

      <section aria-labelledby="fare-breakdown" className="rounded-lg border border-border">
        <h3 id="fare-breakdown" className="border-b border-border px-4 py-3 text-sm font-semibold">
          {t.breakdown}
        </h3>
        <dl className="divide-y divide-border text-sm">
          {lines.map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium tabular-nums">{money(amount)}</dd>
            </div>
          ))}
          {minimumAdjustment > 0 && (
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{t.minimumFare}</dt>
              <dd className="font-medium tabular-nums">{money({ amount: minimumAdjustment, currency: quote.total.currency })}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 bg-surface-muted px-4 py-3">
            <dt className="font-semibold">{t.total}</dt>
            <dd className="font-bold tabular-nums">{money(quote.total)}</dd>
          </div>
        </dl>
      </section>

      <div role="note" className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm text-warning-soft-foreground">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{t.illustrativeTitle}</p>
          <p>{t.illustrativeBody}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </span>
      <span className="text-h4 font-bold tabular-nums">{value}</span>
    </div>
  );
}
