"use client";

import { createContext, useContext, type ReactNode } from "react";
import { localeMeta, type Locale } from "@/i18n/config";
import type { ClientDictionary } from "@/i18n/dictionaries/en";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: ClientDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: ClientDictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext value={{ locale, dir: localeMeta[locale].dir, dict }}>
      {children}
    </I18nContext>
  );
}

/** Access the active locale and dictionary from Client Components. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
