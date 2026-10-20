"use client";

import { useState, type ReactNode } from "react";
import { Info, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Switch } from "@/components/ui/choice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { accessStore } from "@/features/admin/access";
import { useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { demoControls, services } from "@/services";
import { ServiceError, type CompanySettings, type NotificationType } from "@/types";
import { useAdmin } from "../admin-provider";
import { PageHeader, Panel, QueryBoundary } from "../page-parts";

type Draft = Omit<CompanySettings, "updatedAt">;
const notificationTypes: NotificationType[] = ["booking_created", "scheduled_reminder", "driver_assigned", "booking_cancelled", "document_expiring"];

export function SettingsPage() {
  const { t } = useAdmin();
  const { toast } = useToast();
  const query = useServiceQuery(() => services.settings.get(), ["settings"]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [synced, setSynced] = useState<CompanySettings | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newArea, setNewArea] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  if (query.data && query.data !== synced) {
    setSynced(query.data);
    setDraft(structuredClone(query.data));
  }
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => d && { ...d, [key]: value });

  async function save() {
    if (!draft) return;
    if (!draft.companyName.trim()) {
      setError(t.common.fieldRequired);
      return;
    }
    setSaving(true);
    try {
      await services.settings.update(draft);
      toast({ tone: "success", title: t.common.saved });
      query.reload();
    } catch (e) {
      if (e instanceof ServiceError && e.fieldErrors?.companyName) setError(t.common.fieldRequired);
      else toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={t.settings.title}
        subtitle={t.settings.subtitle}
        actions={
          draft && (
            <Button onClick={save} loading={saving}>
              {t.common.save}
            </Button>
          )
        }
      />
      <QueryBoundary status={query.status} hasData={!!draft} onRetry={query.reload} skeleton={<Skeleton className="h-[40rem] rounded-card" />}>
        {draft && (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Panel title={t.settings.company}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.settings.companyName} error={error ?? undefined} required>
                  <Input
                    value={draft.companyName}
                    onChange={(e) => {
                      set("companyName", e.target.value);
                      setError(null);
                    }}
                  />
                </Field>
                <Field label={t.settings.legalName}>
                  <Input value={draft.legalName} onChange={(e) => set("legalName", e.target.value)} />
                </Field>
                <Field label={t.common.email}>
                  <Input type="email" dir="ltr" value={draft.email} onChange={(e) => set("email", e.target.value)} className="rtl:text-right" />
                </Field>
                <Field label={t.common.phone}>
                  <Input dir="ltr" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className="rtl:text-right" />
                </Field>
                <Field label={t.settings.address} className="sm:col-span-2">
                  <Input value={draft.address} onChange={(e) => set("address", e.target.value)} />
                </Field>
              </div>
              <Note>{t.settings.placeholderNote}</Note>
            </Panel>

            <Panel title={t.settings.serviceAreas}>
              <ul className="flex flex-wrap gap-2">
                {draft.serviceAreas.map((area) => (
                  <li key={area} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted ps-3 pe-1 py-1 text-sm">
                    {area}
                    <button
                      type="button"
                      onClick={() => set("serviceAreas", draft.serviceAreas.filter((a) => a !== area))}
                      aria-label={interpolate(t.settings.removeArea, { area })}
                      className="grid size-6 place-items-center rounded-full text-subtle-foreground hover:bg-surface-sunken hover:text-foreground"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const area = newArea.trim();
                  if (area && !draft.serviceAreas.includes(area)) set("serviceAreas", [...draft.serviceAreas, area]);
                  setNewArea("");
                }}
              >
                <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder={t.settings.areaPlaceholder} aria-label={t.settings.addArea} />
                <Button type="submit" variant="secondary">
                  <Plus aria-hidden />
                  {t.settings.addArea}
                </Button>
              </form>
            </Panel>

            <Panel title={t.settings.hours}>
              <Switch
                label={t.settings.dispatch24h}
                description={t.settings.dispatch24hHint}
                checked={draft.dispatch24h}
                onChange={(e) => set("dispatch24h", e.target.checked)}
                className="mb-4"
              />
              <ul className="divide-y divide-border">
                {draft.businessHours.map((h, i) => {
                  const update = (patch: Partial<typeof h>) => set("businessHours", draft.businessHours.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                  return (
                    <li key={h.day} className="flex flex-wrap items-center gap-3 py-2.5">
                      <span className="w-28 text-sm font-medium">{t.settings.weekdays[h.day]}</span>
                      <input
                        type="time"
                        value={h.open}
                        disabled={h.closed}
                        onChange={(e) => update({ open: e.target.value })}
                        aria-label={`${t.settings.weekdays[h.day]} — ${t.settings.open}`}
                        className="h-9 rounded-sm border border-input bg-surface px-2 text-sm disabled:opacity-40"
                      />
                      <span aria-hidden className="text-muted-foreground">–</span>
                      <input
                        type="time"
                        value={h.close}
                        disabled={h.closed}
                        onChange={(e) => update({ close: e.target.value })}
                        aria-label={`${t.settings.weekdays[h.day]} — ${t.settings.close}`}
                        className="h-9 rounded-sm border border-input bg-surface px-2 text-sm disabled:opacity-40"
                      />
                      <Checkbox label={t.settings.closed} checked={h.closed} onChange={(e) => update({ closed: e.target.checked })} className="ms-auto" />
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <div className="flex flex-col gap-6">
              <Panel title={t.settings.languages}>
                <div className="flex flex-col gap-4">
                  <Field label={t.settings.defaultLanguage}>
                    <Select value={draft.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value as Draft["defaultLocale"])}>
                      {(["ar", "en"] as const).map((l) => (
                        <option key={l} value={l}>
                          {t.drivers.languages[l]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold">{t.settings.enabledLanguages}</legend>
                    <div className="flex gap-6">
                      {(["ar", "en"] as const).map((l) => (
                        <Checkbox
                          key={l}
                          label={t.drivers.languages[l]}
                          checked={draft.enabledLocales.includes(l)}
                          disabled={l === draft.defaultLocale}
                          onChange={(e) => set("enabledLocales", e.target.checked ? [...draft.enabledLocales, l] : draft.enabledLocales.filter((x) => x !== l))}
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
              </Panel>

              <Panel title={t.settings.currency}>
                <div className="flex flex-col gap-4">
                  <Field label={t.settings.primaryCurrency}>
                    <Select value={draft.primaryCurrency} onChange={(e) => set("primaryCurrency", e.target.value as Draft["primaryCurrency"])}>
                      <option value="USD">USD</option>
                      <option value="LBP">LBP</option>
                    </Select>
                  </Field>
                  <Switch label={t.settings.secondaryCurrency} checked={draft.showSecondaryCurrency} onChange={(e) => set("showSecondaryCurrency", e.target.checked)} />
                  <Field label={t.settings.rate} hint={t.settings.rateNote}>
                    <Input
                      type="number"
                      min={0}
                      dir="ltr"
                      value={draft.lbpPerUsd}
                      disabled={!draft.showSecondaryCurrency}
                      onChange={(e) => set("lbpPerUsd", Number(e.target.value))}
                      className="rtl:text-right"
                    />
                  </Field>
                </div>
              </Panel>
            </div>

            <Panel title={t.settings.notifications} subtitle={t.settings.notificationsHint}>
              <div className="flex flex-col gap-4">
                {notificationTypes.map((type) => (
                  <Switch
                    key={type}
                    label={t.notifications.types[type]}
                    checked={draft.notificationPrefs[type]}
                    onChange={(e) => set("notificationPrefs", { ...draft.notificationPrefs, [type]: e.target.checked })}
                  />
                ))}
              </div>
            </Panel>

            {demoControls && (
              <Panel title={t.settings.demo}>
                <p className="text-sm text-muted-foreground">{t.settings.demoBody}</p>
                <Button variant="secondary" className="mt-4 text-danger" onClick={() => setResetOpen(true)}>
                  <RotateCcw aria-hidden />
                  {t.settings.reset}
                </Button>
              </Panel>
            )}
          </div>
        )}
      </QueryBoundary>
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        tone="danger"
        title={t.settings.resetTitle}
        description={t.settings.resetBody}
        confirmLabel={t.settings.reset}
        onConfirm={async () => {
          demoControls?.reset();
          accessStore.setMatrix(await services.staff.getPermissions());
          setResetOpen(false);
          toast({ tone: "success", title: t.settings.resetDone });
          query.reload();
        }}
      />
    </>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
      <Info aria-hidden className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}
