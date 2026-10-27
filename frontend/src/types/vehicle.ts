import type { VehicleClass } from "./common";

export type VehicleFeature =
  | "air_conditioning"
  | "wifi"
  | "child_seat"
  | "wheelchair_accessible"
  | "phone_charger";

/** Marketing summary of a vehicle class, used for fleet listings. */
export interface VehicleClassSummary {
  vehicleClass: VehicleClass;
  exampleModels: string[];
  seats: number;
  luggageCapacity: number;
  features: VehicleFeature[];
}
