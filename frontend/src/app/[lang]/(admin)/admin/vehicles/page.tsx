import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { VehiclesPage } from "@/components/admin/pages/vehicles-page";

export const generateMetadata = () => adminMetadata("vehicles");

export default function Page() {
  return (
    <RequirePermission permission="vehicles.view">
      <VehiclesPage />
    </RequirePermission>
  );
}
