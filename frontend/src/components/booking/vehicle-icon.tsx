import { Briefcase, Bus, Car, CarFront } from "lucide-react";
import type { VehicleClass } from "@/types";

const icons = { economy: Car, comfort: CarFront, business: Briefcase, van: Bus } as const;

export function VehicleIcon({ vehicleClass, className }: { vehicleClass: VehicleClass; className?: string }) {
  const Icon = icons[vehicleClass];
  return <Icon aria-hidden className={className} />;
}
