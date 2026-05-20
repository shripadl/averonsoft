"use client";

/**
 * OCR for resume/CV photos in the browser (avoids server worker issues in Next.js).
 */
export async function extractImageTextInBrowser(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(m.progress);
      }
    },
  });
  return result.data.text?.trim() ?? "";
}
