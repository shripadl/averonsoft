import { NextResponse } from "next/server";
import { checkResumeAiAccess } from "@/lib/resume-ai-gate";
import { aiPolishText } from "@/lib/resume-ai";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: Request) {
  const gate = await checkResumeAiAccess();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  let body: {
    kind?: string;
    text?: string;
    role?: string;
    company?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const kind = body.kind === "experience" ? "experience" : "summary";
  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const result = await aiPolishText(kind, text, {
    role: typeof body.role === "string" ? body.role : undefined,
    company: typeof body.company === "string" ? body.company : undefined,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status }
    );
  }
  return NextResponse.json({ text: result.text });
}
