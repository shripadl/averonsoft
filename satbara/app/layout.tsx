import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { brand } from "@satbara/config/brand.config";
import { getAnalyticsConfig } from "@satbara/lib/analytics";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-satbara-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-satbara-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.siteName} — Maharashtra 7/12 search`,
  description:
    "Search Maharashtra 7/12 land records by surname, district, taluka, or village/post.",
  metadataBase: new URL(brand.baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = getAnalyticsConfig();

  return (
    <html lang="en" className={`${manrope.variable} ${syne.variable}`}>
      <body className="antialiased">
        {children}
        {analytics.plausibleDomain ? (
          <Script
            defer
            data-domain={analytics.plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        {analytics.ga4Id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.ga4Id}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
