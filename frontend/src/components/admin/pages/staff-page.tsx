"use client";

import { useState, type FormEvent } from "react";
import { Info, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { accessStore } from "@/features/admin/access";
import { relativeTime } from "@/features/admin/format";
import { useNow, useServiceQuery } from "@/features/admin/use-service-query";
import { interpolate } from "@/i18n/interpolate";
import { services } from "@/services";
import { permissions, ServiceError, type Permission, type PermissionMatrix, type StaffMember, type StaffRole } from "@/types";
import { useAdmin } from "../admin-provider";
import { StaffStatusBadge } from "../badges";
import { DataTable, type Column } from "../data-table";
import { PageHeader, Panel, QueryBoundary } from "../page-parts";
import { SearchInput, Toolbar } from "../toolbar";

const roles: StaffRole[] = ["admin", "dispatcher", "accountant", "support"];

export function StaffPage() {
  const { t } = useAdmin();
  const now = useNow();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("fullName");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<StaffMember | "new" | null>(null);
  const query = useServiceQuery(() => services.staff.list({ search, sort, page, perPage: 10 }), [search, sort, page, refresh]);

  const columns: Column<StaffMember>[] = [
    { key: "name", header: t.staff.columns.name, sortKey: "fullName", cell: (s) => <span className="font-semibold">{s.fullName}</span> },
    { key: "email", header: t.staff.columns.email, hideBelow: "md", cell: (s) => <span dir="ltr">{s.email}</span> },
    { key: "role", header: t.staff.columns.role, sortKey: "role", cell: (s) => t.roles[s.role] },
    { key: "status", header: t.staff.columns.status, cell: (s) => <StaffStatusBadge status={s.status} /> },
    { key: "last", header: t.staff.columns.lastActive, sortKey: "lastActiveAt", hideBelow: "lg", cell: (s) => (s.lastActiveAt && now ? relativeTime(s.lastActiveAt, now, t.time) : "—") },
  ];

  return (
    <>
      <PageHeader
        title={t.staff.title}
        subtitle={t.staff.subtitle}
        actions={
          <Button onClick={() => setEditing("new")}>
            <UserPlus aria-hidden />
            {t.staff.invite}
          </Button>
        }
      />
      <div className="rounded-card border border-border bg-surface shadow-xs">
        <Toolbar
          canClear={Boolean(search)}
          onClear={() => {
            setSearch("");
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
        </Toolbar>
        <DataTable
          caption={t.staff.title}
          columns={columns}
          rows={query.data?.data}
          rowKey={(s) => s.id}
          status={query.status}
          onRetry={query.reload}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          meta={query.data?.meta}
          onPageChange={setPage}
          onRowClick={setEditing}
        />
      </div>
      <PermissionMatrixPanel />
      {editing && <StaffModal member={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => setRefresh((n) => n + 1)} />}
    </>
  );
}

function PermissionMatrixPanel() {
  const { t } = useAdmin();
  const { toast } = useToast();
  const query = useServiceQuery(() => services.staff.getPermissions(), ["permissions"]);
  const [draft, setDraft] = useState<PermissionMatrix | null>(null);
  const [synced, setSynced] = useState<PermissionMatrix | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  if (query.data && query.data !== synced) {
    setSynced(query.data);
    setDraft(structuredClone(query.data));
  }
  const toggle = (role: StaffRole, p: Permission, on: boolean) =>
    setDraft((d) => d && { ...d, [role]: on ? [...d[role], p] : d[role].filter((x) => x !== p) });

  return (
    <Panel
      title={t.staff.matrixTitle}
      subtitle={t.staff.matrixSubtitle}
      bodyClassName="p-0"
      actions={
        draft && (
          <Button
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const saved = await services.staff.updatePermissions(draft);
                // Apply to the simulated navigation immediately.
                accessStore.setMatrix(saved);
                toast({ tone: "success", title: t.common.saved });
                query.reload();
              } catch {
                toast({ tone: "error", title: t.common.saveFailed });
              } finally {
                setSaving(false);
              }
            }}
          >
            {t.common.save}
          </Button>
        )
      }
    >
      <QueryBoundary status={query.status} hasData={!!draft} onRetry={query.reload} skeleton={<Skeleton className="m-5 h-80" />}>
        {draft && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">{t.staff.matrixTitle}</caption>
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-2.5 text-start font-semibold" />
                  {roles.map((r) => (
                    <th key={r} scope="col" className="px-4 py-2.5 text-center font-semibold">
                      {t.roles[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissions.map((p) => (
                  <tr key={p} className="hover:bg-surface-muted">
                    <th scope="row" className="px-5 py-2 text-start font-medium">
                      {t.staff.permissions[p]}
                    </th>
                    {roles.map((r) => {
                      const locked = r === "admin" && p === "staff.manage";
                      return (
                        <td key={r} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={draft[r].includes(p)}
                            disabled={locked}
                            title={locked ? t.staff.adminLocked : undefined}
                            onChange={(e) => toggle(r, p, e.target.checked)}
                            aria-label={`${t.roles[r]}: ${t.staff.permissions[p]}`}
                            className="size-4 accent-[var(--primary)]"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="flex items-center gap-2 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <Info aria-hidden className="size-3.5" />
              {t.staff.adminLocked}
            </p>
          </div>
        )}
      </QueryBoundary>
    </Panel>
  );
}

function StaffModal({ member, onClose, onSaved }: { member?: StaffMember; onClose: () => void; onSaved: () => void }) {
  const { t } = useAdmin();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [role, setRole] = useState<StaffRole>(member?.role ?? "dispatcher");
  const [status, setStatus] = useState<StaffMember["status"]>(member?.status ?? "invited");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = t.common.fieldRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = t.common.invalidEmail;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      if (member) {
        await services.staff.update(member.id, { fullName: fullName.trim(), email: email.trim(), role, status });
        toast({ tone: "success", title: t.common.saved });
      } else {
        await services.staff.invite({ fullName: fullName.trim(), email: email.trim(), role });
        toast({ tone: "success", title: interpolate(t.staff.invited, { name: fullName.trim() }) });
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ServiceError && error.fieldErrors?.email) setErrors({ email: t.staff.emailTaken });
      else toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!saving}
      title={member ? interpolate(t.staff.editTitle, { name: member.fullName }) : t.staff.inviteTitle}
      description={member ? undefined : t.staff.inviteDescription}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="staff-form" loading={saving}>
            {member ? t.common.save : t.staff.invite}
          </Button>
        </>
      }
    >
      <form id="staff-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t.common.name} error={errors.fullName} required>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label={t.common.email} error={errors.email} required>
          <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="rtl:text-right" />
        </Field>
        <Field label={t.staff.columns.role}>
          <Select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {t.roles[r]}
              </option>
            ))}
          </Select>
        </Field>
        {member && (
          <Field label={t.staff.columns.status}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as StaffMember["status"])}>
              {(["active", "invited", "suspended"] as const).map((s) => (
                <option key={s} value={s}>
                  {t.staff.status[s]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </form>
    </Modal>
  );
}
