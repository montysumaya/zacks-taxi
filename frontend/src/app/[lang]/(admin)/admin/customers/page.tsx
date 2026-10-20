import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { CustomersPage } from "@/components/admin/pages/customers-page";

export const generateMetadata = () => adminMetadata("customers");

export default function Page() {
  return (
    <RequirePermission permission="customers.view">
      <CustomersPage />
    </RequirePermission>
  );
}
