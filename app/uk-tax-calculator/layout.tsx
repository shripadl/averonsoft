import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Sora } from "next/font/google";
import { brand } from "@payframe/config/brand.config";
import "./payframe.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-payframe-body",
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
};

export default function UkTaxCalculatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`payframe-root ${sora.variable} ${fraunces.variable}`}>
      {children}
    </div>
  );
}
