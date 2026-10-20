"use client";

import { useState } from "react";
import { Ban, CircleCheck, ClipboardList, Wallet } from "lucide-react";
import { Star } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { DAY, startOfDay } from "@/features/admin/format";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { services } from "@/services";
import { useAdmin } from "../admin-provider";
import { BarList } from "../charts/bar-list";
import { ColumnChart } from "../charts/column-chart";
import { LineChart } from "../charts/line-chart";
import { PageHeader, Panel, QueryBoundary, StatCard } from "../page-parts";
import { useAdminFormat } from "../use-lookups";

type Range = "7" | "14" | "30";

export function ReportsPage() {
  const { t, dict } = useAdmin();
  const f = useAdminFormat();
  const [range, setRange] = useState<Range>("14");
  const query = useServiceQuery(() => {
    const end = startOfDay(Date.now()) + DAY;
    return services.reports.getReport({ from: new Date(end - Number(range) * DAY).toISOString(), to: new Date(end).toISOString() });
  }, ["report", range]);
  const r = query.data;
  const labelEvery = range === "30" ? 5 : range === "14" ? 2 : 1;

  return (
    <>
      <PageHeader
        title={t.reports.title}
        subtitle={t.reports.subtitle}
        actions={
          <SegmentedControl
            legend={t.reports.range}
            hideLegend
            value={range}
            onChange={setRange}
            options={(["7", "14", "30"] as const).map((v) => ({ value: v, label: t.reports.ranges[v] }))}
          />
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.reports.kpis.bookings} value={r && f.number(r.bookingsTotal)} loading={!r} icon={<ClipboardList />} />
        <StatCard label={t.reports.kpis.revenue} value={r && f.usd(r.revenueTotal.amount, 0)} loading={!r} icon={<Wallet />} tone="success" />
        <StatCard label={t.reports.kpis.completion} value={r && f.percent(r.completionRatePct)} loading={!r} icon={<CircleCheck />} tone="info" />
        <StatCard label={t.reports.kpis.cancellation} value={r && f.percent(r.cancellationRatePct)} loading={!r} icon={<Ban />} tone="danger" />
      </div>

      <QueryBoundary status={query.status} hasData={!!r} onRetry={query.reload} skeleton={<Skeleton className="h-96 rounded-card" />}>
        {r && (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title={t.reports.bookingTrend} subtitle={t.reports.bookingTrendSubtitle}>
                <ColumnChart
                  data={r.bookingsByDay.map((p) => ({ label: f.dayShort(p.date), fullLabel: f.dayLong(p.date), value: p.value }))}
                  format={(v) => f.number(v)}
                  tableColumns={[t.common.date, t.reports.kpis.bookings]}
                  labelEvery={labelEvery}
                />
              </Panel>
              <Panel title={t.reports.revenueTrend} subtitle={t.reports.revenueTrendSubtitle}>
                <LineChart
                  data={r.revenueByDay.map((p) => ({ label: f.dayShort(p.date), fullLabel: f.dayLong(p.date), value: p.value }))}
                  format={(v) => f.usd(v, 0)}
                  tableColumns={[t.common.date, t.reports.kpis.revenue]}
                  labelEvery={labelEvery}
                />
              </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Panel title={t.reports.cancellations}>
                {r.cancellationsByReason.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.reports.noCancellations}</p>
                ) : (
                  <BarList
                    tone="chart-2"
                    items={r.cancellationsByReason.map((c) => ({ label: t.cancellationReasons[c.reason as keyof typeof t.cancellationReasons] ?? c.reason, value: c.count }))}
                    format={(v) => f.number(v)}
                    tableColumns={[t.reports.cancellations, t.reports.kpis.bookings]}
                  />
                )}
              </Panel>
              <Panel title={t.reports.byClass}>
                <BarList
                  items={r.bookingsByClass.map((c) => ({ label: dict.vehicleClass[c.vehicleClass].name, value: c.count }))}
                  format={(v) => f.number(v)}
                  tableColumns={[t.bookings.columns.vehicleClass, t.reports.kpis.bookings]}
                />
              </Panel>
              <Panel title={t.reports.utilization} subtitle={t.reports.utilizationSubtitle}>
                <BarList
                  tone="chart-3"
                  max={100}
                  items={r.vehicleUtilization.slice(0, 8).map((v) => ({ label: v.plate, hint: v.label, value: Math.round(v.utilizationPct * 10) / 10 }))}
                  format={(v) => f.percent(v)}
                  tableColumns={[t.reports.columns.vehicle, t.reports.columns.utilization]}
                />
              </Panel>
            </div>

            <Panel title={t.reports.driverPerformance} bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <caption className="sr-only">{t.reports.driverPerformance}</caption>
                  <thead className="bg-surface-muted text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-2.5 text-start font-semibold">{t.reports.columns.driver}</th>
                      <th scope="col" className="px-4 py-2.5 text-end font-semibold">{t.reports.columns.trips}</th>
                      <th scope="col" className="px-4 py-2.5 text-end font-semibold">{t.reports.columns.revenue}</th>
                      <th scope="col" className="px-4 py-2.5 text-end font-semibold">{t.reports.columns.rating}</th>
                      <th scope="col" className="px-5 py-2.5 text-end font-semibold">{t.reports.columns.cancellations}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {r.driverPerformance.map((d) => (
                      <tr key={d.driverId}>
                        <th scope="row" className="px-5 py-2.5 text-start font-medium" dir="ltr">
                          {d.name}
                        </th>
                        <td className="px-4 py-2.5 text-end tabular-nums">{d.trips}</td>
                        <td className="px-4 py-2.5 text-end tabular-nums">{f.usd(d.revenue, 0)}</td>
                        <td className="px-4 py-2.5 text-end tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Star aria-hidden className="size-3 fill-accent text-accent" />
                            {d.rating.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-end tabular-nums">{d.cancellations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </QueryBoundary>
    </>
  );
}
