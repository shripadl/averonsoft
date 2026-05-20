"use client";

import type {
  EducationItem,
  ExperienceItem,
  ResumeData,
} from "@/lib/resume";

type ResumeFormProps = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

const emptyExperience = (): ExperienceItem => ({
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
});

const emptyEducation = (): EducationItem => ({
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
});

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  function update<K extends keyof ResumeData>(k: K, v: ResumeData[K]) {
    onChange({ ...data, [k]: v });
  }

  const experience = data.experience ?? [];
  const education = data.education ?? [];
  const links = data.links ?? [];

  function setExperience(next: ExperienceItem[]) {
    update("experience", next);
  }

  function setEducation(next: EducationItem[]) {
    update("education", next);
  }

  function setLinks(next: { label: string; url: string }[]) {
    update("links", next);
  }

  function updateExperience(
    index: number,
    patch: Partial<ExperienceItem>
  ) {
    const next = [...experience];
    next[index] = { ...next[index], ...patch };
    setExperience(next);
  }

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    const next = [...education];
    next[index] = { ...next[index], ...patch };
    setEducation(next);
  }

  function updateLink(
    index: number,
    patch: Partial<{ label: string; url: string }>
  ) {
    const next = [...links];
    next[index] = { ...next[index], ...patch };
    setLinks(next);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Full Name"
            value={data.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <input
            className="input"
            placeholder="Headline"
            value={data.headline ?? ""}
            onChange={(e) => update("headline", e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <input
            className="input"
            placeholder="Phone"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <input
            className="input md:col-span-2"
            placeholder="Location"
            value={data.location ?? ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Summary</h2>
        <textarea
          className="textarea"
          placeholder="Professional summary"
          value={data.summary ?? ""}
          onChange={(e) => update("summary", e.target.value)}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Skills</h2>
        <input
          className="input"
          placeholder="Comma-separated skills"
          value={(data.skills ?? []).join(", ")}
          onChange={(e) =>
            update(
              "skills",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Experience</h2>
          <button
            type="button"
            onClick={() => setExperience([...experience, emptyExperience()])}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            + Add
          </button>
        </div>

        {experience.length === 0 ? (
          <p className="text-xs text-slate-500">No entries yet.</p>
        ) : (
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 space-y-2"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setExperience(experience.filter((_, j) => j !== i))
                    }
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    className="input"
                    placeholder="Job title / role"
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(i, { role: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(i, { company: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Start date (e.g. 2020)"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(i, { startDate: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="End date (e.g. 2024 or Present)"
                    value={exp.endDate ?? ""}
                    onChange={(e) =>
                      updateExperience(i, { endDate: e.target.value })
                    }
                  />
                </div>
                <textarea
                  className="textarea min-h-[72px]"
                  placeholder="Description (optional)"
                  value={exp.description ?? ""}
                  onChange={(e) =>
                    updateExperience(i, { description: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Education</h2>
          <button
            type="button"
            onClick={() => setEducation([...education, emptyEducation()])}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            + Add
          </button>
        </div>

        {education.length === 0 ? (
          <p className="text-xs text-slate-500">No entries yet.</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 space-y-2"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setEducation(education.filter((_, j) => j !== i))
                    }
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    className="input sm:col-span-2"
                    placeholder="Degree (e.g. B.S. Computer Science)"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(i, { degree: e.target.value })
                    }
                  />
                  <input
                    className="input sm:col-span-2"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(i, { institution: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Start date"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(i, { startDate: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="End / completion date"
                    value={edu.endDate ?? ""}
                    onChange={(e) =>
                      updateEducation(i, { endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Links</h2>
          <button
            type="button"
            onClick={() =>
              setLinks([...links, { label: "", url: "" }])
            }
            className="text-xs px-2.5 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            + Add
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-xs text-slate-500">
            LinkedIn, portfolio, GitHub, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 space-y-2"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLinks(links.filter((_, j) => j !== i))}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Label (e.g. LinkedIn)"
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
