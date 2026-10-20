import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/en/design-system", "/ar/design-system", "/en/bookings/", "/ar/bookings/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
