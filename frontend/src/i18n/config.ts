export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookie = "NEXT_LOCALE";

export const localeMeta: Record<
  Locale,
  { dir: "ltr" | "rtl"; label: string; intl: string }
> = {
  en: { dir: "ltr", label: "English", intl: "en-LB" },
  // Western digits are the norm for prices and phone numbers in Lebanon.
  ar: { dir: "rtl", label: "العربية", intl: "ar-LB-u-nu-latn" },
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return localeMeta[locale].dir;
}

/** Prefix an app-relative path with a locale: ("/fleet", "ar") -> "/ar/fleet". */
export function localizePath(path: string, locale: Locale) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Replace the locale segment of a pathname that already has one. */
export function switchLocalePath(pathname: string, locale: Locale) {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  return segments.join("/") || "/";
}
