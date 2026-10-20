import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";
import { locales, localizePath } from "@/i18n/config";

const paths = ["/", "/services", "/fleet", "/airport-transfers", "/about", "/contact", "/faq", "/book", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: new URL(localizePath(path, "en"), siteUrl).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, new URL(localizePath(path, l), siteUrl).toString()])),
    },
  }));
}
