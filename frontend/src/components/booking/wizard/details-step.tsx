"use client";

import { Plane } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { involvesAirport } from "@/features/booking/draft";
import { TEXT_LIMITS } from "@/features/booking/validation";
import { VehicleClassPicker } from "../vehicle-class-picker";
import type { StepProps } from "./types";

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const LUGGAGE_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

export function DetailsStep({ draft, change, errorFor, classes, t }: StepProps) {
  const { dict } = useI18n();
  const airport = involvesAirport(draft);
  const flightRequired = draft.pickup?.kind === "airport";

  return (
    <div className="flex flex-col gap-6">
      {draft.rideType === "scheduled" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label={dict.booking.date} error={errorFor("date")} required>
            <Input type="date" value={draft.date} onChange={(e) => change({ date: e.target.value }, ["date", "time"])} />
          </Field>
          <Field label={dict.booking.time} error={errorFor("time")} required>
            <Input type="time" step={300} value={draft.time} onChange={(e) => change({ time: e.target.value }, ["date", "time"])} />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label={dict.booking.passengers}>
          <Select value={draft.passengers} onChange={(e) => change({ passengers: Number(e.target.value) }, ["vehicleClass"])}>
            {PASSENGER_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={dict.booking.luggage}>
          <Select value={draft.luggage} onChange={(e) => change({ luggage: Number(e.target.value) }, ["vehicleClass"])}>
            {LUGGAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <VehicleClassPicker
        legend={dict.booking.vehicle}
        classes={classes}
        value={draft.vehicleClass}
        onChange={(vehicleClass) => change({ vehicleClass }, ["vehicleClass"])}
        passengers={draft.passengers}
        luggage={draft.luggage}
        error={errorFor("vehicleClass")}
        tooSmallLabel={t.vehicleTooSmall}
      />

      {airport && (
        <Field
          label={dict.booking.flightNumber}
          hint={dict.booking.flightNumberHint}
          error={errorFor("flightNumber")}
          required={flightRequired}
          optionalLabel={dict.common.optional}
        >
          <Input
            value={draft.flightNumber}
            onChange={(e) => change({ flightNumber: e.target.value.toUpperCase() }, ["flightNumber"])}
            placeholder={dict.booking.flightNumberPlaceholder}
            startAdornment={<Plane aria-hidden />}
            autoComplete="off"
            dir="ltr"
            className="rtl:text-right"
          />
        </Field>
      )}

      <Field label={dict.booking.notes} optionalLabel={dict.common.optional} error={errorFor("notes")}>
        <Textarea
          value={draft.notes}
          onChange={(e) => change({ notes: e.target.value }, ["notes"])}
          placeholder={dict.booking.notesPlaceholder}
          maxLength={TEXT_LIMITS.notes}
          className="min-h-20"
        />
      </Field>
    </div>
  );
}
