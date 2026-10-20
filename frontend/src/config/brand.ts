/**
 * Brand identity and business details. Colors live as design tokens in
 * `src/app/globals.css`; everything else brand-specific lives here.
 *
 * IMPORTANT: "Masar" is a working name and every contact detail below is a
 * PLACEHOLDER. Fields with `placeholder: true` render with a visible
 * "Placeholder" label until real, verified details replace them.
 */
export const brand = {
  name: { en: "Masar", ar: "مسار" },
  legalName: { en: "Masar (company name to be confirmed)", ar: "مسار (اسم الشركة قيد التأكيد)" },
  contact: {
    phone: { display: "+961 00 000 000", href: "tel:+96100000000", placeholder: true },
    whatsapp: { display: "+961 00 000 000", href: "https://wa.me/96100000000", placeholder: true },
    email: { display: "info@example.com", href: "mailto:info@example.com", placeholder: true },
    address: {
      display: { en: "Business address to be confirmed, Lebanon", ar: "عنوان الشركة قيد التأكيد، لبنان" },
      placeholder: true,
    },
    hours: {
      display: { en: "Operating hours to be confirmed", ar: "ساعات العمل قيد التأكيد" },
      placeholder: true,
    },
  },
  country: "LB",
  defaultCurrency: "USD",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
