import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { OverviewPage } from "@/components/admin/pages/overview-page";

export const generateMetadata = () => adminMetadata("overview");

export default function Page() {
  return (
    <RequirePermission permission="overview.view">
      <OverviewPage />
    </RequirePermission>
  );
}
