// NO AI — only raw text extraction from PDF/images/documents

import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

function extension(filename?: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

type FileKind = "txt" | "docx" | "pdf" | "image" | "unknown";

function detectKind(
  buffer: Buffer,
  filename?: string,
  mimeType?: string
): FileKind {
  const mime = (mimeType ?? "").toLowerCase();
  const ext = extension(filename);

  if (mime.includes("pdf") || buffer.slice(0, 5).toString("ascii") === "%PDF") {
    return "pdf";
  }
  if (
    mime.includes("wordprocessingml") ||
    mime.includes("msword") ||
    ext === "docx"
  ) {
    return "docx";
  }
  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "tif", "heic", "heif"].includes(
      ext
    )
  ) {
    return "image";
  }
  if (
    mime.startsWith("text/") ||
    ext === "txt" ||
    ext === "text" ||
    ext === "md"
  ) {
    return "txt";
  }
  // PNG / JPEG magic bytes when extension missing
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image";
  if (ext === "pdf") return "pdf";
  return "unknown";
}

async function ocrImageBuffer(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text?.trim() ?? "";
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename?: string,
  mimeType?: string
): Promise<string> {
  const kind = detectKind(buffer, filename, mimeType);

  if (kind === "txt") {
    return buffer.toString("utf-8");
  }

  if (kind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() ?? "";
  }

  if (kind === "pdf") {
    try {
      const pdf = await pdfParse(buffer);
      if (pdf.text?.trim().length > 10) return pdf.text;
    } catch {
      /* try OCR below for scanned PDFs */
    }
  }

  if (kind === "image" || kind === "unknown" || kind === "pdf") {
    try {
      const text = await ocrImageBuffer(buffer);
      if (text.length > 10) return text;
    } catch (err) {
      console.error("[extract] OCR failed:", err);
    }
  }

  if (kind === "pdf") {
    try {
      const pdf = await pdfParse(buffer);
      return pdf.text?.trim() ?? "";
    } catch {
      return "";
    }
  }

  return "";
}
