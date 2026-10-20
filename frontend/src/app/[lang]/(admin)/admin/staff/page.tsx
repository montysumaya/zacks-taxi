import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { StaffPage } from "@/components/admin/pages/staff-page";

export const generateMetadata = () => adminMetadata("staff");

export default function Page() {
  return (
    <RequirePermission permission="staff.manage">
      <StaffPage />
    </RequirePermission>
  );
}
