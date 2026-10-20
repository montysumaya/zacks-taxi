import type { FareQuote, PaymentMethod, Place, VehicleClass } from "@/types";

export const wizardSteps = ["ride", "locations", "details", "fare", "customer", "review"] as const;
export type WizardStep = (typeof wizardSteps)[number];

export type RideType = "now" | "scheduled";

/**
 * Everything the customer has entered so far. Persisted locally so a refresh
 * or an accidental navigation never loses progress.
 */
export interface BookingDraft {
  version: 1;
  step: WizardStep;
  rideType: RideType;
  pickup: Place | null;
  pickupLandmark: string;
  pickupInstructions: string;
  dropoff: Place | null;
  /** Local date "YYYY-MM-DD" and time "HH:mm" (scheduled rides only). */
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  vehicleClass: VehicleClass | null;
  flightNumber: string;
  notes: string;
  paymentMethod: PaymentMethod;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    specialInstructions: string;
  };
  acceptTerms: boolean;
  /** Latest fare estimate; cleared whenever trip inputs change. */
  quote: FareQuote | null;
}

export const initialDraft: BookingDraft = {
  version: 1,
  step: "ride",
  rideType: "now",
  pickup: null,
  pickupLandmark: "",
  pickupInstructions: "",
  dropoff: null,
  date: "",
  time: "",
  passengers: 1,
  luggage: 1,
  vehicleClass: null,
  flightNumber: "",
  notes: "",
  paymentMethod: "cash",
  customer: { fullName: "", phone: "", email: "", specialInstructions: "" },
  acceptTerms: false,
  quote: null,
};

/** Fields that change the price; editing any of them invalidates the quote. */
const pricedFields: Array<keyof BookingDraft> = ["rideType", "pickup", "dropoff", "date", "time", "vehicleClass"];

export function applyDraftPatch(draft: BookingDraft, patch: Partial<BookingDraft>): BookingDraft {
  const next = { ...draft, ...patch };
  if (!("quote" in patch) && pricedFields.some((key) => key in patch && patch[key] !== draft[key])) {
    next.quote = null;
  }
  return next;
}

export function stepIndex(step: WizardStep) {
  return wizardSteps.indexOf(step);
}

export function involvesAirport(draft: Pick<BookingDraft, "pickup" | "dropoff">) {
  return draft.pickup?.kind === "airport" || draft.dropoff?.kind === "airport";
}

/** The moment the ride is requested for, computed at call time (never during render). */
export function requestedTime(draft: Pick<BookingDraft, "rideType" | "date" | "time">, now = Date.now()) {
  return draft.rideType === "now" ? new Date(now) : new Date(`${draft.date}T${draft.time}`);
}
