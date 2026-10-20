import { adminMetadata } from "@/components/admin/metadata";
import { RequirePermission } from "@/components/admin/page-parts";
import { PricingPage } from "@/components/admin/pages/pricing-page";

export const generateMetadata = () => adminMetadata("pricing");

export default function Page() {
  return (
    <RequirePermission permission="pricing.view">
      <PricingPage />
    </RequirePermission>
  );
}
