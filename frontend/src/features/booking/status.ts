import type { BookingStatus } from "@/types";

/** The happy-path lifecycle, in order. `cancelled` / `no_show` are terminal exits. */
export const bookingLifecycle = [
  "pending",
  "confirmed",
  "driver_assigned",
  "driver_en_route",
  "driver_arrived",
  "in_progress",
  "completed",
] as const satisfies readonly BookingStatus[];

const terminal: BookingStatus[] = ["completed", "cancelled", "no_show"];
/** Once the passenger is on board the booking can no longer be cancelled. */
const cancellable: BookingStatus[] = ["pending", "confirmed", "driver_assigned", "driver_en_route", "driver_arrived"];

export function isTerminal(status: BookingStatus) {
  return terminal.includes(status);
}

export function canCancel(status: BookingStatus) {
  return cancellable.includes(status);
}

/** Next status on the happy path, or null when terminal. */
export function nextStatus(status: BookingStatus): BookingStatus | null {
  const index = bookingLifecycle.indexOf(status as (typeof bookingLifecycle)[number]);
  return index >= 0 && index < bookingLifecycle.length - 1 ? bookingLifecycle[index + 1] : null;
}

export function lifecycleIndex(status: BookingStatus) {
  return bookingLifecycle.indexOf(status as (typeof bookingLifecycle)[number]);
}

export type StatusTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

export const statusTones: Record<BookingStatus, StatusTone> = {
  pending: "warning",
  confirmed: "info",
  driver_assigned: "brand",
  driver_en_route: "brand",
  driver_arrived: "accent",
  in_progress: "accent",
  completed: "success",
  cancelled: "danger",
  no_show: "neutral",
};

/** Reason codes staff can record when cancelling (translated by the UI). */
export const cancellationReasons = ["customer_request", "driver_unavailable", "duplicate", "price", "other"] as const;

/** The next status a dispatcher sets by hand from each state. */
export const manualNextStatus: Partial<Record<BookingStatus, Exclude<BookingStatus, "pending">>> = {
  pending: "confirmed",
  driver_assigned: "driver_en_route",
  driver_en_route: "driver_arrived",
  driver_arrived: "in_progress",
  in_progress: "completed",
};
