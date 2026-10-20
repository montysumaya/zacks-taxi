import Link from "next/link";
import { FaqList } from "@/components/marketing/faq-list";
import { PageHero } from "@/components/marketing/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.faq;
  return pageMetadata({ path: "/faq", ...meta });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.pages.faq;

  // FAQPage structured data for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero {...t.hero}>
        <Link href={localizePath("/contact", locale)} className={buttonStyles({ variant: "accent" })}>
          {t.contactCta}
        </Link>
      </PageHero>
      <Section>
        <Container size="content" className="grid gap-12 lg:grid-cols-[14rem_1fr]">
          <nav aria-label={t.hero.title} className="hidden lg:block">
            <ul className="sticky top-24 flex flex-col gap-1">
              {t.groups.map((group, i) => (
                <li key={group.title}>
                  <a
                    href={`#faq-${i}`}
                    className="block rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-12">
            {t.groups.map((group, i) => (
              <section key={group.title} id={`faq-${i}`} aria-labelledby={`faq-${i}-title`} className="flex scroll-mt-24 flex-col gap-5">
                <h2 id={`faq-${i}-title`} className="text-h3 font-bold">
                  {group.title}
                </h2>
                <FaqList items={group.items} />
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
