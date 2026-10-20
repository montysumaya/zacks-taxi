import type {
  ID,
  ISODateString,
  Money,
  PaymentMethod,
  Place,
  VehicleClass,
} from "./common";

/** Full booking lifecycle, from request to completion. */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "driver_assigned"
  | "driver_en_route"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingType = "immediate" | "scheduled";

/** Where the booking came from. */
export type BookingSource = "web" | "phone" | "walk_in";

export type ServiceType = "city" | "airport" | "intercity" | "hourly";

/** Who to contact about the booking (may differ from the account holder). */
export interface BookingContact {
  fullName: string;
  /** E.164, e.g. "+96170123456". */
  phone: string;
  email?: string;
}

export interface BookingStatusEvent {
  status: BookingStatus;
  at: ISODateString;
}

export interface Booking {
  id: ID;
  /** Human-friendly reference shown to customers, e.g. "MSR-7K2Q9". */
  reference: string;
  customerId?: ID;
  contact: BookingContact;
  status: BookingStatus;
  statusHistory: BookingStatusEvent[];
  type: BookingType;
  serviceType: ServiceType;
  pickup: Place;
  /** Free-text landmark near the pickup, e.g. "Opposite the pharmacy". */
  pickupLandmark?: string;
  /** Building name, floor, entrance or gate. */
  pickupInstructions?: string;
  dropoff: Place;
  stops?: Place[];
  scheduledAt: ISODateString;
  passengers: number;
  luggage: number;
  vehicleClass: VehicleClass;
  fareQuoteId?: ID;
  estimatedFare: Money;
  paymentMethod: PaymentMethod;
  driverId?: ID;
  vehicleId?: ID;
  tripId?: ID;
  flightNumber?: string;
  /** Notes for the driver. */
  notes?: string;
  /** Requests for dispatch (accessibility, child seat, etc.). */
  specialInstructions?: string;
  cancellationReason?: string;
  source?: BookingSource;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateBookingInput {
  fareQuoteId: ID;
  type: BookingType;
  serviceType: ServiceType;
  contact: BookingContact;
  pickup: Place;
  pickupLandmark?: string;
  pickupInstructions?: string;
  dropoff: Place;
  stops?: Place[];
  scheduledAt: ISODateString;
  passengers: number;
  luggage: number;
  vehicleClass: VehicleClass;
  paymentMethod: PaymentMethod;
  flightNumber?: string;
  notes?: string;
  specialInstructions?: string;
}
