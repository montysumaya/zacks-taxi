"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { ErrorState } from "@/components/ui/states";
import { localizePath } from "@/i18n/config";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale, dict } = useI18n();
  return (
    <Container size="prose" className="py-10">
      <ErrorState
        title={dict.states.errorTitle}
        description={dict.states.errorBody}
        actions={
          <>
            <Button onClick={reset}>{dict.common.retry}</Button>
            <Link href={localizePath("/", locale)} className={buttonStyles({ variant: "secondary" })}>
              {dict.common.backHome}
            </Link>
          </>
        }
      />
    </Container>
  );
}
