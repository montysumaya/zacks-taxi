"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { localeCookie, localeMeta, switchLocalePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Switches between Arabic and English, keeping the current page.
 * A plain <a> is used on purpose: changing the root `[lang]` segment swaps the
 * root layout (`<html lang dir>`), which requires a full document load.
 */
export function LocaleSwitcher(props: { className?: string; onSwitch?: () => void }) {
  return <LocaleSwitcherLink {...props} pathname={usePathname()} />;
}

/** `pathname` is null in the prerendered fallback: links to the other locale's home. */
export function LocaleSwitcherLink({
  className,
  onSwitch,
  pathname,
}: {
  className?: string;
  onSwitch?: () => void;
  pathname: string | null;
}) {
  const { locale, dict } = useI18n();
  const target: Locale = locale === "en" ? "ar" : "en";

  return (
    <a
      href={pathname ? switchLocalePath(pathname, target) : `/${target}`}
      hrefLang={target}
      lang={target}
      onClick={() => {
        document.cookie = `${localeCookie}=${target}; path=/; max-age=31536000; samesite=lax`;
        onSwitch?.();
      }}
      aria-label={`${dict.nav.language}: ${localeMeta[target].label}`}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-sm px-3 text-[0.9375rem] font-semibold text-foreground transition-colors hover:bg-surface-sunken",
        className,
      )}
    >
      <Languages aria-hidden className="size-[1.125rem] text-subtle-foreground" />
      {dict.nav.switchTo}
    </a>
  );
}
