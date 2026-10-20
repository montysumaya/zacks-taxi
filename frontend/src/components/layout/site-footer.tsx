import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/layout";
import { brand } from "@/config/brand";
import { footerNav, type NavItem } from "@/config/navigation";
import { localizePath, type Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/get-dictionary";
import { ContactDetails } from "./contact-details";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[0.9375rem] text-white/65 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function navLinks(items: NavItem[], dict: Dictionary, locale: Locale) {
  return items.map((item) => ({ label: dict.nav[item.key], href: localizePath(item.href, locale) }));
}

export async function SiteFooter() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const contactPage = dict.pages.contact;

  return (
    <footer className="relative bg-surface-inverse text-surface-inverse-foreground">
      <div className="h-1 bg-linear-to-r from-accent via-amber-300 to-accent" aria-hidden />
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Logo name={dict.meta.siteName} tone="inverse" />
          <p className="max-w-xs text-[0.9375rem] text-white/65">{dict.footer.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
          <FooterColumn title={dict.footer.company} links={navLinks(footerNav.company, dict, locale)} />
          <FooterColumn title={dict.footer.servicesTitle} links={navLinks(footerNav.services, dict, locale)} />
          <FooterColumn
            title={dict.footer.legal}
            links={[
              { label: dict.footer.privacy, href: localizePath("/privacy", locale) },
              { label: dict.footer.terms, href: localizePath("/terms", locale) },
              { label: dict.footer.designSystem, href: localizePath("/design-system", locale) },
            ]}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <h2 className="text-sm font-bold text-white">{dict.footer.support}</h2>
          <ContactDetails
            locale={locale}
            tone="inverse"
            include={["phone", "whatsapp", "email"]}
            labels={{ ...contactPage, placeholder: dict.common.placeholder }}
          />
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {brand.legalName[locale]}. {dict.footer.rights}
          </p>
          <p>{dict.footer.placeholderNotice}</p>
        </Container>
      </div>
    </footer>
  );
}
