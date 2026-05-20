"use client";

import { useCallback, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { defaultResumeData, type ResumeData } from "@/lib/resume";
import {
  coverLetterFromResume,
  defaultCoverLetterData,
  type CoverLetterData,
} from "@/lib/cover-letter";
import { applyResumePatch } from "@/lib/resume-patch";
import {
  generateCertificateGaps,
  generateImprovements,
  generateUploadAmendments,
  mergeSuggestions,
  type Suggestion,
} from "@/lib/resume-suggestions";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import CoverLetterForm from "./components/CoverLetterForm";
import CoverLetterPreview from "./components/CoverLetterPreview";
import TemplateSelector from "./components/TemplateSelector";
import FileDropZone from "./components/FileDropZone";
import SuggestionsPanel from "./components/SuggestionsPanel";
import BuilderTabs, { type BuilderTab } from "./components/BuilderTabs";
import Disclaimer from "./components/Disclaimer";
import SectionControls from "./components/SectionControls";
import {
  defaultSectionLayout,
  type SectionLayoutState,
} from "@/lib/resume-sections";
import { exportHtmlToPdf, exportIframeToPdf } from "@/lib/export-preview-pdf";
import { postServerPdf } from "@/lib/download-server-pdf";
import {
  countParsedFields,
  mergeParsedIntoResume,
  parseTextToResume,
} from "@/lib/resume-parse";
import { toast } from "sonner";

const FILE_ACCEPT =
  "application/pdf,image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.txt,.heic,.heif";

function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|heif)$/i.test(file.name)
  );
}

async function extractFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (isImageFile(file)) {
    const { extractImageTextInBrowser } = await import(
      "@/lib/extract-image-client"
    );
    const text = await extractImageTextInBrowser(file, onProgress);
    if (!text.trim()) {
      throw new Error(
        "Could not read text from this image. Use a straight, well-lit photo of the CV, or upload PDF/DOCX instead."
      );
    }
    return text;
  }

  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/extract", { method: "POST", body: form });
  const json: { rawText?: string; error?: string } = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Extraction failed");
  }
  if (!json.rawText?.trim()) {
    throw new Error(json.error ?? "No text found in this file");
  }
  return json.rawText;
}

type ResumeBuilderScreenProps = {
  canExportWord?: boolean;
};

