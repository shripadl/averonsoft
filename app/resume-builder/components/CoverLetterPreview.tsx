"use client";

import { useMemo } from "react";
import { renderCoverLetterHtml } from "@/lib/cover-letter-render";
import type { CoverLetterData } from "@/lib/cover-letter";
import { injectPdfDebugClass } from "@/lib/prepare-resume-pdf-html";

type CoverLetterPreviewProps = {
  data: CoverLetterData;
  template: string;
  pdfDebug?: boolean;
};

export default function CoverLetterPreview({
  data,
  template,
  pdfDebug = false,
}: CoverLetterPreviewProps) {
  const html = useMemo(() => {
    const base = renderCoverLetterHtml(data, template);
    return pdfDebug ? injectPdfDebugClass(base) : base;
  }, [data, template, pdfDebug]);
  return (
    <iframe
      data-preview="cover"
      className="h-full w-full rounded-xl border border-slate-800"
      srcDoc={html}
      title="Cover letter preview"
    />
  );
}
