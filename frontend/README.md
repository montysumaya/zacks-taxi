# Masar — Taxi platform frontend

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Arabic (RTL) and English (LTR).

> "Masar" is a working name. All business contact details are placeholders and are rendered with a visible
> "Placeholder" label. Bookings, quotes and contact messages run against a **mock service layer** — no backend.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) — booking domain logic and mock services |
| `npm run build` | Production build |
| `npm run test:e2e` | End-to-end tests (Playwright, local Chrome) — run `npm run build` first |
| `npm run check` | lint + typecheck + unit tests + build |

## Structure

```
src/
  app/
    [lang]/               root layout per locale (<html lang dir>)
      (site)/             public website: home, services, fleet, airport, about, contact, faq, legal
        book/             booking wizard
        bookings/[ref]/   booking status
        design-system/    component showcase (noindex)
    sitemap.ts, robots.ts, icon.svg
  proxy.ts                redirects "/" to the preferred locale (cookie → Accept-Language)
  components/
    ui/                   design-system primitives (button, field, input, modal, toast, …)
    layout/               header, footer, mobile nav, locale switcher
    marketing/            page sections shared by public pages
    booking/              booking widget, wizard steps, status view, route preview
  features/booking/       pure booking domain: draft model, validation, status lifecycle, API mapping
  services/
    contracts/            service interfaces — the only data API the UI uses
    mock/                 in-memory implementation (+ demo status simulator)
  mocks/fixtures/         demo data (places, vehicles, drivers, bookings)
  types/                  domain models (Booking, Driver, Vehicle, Customer, FareQuote, Trip, Payment, …)
  i18n/                   locale config and dictionaries (en / ar)
  config/brand.ts         brand name and business details (placeholders)
  app/globals.css         design tokens (palette → semantic → Tailwind theme)
```

## Connecting the Laravel API

1. Implement `Services` from `src/services/contracts` in `src/services/api/` (map snake_case ↔ camelCase there).
2. Add an `"api"` case in `src/services/index.ts` and set `NEXT_PUBLIC_DATA_SOURCE=api`.
3. `demoSimulator` becomes `null`; the status page hides its demo controls automatically.

UI code never imports from `services/mock` or `mocks/` for data access, so no component changes are needed.

## Rebranding

Edit the palette block at the top of `src/app/globals.css` and the values in `src/config/brand.ts`.
Components consume only semantic tokens (`bg-primary`, `text-muted-foreground`, …).
