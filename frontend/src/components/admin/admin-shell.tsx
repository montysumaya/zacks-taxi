"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Car,
  ChartColumn,
  ClipboardList,
  Contact,
  FlaskConical,
  IdCard,
  LayoutDashboard,
  Menu,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { accessStore, useAccess } from "@/features/admin/access";
import { adminNav, adminNavGroups, adminPath, type AdminNavKey } from "@/features/admin/navigation";
import { useNow } from "@/features/admin/use-service-query";
import { cn } from "@/lib/cn";
import type { StaffRole } from "@/types";
import { useAdmin } from "./admin-provider";
import { NotificationBell } from "./notification-bell";
import { Popover } from "@/components/ui/popover";

const icons: Record<AdminNavKey, LucideIcon> = {
  overview: LayoutDashboard,
  bookings: ClipboardList,
  dispatch: RadioTower,
  drivers: IdCard,
  vehicles: Car,
  customers: Contact,
  pricing: Tags,
  payments: Wallet,
  reports: ChartColumn,
  staff: ShieldCheck,
  notifications: Bell,
  settings: Settings,
};

const roles: StaffRole[] = ["admin", "dispatcher", "accountant", "support"];

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  useLayoutEffect(() => () => setMenuOpen(false), []);

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <p className="flex items-center justify-center gap-2 bg-accent px-4 py-1.5 text-center text-xs font-semibold text-accent-foreground">
        <FlaskConical aria-hidden className="size-3.5 shrink-0" />
        <span>{t.prototypeBanner}</span>
      </p>
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-border bg-surface lg:flex">
          <SidebarContent />
        </aside>
        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={<Logo name="Masar" />}>
          <SidebarContent onNavigate={() => setMenuOpen(false)} compact />
        </Drawer>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const { t, locale, dict } = useAdmin();
  const pathname = usePathname();
  const { can, ready, role } = useAccess();
  const base = adminPath(locale);

  return (
    <div className="flex h-full flex-col">
      {!compact && (
        <Link href={base} className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5">
          <Logo name={dict.meta.siteName} />
        </Link>
      )}
      <nav aria-label={t.nav.overview} className="flex-1 overflow-y-auto px-3 py-4">
        {!ready ? (
          <div className="flex flex-col gap-2 px-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : (
          adminNavGroups.map((group) => {
            const items = adminNav.filter((item) => item.group === group && can(item.permission));
            if (!items.length) return null;
            return (
              <div key={group} className="mb-5">
                <p className="px-3 pb-1.5 text-[0.6875rem] font-bold tracking-wider text-subtle-foreground uppercase">{t.nav.groups[group]}</p>
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const href = `${base}${item.path}`;
                    const active = item.path === "" ? pathname === base : pathname.startsWith(href);
                    const Icon = icons[item.key];
                    return (
                      <li key={item.key}>
                        <Link
                          href={href}
                          onNavigate={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                            active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                          )}
                        >
                          <Icon aria-hidden className="size-[1.125rem] shrink-0" />
                          {t.nav[item.key]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </nav>
      <div className="border-t border-border p-4 text-xs text-subtle-foreground">
        {t.roles[role]} · {t.common.fictionalData}
      </div>
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t, locale, intl } = useAdmin();
  const router = useRouter();
  const now = useNow();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label={t.topbar.openMenu} className="lg:hidden">
        <Menu />
      </Button>
      <form
        role="search"
        className="relative flex-1 md:max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`${adminPath(locale, "/bookings")}?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.topbar.search}
          aria-label={t.topbar.searchShort}
          className="h-10 w-full rounded-control border border-input bg-surface-muted ps-9 pe-3 text-sm placeholder:text-subtle-foreground focus:border-ring focus:bg-surface focus:ring-4 focus:ring-ring/15 focus:outline-none"
        />
      </form>
      <div className="ms-auto flex items-center gap-1 sm:gap-2">
        <time className="hidden text-sm font-medium text-muted-foreground xl:block" dateTime={now ? new Date(now).toISOString() : undefined}>
          {now ? new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now) : ""}
        </time>
        <LocaleSwitcher className="hidden sm:inline-flex" />
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}

function ProfileMenu() {
  const { t, locale, dict } = useAdmin();
  const { role } = useAccess();

  return (
    <Popover
      label={t.topbar.profile}
      className="w-72 p-2"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          aria-label={t.topbar.profile}
          className="flex items-center gap-2 rounded-full p-1 pe-1 transition-colors hover:bg-surface-sunken sm:pe-3"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {t.roles[role].slice(0, 2).toUpperCase()}
          </span>
          <span className="hidden text-start text-sm leading-tight sm:block">
            <span className="block font-semibold text-foreground">{t.roles[role]}</span>
            <span className="block text-xs text-subtle-foreground">{t.common.fictionalData}</span>
          </span>
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          <fieldset className="flex flex-col gap-0.5 p-1">
            <legend className="px-2 pb-1 text-xs font-bold tracking-wider text-subtle-foreground uppercase">{t.topbar.simulateRole}</legend>
            {roles.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-surface-muted has-[:checked]:bg-primary-soft has-[:checked]:font-semibold">
                <input
                  type="radio"
                  name="simulated-role"
                  value={r}
                  checked={role === r}
                  onChange={() => {
                    accessStore.setRole(r);
                    close();
                  }}
                  className="accent-[var(--primary)]"
                />
                {t.roles[r]}
              </label>
            ))}
            <p className="px-2 pt-1 text-xs text-muted-foreground">{t.topbar.simulateRoleNote}</p>
          </fieldset>
          <div className="border-t border-border p-1 pt-2">
            <Link href={`/${locale}`} className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-surface-muted">
              {t.topbar.backToSite} · {dict.meta.siteName}
            </Link>
          </div>
        </div>
      )}
    </Popover>
  );
}
