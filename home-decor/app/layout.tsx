import type { Metadata } from "next";
import { IBM_Plex_Sans, Sora } from "next/font/google";
import { brand } from "@homedecor/config/brand.config";
import { getAnalyticsConfig } from "@homedecor/lib/analytics";
import Script from "next/script";
import "./globals.css";
import "../styles/homedecor-ui.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-homedecor-body",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-homedecor-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.siteName} — plan rooms to real dimensions`,
  description:
    "Enter room sizes or calibrate a builder floor plan, then place furniture to scale in 3D.",
  metadataBase: new URL(brand.baseUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = getAnalyticsConfig();

  return (
    <html lang="en" className={`${plex.variable} ${sora.variable}`}>
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
