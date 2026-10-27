import { localeMeta, type Locale } from "@/i18n/config";

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(localeMeta[locale].intl, options).format(value);
}
