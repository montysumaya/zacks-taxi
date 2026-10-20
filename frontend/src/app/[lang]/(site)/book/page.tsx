import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/wizard/booking-wizard";
import { Container, Section } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import { getVehicleClasses } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import type { VehicleClass } from "@/types";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.book;
  return pageMetadata({ path: "/book", ...meta });
}

const vehicleClasses: VehicleClass[] = ["economy", "comfort", "business", "van"];

/** Reads `?class=` (Fleet "Book now") at request time, inside a Suspense boundary. */
async function WizardWithParams({ searchParams }: { searchParams: PageProps<"/[lang]/book">["searchParams"] }) {
  const [{ class: requested }, classes] = await Promise.all([searchParams, getVehicleClasses()]);
  return <BookingWizard classes={classes} initialVehicleClass={vehicleClasses.find((c) => c === requested)} />;
}

export default async function BookPage(props: PageProps<"/[lang]/book">) {
  const dict = await getDictionary();
  const t = dict.pages.book.hero;

  return (
    <Section spacing="sm" className="bg-surface-muted">
      <Container className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-overline font-bold text-accent-soft-foreground uppercase">{t.eyebrow}</p>
          <h1 className="text-h2 font-bold">{dict.bookingFlow.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </header>
        <Suspense fallback={<Skeleton className="h-[32rem] rounded-2xl" />}>
          <WizardWithParams searchParams={props.searchParams} />
        </Suspense>
      </Container>
    </Section>
  );
}
