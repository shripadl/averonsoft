export const RESUME_TEMPLATE_IDS = [
  "modern",
  "minimal",
  "elegant",
  "corporate",
  "creative",
  "timeline",
  "sidebar",
  "grid",
  "classic",
  "compact",
  "portfolio",
  "executive",
  "formal",
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export const RESUME_TEMPLATE_LABELS: Record<ResumeTemplateId, string> = {
  modern: "Modern",
  minimal: "Minimal",
  elegant: "Elegant",
  corporate: "Corporate",
  creative: "Creative",
  timeline: "Timeline",
  sidebar: "Sidebar",
  grid: "Grid",
  classic: "Classic",
  compact: "Compact",
  portfolio: "Portfolio",
  executive: "Executive",
  formal: "Formal",
};

export function isResumeTemplateId(id: string): id is ResumeTemplateId {
  return (RESUME_TEMPLATE_IDS as readonly string[]).includes(id);
}
