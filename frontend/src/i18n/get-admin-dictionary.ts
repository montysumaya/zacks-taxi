import type { Locale } from "./config";
import type { AdminDictionary } from "./dictionaries/en/admin";
import { getLocale } from "./get-dictionary";

const dictionaries: Record<Locale, () => Promise<AdminDictionary>> = {
  en: () => import("./dictionaries/en/admin").then((m) => m.default),
  ar: () => import("./dictionaries/ar/admin").then((m) => m.default),
};

/** Back-office strings — kept separate so they never ship with the public site. */
export async function getAdminDictionary(locale?: Locale) {
  return dictionaries[locale ?? (await getLocale())]();
}

export type { AdminDictionary };
