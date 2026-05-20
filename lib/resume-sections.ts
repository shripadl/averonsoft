export type ResumeSectionId =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "links";

export type SectionLayoutState = {
  order: ResumeSectionId[];
  visible: Record<ResumeSectionId, boolean>;
};

export const RESUME_SECTION_LABELS: Record<ResumeSectionId, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  links: "Links",
};

export function defaultSectionLayout(): SectionLayoutState {
  return {
    order: ["summary", "skills", "experience", "education", "links"],
    visible: {
      summary: true,
      skills: true,
      experience: true,
      education: true,
      links: true,
    },
  };
}
