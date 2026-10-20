import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { CheckList, IconTile } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceIcon, serviceKeys, type ServiceKey } from "@/components/marketing/service-icon";
import { buttonStyles } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.services;
  return pageMetadata({ path: "/services", ...meta });
}

/** Where each service's call-to-action leads. */
const serviceLinks: Record<ServiceKey, string> = {
  city: "/book",
  airport: "/airport-transfers",
  scheduled: "/book",
  corporate: "/contact",
  longDistance: "/book",
};

export default async function ServicesPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.services;

  return (
    <>
      <PageHero {...t.hero}>
        <nav aria-label={t.hero.eyebrow} className="flex flex-wrap gap-2">
          {serviceKeys.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {t.items[key].title}
            </a>
          ))}
        </nav>
      </PageHero>

      <Section>
        <Container className="flex flex-col gap-6 lg:gap-8">
          {serviceKeys.map((key, i) => {
            const item = t.items[key];
            return (
              <article
                key={key}
                id={key}
                className="grid scroll-mt-24 gap-8 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14"
              >
                <div className={cn("flex flex-col gap-4", i % 2 === 1 && "lg:order-2")}>
                  <IconTile tone={i % 2 === 0 ? "brand" : "accent"}>
                    <ServiceIcon service={key} />
                  </IconTile>
                  <h2 className="text-h2 font-bold">{item.title}</h2>
                  <p className="text-lead text-muted-foreground">{item.body}</p>
                  <Link
                    href={localizePath(serviceLinks[key], locale)}
                    className={cn(buttonStyles({ variant: "primary" }), "mt-2 self-start max-sm:w-full")}
                  >
                    {item.cta}
                    <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                  </Link>
                </div>
                <div className="rounded-xl bg-surface-muted p-6 sm:p-8">
                  <CheckList items={item.points} />
                </div>
              </article>
            );
          })}
        </Container>
      </Section>

      <CtaBand
        title={dict.pages.home.cta.title}
        body={dict.pages.home.cta.body}
        actions={
          <>
            <Link href={localizePath("/book", locale)} className={buttonStyles({ variant: "accent", size: "lg" })}>
              {dict.nav.book}
            </Link>
            <Link href={localizePath("/contact", locale)} className={buttonStyles({ variant: "inverse", size: "lg" })}>
              {dict.nav.contact}
            </Link>
          </>
        }
      />
    </>
  );
}
