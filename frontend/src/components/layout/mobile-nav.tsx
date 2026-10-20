"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { brand } from "@/config/brand";
import { footerNav, mainNav } from "@/config/navigation";
import { localizePath } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { LocaleSwitcher } from "./locale-switcher";
import { useIsActive } from "./nav-links";

export function MobileNav() {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const close = () => setOpen(false);

  // Pages stay mounted (hidden) after navigation; never restore an open menu.
  useLayoutEffect(() => () => setOpen(false), []);

  const items = [{ key: "home" as const, href: "/" }, ...mainNav, footerNav.company[2]];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={dict.nav.openMenu}
        aria-expanded={open}
        className="lg:hidden"
      >
        <Menu />
      </Button>
      <Drawer
        open={open}
        onClose={close}
        title={<Logo name={dict.meta.siteName} />}
        footer={
          <div className="flex flex-col gap-3">
            <Link
              href={localizePath("/book", locale)}
              onNavigate={close}
              className={buttonStyles({ variant: "accent", size: "lg", fullWidth: true })}
            >
              {dict.nav.book}
            </Link>
            <a
              href={brand.contact.phone.href}
              className={cn(buttonStyles({ variant: "secondary", fullWidth: true }), "gap-2")}
            >
              <Phone aria-hidden />
              <span dir="ltr">{brand.contact.phone.display}</span>
              {brand.contact.phone.placeholder && (
                <Badge tone="warning" size="sm">
                  {dict.common.placeholder}
                </Badge>
              )}
            </a>
          </div>
        }
      >
        <nav aria-label={dict.nav.mainNavigation}>
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const href = localizePath(item.href, locale);
              const active = item.href === "/" ? false : isActive(href);
              return (
                <li key={item.key}>
                  <Link
                    href={href}
                    onNavigate={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center justify-between rounded-md px-3 text-base font-semibold transition-colors",
                      active ? "bg-primary-soft text-primary-soft-foreground" : "text-foreground hover:bg-surface-muted",
                    )}
                  >
                    {dict.nav[item.key]}
                    <ChevronRight aria-hidden className="size-4 text-subtle-foreground rtl:-scale-x-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <LocaleSwitcher onSwitch={close} className="w-full justify-start" />
        </div>
      </Drawer>
    </>
  );
}
