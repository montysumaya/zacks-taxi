import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ToastProvider } from "@/components/ui/toast";
import { localeMeta, locales } from "@/i18n/config";
import { getDictionary, getLocale, toClientDictionary } from "@/i18n/get-dictionary";
import { metadataBase } from "@/lib/metadata";
import "../globals.css";

const latin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    metadataBase,
    title: { default: dict.meta.defaultTitle, template: `%s · ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    applicationName: dict.meta.siteName,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0d0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={localeMeta[locale].dir}
      className={`${latin.variable} ${arabic.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale} dict={toClientDictionary(dict)}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
