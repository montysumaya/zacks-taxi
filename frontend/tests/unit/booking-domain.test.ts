import { describe, expect, it } from "vitest";
import { applyDraftPatch, initialDraft, type BookingDraft } from "@/features/booking/draft";
import { formatLebanesePhone, normalizeLebanesePhone } from "@/features/booking/phone";
import { canCancel, nextStatus } from "@/features/booking/status";
import { draftToCreateInput } from "@/features/booking/to-input";
import { firstInvalidStep, validateStep, type ValidationContext } from "@/features/booking/validation";
import { places } from "@/mocks/fixtures/places";
import { vehicleClassSummaries } from "@/mocks/fixtures/vehicles";
import type { FareQuote } from "@/types";
import { wizardSteps } from "@/features/booking/draft";

const NOW = new Date("2026-10-20T12:00:00").getTime();
const ctx: ValidationContext = { now: NOW, classes: vehicleClassSummaries };

const quote = { id: "quo_1", total: { amount: 20, currency: "USD" } } as FareQuote;

const complete: BookingDraft = {
  ...initialDraft,
  step: "review",
  pickup: places.hamra,
  dropoff: places.airport,
  vehicleClass: "comfort",
  quote,
  customer: { fullName: "Lara Mansour", phone: "70 123 456", email: "", specialInstructions: "" },
  acceptTerms: true,
};

describe("phone", () => {
  it.each([
    ["70 123 456", "+96170123456"],
    ["03 123 456", "+9613123456"],
    ["+961 71 234567", "+96171234567"],
    ["00961 1 234567", "+9611234567"],
    ["81-123-456", "+96181123456"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeLebanesePhone(input)).toBe(expected);
  });

  it.each(["", "123", "72 123 456", "+44 20 7946 0000", "70 12a 456"])("rejects %s", (input) => {
    expect(normalizeLebanesePhone(input)).toBeNull();
  });

  it("formats for display", () => {
    expect(formatLebanesePhone("+96170123456")).toBe("+961 70 123 456");
    expect(formatLebanesePhone("+9613123456")).toBe("+961 3 123 456");
  });
});

describe("validateStep", () => {
  it("requires both locations and that they differ", () => {
    expect(validateStep("locations", initialDraft, ctx)).toEqual({ pickup: "pickupRequired", dropoff: "dropoffRequired" });
    expect(validateStep("locations", { ...initialDraft, pickup: places.hamra, dropoff: places.hamra }, ctx)).toEqual({
      dropoff: "samePlace",
    });
  });

  it("enforces scheduling window", () => {
    const base = { ...complete, rideType: "scheduled" as const };
    expect(validateStep("details", { ...base, date: "", time: "" }, ctx)).toMatchObject({ date: "dateRequired", time: "timeRequired" });
    expect(validateStep("details", { ...base, date: "2026-10-20", time: "12:10" }, ctx)).toMatchObject({ time: "tooSoon" });
    expect(validateStep("details", { ...base, date: "2027-03-01", time: "12:00" }, ctx)).toMatchObject({ date: "tooFar" });
    expect(validateStep("details", { ...base, date: "2026-10-21", time: "09:00" }, ctx)).toEqual({});
  });

  it("checks vehicle capacity against the group", () => {
    expect(validateStep("details", { ...complete, vehicleClass: null }, ctx)).toMatchObject({ vehicleClass: "vehicleRequired" });
    expect(validateStep("details", { ...complete, passengers: 6 }, ctx)).toMatchObject({ vehicleClass: "capacityExceeded" });
    expect(validateStep("details", { ...complete, passengers: 6, vehicleClass: "van" }, ctx)).toEqual({});
  });

  it("requires a valid flight number for airport pickups only", () => {
    const fromAirport = { ...complete, pickup: places.airport, dropoff: places.hamra };
    expect(validateStep("details", fromAirport, ctx)).toMatchObject({ flightNumber: "flightRequired" });
    expect(validateStep("details", { ...fromAirport, flightNumber: "not a flight" }, ctx)).toMatchObject({ flightNumber: "flightInvalid" });
    expect(validateStep("details", { ...fromAirport, flightNumber: "ME 211" }, ctx)).toEqual({});
    // Drop-off at the airport: optional.
    expect(validateStep("details", complete, ctx)).toEqual({});
  });

  it("validates customer details", () => {
    const empty = { ...complete, customer: { fullName: "", phone: "", email: "bad", specialInstructions: "" } };
    expect(validateStep("customer", empty, ctx)).toEqual({ fullName: "nameRequired", phone: "phoneInvalid", email: "emailInvalid" });
    expect(validateStep("customer", complete, ctx)).toEqual({});
  });

  it("requires a quote and accepted terms", () => {
    expect(validateStep("fare", { ...complete, quote: null }, ctx)).toEqual({ quote: "quoteRequired" });
    expect(validateStep("review", { ...complete, acceptTerms: false }, ctx)).toEqual({ acceptTerms: "termsRequired" });
  });

  it("finds the first invalid step", () => {
    expect(firstInvalidStep(wizardSteps, complete, ctx)).toBeNull();
    expect(firstInvalidStep(wizardSteps, { ...complete, dropoff: null }, ctx)).toBe("locations");
  });
});

describe("draft", () => {
  it("invalidates the quote when a priced field changes", () => {
    expect(applyDraftPatch(complete, { dropoff: places.byblos }).quote).toBeNull();
    expect(applyDraftPatch(complete, { vehicleClass: "business" }).quote).toBeNull();
    expect(applyDraftPatch(complete, { notes: "Gate 3" }).quote).toBe(quote);
    expect(applyDraftPatch(complete, { vehicleClass: "comfort" }).quote).toBe(quote);
  });

  it("maps a complete draft to the API input", () => {
    const input = draftToCreateInput({ ...complete, notes: "  ", flightNumber: "me 211" }, NOW);
    expect(input).toMatchObject({
      fareQuoteId: "quo_1",
      type: "immediate",
      serviceType: "airport",
      contact: { fullName: "Lara Mansour", phone: "+96170123456", email: undefined },
      vehicleClass: "comfort",
      flightNumber: "ME 211",
      notes: undefined,
    });
  });
});

describe("status lifecycle", () => {
  it("advances in order and stops at completion", () => {
    expect(nextStatus("pending")).toBe("confirmed");
    expect(nextStatus("driver_assigned")).toBe("driver_en_route");
    expect(nextStatus("in_progress")).toBe("completed");
    expect(nextStatus("completed")).toBeNull();
    expect(nextStatus("cancelled")).toBeNull();
  });

  it("allows cancelling only before the trip starts", () => {
    expect(canCancel("driver_arrived")).toBe(true);
    expect(canCancel("in_progress")).toBe(false);
    expect(canCancel("cancelled")).toBe(false);
  });
});
