import { CalendarCheck, Info, PlaneLanding, PlaneTakeoff, Ticket } from "lucide-react";
import { BookingWidget } from "@/components/booking/booking-widget";
import { VehicleIcon } from "@/components/booking/vehicle-icon";
import { CheckList, IconTile } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { formatNumber } from "@/lib/format";
import { vehicleClasses } from "@/config/fleet";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.airport;
  return pageMetadata({ path: "/airport-transfers", ...meta });
}

const featureIcons = [PlaneLanding, PlaneTakeoff, CalendarCheck, Ticket];

export default async function AirportTransfersPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.airport;

  return (
    <>
      <PageHero {...t.hero} />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-14">
          <div className="order-2 flex flex-col gap-14 lg:order-1">
            <div className="grid gap-5 sm:grid-cols-2">
              {t.features.map((feature, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <Card key={feature.title} padding="lg" className="flex flex-col gap-3">
                    <IconTile>
                      <Icon />
                    </IconTile>
                    <h2 className="text-h5 font-semibold">{feature.title}</h2>
                    <p className="text-[0.9375rem] text-muted-foreground">{feature.body}</p>
                  </Card>
                );
              })}
            </div>

            <section aria-labelledby="luggage-heading" className="flex flex-col gap-5">
              <h2 id="luggage-heading" className="text-h3 font-bold">
                {t.luggage.title}
              </h2>
              <p className="text-muted-foreground">{t.luggage.body}</p>
              <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
                <table className="w-full min-w-[22rem] text-start text-sm">
                  <thead className="bg-surface-muted text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    <tr>
                      <th scope="col" className="px-5 py-3 text-start">{t.luggage.vehicleColumn}</th>
                      <th scope="col" className="px-5 py-3 text-start">{t.luggage.passengersColumn}</th>
                      <th scope="col" className="px-5 py-3 text-start">{t.luggage.luggageColumn}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {vehicleClasses.map((c) => (
                      <tr key={c.vehicleClass}>
                        <th scope="row" className="px-5 py-3.5 text-start font-semibold text-foreground">
                          <span className="inline-flex items-center gap-2.5">
                            <VehicleIcon vehicleClass={c.vehicleClass} className="size-4 text-subtle-foreground" />
                            {dict.vehicleClass[c.vehicleClass].name}
                          </span>
                        </th>
                        <td className="px-5 py-3.5 tabular-nums">{formatNumber(c.seats, locale)}</td>
                        <td className="px-5 py-3.5 tabular-nums">{formatNumber(c.luggageCapacity, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="flex gap-2.5 rounded-md bg-info-soft p-4 text-sm text-info-soft-foreground">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                {t.luggage.note}
              </p>
            </section>

            <section aria-labelledby="tips-heading" className="flex flex-col gap-5">
              <h2 id="tips-heading" className="text-h3 font-bold">
                {t.tips.title}
              </h2>
              <CheckList items={t.tips.items} />
            </section>
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex flex-col gap-3 lg:sticky lg:top-24">
              <div>
                <h2 className="text-h4 font-bold">{t.formTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.formSubtitle}</p>
              </div>
              <BookingWidget variant="airport" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
