"use client";

import { useAdmin } from "../admin-provider";

/** Accessible table fallback for every chart (also covers low-contrast hues). */
export function ChartTable({ columns, rows }: { columns: [string, string]; rows: Array<[string, string]> }) {
  const { t } = useAdmin();
  return (
    <details className="group mt-3 text-sm">
      <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">{t.common.viewAsTable}</summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-md border border-border">
        <table className="w-full text-start">
          <thead className="sticky top-0 bg-surface-muted text-xs text-subtle-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-start font-semibold">{columns[0]}</th>
              <th scope="col" className="px-3 py-2 text-end font-semibold">{columns[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row" className="px-3 py-1.5 text-start font-normal">{label}</th>
                <td className="px-3 py-1.5 text-end tabular-nums">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
