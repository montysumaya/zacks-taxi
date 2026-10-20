import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "./config";
import { clientKeys, type ClientDictionary, type Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

/** Resolve the active locale from the `[lang]` root segment (Server Components only). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getDictionary(locale?: Locale) {
  return dictionaries[locale ?? (await getLocale())]();
}

/** Strip page and legal content before handing the dictionary to the client. */
export function toClientDictionary(dict: Dictionary): ClientDictionary {
  return Object.fromEntries(clientKeys.map((key) => [key, dict[key]])) as ClientDictionary;
}

export type { ClientDictionary, Dictionary };
