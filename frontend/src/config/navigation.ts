import type { ClientDictionary } from "@/i18n/dictionaries/en";

type NavKey = keyof ClientDictionary["nav"];

export interface NavItem {
  key: NavKey;
  /** App-relative path without locale. */
  href: string;
}

export const mainNav: NavItem[] = [
  { key: "services", href: "/services" },
  { key: "fleet", href: "/fleet" },
  { key: "airport", href: "/airport-transfers" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

export const footerNav = {
  company: [
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
    { key: "faq", href: "/faq" },
  ],
  services: [
    { key: "services", href: "/services" },
    { key: "fleet", href: "/fleet" },
    { key: "airport", href: "/airport-transfers" },
    { key: "book", href: "/book" },
  ],
} satisfies Record<string, NavItem[]>;
