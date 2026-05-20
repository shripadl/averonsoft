export type CoverLetterData = {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress?: string;
  roleAppliedFor: string;
  companyName?: string;
  hiringManager?: string;
  body: string;
  date: string;
};

export function defaultCoverLetterData(): CoverLetterData {
  return {
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantAddress: "",
    roleAppliedFor: "",
    companyName: "",
    hiringManager: "",
    body: defaultCoverLetterBody(),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function defaultCoverLetterBody(): string {
  return `Dear Hiring Manager,

I am writing to express my interest in the position. My background aligns well with the requirements outlined, and I would welcome the opportunity to contribute to your team.

Thank you for your time and consideration.

Sincerely,`;
}

export function coverLetterFromResume(
  resume: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
  },
  roleAppliedFor = ""
): CoverLetterData {
  const base = defaultCoverLetterData();
  return {
    ...base,
    applicantName: resume.fullName ?? "",
    applicantEmail: resume.email ?? "",
    applicantPhone: resume.phone ?? "",
    applicantAddress: resume.location ?? "",
    roleAppliedFor,
    body: roleAppliedFor
      ? `Dear Hiring Manager,

I am writing to apply for the ${roleAppliedFor} role. My experience and skills are a strong match for this position, and I am excited about the opportunity to contribute to your organization.

Thank you for considering my application.

Sincerely,
${resume.fullName ?? ""}`
      : base.body,
  };
}
