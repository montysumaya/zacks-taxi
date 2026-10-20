"use client";

import { ArrowDownUp, Circle, Landmark, MapPin } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { TEXT_LIMITS } from "@/features/booking/validation";
import { localize } from "@/lib/format";
import { places } from "@/mocks/fixtures/places";
import type { Place } from "@/types";
import { PlaceCombobox } from "../place-combobox";
import { RouteMapPreview } from "../route-map-preview";
import type { StepProps } from "./types";

const quickPicks: Place[] = [places.airport, places.downtown, places.hamra, places.achrafieh, places.jounieh, places.byblos];

export function LocationsStep({ draft, change, errorFor, t }: StepProps) {
  const { locale, dict } = useI18n();

  function pick(place: Place) {
    if (!draft.pickup) change({ pickup: place }, ["pickup"]);
    else if (!draft.dropoff && place.id !== draft.pickup.id) change({ dropoff: place }, ["dropoff"]);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-3">
        <PlaceCombobox
          label={dict.booking.pickup}
          placeholder={dict.booking.pickupPlaceholder}
          value={draft.pickup}
          onChange={(pickup) => change({ pickup }, ["pickup", "dropoff"])}
          error={errorFor("pickup")}
          icon={<Circle aria-hidden className="fill-current" />}
          excludeId={draft.dropoff?.id}
        />
        <PlaceCombobox
          label={dict.booking.dropoff}
          placeholder={dict.booking.dropoffPlaceholder}
          value={draft.dropoff}
          onChange={(dropoff) => change({ dropoff }, ["dropoff"])}
          error={errorFor("dropoff")}
          icon={<MapPin aria-hidden />}
          excludeId={draft.pickup?.id}
        />
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={dict.booking.swap}
          onClick={() => change({ pickup: draft.dropoff, dropoff: draft.pickup }, ["pickup", "dropoff"])}
          className="absolute end-2 top-[3.35rem] z-10 rounded-full bg-surface shadow-sm"
        >
          <ArrowDownUp />
        </Button>
      </div>

      {(!draft.pickup || !draft.dropoff) && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">{t.quickPicks}</p>
          <div className="flex flex-wrap gap-2">
            {quickPicks
              .filter((p) => p.id !== draft.pickup?.id && p.id !== draft.dropoff?.id)
              .map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => pick(place)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
                >
                  {localize(place.name, locale)}
                </button>
              ))}
          </div>
          <p className="text-xs text-subtle-foreground">{dict.booking.locationsHint}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.landmark} optionalLabel={dict.common.optional} error={errorFor("pickupLandmark")}>
          <Input
            value={draft.pickupLandmark}
            onChange={(e) => change({ pickupLandmark: e.target.value }, ["pickupLandmark"])}
            placeholder={t.landmarkPlaceholder}
            startAdornment={<Landmark aria-hidden />}
            maxLength={TEXT_LIMITS.pickupLandmark}
          />
        </Field>
        <Field
          label={t.instructions}
          optionalLabel={dict.common.optional}
          error={errorFor("pickupInstructions")}
          className="sm:col-span-2 sm:row-start-2"
        >
          <Textarea
            value={draft.pickupInstructions}
            onChange={(e) => change({ pickupInstructions: e.target.value }, ["pickupInstructions"])}
            placeholder={t.instructionsPlaceholder}
            maxLength={TEXT_LIMITS.pickupInstructions}
            className="min-h-20"
          />
        </Field>
      </div>

      <RouteMapPreview
        pickup={draft.pickup}
        dropoff={draft.dropoff}
        title={t.mapTitle}
        caption={t.mapCaption}
        emptyLabel={t.mapEmpty}
        className="lg:hidden"
      />
    </div>
  );
}
