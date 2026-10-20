import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { DispatchPage } from "@/components/admin/pages/dispatch-page";

export const generateMetadata = () => adminMetadata("dispatch");

export default function Page() {
  return (
    <RequirePermission permission="dispatch.manage">
      <DispatchPage />
    </RequirePermission>
  );
}
