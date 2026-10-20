"use client";

import { useMemo } from "react";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { localize } from "@/lib/format";
import { services } from "@/services";
import type { Booking, Driver, Vehicle } from "@/types";
import { useAdmin } from "./admin-provider";

/** Driver and vehicle lookups shared by tables that show assignments. */
export function useFleetLookups(reloadKey: unknown = 0) {
  const drivers = useServiceQuery(() => services.drivers.list({ perPage: 500 }), ["lookup-drivers", reloadKey]);
  const vehicles = useServiceQuery(() => services.vehicles.list({ perPage: 500 }), ["lookup-vehicles", reloadKey]);
  const driverData = drivers.data;
  const vehicleData = vehicles.data;
  const reloadDrivers = drivers.reload;
  const reloadVehicles = vehicles.reload;
  return useMemo(() => {
    const driverMap = new Map<string, Driver>((driverData?.data ?? []).map((d) => [d.id, d]));
    const vehicleMap = new Map<string, Vehicle>((vehicleData?.data ?? []).map((v) => [v.id, v]));
    return {
      drivers: driverData?.data ?? [],
      vehicles: vehicleData?.data ?? [],
      driverMap,
      vehicleMap,
      driverName: (id?: string) => {
        const d = id ? driverMap.get(id) : undefined;
        return d ? `${d.firstName} ${d.lastName}` : undefined;
      },
      reload: () => {
        reloadDrivers();
        reloadVehicles();
      },
    };
  }, [driverData, vehicleData, reloadDrivers, reloadVehicles]);
}

/** Localized formatting helpers used across admin pages. */
export function useAdminFormat() {
  const { intl, locale } = useAdmin();
  return useMemo(
    () => ({
      route: (b: Pick<Booking, "pickup" | "dropoff">) => `${localize(b.pickup.name, locale)} → ${localize(b.dropoff.name, locale)}`,
      dateTime: (iso: string) =>
        new Intl.DateTimeFormat(intl, { timeZone: "Asia/Beirut", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)),
      date: (iso: string) => new Intl.DateTimeFormat(intl, { timeZone: "Asia/Beirut", dateStyle: "medium" }).format(new Date(iso)),
      time: (iso: string) => new Intl.DateTimeFormat(intl, { timeZone: "Asia/Beirut", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)),
      dayShort: (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "short", day: "numeric" }).format(new Date(iso)),
      dayLong: (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso)),
      usd: (amount: number, digits = 2) =>
        new Intl.NumberFormat(intl, { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits === 0 ? 0 : undefined }).format(amount),
      number: (n: number, digits = 0) => new Intl.NumberFormat(intl, { maximumFractionDigits: digits }).format(n),
      percent: (n: number) => new Intl.NumberFormat(intl, { style: "percent", maximumFractionDigits: 1 }).format(n / 100),
    }),
    [intl, locale],
  );
}
