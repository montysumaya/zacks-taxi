import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { SettingsPage } from "@/components/admin/pages/settings-page";

export const generateMetadata = () => adminMetadata("settings");

export default function Page() {
  return (
    <RequirePermission permission="settings.manage">
      <SettingsPage />
    </RequirePermission>
  );
}
