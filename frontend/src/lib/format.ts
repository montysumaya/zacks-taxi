import { localeMeta, type Locale } from "@/i18n/config";
import type { LocalizedText, Money } from "@/types";

export function formatMoney(money: Money, locale: Locale) {
  return new Intl.NumberFormat(localeMeta[locale].intl, {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: money.currency === "LBP" ? 0 : 2,
    minimumFractionDigits: money.currency === "LBP" ? 0 : undefined,
  }).format(money.amount);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(localeMeta[locale].intl, options).format(value);
}

export function formatPercent(value: number, locale: Locale, digits = 1) {
  return new Intl.NumberFormat(localeMeta[locale].intl, {
    style: "percent",
    maximumFractionDigits: digits,
    signDisplay: "exceptZero",
  }).format(value / 100);
}

export function formatDateTime(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
) {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    timeZone: "Asia/Beirut",
    ...options,
  }).format(new Date(iso));
}

export function localize(text: LocalizedText, locale: Locale) {
  return text[locale] ?? text.en;
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
