import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { brand } from "@passphoto/config/brand.config";
import "./passphoto.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-passphoto-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-passphoto-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.siteName} — UK passport photo formatter`,
  description:
    "Crop and size a UK passport portrait in your browser. Photos stay on your device.",
};

export default function PassportPhotoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sourceSans.variable} ${fraunces.variable}`}>{children}</div>
  );
}
