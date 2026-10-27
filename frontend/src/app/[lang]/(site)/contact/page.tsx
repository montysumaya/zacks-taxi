import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactDetails } from "@/components/layout/contact-details";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.contact;
  return pageMetadata({ path: "/contact", ...meta });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.contact;

  return (
    <>
      <PageHero {...t.hero} />
      <Section>
        <Container className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <Card padding="lg">
            <ContactForm />
          </Card>

          <div className="flex flex-col gap-6">
            <Card padding="lg" className="flex flex-col gap-5">
              <h2 className="text-h4 font-bold">{t.channelsTitle}</h2>
              <ContactDetails locale={locale} labels={{ ...t, placeholder: dict.common.placeholder }} />
            </Card>

            <section aria-labelledby="map-heading" className="flex flex-col gap-3">
              <h2 id="map-heading" className="text-h5 font-bold">
                {t.mapTitle}
              </h2>
              <MapPlaceholder label={t.mapPlaceholder} />
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}

/** Stylised map tile. Replace with a real map embed once the address is confirmed. */
function MapPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card border border-border bg-brand-50">
      <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <rect width="400" height="300" fill="var(--palette-brand-50)" />
        <path d="M0 210 C 80 190 120 230 200 200 S 330 140 400 160 V300 H0Z" fill="var(--palette-brand-100)" />
        <g stroke="white" strokeWidth="10" fill="none" strokeLinecap="round">
          <path d="M-10 90 L 410 130" />
          <path d="M150 -10 L 120 310" />
          <path d="M290 -10 C 260 120 330 200 300 310" />
        </g>
        <g stroke="var(--palette-brand-200)" strokeWidth="2" fill="none">
          <path d="M-10 40 L 410 70" />
          <path d="M60 -10 L 40 310" />
          <path d="M-10 250 L 410 240" />
        </g>
      </svg>
      <div className="relative flex max-w-[16rem] flex-col items-center gap-3 rounded-lg bg-surface/90 p-4 text-center shadow-md backdrop-blur">
        <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
          <MapPin aria-hidden className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
