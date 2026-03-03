import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontSans.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </div>

          <Toaster position="top-right" richColors />

          {/* Vercel Analytics */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
