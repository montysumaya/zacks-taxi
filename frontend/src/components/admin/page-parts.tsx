"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/features/admin/access";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import type { Permission } from "@/types";
import { useAdmin } from "./admin-provider";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2 font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Frontend-only gate for the simulated role. The backend must enforce the same rule. */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { t } = useAdmin();
  const { ready, can, role } = useAccess();
  if (!ready) return <Skeleton className="h-96 rounded-card" />;
  if (!can(permission)) {
    return (
      <Card padding="none">
        <EmptyState icon={<Lock aria-hidden />} title={t.noAccess.title} description={interpolate(t.noAccess.body, { role: t.roles[role] })} />
      </Card>
    );
  }
  return <>{children}</>;
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("flex flex-col rounded-card border border-border bg-surface shadow-xs", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-h6 font-bold">{title}</h2>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
}) {
  const toneClass = {
    default: "bg-surface-sunken text-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  }[tone];
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-xs sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className={cn("grid size-8 place-items-center rounded-md [&_svg]:size-4", toneClass)}>{icon}</span>}
      </div>
      {loading ? <Skeleton className="h-8 w-20" /> : <span className="text-h2 font-bold tabular-nums">{value}</span>}
      {hint && !loading && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/** Standard loading / error / empty handling for a query-backed block. */
export function QueryBoundary({
  status,
  hasData,
  onRetry,
  empty,
  skeleton,
  children,
}: {
  status: "loading" | "error" | "success";
  hasData: boolean;
  onRetry: () => void;
  empty?: ReactNode | false;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useAdmin();
  if (status === "error" && !hasData) {
    return (
      <ErrorState
        compact
        title={t.common.loadFailed}
        actions={
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {t.common.retry}
          </Button>
        }
      />
    );
  }
  if (!hasData) return <>{skeleton ?? <Skeleton className="h-40" />}</>;
  if (empty) return <EmptyState compact title={empty} />;
  return <>{children}</>;
}

export function DetailRows({ rows, className }: { rows: Array<[string, ReactNode] | false | null | undefined>; className?: string }) {
  return (
    <dl className={cn("flex flex-col divide-y divide-border text-sm", className)}>
      {rows.filter(Boolean).map((row) => {
        const [label, value] = row as [string, ReactNode];
        return (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-end font-medium text-foreground">{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
