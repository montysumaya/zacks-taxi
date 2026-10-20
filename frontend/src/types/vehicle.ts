import type { ID, ISODateString, Money, VehicleClass } from "./common";

export type VehicleStatus = "active" | "maintenance" | "inactive";

export type VehicleFeature =
  | "air_conditioning"
  | "wifi"
  | "child_seat"
  | "wheelchair_accessible"
  | "phone_charger";

export interface Vehicle {
  id: ID;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vehicleClass: VehicleClass;
  seats: number;
  luggageCapacity: number;
  status: VehicleStatus;
  features: VehicleFeature[];
  imageUrl?: string;
  /** Document expiry dates — drive the expiry indicators in the back-office. */
  registrationExpiresAt?: ISODateString;
  insuranceExpiresAt?: ISODateString;
  inspectionExpiresAt?: ISODateString;
  lastServiceAt?: ISODateString;
  mileageKm?: number;
}

/** Marketing/pricing summary of a vehicle class, used for fleet listings. */
export interface VehicleClassSummary {
  vehicleClass: VehicleClass;
  exampleModels: string[];
  seats: number;
  luggageCapacity: number;
  features: VehicleFeature[];
  startingFare: Money;
}
