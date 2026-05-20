"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResumeData } from "@/lib/resume";
import type { SectionLayoutState } from "@/lib/resume-sections";
import {
  applyResumeTemplate,
  loadResumeTemplateHtml,
} from "@/lib/resume-template-engine";
import { injectPdfDebugClass } from "@/lib/prepare-resume-pdf-html";
import {
  isResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-templates";

type ResumePreviewProps = {
  data: ResumeData;
  template: string;
  sectionLayout: SectionLayoutState;
  /** `?debug=pdf` — print pack + page stripe overlay in preview iframe */
  pdfDebug?: boolean;
};

export default function ResumePreview({
  data,
  template,
  sectionLayout,
  pdfDebug = false,
}: ResumePreviewProps) {
  const [templateHtml, setTemplateHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  const templateId: ResumeTemplateId = isResumeTemplateId(template)
    ? template
    : "modern";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFade(true);
    loadResumeTemplateHtml(templateId)
      .then((html) => {
        if (!cancelled) setTemplateHtml(html);
      })
      .catch(() => {
        if (!cancelled) setTemplateHtml("");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          requestAnimationFrame(() => setFade(false));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const srcDoc = useMemo(() => {
    if (!templateHtml) return "";
    const filled = applyResumeTemplate(
      templateHtml,
      data,
      sectionLayout,
      templateId
    );
    return pdfDebug ? injectPdfDebugClass(filled) : filled;
  }, [templateHtml, data, sectionLayout, templateId, pdfDebug]);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 text-sm text-muted-foreground">
          Loading template…
        </div>
      )}
      <iframe
        data-preview="resume"
        className={`h-full w-full rounded-xl border border-border bg-white transition-opacity duration-300 ${
          fade ? "opacity-40" : "opacity-100"
        }`}
        srcDoc={srcDoc}
        title="Resume preview"
      />
    </div>
  );
}
