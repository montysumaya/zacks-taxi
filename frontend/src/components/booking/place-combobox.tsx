"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Building2, MapPin, Plane } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { localize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { services } from "@/services";
import type { Place } from "@/types";

const kindIcons = { airport: Plane, city: Building2, landmark: MapPin, address: MapPin } as const;

export interface PlaceComboboxProps {
  label: string;
  placeholder: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  icon: ReactNode;
  error?: string;
  hint?: string;
  /** Places that should not be offered (e.g. the other end of the trip). */
  excludeId?: string;
}

/**
 * Accessible autocomplete (WAI-ARIA combobox pattern) backed by
 * `services.places.search`. Only a selected suggestion counts as a value.
 */
export function PlaceCombobox({
  label,
  placeholder,
  value,
  onChange,
  icon,
  error,
  hint,
  excludeId,
}: PlaceComboboxProps) {
  const { locale, dict } = useI18n();
  const listboxId = useId();
  // `draft` holds what the user is typing; otherwise the input mirrors the selected value.
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState<{ query: string; items: Place[] } | null>(null);
  const query = draft ?? (value ? localize(value.name, locale) : "");

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    const timer = setTimeout(() => {
      services.places.search(query, { limit: 8 }).then((items) => {
        if (!ignore) setResults({ query, items });
      });
    }, 120);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const items = (results?.items ?? []).filter((p) => p.id !== excludeId);
  const loading = open && results?.query !== query;
  const activeId = activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;

  function select(place: Place) {
    onChange(place);
    setDraft(null);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <Field label={label} error={error} hint={hint}>
      <div className="relative">
        <Input
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open ? activeId : undefined}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          startAdornment={icon}
          endAdornment={loading ? <Spinner size="sm" /> : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
            if (value) onChange(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((i) => Math.min(i + 1, items.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter" && open && items[activeIndex]) {
              event.preventDefault();
              select(items[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          hidden={!open}
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 animate-scale-in overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-lg"
        >
          {items.map((place, index) => {
            const Icon = kindIcons[place.kind];
            return (
              <li
                key={place.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(place)}
                onMouseMove={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2",
                  index === activeIndex && "bg-surface-muted",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-primary-soft text-primary-soft-foreground">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">{localize(place.name, locale)}</span>
                  {place.address && (
                    <span className="truncate text-xs text-muted-foreground">{localize(place.address, locale)}</span>
                  )}
                </span>
              </li>
            );
          })}
          {!loading && items.length === 0 && (
            <li role="presentation" className="px-3 py-4 text-center text-sm text-muted-foreground">
              {dict.booking.noResults}
            </li>
          )}
          {loading && items.length === 0 && (
            <li role="presentation" className="px-3 py-4 text-center text-sm text-muted-foreground">
              {dict.booking.searching}
            </li>
          )}
        </ul>
      </div>
    </Field>
  );
}
