import type { VehicleClassSummary } from "@/types";

/**
 * Vehicle categories shown on the website. Informational only — fares are
 * quoted by customer service when they reply to a booking request.
 */
export const vehicleClasses: VehicleClassSummary[] = [
  {
    vehicleClass: "economy",
    exampleModels: ["Toyota Corolla", "Hyundai Elantra"],
    seats: 4,
    luggageCapacity: 2,
    features: ["air_conditioning", "phone_charger"],
  },
  {
    vehicleClass: "comfort",
    exampleModels: ["Toyota Camry", "Kia K5"],
    seats: 4,
    luggageCapacity: 3,
    features: ["air_conditioning", "phone_charger"],
  },
  {
    vehicleClass: "business",
    exampleModels: ["Mercedes E-Class", "BMW 5 Series"],
    seats: 4,
    luggageCapacity: 3,
    features: ["air_conditioning", "phone_charger", "child_seat"],
  },
  {
    vehicleClass: "van",
    exampleModels: ["Mercedes V-Class", "Hyundai Staria"],
    seats: 7,
    luggageCapacity: 6,
    features: ["air_conditioning", "phone_charger", "child_seat"],
  },
];
