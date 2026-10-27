import { Suspense } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { LocaleSwitcher, LocaleSwitcherLink } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { NavLinks, NavList } from "./nav-links";

/**
 * Pathname-aware pieces (active link, locale switch target, mobile menu) sit in
 * Suspense boundaries so routes with runtime params can still be prerendered.
 */
export async function SiteHeader() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Link href={localizePath("/", locale)} className="rounded-sm">
          <Logo name={dict.meta.siteName} />
        </Link>

        <nav aria-label={dict.nav.mainNavigation} className="hidden lg:block">
          <Suspense fallback={<NavList pathname={null} />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Suspense fallback={<LocaleSwitcherLink pathname={null} className="hidden sm:inline-flex" />}>
            <LocaleSwitcher className="hidden sm:inline-flex" />
          </Suspense>
          <Link
            href={localizePath("/book", locale)}
            className={cn(buttonStyles({ variant: "accent", size: "sm" }), "hidden xs:inline-flex sm:h-10 sm:px-4")}
          >
            {dict.nav.book}
          </Link>
          <Suspense
            fallback={
              <span aria-hidden className={cn(buttonStyles({ variant: "ghost", size: "icon" }), "lg:hidden")}>
                <Menu />
              </span>
            }
          >
            <MobileNav />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
