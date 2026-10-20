import type { AdminDictionary } from "@/i18n/dictionaries/en/admin";
import { interpolate } from "@/i18n/interpolate";
import type { StaffNotification } from "@/types";

export function notificationMessage(n: StaffNotification, t: AdminDictionary) {
  return interpolate(t.notifications.messages[n.type], {
    reference: n.params.reference ?? "",
    driver: n.params.driverName ?? "",
    minutes: n.params.minutes ?? 0,
    plate: n.params.vehiclePlate ?? "",
    days: n.params.days ?? 0,
  });
}
