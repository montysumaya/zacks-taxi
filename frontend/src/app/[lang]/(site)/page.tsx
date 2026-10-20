import Link from "next/link";
import { ArrowRight, Clock3, Languages, Quote, ReceiptText, ShieldCheck } from "lucide-react";
import { BookingWidget } from "@/components/booking/booking-widget";
import { RoutePattern } from "@/components/brand/route-pattern";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { CheckList, IconTile } from "@/components/marketing/feature-card";
import { ServiceIcon, serviceKeys } from "@/components/marketing/service-icon";
import { VehicleCard } from "@/components/marketing/vehicle-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { getVehicleClasses } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.home;
  return pageMetadata({ path: "/", ...meta });
}

const whyIcons = [ReceiptText, ShieldCheck, Clock3, Languages];

export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.home;
  const vehicleClasses = await getVehicleClasses();
  const href = (path: string) => localizePath(path, locale);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface-inverse text-white">
        <RoutePattern />
        <Container className="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="flex animate-fade-up flex-col gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-accent">
              <span aria-hidden className="size-2 rounded-full bg-accent" />
              {t.hero.eyebrow}
            </p>
            <h1 className="text-display font-extrabold text-white">{t.hero.title}</h1>
            <p className="max-w-xl text-lead text-white/75">{t.hero.subtitle}</p>
            <CheckList items={t.hero.highlights} tone="inverse" className="mt-2" />
          </div>
          <div id="book" className="w-full max-w-md justify-self-center lg:justify-self-end">
            <BookingWidget compact />
          </div>
        </Container>
      </section>

      {/* Services */}
      <Section>
        <Container className="flex flex-col gap-12">
          <SectionHeader>
            <Eyebrow>{t.services.eyebrow}</Eyebrow>
            <Heading>{t.services.title}</Heading>
            <Text tone="muted" size="lead">
              {t.services.subtitle}
            </Text>
          </SectionHeader>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {serviceKeys.map((key, i) => {
              const service = dict.pages.services.items[key];
              return (
                <Link
                  key={key}
                  href={`${href("/services")}#${key}`}
                  className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}
                >
                  <Card interactive padding="lg" className="flex h-full flex-col gap-4">
                    <IconTile>
                      <ServiceIcon service={key} />
                    </IconTile>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-h5 font-semibold">{service.title}</h3>
                      <p className="text-[0.9375rem] text-muted-foreground">{service.summary}</p>
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-soft-foreground">
                      {dict.common.learnMore}
                      <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Vehicle categories */}
      <Section tone="muted">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader align="start">
              <Eyebrow>{t.vehicles.eyebrow}</Eyebrow>
              <Heading>{t.vehicles.title}</Heading>
              <Text tone="muted" size="lead">
                {t.vehicles.subtitle}
              </Text>
            </SectionHeader>
            <Link href={href("/fleet")} className={buttonStyles({ variant: "secondary" })}>
              {t.vehicles.cta}
              <ArrowRight aria-hidden className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {vehicleClasses.map((summary) => (
              <VehicleCard key={summary.vehicleClass} summary={summary} dict={dict} locale={locale} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Airport promotion */}
      <Section>
        <Container>
          <div className="grid overflow-hidden rounded-2xl border border-border bg-surface shadow-lg lg:grid-cols-2">
            <div className="flex flex-col gap-5 p-7 sm:p-10 lg:p-14">
              <Eyebrow>{t.airportPromo.eyebrow}</Eyebrow>
              <Heading>{t.airportPromo.title}</Heading>
              <Text tone="muted">{t.airportPromo.body}</Text>
              <CheckList items={t.airportPromo.points} />
              <Link
                href={href("/airport-transfers")}
                className={cn(buttonStyles({ variant: "primary", size: "lg" }), "mt-2 self-start max-sm:w-full")}
              >
                {t.airportPromo.cta}
              </Link>
            </div>
            <AirportVisual />
          </div>
        </Container>
      </Section>

      {/* Why choose us */}
      <Section tone="inverse" className="relative isolate overflow-hidden">
        <RoutePattern className="opacity-60" />
        <Container className="relative flex flex-col gap-12">
          <SectionHeader>
            <p className="text-overline font-bold uppercase text-accent">{t.why.eyebrow}</p>
            <h2 className="text-h2 font-bold text-white">{t.why.title}</h2>
          </SectionHeader>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, i) => {
              const Icon = whyIcons[i % whyIcons.length];
              return (
                <div key={item.title} className="flex flex-col gap-4 rounded-card border border-white/10 bg-white/[0.04] p-6">
                  <IconTile tone="inverse">
                    <Icon />
                  </IconTile>
                  <h3 className="text-h5 font-semibold text-white">{item.title}</h3>
                  <p className="text-[0.9375rem] text-white/70">{item.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section>
        <Container className="flex flex-col gap-12">
          <SectionHeader>
            <Eyebrow>{t.how.eyebrow}</Eyebrow>
            <Heading>{t.how.title}</Heading>
          </SectionHeader>
          <ol className="grid gap-5 md:grid-cols-3">
            {t.how.steps.map((step, i) => (
              <li key={step.title} className="relative flex flex-col gap-3 rounded-card border border-border bg-surface p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-full bg-accent text-lg font-extrabold text-accent-foreground">
                  {i + 1}
                </span>
                <h3 className="text-h5 font-semibold">{step.title}</h3>
                <p className="text-[0.9375rem] text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Trust — placeholder testimonials, clearly labelled */}
      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <SectionHeader>
            <Eyebrow>{t.trust.eyebrow}</Eyebrow>
            <Heading>{t.trust.title}</Heading>
            <Badge tone="warning" className="mt-1 h-auto py-1 whitespace-normal">
              {t.trust.notice}
            </Badge>
          </SectionHeader>
          <div className="grid gap-5 md:grid-cols-3">
            {t.trust.items.map((item, i) => (
              <figure key={i} className="flex flex-col gap-5 rounded-card border border-dashed border-border-strong bg-surface p-6">
                <div className="flex items-center justify-between">
                  <Quote aria-hidden className="size-7 text-accent rtl:-scale-x-100" />
                  <Badge size="sm">{dict.common.placeholder}</Badge>
                </div>
                <blockquote className="text-[0.9375rem] text-muted-foreground italic">{item.quote}</blockquote>
                <figcaption className="mt-auto flex flex-col">
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <span className="text-sm text-subtle-foreground">{item.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ preview */}
      <Section>
        <Container size="content" className="flex flex-col gap-10">
          <SectionHeader>
            <Eyebrow>{t.faqPreview.eyebrow}</Eyebrow>
            <Heading>{t.faqPreview.title}</Heading>
          </SectionHeader>
          <FaqList items={dict.pages.faq.groups.map((g) => g.items[0])} />
          <Link href={href("/faq")} className={cn(buttonStyles({ variant: "secondary" }), "self-center")}>
            {t.faqPreview.cta}
            <ArrowRight aria-hidden className="rtl:-scale-x-100" />
          </Link>
        </Container>
      </Section>

      <CtaBand
        title={t.cta.title}
        body={t.cta.body}
        actions={
          <>
            <Link href={href("/book")} className={buttonStyles({ variant: "accent", size: "lg" })}>
              {t.cta.primary}
            </Link>
            <Link href={href("/contact")} className={buttonStyles({ variant: "inverse", size: "lg" })}>
              {t.cta.secondary}
            </Link>
          </>
        }
      />
    </>
  );
}

/** Decorative airport panel: a stylised departures board. */
function AirportVisual() {
  return (
    <div aria-hidden className="relative isolate flex min-h-64 items-center justify-center overflow-hidden bg-surface-inverse p-8">
      <RoutePattern />
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-5 font-mono text-sm text-white/80 backdrop-blur">
        <div className="mb-4 flex items-center justify-between text-xs tracking-widest text-accent uppercase">
          <span>BEY</span>
          <span>✈</span>
        </div>
        {["FL 101", "FL 204", "FL 318"].map((flight, i) => (
          <div key={flight} className="flex items-center justify-between border-t border-white/10 py-2.5" dir="ltr">
            <span className="font-semibold text-white">{flight}</span>
            <span className="h-2 w-16 rounded-full bg-white/15" />
            <span className={i === 0 ? "text-accent" : "text-white/50"}>●</span>
          </div>
        ))}
      </div>
    </div>
  );
}
