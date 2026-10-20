import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { ReportsPage } from "@/components/admin/pages/reports-page";

export const generateMetadata = () => adminMetadata("reports");

export default function Page() {
  return (
    <RequirePermission permission="reports.view">
      <ReportsPage />
    </RequirePermission>
  );
}
