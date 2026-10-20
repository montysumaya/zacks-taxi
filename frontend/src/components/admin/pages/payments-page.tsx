"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, CircleAlert, HandCoins, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { useAccess } from "@/features/admin/access";
import { DAY } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import type { DriverSettlement, Payment, PaymentMethod, PaymentStatus } from "@/types";
import { useAdmin } from "../admin-provider";
import { PaymentStatusBadge } from "../badges";
import { DataTable, type Column } from "../data-table";
import { PageHeader, Panel, StatCard } from "../page-parts";
import { FilterSelect, SearchInput, Toolbar } from "../toolbar";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

export function PaymentsPage() {
  const { t } = useAdmin();
  const [tab, setTab] = useState<"transactions" | "settlements">("transactions");
  const [refresh, setRefresh] = useState(0);
  const f = useAdminFormat();
  const kpis = useServiceQuery(async () => {
    const all = await services.payments.list({ perPage: 5000 });
    const since = Date.now() - 30 * DAY;
    const recent = all.data.filter((p) => Date.parse(p.paidAt ?? p.createdAt) >= since);
    const paid = recent.filter((p) => p.status === "paid");
    const settlements = await services.payments.listSettlements();
    return {
      collected: paid.reduce((s, p) => s + p.amount.amount, 0),
      cashShare: paid.length ? (paid.filter((p) => p.method === "cash").length / paid.length) * 100 : 0,
      cashPending: settlements.reduce((s, x) => s + x.cashCollected.amount, 0),
      failed: recent.filter((p) => p.status === "failed").length,
    };
  }, ["payment-kpis", refresh]);

  return (
    <>
      <PageHeader title={t.payments.title} subtitle={t.payments.subtitle} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.payments.kpis.collected} value={kpis.data && f.usd(kpis.data.collected, 0)} loading={!kpis.data} icon={<Wallet />} tone="success" />
        <StatCard label={t.payments.kpis.cash} value={kpis.data && f.percent(kpis.data.cashShare)} loading={!kpis.data} icon={<Banknote />} />
        <StatCard label={t.payments.kpis.cashPending} value={kpis.data && f.usd(kpis.data.cashPending, 0)} loading={!kpis.data} icon={<HandCoins />} tone="warning" />
        <StatCard label={t.payments.kpis.failed} value={kpis.data?.failed} loading={!kpis.data} icon={<CircleAlert />} tone="danger" />
      </div>
      <SegmentedControl
        legend={t.payments.title}
        hideLegend
        value={tab}
        onChange={setTab}
        className="max-w-md"
        options={[
          { value: "transactions", label: t.payments.tabs.transactions },
          { value: "settlements", label: t.payments.tabs.settlements },
        ]}
      />
      {tab === "transactions" ? <Transactions /> : <Settlements onSettled={() => setRefresh((n) => n + 1)} />}
    </>
  );
}

