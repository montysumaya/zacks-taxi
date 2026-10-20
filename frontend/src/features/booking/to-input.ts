import type { CreateBookingInput, FareQuoteRequest } from "@/types";
import { involvesAirport, requestedTime, type BookingDraft } from "./draft";
import { normalizeLebanesePhone } from "./phone";

/**
 * The seam between UI state and the API: drafts are mapped to service
 * contract inputs here and nowhere else.
 */
export function draftToQuoteRequest(draft: BookingDraft, now = Date.now()): FareQuoteRequest {
  if (!draft.pickup || !draft.dropoff || !draft.vehicleClass) {
    throw new Error("Draft is missing trip details");
  }
  return {
    pickup: draft.pickup,
    dropoff: draft.dropoff,
    vehicleClass: draft.vehicleClass,
    scheduledAt: requestedTime(draft, now).toISOString(),
    serviceType: involvesAirport(draft) ? "airport" : "city",
    currency: "USD",
  };
}

const optional = (value: string) => value.trim() || undefined;

export function draftToCreateInput(draft: BookingDraft, now = Date.now()): CreateBookingInput {
  const phone = normalizeLebanesePhone(draft.customer.phone);
  if (!draft.quote || !phone) throw new Error("Draft is not ready to submit");
  const request = draftToQuoteRequest(draft, now);
  return {
    fareQuoteId: draft.quote.id,
    type: draft.rideType === "now" ? "immediate" : "scheduled",
    serviceType: request.serviceType,
    contact: { fullName: draft.customer.fullName.trim(), phone, email: optional(draft.customer.email) },
    pickup: request.pickup,
    pickupLandmark: optional(draft.pickupLandmark),
    pickupInstructions: optional(draft.pickupInstructions),
    dropoff: request.dropoff,
    scheduledAt: request.scheduledAt,
    passengers: draft.passengers,
    luggage: draft.luggage,
    vehicleClass: request.vehicleClass,
    paymentMethod: draft.paymentMethod,
    flightNumber: involvesAirport(draft) ? optional(draft.flightNumber.toUpperCase()) : undefined,
    notes: optional(draft.notes),
    specialInstructions: optional(draft.customer.specialInstructions),
  };
}
