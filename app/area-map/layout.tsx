import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { brand } from "@areamap/config/brand.config";
import "./areamap.css";

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
};

export default function AreaMapLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${outfit.variable} ${fraunces.variable}`}>{children}</div>
  );
}
