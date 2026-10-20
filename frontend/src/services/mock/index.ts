import type { Services } from "@/services/contracts";
import { canCancel, nextStatus } from "@/features/booking/status";
import { trips } from "@/mocks/fixtures/bookings";
import { dashboardMetrics } from "@/mocks/fixtures/dashboard";
import { placeList } from "@/mocks/fixtures/places";
import { vehicleClassSummaries } from "@/mocks/fixtures/vehicles";
import {
  ServiceError,
  type Booking,
  type BookingStatus,
  type DriverSettlement,
  type FareQuote,
  type Money,
  type ReportData,
  type VehicleClass,
} from "@/types";
import { calculateFare } from "./fare-calculator";
import { createBrowserStore } from "./persistence";
import { createSeed, type MockDb } from "./seed";
import { bookingReference, mockId, notFoundError, query, respond, validationError } from "./utils";

const QUOTE_TTL_MS = 10 * 60 * 1000;
const CURRENT_CUSTOMER_ID = "cus_001";
/** Commission the office keeps on each trip (illustrative). */
const COMMISSION_RATE = 0.2;
const DAY = 86_400_000;

/**
 * Demo-only controls that a real backend drives on its own (dispatch, driver
 * apps). Never part of the `Services` contract, so UI code must treat it as optional.
 */
export interface BookingSimulator {
  advance(bookingId: string): Promise<Booking>;
}

export interface MockControls {
  /** Wipe local changes and regenerate the demo dataset. */
  reset(): void;
}

/**
 * In-memory implementation of every service contract. The dataset is seeded
 * lazily on first use (so prerendering never reads the clock) and persisted to
 * localStorage in the browser so demo edits survive a refresh.
 */
