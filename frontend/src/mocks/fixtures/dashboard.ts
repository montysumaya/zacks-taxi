import type { DashboardMetrics } from "@/types";

const weeklyBookings = [412, 438, 397, 465, 521, 604, 572];

export const dashboardMetrics: Omit<DashboardMetrics, "period"> = {
  bookings: {
    total: 3409,
    completed: 3127,
    cancelled: 164,
    pending: 118,
    changePct: 8.4,
  },
  revenue: { total: { amount: 61840, currency: "USD" }, changePct: 11.2 },
  drivers: { active: 186, online: 74 },
  averageRating: 4.84,
  averagePickupMinutes: 6.5,
  completionRatePct: 95.2,
  bookingsTrend: weeklyBookings.map((value, i) => ({
    date: `2026-10-${String(13 + i).padStart(2, "0")}T00:00:00+03:00`,
    value,
  })),
  revenueByClass: [
    { vehicleClass: "economy", revenue: { amount: 21320, currency: "USD" } },
    { vehicleClass: "comfort", revenue: { amount: 17410, currency: "USD" } },
    { vehicleClass: "business", revenue: { amount: 15080, currency: "USD" } },
    { vehicleClass: "van", revenue: { amount: 8030, currency: "USD" } },
  ],
};
