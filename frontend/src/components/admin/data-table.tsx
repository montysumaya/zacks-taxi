"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import type { PaginationMeta } from "@/types";
import { useAdmin } from "./admin-provider";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Server sort key; omit for non-sortable columns. */
  sortKey?: string;
  align?: "start" | "end" | "center";
  /** Hide on narrower screens to keep tables usable on tablets. */
  hideBelow?: "md" | "lg" | "xl";
  className?: string;
}

const hideClass = { md: "hidden md:table-cell", lg: "hidden lg:table-cell", xl: "hidden xl:table-cell" } as const;

/**
 * Server-driven table: it renders what the service returns and reports sort
 * and page changes upward. Works identically against the mock and a real API.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  status,
  onRetry,
  sort,
  onSortChange,
  meta,
  onPageChange,
  onPerPageChange,
  onRowClick,
  emptyMessage,
  caption,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  status: "loading" | "error" | "success";
  onRetry: () => void;
  sort?: string;
  onSortChange?: (sort: string) => void;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  caption: string;
}) {
  const { t, locale } = useAdmin();
  const sortField = sort?.replace(/^-/, "");
  const desc = sort?.startsWith("-");

  if (status === "error" && !rows) {
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

  return (
    <div className="flex flex-col">
      <div className={cn("overflow-x-auto", status === "loading" && rows && "opacity-60 transition-opacity")} aria-busy={status === "loading"}>
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold text-muted-foreground">
            <tr>
              {columns.map((col) => {
                const active = col.sortKey && sortField === col.sortKey;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (desc ? "descending" : "ascending") : undefined}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap",
                      col.align === "end" ? "text-end" : col.align === "center" ? "text-center" : "text-start",
                      col.hideBelow && hideClass[col.hideBelow],
                    )}
                  >
                    {col.sortKey && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(active && !desc ? `-${col.sortKey}` : col.sortKey!)}
                        className="inline-flex items-center gap-1 rounded-sm hover:text-foreground"
                        aria-label={interpolate(t.common.sortBy, { column: col.header })}
                      >
                        {col.header}
                        {active ? desc ? <ArrowDown aria-hidden className="size-3.5" /> : <ArrowUp aria-hidden className="size-3.5" /> : <ArrowUpDown aria-hidden className="size-3.5 opacity-40" />}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!rows
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3.5", col.hideBelow && hideClass[col.hideBelow])}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-surface-muted")}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 align-middle",
                          col.align === "end" ? "text-end" : col.align === "center" ? "text-center" : "text-start",
                          col.hideBelow && hideClass[col.hideBelow],
                          col.className,
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {rows && rows.length === 0 && <EmptyState compact title={emptyMessage ?? t.common.noResults} />}
      </div>

      {meta && onPageChange && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {interpolate(t.common.showing, {
              from: (meta.currentPage - 1) * meta.perPage + 1,
              to: Math.min(meta.currentPage * meta.perPage, meta.total),
              total: meta.total,
            })}
          </span>
          <div className="flex items-center gap-3">
            {onPerPageChange && (
              <label className="hidden items-center gap-2 sm:flex">
                {t.common.rowsPerPage}
                <select
                  value={meta.perPage}
                  onChange={(e) => onPerPageChange(Number(e.target.value))}
                  className="h-8 rounded-sm border border-input bg-surface px-2 text-foreground"
                >
                  {[10, 15, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <span className="tabular-nums">{interpolate(t.common.page, { page: meta.currentPage, pages: meta.lastPage })}</span>
            <div className="flex gap-1">
              <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(meta.currentPage - 1)} disabled={meta.currentPage <= 1} aria-label={t.common.previous}>
                {locale === "ar" ? <ChevronRight /> : <ChevronLeft />}
              </Button>
              <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(meta.currentPage + 1)} disabled={meta.currentPage >= meta.lastPage} aria-label={t.common.next}>
                {locale === "ar" ? <ChevronLeft /> : <ChevronRight />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
