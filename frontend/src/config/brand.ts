/**
 * Brand identity and business details. Colors live as design tokens in
 * `src/app/globals.css`; everything else brand-specific lives here.
 *
 * Fields with `placeholder: true` render with a visible "Placeholder" label
 * until real, verified details replace them.
 */
export const brand = {
  name: { en: "Zacks", ar: "زاكس" },
  contact: {
    phone: { display: "+961 70 062 162", href: "tel:+96170062162", placeholder: false },
    /** Every booking request and contact message is sent to this number. */
    whatsapp: { display: "+961 70 062 162", href: "https://wa.me/96170062162", placeholder: false },
    email: { display: "info@zacks.taxi", href: "mailto:info@zacks.taxi", placeholder: false },
    address: {
      display: { en: "Damascus Main Road, Aley, Lebanon", ar: "طريق الشام العام، عاليه، لبنان" },
      placeholder: false,
    },
    hours: {
      display: { en: "Operating hours to be confirmed", ar: "ساعات العمل قيد التأكيد" },
      placeholder: true,
    },
  },
  country: "LB",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
