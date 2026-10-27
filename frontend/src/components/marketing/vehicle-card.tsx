import Link from "next/link";
import { ArrowRight, Check, Luggage, Users } from "lucide-react";
import { VehicleIcon } from "@/components/booking/vehicle-icon";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/interpolate";
import type { VehicleClassSummary } from "@/types";

/** Vehicle category card. `detailed` adds features and example models (Fleet page). */
export function VehicleCard({
  summary,
  dict,
  locale,
  detailed,
}: {
  summary: VehicleClassSummary;
  dict: Dictionary;
  locale: Locale;
  detailed?: boolean;
}) {
  const t = dict.pages.fleet;
  const info = dict.vehicleClass[summary.vehicleClass];

  return (
    <Card padding="none" interactive className="flex flex-col overflow-hidden">
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-linear-to-br from-brand-900 to-brand-700">
        <div aria-hidden className="absolute -end-8 -top-8 size-32 rounded-full bg-accent/15" />
        <VehicleIcon vehicleClass={summary.vehicleClass} className="relative size-14 text-accent" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-h4 font-bold text-foreground">{info.name}</h3>
          <p className="text-[0.9375rem] text-muted-foreground">{info.body}</p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-foreground">
          <li className="flex items-center gap-2">
            <Users aria-hidden className="size-4 text-subtle-foreground" />
            {interpolate(t.passengers, { count: summary.seats })}
          </li>
          <li className="flex items-center gap-2">
            <Luggage aria-hidden className="size-4 text-subtle-foreground" />
            {interpolate(t.luggage, { count: summary.luggageCapacity })}
          </li>
        </ul>

        {detailed && (
          <>
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-subtle-foreground">{t.features}</h4>
              <ul className="flex flex-col gap-1.5">
                {summary.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check aria-hidden className="size-4 text-success" />
                    {dict.vehicleFeature[feature]}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-subtle-foreground">{t.examples}</h4>
              <p dir="ltr" className="text-sm text-foreground rtl:text-right">
                {summary.exampleModels.join(" · ")}
              </p>
            </div>
          </>
        )}

        <div className="mt-auto flex justify-end border-t border-border pt-4">
          <Link
            href={`${localizePath("/book", locale)}?class=${summary.vehicleClass}`}
            className={buttonStyles({ variant: "primary", size: "sm" })}
            aria-label={`${dict.common.bookNow} — ${info.name}`}
          >
            {dict.common.bookNow}
            <ArrowRight aria-hidden className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
