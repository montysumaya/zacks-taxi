import type {
  CurrencyCode,
  ID,
  ISODateString,
  Money,
  Place,
  VehicleClass,
} from "./common";
import type { ServiceType } from "./booking";

export type FareSurchargeType = "airport" | "night" | "peak" | "toll" | "waiting";

export interface FareSurcharge {
  type: FareSurchargeType;
  amount: Money;
}

export interface FareBreakdown {
  baseFare: Money;
  distanceFare: Money;
  timeFare: Money;
  surcharges: FareSurcharge[];
  discount?: Money;
}

export interface FareQuote {
  id: ID;
  vehicleClass: VehicleClass;
  serviceType: ServiceType;
  pickup: Place;
  dropoff: Place;
  distanceKm: number;
  durationMinutes: number;
  breakdown: FareBreakdown;
  total: Money;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

export interface FareQuoteRequest {
  pickup: Place;
  dropoff: Place;
  stops?: Place[];
  scheduledAt: ISODateString;
  vehicleClass: VehicleClass;
  serviceType: ServiceType;
  currency?: CurrencyCode;
}
