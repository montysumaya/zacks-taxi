import "server-only";
import { cacheLife } from "next/cache";
import { services } from "@/services";

/**
 * Cached server-side loaders for public, rarely-changing content.
 * With the Laravel adapter these become the revalidation boundary.
 */
export async function getVehicleClasses() {
  "use cache";
  cacheLife("hours");
  return services.vehicles.listClasses();
}