function Transactions() {
  const { t, dict, locale } = useAdmin();
  const f = useAdminFormat();
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [sort, setSort] = useState("-paidAt");
  const [page, setPage] = useState(1);
  const query = useServiceQuery(
    () => services.payments.list({ search, sort, page, perPage: 15, filters: { method: method || undefined, status: status || undefined } }),
    [search, method, status, sort, page],
  );
  // Payments reference bookings; fetch the visible ones for reference/customer columns.
  const bookingIds = (query.data?.data ?? []).map((p) => p.bookingId);
  const bookings = useServiceQuery(() => Promise.all(bookingIds.map((id) => services.bookings.getById(id).catch(() => null))), [bookingIds]);
  const bookingMap = useMemo(() => new Map((bookings.data ?? []).filter(Boolean).map((b) => [b!.id, b!])), [bookings.data]);

  const columns: Column<Payment>[] = [
    { key: "date", header: t.payments.columns.date, sortKey: "paidAt", cell: (p) => <span className="tabular-nums">{f.dateTime(p.paidAt ?? p.createdAt)}</span> },
    {
      key: "reference",
      header: t.payments.columns.reference,
      cell: (p) => {
        const b = bookingMap.get(p.bookingId);
        return b ? (
          <Link href={adminPath(locale, `/bookings/${b.id}`)} className="font-mono text-xs font-semibold hover:underline" dir="ltr">
            {b.reference}
          </Link>
        ) : (
          "…"
        );
      },
    },
    { key: "customer", header: t.payments.columns.customer, hideBelow: "md", cell: (p) => bookingMap.get(p.bookingId)?.contact.fullName ?? "…" },
    { key: "method", header: t.payments.columns.method, cell: (p) => dict.paymentMethod[p.method] },
    { key: "amount", header: t.payments.columns.amount, sortKey: "amount", align: "end", cell: (p) => <span className="font-semibold tabular-nums">{f.usd(p.amount.amount)}</span> },
    { key: "status", header: t.payments.columns.status, cell: (p) => <PaymentStatusBadge status={p.status} /> },
  ];

  return (
    <div className="rounded-card border border-border bg-surface shadow-xs">
      <Toolbar
        canClear={Boolean(search || method || status)}
        onClear={() => {
          setSearch("");
          setMethod("");
          setStatus("");
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
        <FilterSelect
          label={t.payments.columns.method}
          value={method}
          onChange={(v) => {
            setMethod(v);
            setPage(1);
          }}
          options={(["cash", "card", "wallet"] as const).map((m) => ({ value: m, label: dict.paymentMethod[m] }))}
        />
        <FilterSelect
          label={t.payments.columns.status}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={(["paid", "pending", "failed", "refunded"] as const).map((s) => ({ value: s, label: dict.status.payment[s] }))}
        />
      </Toolbar>
      <DataTable
        caption={t.payments.tabs.transactions}
        columns={columns}
        rows={query.data?.data}
        rowKey={(p) => p.id}
        status={query.status}
        onRetry={query.reload}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        meta={query.data?.meta}
        onPageChange={setPage}
      />
    </div>
  );
}

function Settlements({ onSettled }: { onSettled: () => void }) {
  const { t } = useAdmin();
  const { toast } = useToast();
  const { can } = useAccess();
  const f = useAdminFormat();
  const lookups = useFleetLookups();
  const [refresh, setRefresh] = useState(0);
  const [confirming, setConfirming] = useState<DriverSettlement | null>(null);
  const [saving, setSaving] = useState(false);
  const query = useServiceQuery(() => services.payments.listSettlements(), ["settlements", refresh]);
  const rows = (query.data ?? []).filter((s) => s.trips > 0 || s.lastSettledAt).sort((a, b) => b.cashCollected.amount - a.cashCollected.amount);

  const columns: Column<DriverSettlement>[] = [
    { key: "driver", header: t.payments.settlementColumns.driver, cell: (s) => <span className="font-semibold" dir="ltr">{lookups.driverName(s.driverId) ?? "…"}</span> },
    { key: "trips", header: t.payments.settlementColumns.trips, align: "end", cell: (s) => <span className="tabular-nums">{s.trips}</span> },
    { key: "collected", header: t.payments.settlementColumns.collected, align: "end", cell: (s) => <span className="tabular-nums">{f.usd(s.cashCollected.amount)}</span> },
    { key: "commission", header: t.payments.settlementColumns.commission, align: "end", hideBelow: "md", cell: (s) => <span className="font-semibold tabular-nums">{f.usd(s.commission.amount)}</span> },
    {
      key: "status",
      header: t.payments.settlementColumns.status,
      cell: (s) => (
        <Badge size="sm" dot tone={s.status === "pending" ? "warning" : "success"}>
          {t.payments.settlementStatus[s.status]}
        </Badge>
      ),
    },
    { key: "last", header: t.payments.settlementColumns.lastSettled, hideBelow: "lg", cell: (s) => (s.lastSettledAt ? f.dateTime(s.lastSettledAt) : t.payments.never) },
    {
      key: "actions",
      header: t.common.actions,
      align: "end",
      cell: (s) =>
        can("payments.manage") && s.status === "pending" ? (
          <Button size="sm" variant="secondary" onClick={() => setConfirming(s)}>
            {t.payments.settle}
          </Button>
        ) : null,
    },
  ];

  return (
    <Panel title={t.payments.tabs.settlements} subtitle={t.payments.commissionNote} bodyClassName="p-0">
      <DataTable caption={t.payments.tabs.settlements} columns={columns} rows={query.data ? rows : undefined} rowKey={(s) => s.driverId} status={query.status} onRetry={query.reload} />
      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        loading={saving}
        title={confirming ? interpolate(t.payments.settleTitle, { driver: lookups.driverName(confirming.driverId) ?? "" }) : ""}
        description={confirming ? interpolate(t.payments.settleBody, { amount: f.usd(confirming.cashCollected.amount), trips: confirming.trips }) : ""}
        confirmLabel={t.payments.settle}
        onConfirm={async () => {
          if (!confirming) return;
          setSaving(true);
          try {
            await services.payments.settleDriver(confirming.driverId);
            toast({ tone: "success", title: interpolate(t.payments.settled, { driver: lookups.driverName(confirming.driverId) ?? "" }) });
            setConfirming(null);
            setRefresh((n) => n + 1);
            onSettled();
          } catch {
            toast({ tone: "error", title: t.common.saveFailed });
          } finally {
            setSaving(false);
          }
        }}
      />
    </Panel>
  );
}
