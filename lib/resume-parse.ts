import type { EducationItem, ExperienceItem, ResumeData } from "@/lib/resume";

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w{2,}/i;
const PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}(?:\s*(?:ext|x)\s*\d+)?/i;
const DATE_RANGE_RE =
  /(?:(\w+)\s+)?(\d{4})\s*[-–—to]+\s*(?:(\w+)\s+)?(\d{4}|present|current)/i;
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const DEGREE_RE =
  /\b(bachelor(?:'s)?|master(?:'s)?|ph\.?\s*d\.?|b\.?\s*s\.?|m\.?\s*s\.?|mba|b\.?\s*a\.?|associate(?:'s)?|diploma|certificate)\b/i;

const SECTION_HEADERS: { key: string; re: RegExp }[] = [
  {
    key: "summary",
    re: /^(professional\s+)?summary|profile|about(\s+me)?|objective|career\s+summary$/i,
  },
  {
    key: "experience",
    re: /^(work\s+)?experience|employment(\s+history)?|work\s+history|professional\s+experience$/i,
  },
  {
    key: "education",
    re: /^education|academic(\s+background)?|qualifications|training$/i,
  },
  {
    key: "skills",
    re: /^skills|technical\s+skills|competencies|core\s+competencies|key\s+skills$/i,
  },
];

/** Clean OCR noise before section parsing. */
export function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[|¦]/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function headerKeyForLine(line: string): string | null {
  const cleaned = line.replace(/[:\-–—#*]+$/g, "").trim();
  if (cleaned.length > 48) return null;
  const hit = SECTION_HEADERS.find((h) => h.re.test(cleaned));
  return hit?.key ?? null;
}

function splitSections(text: string): Record<string, string[]> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const sections: Record<string, string[]> = { _header: [] };
  let current = "_header";

  for (const line of lines) {
    const key = headerKeyForLine(line);
    if (key) {
      current = key;
      sections[current] = sections[current] ?? [];
    } else {
      sections[current] = sections[current] ?? [];
      sections[current].push(line);
    }
  }
  return sections;
}

function parseDateRange(line: string): { startDate: string; endDate?: string } | null {
  const m = line.match(DATE_RANGE_RE);
  if (!m) return null;
  const start = m[2] ?? "";
  const endRaw = (m[4] ?? "").toLowerCase();
  const end =
    endRaw === "present" || endRaw === "current" ? "Present" : m[4] ?? undefined;
  return { startDate: start, endDate: end };
}

function parseExperienceBlock(lines: string[]): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;

  for (const line of lines) {
    const dates = parseDateRange(line);
    if (dates && !current) {
      current = { company: "", role: "", ...dates };
      continue;
    }
    if (dates && current) {
      items.push(current);
      current = { company: "", role: "", ...dates };
      continue;
    }
    if (!current) {
      current = { company: line, role: "", startDate: "" };
      continue;
    }
    if (!current.role && line.length < 80) {
      current.role = line;
    } else if (!current.company || current.company === line) {
      current.company = line;
    } else {
      current.description = [current.description, line].filter(Boolean).join("\n");
    }
  }
  if (current) items.push(current);
  return items.filter((e) => e.company || e.role);
}

function parseEducationBlock(lines: string[]): EducationItem[] {
  const items: EducationItem[] = [];

  for (const line of lines) {
    if (!DEGREE_RE.test(line) && !/\b(university|college|institute|school)\b/i.test(line)) {
      continue;
    }
    const dates = parseDateRange(line);
    const years = [...line.matchAll(YEAR_RE)].map((m) => m[0]);
    items.push({
      institution: line.replace(DEGREE_RE, "").replace(YEAR_RE, "").trim() || line,
      degree: line.match(DEGREE_RE)?.[0] ?? line,
      startDate: dates?.startDate ?? years[0] ?? "",
      endDate: dates?.endDate ?? years[years.length - 1] ?? "",
    });
  }
  return items;
}

export function mergeParsedIntoResume(
  current: ResumeData,
  parsed: Partial<ResumeData>
): ResumeData {
  const next: ResumeData = { ...current };

  const scalars: (keyof ResumeData)[] = [
    "fullName",
    "email",
    "phone",
    "location",
    "headline",
    "summary",
  ];
  for (const key of scalars) {
    const v = parsed[key];
    if (typeof v === "string" && v.trim() && !String(next[key] ?? "").trim()) {
      (next as Record<string, unknown>)[key] = v.trim();
    }
  }

  if (!next.skills?.length && parsed.skills?.length) {
    next.skills = parsed.skills;
  }

  if (parsed.experience?.length) {
    const existing = next.experience ?? [];
    for (const exp of parsed.experience) {
      const dup = existing.some(
        (e) =>
          e.company.toLowerCase() === exp.company.toLowerCase() &&
          e.role.toLowerCase() === exp.role.toLowerCase()
      );
      if (!dup && (exp.company || exp.role)) {
        existing.push(exp);
      }
    }
    next.experience = existing;
  }

  if (parsed.education?.length) {
    const existing = next.education ?? [];
    for (const edu of parsed.education) {
      const dup = existing.some((e) =>
        e.degree.toLowerCase().includes(edu.degree.toLowerCase().slice(0, 8))
      );
      if (!dup && edu.degree) existing.push(edu);
    }
    next.education = existing;
  }

  return next;
}

export function countParsedFields(parsed: Partial<ResumeData>): number {
  let n = 0;
  if (parsed.fullName?.trim()) n++;
  if (parsed.email?.trim()) n++;
  if (parsed.phone?.trim()) n++;
  if (parsed.summary?.trim()) n++;
  if (parsed.skills?.length) n++;
  if (parsed.experience?.length) n += parsed.experience.length;
  if (parsed.education?.length) n += parsed.education.length;
  return n;
}

export function parseTextToResume(text: string): Partial<ResumeData> {
  if (!text?.trim()) return {};

  const normalized = normalizeOcrText(text);
  const sections = splitSections(normalized);
  const headerLines = sections._header ?? [];
  const email = normalized.match(EMAIL_RE)?.[0] ?? "";
  const phone = normalized.match(PHONE_RE)?.[0] ?? "";

  let fullName = "";
  for (const line of headerLines.slice(0, 8)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line)) continue;
    if (line.length > 60 || line.length < 3) continue;
    if (/^(cv|resume|curriculum|vitae)$/i.test(line)) continue;
    fullName = line;
    break;
  }
  if (!fullName) {
    const caps = headerLines.find(
      (l) =>
        l.length >= 4 &&
        l.length <= 50 &&
        /^[A-Z][A-Z\s'.-]+$/.test(l) &&
        !EMAIL_RE.test(l)
    );
    if (caps) fullName = caps;
  }

  const summary = (sections.summary ?? []).join("\n").trim();
  const skillLines = sections.skills ?? [];
  const skills = skillLines
    .flatMap((line) => line.split(/[,;|•·]/))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 80);

  const experience = parseExperienceBlock(sections.experience ?? []);
  const education = parseEducationBlock([
    ...(sections.education ?? []),
    ...normalized.split(/\n/).filter((l) => DEGREE_RE.test(l)),
  ]);

  const location =
    headerLines.find(
      (l) =>
        /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(l) ||
        /\b(remote|[A-Z][a-z]+(\s+[A-Z][a-z]+)*,\s*\w{2,})\b/i.test(l)
    ) ?? "";

  return {
    fullName,
    email,
    phone,
    location,
    headline: headerLines.find((l) => l !== fullName && l.length < 80 && !EMAIL_RE.test(l)) ?? "",
    summary,
    skills: skills.length ? skills : undefined,
    experience: experience.length ? experience : undefined,
    education: education.length ? education : undefined,
  };
}

/** Extract credential mentions from certificate OCR text */
export function extractCredentialsFromText(text: string): {
  degrees: string[];
  years: string[];
  institutions: string[];
  dateRanges: { startDate: string; endDate?: string }[];
} {
  const degrees: string[] = [];
  const institutions: string[] = [];
  const dateRanges: { startDate: string; endDate?: string }[] = [];

  for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const deg = line.match(DEGREE_RE);
    if (deg) degrees.push(deg[0]);
    if (/\b(university|college|institute|academy)\b/i.test(line)) {
      institutions.push(line);
    }
    const dr = parseDateRange(line);
    if (dr) dateRanges.push(dr);
  }

  const years = [...text.matchAll(YEAR_RE)].map((m) => m[0]);
  return { degrees, years, institutions, dateRanges };
}
