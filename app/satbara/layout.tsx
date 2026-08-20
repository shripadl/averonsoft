import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Syne } from "next/font/google";
import { brand } from "@satbara/config/brand.config";
import "./satbara.css";

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
  title: `${brand.siteName} — Maharashtra 7/12 helper`,
  description:
    "Locate district, taluka, and village for Maharashtra 7/12 searches. Demo index only — live extracts on MahaBhulekh.",
};

export default function SatbaraLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${manrope.variable} ${syne.variable}`}>{children}</div>
  );
}
