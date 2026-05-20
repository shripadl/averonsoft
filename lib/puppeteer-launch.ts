import type { Browser } from "puppeteer-core";

const LOCAL_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

/** Vercel / AWS Lambda — bundled Chromium via @sparticuz/chromium */
function isServerlessDeploy(): boolean {
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.VERCEL_ENV)
  );
}

export async function launchPdfBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");

  if (isServerlessDeploy()) {
    const chromium = await import("@sparticuz/chromium");
    chromium.default.setGraphicsMode = false;

    const executablePath = await chromium.default.executablePath();

    return puppeteer.default.launch({
      args: chromium.default.args,
      executablePath,
      headless: true,
    });
  }

  let executablePath: string | undefined;
  try {
    const full = await import("puppeteer");
    executablePath = full.default.executablePath();
  } catch {
    try {
      const chromium = await import("@sparticuz/chromium");
      executablePath = await chromium.default.executablePath();
    } catch {
      executablePath = undefined;
    }
  }

  if (!executablePath) {
    throw new Error(
      "Chrome not found. Run: pnpm puppeteer:install — then restart the dev server."
    );
  }

  return puppeteer.default.launch({
    headless: true,
    executablePath,
    args: LOCAL_ARGS,
  });
}
