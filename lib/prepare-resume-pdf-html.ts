import { RESUME_PRINT_CSS } from "@/lib/resume-print-css";

/**
 * Ensures Puppeteer receives full HTML with print-safe CSS and a stable root.
 */
export function prepareResumePdfHtml(html: string): string {
  let out = html.trim();
  if (!out) return out;

  if (!/<\s*html[\s>]/i.test(out)) {
    out = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body>${out}</body></html>`;
  }

  if (!/<\s*main[\s>]/i.test(out)) {
    out = out.replace(
      /<\s*body(\s[^>]*)>([\s\S]*?)<\/\s*body\s*>/i,
      (_m, attrs: string, inner: string) =>
        `<body${attrs}><main class="resume-root">${inner}</main></body>`
    );
  } else if (!/\bclass\s*=\s*["'][^"']*\bresume-root\b/i.test(out)) {
    out = out.replace(/<main(\s[^>]*?)(\s|>)/i, (_m, attrs: string, end: string) => {
      if (/\bclass\s*=/i.test(attrs)) {
        return `<main${attrs.replace(
          /class\s*=\s*(["'])([^"']*)\1/i,
          (_a, q: string, cls: string) => `class=${q}${cls} resume-root${q}`
        )}${end}`;
      }
      return `<main class="resume-root"${attrs}${end}`;
    });
  }

  const inject = `<style id="resume-print-pack">${RESUME_PRINT_CSS}</style>`;
  if (/<\/head>/i.test(out)) {
    return out.replace(/<\/head>/i, `${inject}</head>`);
  }
  return out.replace(
    /<\s*body([^>]*)>/i,
    `<head><meta charset="utf-8"/>${inject}</head><body$1>`
  );
}

/** Visible page-stripe debug (screen only). */
export function injectPdfDebugClass(html: string): string {
  let out = prepareResumePdfHtml(html);
  if (/<body[^>]*class=/i.test(out)) {
    return out.replace(
      /<body([^>]*class\s*=\s*)(["'])([^"']*)(\2)/i,
      '<body$1$2$3 resume-pdf-debug$2'
    );
  }
  return out.replace(/<body(\s[^>]*)?>/i, '<body$1 class="resume-pdf-debug">');
}
