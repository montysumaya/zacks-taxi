import type { Metadata } from "next";
import { siteUrl } from "@/config/brand";
import { localeMeta, locales, localizePath, type Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

interface PageMetaInput {
  /** App-relative path without locale, e.g. "/fleet". */
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
}

/** Per-page metadata with canonical URL, hreflang alternates and Open Graph. */
export async function pageMetadata({ path, title, description, noIndex }: PageMetaInput): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const languages = Object.fromEntries(
    locales.map((l) => [localeMeta[l].intl.split("-u-")[0], localizePath(path, l)]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: localizePath(path, locale),
      languages: { ...languages, "x-default": localizePath(path, "en") },
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title,
      description,
      url: localizePath(path, locale),
      locale: ogLocale(locale),
      alternateLocale: locales.filter((l) => l !== locale).map(ogLocale),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

function ogLocale(locale: Locale) {
  return locale === "ar" ? "ar_LB" : "en_LB";
}

export const metadataBase = new URL(siteUrl);
