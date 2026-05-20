import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "tesseract.js",
    "mammoth",
    "@prisma/client",
  ],
  async headers() {
    return [
      {
        source: "/tools/regex-explainer/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
