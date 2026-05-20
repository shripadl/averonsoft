import type { EducationItem, ExperienceItem, ResumeData } from "@/lib/resume";

export type ResumePatch =
  | { op: "set"; path: keyof ResumeData; value: ResumeData[keyof ResumeData] }
  | { op: "setExperience"; index: number; value: ExperienceItem }
  | { op: "appendExperience"; value: ExperienceItem }
  | { op: "setEducation"; index: number; value: EducationItem }
  | { op: "appendEducation"; value: EducationItem };

export function applyResumePatch(
  data: ResumeData,
  patch: ResumePatch
): ResumeData {
  const next = { ...data };

  switch (patch.op) {
    case "set":
      return { ...next, [patch.path]: patch.value };
    case "appendExperience":
      return {
        ...next,
        experience: [...(next.experience ?? []), patch.value],
      };
    case "setExperience": {
      const experience = [...(next.experience ?? [])];
      experience[patch.index] = patch.value;
      return { ...next, experience };
    }
    case "appendEducation":
      return {
        ...next,
        education: [...(next.education ?? []), patch.value],
      };
    case "setEducation": {
      const education = [...(next.education ?? [])];
      education[patch.index] = patch.value;
      return { ...next, education };
    }
    default:
      return next;
  }
}
