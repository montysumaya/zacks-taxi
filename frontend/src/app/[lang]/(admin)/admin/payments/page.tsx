import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { PaymentsPage } from "@/components/admin/pages/payments-page";

export const generateMetadata = () => adminMetadata("payments");

export default function Page() {
  return (
    <RequirePermission permission="payments.view">
      <PaymentsPage />
    </RequirePermission>
  );
}
