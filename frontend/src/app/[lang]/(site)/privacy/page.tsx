import { LegalPage } from "@/components/marketing/legal-page";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).legal.privacy;
  return pageMetadata({ path: "/privacy", ...meta });
}

export default async function PrivacyPage() {
  const { legal } = await getDictionary();
  return (
    <LegalPage document={legal.privacy} notice={legal.notice} updated={legal.updated} contentsLabel={legal.contents} />
  );
}
