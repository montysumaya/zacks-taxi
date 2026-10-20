# ADR 0001 — Operations dashboard: Next.js vs Laravel Filament

- **Status:** Proposed — awaiting approval
- **Date:** 2026-10-20
- **Context:** Phase 4 (taxi office admin dashboard UI)

## Question

The Phase 4 dashboard is being built as a frontend prototype in the existing Next.js app. Should this
Next.js dashboard become the production back-office, or should the operational screens be rebuilt in
Laravel Filament on top of the upcoming Laravel API?

We must not end up running **two production dashboards**. Whatever we pick, there is exactly one.

## Options

### A. Next.js dashboard is the production back-office

Every screen talks to the Laravel API through the `services/` contracts already in this repo.

| Pros | Cons |
| --- | --- |
| One design system and one codebase for customer site and back-office | Every CRUD screen needs its own API endpoints, request validation, resources and policies **plus** the UI — roughly double the work per screen |
| Full control over highly interactive UX (dispatch board, maps, live updates) | Authorization must be enforced in the API *and* mirrored in the UI; easy to drift |
| Shared TypeScript models, i18n and RTL already in place | Larger admin API surface exposed over HTTP → more security review, rate limiting, CSRF/session work |
| Front-end team can work independently of the Laravel team | Tables, filters, exports, audit trails and bulk actions must be hand-built and maintained |

### B. Laravel Filament is the production back-office

Filament panels sit directly on the Eloquent models; Next.js stays customer-facing only.

| Pros | Cons |
| --- | --- |
| Tables (search, sort, filters, pagination, bulk actions, export), forms and validation come largely for free | A second UI stack (Livewire/Blade + Tailwind) with its own styling; brand consistency with the public site is weaker (acceptable for an internal tool) |
| Authorization lives in one place: Laravel policies + roles/permissions, used by both the API and the panel | Very custom, real-time screens (dispatch board, map) need custom Filament pages/Livewire components |
| No admin API to expose; smaller attack surface | The team needs Livewire/Filament skills |
| Much faster to build and change; operational screens are standard CRUD + reports | Arabic/RTL works (Filament ships translations and RTL), but custom widgets need RTL care |
| Audit logs, notifications, exports and imports have mature packages | |

### C. Hybrid (Filament for CRUD, Next.js for dispatch)

Rejected as a default: it creates **two production back-office surfaces** with two auth flows, two permission
checks and two UIs for staff to learn. Only revisit if the dispatch board proves impossible in Filament.

## Assessment

About **10 of the 12** Phase 4 areas are standard back-office CRUD and reporting: bookings management,
drivers, vehicles, customers, pricing, payments, reports, staff and permissions, notifications and settings.
Filament is purpose-built for these and keeps validation and authorization next to the data. Only the
**dispatch center** is a genuinely custom, real-time screen. Filament can handle it with a custom page, Livewire
polling or Laravel Reverb broadcasting, and a map component once a map provider is chosen.

Building the same screens in Next.js would roughly double backend work. Each screen would need an API
surface, and permissions would have to be enforced twice. That buys little for an internal tool used by a
small office team.

## Recommendation

1. **Production back-office: Laravel Filament** (single admin panel, Laravel policies + roles/permissions,
   Arabic and English, RTL enabled). The dispatch center becomes a custom Filament page.
2. **The Phase 4 Next.js dashboard is a clickable prototype and UX specification only.** It shows the
   information architecture, the workflows, the permission model and the visual design. It is **not deployed
   to production**:
   - it lives under `/[lang]/admin` and is clearly bannered as a frontend-only prototype;
   - it is **disabled in production builds** unless `ADMIN_PROTOTYPE=true` is set explicitly (it then returns 404);
   - it is excluded from the sitemap and blocked in `robots.txt`.
3. The **customer-facing** site and booking flow stay in Next.js and consume the Laravel API through the
   existing `services/` contracts.
4. The service contracts and TypeScript types added in Phase 4 stay useful either way. They document the
   operations the Laravel side must support (assign driver, update trip status, settlements, permissions),
   so they act as the API checklist even though Filament will call Eloquent directly.

### If we choose Next.js instead (Option A)

The prototype can be promoted to production: remove the prototype gate, implement `services/api/*`
adapters against Laravel endpoints, and move permission checks to the API (the UI checks are cosmetic).
**In that case, do not build Filament screens for the same operations.**

## Decision needed

Approve Option B (recommended) or Option A before Phase 5 backend work starts, because the choice determines
whether the Laravel phase builds a Filament panel or an admin REST API.
