"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAccess } from "@/features/admin/access";
import { DAY } from "@/features/admin/format";
import { adminPath } from "@/features/admin/navigation";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { formatLebanesePhone, normalizeLebanesePhone } from "@/features/booking/phone";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import { ServiceError, type Driver, type DriverInput, type DriverStatus } from "@/types";
import { useAdmin } from "../admin-provider";
import { BookingStatusBadge, DriverStatusBadge, ExpiryBadge } from "../badges";
import { DataTable, type Column } from "../data-table";
import { DetailRows, PageHeader, StatCard } from "../page-parts";
import { FilterSelect, SearchInput, Toolbar } from "../toolbar";
import { useAdminFormat, useFleetLookups } from "../use-lookups";

const statuses: DriverStatus[] = ["available", "on_trip", "offline", "suspended"];

export function DriversPage() {
  const { t, dict } = useAdmin();
  const { can } = useAccess();
  const f = useAdminFormat();
  const now = useNow();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DriverStatus | "">("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<Driver | "new" | null>(null);
  const [viewing, setViewing] = useState<Driver | null>(null);
  const lookups = useFleetLookups(refresh);
  const query = useServiceQuery(
    () => services.drivers.list({ search, sort, page, perPage: 15, filters: { status: status ? [status] : undefined } }),
    [search, status, sort, page, refresh],
  );

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: t.drivers.columns.name,
      sortKey: "name",
      cell: (d) => (
        <span className="font-semibold" dir="ltr">
          {d.firstName} {d.lastName}
        </span>
      ),
    },
    { key: "phone", header: t.drivers.columns.phone, hideBelow: "lg", cell: (d) => <span dir="ltr">{formatLebanesePhone(d.phone)}</span> },
    { key: "status", header: t.drivers.columns.status, sortKey: "status", cell: (d) => <DriverStatusBadge status={d.status} /> },
    {
      key: "vehicle",
      header: t.drivers.columns.vehicle,
      hideBelow: "md",
      cell: (d) => {
        const v = d.vehicleId ? lookups.vehicleMap.get(d.vehicleId) : undefined;
        return v ? (
          <span className="flex flex-col">
            <span dir="ltr">
              {v.make} {v.model}
            </span>
            <span className="text-xs text-muted-foreground">
              {dict.vehicleClass[v.vehicleClass].name} · <span dir="ltr">{v.plateNumber}</span>
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">{t.common.none}</span>
        );
      },
    },
    {
      key: "rating",
      header: t.drivers.columns.rating,
      sortKey: "rating",
      align: "end",
      cell: (d) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Star aria-hidden className="size-3.5 fill-accent text-accent" />
          {d.rating.toFixed(2)}
        </span>
      ),
    },
    { key: "trips", header: t.drivers.columns.trips, sortKey: "totalTrips", align: "end", hideBelow: "lg", cell: (d) => <span className="tabular-nums">{f.number(d.totalTrips)}</span> },
    { key: "license", header: t.drivers.columns.license, sortKey: "licenseExpiresAt", hideBelow: "xl", cell: (d) => (now ? <ExpiryBadge iso={d.licenseExpiresAt} now={now} /> : null) },
  ];

  return (
    <>
      <PageHeader
        title={t.drivers.title}
        subtitle={t.drivers.subtitle}
        actions={
          can("drivers.manage") && (
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden />
              {t.drivers.add}
            </Button>
          )
        }
      />
      <div className="rounded-card border border-border bg-surface shadow-xs">
        <Toolbar
          canClear={Boolean(search || status)}
          onClear={() => {
            setSearch("");
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
            label={t.drivers.columns.status}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={statuses.map((s) => ({ value: s, label: dict.status.driver[s] }))}
          />
        </Toolbar>
        <DataTable
          caption={t.drivers.title}
          columns={columns}
          rows={query.data?.data}
          rowKey={(d) => d.id}
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

      {viewing && (
        <DriverDrawer
          driver={viewing}
          onClose={() => setViewing(null)}
          onEdit={can("drivers.manage") ? () => setEditing(viewing) : undefined}
        />
      )}
      {editing && (
        <DriverFormModal
          driver={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(d) => {
            setRefresh((n) => n + 1);
            if (viewing) setViewing(d);
          }}
        />
      )}
    </>
  );
}

function DriverDrawer({ driver, onClose, onEdit }: { driver: Driver; onClose: () => void; onEdit?: () => void }) {
  const { t, dict, locale } = useAdmin();
  const f = useAdminFormat();
  const now = useNow();
  const lookups = useFleetLookups(driver.id);
  const history = useServiceQuery(() => services.bookings.list({ filters: { driverId: driver.id }, sort: "-scheduledAt", perPage: 8 }), [driver.id, driver.status]);
  const month = useServiceQuery(
    () => services.bookings.list({ filters: { driverId: driver.id, from: new Date(Date.now() - 30 * DAY).toISOString(), to: new Date().toISOString() }, perPage: 1000 }),
    [driver.id],
  );
  const vehicle = driver.vehicleId ? lookups.vehicleMap.get(driver.vehicleId) : undefined;
  const done = month.data?.data.filter((b) => b.status === "completed") ?? [];
  const cancelled = month.data?.data.filter((b) => b.status === "cancelled" || b.status === "no_show").length ?? 0;

  return (
    <Drawer
      open
      size="lg"
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <span className="font-bold" dir="ltr">
            {driver.firstName} {driver.lastName}
          </span>
          <DriverStatusBadge status={driver.status} />
        </span>
      }
      footer={
        onEdit && (
          <Button variant="secondary" onClick={onEdit} fullWidth>
            <Pencil aria-hidden />
            {t.common.edit}
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-1 text-sm font-bold">{t.drivers.detail.performance}</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t.drivers.detail.trips} value={done.length} loading={!month.data} />
            <StatCard label={t.drivers.detail.revenue} value={f.usd(done.reduce((s, b) => s + b.estimatedFare.amount, 0), 0)} loading={!month.data} />
            <StatCard label={t.drivers.detail.rating} value={driver.rating.toFixed(2)} />
            <StatCard label={t.drivers.detail.cancellations} value={cancelled} loading={!month.data} />
          </div>
        </section>
        <section>
          <h3 className="text-sm font-bold">{t.drivers.detail.contact}</h3>
          <DetailRows
            rows={[
              [t.common.phone, <span key="p" dir="ltr">{formatLebanesePhone(driver.phone)}</span>],
              !!driver.email && [t.common.email, <span key="e" dir="ltr">{driver.email}</span>],
              [t.drivers.form.languages, driver.languages.map((l) => t.drivers.languages[l]).join(" · ")],
              [t.drivers.detail.joined, f.date(driver.joinedAt)],
              [t.drivers.detail.lifetimeTrips, f.number(driver.totalTrips)],
            ]}
          />
        </section>
        <section>
          <h3 className="text-sm font-bold">{t.drivers.detail.license}</h3>
          <DetailRows
            rows={[
              [t.drivers.form.licenseNumber, <span key="l" dir="ltr" className="font-mono">{driver.licenseNumber}</span>],
              [t.drivers.form.licenseExpiry, <span key="x" className="flex items-center justify-end gap-2">{f.date(driver.licenseExpiresAt)} {now ? <ExpiryBadge iso={driver.licenseExpiresAt} now={now} /> : null}</span>],
            ]}
          />
        </section>
        <section>
          <h3 className="text-sm font-bold">{t.drivers.detail.vehicle}</h3>
          <DetailRows
            rows={[
              vehicle
                ? [dict.vehicleClass[vehicle.vehicleClass].name, <span key="v" dir="ltr">{vehicle.make} {vehicle.model} · {vehicle.plateNumber}</span>]
                : [t.drivers.detail.vehicle, t.common.none],
            ]}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">{t.drivers.detail.history}</h3>
          {!history.data ? (
            <Skeleton className="h-40" />
          ) : history.data.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.drivers.detail.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {history.data.data.map((b) => (
                <li key={b.id}>
                  <Link href={adminPath(locale, `/bookings/${b.id}`)} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-muted">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{f.route(b)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{f.dateTime(b.scheduledAt)}</span>
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

function DriverFormModal({ driver, onClose, onSaved }: { driver?: Driver; onClose: () => void; onSaved: (d: Driver) => void }) {
  const { t, dict } = useAdmin();
  const { toast } = useToast();
  const lookups = useFleetLookups();
  const fm = t.drivers.form;
  const [values, setValues] = useState({
    firstName: driver?.firstName ?? "",
    lastName: driver?.lastName ?? "",
    phone: driver?.phone.replace(/^\+961/, "") ?? "",
    email: driver?.email ?? "",
    status: driver?.status ?? ("offline" as DriverStatus),
    languages: driver?.languages ?? (["ar"] as DriverInput["languages"]),
    licenseNumber: driver?.licenseNumber ?? "",
    licenseExpiresAt: driver?.licenseExpiresAt.slice(0, 10) ?? "",
    vehicleId: driver?.vehicleId ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  // Vehicles not driven by someone else.
  const takenBy = new Map(lookups.drivers.filter((d) => d.vehicleId && d.id !== driver?.id).map((d) => [d.vehicleId!, d]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const phone = normalizeLebanesePhone(values.phone);
    if (!values.firstName.trim()) next.firstName = t.common.fieldRequired;
    if (!values.lastName.trim()) next.lastName = t.common.fieldRequired;
    if (!phone) next.phone = t.common.invalidPhone;
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = t.common.invalidEmail;
    if (!values.licenseNumber.trim()) next.licenseNumber = t.common.fieldRequired;
    if (!values.licenseExpiresAt) next.licenseExpiresAt = t.common.fieldRequired;
    setErrors(next);
    if (Object.keys(next).length || !phone) return;
    setSaving(true);
    const input: DriverInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone,
      email: values.email.trim() || undefined,
      status: values.status,
      languages: values.languages.length ? values.languages : ["ar"],
      licenseNumber: values.licenseNumber.trim().toUpperCase(),
      licenseExpiresAt: new Date(`${values.licenseExpiresAt}T00:00:00`).toISOString(),
      vehicleId: values.vehicleId || undefined,
    };
    try {
      const saved = driver ? await services.drivers.update(driver.id, input) : await services.drivers.create(input);
      toast({ tone: "success", title: interpolate(driver ? fm.updated : fm.created, { name: `${saved.firstName} ${saved.lastName}` }) });
      onSaved(saved);
      onClose();
    } catch (error) {
      if (error instanceof ServiceError && error.fieldErrors?.licenseNumber) setErrors({ licenseNumber: fm.licenseTaken });
      else toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      dismissible={!saving}
      title={driver ? interpolate(fm.editTitle, { name: `${driver.firstName} ${driver.lastName}` }) : fm.createTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="driver-form" loading={saving}>
            {driver ? t.common.save : t.common.create}
          </Button>
        </>
      }
    >
      <form id="driver-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label={fm.firstName} error={errors.firstName} required>
          <Input value={values.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label={fm.lastName} error={errors.lastName} required>
          <Input value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </Field>
        <Field label={t.common.phone} error={errors.phone} required>
          <PhoneInput value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="70 123 456" />
        </Field>
        <Field label={t.common.email} error={errors.email} optionalLabel={t.common.optional}>
          <Input type="email" dir="ltr" value={values.email} onChange={(e) => set("email", e.target.value)} className="rtl:text-right" />
        </Field>
        <Field label={fm.licenseNumber} error={errors.licenseNumber} required>
          <Input value={values.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} dir="ltr" className="font-mono rtl:text-right" />
        </Field>
        <Field label={fm.licenseExpiry} error={errors.licenseExpiresAt} required>
          <Input type="date" value={values.licenseExpiresAt} onChange={(e) => set("licenseExpiresAt", e.target.value)} />
        </Field>
        <Field label={fm.status}>
          <Select value={values.status} onChange={(e) => set("status", e.target.value as DriverStatus)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {dict.status.driver[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={fm.vehicle}>
          <Select value={values.vehicleId} onChange={(e) => set("vehicleId", e.target.value)}>
            <option value="">{t.common.none}</option>
            {lookups.vehicles.map((v) => (
              <option key={v.id} value={v.id} disabled={takenBy.has(v.id)}>
                {v.plateNumber} · {v.make} {v.model} ({dict.vehicleClass[v.vehicleClass].name})
              </option>
            ))}
          </Select>
        </Field>
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{fm.languages}</legend>
          <div className="flex flex-wrap gap-5">
            {(["ar", "en", "fr"] as const).map((l) => (
              <Checkbox
                key={l}
                label={t.drivers.languages[l]}
                checked={values.languages.includes(l)}
                onChange={(e) => set("languages", e.target.checked ? [...values.languages, l] : values.languages.filter((x) => x !== l))}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
