"use client";

import { useMemo, useState, type FormEvent } from "react";
import { FileWarning, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAccess } from "@/features/admin/access";
import { expiryState } from "@/features/admin/format";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import type { VehicleInput } from "@/services";
import { ServiceError, type Vehicle, type VehicleClass, type VehicleStatus } from "@/types";
import { useAdmin } from "../admin-provider";
import { ExpiryBadge, VehicleStatusBadge } from "../badges";
import { DataTable, type Column } from "../data-table";
import { PageHeader } from "../page-parts";
import { FilterSelect, SearchInput, Toolbar } from "../toolbar";
import { useFleetLookups } from "../use-lookups";

const classes: VehicleClass[] = ["economy", "comfort", "business", "van"];
const statuses: VehicleStatus[] = ["active", "maintenance", "inactive"];
const docs = ["registrationExpiresAt", "insuranceExpiresAt", "inspectionExpiresAt"] as const;
const docLabel = { registrationExpiresAt: "registration", insuranceExpiresAt: "insurance", inspectionExpiresAt: "inspection" } as const;

export function VehiclesPage() {
  const { t, dict } = useAdmin();
  const { can } = useAccess();
  const now = useNow();
  const [search, setSearch] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass | "">("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [sort, setSort] = useState("plateNumber");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  const lookups = useFleetLookups(refresh);
  const query = useServiceQuery(
    () =>
      services.vehicles.list({
        search,
        sort,
        page,
        perPage: 15,
        filters: { vehicleClass: vehicleClass ? [vehicleClass] : undefined, status: status ? [status] : undefined },
      }),
    [search, vehicleClass, status, sort, page, refresh],
  );
  const driverByVehicle = useMemo(() => new Map(lookups.drivers.filter((d) => d.vehicleId).map((d) => [d.vehicleId!, d])), [lookups.drivers]);
  const expiringCount = now
    ? lookups.vehicles.reduce((n, v) => n + docs.filter((k) => expiryState(v[k], now).state !== "ok").length, 0)
    : 0;

  const columns: Column<Vehicle>[] = [
    { key: "plate", header: t.vehicles.columns.plate, sortKey: "plateNumber", cell: (v) => <span className="font-mono font-semibold" dir="ltr">{v.plateNumber}</span> },
    {
      key: "vehicle",
      header: t.vehicles.columns.vehicle,
      sortKey: "model",
      cell: (v) => (
        <span className="flex flex-col">
          <span dir="ltr">
            {v.make} {v.model}
          </span>
          <span className="text-xs text-muted-foreground">
            {v.year} · {v.color}
          </span>
        </span>
      ),
    },
    { key: "class", header: t.vehicles.columns.vehicleClass, sortKey: "vehicleClass", cell: (v) => dict.vehicleClass[v.vehicleClass].name },
    { key: "capacity", header: t.vehicles.columns.capacity, hideBelow: "lg", cell: (v) => interpolate(t.vehicles.capacity, { seats: v.seats, bags: v.luggageCapacity }) },
    {
      key: "driver",
      header: t.vehicles.columns.driver,
      hideBelow: "md",
      cell: (v) => {
        const d = driverByVehicle.get(v.id);
        return d ? <span dir="ltr">{d.firstName} {d.lastName}</span> : <span className="text-muted-foreground">{t.common.unassigned}</span>;
      },
    },
    { key: "status", header: t.vehicles.columns.status, cell: (v) => <VehicleStatusBadge status={v.status} /> },
    {
      key: "documents",
      header: t.vehicles.columns.documents,
      sortKey: "nextExpiry",
      cell: (v) =>
        now ? (
          <span className="flex flex-col items-start gap-1">
            {docs.map((k) => {
              const s = expiryState(v[k], now).state;
              return s === "ok" ? null : <ExpiryBadge key={k} iso={v[k]} now={now} label={t.vehicles.documents[docLabel[k]]} />;
            })}
            {docs.every((k) => expiryState(v[k], now).state === "ok") && <ExpiryBadge iso={v.insuranceExpiresAt} now={now} />}
          </span>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title={t.vehicles.title}
        subtitle={t.vehicles.subtitle}
        actions={
          can("vehicles.manage") && (
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden />
              {t.vehicles.add}
            </Button>
          )
        }
      />
      {expiringCount > 0 && (
        <p role="status" className="flex items-center gap-2 rounded-card border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-medium text-warning-soft-foreground">
          <FileWarning aria-hidden className="size-4" />
          {interpolate(t.vehicles.expiringSoon, { count: expiringCount })}
        </p>
      )}
      <div className="rounded-card border border-border bg-surface shadow-xs">
        <Toolbar
          canClear={Boolean(search || vehicleClass || status)}
          onClear={() => {
            setSearch("");
            setVehicleClass("");
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
            label={t.vehicles.columns.vehicleClass}
            value={vehicleClass}
            onChange={(v) => {
              setVehicleClass(v);
              setPage(1);
            }}
            options={classes.map((c) => ({ value: c, label: dict.vehicleClass[c].name }))}
          />
          <FilterSelect
            label={t.vehicles.columns.status}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={statuses.map((s) => ({ value: s, label: t.vehicles.status[s] }))}
          />
        </Toolbar>
        <DataTable
          caption={t.vehicles.title}
          columns={columns}
          rows={query.data?.data}
          rowKey={(v) => v.id}
          status={query.status}
          onRetry={query.reload}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          meta={query.data?.meta}
          onPageChange={setPage}
          onRowClick={can("vehicles.manage") ? setEditing : undefined}
        />
      </div>
      {editing && <VehicleFormModal vehicle={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => setRefresh((n) => n + 1)} />}
    </>
  );
}

const dateValue = (iso?: string) => iso?.slice(0, 10) ?? "";
const toIso = (date: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);

function VehicleFormModal({ vehicle, onClose, onSaved }: { vehicle?: Vehicle; onClose: () => void; onSaved: () => void }) {
  const { t, dict } = useAdmin();
  const { toast } = useToast();
  const fm = t.vehicles.form;
  const [v, setV] = useState({
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    year: String(vehicle?.year ?? 2024),
    color: vehicle?.color ?? "",
    plateNumber: vehicle?.plateNumber ?? "",
    vehicleClass: vehicle?.vehicleClass ?? ("economy" as VehicleClass),
    seats: String(vehicle?.seats ?? 4),
    luggageCapacity: String(vehicle?.luggageCapacity ?? 2),
    status: vehicle?.status ?? ("active" as VehicleStatus),
    registrationExpiresAt: dateValue(vehicle?.registrationExpiresAt),
    insuranceExpiresAt: dateValue(vehicle?.insuranceExpiresAt),
    inspectionExpiresAt: dateValue(vehicle?.inspectionExpiresAt),
    mileageKm: String(vehicle?.mileageKm ?? ""),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof v>(k: K, value: (typeof v)[K]) => {
    setV((s) => ({ ...s, [k]: value }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    (["make", "model", "color", "plateNumber"] as const).forEach((k) => {
      if (!v[k].trim()) next[k] = t.common.fieldRequired;
    });
    const year = Number(v.year);
    if (!Number.isInteger(year) || year < 1990 || year > 2030) next.year = t.common.invalidNumber;
    (["seats", "luggageCapacity"] as const).forEach((k) => {
      if (!(Number(v[k]) >= 0) || v[k] === "") next[k] = t.common.invalidNumber;
    });
    if (v.mileageKm && !(Number(v.mileageKm) >= 0)) next.mileageKm = t.common.invalidNumber;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const input: VehicleInput = {
      make: v.make.trim(),
      model: v.model.trim(),
      year,
      color: v.color.trim(),
      plateNumber: v.plateNumber.trim().toUpperCase(),
      vehicleClass: v.vehicleClass,
      seats: Number(v.seats),
      luggageCapacity: Number(v.luggageCapacity),
      status: v.status,
      features: vehicle?.features ?? ["air_conditioning"],
      registrationExpiresAt: toIso(v.registrationExpiresAt),
      insuranceExpiresAt: toIso(v.insuranceExpiresAt),
      inspectionExpiresAt: toIso(v.inspectionExpiresAt),
      lastServiceAt: vehicle?.lastServiceAt,
      mileageKm: v.mileageKm ? Number(v.mileageKm) : undefined,
    };
    try {
      const saved = vehicle ? await services.vehicles.update(vehicle.id, input) : await services.vehicles.create(input);
      toast({ tone: "success", title: interpolate(vehicle ? fm.updated : fm.created, { plate: saved.plateNumber }) });
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ServiceError && error.fieldErrors?.plateNumber) setErrors({ plateNumber: fm.plateTaken });
      else toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  const text = (k: keyof typeof v, label: string, props: { type?: string; ltr?: boolean } = {}) => (
    <Field label={label} error={errors[k]} required={["make", "model", "color", "plateNumber", "year"].includes(k)}>
      <Input type={props.type} value={v[k]} onChange={(e) => set(k, e.target.value as never)} dir={props.ltr ? "ltr" : undefined} className={props.ltr ? "rtl:text-right" : undefined} />
    </Field>
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      dismissible={!saving}
      title={vehicle ? interpolate(fm.editTitle, { plate: vehicle.plateNumber }) : fm.createTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="vehicle-form" loading={saving}>
            {vehicle ? t.common.save : t.common.create}
          </Button>
        </>
      }
    >
      <form id="vehicle-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {text("plateNumber", fm.plate, { ltr: true })}
        <Field label={t.vehicles.columns.vehicleClass}>
          <Select value={v.vehicleClass} onChange={(e) => set("vehicleClass", e.target.value as VehicleClass)}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {dict.vehicleClass[c].name}
              </option>
            ))}
          </Select>
        </Field>
        {text("make", fm.make, { ltr: true })}
        {text("model", fm.model, { ltr: true })}
        {text("year", fm.year, { type: "number" })}
        {text("color", fm.color)}
        {text("seats", fm.seats, { type: "number" })}
        {text("luggageCapacity", fm.luggage, { type: "number" })}
        <Field label={t.vehicles.columns.status}>
          <Select value={v.status} onChange={(e) => set("status", e.target.value as VehicleStatus)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {t.vehicles.status[s]}
              </option>
            ))}
          </Select>
        </Field>
        {text("mileageKm", fm.mileage, { type: "number" })}
        {text("registrationExpiresAt", t.vehicles.documents.registration, { type: "date" })}
        {text("insuranceExpiresAt", t.vehicles.documents.insurance, { type: "date" })}
        {text("inspectionExpiresAt", t.vehicles.documents.inspection, { type: "date" })}
      </form>
    </Modal>
  );
}
