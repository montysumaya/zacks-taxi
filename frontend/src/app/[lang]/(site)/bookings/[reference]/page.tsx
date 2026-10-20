import { Suspense } from "react";
import { BookingStatusView } from "@/components/booking/status/booking-status-view";
import { Container, Section } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const dict = await getDictionary();
  return pageMetadata({ path: "/bookings", title: dict.bookingStatus.title, description: dict.bookingStatus.title, noIndex: true });
}

async function StatusFromParams({ params }: { params: PageProps<"/[lang]/bookings/[reference]">["params"] }) {
  const { reference } = await params;
  return <BookingStatusView reference={decodeURIComponent(reference)} />;
}

export default async function BookingStatusPage(props: PageProps<"/[lang]/bookings/[reference]">) {
  const dict = await getDictionary();
  return (
    <Section spacing="sm" className="bg-surface-muted">
      <Container className="flex flex-col gap-6">
        <h1 className="text-h2 font-bold">{dict.bookingStatus.title}</h1>
        <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
          <StatusFromParams params={props.params} />
        </Suspense>
      </Container>
    </Section>
  );
}
