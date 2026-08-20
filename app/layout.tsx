import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { isFullBleedToolPath } from "@/lib/full-bleed-tools";
import { isAreaMapHost } from "@/lib/area-map-host";
import { isHomeDecorHost } from "@/lib/home-decor-host";
import { isSatbaraHost } from "@/lib/satbara-host";
import { isPassportPhotoHost } from "@/lib/passport-photo-host";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Averonsoft Tools - Fast, minimal online utilities",
  description:
    "A small collection of high-quality online tools. No signup required. No data stored. Minimal and focused.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  const host = headerList.get("host");
  const hideSiteChrome =
    isFullBleedToolPath(pathname) ||
    isAreaMapHost(host) ||
    isHomeDecorHost(host) ||
    isSatbaraHost(host) ||
    isPassportPhotoHost(host);

  return (
    <html lang="en" suppressHydrationWarning className={fontSans.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            {hideSiteChrome ? null : <Header />}
            <main className="flex-1">{children}</main>
            {hideSiteChrome ? null : <Footer />}
            {hideSiteChrome ? null : <CookieConsent />}
          </div>

          <Toaster position="top-right" richColors />

          {/* Vercel Analytics */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
