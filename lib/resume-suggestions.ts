import { nanoid } from "nanoid";
import type { ResumePatch } from "@/lib/resume-patch";
import type { EducationItem, ResumeData } from "@/lib/resume";
import {
  extractCredentialsFromText,
  parseTextToResume,
} from "@/lib/resume-parse";

export type SuggestionCategory =
  | "improvement"
  | "amendment"
  | "certificate-gap";

export type Suggestion = {
  id: string;
  category: SuggestionCategory;
  title: string;
  detail: string;
  patch?: ResumePatch;
};

function isEmpty(value: string | undefined): boolean {
  return !value?.trim();
}

/** Quality checks on current resume data */
export function generateImprovements(data: ResumeData): Suggestion[] {
  const out: Suggestion[] = [];

  if (isEmpty(data.email)) {
    out.push({
      id: nanoid(),
      category: "improvement",
      title: "Add email address",
      detail: "Recruiters need a contact email on your CV.",
    });
  }
  if (isEmpty(data.phone)) {
    out.push({
      id: nanoid(),
      category: "improvement",
      title: "Add phone number",
      detail: "A phone number makes it easier for employers to reach you.",
    });
  }
  if (isEmpty(data.summary) || (data.summary?.length ?? 0) < 40) {
    out.push({
      id: nanoid(),
      category: "improvement",
      title: "Expand professional summary",
      detail:
        "Aim for 2–4 sentences highlighting your strengths and target role.",
    });
  }
  if (!data.skills?.length) {
    out.push({
      id: nanoid(),
      category: "improvement",
      title: "List key skills",
      detail: "Add 5–10 relevant skills separated by commas.",
    });
  }
  for (const [i, exp] of (data.experience ?? []).entries()) {
    if (isEmpty(exp.startDate)) {
      out.push({
        id: nanoid(),
        category: "improvement",
        title: `Add start date for ${exp.role || exp.company || "experience"}`,
        detail: "Employers expect date ranges for each role.",
      });
    }
    if (isEmpty(exp.endDate) && !isEmpty(exp.startDate)) {
      out.push({
        id: nanoid(),
        category: "improvement",
        title: `Add end date for ${exp.role || exp.company || "experience"}`,
        detail: 'Use an end year or "Present" if you still hold this role.',
      });
    }
  }
  for (const [i, edu] of (data.education ?? []).entries()) {
    if (isEmpty(edu.endDate)) {
      out.push({
        id: nanoid(),
        category: "improvement",
        title: `Add completion date for ${edu.degree || "degree"}`,
        detail: "Include graduation year or expected completion date.",
      });
    }
    if (isEmpty(edu.startDate) && !isEmpty(edu.endDate)) {
      out.push({
        id: nanoid(),
        category: "improvement",
        title: `Add start date for ${edu.degree || "education"}`,
        detail: "Add enrollment or start year alongside completion date.",
      });
    }
  }

  return out;
}

/** Proposed field fills from uploaded resume text (requires approval) */
export function generateUploadAmendments(
  current: ResumeData,
  uploadedText: string
): Suggestion[] {
  const parsed = parseTextToResume(uploadedText);
  const out: Suggestion[] = [];

  const scalarFields: (keyof ResumeData)[] = [
    "fullName",
    "email",
    "phone",
    "location",
    "headline",
    "summary",
  ];

  for (const field of scalarFields) {
    const nextVal = parsed[field];
    if (typeof nextVal !== "string" || isEmpty(nextVal)) continue;
    const curVal = current[field];
    if (typeof curVal === "string" && !isEmpty(curVal) && curVal !== nextVal) {
      out.push({
        id: nanoid(),
        category: "amendment",
        title: `Update ${field}`,
        detail: `Uploaded resume has "${nextVal}" (current: "${curVal}").`,
        patch: { op: "set", path: field, value: nextVal },
      });
    } else if (isEmpty(curVal as string)) {
      out.push({
        id: nanoid(),
        category: "amendment",
        title: `Fill in ${field}`,
        detail: `Detected from upload: "${nextVal}"`,
        patch: { op: "set", path: field, value: nextVal },
      });
    }
  }

  if (parsed.skills?.length && !(current.skills?.length ?? 0)) {
    out.push({
      id: nanoid(),
      category: "amendment",
      title: "Import skills",
      detail: `${parsed.skills.length} skills detected from uploaded resume.`,
      patch: { op: "set", path: "skills", value: parsed.skills },
    });
  }

  for (const exp of parsed.experience ?? []) {
    const exists = (current.experience ?? []).some(
      (e) =>
        e.company.toLowerCase() === exp.company.toLowerCase() &&
        e.role.toLowerCase() === exp.role.toLowerCase()
    );
    if (!exists && (exp.company || exp.role)) {
      out.push({
        id: nanoid(),
        category: "amendment",
        title: `Add experience: ${exp.role || exp.company}`,
        detail: [exp.company, exp.role, exp.startDate, exp.endDate]
          .filter(Boolean)
          .join(" · "),
        patch: { op: "appendExperience", value: exp },
      });
    }
  }

  for (const edu of parsed.education ?? []) {
    const idx = (current.education ?? []).findIndex((e) =>
      e.degree.toLowerCase().includes(edu.degree.toLowerCase().slice(0, 8))
    );
    if (idx === -1 && edu.degree) {
      out.push({
        id: nanoid(),
        category: "amendment",
        title: `Add education: ${edu.degree}`,
        detail: [edu.institution, edu.startDate, edu.endDate]
          .filter(Boolean)
          .join(" · "),
        patch: { op: "appendEducation", value: edu },
      });
    } else if (idx >= 0) {
      const existing = current.education![idx];
      if (isEmpty(existing.endDate) && !isEmpty(edu.endDate)) {
        out.push({
          id: nanoid(),
          category: "amendment",
          title: `Set completion date for ${existing.degree || edu.degree}`,
          detail: `Uploaded resume shows completion: ${edu.endDate}`,
          patch: {
            op: "setEducation",
            index: idx,
            value: { ...existing, endDate: edu.endDate },
          },
        });
      }
      if (isEmpty(existing.startDate) && !isEmpty(edu.startDate)) {
        out.push({
          id: nanoid(),
          category: "amendment",
          title: `Set start date for ${existing.degree || edu.degree}`,
          detail: `Uploaded resume shows start: ${edu.startDate}`,
          patch: {
            op: "setEducation",
            index: idx,
            value: { ...existing, startDate: edu.startDate },
          },
        });
      }
    }
  }

  if (!out.length && uploadedText.trim().length > 50) {
    out.push({
      id: nanoid(),
      category: "improvement",
      title: "Review parsed content",
      detail:
        "Text was extracted. Approve individual field amendments above, or edit the form manually.",
    });
  }

  return out;
}

