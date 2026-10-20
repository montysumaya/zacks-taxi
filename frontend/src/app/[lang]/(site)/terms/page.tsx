import { LegalPage } from "@/components/marketing/legal-page";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).legal.terms;
  return pageMetadata({ path: "/terms", ...meta });
}

export default async function TermsPage() {
  const { legal } = await getDictionary();
  return (
    <LegalPage document={legal.terms} notice={legal.notice} updated={legal.updated} contentsLabel={legal.contents} />
  );
}
