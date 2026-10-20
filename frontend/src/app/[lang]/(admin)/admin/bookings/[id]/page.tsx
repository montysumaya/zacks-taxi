import { Suspense } from "react";
import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { BookingDetailPage } from "@/components/admin/pages/booking-detail-page";
import { Skeleton } from "@/components/ui/skeleton";

export const generateMetadata = () => adminMetadata("bookings");

async function Detail({ params }: { params: PageProps<"/[lang]/admin/bookings/[id]">["params"] }) {
  const { id } = await params;
  return <BookingDetailPage id={decodeURIComponent(id)} />;
}

export default function Page(props: PageProps<"/[lang]/admin/bookings/[id]">) {
  return (
    <RequirePermission permission="bookings.view">
      <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
        <Detail params={props.params} />
      </Suspense>
    </RequirePermission>
  );
}
