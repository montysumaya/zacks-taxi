/**
 * The back-office dashboard is a frontend PROTOTYPE (see
 * docs/decisions/0001-admin-dashboard-nextjs-vs-filament.md). It is available in
 * development, and in production builds only when explicitly enabled with
 * ADMIN_PROTOTYPE=true — so it can never ship as a second production dashboard by accident.
 */
export const adminPrototypeEnabled =
  process.env.NODE_ENV !== "production" || process.env.ADMIN_PROTOTYPE === "true";
