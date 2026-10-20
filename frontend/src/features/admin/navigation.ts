import type { Permission } from "@/types";

export type AdminNavKey =
  | "overview"
  | "bookings"
  | "dispatch"
  | "drivers"
  | "vehicles"
  | "customers"
  | "pricing"
  | "payments"
  | "reports"
  | "staff"
  | "notifications"
  | "settings";

export type AdminNavGroup = "operations" | "fleet" | "business" | "administration";

export interface AdminNavItem {
  key: AdminNavKey;
  /** Path below /[lang]/admin. */
  path: string;
  group: AdminNavGroup;
  /** Permission needed to see the item and open the page. */
  permission: Permission;
}

export const adminNav: AdminNavItem[] = [
  { key: "overview", path: "", group: "operations", permission: "overview.view" },
  { key: "bookings", path: "/bookings", group: "operations", permission: "bookings.view" },
  { key: "dispatch", path: "/dispatch", group: "operations", permission: "dispatch.manage" },
  { key: "drivers", path: "/drivers", group: "fleet", permission: "drivers.view" },
  { key: "vehicles", path: "/vehicles", group: "fleet", permission: "vehicles.view" },
  { key: "customers", path: "/customers", group: "fleet", permission: "customers.view" },
  { key: "pricing", path: "/pricing", group: "business", permission: "pricing.view" },
  { key: "payments", path: "/payments", group: "business", permission: "payments.view" },
  { key: "reports", path: "/reports", group: "business", permission: "reports.view" },
  { key: "staff", path: "/staff", group: "administration", permission: "staff.manage" },
  { key: "notifications", path: "/notifications", group: "administration", permission: "notifications.view" },
  { key: "settings", path: "/settings", group: "administration", permission: "settings.manage" },
];

export const adminNavGroups: AdminNavGroup[] = ["operations", "fleet", "business", "administration"];

export function adminPath(locale: string, path = "") {
  return `/${locale}/admin${path}`;
}
