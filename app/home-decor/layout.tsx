import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Sora } from "next/font/google";
import { brand } from "@homedecor/config/brand.config";
import "./homedecor.css";

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
};

export default function HomeDecorLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${plex.variable} ${sora.variable}`}>{children}</div>
  );
}
