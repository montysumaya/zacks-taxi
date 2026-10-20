import type { BookingSource, BookingStatus, BookingType } from "./booking";
import type { CurrencyCode, ID, ISODateString, LocaleCode, LocalizedText, Money, PaymentMethod, Place, VehicleClass } from "./common";
import type { DriverStatus } from "./driver";

/* ---------------------------------------------------------------- Staff --- */

export type StaffRole = "admin" | "dispatcher" | "accountant" | "support";

export const permissions = [
  "overview.view",
  "bookings.view",
  "bookings.manage",
  "dispatch.manage",
  "drivers.view",
  "drivers.manage",
  "vehicles.view",
  "vehicles.manage",
  "customers.view",
  "pricing.view",
  "pricing.manage",
  "payments.view",
  "payments.manage",
  "reports.view",
  "staff.manage",
  "notifications.view",
  "settings.manage",
] as const;

export type Permission = (typeof permissions)[number];

export type PermissionMatrix = Record<StaffRole, Permission[]>;

export interface StaffMember {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status: "active" | "invited" | "suspended";
  lastActiveAt?: ISODateString;
  createdAt: ISODateString;
}

/* -------------------------------------------------------------- Pricing --- */

export interface VehicleTariff {
  vehicleClass: VehicleClass;
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
}

export interface ServiceZone {
  id: ID;
  name: LocalizedText;
  /** Fixed amount added to trips that start or end in the zone. */
  surcharge: number;
  active: boolean;
}

export type PricingRuleKind = "night" | "peak" | "holiday" | "weather";

export interface PricingRule {
  id: ID;
  kind: PricingRuleKind;
  name: LocalizedText;
  /** Percentage added to the subtotal, e.g. 20 = +20%. */
  percent: number;
  /** Human-readable window, e.g. "22:00–06:00". */
  window: string;
  active: boolean;
}

export interface PricingConfig {
  currency: CurrencyCode;
  tariffs: VehicleTariff[];
  airportPickupFee: number;
  airportDropoffFee: number;
  zones: ServiceZone[];
  rules: PricingRule[];
  updatedAt: ISODateString;
}

/* ------------------------------------------------------------- Payments --- */

export interface DriverSettlement {
  driverId: ID;
  /** Cash collected by the driver and not yet handed over. */
  cashCollected: Money;
  /** Company commission on those trips. */
  commission: Money;
  /** Positive: driver owes the office. */
  balance: Money;
  trips: number;
  status: "pending" | "settled";
  lastSettledAt?: ISODateString;
}

/* -------------------------------------------------------- Notifications --- */

export type NotificationType = "booking_created" | "scheduled_reminder" | "driver_assigned" | "booking_cancelled" | "document_expiring";

export interface StaffNotification {
  id: ID;
  type: NotificationType;
  /** Values the UI interpolates into the localized message. */
  params: { reference?: string; driverName?: string; minutes?: number; vehiclePlate?: string; days?: number };
  bookingId?: ID;
  createdAt: ISODateString;
  read: boolean;
}

/* ------------------------------------------------------------- Settings --- */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface BusinessHours {
  day: Weekday;
  open: string;
  close: string;
  closed: boolean;
}

export interface CompanySettings {
  companyName: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  serviceAreas: string[];
  businessHours: BusinessHours[];
  /** Round-the-clock dispatch overrides business hours for ride requests. */
  dispatch24h: boolean;
  defaultLocale: LocaleCode;
  enabledLocales: LocaleCode[];
  primaryCurrency: CurrencyCode;
  showSecondaryCurrency: boolean;
  /** Manually maintained display rate (LBP per USD). Illustrative, not a market feed. */
  lbpPerUsd: number;
  notificationPrefs: Record<NotificationType, boolean>;
  updatedAt: ISODateString;
}

/* ----------------------------------------------------- Overview/reports --- */

export interface OperationsOverview {
  date: ISODateString;
  bookingsToday: number;
  pending: number;
  activeTrips: number;
  completedToday: number;
  cancelledToday: number;
  driversAvailable: number;
  driversBusy: number;
  driversOffline: number;
  revenueToday: Money;
  revenueYesterday: Money;
  bookingsTrend: Array<{ date: ISODateString; value: number }>;
}

export interface ReportData {
  from: ISODateString;
  to: ISODateString;
  bookingsByDay: Array<{ date: ISODateString; value: number }>;
  revenueByDay: Array<{ date: ISODateString; value: number }>;
  revenueTotal: Money;
  bookingsTotal: number;
  completionRatePct: number;
  cancellationRatePct: number;
  cancellationsByReason: Array<{ reason: string; count: number }>;
  driverPerformance: Array<{ driverId: ID; name: string; trips: number; revenue: number; rating: number; cancellations: number }>;
  vehicleUtilization: Array<{ vehicleId: ID; plate: string; label: string; trips: number; utilizationPct: number }>;
  bookingsByClass: Array<{ vehicleClass: VehicleClass; count: number }>;
}

/* ---------------------------------------------------- Staff booking input --- */

/** Booking created by office staff (phone or walk-in); price is computed server-side. */
export interface StaffCreateBookingInput {
  source: Exclude<BookingSource, "web">;
  type: BookingType;
  contact: { fullName: string; phone: string; email?: string };
  pickup: Place;
  pickupInstructions?: string;
  dropoff: Place;
  scheduledAt: ISODateString;
  passengers: number;
  luggage: number;
  vehicleClass: VehicleClass;
  paymentMethod: PaymentMethod;
  flightNumber?: string;
  notes?: string;
}

export type UpdateBookingInput = Partial<
  Pick<
    StaffCreateBookingInput,
    "pickup" | "pickupInstructions" | "dropoff" | "scheduledAt" | "passengers" | "luggage" | "vehicleClass" | "paymentMethod" | "flightNumber" | "notes" | "contact"
  >
>;

export interface DriverInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status: DriverStatus;
  languages: Array<LocaleCode | "fr">;
  licenseNumber: string;
  licenseExpiresAt: ISODateString;
  vehicleId?: ID;
}

export type BookingStatusUpdate = Exclude<BookingStatus, "pending">;
