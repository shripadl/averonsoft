import { prepareResumePdfHtml } from "@/lib/prepare-resume-pdf-html";
import { launchPdfBrowser } from "@/lib/puppeteer-launch";

export type RenderPdfResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; code: "chrome_missing" | "failed"; message: string };

/**
 * Vector PDF via headless Chrome (Puppeteer).
 * Vercel: @sparticuz/chromium. Local: Chrome from `pnpm puppeteer:install`.
 */
export async function renderHtmlToPdfBuffer(html: string): Promise<RenderPdfResult> {
  const prepared = prepareResumePdfHtml(html);

  let browser: Awaited<ReturnType<typeof launchPdfBrowser>> | undefined;
  try {
    browser = await launchPdfBrowser();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Browser launch failed";
    const chromeMissing =
      /could not find chrome/i.test(message) ||
      /executable doesn't exist/i.test(message) ||
      /browser was not found/i.test(message) ||
      /chrome not found/i.test(message);
    return {
      ok: false,
      code: chromeMissing ? "chrome_missing" : "failed",
      message,
    };
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 840, height: 1188, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.setContent(prepared, { waitUntil: "load", timeout: 45000 });
    try {
      await page.evaluate(async () => {
        await document.fonts?.ready;
      });
    } catch {
      /* ignore */
    }
    await page.evaluate(() => {
      document.body.classList.remove("resume-pdf-debug");
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    if (!pdf?.length) {
      return { ok: false, code: "failed", message: "PDF generation returned empty output" };
    }

    return { ok: true, buffer: Buffer.from(pdf) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    return { ok: false, code: "failed", message };
  } finally {
    await browser.close();
  }
}
