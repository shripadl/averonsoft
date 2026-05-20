import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isResumeTemplateId } from "@/lib/resume-templates";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name");
  if (!name || !isResumeTemplateId(name)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "app",
    "resume-builder",
    "templates",
    `${name}.html`
  );

  try {
    const html = await readFile(filePath, "utf-8");
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
}
