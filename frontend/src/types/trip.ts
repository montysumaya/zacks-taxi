import type { GeoPoint, ID, ISODateString, Money } from "./common";

export type TripStatus =
  | "driver_en_route"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface TripRating {
  score: number;
  comment?: string;
  ratedAt: ISODateString;
}

export interface Trip {
  id: ID;
  bookingId: ID;
  driverId: ID;
  vehicleId: ID;
  status: TripStatus;
  driverAssignedAt: ISODateString;
  driverArrivedAt?: ISODateString;
  startedAt?: ISODateString;
  endedAt?: ISODateString;
  actualDistanceKm?: number;
  actualDurationMinutes?: number;
  route?: GeoPoint[];
  finalFare?: Money;
  customerRating?: TripRating;
}
