import {
  isResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-templates";

/** Colors/fonts aligned with `app/resume-builder/templates/*.html`. */
export type DocxPalette = {
  id: ResumeTemplateId;
  accent: string;
  titleFont: string;
  bodyFont: string;
  titleSize: number;
  headingSize: number;
  bodySize: number;
  titleSpacingAfter: number;
  text: string;
  textMuted: string;
  textStrong: string;
  /** Word page background (e.g. creative dark). */
  pageBg?: string;
  /** Section panel fill (creative cards, sidebar column). */
  sectionBg?: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  /** Corporate-style top banner */
  bannerBg?: string;
  bannerText?: string;
  skillsCols: number;
  layout: "flow" | "banner" | "sidebar" | "boxed" | "grid-edu";
  headingUppercase: boolean;
  headerBottomRule?: boolean;
  expLeftBorder?: boolean;
};

const PALETTES: Record<ResumeTemplateId, DocxPalette> = {
  modern: {
    id: "modern",
    accent: "0EA5E9",
    titleFont: "Calibri",
    bodyFont: "Calibri",
    titleSize: 56,
    headingSize: 22,
    bodySize: 22,
    titleSpacingAfter: 160,
    text: "0F172A",
    textMuted: "64748B",
    textStrong: "0F172A",
    chipBg: "F0F9FF",
    chipBorder: "BAE6FD",
    chipText: "0369A1",
    skillsCols: 3,
    layout: "flow",
    headingUppercase: true,
    headerBottomRule: true,
  },
  minimal: {
    id: "minimal",
    accent: "71717A",
    titleFont: "Georgia",
    bodyFont: "Georgia",
    titleSize: 56,
    headingSize: 20,
    bodySize: 24,
    titleSpacingAfter: 200,
    text: "18181B",
    textMuted: "71717A",
    textStrong: "18181B",
    pageBg: "FAFAFA",
    chipBg: "FAFAFA",
    chipBorder: "D4D4D8",
    chipText: "18181B",
    skillsCols: 2,
    layout: "flow",
    headingUppercase: true,
  },
  elegant: {
    id: "elegant",
    accent: "7C3AED",
    titleFont: "Georgia",
    bodyFont: "Georgia",
    titleSize: 58,
    headingSize: 28,
    bodySize: 24,
    titleSpacingAfter: 200,
    text: "1F2937",
    textMuted: "6B7280",
    textStrong: "1F2937",
    chipBg: "F5F3FF",
    chipBorder: "DDD6FE",
    chipText: "5B21B6",
    skillsCols: 2,
    layout: "flow",
    headingUppercase: true,
  },
  corporate: {
    id: "corporate",
    accent: "1E3A5F",
    titleFont: "Arial",
    bodyFont: "Arial",
    titleSize: 52,
    headingSize: 26,
    bodySize: 22,
    titleSpacingAfter: 0,
    text: "111827",
    textMuted: "6B7280",
    textStrong: "111827",
    bannerBg: "1E3A5F",
    bannerText: "FFFFFF",
    chipBg: "E8EEF4",
    chipBorder: "CBD5E1",
    chipText: "1E3A5F",
    skillsCols: 3,
    layout: "banner",
    headingUppercase: true,
    expLeftBorder: true,
  },
  creative: {
    id: "creative",
    accent: "38BDF8",
    titleFont: "Verdana",
    bodyFont: "Verdana",
    titleSize: 56,
    headingSize: 20,
    bodySize: 20,
    titleSpacingAfter: 200,
    text: "E2E8F0",
    textMuted: "64748B",
    textStrong: "F1F5F9",
    pageBg: "0F172A",
    sectionBg: "1E293B",
    chipBg: "0F172A",
    chipBorder: "38BDF8",
    chipText: "7DD3FC",
    skillsCols: 3,
    layout: "boxed",
    headingUppercase: true,
  },
  timeline: {
    id: "timeline",
    accent: "0D9488",
    titleFont: "Calibri",
    bodyFont: "Calibri",
    titleSize: 54,
    headingSize: 26,
    bodySize: 22,
    titleSpacingAfter: 160,
    text: "0F172A",
    textMuted: "64748B",
    textStrong: "0F172A",
    chipBg: "F0FDFA",
    chipBorder: "99F6E4",
    chipText: "0F766E",
    skillsCols: 1,
    layout: "flow",
    headingUppercase: true,
    expLeftBorder: true,
  },
  sidebar: {
    id: "sidebar",
    accent: "0F766E",
    titleFont: "Calibri",
    bodyFont: "Calibri",
    titleSize: 52,
    headingSize: 22,
    bodySize: 22,
    titleSpacingAfter: 120,
    text: "111827",
    textMuted: "64748B",
    textStrong: "111827",
    sectionBg: "F8FAFC",
    chipBg: "ECFDF5",
    chipBorder: "A7F3D0",
    chipText: "047857",
    skillsCols: 2,
    layout: "sidebar",
    headingUppercase: true,
  },
  grid: {
    id: "grid",
    accent: "7C3AED",
    titleFont: "Calibri",
    bodyFont: "Calibri",
    titleSize: 52,
    headingSize: 22,
    bodySize: 20,
    titleSpacingAfter: 140,
    text: "0F172A",
    textMuted: "64748B",
    textStrong: "0F172A",
    sectionBg: "FFFFFF",
    chipBg: "F5F3FF",
    chipBorder: "DDD6FE",
    chipText: "5B21B6",
    skillsCols: 3,
    layout: "grid-edu",
    headingUppercase: true,
  },
  classic: {
    id: "classic",
    accent: "1F2937",
    titleFont: "Times New Roman",
    bodyFont: "Times New Roman",
    titleSize: 56,
    headingSize: 28,
    bodySize: 24,
    titleSpacingAfter: 200,
    text: "111827",
    textMuted: "4B5563",
    textStrong: "111827",
    chipBg: "F9FAFB",
    chipBorder: "D1D5DB",
    chipText: "1F2937",
    skillsCols: 2,
    layout: "flow",
    headingUppercase: true,
  },
  compact: {
    id: "compact",
    accent: "475569",
    titleFont: "Arial",
    bodyFont: "Arial",
    titleSize: 48,
    headingSize: 22,
    bodySize: 20,
    titleSpacingAfter: 80,
    text: "0F172A",
    textMuted: "64748B",
    textStrong: "0F172A",
    chipBg: "F8FAFC",
    chipBorder: "E2E8F0",
    chipText: "334155",
    skillsCols: 1,
    layout: "flow",
    headingUppercase: true,
  },
  portfolio: {
    id: "portfolio",
    accent: "EA580C",
    titleFont: "Calibri",
    bodyFont: "Calibri",
    titleSize: 58,
    headingSize: 28,
    bodySize: 22,
    titleSpacingAfter: 160,
    text: "0F172A",
    textMuted: "64748B",
    textStrong: "0F172A",
    chipBg: "FFF7ED",
    chipBorder: "FED7AA",
    chipText: "C2410C",
    skillsCols: 2,
    layout: "flow",
    headingUppercase: true,
  },
  executive: {
    id: "executive",
    accent: "B45309",
    titleFont: "Cambria",
    bodyFont: "Calibri",
    titleSize: 58,
    headingSize: 28,
    bodySize: 22,
    titleSpacingAfter: 220,
    text: "1C1917",
    textMuted: "78716C",
    textStrong: "1C1917",
    chipBg: "FFFBEB",
    chipBorder: "FDE68A",
    chipText: "92400E",
    skillsCols: 1,
    layout: "flow",
    headingUppercase: true,
    expLeftBorder: true,
  },
  formal: {
    id: "formal",
    accent: "000000",
    titleFont: "Times New Roman",
    bodyFont: "Times New Roman",
    titleSize: 52,
    headingSize: 20,
    bodySize: 22,
    titleSpacingAfter: 120,
    text: "000000",
    textMuted: "000000",
    textStrong: "000000",
    chipBg: "FFFFFF",
    chipBorder: "000000",
    chipText: "000000",
    skillsCols: 2,
    layout: "flow",
    headingUppercase: true,
    headerBottomRule: false,
  },
};

export function resolveDocxPalette(templateId: string): DocxPalette {
  if (isResumeTemplateId(templateId)) return PALETTES[templateId];
  return PALETTES.modern;
}

/** @deprecated use resolveDocxPalette */
export type DocxTheme = Pick<
  DocxPalette,
  | "accent"
  | "titleFont"
  | "bodyFont"
  | "titleSize"
  | "headingSize"
  | "bodySize"
  | "titleSpacingAfter"
>;

export function resolveDocxTheme(templateId: string): DocxTheme {
  const p = resolveDocxPalette(templateId);
  return {
    accent: p.accent,
    titleFont: p.titleFont,
    bodyFont: p.bodyFont,
    titleSize: p.titleSize,
    headingSize: p.headingSize,
    bodySize: p.bodySize,
    titleSpacingAfter: p.titleSpacingAfter,
  };
}

export function getResumeDocxDocumentOptions(templateId: string) {
  const p = resolveDocxPalette(templateId);
  if (!p.pageBg) return {};
  return { background: { color: p.pageBg } };
}
