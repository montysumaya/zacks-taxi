import type { DateRange, ISODateString, Money, VehicleClass } from "./common";

export interface TrendPoint {
  date: ISODateString;
  value: number;
}

export interface DashboardMetrics {
  period: DateRange;
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    /** Percentage change vs. the previous period of equal length. */
    changePct: number;
  };
  revenue: {
    total: Money;
    changePct: number;
  };
  drivers: {
    active: number;
    online: number;
  };
  averageRating: number;
  averagePickupMinutes: number;
  completionRatePct: number;
  bookingsTrend: TrendPoint[];
  revenueByClass: Array<{ vehicleClass: VehicleClass; revenue: Money }>;
}
