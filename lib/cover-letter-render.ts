import type { CoverLetterData } from "@/lib/cover-letter";

export function renderCoverLetterHtml(
  data: CoverLetterData,
  template: string
): string {
  const baseStyles = `
    body{font-family:system-ui;background:#020617;color:#e2e8f0;padding:40px;max-width:720px;margin:0 auto;line-height:1.6;}
    .meta{font-size:12px;color:#94a3b8;margin-bottom:24px;}
    .role{font-size:14px;color:#38bdf8;margin:8px 0 24px;font-weight:600;}
    p{margin:0 0 16px;white-space:pre-wrap;}
    .sign{margin-top:32px;}
  `;
  const templates: Record<string, string> = {
    modern: baseStyles,
    minimal: baseStyles + "body{font-family:Arial;}",
    elegant: baseStyles + ".sign{font-family:serif;}",
    corporate: baseStyles + "body{background:#0a0f1f;}",
    creative: baseStyles + ".role{color:#38bdf8;}",
  };
  const style = templates[template] ?? templates.modern;

  const paragraphs = (data.body || "")
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");

  const roleLine = data.roleAppliedFor
    ? `<div class="role">Re: ${escapeHtml(data.roleAppliedFor)}${data.companyName ? ` at ${escapeHtml(data.companyName)}` : ""}</div>`
    : "";

  return `<html><head><style>${style}</style></head><body>
    <div class="meta">
      ${escapeHtml(data.date)}<br/>
      ${escapeHtml(data.applicantName)}<br/>
      ${escapeHtml(data.applicantEmail)}${data.applicantPhone ? ` · ${escapeHtml(data.applicantPhone)}` : ""}
      ${data.applicantAddress ? `<br/>${escapeHtml(data.applicantAddress)}` : ""}
    </div>
    ${roleLine}
    ${paragraphs}
    <div class="sign">${escapeHtml(data.applicantName)}</div>
  </body></html>`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
