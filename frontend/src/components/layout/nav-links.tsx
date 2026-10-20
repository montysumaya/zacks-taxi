"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { mainNav } from "@/config/navigation";
import { localizePath } from "@/i18n/config";
import { cn } from "@/lib/cn";

export function isActivePath(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => isActivePath(pathname, href);
}

/** Presentational list; `pathname` is null in the prerendered fallback. */
export function NavList({ pathname }: { pathname: string | null }) {
  const { locale, dict } = useI18n();
  return (
    <ul className="flex items-center gap-1">
      {mainNav.map((item) => {
        const href = localizePath(item.href, locale);
        const active = isActivePath(pathname, href);
        return (
          <li key={item.key}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-10 items-center rounded-sm px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                "after:absolute after:inset-x-3 after:-bottom-[0.9375rem] after:h-0.5 after:rounded-full after:bg-accent after:transition-opacity",
                active ? "after:opacity-100" : "after:opacity-0",
              )}
            >
              {dict.nav[item.key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop primary navigation with active-route indicator. */
export function NavLinks() {
  return <NavList pathname={usePathname()} />;
}
