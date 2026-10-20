"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdmin } from "./admin-provider";

/** Search box that reports changes after a short pause (debounced). */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const { t } = useAdmin();
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  // Adopt external changes (e.g. topbar search, "clear filters").
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);

  return (
    <div className={cn("relative min-w-48 flex-1", className)}>
      <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={t.common.search}
        className="h-10 w-full rounded-control border border-input bg-surface ps-9 pe-9 text-sm placeholder:text-subtle-foreground focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          aria-label={t.common.clearFilters}
          className="absolute end-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-subtle-foreground hover:bg-surface-sunken"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: Array<{ value: T; label: string }>;
}) {
  const { t } = useAdmin();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only sm:text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className={cn(
          "h-10 rounded-control border bg-surface ps-3 pe-8 text-sm text-foreground focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none",
          value ? "border-primary font-semibold" : "border-input",
        )}
      >
        <option value="">{t.common.all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toolbar({ children, onClear, canClear }: { children: ReactNode; onClear?: () => void; canClear?: boolean }) {
  const { t } = useAdmin();
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
      {children}
      {onClear && canClear && (
        <button type="button" onClick={onClear} className="text-sm font-semibold text-primary-soft-foreground hover:underline">
          {t.common.clearFilters}
        </button>
      )}
    </div>
  );
}
