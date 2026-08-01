import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Domain-agnostic routing: set NEXT_PUBLIC_BASE_PATH=/uk-tax-calculator
 * when hosted under a subpath, or leave empty for a root domain deploy.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Keep tooling scoped to this app when nested inside another Next project.
  turbopack: {
    root: rootDir,
  },
  // Enable static export when STATIC_EXPORT=1 (e.g. Netlify/static hosts).
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
};

export default nextConfig;
