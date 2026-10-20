"use client";

import { Circle, MapPin, Save } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { BookingDraft } from "@/features/booking/draft";
import { formatMoney, localize } from "@/lib/format";
import { RouteMapPreview } from "../route-map-preview";
import { VehicleIcon } from "../vehicle-icon";

/** Sticky desktop sidebar: live route preview plus what's been chosen so far. */
export function TripSummary({ draft, onStartOver }: { draft: BookingDraft; onStartOver: () => void }) {
  const { locale, dict } = useI18n();
  const t = dict.bookingFlow;

  return (
    <aside aria-label={t.summaryTitle} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <h2 className="text-h5 font-bold">{t.summaryTitle}</h2>
      <RouteMapPreview pickup={draft.pickup} dropoff={draft.dropoff} title={t.mapTitle} caption={t.mapCaption} emptyLabel={t.mapEmpty} />
      <ol className="flex flex-col gap-3 text-sm">
        <li className="flex items-start gap-3">
          <Circle aria-hidden className="mt-0.5 size-4 shrink-0 fill-current text-primary" />
          <span className="flex flex-col">
            <span className="text-xs text-subtle-foreground">{dict.booking.pickup}</span>
            <span className="font-medium">{draft.pickup ? localize(draft.pickup.name, locale) : "—"}</span>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-active" />
          <span className="flex flex-col">
            <span className="text-xs text-subtle-foreground">{dict.booking.dropoff}</span>
            <span className="font-medium">{draft.dropoff ? localize(draft.dropoff.name, locale) : "—"}</span>
          </span>
        </li>
      </ol>
      {draft.vehicleClass && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
          <span className="inline-flex items-center gap-2 font-medium">
            <VehicleIcon vehicleClass={draft.vehicleClass} className="size-4 text-subtle-foreground" />
            {dict.vehicleClass[draft.vehicleClass].name}
          </span>
          {draft.quote && <span className="text-base font-bold tabular-nums">{formatMoney(draft.quote.total, locale)}</span>}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
          <Save aria-hidden className="size-3.5" />
          {t.draftSaved}
        </span>
        <button type="button" onClick={onStartOver} className="text-xs font-semibold text-danger hover:underline">
          {t.startOver}
        </button>
      </div>
    </aside>
  );
}
