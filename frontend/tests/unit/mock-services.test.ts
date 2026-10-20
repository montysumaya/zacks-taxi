import { describe, expect, it } from "vitest";
import { initialDraft } from "@/features/booking/draft";
import { draftToCreateInput, draftToQuoteRequest } from "@/features/booking/to-input";
import { places } from "@/mocks/fixtures/places";
import { createMockServices } from "@/services/mock";
import { ServiceError } from "@/types";

const draft = {
  ...initialDraft,
  pickup: places.achrafieh,
  dropoff: places.airport,
  vehicleClass: "business" as const,
  customer: { fullName: "Lara Mansour", phone: "70 123 456", email: "lara@example.com", specialInstructions: "" },
  acceptTerms: true,
};

describe("mock booking service", () => {
  it("quotes, creates, looks up, advances and cancels a booking", async () => {
    const { services, simulator } = createMockServices();

    const quote = await services.fares.getQuote(draftToQuoteRequest(draft));
    expect(quote.distanceKm).toBeGreaterThan(0);
    expect(quote.total.currency).toBe("USD");
    expect(quote.breakdown.surcharges.map((s) => s.type)).toContain("airport");

    const created = await services.bookings.create(draftToCreateInput({ ...draft, quote }));
    expect(created.reference).toMatch(/^MSR-[A-Z0-9]{5}$/);
    expect(created.status).toBe("pending");
    expect(created.estimatedFare).toEqual(quote.total);

    const found = await services.bookings.getByReference(created.reference.toLowerCase());
    expect(found.id).toBe(created.id);

    await simulator.advance(created.id); // confirmed
    const assigned = await simulator.advance(created.id); // driver_assigned
    expect(assigned.status).toBe("driver_assigned");
    expect(assigned.driverId).toBeTruthy();
    expect(assigned.statusHistory.map((e) => e.status)).toEqual(["pending", "confirmed", "driver_assigned"]);

    const cancelled = await services.bookings.cancel(created.id, "Plans changed");
    expect(cancelled.status).toBe("cancelled");
    await expect(services.bookings.cancel(created.id)).rejects.toBeInstanceOf(ServiceError);
    await expect(simulator.advance(created.id)).rejects.toMatchObject({ code: "invalid_state" });
  });

  it("rejects bookings with an unknown quote", async () => {
    const { services } = createMockServices();
    const input = draftToCreateInput({ ...draft, quote: { id: "quo_missing" } as never });
    await expect(services.bookings.create(input)).rejects.toMatchObject({ code: "invalid_quote", status: 422 });
  });

  it("returns 404 for unknown references", async () => {
    const { services } = createMockServices();
    await expect(services.bookings.getByReference("MSR-NOPE1")).rejects.toMatchObject({ status: 404 });
  });

  it("searches places in both languages", async () => {
    const { services } = createMockServices();
    expect((await services.places.search("airport")).map((p) => p.id)).toContain("place_bey");
    expect((await services.places.search("جبيل")).map((p) => p.id)).toEqual(["place_byblos"]);
  });
});
