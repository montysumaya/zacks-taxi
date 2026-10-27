import Link from "next/link";
import { ArrowRight, Eye, HeartHandshake, Info, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureCard, IconTile } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { VehicleCard } from "@/components/marketing/vehicle-card";
import { buttonStyles } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { vehicleClasses } from "@/config/fleet";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.about;
  return pageMetadata({ path: "/about", ...meta });
}

const valueIcons = [HeartHandshake, Eye, Timer, Sparkles];

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.about;

  return (
    <>
      <PageHero {...t.hero} />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-5">
            <Heading>{t.intro.title}</Heading>
            {t.intro.paragraphs.map((p) => (
              <Text key={p} tone="muted" size="lg">
                {p}
              </Text>
            ))}
            <p className="flex gap-2.5 rounded-md border border-dashed border-border-strong p-4 text-sm text-muted-foreground">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
              {t.intro.placeholderNotice}
            </p>
          </div>
          <div className="relative isolate flex flex-col justify-center gap-4 overflow-hidden rounded-2xl bg-accent p-8 text-accent-foreground sm:p-12">
            <p className="text-overline font-bold uppercase">{t.mission.eyebrow}</p>
            <p className="text-h2 font-bold">{t.mission.title}</p>
            <p className="text-lead opacity-80">{t.mission.body}</p>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-12">
          <SectionHeader>
            <Heading>{t.values.title}</Heading>
          </SectionHeader>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.values.items.map((item, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return <FeatureCard key={item.title} icon={<Icon />} title={item.title} body={item.body} />;
            })}
          </div>
        </Container>
      </Section>

      <Section id="safety">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>{t.safety.eyebrow}</Eyebrow>
            <Heading>{t.safety.title}</Heading>
            <Text tone="muted" size="lg">
              {t.safety.body}
            </Text>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {t.safety.items.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-card border border-border bg-surface p-5 shadow-card">
                <IconTile className="size-10 [&_svg]:size-5">
                  <ShieldCheck />
                </IconTile>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader align="start">
              <Heading>{t.fleet.title}</Heading>
              <Text tone="muted" size="lead">
                {t.fleet.body}
              </Text>
            </SectionHeader>
            <Link href={localizePath("/fleet", locale)} className={buttonStyles({ variant: "secondary" })}>
              {t.fleet.cta}
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

      <CtaBand
        title={dict.pages.home.cta.title}
        body={dict.pages.home.cta.body}
        actions={
          <Link href={localizePath("/book", locale)} className={buttonStyles({ variant: "accent", size: "lg" })}>
            {dict.nav.book}
          </Link>
        }
      />
    </>
  );
}
