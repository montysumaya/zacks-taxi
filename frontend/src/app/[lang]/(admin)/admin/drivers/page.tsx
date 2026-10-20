import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { DriversPage } from "@/components/admin/pages/drivers-page";

export const generateMetadata = () => adminMetadata("drivers");

export default function Page() {
  return (
    <RequirePermission permission="drivers.view">
      <DriversPage />
    </RequirePermission>
  );
}
