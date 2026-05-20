import type { ResumeData } from "@/lib/resume";
import type { ResumeSectionId, SectionLayoutState } from "@/lib/resume-sections";
import type { ResumeTemplateId } from "@/lib/resume-templates";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contactLine(data: ResumeData): string {
  return [data.email, data.phone, data.location]
    .filter((v): v is string => Boolean(v))
    .map(esc)
    .join(" · ");
}

function formalContactLine(data: ResumeData): string {
  return [data.location, data.phone, data.email]
    .filter((v): v is string => Boolean(v))
    .map(esc)
    .join(", ");
}

const FORMAL_SECTION_TITLES: Record<ResumeSectionId, string> = {
  summary: "Profile",
  skills: "Skills",
  experience: "Employment History",
  education: "Education",
  links: "Links",
};

function skillsInner(skills: string[], templateId: ResumeTemplateId): string {
  if (!skills.length) return "";
  switch (templateId) {
    case "timeline":
    case "executive":
      return skills
        .map(
          (s) =>
            `<div class="skill-row"><span class="skill-name">${esc(s)}</span><span class="skill-bar"><span class="skill-fill"></span></span></div>`
        )
        .join("");
    case "grid":
      return `<div class="skills-grid">${skills.map((s) => `<span class="skill-cell">${esc(s)}</span>`).join("")}</div>`;
    case "compact":
      return `<p class="skills-inline">${skills.map(esc).join(" · ")}</p>`;
    case "classic":
      return `<ul class="skills-list">${skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
    case "formal":
      return `<div class="skills-cols">${skills
        .map((s) => `<div class="skill-item">${esc(s)}</div>`)
        .join("")}</div>`;
    default:
      return skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
  }
}

function experienceInner(
  data: ResumeData,
  templateId: ResumeTemplateId
): string {
  const items = data.experience ?? [];
  if (!items.length) return "";

  if (templateId === "timeline") {
    return items
      .map(
        (e) => `<article class="tl-item">
        <div class="tl-marker"></div>
        <div class="tl-body">
          <h3>${esc(e.role)}${e.company ? ` <span class="at">@ ${esc(e.company)}</span>` : ""}</h3>
          <p class="meta">${esc([e.startDate, e.endDate].filter(Boolean).join(" – "))}</p>
          ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ""}
        </div>
      </article>`
      )
      .join("");
  }

  if (templateId === "portfolio") {
    return items
      .map(
        (e) => `<article class="card">
        <h3>${esc(e.role)}</h3>
        <p class="card-sub">${esc(e.company)}</p>
        <p class="meta">${esc([e.startDate, e.endDate].filter(Boolean).join(" – "))}</p>
        ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ""}
      </article>`
      )
      .join("");
  }

  if (templateId === "compact") {
    return items
      .map(
        (e) => `<p class="exp-line"><strong>${esc(e.role)}</strong> — ${esc(e.company)} · ${esc([e.startDate, e.endDate].filter(Boolean).join("–"))}</p>`
      )
      .join("");
  }

  if (templateId === "formal") {
    return items
      .map((e) => {
        const dates = esc([e.startDate, e.endDate].filter(Boolean).join(" — "));
        const title = [esc(e.role), esc(e.company)].filter(Boolean).join(", ");
        return `<article class="rail-entry">
        <div class="rail-date">${dates}</div>
        <div class="rail-body">
          <h3>${title}</h3>
          ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ""}
        </div>
      </article>`;
      })
      .join("");
  }

  return items
    .map(
      (e) => `<article class="exp-item">
      <h3>${esc(e.role)}${e.company ? ` — ${esc(e.company)}` : ""}</h3>
      <p class="meta">${esc([e.startDate, e.endDate].filter(Boolean).join(" – "))}</p>
      ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ""}
    </article>`
    )
    .join("");
}

function educationInner(data: ResumeData, templateId: ResumeTemplateId): string {
  const items = data.education ?? [];
  if (!items.length) return "";

  if (templateId === "formal") {
    return items
      .map((e) => {
        const dates = esc([e.startDate, e.endDate].filter(Boolean).join(" — "));
        const line = [esc(e.degree), esc(e.institution)].filter(Boolean).join(", ");
        return `<article class="rail-entry">
        <div class="rail-date">${dates}</div>
        <div class="rail-body"><h3>${line}</h3></div>
      </article>`;
      })
      .join("");
  }

  if (templateId === "grid") {
    return `<div class="edu-grid">${items
      .map(
        (e) => `<article class="edu-card">
        <h3>${esc(e.degree)}</h3>
        <p>${esc(e.institution)}</p>
        <p class="meta">${esc([e.startDate, e.endDate].filter(Boolean).join(" – "))}</p>
      </article>`
      )
      .join("")}</div>`;
  }

  return items
    .map(
      (e) => `<article class="edu-item">
      <h3>${esc(e.degree)}</h3>
      <p>${esc(e.institution)}</p>
      <p class="meta">${esc([e.startDate, e.endDate].filter(Boolean).join(" – "))}</p>
    </article>`
    )
    .join("");
}

function linksInner(data: ResumeData): string {
  const links = data.links ?? [];
  if (!links.length) return "";
  return links
    .map(
      (l) =>
        `<p class="link-item"><span class="link-label">${esc(l.label)}:</span> ${esc(l.url)}</p>`
    )
    .join("");
}

function buildSection(
  id: ResumeSectionId,
  data: ResumeData,
  templateId: ResumeTemplateId
): string {
  const titles: Record<ResumeSectionId, string> = {
    summary: "Summary",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    links: "Links",
  };

  if (templateId === "formal") {
    const label = FORMAL_SECTION_TITLES[id];
    switch (id) {
      case "summary":
        if (!data.summary?.trim()) return "";
        return `<section class="sec sec-rail sec-summary" data-section="summary">
          <h2 class="rail-label">${label}</h2>
          <div class="rail-content"><p>${esc(data.summary)}</p></div>
        </section>`;
      case "skills": {
        const inner = skillsInner(data.skills ?? [], templateId);
        if (!inner) return "";
        return `<section class="sec sec-rail sec-skills" data-section="skills">
          <h2 class="rail-label">${label}</h2>
          <div class="rail-content">${inner}</div>
        </section>`;
      }
      case "experience": {
        const inner = experienceInner(data, templateId);
        if (!inner) return "";
        return `<section class="sec sec-block sec-experience" data-section="experience">
          <h2 class="block-title">${label}</h2>
          <div class="sec-body">${inner}</div>
        </section>`;
      }
      case "education": {
        const inner = educationInner(data, templateId);
        if (!inner) return "";
        return `<section class="sec sec-block sec-education" data-section="education">
          <h2 class="block-title">${label}</h2>
          <div class="sec-body">${inner}</div>
        </section>`;
      }
      case "links": {
        const inner = linksInner(data);
        if (!inner) return "";
        return `<section class="sec sec-rail sec-links" data-section="links">
          <h2 class="rail-label">${label}</h2>
          <div class="rail-content">${inner}</div>
        </section>`;
      }
      default:
        return "";
    }
  }

  switch (id) {
    case "summary":
      if (!data.summary?.trim()) return "";
      return `<section class="sec sec-summary" data-section="summary"><h2>${titles.summary}</h2><p>${esc(data.summary)}</p></section>`;
    case "skills": {
      const inner = skillsInner(data.skills ?? [], templateId);
      if (!inner) return "";
      return `<section class="sec sec-skills" data-section="skills"><h2>${titles.skills}</h2><div class="sec-body">${inner}</div></section>`;
    }
    case "experience": {
      const inner = experienceInner(data, templateId);
      if (!inner) return "";
      return `<section class="sec sec-experience" data-section="experience"><h2>${titles.experience}</h2><div class="sec-body">${inner}</div></section>`;
    }
    case "education": {
      const inner = educationInner(data, templateId);
      if (!inner) return "";
      return `<section class="sec sec-education" data-section="education"><h2>${titles.education}</h2><div class="sec-body">${inner}</div></section>`;
    }
    case "links": {
      const inner = linksInner(data);
      if (!inner) return "";
      return `<section class="sec sec-links" data-section="links"><h2>${titles.links}</h2><div class="sec-body">${inner}</div></section>`;
    }
    default:
      return "";
  }
}

export function applyResumeTemplate(
  templateHtml: string,
  data: ResumeData,
  layout: SectionLayoutState,
  templateId: ResumeTemplateId
): string {
  const sectionsHtml = layout.order
    .filter((id) => layout.visible[id])
    .map((id) => buildSection(id, data, templateId))
    .filter(Boolean)
    .join("\n");

  const map: Record<string, string> = {
    fullName: esc(data.fullName || ""),
    headline: esc(data.headline || ""),
    email: esc(data.email || ""),
    phone: esc(data.phone || ""),
    location: esc(data.location || ""),
    contactLine: contactLine(data),
    formalContactLine: formalContactLine(data),
    sections: sectionsHtml,
    summary: data.summary ? esc(data.summary) : "",
    skills: skillsInner(data.skills ?? [], templateId),
    experience: experienceInner(data, templateId),
    education: educationInner(data, templateId),
    links: linksInner(data),
  };

  let html = templateHtml;
  for (const [key, value] of Object.entries(map)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  html = html.replaceAll(/\{\{[a-zA-Z]+\}\}/g, "");
  return html;
}

export async function loadResumeTemplateHtml(
  templateId: ResumeTemplateId
): Promise<string> {
  const res = await fetch(
    `/api/resume-template?name=${encodeURIComponent(templateId)}`
  );
  if (!res.ok) throw new Error("Failed to load template");
  return res.text();
}
