/**
 * Server-side AI assist for the resume builder.
 * Parsing (raw text → ResumeData) and polishing individual sections.
 */
import type { ResumeData } from "@/lib/resume";
import { callDeepSeek } from "@/lib/deepseek-client";

const PARSE_SYSTEM = `You convert raw resume text into a structured JSON object.

Return STRICT JSON (no markdown, no commentary) matching this schema:
{
  "fullName": string,
  "headline": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "skills": string[],
  "experience": [{ "company": string, "role": string, "startDate": string, "endDate": string, "description": string }],
  "education": [{ "institution": string, "degree": string, "startDate": string, "endDate": string }],
  "links": [{ "label": string, "url": string }]
}

Rules:
- Use empty string "" or empty array [] when a field is missing. Never use null.
- Preserve dates as written by the user (e.g. "Jan 2022", "2020", "Present").
- "headline" is the candidate's job title or professional headline, NOT the name.
- "skills" must be a flat list of short skill strings (1-5 words each), no markdown bullets.
- "experience.description" should be concise and ATS-friendly (single paragraph or short bullet list joined with newlines).
- Do not invent data. If unsure, leave the field empty.`;

const POLISH_SYSTEM_SUMMARY = `You rewrite a professional resume summary so it is concise, confident, and ATS-friendly.

Rules:
- 3-4 sentences, max 80 words.
- Use first person implied (no "I", no pronouns).
- Highlight role, years of experience, key skills, and impact.
- Plain prose. No markdown, no bullet symbols, no headings, no quotes around the result.
- Return ONLY the rewritten summary text.`;

const POLISH_SYSTEM_EXPERIENCE = `You rewrite a single resume experience bullet/description so it is concise and ATS-friendly.

Rules:
- 2-5 short bullet-style sentences, each starting with a strong action verb (Led, Built, Delivered, Reduced, Improved, etc.).
- Quantify impact when the input mentions numbers, percentages, scale, or money.
- Preserve technologies, employers, and figures verbatim.
- Output bullets separated by newlines, NO markdown bullet symbols, NO numbering, NO quotes.
- Return ONLY the rewritten bullets.`;

type RawParsed = Partial<{
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: unknown;
  experience: unknown;
  education: unknown;
  links: unknown;
}>;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
}

function normaliseParsed(raw: RawParsed): Partial<ResumeData> {
  const out: Partial<ResumeData> = {};
  const fullName = asString(raw.fullName);
  const email = asString(raw.email);
  const phone = asString(raw.phone);
  if (fullName) out.fullName = fullName;
  if (email) out.email = email;
  if (phone) out.phone = phone;
  const location = asString(raw.location);
  const headline = asString(raw.headline);
  const summary = asString(raw.summary);
  if (location) out.location = location;
  if (headline) out.headline = headline;
  if (summary) out.summary = summary;

  const skills = asStringArray(raw.skills);
  if (skills.length) out.skills = skills;

  if (Array.isArray(raw.experience)) {
    const items = raw.experience
      .map((e) => {
        if (!e || typeof e !== "object") return null;
        const o = e as Record<string, unknown>;
        const company = asString(o.company);
        const role = asString(o.role);
        if (!company && !role) return null;
        return {
          company,
          role,
          startDate: asString(o.startDate),
          endDate: asString(o.endDate) || undefined,
          description: asString(o.description) || undefined,
        };
      })
      .filter(Boolean) as ResumeData["experience"];
    if (items?.length) out.experience = items;
  }

  if (Array.isArray(raw.education)) {
    const items = raw.education
      .map((e) => {
        if (!e || typeof e !== "object") return null;
        const o = e as Record<string, unknown>;
        const institution = asString(o.institution);
        const degree = asString(o.degree);
        if (!institution && !degree) return null;
        return {
          institution,
          degree,
          startDate: asString(o.startDate),
          endDate: asString(o.endDate) || undefined,
        };
      })
      .filter(Boolean) as ResumeData["education"];
    if (items?.length) out.education = items;
  }

  if (Array.isArray(raw.links)) {
    const items = raw.links
      .map((e) => {
        if (!e || typeof e !== "object") return null;
        const o = e as Record<string, unknown>;
        const label = asString(o.label);
        const url = asString(o.url);
        if (!label || !url) return null;
        return { label, url };
      })
      .filter(Boolean) as ResumeData["links"];
    if (items?.length) out.links = items;
  }

  return out;
}

export type AiParseResult =
  | { ok: true; data: Partial<ResumeData>; fields: number }
  | { ok: false; status: number; message: string };

export async function aiParseResumeText(text: string): Promise<AiParseResult> {
  const trimmed = text.trim();
  if (trimmed.length < 20) {
    return {
      ok: false,
      status: 400,
      message: "Not enough text to analyse.",
    };
  }

  const truncated =
    trimmed.length > 16000 ? trimmed.slice(0, 16000) : trimmed;

  const result = await callDeepSeek({
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 2000,
    messages: [
      { role: "system", content: PARSE_SYSTEM },
      {
        role: "user",
        content: `Convert this resume text to JSON.\n\n----\n${truncated}\n----`,
      },
    ],
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  let parsed: RawParsed;
  try {
    parsed = JSON.parse(result.content) as RawParsed;
  } catch {
    const match = result.content.match(/\{[\s\S]*\}/);
    if (!match) {
      return {
        ok: false,
        status: 502,
        message: "Model did not return valid JSON.",
      };
    }
    try {
      parsed = JSON.parse(match[0]) as RawParsed;
    } catch {
      return {
        ok: false,
        status: 502,
        message: "Model did not return valid JSON.",
      };
    }
  }

  const data = normaliseParsed(parsed);
  const fields = countParsedFields(data);
  return { ok: true, data, fields };
}

export function countParsedFields(parsed: Partial<ResumeData>): number {
  let n = 0;
  if (parsed.fullName?.trim()) n++;
  if (parsed.email?.trim()) n++;
  if (parsed.phone?.trim()) n++;
  if (parsed.location?.trim()) n++;
  if (parsed.headline?.trim()) n++;
  if (parsed.summary?.trim()) n++;
  if (parsed.skills?.length) n++;
  if (parsed.experience?.length) n += parsed.experience.length;
  if (parsed.education?.length) n += parsed.education.length;
  if (parsed.links?.length) n++;
  return n;
}

export type PolishKind = "summary" | "experience";

export type AiPolishResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string };

export async function aiPolishText(
  kind: PolishKind,
  text: string,
  context?: { role?: string; company?: string }
): Promise<AiPolishResult> {
  const trimmed = text.trim();
  if (trimmed.length < 5) {
    return {
      ok: false,
      status: 400,
      message: "Add a sentence or two first, then click Polish.",
    };
  }

  const system =
    kind === "summary" ? POLISH_SYSTEM_SUMMARY : POLISH_SYSTEM_EXPERIENCE;

  const userParts: string[] = [];
  if (kind === "experience" && (context?.role || context?.company)) {
    userParts.push(
      `Role: ${context?.role ?? "(unspecified)"}\nCompany: ${context?.company ?? "(unspecified)"}`
    );
  }
  userParts.push("Original text:\n" + trimmed);

  const result = await callDeepSeek({
    temperature: 0.4,
    maxTokens: 600,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userParts.join("\n\n") },
    ],
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  const cleaned = result.content
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/^```[\w]*\n?|```$/g, "")
    .trim();

  if (!cleaned) {
    return { ok: false, status: 502, message: "Model returned empty text." };
  }
  return { ok: true, text: cleaned };
}
