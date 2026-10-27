import Link from "next/link";
import { Info, MessageSquare } from "lucide-react";
import { IconTile } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { VehicleCard } from "@/components/marketing/vehicle-card";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { vehicleClasses } from "@/config/fleet";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.fleet;
  return pageMetadata({ path: "/fleet", ...meta });
}

export default async function FleetPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.fleet;

  return (
    <>
      <PageHero {...t.hero} />
      <Section>
        <Container className="flex flex-col gap-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {vehicleClasses.map((summary) => (
              <VehicleCard key={summary.vehicleClass} summary={summary} dict={dict} locale={locale} detailed />
            ))}
          </div>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            {t.note}
          </p>

          <Card variant="muted" padding="lg" className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <IconTile tone="accent">
              <MessageSquare />
            </IconTile>
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-h4 font-bold">{t.helpTitle}</h2>
              <p className="text-muted-foreground">{t.helpBody}</p>
            </div>
            <Link href={localizePath("/contact", locale)} className={buttonStyles({ variant: "secondary" })}>
              {t.helpCta}
            </Link>
          </Card>
        </Container>
      </Section>
    </>
  );
}