/** Compare resume + certificates for missing dates and credentials */
export function generateCertificateGaps(
  data: ResumeData,
  resumeText: string,
  certificateTexts: string[]
): Suggestion[] {
  if (!certificateTexts.length) return [];

  const out: Suggestion[] = [];
  const combinedCerts = certificateTexts.join("\n\n");
  const creds = extractCredentialsFromText(combinedCerts);
  const parsedResume = parseTextToResume(resumeText || "");

  for (const [i, edu] of (data.education ?? []).entries()) {
    if (isEmpty(edu.endDate)) {
      const yearFromCert = creds.years[creds.years.length - 1];
      const range = creds.dateRanges[creds.dateRanges.length - 1];
      const proposed = range?.endDate ?? yearFromCert;
      if (proposed) {
        out.push({
          id: nanoid(),
          category: "certificate-gap",
          title: `Add completion date for ${edu.degree || "degree"}`,
          detail: `Certificate mentions year/range ${proposed}; your CV is missing an end date.`,
          patch: {
            op: "setEducation",
            index: i,
            value: { ...edu, endDate: proposed },
          },
        });
      } else {
        out.push({
          id: nanoid(),
          category: "certificate-gap",
          title: `Degree missing completion date`,
          detail: `"${edu.degree}" is on your CV but has no graduation/completion year. Certificates often include this—add it for credibility.`,
        });
      }
    }
    if (isEmpty(edu.startDate) && creds.dateRanges[0]?.startDate) {
      out.push({
        id: nanoid(),
        category: "certificate-gap",
        title: `Add start date for ${edu.degree || "degree"}`,
        detail: `Certificate suggests start year ${creds.dateRanges[0].startDate}.`,
        patch: {
          op: "setEducation",
          index: i,
          value: { ...edu, startDate: creds.dateRanges[0].startDate },
        },
      });
    }
  }

  for (const deg of creds.degrees) {
    const onResume = (data.education ?? []).some((e) =>
      e.degree.toLowerCase().includes(deg.toLowerCase().slice(0, 6))
    );
    const inParsed = (parsedResume.education ?? []).some((e) =>
      e.degree.toLowerCase().includes(deg.toLowerCase().slice(0, 6))
    );
    if (!onResume && !inParsed) {
      const newEdu: EducationItem = {
        institution: creds.institutions[0] ?? "",
        degree: deg,
        startDate: creds.dateRanges[0]?.startDate ?? "",
        endDate:
          creds.dateRanges[0]?.endDate ??
          creds.years[creds.years.length - 1] ??
          "",
      };
      out.push({
        id: nanoid(),
        category: "certificate-gap",
        title: `Add credential from certificate: ${deg}`,
        detail:
          "This qualification appears on an uploaded certificate but not on your CV.",
        patch: { op: "appendEducation", value: newEdu },
      });
    }
  }

  for (const [i, exp] of (data.experience ?? []).entries()) {
    if (isEmpty(exp.startDate) || isEmpty(exp.endDate)) {
      const resumeRanges = extractCredentialsFromText(resumeText).dateRanges;
      const range = resumeRanges[i] ?? creds.dateRanges[i];
      if (range) {
        const updated = {
          ...exp,
          startDate: exp.startDate || range.startDate,
          endDate: exp.endDate || range.endDate,
        };
        if (updated.startDate !== exp.startDate || updated.endDate !== exp.endDate) {
          out.push({
            id: nanoid(),
            category: "certificate-gap",
            title: `Add dates for ${exp.role || exp.company}`,
            detail: `Detected range ${updated.startDate} – ${updated.endDate ?? "Present"} from documents.`,
            patch: { op: "setExperience", index: i, value: updated },
          });
        }
      }
    }
  }

  return out;
}

export function mergeSuggestions(
  ...groups: Suggestion[][]
): Suggestion[] {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const group of groups) {
    for (const s of group) {
      const key = `${s.category}:${s.title}:${s.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}
