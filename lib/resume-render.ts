import type { ResumeData } from "@/lib/resume";

export function renderResumeHtml(data: ResumeData, template: string): string {
  const baseStyles = `
    body{font-family:system-ui;background:#020617;color:#e2e8f0;padding:32px;}
    h1{font-size:28px;margin:0;}
    h2{font-size:16px;margin-top:24px;color:#94a3b8;border-bottom:1px solid #1e293b;padding-bottom:4px;}
    .sub{color:#94a3b8;font-size:14px;margin-top:4px;}
    .item{margin-bottom:12px;}
    .item-title{font-weight:600;}
    .item-meta{font-size:12px;color:#64748b;}
    .chip{padding:4px 8px;border-radius:999px;background:#0f172a;border:1px solid #1e293b;margin:2px;font-size:11px;display:inline-block;}
  `;

  const templates: Record<string, string> = {
    modern: baseStyles,
    minimal: baseStyles + "body{font-family:Arial;}",
    elegant: baseStyles + "h1{font-family:serif;}",
    corporate: baseStyles + "body{background:#0a0f1f;}",
    creative: baseStyles + "h1{color:#38bdf8;}",
  };

  const style = templates[template] ?? templates.modern;

  const experienceHtml = (data.experience ?? [])
    .map(
      (e) => `<div class="item">
      <div class="item-title">${escapeHtml(e.role)}${e.company ? ` — ${escapeHtml(e.company)}` : ""}</div>
      <div class="item-meta">${escapeHtml([e.startDate, e.endDate].filter(Boolean).join(" – "))}</div>
      ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ""}
    </div>`
    )
    .join("");

  const educationHtml = (data.education ?? [])
    .map(
      (e) => `<div class="item">
      <div class="item-title">${escapeHtml(e.degree)}</div>
      <div class="item-meta">${escapeHtml(e.institution)} · ${escapeHtml([e.startDate, e.endDate].filter(Boolean).join(" – "))}</div>
    </div>`
    )
    .join("");

  return `<html><head><style>${style}</style></head><body>
    <h1>${escapeHtml(data.fullName || "")}</h1>
    <div class="sub">${escapeHtml(data.headline || "")}</div>
    <div class="sub">${escapeHtml(data.email || "")} · ${escapeHtml(data.phone || "")} · ${escapeHtml(data.location || "")}</div>
    ${data.summary ? `<h2>Summary</h2><p>${escapeHtml(data.summary)}</p>` : ""}
    ${experienceHtml ? `<h2>Experience</h2>${experienceHtml}` : ""}
    ${educationHtml ? `<h2>Education</h2>${educationHtml}` : ""}
    ${
      data.skills?.length
        ? `<h2>Skills</h2>${data.skills.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}`
        : ""
    }
  </body></html>`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
