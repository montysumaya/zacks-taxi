/**
 * Deterministic, clearly fictional demo dataset for the back-office prototype.
 * Dates are generated relative to `now` so "today" always has activity.
 */
import { bookingLifecycle, cancellationReasons } from "@/features/booking/status";
import { bookings as fixtureBookings, payments as fixturePayments } from "@/mocks/fixtures/bookings";
import { customers as fixtureCustomers, drivers as fixtureDrivers } from "@/mocks/fixtures/people";
import { placeList } from "@/mocks/fixtures/places";
import { vehicles as fixtureVehicles } from "@/mocks/fixtures/vehicles";
import type {
  Booking,
  BookingSource,
  BookingStatus,
  CompanySettings,
  Customer,
  Driver,
  DriverStatus,
  PaymentMethod,
  Payment,
  PermissionMatrix,
  PricingConfig,
  StaffMember,
  StaffNotification,
  Vehicle,
  VehicleClass,
} from "@/types";
import { calculateFare, defaultPricing } from "./fare-calculator";

export interface MockDb {
  version: 2;
  seededAt: string;
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  customers: Customer[];
  payments: Payment[];
  staff: StaffMember[];
  permissions: PermissionMatrix;
  notifications: StaffNotification[];
  pricing: PricingConfig;
  settings: CompanySettings;
  settlements: Record<string, { lastSettledAt: string }>;
}


/** Small seeded PRNG (mulberry32) so the demo data is stable across reloads. */
function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MALE = ["Karim", "Rami", "Hassan", "Elie", "Tony", "Ziad", "Fadi", "Nadim", "Samir", "Walid", "Bilal", "Marwan", "Imad", "Charbel", "Jad", "Rabih"];
const FEMALE = ["Lara", "Maya", "Nour", "Rita", "Yasmine", "Sara", "Dana", "Rana", "Hiba", "Joelle", "Layal", "Carla"];
const LAST = ["Haddad", "Khoury", "Nasser", "Saliba", "Aoun", "Daou", "Bitar", "Mrad", "Sleiman", "Jaber", "Karam", "Rizk", "Tannous", "Akl", "Hayek", "Najjar", "Fakhoury", "Moussa"];

const MODELS: Record<VehicleClass, Array<[string, string]>> = {
  economy: [["Toyota", "Corolla"], ["Hyundai", "Elantra"], ["Kia", "Cerato"], ["Nissan", "Sunny"]],
  comfort: [["Toyota", "Camry"], ["Kia", "K5"], ["Hyundai", "Sonata"]],
  business: [["Mercedes-Benz", "E-Class"], ["BMW", "5 Series"]],
  van: [["Mercedes-Benz", "V-Class"], ["Hyundai", "Staria"]],
};
const SEATS: Record<VehicleClass, [number, number]> = { economy: [4, 2], comfort: [4, 3], business: [4, 3], van: [7, 6] };
const COLORS = ["White", "Black", "Silver", "Graphite", "Pearl White", "Navy"];

const DAY = 86_400_000;

