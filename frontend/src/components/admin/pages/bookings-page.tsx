"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { useAccess } from "@/features/admin/access";
import { DAY, startOfDay } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { services } from "@/services";
import type { BookingFilters } from "@/services";
import type { Booking, BookingSource, BookingStatus, BookingType, VehicleClass } from "@/types";
import { useAdmin } from "../admin-provider";
import { BookingStatusBadge } from "../badges";
import { BookingFormModal } from "../booking-form-modal";
import { DataTable, type Column } from "../data-table";
import { PageHeader } from "../page-parts";
import { FilterSelect, SearchInput, Toolbar } from "../toolbar";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

type Period = "all" | "today" | "next7" | "last7" | "last30";
const statuses: BookingStatus[] = ["pending", "confirmed", "driver_assigned", "driver_en_route", "driver_arrived", "in_progress", "completed", "cancelled", "no_show"];

function periodRange(period: Period, now: number): Pick<BookingFilters, "from" | "to"> {
  const today = startOfDay(now);
  const iso = (ms: number) => new Date(ms).toISOString();
  switch (period) {
    case "today":
      return { from: iso(today), to: iso(today + DAY - 1) };
    case "next7":
      return { from: iso(now), to: iso(today + 8 * DAY) };
    case "last7":
      return { from: iso(today - 7 * DAY), to: iso(now) };
    case "last30":
      return { from: iso(today - 30 * DAY), to: iso(now) };
    default:
      return {};
  }
}

export function BookingsPage() {
  const { t, dict, locale } = useAdmin();
  const f = useAdminFormat();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { can } = useAccess();
  const lookups = useFleetLookups();

  // The topbar search navigates here with ?q=…
  const urlQuery = params.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setSearch(urlQuery);
  }
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [type, setType] = useState<BookingType | "">("");
  const [source, setSource] = useState<BookingSource | "">("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass | "">("");
  const [period, setPeriod] = useState<Period>("all");
  const [unassigned, setUnassigned] = useState(false);
  const [sort, setSort] = useState("-scheduledAt");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [creating, setCreating] = useState(false);

  const filtersKey = [search, status, type, source, vehicleClass, period, unassigned, sort, page, perPage];
  const query = useServiceQuery(
    () =>
      services.bookings.list({
        search,
        sort,
        page,
        perPage,
        filters: {
          status: status ? [status] : undefined,
          type: type || undefined,
          source: source || undefined,
          vehicleClass: vehicleClass || undefined,
          unassigned: unassigned || undefined,
          ...periodRange(period, Date.now()),
        },
      }),
    filtersKey,
  );

  // Any filter change returns to page 1.
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };
  const filtered = Boolean(search || status || type || source || vehicleClass || period !== "all" || unassigned);

  const columns: Column<Booking>[] = [
    {
      key: "reference",
      header: t.bookings.columns.reference,
      sortKey: "reference",
      cell: (b) => (
        <Link href={adminPath(locale, `/bookings/${b.id}`)} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold hover:underline" dir="ltr">
          {b.reference}
        </Link>
      ),
    },
    {
      key: "customer",
      header: t.bookings.columns.customer,
      cell: (b) => (
        <span className="flex flex-col">
          <span className="font-medium">{b.contact.fullName}</span>
          <span className="text-xs text-muted-foreground" dir="ltr">
            {b.contact.phone}
          </span>
        </span>
      ),
    },
    { key: "route", header: t.bookings.columns.route, hideBelow: "lg", cell: (b) => <span className="line-clamp-2 max-w-64">{f.route(b)}</span> },
    {
      key: "scheduled",
      header: t.bookings.columns.scheduled,
      sortKey: "scheduledAt",
      cell: (b) => (
        <span className="flex flex-col gap-1">
          <span className="whitespace-nowrap tabular-nums">{f.dateTime(b.scheduledAt)}</span>
          <Badge size="sm" tone={b.type === "scheduled" ? "brand" : "neutral"} className="self-start">
            {t.bookingType[b.type]}
          </Badge>
        </span>
      ),
    },
    { key: "class", header: t.bookings.columns.vehicleClass, hideBelow: "xl", cell: (b) => dict.vehicleClass[b.vehicleClass].name },
    {
      key: "driver",
      header: t.bookings.columns.driver,
      hideBelow: "md",
      cell: (b) => lookups.driverName(b.driverId) ?? <span className="text-warning">{t.common.unassigned}</span>,
    },
    { key: "fare", header: t.bookings.columns.fare, align: "end", sortKey: "estimatedFare", cell: (b) => <span className="tabular-nums">{f.usd(b.estimatedFare.amount)}</span> },
    { key: "status", header: t.bookings.columns.status, sortKey: "status", cell: (b) => <BookingStatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader
        title={t.bookings.title}
        subtitle={t.bookings.subtitle}
        actions={
          can("bookings.manage") && (
            <Button onClick={() => setCreating(true)}>
              <Plus aria-hidden />
              {t.bookings.newBooking}
            </Button>
          )
        }
      />
      <div className="rounded-card border border-border bg-surface shadow-xs">
        <Toolbar
          canClear={filtered}
          onClear={() => {
            setSearch("");
            setStatus("");
            setType("");
            setSource("");
            setVehicleClass("");
            setPeriod("all");
            setUnassigned(false);
            setPage(1);
            if (urlQuery) router.replace(pathname);
          }}
        >
          <SearchInput value={search} onChange={withReset(setSearch)} placeholder={t.topbar.search} className="w-full sm:w-auto" />
          <FilterSelect label={t.bookings.filters.status} value={status} onChange={withReset(setStatus)} options={statuses.map((s) => ({ value: s, label: dict.status.booking[s] }))} />
          <FilterSelect
            label={t.bookings.filters.type}
            value={type}
            onChange={withReset(setType)}
            options={(["immediate", "scheduled"] as const).map((v) => ({ value: v, label: t.bookingType[v] }))}
          />
          <FilterSelect
            label={t.bookings.filters.source}
            value={source}
            onChange={withReset(setSource)}
            options={(["web", "phone", "walk_in"] as const).map((v) => ({ value: v, label: t.bookingSource[v] }))}
          />
          <FilterSelect
            label={t.bookings.filters.vehicleClass}
            value={vehicleClass}
            onChange={withReset(setVehicleClass)}
            options={(["economy", "comfort", "business", "van"] as const).map((v) => ({ value: v, label: dict.vehicleClass[v].name }))}
          />
          <FilterSelect
            label={t.bookings.filters.period}
            value={period === "all" ? "" : period}
            onChange={(v) => withReset(setPeriod)(v || "all")}
            options={(["today", "next7", "last7", "last30"] as const).map((v) => ({ value: v, label: t.bookings.filters.periods[v] }))}
          />
          <Checkbox label={t.bookings.filters.unassignedOnly} checked={unassigned} onChange={(e) => withReset(setUnassigned)(e.target.checked)} />
        </Toolbar>
        <DataTable
          caption={t.bookings.title}
          columns={columns}
          rows={query.data?.data}
          rowKey={(b) => b.id}
          status={query.status}
          onRetry={query.reload}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          meta={query.data?.meta}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          onRowClick={(b) => router.push(adminPath(locale, `/bookings/${b.id}`))}
          emptyMessage={t.bookings.empty}
        />
      </div>
      {creating && (
        <BookingFormModal
          open
          onClose={() => setCreating(false)}
          onSaved={(b) => {
            query.reload();
            router.push(adminPath(locale, `/bookings/${b.id}`));
          }}
        />
      )}
    </>
  );
}
