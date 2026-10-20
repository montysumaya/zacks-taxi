import type { FareBreakdown, FareSurcharge, GeoPoint, Money, Place, PricingConfig, VehicleClass } from "@/types";

/**
 * Illustrative fare model shared by the mock service and the pricing preview.
 * The production price will come from the backend pricing engine.
 */
/** Lebanese roads are winding; straight-line distance under-estimates. */
const ROAD_FACTOR = 1.35;
const AVERAGE_SPEED_KMH = 32;

function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function calculateFare(
  input: { pickup: Place; dropoff: Place; vehicleClass: VehicleClass; scheduledAt: string },
  pricing: PricingConfig,
) {
  const money = (amount: number): Money => ({ amount: Math.round(amount * 100) / 100, currency: pricing.currency });
  const tariff = pricing.tariffs.find((t) => t.vehicleClass === input.vehicleClass) ?? pricing.tariffs[0];
  const distanceKm = Math.round(haversineKm(input.pickup.location, input.dropoff.location) * ROAD_FACTOR * 10) / 10;
  const durationMinutes = Math.max(5, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));

  const distanceFare = distanceKm * tariff.perKm;
  const timeFare = durationMinutes * tariff.perMinute;
  const subtotal = Math.max(tariff.minimumFare, tariff.baseFare + distanceFare + timeFare);

  const surcharges: FareSurcharge[] = [];
  if (input.pickup.kind === "airport" && pricing.airportPickupFee > 0) {
    surcharges.push({ type: "airport", amount: money(pricing.airportPickupFee) });
  } else if (input.dropoff.kind === "airport" && pricing.airportDropoffFee > 0) {
    surcharges.push({ type: "airport", amount: money(pricing.airportDropoffFee) });
  }
  const night = pricing.rules.find((r) => r.kind === "night" && r.active);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Beirut" }).format(
      new Date(input.scheduledAt),
    ),
  );
  if (night && (hour >= 22 || hour < 6)) {
    surcharges.push({ type: "night", amount: money((subtotal * night.percent) / 100) });
  }

  const breakdown: FareBreakdown = {
    baseFare: money(tariff.baseFare),
    distanceFare: money(distanceFare),
    timeFare: money(timeFare),
    surcharges,
  };
  const total = money(subtotal + surcharges.reduce((sum, s) => sum + s.amount.amount, 0));
  return { distanceKm, durationMinutes, breakdown, total };
}