export function createSeed(nowMs: number): MockDb {
  const rand = prng(20261020);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const iso = (ms: number) => new Date(ms).toISOString();
  const phone = () => `+961${pick(["70", "71", "76", "78", "79", "81", "3"])}${String(int(100000, 999999))}`;
  const now = iso(nowMs);
  const startOfToday = new Date(nowMs);
  startOfToday.setHours(0, 0, 0, 0);
  const today0 = startOfToday.getTime();

  /* Vehicles: fixtures + generated, with varied document expiries. */
  const vehicles: Vehicle[] = fixtureVehicles.map((v) => ({ ...v }));
  const classPlan: VehicleClass[] = ["economy", "economy", "economy", "economy", "economy", "economy", "comfort", "comfort", "comfort", "comfort", "comfort", "business", "business", "business", "van", "van", "van"];
  classPlan.forEach((vehicleClass, i) => {
    const [make, model] = pick(MODELS[vehicleClass]);
    const [seats, luggageCapacity] = SEATS[vehicleClass];
    vehicles.push({
      id: `veh_${String(i + 10).padStart(3, "0")}`,
      make,
      model,
      year: int(2019, 2025),
      color: pick(COLORS),
      plateNumber: `${pick(["B", "M", "G", "N", "T"])} ${int(100000, 999999)}`,
      vehicleClass,
      seats,
      luggageCapacity,
      status: i === 4 || i === 12 ? "maintenance" : i === 9 ? "inactive" : "active",
      features: vehicleClass === "economy" ? ["air_conditioning", "phone_charger"] : ["air_conditioning", "phone_charger", "child_seat"],
    });
  });
  vehicles.forEach((v, i) => {
    v.registrationExpiresAt = iso(nowMs + (i % 7 === 0 ? -int(2, 20) : int(25, 330)) * DAY);
    v.insuranceExpiresAt = iso(nowMs + (i % 5 === 1 ? int(3, 25) : int(40, 360)) * DAY);
    v.inspectionExpiresAt = iso(nowMs + int(-5, 200) * DAY);
    v.lastServiceAt = iso(nowMs - int(10, 160) * DAY);
    v.mileageKm = int(18000, 210000);
  });

  /* Drivers: fixtures + generated, most with a vehicle. */
  const drivers: Driver[] = fixtureDrivers.map((d) => ({ ...d }));
  const statuses: DriverStatus[] = ["available", "available", "available", "on_trip", "on_trip", "offline", "offline", "available", "on_trip", "suspended"];
  for (let i = 0; i < 16; i++) {
    const vehicle = vehicles[i + 5];
    drivers.push({
      id: `drv_${String(i + 10).padStart(3, "0")}`,
      firstName: MALE[i % MALE.length],
      lastName: LAST[(i * 7) % LAST.length],
      phone: phone(),
      email: undefined,
      status: statuses[i % statuses.length],
      rating: Math.round((4.3 + rand() * 0.69) * 100) / 100,
      totalTrips: int(80, 2600),
      languages: rand() > 0.5 ? ["ar", "en"] : rand() > 0.5 ? ["ar", "en", "fr"] : ["ar"],
      licenseNumber: `LB-PUB-${int(100000, 199999)}`,
      licenseExpiresAt: iso(nowMs + (i % 6 === 2 ? int(5, 28) : int(60, 900)) * DAY),
      vehicleId: i === 13 ? undefined : vehicle?.id,
      joinedAt: iso(nowMs - int(60, 2000) * DAY),
    });
  }
  // Drivers off the road can't be on a trip with a vehicle in maintenance.
  drivers.forEach((d) => {
    const v = vehicles.find((x) => x.id === d.vehicleId);
    if (v && v.status !== "active" && d.status === "on_trip") d.status = "offline";
  });

  /* Customers. */
  const customers: Customer[] = fixtureCustomers.map((c) => ({ ...c, totalBookings: 0 }));
  for (let i = 0; i < 46; i++) {
    const female = i % 2 === 0;
    customers.push({
      id: `cus_${String(i + 10).padStart(3, "0")}`,
      firstName: female ? FEMALE[i % FEMALE.length] : MALE[(i * 3) % MALE.length],
      lastName: LAST[(i * 5 + 3) % LAST.length],
      phone: phone(),
      email: rand() > 0.35 ? `customer${i + 10}@example.com` : undefined,
      preferredLocale: rand() > 0.45 ? "ar" : "en",
      preferredCurrency: "USD",
      totalBookings: 0,
      savedPlaces: [],
      createdAt: iso(nowMs - int(5, 700) * DAY),
    });
  }

  /* Bookings across the last four weeks and the next week. */
  const pricing = defaultPricing(now);
  const bookings: Booking[] = fixtureBookings.map((b) => ({ ...b, source: "web" as BookingSource }));
  const payments: Payment[] = fixturePayments.map((p) => ({ ...p }));
  const classesWeighted: VehicleClass[] = ["economy", "economy", "economy", "comfort", "comfort", "business", "van"];
  const methods: PaymentMethod[] = ["cash", "cash", "cash", "cash", "card", "card", "wallet"];
  const sources: BookingSource[] = ["web", "web", "web", "phone", "phone", "walk_in"];
  let seq = 0;

  for (let dayOffset = -27; dayOffset <= 6; dayOffset++) {
    const weekend = new Date(today0 + dayOffset * DAY).getDay() % 6 === 0;
    const count = dayOffset > 0 ? int(2, 5) : int(weekend ? 7 : 4, weekend ? 12 : 9);
    for (let n = 0; n < count; n++) {
      seq += 1;
      const scheduledMs = today0 + dayOffset * DAY + int(5 * 60, 23 * 60 + 30) * 60_000;
      const vehicleClass = pick(classesWeighted);
      const pickup = pick(placeList);
      let dropoff = pick(placeList);
      while (dropoff.id === pickup.id) dropoff = pick(placeList);
      const customer = pick(customers);
      const delta = scheduledMs - nowMs;

      let status: BookingStatus;
      if (delta < -3 * 3_600_000) {
        const r = rand();
        status = r < 0.86 ? "completed" : r < 0.96 ? "cancelled" : "no_show";
      } else if (delta < -40 * 60_000) status = rand() < 0.8 ? "completed" : "in_progress";
      else if (delta < 0) status = pick(["in_progress", "in_progress", "driver_arrived"] as const);
      else if (delta < 45 * 60_000) status = pick(["driver_en_route", "driver_assigned", "pending"] as const);
      else if (delta < 6 * 3_600_000) status = pick(["pending", "confirmed", "driver_assigned"] as const);
      else status = rand() < 0.5 ? "pending" : "confirmed";

      const driverPool = drivers.filter((d) => d.status !== "suspended" && vehicles.find((v) => v.id === d.vehicleId)?.vehicleClass === vehicleClass);
      const needsDriver = !["pending", "confirmed", "cancelled"].includes(status);
      const driver = needsDriver ? pick(driverPool.length ? driverPool : drivers) : undefined;
      const fare = calculateFare({ pickup, dropoff, vehicleClass, scheduledAt: iso(scheduledMs) }, pricing);
      const createdMs = scheduledMs - (dayOffset > 0 || rand() < 0.4 ? int(2, 72) * 3_600_000 : int(4, 25) * 60_000);

      // Status history walks the lifecycle up to the current status.
      const history: Booking["statusHistory"] = [];
      const reachIndex = status === "cancelled" ? int(0, 2) : status === "no_show" ? 4 : bookingLifecycle.indexOf(status as never);
      bookingLifecycle.slice(0, reachIndex + 1).forEach((s, i, arr) => {
        const t = s === "pending" ? createdMs : Math.min(nowMs, scheduledMs - (arr.length - 1 - i) * 6 * 60_000 + (i >= 5 ? (i - 4) * 20 * 60_000 : 0));
        history.push({ status: s, at: iso(Math.max(createdMs, t)) });
      });
      if (status === "cancelled" || status === "no_show") history.push({ status, at: iso(Math.min(nowMs, scheduledMs - int(0, 120) * 60_000)) });

      const id = `bkg_g${String(seq).padStart(4, "0")}`;
      const paymentMethod = pick(methods);
      const booking: Booking = {
        id,
        reference: `MSR-${(0x10000 + seq * 7919).toString(36).toUpperCase().slice(-5).padStart(5, "X")}`,
        customerId: customer.id,
        contact: { fullName: `${customer.firstName} ${customer.lastName}`, phone: customer.phone, email: customer.email },
        status,
        statusHistory: history,
        type: dayOffset > 0 || rand() < 0.35 ? "scheduled" : "immediate",
        serviceType: pickup.kind === "airport" || dropoff.kind === "airport" ? "airport" : "city",
        pickup,
        dropoff,
        scheduledAt: iso(scheduledMs),
        passengers: int(1, SEATS[vehicleClass][0] - 1),
        luggage: int(0, SEATS[vehicleClass][1]),
        vehicleClass,
        estimatedFare: fare.total,
        paymentMethod,
        driverId: driver?.id,
        vehicleId: driver?.vehicleId,
        flightNumber: pickup.kind === "airport" ? `FL ${int(100, 899)}` : undefined,
        cancellationReason: status === "cancelled" ? pick(cancellationReasons) : undefined,
        source: pick(sources),
        createdAt: iso(createdMs),
        updatedAt: history.at(-1)!.at,
      };
      bookings.push(booking);
      customer.totalBookings += 1;

      if (status === "completed") {
        const paidAt = history.at(-1)!.at;
        payments.push({
          id: `pay_g${String(seq).padStart(4, "0")}`,
          bookingId: id,
          customerId: customer.id,
          amount: fare.total,
          method: paymentMethod,
          status: paymentMethod !== "cash" && rand() < 0.04 ? "failed" : "paid",
          provider: paymentMethod === "cash" ? undefined : paymentMethod === "card" ? "card_gateway" : "wallet_provider",
          transactionReference: paymentMethod === "cash" ? undefined : `TXN-${int(10000000, 99999999)}`,
          paidAt,
          createdAt: paidAt,
        });
      }
    }
  }

  /* Staff (fictional) and default permissions. */
  const staff: StaffMember[] = [
    { id: "stf_001", fullName: "Nadine Haddad", email: "nadine@example.com", role: "admin", status: "active", lastActiveAt: iso(nowMs - 6 * 60_000), createdAt: iso(nowMs - 400 * DAY) },
    { id: "stf_002", fullName: "Joe Karam", email: "joe@example.com", role: "dispatcher", status: "active", lastActiveAt: iso(nowMs - 2 * 60_000), createdAt: iso(nowMs - 320 * DAY) },
    { id: "stf_003", fullName: "Hiba Mrad", email: "hiba@example.com", role: "dispatcher", status: "active", lastActiveAt: iso(nowMs - 3 * 3_600_000), createdAt: iso(nowMs - 210 * DAY) },
    { id: "stf_004", fullName: "Michel Aoun", email: "michel@example.com", role: "accountant", status: "active", lastActiveAt: iso(nowMs - DAY), createdAt: iso(nowMs - 380 * DAY) },
    { id: "stf_005", fullName: "Rana Bitar", email: "rana@example.com", role: "support", status: "active", lastActiveAt: iso(nowMs - 40 * 60_000), createdAt: iso(nowMs - 90 * DAY) },
    { id: "stf_006", fullName: "Sami Rizk", email: "sami@example.com", role: "dispatcher", status: "invited", createdAt: iso(nowMs - 2 * DAY) },
    { id: "stf_007", fullName: "Tarek Daou", email: "tarek@example.com", role: "support", status: "suspended", lastActiveAt: iso(nowMs - 60 * DAY), createdAt: iso(nowMs - 300 * DAY) },
  ];

  const permissions: PermissionMatrix = {
    admin: [
      "overview.view", "bookings.view", "bookings.manage", "dispatch.manage", "drivers.view", "drivers.manage", "vehicles.view", "vehicles.manage",
      "customers.view", "pricing.view", "pricing.manage", "payments.view", "payments.manage", "reports.view", "staff.manage", "notifications.view", "settings.manage",
    ],
    dispatcher: ["overview.view", "bookings.view", "bookings.manage", "dispatch.manage", "drivers.view", "vehicles.view", "customers.view", "notifications.view"],
    accountant: ["overview.view", "bookings.view", "payments.view", "payments.manage", "pricing.view", "reports.view", "notifications.view"],
    support: ["overview.view", "bookings.view", "customers.view", "notifications.view"],
  };

  /* Notifications from recent activity. */
  const recent = bookings
    .filter((b) => Math.abs(Date.parse(b.scheduledAt) - nowMs) < 2 * DAY)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 14);
  const notifications: StaffNotification[] = recent.map((b, i) => {
    const driver = drivers.find((d) => d.id === b.driverId);
    const type: StaffNotification["type"] =
      b.status === "cancelled" ? "booking_cancelled" : driver && i % 2 === 0 ? "driver_assigned" : b.type === "scheduled" && Date.parse(b.scheduledAt) > nowMs ? "scheduled_reminder" : "booking_created";
    return {
      id: `ntf_${String(i + 1).padStart(3, "0")}`,
      type,
      params: {
        reference: b.reference,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
        minutes: type === "scheduled_reminder" ? Math.max(5, Math.round((Date.parse(b.scheduledAt) - nowMs) / 60_000)) : undefined,
      },
      bookingId: b.id,
      createdAt: iso(Math.min(nowMs, Date.parse(b.updatedAt))),
      read: i > 4,
    };
  });
  const expiring = vehicles.find((v) => v.insuranceExpiresAt && Date.parse(v.insuranceExpiresAt) - nowMs < 30 * DAY && Date.parse(v.insuranceExpiresAt) > nowMs);
  if (expiring) {
    notifications.push({
      id: "ntf_doc",
      type: "document_expiring",
      params: { vehiclePlate: expiring.plateNumber, days: Math.round((Date.parse(expiring.insuranceExpiresAt!) - nowMs) / DAY) },
      createdAt: iso(nowMs - 5 * 3_600_000),
      read: false,
    });
  }

  const settings: CompanySettings = {
    companyName: "Masar (demo)",
    legalName: "Company name to be confirmed",
    email: "info@example.com",
    phone: "+961 00 000 000",
    address: "Business address to be confirmed",
    serviceAreas: ["Greater Beirut", "Metn & Keserwan", "North Lebanon", "South Lebanon"],
    businessHours: (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((day) => ({
      day,
      open: "07:00",
      close: day === "sun" ? "18:00" : "23:00",
      closed: false,
    })),
    dispatch24h: false,
    defaultLocale: "ar",
    enabledLocales: ["ar", "en"],
    primaryCurrency: "USD",
    showSecondaryCurrency: false,
    lbpPerUsd: 89500,
    notificationPrefs: {
      booking_created: true,
      scheduled_reminder: true,
      driver_assigned: true,
      booking_cancelled: true,
      document_expiring: true,
    },
    updatedAt: now,
  };

  return {
    version: 2,
    seededAt: now,
    bookings,
    drivers,
    vehicles,
    customers,
    payments,
    staff,
    permissions,
    notifications,
    pricing,
    settings,
    settlements: {},
  };
}
