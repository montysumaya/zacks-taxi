import type { PricingConfig } from "@/types";

export { calculateFare } from "@/features/pricing/fare";

/** Illustrative default tariff (USD). Editable in the back-office Pricing screen. */
export function defaultPricing(updatedAt: string): PricingConfig {
  return {
    currency: "USD",
    tariffs: [
      { vehicleClass: "economy", baseFare: 2.5, perKm: 0.55, perMinute: 0.08, minimumFare: 6 },
      { vehicleClass: "comfort", baseFare: 3.5, perKm: 0.75, perMinute: 0.1, minimumFare: 9 },
      { vehicleClass: "business", baseFare: 7, perKm: 1.25, perMinute: 0.15, minimumFare: 18 },
      { vehicleClass: "van", baseFare: 8, perKm: 1.4, perMinute: 0.15, minimumFare: 22 },
    ],
    airportPickupFee: 4,
    airportDropoffFee: 4,
    zones: [
      { id: "zone_beirut", name: { en: "Greater Beirut", ar: "بيروت الكبرى" }, surcharge: 0, active: true },
      { id: "zone_metn", name: { en: "Metn & Keserwan", ar: "المتن وكسروان" }, surcharge: 1, active: true },
      { id: "zone_north", name: { en: "North Lebanon", ar: "الشمال" }, surcharge: 3, active: true },
      { id: "zone_south", name: { en: "South Lebanon", ar: "الجنوب" }, surcharge: 3, active: true },
      { id: "zone_bekaa", name: { en: "Bekaa", ar: "البقاع" }, surcharge: 4, active: false },
    ],
    rules: [
      { id: "rule_night", kind: "night", name: { en: "Night rate", ar: "تعرفة الليل" }, percent: 20, window: "22:00–06:00", active: true },
      { id: "rule_peak", kind: "peak", name: { en: "Weekday rush hour", ar: "ساعة الذروة" }, percent: 10, window: "Mon–Fri 07:30–09:30", active: false },
      { id: "rule_holiday", kind: "holiday", name: { en: "Public holidays", ar: "العطل الرسمية" }, percent: 15, window: "All day", active: false },
    ],
    updatedAt,
  };
}

