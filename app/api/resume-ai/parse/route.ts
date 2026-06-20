import { NextResponse } from "next/server";
import { checkResumeAiAccess } from "@/lib/resume-ai-gate";
import { aiParseResumeText } from "@/lib/resume-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const gate = await checkResumeAiAccess();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const result = await aiParseResumeText(text);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status }
    );
  }
  return NextResponse.json({ data: result.data, fields: result.fields });
}
