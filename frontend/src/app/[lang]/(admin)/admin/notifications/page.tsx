import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { NotificationsPage } from "@/components/admin/pages/notifications-page";

export const generateMetadata = () => adminMetadata("notifications");

export default function Page() {
  return (
    <RequirePermission permission="notifications.view">
      <NotificationsPage />
    </RequirePermission>
  );
}
