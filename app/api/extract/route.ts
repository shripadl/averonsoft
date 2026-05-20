// IMPORTANT: In-memory only. No files stored, logged, or persisted.

import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/extract";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawText = await extractTextFromFile(buffer, file.name, file.type);

  if (!rawText.trim()) {
    return NextResponse.json(
      {
        rawText: "",
        error:
          "No text could be extracted. For photos, use a clear straight-on image of the CV; PDF or DOCX usually work best.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ rawText });
}
