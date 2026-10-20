import type { VehicleClassSummary } from "@/types";
import { involvesAirport, requestedTime, type BookingDraft, type WizardStep } from "./draft";
import { normalizeLebanesePhone } from "./phone";

/** Error codes are translated by the UI (`dict.bookingFlow.errors[code]`). */
export type ValidationCode =
  | "pickupRequired"
  | "dropoffRequired"
  | "samePlace"
  | "tooLong"
  | "dateRequired"
  | "timeRequired"
  | "tooSoon"
  | "tooFar"
  | "vehicleRequired"
  | "capacityExceeded"
  | "flightRequired"
  | "flightInvalid"
  | "quoteRequired"
  | "nameRequired"
  | "phoneInvalid"
  | "emailInvalid"
  | "termsRequired";

export type FieldKey =
  | "pickup"
  | "dropoff"
  | "pickupLandmark"
  | "pickupInstructions"
  | "date"
  | "time"
  | "vehicleClass"
  | "flightNumber"
  | "notes"
  | "quote"
  | "fullName"
  | "phone"
  | "email"
  | "specialInstructions"
  | "acceptTerms";

export type StepErrors = Partial<Record<FieldKey, ValidationCode>>;

export interface ValidationContext {
  now: number;
  classes: VehicleClassSummary[];
}

export const MIN_LEAD_MINUTES = 30;
export const MAX_ADVANCE_DAYS = 90;
export const TEXT_LIMITS = { pickupLandmark: 120, pickupInstructions: 300, notes: 300, specialInstructions: 300 } as const;

const FLIGHT_PATTERN = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function tooLong(errors: StepErrors, draft: BookingDraft, field: keyof typeof TEXT_LIMITS) {
  const value = field === "specialInstructions" ? draft.customer.specialInstructions : draft[field];
  if (value.length > TEXT_LIMITS[field]) errors[field] = "tooLong";
}

/** Pure, synchronous validation for one wizard step. Empty object = valid. */
export function validateStep(step: WizardStep, draft: BookingDraft, ctx: ValidationContext): StepErrors {
  const errors: StepErrors = {};

  switch (step) {
    case "ride":
      break;

    case "locations":
      if (!draft.pickup) errors.pickup = "pickupRequired";
      if (!draft.dropoff) errors.dropoff = "dropoffRequired";
      if (draft.pickup && draft.dropoff && draft.pickup.id === draft.dropoff.id) errors.dropoff = "samePlace";
      tooLong(errors, draft, "pickupLandmark");
      tooLong(errors, draft, "pickupInstructions");
      break;

    case "details": {
      if (draft.rideType === "scheduled") {
        if (!draft.date) errors.date = "dateRequired";
        if (!draft.time) errors.time = "timeRequired";
        if (draft.date && draft.time) {
          const when = requestedTime(draft, ctx.now).getTime();
          if (Number.isNaN(when)) errors.date = "dateRequired";
          else if (when < ctx.now + MIN_LEAD_MINUTES * 60_000) errors.time = "tooSoon";
          else if (when > ctx.now + MAX_ADVANCE_DAYS * 86_400_000) errors.date = "tooFar";
        }
      }
      if (!draft.vehicleClass) errors.vehicleClass = "vehicleRequired";
      else {
        const info = ctx.classes.find((c) => c.vehicleClass === draft.vehicleClass);
        if (info && (draft.passengers > info.seats || draft.luggage > info.luggageCapacity)) {
          errors.vehicleClass = "capacityExceeded";
        }
      }
      const flight = draft.flightNumber.trim();
      if (draft.pickup?.kind === "airport" && !flight) errors.flightNumber = "flightRequired";
      else if (flight && involvesAirport(draft) && !FLIGHT_PATTERN.test(flight)) errors.flightNumber = "flightInvalid";
      tooLong(errors, draft, "notes");
      break;
    }

    case "fare":
      if (!draft.quote) errors.quote = "quoteRequired";
      break;

    case "customer":
      if (draft.customer.fullName.trim().length < 2) errors.fullName = "nameRequired";
      if (!normalizeLebanesePhone(draft.customer.phone)) errors.phone = "phoneInvalid";
      if (draft.customer.email.trim() && !EMAIL_PATTERN.test(draft.customer.email.trim())) errors.email = "emailInvalid";
      tooLong(errors, draft, "specialInstructions");
      break;

    case "review":
      if (!draft.acceptTerms) errors.acceptTerms = "termsRequired";
      break;
  }

  return errors;
}

/** First step (in order) that has errors — used to guard deep links and the final submit. */
export function firstInvalidStep(
  steps: readonly WizardStep[],
  draft: BookingDraft,
  ctx: ValidationContext,
): WizardStep | null {
  return steps.find((step) => Object.keys(validateStep(step, draft, ctx)).length > 0) ?? null;
}
