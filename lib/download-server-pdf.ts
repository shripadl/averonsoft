export type PostPdfOutcome =
  | { ok: true }
  | { ok: false; reason: "unavailable"; message?: string; detail?: string }
  | { ok: false; reason: "error"; message?: string; detail?: string };

/**
 * POST HTML to /api/pdf (Chromium vector PDF).
 * `unavailable` = 503 — caller may fall back to client-side raster export.
 */
export async function postServerPdf(
  html: string,
  filename: string
): Promise<PostPdfOutcome> {
  const trimmed = html.trim();
  if (trimmed.length < 10) {
    return { ok: false, reason: "error", message: "Nothing to export" };
  }

  const res = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: trimmed }),
  });

  if (res.status === 503 || !res.ok) {
    let message: string | undefined;
    let detail: string | undefined;
    try {
      const j: unknown = await res.json();
      if (j && typeof j === "object") {
        const body = j as { error?: unknown; detail?: unknown };
        if (typeof body.error === "string") message = body.error;
        if (typeof body.detail === "string") detail = body.detail;
      }
    } catch {
      /* ignore */
    }
    if (res.status === 503) {
      return { ok: false, reason: "unavailable", message, detail };
    }
    return { ok: false, reason: "error", message, detail };
  }

  const blob = await res.blob();
  if (!blob.size) {
    return { ok: false, reason: "error", message: "Empty PDF response" };
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return { ok: true };
}
