import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { BookingsPage } from "@/components/admin/pages/bookings-page";

export const generateMetadata = () => adminMetadata("bookings");

export default function Page() {
  return (
    <RequirePermission permission="bookings.view">
      <BookingsPage />
    </RequirePermission>
  );
}
