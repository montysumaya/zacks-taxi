# Masar — Taxi website

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Arabic (RTL) and English (LTR).

An informational website with no backend. The booking form and the contact form do not store or price
anything: they open WhatsApp with the visitor's details prefilled, addressed to the business number, and
customer service replies there manually with availability and the fare.

> "Masar" is a working name. All business contact details are placeholders and are rendered with a visible
> "Placeholder" label. **Set the real WhatsApp number in `src/config/brand.ts` before launch** — every booking
> request is sent to `brand.contact.whatsapp.href`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) — WhatsApp message builder |
| `npm run build` | Production build |
| `npm run test:e2e` | End-to-end tests (Playwright, local Chrome) |
| `npm run check` | lint + typecheck + unit tests + build |

## Structure

```
src/
  app/
    [lang]/               root layout per locale (<html lang dir>)
      (site)/             home, services, fleet, airport, about, contact, faq, legal
        book/             booking request form (sent on WhatsApp)
    sitemap.ts, robots.ts, icon.svg
  proxy.ts                redirects "/" to the preferred locale (cookie → Accept-Language)
  components/
    ui/                   design-system primitives (button, field, input, toast, …)
    layout/               header, footer, mobile nav, locale switcher
    marketing/            page sections shared by public pages
    booking/              booking request form
    contact/              contact form (sent on WhatsApp)
  lib/whatsapp.ts         builds the prefilled WhatsApp message and wa.me link
  i18n/                   locale config and dictionaries (en / ar)
  config/brand.ts         brand name and business details, including the WhatsApp number (placeholders)
  config/fleet.ts         vehicle categories shown on the site (no prices)
  app/globals.css         design tokens (palette → semantic → Tailwind theme)
```

## Rebranding

Edit the palette block at the top of `src/app/globals.css` and the values in `src/config/brand.ts`.
Components consume only semantic tokens (`bg-primary`, `text-muted-foreground`, …).