export function createMockServices(): { services: Services; simulator: BookingSimulator; controls: MockControls } {
  const store = createBrowserStore<MockDb | null>("masar.mock-db.v2", null);
  let db: MockDb | null = null;
  const quotes = new Map<string, FareQuote>();

  function getDb(): MockDb {
    if (!db) {
      const stored = store.read();
      db = stored?.version === 2 ? stored : createSeed(Date.now());
      if (!stored) save();
    }
    return db;
  }
  const save = () => store.write(db);
  const nowIso = () => new Date().toISOString();
  const usd = (amount: number): Money => ({ amount: Math.round(amount * 100) / 100, currency: "USD" });

  function findOrThrow<T extends { id: string }>(items: T[], id: string, entity: string) {
    const item = items.find((i) => i.id === id);
    if (!item) throw notFoundError(entity, id);
    return item;
  }

  function transition(booking: Booking, status: BookingStatus, patch: Partial<Booking> = {}) {
    const now = nowIso();
    Object.assign(booking, patch, {
      status,
      statusHistory: [...booking.statusHistory, { status, at: now }],
      updatedAt: now,
    });
    const d = getDb();
    if (booking.driverId) {
      const driver = d.drivers.find((x) => x.id === booking.driverId);
      if (driver && driver.status !== "suspended") {
        if (["driver_en_route", "driver_arrived", "in_progress"].includes(status)) driver.status = "on_trip";
        if (["completed", "cancelled", "no_show"].includes(status)) driver.status = "available";
      }
    }
    if (status === "completed") {
      d.payments.push({
        id: mockId("pay"),
        bookingId: booking.id,
        customerId: booking.customerId ?? "",
        amount: booking.estimatedFare,
        method: booking.paymentMethod,
        status: "paid",
        paidAt: now,
        createdAt: now,
      });
    }
    if (status === "cancelled") {
      d.notifications.unshift({ id: mockId("ntf"), type: "booking_cancelled", params: { reference: booking.reference }, bookingId: booking.id, createdAt: now, read: false });
    }
    save();
  }

  function price(input: { pickup: Booking["pickup"]; dropoff: Booking["dropoff"]; vehicleClass: VehicleClass; scheduledAt: string }) {
    return calculateFare(input, getDb().pricing);
  }

  const fares: Services["fares"] = {
    async getQuote(request) {
      const now = Date.now();
      const quote: FareQuote = {
        id: mockId("quo"),
        vehicleClass: request.vehicleClass,
        serviceType: request.serviceType,
        pickup: request.pickup,
        dropoff: request.dropoff,
        ...price(request),
        expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
        createdAt: new Date(now).toISOString(),
      };
      quotes.set(quote.id, quote);
      return respond(quote);
    },
    async getQuotes(request) {
      const classes: VehicleClass[] = ["economy", "comfort", "business", "van"];
      return Promise.all(classes.map((vehicleClass) => fares.getQuote({ ...request, vehicleClass })));
    },
  };

  function settlementFor(driverId: string): DriverSettlement {
    const d = getDb();
    const since = d.settlements[driverId]?.lastSettledAt;
    const driverBookings = new Set(d.bookings.filter((b) => b.driverId === driverId).map((b) => b.id));
    const cash = d.payments.filter(
      (p) => p.method === "cash" && p.status === "paid" && driverBookings.has(p.bookingId) && (!since || (p.paidAt ?? p.createdAt) > since),
    );
    const collected = cash.reduce((sum, p) => sum + p.amount.amount, 0);
    return {
      driverId,
      cashCollected: usd(collected),
      commission: usd(collected * COMMISSION_RATE),
      balance: usd(collected * COMMISSION_RATE),
      trips: cash.length,
      status: cash.length === 0 ? "settled" : "pending",
      lastSettledAt: since,
    };
  }

  function bookingIn(b: Booking, from: number, to: number) {
    const t = Date.parse(b.scheduledAt);
    return t >= from && t < to;
  }

  function dailySeries(fromMs: number, days: number, value: (start: number, end: number) => number) {
    return Array.from({ length: days }, (_, i) => {
      const start = fromMs + i * DAY;
      return { date: new Date(start).toISOString(), value: Math.round(value(start, start + DAY) * 100) / 100 };
    });
  }

  const simulator: BookingSimulator = {
    async advance(bookingId) {
      const booking = findOrThrow(getDb().bookings, bookingId, "Booking");
      const next = nextStatus(booking.status);
      if (!next) throw new ServiceError("Booking is already finished", 409, "invalid_state");
      const patch: Partial<Booking> = {};
      if (next === "driver_assigned" && !booking.driverId) {
        const d = getDb();
        const driver =
          d.drivers.find((x) => x.status === "available" && d.vehicles.find((v) => v.id === x.vehicleId)?.vehicleClass === booking.vehicleClass) ??
          d.drivers.find((x) => x.status === "available") ??
          d.drivers[0];
        Object.assign(patch, { driverId: driver.id, vehicleId: driver.vehicleId });
      }
      transition(booking, next, patch);
      return respond(booking);
    },
  };

  const services: Services = {
    bookings: {
      async list(params = {}) {
        const f = params.filters ?? {};
        const from = f.from ? Date.parse(f.from) : -Infinity;
        const to = f.to ? Date.parse(f.to) : Infinity;
        const items = getDb().bookings.filter(
          (b) =>
            (!f.status?.length || f.status.includes(b.status)) &&
            (!f.type || b.type === f.type) &&
            (!f.source || (b.source ?? "web") === f.source) &&
            (!f.vehicleClass || b.vehicleClass === f.vehicleClass) &&
            (!f.customerId || b.customerId === f.customerId) &&
            (!f.driverId || b.driverId === f.driverId) &&
            (!f.unassigned || !b.driverId) &&
            Date.parse(b.scheduledAt) >= from &&
            Date.parse(b.scheduledAt) <= to,
        );
        return respond(
          query(items, params, {
            searchable: (b) => [b.reference, b.contact.fullName, b.contact.phone, b.pickup.name.en, b.pickup.name.ar, b.dropoff.name.en, b.dropoff.name.ar],
            sorters: {
              scheduledAt: (b) => b.scheduledAt,
              createdAt: (b) => b.createdAt,
              estimatedFare: (b) => b.estimatedFare.amount,
              reference: (b) => b.reference,
              status: (b) => b.status,
            },
            defaultSort: "-scheduledAt",
          }),
        );
      },
      async getById(id) {
        return respond(findOrThrow(getDb().bookings, id, "Booking"));
      },
      async getByReference(reference) {
        const booking = getDb().bookings.find((b) => b.reference.toUpperCase() === reference.trim().toUpperCase());
        if (!booking) throw notFoundError("Booking", reference);
        return respond(booking);
      },
      async create(input) {
        const quote = quotes.get(input.fareQuoteId);
        if (!quote || Date.parse(quote.expiresAt) < Date.now()) {
          throw new ServiceError("Fare quote expired or invalid", 422, "invalid_quote", {
            fareQuoteId: ["The fare quote has expired. Please request a new one."],
          });
        }
        const now = nowIso();
        const booking: Booking = {
          ...input,
          id: mockId("bkg"),
          reference: bookingReference(),
          status: "pending",
          statusHistory: [{ status: "pending", at: now }],
          estimatedFare: quote.total,
          source: "web",
          createdAt: now,
          updatedAt: now,
        };
        const d = getDb();
        d.bookings.push(booking);
        d.notifications.unshift({ id: mockId("ntf"), type: "booking_created", params: { reference: booking.reference }, bookingId: booking.id, createdAt: now, read: false });
        save();
        return respond(booking);
      },
      async createManual(input) {
        if (input.pickup.id === input.dropoff.id) throw validationError("dropoff", "Pickup and destination must differ.");
        const now = nowIso();
        const d = getDb();
        const customer = d.customers.find((c) => c.phone === input.contact.phone);
        const fare = price(input);
        const booking: Booking = {
          id: mockId("bkg"),
          reference: bookingReference(),
          customerId: customer?.id,
          contact: input.contact,
          status: "confirmed",
          statusHistory: [
            { status: "pending", at: now },
            { status: "confirmed", at: now },
          ],
          type: input.type,
          serviceType: input.pickup.kind === "airport" || input.dropoff.kind === "airport" ? "airport" : "city",
          pickup: input.pickup,
          pickupInstructions: input.pickupInstructions,
          dropoff: input.dropoff,
          scheduledAt: input.scheduledAt,
          passengers: input.passengers,
          luggage: input.luggage,
          vehicleClass: input.vehicleClass,
          estimatedFare: fare.total,
          paymentMethod: input.paymentMethod,
          flightNumber: input.flightNumber,
          notes: input.notes,
          source: input.source,
          createdAt: now,
          updatedAt: now,
        };
        d.bookings.push(booking);
        if (customer) customer.totalBookings += 1;
        save();
        return respond(booking);
      },
      async update(id, input) {
        const booking = findOrThrow(getDb().bookings, id, "Booking");
        if (["completed", "cancelled", "no_show", "in_progress"].includes(booking.status)) {
          throw new ServiceError("Booking can no longer be edited", 409, "invalid_state");
        }
        Object.assign(booking, input, { updatedAt: nowIso() });
        if (input.pickup || input.dropoff || input.vehicleClass || input.scheduledAt) {
          booking.estimatedFare = price(booking).total;
        }
        save();
        return respond(booking);
      },
      async assignDriver(id, driverId) {
        const d = getDb();
        const booking = findOrThrow(d.bookings, id, "Booking");
        const driver = findOrThrow(d.drivers, driverId, "Driver");
        if (!canCancel(booking.status)) throw new ServiceError("Booking can no longer be reassigned", 409, "invalid_state");
        if (driver.status === "suspended" || !driver.vehicleId) throw validationError("driverId", "Driver cannot take trips.");
        const status: BookingStatus = ["pending", "confirmed"].includes(booking.status) ? "driver_assigned" : booking.status;
        const now = nowIso();
        if (status !== booking.status) transition(booking, status, { driverId, vehicleId: driver.vehicleId });
        else Object.assign(booking, { driverId, vehicleId: driver.vehicleId, updatedAt: now });
        d.notifications.unshift({
          id: mockId("ntf"),
          type: "driver_assigned",
          params: { reference: booking.reference, driverName: `${driver.firstName} ${driver.lastName}` },
          bookingId: booking.id,
          createdAt: now,
          read: false,
        });
        save();
        return respond(booking);
      },
      async updateStatus(id, status) {
        const booking = findOrThrow(getDb().bookings, id, "Booking");
        if (status === "cancelled") {
          if (!canCancel(booking.status)) throw new ServiceError("Booking can no longer be cancelled", 409, "invalid_state");
        } else if (status !== nextStatus(booking.status) && !(status === "no_show" && booking.status === "driver_arrived")) {
          throw new ServiceError(`Cannot move from ${booking.status} to ${status}`, 409, "invalid_transition");
        }
        if (status === "driver_assigned" && !booking.driverId) throw validationError("driverId", "Assign a driver first.");
        transition(booking, status);
        return respond(booking);
      },
      async cancel(id, reason) {
        const booking = findOrThrow(getDb().bookings, id, "Booking");
        if (!canCancel(booking.status)) {
          throw new ServiceError("Booking can no longer be cancelled", 409, "invalid_state");
        }
        transition(booking, "cancelled", { cancellationReason: reason });
        return respond(booking);
      },
    },

    drivers: {
      async list(params = {}) {
        const status = params.filters?.status;
        const items = getDb().drivers.filter((d) => !status?.length || status.includes(d.status));
        return respond(
          query(items, params, {
            searchable: (d) => [d.firstName, d.lastName, `${d.firstName} ${d.lastName}`, d.phone, d.licenseNumber],
            sorters: { name: (d) => `${d.firstName} ${d.lastName}`, rating: (d) => d.rating, totalTrips: (d) => d.totalTrips, status: (d) => d.status, licenseExpiresAt: (d) => d.licenseExpiresAt },
            defaultSort: "name",
          }),
        );
      },
      async getById(id) {
        return respond(findOrThrow(getDb().drivers, id, "Driver"));
      },
      async create(input) {
        const d = getDb();
        if (d.drivers.some((x) => x.licenseNumber === input.licenseNumber)) throw validationError("licenseNumber", "License number already registered.");
        const driver = { ...input, id: mockId("drv"), rating: 5, totalTrips: 0, joinedAt: nowIso() };
        d.drivers.push(driver);
        save();
        return respond(driver);
      },
      async update(id, input) {
        const d = getDb();
        const driver = findOrThrow(d.drivers, id, "Driver");
        if (input.licenseNumber && d.drivers.some((x) => x.id !== id && x.licenseNumber === input.licenseNumber)) {
          throw validationError("licenseNumber", "License number already registered.");
        }
        Object.assign(driver, input);
        save();
        return respond(driver);
      },
    },

    vehicles: {
      async list(params = {}) {
        const f = params.filters ?? {};
        const items = getDb().vehicles.filter(
          (v) => (!f.vehicleClass?.length || f.vehicleClass.includes(v.vehicleClass)) && (!f.status?.length || f.status.includes(v.status)),
        );
        return respond(
          query(items, params, {
            searchable: (v) => [v.plateNumber, v.make, v.model, `${v.make} ${v.model}`],
            sorters: {
              plateNumber: (v) => v.plateNumber,
              model: (v) => `${v.make} ${v.model}`,
              year: (v) => v.year,
              vehicleClass: (v) => v.vehicleClass,
              nextExpiry: (v) => [v.registrationExpiresAt, v.insuranceExpiresAt, v.inspectionExpiresAt].filter(Boolean).sort()[0],
            },
            defaultSort: "plateNumber",
          }),
        );
      },
      async getById(id) {
        return respond(findOrThrow(getDb().vehicles, id, "Vehicle"));
      },
      async listClasses() {
        // Static marketing summary; does not touch the (lazily seeded) database.
        return respond(vehicleClassSummaries);
      },
      async create(input) {
        const d = getDb();
        if (d.vehicles.some((v) => v.plateNumber === input.plateNumber)) throw validationError("plateNumber", "Plate number already registered.");
        const vehicle = { ...input, id: mockId("veh") };
        d.vehicles.push(vehicle);
        save();
        return respond(vehicle);
      },
      async update(id, input) {
        const d = getDb();
        const vehicle = findOrThrow(d.vehicles, id, "Vehicle");
        if (input.plateNumber && d.vehicles.some((v) => v.id !== id && v.plateNumber === input.plateNumber)) {
          throw validationError("plateNumber", "Plate number already registered.");
        }
        Object.assign(vehicle, input);
        save();
        return respond(vehicle);
      },
    },

    customers: {
      async list(params = {}) {
        return respond(
          query(getDb().customers, params, {
            searchable: (c) => [c.firstName, c.lastName, `${c.firstName} ${c.lastName}`, c.phone, c.email],
            sorters: { name: (c) => `${c.firstName} ${c.lastName}`, totalBookings: (c) => c.totalBookings, createdAt: (c) => c.createdAt },
            defaultSort: "name",
          }),
        );
      },
      async getById(id) {
        return respond(findOrThrow(getDb().customers, id, "Customer"));
      },
      async getCurrent() {
        return respond(findOrThrow(getDb().customers, CURRENT_CUSTOMER_ID, "Customer"));
      },
    },

    fares,

    pricing: {
      async getConfig() {
        return respond(getDb().pricing);
      },
      async updateConfig(config) {
        const invalid = config.tariffs.find((t) => [t.baseFare, t.perKm, t.perMinute, t.minimumFare].some((n) => !(n >= 0)));
        if (invalid) throw validationError("tariffs", "Rates must be zero or positive numbers.");
        const d = getDb();
        d.pricing = { ...structuredClone(config), updatedAt: nowIso() };
        save();
        return respond(d.pricing);
      },
    },

    trips: {
      async getById(id) {
        return respond(findOrThrow(trips, id, "Trip"));
      },
      async getByBookingId(bookingId) {
        return respond(trips.find((t) => t.bookingId === bookingId) ?? null);
      },
    },

    payments: {
      async list(params = {}) {
        const d = getDb();
        const f = params.filters ?? {};
        const byBooking = new Map(d.bookings.map((b) => [b.id, b]));
        const items = d.payments.filter(
          (p) =>
            (!f.method || p.method === f.method) &&
            (!f.status || p.status === f.status) &&
            (!f.driverId || byBooking.get(p.bookingId)?.driverId === f.driverId),
        );
        return respond(
          query(items, params, {
            searchable: (p) => [byBooking.get(p.bookingId)?.reference, p.transactionReference, byBooking.get(p.bookingId)?.contact.fullName],
            sorters: { paidAt: (p) => p.paidAt ?? p.createdAt, amount: (p) => p.amount.amount },
            defaultSort: "-paidAt",
          }),
        );
      },
      async getById(id) {
        return respond(findOrThrow(getDb().payments, id, "Payment"));
      },
      async listByBooking(bookingId) {
        return respond(getDb().payments.filter((p) => p.bookingId === bookingId));
      },
      async listSettlements() {
        return respond(getDb().drivers.map((d) => settlementFor(d.id)));
      },
      async settleDriver(driverId) {
        const d = getDb();
        findOrThrow(d.drivers, driverId, "Driver");
        d.settlements[driverId] = { lastSettledAt: nowIso() };
        save();
        return respond(settlementFor(driverId));
      },
    },

    dashboard: {
      async getMetrics(period) {
        return respond({ period, ...dashboardMetrics });
      },
      async getOverview() {
        const d = getDb();
        const now = Date.now();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const today0 = start.getTime();
        const today = d.bookings.filter((b) => bookingIn(b, today0, today0 + DAY));
        const revenue = (from: number, to: number) =>
          d.bookings.filter((b) => b.status === "completed" && bookingIn(b, from, to)).reduce((s, b) => s + b.estimatedFare.amount, 0);
        return respond({
          date: new Date(now).toISOString(),
          bookingsToday: today.length,
          pending: d.bookings.filter((b) => b.status === "pending").length,
          activeTrips: d.bookings.filter((b) => ["driver_en_route", "driver_arrived", "in_progress"].includes(b.status)).length,
          completedToday: today.filter((b) => b.status === "completed").length,
          cancelledToday: today.filter((b) => b.status === "cancelled" || b.status === "no_show").length,
          driversAvailable: d.drivers.filter((x) => x.status === "available").length,
          driversBusy: d.drivers.filter((x) => x.status === "on_trip").length,
          driversOffline: d.drivers.filter((x) => x.status === "offline" || x.status === "suspended").length,
          revenueToday: usd(revenue(today0, today0 + DAY)),
          revenueYesterday: usd(revenue(today0 - DAY, today0)),
          bookingsTrend: dailySeries(today0 - 13 * DAY, 14, (a, b) => d.bookings.filter((x) => bookingIn(x, a, b)).length),
        });
      },
    },

    reports: {
      async getReport(period) {
        const d = getDb();
        const from = Date.parse(period.from);
        const to = Date.parse(period.to);
        const days = Math.max(1, Math.round((to - from) / DAY));
        const inRange = d.bookings.filter((b) => bookingIn(b, from, to));
        const completed = inRange.filter((b) => b.status === "completed");
        const cancelled = inRange.filter((b) => b.status === "cancelled" || b.status === "no_show");
        const reasons = new Map<string, number>();
        cancelled.forEach((b) => {
          const key = b.status === "no_show" ? "no_show" : (b.cancellationReason ?? "other");
          reasons.set(key, (reasons.get(key) ?? 0) + 1);
        });
        const report: ReportData = {
          from: period.from,
          to: period.to,
          bookingsByDay: dailySeries(from, days, (a, b) => inRange.filter((x) => bookingIn(x, a, b)).length),
          revenueByDay: dailySeries(from, days, (a, b) => completed.filter((x) => bookingIn(x, a, b)).reduce((s, x) => s + x.estimatedFare.amount, 0)),
          revenueTotal: usd(completed.reduce((s, b) => s + b.estimatedFare.amount, 0)),
          bookingsTotal: inRange.length,
          completionRatePct: inRange.length ? (completed.length / inRange.length) * 100 : 0,
          cancellationRatePct: inRange.length ? (cancelled.length / inRange.length) * 100 : 0,
          cancellationsByReason: [...reasons.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
          driverPerformance: d.drivers
            .map((driver) => {
              const own = inRange.filter((b) => b.driverId === driver.id);
              const done = own.filter((b) => b.status === "completed");
              return {
                driverId: driver.id,
                name: `${driver.firstName} ${driver.lastName}`,
                trips: done.length,
                revenue: Math.round(done.reduce((s, b) => s + b.estimatedFare.amount, 0) * 100) / 100,
                rating: driver.rating,
                cancellations: own.filter((b) => b.status === "cancelled" || b.status === "no_show").length,
              };
            })
            .filter((x) => x.trips > 0)
            .sort((a, b) => b.trips - a.trips),
          vehicleUtilization: d.vehicles
            .map((v) => {
              const own = completed.filter((b) => b.vehicleId === v.id);
              const hours = own.reduce((s, b) => s + calculateFare(b, d.pricing).durationMinutes / 60, 0);
              // Utilization against a 10-hour operating day.
              return { vehicleId: v.id, plate: v.plateNumber, label: `${v.make} ${v.model}`, trips: own.length, utilizationPct: Math.min(100, (hours / (days * 10)) * 100) };
            })
            .sort((a, b) => b.utilizationPct - a.utilizationPct),
          bookingsByClass: (["economy", "comfort", "business", "van"] as const).map((vehicleClass) => ({
            vehicleClass,
            count: inRange.filter((b) => b.vehicleClass === vehicleClass).length,
          })),
        };
        return respond(report);
      },
    },

    staff: {
      async list(params = {}) {
        return respond(
          query(getDb().staff, params, {
            searchable: (s) => [s.fullName, s.email],
            sorters: { fullName: (s) => s.fullName, role: (s) => s.role, lastActiveAt: (s) => s.lastActiveAt },
            defaultSort: "fullName",
          }),
        );
      },
      async invite(input) {
        const d = getDb();
        if (d.staff.some((s) => s.email.toLowerCase() === input.email.toLowerCase())) throw validationError("email", "A staff member with this email already exists.");
        const member = { ...input, id: mockId("stf"), status: "invited" as const, createdAt: nowIso() };
        d.staff.push(member);
        save();
        return respond(member);
      },
      async update(id, input) {
        const member = findOrThrow(getDb().staff, id, "Staff member");
        Object.assign(member, input);
        save();
        return respond(member);
      },
      async getPermissions() {
        return respond(getDb().permissions);
      },
      async updatePermissions(matrix) {
        const d = getDb();
        // The admin role always keeps staff management so nobody gets locked out.
        d.permissions = { ...matrix, admin: Array.from(new Set([...matrix.admin, "staff.manage" as const])) };
        save();
        return respond(d.permissions);
      },
    },

    notifications: {
      async list(params = {}) {
        const items = getDb().notifications.filter((n) => !params.filters?.unreadOnly || !n.read);
        return respond(query(items, params, { sorters: { createdAt: (n) => n.createdAt }, defaultSort: "-createdAt" }));
      },
      async markRead(id) {
        findOrThrow(getDb().notifications, id, "Notification").read = true;
        save();
        return respond(undefined);
      },
      async markAllRead() {
        getDb().notifications.forEach((n) => (n.read = true));
        save();
        return respond(undefined);
      },
    },

    settings: {
      async get() {
        return respond(getDb().settings);
      },
      async update(settings) {
        if (!settings.companyName.trim()) throw validationError("companyName", "Company name is required.");
        const d = getDb();
        d.settings = { ...structuredClone(settings), updatedAt: nowIso() };
        save();
        return respond(d.settings);
      },
    },

    places: {
      async search(q, options = {}) {
        const term = q.trim().toLowerCase();
        const matches = placeList.filter(
          (p) => !term || [p.name.en, p.name.ar, p.address?.en, p.address?.ar].some((text) => text?.toLowerCase().includes(term)),
        );
        return respond(matches.slice(0, options.limit ?? 8));
      },
    },

    contact: {
      async submit(request) {
        if (!request.email.includes("@")) {
          throw new ServiceError("Invalid email", 422, "validation_failed", {
            email: ["The email must be a valid email address."],
          });
        }
        return respond({
          id: mockId("msg"),
          reference: bookingReference().replace("MSR", "MSG"),
          receivedAt: nowIso(),
        });
      },
    },
  };

  const controls: MockControls = {
    reset() {
      db = createSeed(Date.now());
      save();
    },
  };

  return { services, simulator, controls };
}
