import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Domain-agnostic routing: set NEXT_PUBLIC_BASE_PATH=/satbara
 * when hosted under a subpath, or leave empty for a root domain / CNAME deploy.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  turbopack: {
    root: rootDir,
  },
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
};

export default nextConfig;
