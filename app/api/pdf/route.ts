import { NextResponse } from "next/server";
import { renderHtmlToPdfBuffer } from "@/lib/render-resume-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

function chromeHint(): string {
  if (process.env.VERCEL === "1") {
    return "PDF export could not start on the server. Redeploy after the latest build, or try again in a minute.";
  }
  return "Chromium is not installed for PDF export. From the project folder run: pnpm puppeteer:install — then restart the dev server.";
}

export async function POST(req: Request) {
  let body: { html?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { html } = body;

  if (!html || typeof html !== "string" || html.trim().length < 10) {
    return NextResponse.json(
      { error: "Missing or empty HTML content" },
      { status: 400 }
    );
  }

  const result = await renderHtmlToPdfBuffer(html);

  if (!result.ok) {
    console.error("[api/pdf]", result.message);
    const isChrome = result.code === "chrome_missing";
    return NextResponse.json(
      {
        error: isChrome ? chromeHint() : "PDF generation failed",
        detail: result.message,
        code: result.code,
      },
      { status: 503 }
    );
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    },
  });
}
