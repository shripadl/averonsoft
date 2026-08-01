import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import { brand } from "@payframe/config/brand.config";
import { getAnalyticsConfig } from "@payframe/lib/analytics";
import Script from "next/script";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.siteName} — UK take-home pay calculator`,
  description:
    "Estimate UK take-home pay, income tax by band, National Insurance, pension and student loan repayments. Rates from HMRC.",
  metadataBase: new URL(brand.baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = getAnalyticsConfig();

  return (
    <html lang="en-GB" className={`${sora.variable} ${fraunces.variable}`}>
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
