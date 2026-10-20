import type { AdminDictionary } from "@/i18n/dictionaries/en/admin";
import { interpolate } from "@/i18n/interpolate";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "5 min ago" / "in 2 h" relative to `now` (pass the clock in; never read it during render). */
export function relativeTime(iso: string, now: number, t: AdminDictionary["time"]) {
  const diff = Date.parse(iso) - now;
  const abs = Math.abs(diff);
  if (abs < MINUTE) return t.justNow;
  if (diff > 0) {
    return abs < HOUR ? interpolate(t.inMinutes, { count: Math.round(abs / MINUTE) }) : interpolate(t.inHours, { count: Math.round(abs / HOUR) });
  }
  if (abs < HOUR) return interpolate(t.minutesAgo, { count: Math.round(abs / MINUTE) });
  if (abs < DAY) return interpolate(t.hoursAgo, { count: Math.round(abs / HOUR) });
  return interpolate(t.daysAgo, { count: Math.round(abs / DAY) });
}

export type ExpiryState = "ok" | "expiring" | "expired";

export function expiryState(iso: string | undefined, now: number, warnDays = 30): { state: ExpiryState; days: number } {
  if (!iso) return { state: "ok", days: Infinity };
  const days = Math.ceil((Date.parse(iso) - now) / DAY);
  return { state: days < 0 ? "expired" : days <= warnDays ? "expiring" : "ok", days };
}

/** Compact numbers for chart axes: 0 / 950 / 1.2K. */
export function compactNumber(value: number, intl: string) {
  return new Intl.NumberFormat(intl, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export { DAY, HOUR, MINUTE };
