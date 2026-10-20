import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDictionary } from "@/i18n/get-dictionary";

/** Chrome for the public website. Dashboards get their own route group later. */
export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const dict = await getDictionary();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {dict.common.skipToContent}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
