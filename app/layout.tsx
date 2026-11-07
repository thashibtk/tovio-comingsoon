import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n";
import { getLang } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TOVIO Worker Connect",
    template: "%s · TOVIO",
  },
  description:
    "Find construction workers and labour agents in Kerala, or register your skills and availability.",
  icons: {
    icon: "/tovio.webp",
    apple: "/tovio.webp",
  },
  openGraph: {
    title: "TOVIO Worker Connect",
    description:
      "Find construction workers and labour agents in Kerala, or register your skills and availability.",
    url: "https://tovio.in",
    siteName: "TOVIO",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#292720",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang}>
      <body>
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
