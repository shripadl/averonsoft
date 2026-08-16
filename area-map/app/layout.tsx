import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { brand } from "@areamap/config/brand.config";
import { getAnalyticsConfig } from "@areamap/lib/analytics";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-areamap-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-areamap-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.siteName} — measure area on a map`,
  description:
    "Draw a polygon on an open-source map and get geodesic area and perimeter. No account, no API keys.",
  metadataBase: new URL(brand.baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = getAnalyticsConfig();

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
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