export function ResumeBuilderScreen({
  canExportWord = false,
}: ResumeBuilderScreenProps) {
  const searchParams = useSearchParams();
  const pdfDebug = searchParams.get("debug") === "pdf";
  const [tab, setTab] = useState<BuilderTab>("resume");
  const [data, setData] = useState<ResumeData>(defaultResumeData());
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(
    defaultCoverLetterData()
  );
  const [template, setTemplate] = useState("modern");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [uploadedResumeText, setUploadedResumeText] = useState("");
  const [certificateTexts, setCertificateTexts] = useState<string[]>([]);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeOcrProgress, setResumeOcrProgress] = useState<number | null>(
    null
  );
  const [certUploading, setCertUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [sectionLayout, setSectionLayout] = useState<SectionLayoutState>(
    defaultSectionLayout()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const refreshSuggestions = useCallback(
    (
      nextData: ResumeData,
      resumeText: string,
      certs: string[],
      uploadText: string
    ) => {
      setSuggestions(
        mergeSuggestions(
          generateImprovements(nextData),
          uploadText ? generateUploadAmendments(nextData, uploadText) : [],
          generateCertificateGaps(nextData, resumeText || uploadText, certs)
        )
      );
    },
    []
  );

  function handleResumeChange(next: ResumeData) {
    setData(next);
    refreshSuggestions(next, uploadedResumeText, certificateTexts, uploadedResumeText);
  }

  async function handleResumeUpload(file: File) {
    setResumeUploading(true);
    setResumeOcrProgress(isImageFile(file) ? 0 : null);
    const toastId = toast.loading(
      isImageFile(file)
        ? "Reading text from image (OCR)…"
        : "Extracting text from file…"
    );
    try {
      const rawText = await extractFile(file, (p) =>
        setResumeOcrProgress(Math.round(p * 100))
      );
      const parsed = parseTextToResume(rawText);
      const merged = mergeParsedIntoResume(data, parsed);
      const fieldCount = countParsedFields(parsed);

      setData(merged);
      setUploadedResumeText(rawText);
      refreshSuggestions(merged, rawText, certificateTexts, rawText);

      if (fieldCount > 0) {
        toast.success(
          `Imported ${fieldCount} item(s) from your CV into the form and preview.`,
          { id: toastId }
        );
      } else {
        toast.warning(
          "Text was read but we could not map sections automatically. Check suggestions or edit the form.",
          { id: toastId, duration: 8000 }
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not read this file";
      toast.error(message, { id: toastId });
    } finally {
      setResumeUploading(false);
      setResumeOcrProgress(null);
    }
  }

  async function handleCertificateUpload(file: File) {
    setCertUploading(true);
    try {
      const rawText = await extractFile(file);
      const certs = [...certificateTexts, rawText];
      setCertificateTexts(certs);
      refreshSuggestions(data, uploadedResumeText, certs, uploadedResumeText);
      toast.success("Certificate text added for comparison");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not read certificate file";
      toast.error(message);
    } finally {
      setCertUploading(false);
    }
  }

  function handleTabChange(next: BuilderTab) {
    if (next === "cover" && !coverLetter.applicantName && data.fullName) {
      setCoverLetter(
        coverLetterFromResume(data, coverLetter.roleAppliedFor)
      );
    }
    setTab(next);
  }

  function handleApprove(id: string) {
    const item = suggestions.find((s) => s.id === id);
    if (!item?.patch) return;
    const next = applyResumePatch(data, item.patch);
    setData(next);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    refreshSuggestions(next, uploadedResumeText, certificateTexts, uploadedResumeText);
  }

  function handleApproveAll() {
    let next = data;
    const applicable = suggestions.filter((s) => s.patch);
    for (const s of applicable) {
      if (s.patch) next = applyResumePatch(next, s.patch);
    }
    setData(next);
    setSuggestions((prev) => prev.filter((s) => !s.patch));
    refreshSuggestions(next, uploadedResumeText, certificateTexts, uploadedResumeText);
  }

  function handleDismiss(id: string) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, template }),
    });
    setSaving(false);
  }

  async function exportWord() {
    if (!canExportWord) return;
    setExportingWord(true);
    try {
      const { buildCoverLetterDocx, buildResumeDocx, downloadBlob } =
        await import("@/lib/export-resume-docx");
      const blob =
        tab === "cover"
          ? await buildCoverLetterDocx(coverLetter, template)
          : await buildResumeDocx(data, template);
      const filename =
        tab === "cover" ? "cover-letter.docx" : "resume.docx";
      downloadBlob(blob, filename);
      toast.success("Word document downloaded");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export Word document";
      toast.error(message);
    } finally {
      setExportingWord(false);
    }
  }

  const busyExport = downloading || exportingWord;

  async function download() {
    setDownloading(true);
    const filename = tab === "cover" ? "cover-letter.pdf" : "resume.pdf";
    const selector =
      tab === "cover"
        ? 'iframe[data-preview="cover"]'
        : 'iframe[data-preview="resume"]';
    const iframe = document.querySelector(selector) as HTMLIFrameElement | null;

    const docHtml =
      iframe?.contentDocument?.documentElement?.outerHTML?.trim() ?? "";
    const fallbackHtml =
      iframe?.srcdoc ??
      (iframe as HTMLIFrameElement & { srcDoc?: string })?.srcDoc ??
      "";
    const htmlPayload = docHtml.length >= 10 ? docHtml : fallbackHtml.trim();

    try {
      if (htmlPayload.length >= 10) {
        const server = await postServerPdf(htmlPayload, filename);
        if (server.ok) {
          toast.success("PDF downloaded");
          return;
        }
        if (server.reason === "error") {
          toast.error(server.message ?? "PDF export failed");
          return;
        }
        toast.warning(
          server.message ??
            "Server PDF unavailable — using browser export (may clip). Run: pnpm puppeteer:install",
          { duration: 12000 }
        );
      }

      if (iframe?.contentDocument?.body?.innerHTML?.trim()) {
        await exportIframeToPdf(iframe, filename);
      } else if (fallbackHtml.trim()) {
        await exportHtmlToPdf(fallbackHtml, filename);
      } else {
        throw new Error("Nothing to export yet");
      }
      toast.success("PDF downloaded");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      {pdfDebug && (
        <p className="mb-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground-secondary">
          PDF debug: preview uses the same print pack as server export; horizontal bands approximate
          A4 page breaks (compare with Print Preview for pagination).
        </p>
      )}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          CV / Resume Builder
        </h1>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {tab === "resume" && (
            <button
              type="button"
              onClick={save}
              disabled={saving || busyExport}
              className="btn"
            >
              {saving ? "Saving…" : "Save resume"}
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={busyExport}
            className="btn-primary"
          >
            {downloading
              ? "PDF…"
              : tab === "cover"
                ? "Download cover PDF"
                : "Download PDF"}
          </button>
          {canExportWord && (
            <button
              type="button"
              onClick={exportWord}
              disabled={busyExport}
              className="btn"
            >
              {exportingWord
                ? "Word…"
                : tab === "cover"
                  ? "Export cover Word"
                  : "Export Word"}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 lg:hidden">
        <BuilderTabs active={tab} onChange={handleTabChange} />
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="mt-3 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground-secondary"
        >
          {sidebarOpen ? "Hide editor panel" : "Show editor panel"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-10rem)]">
        <aside
          className={`w-full shrink-0 lg:w-[400px] lg:max-w-[420px] lg:border-r lg:border-border lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)] ${
            sidebarOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="space-y-6 pb-6 lg:pr-5">
            <div className="hidden lg:block">
              <BuilderTabs active={tab} onChange={handleTabChange} />
            </div>

            {tab === "resume" && (
              <>
                <TemplateSelector value={template} onChange={setTemplate} />
                <SectionControls
                  layout={sectionLayout}
                  onChange={setSectionLayout}
                />
              </>
            )}

            {tab === "resume" ? (
              <>
                <FileDropZone
                  title="Upload existing resume"
                  hint="PDF, DOCX, TXT, or a photo of your CV — text is imported into the form automatically (OCR for images)"
                  accept={FILE_ACCEPT}
                  loading={resumeUploading}
                  loadingDetail={
                    resumeOcrProgress !== null
                      ? `Reading image… ${resumeOcrProgress}%`
                      : undefined
                  }
                  onFile={handleResumeUpload}
                />

                <FileDropZone
                  title="Upload certificates"
                  hint="PDF or images — compared with your resume for missing dates and credentials"
                  accept="application/pdf,image/*"
                  loading={certUploading}
                  onFile={handleCertificateUpload}
                />

                {certificateTexts.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {certificateTexts.length} certificate(s) loaded in memory
                  </p>
                )}

                <SuggestionsPanel
                  suggestions={suggestions}
                  onApprove={handleApprove}
                  onDismiss={handleDismiss}
                  onApproveAll={handleApproveAll}
                />

                <ResumeForm data={data} onChange={handleResumeChange} />
              </>
            ) : (
              <CoverLetterForm data={coverLetter} onChange={setCoverLetter} />
            )}

            <Disclaimer />

            <div className="flex flex-wrap gap-2">
              {tab === "resume" && (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || busyExport}
                  className="btn"
                >
                  {saving ? "Saving…" : "Save resume"}
                </button>
              )}
              <button
                type="button"
                onClick={download}
                disabled={busyExport}
                className="btn-primary"
              >
                {downloading
                  ? "PDF…"
                  : tab === "cover"
                    ? "Download cover letter PDF"
                    : "Download resume PDF"}
              </button>
              {canExportWord && (
                <button
                  type="button"
                  onClick={exportWord}
                  disabled={busyExport}
                  className="btn"
                >
                  {exportingWord
                    ? "Word…"
                    : tab === "cover"
                      ? "Export cover letter Word"
                      : "Export resume Word"}
                </button>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-[520px] lg:min-h-0 lg:pl-6 lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-8rem)]">
          {tab === "resume" ? (
            <ResumePreview
              data={data}
              template={template}
              sectionLayout={sectionLayout}
              pdfDebug={pdfDebug}
            />
          ) : (
            <CoverLetterPreview
              data={coverLetter}
              template={template}
              pdfDebug={pdfDebug}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ResumeBuilderFallback() {
  return (
    <div className="rounded-xl border border-border bg-muted p-8 text-center text-muted-foreground">
      Loading resume builder…
    </div>
  );
}

type ResumeBuilderClientProps = {
  canExportWord?: boolean;
};

export function ResumeBuilderClient({
  canExportWord = false,
}: ResumeBuilderClientProps) {
  return (
    <Suspense fallback={<ResumeBuilderFallback />}>
      <ResumeBuilderScreen canExportWord={canExportWord} />
    </Suspense>
  );
}
