/**
 * Ensures Puppeteer can launch Chrome (required for /api/pdf vector export).
 * Runs automatically after pnpm install.
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function canLaunch() {
  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (process.env.SKIP_PUPPETEER_CHROME === "1") {
    console.log("[puppeteer] SKIP_PUPPETEER_CHROME=1 — skipping Chrome check");
    return;
  }

  if (await canLaunch()) {
    console.log("[puppeteer] Chrome is available for PDF export");
    return;
  }

  console.log("[puppeteer] Chrome not found — downloading (one-time, ~150MB)…");
  try {
    execSync("pnpm exec puppeteer browsers install chrome", {
      cwd: root,
      stdio: "inherit",
    });
  } catch (err) {
    console.warn(
      "[puppeteer] Could not install Chrome automatically. PDF export will use browser fallback until you run:"
    );
    console.warn("  pnpm puppeteer:install");
    return;
  }

  if (await canLaunch()) {
    console.log("[puppeteer] Chrome installed successfully");
  } else {
    console.warn("[puppeteer] Install finished but launch still failed — run: pnpm puppeteer:install");
  }
}

main().catch((err) => {
  console.warn("[puppeteer]", err instanceof Error ? err.message : err);
});
