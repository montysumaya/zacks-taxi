import type { GeoPoint, ID, ISODateString, LocaleCode } from "./common";

export type DriverStatus = "available" | "on_trip" | "offline" | "suspended";

export interface Driver {
  id: ID;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  status: DriverStatus;
  /** Average rating, 1–5. */
  rating: number;
  totalTrips: number;
  languages: Array<LocaleCode | "fr">;
  licenseNumber: string;
  licenseExpiresAt: ISODateString;
  vehicleId?: ID;
  currentLocation?: GeoPoint;
  joinedAt: ISODateString;
}
