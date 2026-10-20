"use client";

import { useState } from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPath } from "@/features/admin/navigation";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { formatLebanesePhone } from "@/features/booking/phone";
import { services } from "@/services";
import type { Customer } from "@/types";
import { useAdmin } from "../admin-provider";
import { BookingStatusBadge } from "../badges";
import { DataTable, type Column } from "../data-table";
import { DetailRows, PageHeader, StatCard } from "../page-parts";
import { SearchInput, Toolbar } from "../toolbar";
import { useAdminFormat } from "../use-lookups";

export function CustomersPage() {
  const { t } = useAdmin();
  const f = useAdminFormat();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const query = useServiceQuery(() => services.customers.list({ search, sort, page, perPage: 15 }), [search, sort, page]);

  const columns: Column<Customer>[] = [
    { key: "name", header: t.customers.columns.name, sortKey: "name", cell: (c) => <span className="font-semibold">{c.firstName} {c.lastName}</span> },
    { key: "phone", header: t.customers.columns.phone, cell: (c) => <span dir="ltr">{formatLebanesePhone(c.phone)}</span> },
    { key: "email", header: t.customers.columns.email, hideBelow: "lg", cell: (c) => (c.email ? <span dir="ltr">{c.email}</span> : <span className="text-muted-foreground">—</span>) },
    { key: "bookings", header: t.customers.columns.bookings, sortKey: "totalBookings", align: "end", cell: (c) => <span className="tabular-nums">{c.totalBookings}</span> },
    { key: "language", header: t.customers.columns.language, hideBelow: "md", cell: (c) => t.drivers.languages[c.preferredLocale] },
    { key: "since", header: t.customers.columns.since, sortKey: "createdAt", hideBelow: "xl", cell: (c) => f.date(c.createdAt) },
  ];

  return (
    <>
      <PageHeader title={t.customers.title} subtitle={t.customers.subtitle} />
      <div className="rounded-card border border-border bg-surface shadow-xs">
        <Toolbar
          canClear={Boolean(search)}
          onClear={() => {
            setSearch("");
            setPage(1);
          }}
        >
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={t.common.search}
          />
        </Toolbar>
        <DataTable
          caption={t.customers.title}
          columns={columns}
          rows={query.data?.data}
          rowKey={(c) => c.id}
          status={query.status}
          onRetry={query.reload}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          meta={query.data?.meta}
          onPageChange={setPage}
          onRowClick={setViewing}
        />
      </div>
      {viewing && <CustomerDrawer customer={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}

function CustomerDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { t, locale } = useAdmin();
  const f = useAdminFormat();
  const history = useServiceQuery(() => services.bookings.list({ filters: { customerId: customer.id }, sort: "-scheduledAt", perPage: 100 }), [customer.id]);
  const bookings = history.data?.data ?? [];
  const spent = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.estimatedFare.amount, 0);

  return (
    <Drawer open size="lg" onClose={onClose} title={<span className="font-bold">{customer.firstName} {customer.lastName}</span>}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t.customers.detail.totalSpent} value={f.usd(spent, 0)} loading={!history.data} />
          <StatCard label={t.customers.detail.lastBooking} value={bookings[0] ? f.date(bookings[0].scheduledAt) : "—"} loading={!history.data} />
        </div>
        <section>
          <h3 className="text-sm font-bold">{t.customers.detail.contact}</h3>
          <DetailRows
            rows={[
              [t.common.phone, <span key="p" dir="ltr">{formatLebanesePhone(customer.phone)}</span>],
              [t.common.email, customer.email ? <span key="e" dir="ltr">{customer.email}</span> : "—"],
              [t.customers.columns.language, t.drivers.languages[customer.preferredLocale]],
              [t.customers.columns.since, f.date(customer.createdAt)],
            ]}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">{t.customers.detail.history}</h3>
          {!history.data ? (
            <Skeleton className="h-40" />
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.customers.detail.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link href={adminPath(locale, `/bookings/${b.id}`)} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-muted">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{f.route(b)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        <span dir="ltr" className="font-mono">{b.reference}</span> · {f.dateTime(b.scheduledAt)} · {f.usd(b.estimatedFare.amount)}
                      </span>
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}
