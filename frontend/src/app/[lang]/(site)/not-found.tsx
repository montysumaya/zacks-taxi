import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { EmptyState } from "@/components/ui/states";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <Container size="prose" className="py-10">
      <EmptyState
        icon={<MapPinOff aria-hidden />}
        title={dict.states.notFoundTitle}
        description={dict.states.notFoundBody}
        actions={
          <>
            <Link href={localizePath("/", locale)} className={buttonStyles()}>
              {dict.common.backHome}
            </Link>
            <Link href={localizePath("/contact", locale)} className={buttonStyles({ variant: "secondary" })}>
              {dict.nav.contact}
            </Link>
          </>
        }
      />
    </Container>
  );
}
