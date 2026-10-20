"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ArrowRight, CalendarClock, Circle, MapPin, Plane, PlaneLanding, PlaneTakeoff, Zap } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { initialDraft, type RideType } from "@/features/booking/draft";
import { bookingDraftStore } from "@/features/booking/draft-store";
import { validateStep, type StepErrors } from "@/features/booking/validation";
import { localizePath } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { places } from "@/mocks/fixtures/places";
import type { Place } from "@/types";
import { PlaceCombobox } from "./place-combobox";

type Direction = "from" | "to";

export interface BookingWidgetProps {
  /** "airport" locks one end of the trip to Beirut airport. */
  variant?: "default" | "airport";
  compact?: boolean;
  className?: string;
}

/**
 * Compact booking entry point (hero, airport page). Collects the route, seeds
 * the shared booking draft and hands off to the full wizard at /book.
 */
export function BookingWidget({ variant = "default", compact, className }: BookingWidgetProps) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const t = dict.booking;
  const isAirport = variant === "airport";

  const [rideType, setRideType] = useState<RideType>(isAirport ? "scheduled" : "now");
  const [direction, setDirection] = useState<Direction>("from");
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [errors, setErrors] = useState<StepErrors>({});
  const [navigating, setNavigating] = useState(false);

  const effectivePickup = isAirport && direction === "from" ? places.airport : pickup;
  const effectiveDropoff = isAirport && direction === "to" ? places.airport : dropoff;
  const errorText = (key: "pickup" | "dropoff") => (errors[key] ? dict.bookingFlow.errors[errors[key]] : undefined);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trip = { ...initialDraft, pickup: effectivePickup, dropoff: effectiveDropoff };
    const next = validateStep("locations", trip, { now: 0, classes: [] });
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-booking-widget] [aria-invalid='true']")?.focus());
      return;
    }
    setNavigating(true);
    bookingDraftStore.update({ rideType, pickup: effectivePickup, dropoff: effectiveDropoff, step: "details" });
    router.push(localizePath("/book", locale));
  }

  return (
    <div data-booking-widget className={cn("rounded-2xl border border-border/70 bg-surface p-5 text-foreground shadow-xl sm:p-6", className)}>
      <div className={compact ? "mb-4" : "mb-5"}>
        <h2 className="text-h4 font-bold">{t.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isAirport ? (
          <SegmentedControl
            legend={t.directionLegend}
            hideLegend
            value={direction}
            onChange={(d) => {
              setDirection(d);
              setErrors({});
            }}
            options={[
              { value: "from", label: t.fromAirport, icon: <PlaneLanding aria-hidden /> },
              { value: "to", label: t.toAirport, icon: <PlaneTakeoff aria-hidden /> },
            ]}
          />
        ) : (
          <SegmentedControl
            legend={t.modeLegend}
            hideLegend
            value={rideType}
            onChange={setRideType}
            options={[
              { value: "now", label: dict.bookingFlow.rideNow.title, icon: <Zap aria-hidden /> },
              { value: "scheduled", label: dict.bookingFlow.rideLater.title, icon: <CalendarClock aria-hidden /> },
            ]}
          />
        )}

        <div className="relative flex flex-col gap-3">
          {isAirport && direction === "from" ? (
            <AirportField label={t.pickup} />
          ) : (
            <PlaceCombobox
              label={t.pickup}
              placeholder={t.pickupPlaceholder}
              value={pickup}
              onChange={(p) => {
                setPickup(p);
                setErrors({});
              }}
              error={errorText("pickup")}
              icon={<Circle aria-hidden className="fill-current" />}
              excludeId={effectiveDropoff?.id}
            />
          )}
          {isAirport && direction === "to" ? (
            <AirportField label={t.dropoff} />
          ) : (
            <PlaceCombobox
              label={t.dropoff}
              placeholder={t.dropoffPlaceholder}
              value={dropoff}
              onChange={(p) => {
                setDropoff(p);
                setErrors({});
              }}
              error={errorText("dropoff")}
              icon={<MapPin aria-hidden />}
              excludeId={effectivePickup?.id}
            />
          )}
          {!isAirport && (
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label={t.swap}
              onClick={() => {
                setPickup(dropoff);
                setDropoff(pickup);
              }}
              className="absolute end-2 top-[3.35rem] z-10 rounded-full bg-surface shadow-sm"
            >
              <ArrowDownUp />
            </Button>
          )}
        </div>

        <Button type="submit" variant="accent" size="lg" fullWidth loading={navigating} className="mt-1">
          {t.submit}
          <ArrowRight aria-hidden className="rtl:-scale-x-100" />
        </Button>
        <p className="text-center text-xs text-subtle-foreground">{t.locationsHint}</p>
      </form>
    </div>
  );
}

function AirportField({ label }: { label: string }) {
  const { locale } = useI18n();
  return (
    <Field label={label}>
      <Input value={places.airport.name[locale]} readOnly startAdornment={<Plane aria-hidden />} className="bg-surface-muted" />
    </Field>
  );
}
