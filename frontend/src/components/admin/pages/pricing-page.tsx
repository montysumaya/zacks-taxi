"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAccess } from "@/features/admin/access";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/cn";
import { localize } from "@/lib/format";
import { placeList } from "@/mocks/fixtures/places";
import { calculateFare } from "@/features/pricing/fare";
import { services } from "@/services";
import type { PricingConfig, VehicleTariff } from "@/types";
import { useAdmin } from "../admin-provider";
import { PageHeader, Panel, QueryBoundary } from "../page-parts";
import { useAdminFormat } from "../use-lookups";

type Draft = Omit<PricingConfig, "updatedAt">;

function NumberCell({
  value,
  onChange,
  label,
  disabled,
  step = 0.05,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  disabled?: boolean;
  step?: number;
}) {
  const invalid = !(value >= 0);
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={step}
      value={Number.isNaN(value) ? "" : value}
      onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
      aria-label={label}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      className={cn(
        "h-9 w-24 rounded-sm border bg-surface px-2 text-end text-sm tabular-nums focus:border-ring focus:ring-4 focus:ring-ring/15 focus:outline-none disabled:bg-surface-muted",
        invalid ? "border-danger" : "border-input",
      )}
    />
  );
}

export function PricingPage() {
  const { t, dict, locale } = useAdmin();
  const { can } = useAccess();
  const query = useServiceQuery(() => services.pricing.getConfig(), ["pricing"]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [synced, setSynced] = useState<PricingConfig | undefined>(undefined);
  if (query.data && query.data !== synced) {
    setSynced(query.data);
    setDraft(structuredClone(query.data));
  }
  const readOnly = !can("pricing.manage");

  return (
    <>
      <PageHeader title={t.pricing.title} subtitle={t.pricing.subtitle} actions={!readOnly && draft && <SaveButton draft={draft} onSaved={query.reload} />} />
      <p className="flex items-center gap-2 rounded-card border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning-soft-foreground">
        <Info aria-hidden className="size-4 shrink-0" />
        {t.pricing.illustrative} {draft && interpolate(t.pricing.currencyNote, { currency: draft.currency })}
      </p>
      <QueryBoundary status={query.status} hasData={!!draft} onRetry={query.reload} skeleton={<Skeleton className="h-96 rounded-card" />}>
        {draft && (
          <div className="grid items-start gap-6 xl:grid-cols-3">
            <div className="flex flex-col gap-6 xl:col-span-2">
              <Panel title={t.pricing.tariffs} bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-sm">
                    <caption className="sr-only">{t.pricing.tariffs}</caption>
                    <thead className="bg-surface-muted text-xs text-muted-foreground">
                      <tr>
                        {(Object.keys(t.pricing.columns) as Array<keyof typeof t.pricing.columns>).map((k) => (
                          <th key={k} scope="col" className={cn("px-4 py-2.5 font-semibold", k === "vehicleClass" ? "text-start" : "text-end")}>
                            {t.pricing.columns[k]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {draft.tariffs.map((tariff, i) => (
                        <tr key={tariff.vehicleClass}>
                          <th scope="row" className="px-4 py-2.5 text-start font-semibold">
                            {dict.vehicleClass[tariff.vehicleClass].name}
                          </th>
                          {(["baseFare", "perKm", "perMinute", "minimumFare"] as const).map((field) => (
                            <td key={field} className="px-4 py-2 text-end">
                              <NumberCell
                                value={tariff[field]}
                                disabled={readOnly}
                                label={`${dict.vehicleClass[tariff.vehicleClass].name} — ${t.pricing.columns[field]}`}
                                onChange={(n) =>
                                  setDraft((d) => d && { ...d, tariffs: d.tariffs.map((x, j): VehicleTariff => (j === i ? { ...x, [field]: n } : x)) })
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title={t.pricing.zones} bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {draft.zones.map((zone, i) => (
                    <li key={zone.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                      <label className="flex flex-1 items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          role="switch"
                          checked={zone.active}
                          disabled={readOnly}
                          onChange={(e) => setDraft((d) => d && { ...d, zones: d.zones.map((z, j) => (j === i ? { ...z, active: e.target.checked } : z)) })}
                          className="size-4 accent-[var(--primary)]"
                        />
                        {localize(zone.name, locale)}
                      </label>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        {t.pricing.zoneSurcharge}
                        <NumberCell
                          value={zone.surcharge}
                          step={0.5}
                          disabled={readOnly}
                          label={`${localize(zone.name, locale)} — ${t.pricing.zoneSurcharge}`}
                          onChange={(n) => setDraft((d) => d && { ...d, zones: d.zones.map((z, j) => (j === i ? { ...z, surcharge: n } : z)) })}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title={t.pricing.rules} bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {draft.rules.map((rule, i) => (
                    <li key={rule.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                      <label className="flex flex-1 flex-col gap-0.5 text-sm">
                        <span className="flex items-center gap-3 font-medium">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={rule.active}
                            disabled={readOnly}
                            onChange={(e) => setDraft((d) => d && { ...d, rules: d.rules.map((r, j) => (j === i ? { ...r, active: e.target.checked } : r)) })}
                            className="size-4 accent-[var(--primary)]"
                          />
                          {localize(rule.name, locale)}
                        </span>
                        <span className="ps-7 text-xs text-muted-foreground" dir="ltr">
                          {t.pricing.ruleWindow}: {rule.window}
                        </span>
                      </label>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        {t.pricing.ruleAdjustment}
                        <NumberCell
                          value={rule.percent}
                          step={1}
                          disabled={readOnly}
                          label={`${localize(rule.name, locale)} — ${t.pricing.ruleAdjustment}`}
                          onChange={(n) => setDraft((d) => d && { ...d, rules: d.rules.map((r, j) => (j === i ? { ...r, percent: n } : r)) })}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <div className="flex flex-col gap-6">
              <Panel title={t.pricing.airport}>
                <div className="flex flex-col gap-3">
                  {(["airportPickupFee", "airportDropoffFee"] as const).map((k) => (
                    <div key={k} className="flex items-center justify-between gap-3 text-sm">
                      <span>{k === "airportPickupFee" ? t.pricing.airportPickup : t.pricing.airportDropoff}</span>
                      <NumberCell
                        value={draft[k]}
                        step={0.5}
                        disabled={readOnly}
                        label={k === "airportPickupFee" ? t.pricing.airportPickup : t.pricing.airportDropoff}
                        onChange={(n) => setDraft((d) => d && { ...d, [k]: n })}
                      />
                    </div>
                  ))}
                </div>
              </Panel>
              <FarePreview draft={draft} />
            </div>
          </div>
        )}
      </QueryBoundary>
    </>
  );
}

function SaveButton({ draft, onSaved }: { draft: Draft; onSaved: () => void }) {
  const { t } = useAdmin();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const valid = [
    ...draft.tariffs.flatMap((x) => [x.baseFare, x.perKm, x.perMinute, x.minimumFare]),
    draft.airportPickupFee,
    draft.airportDropoffFee,
    ...draft.zones.map((z) => z.surcharge),
    ...draft.rules.map((r) => r.percent),
  ].every((n) => n >= 0);
  return (
    <Button
      loading={saving}
      disabled={!valid}
      title={valid ? undefined : t.common.invalidNumber}
      onClick={async () => {
        setSaving(true);
        try {
          await services.pricing.updateConfig(draft);
          toast({ tone: "success", title: t.common.saved });
          onSaved();
        } catch {
          toast({ tone: "error", title: t.common.saveFailed });
        } finally {
          setSaving(false);
        }
      }}
    >
      {t.common.save}
    </Button>
  );
}

/** Live estimate from the values on screen (uses the same demo pricing model). */
function FarePreview({ draft }: { draft: Draft }) {
  const { t, dict, locale } = useAdmin();
  const f = useAdminFormat();
  const [fromId, setFromId] = useState("place_hamra");
  const [toId, setToId] = useState("place_bey");
  const from = placeList.find((p) => p.id === fromId)!;
  const to = placeList.find((p) => p.id === toId)!;
  // A fixed midday time keeps the preview free of the night rule and render pure.
  const at = "2026-01-01T12:00:00+02:00";
  const config = { ...draft, updatedAt: "" };
  const valid = draft.tariffs.every((x) => [x.baseFare, x.perKm, x.perMinute, x.minimumFare].every((n) => n >= 0));

  return (
    <Panel title={t.pricing.preview} subtitle={t.pricing.previewNote}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.bookings.form.pickup}>
            <Select value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {placeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {localize(p.name, locale)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.bookings.form.dropoff}>
            <Select value={toId} onChange={(e) => setToId(e.target.value)}>
              {placeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {localize(p.name, locale)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {valid && fromId !== toId && (
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {draft.tariffs.map((tariff) => {
              const quote = calculateFare({ pickup: from, dropoff: to, vehicleClass: tariff.vehicleClass, scheduledAt: at }, config);
              return (
                <li key={tariff.vehicleClass} className="flex justify-between gap-3 px-3 py-2">
                  <span>{dict.vehicleClass[tariff.vehicleClass].name}</span>
                  <span className="font-semibold tabular-nums">{f.usd(quote.total.amount)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
