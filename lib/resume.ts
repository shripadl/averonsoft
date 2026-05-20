export type ExperienceItem = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type EducationItem = {
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
};

export type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  headline?: string;
  summary?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  links?: { label: string; url: string }[];
  template?: string;
};

export function defaultResumeData(): ResumeData {
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    links: [],
    template: "modern",
  };
}
