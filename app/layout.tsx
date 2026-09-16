import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOVIO | Coming Soon",
  description: "TOVIO, the smarter digital experience for Kerala's construction world.",
  icons: {
    icon: "/tovio.webp",
    apple: "/tovio.webp",
  },
  openGraph: {
    title: "TOVIO | Coming Soon",
    description: "TOVIO, the smarter digital experience for Kerala's construction world.",
    url: "https://tovio.in",
    siteName: "TOVIO",
    images: [
      {
        url: "/tovio.webp",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOVIO | Coming Soon",
    description: "TOVIO, the smarter digital experience for Kerala's construction world.",
    images: ["/tovio.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#292720",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
