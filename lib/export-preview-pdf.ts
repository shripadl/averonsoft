import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_W_MM = 210;
const A4_H_MM = 297;
const MARGIN_MM = 10;
const CONTENT_W_MM = A4_W_MM - MARGIN_MM * 2;
const CONTENT_H_MM = A4_H_MM - MARGIN_MM * 2;
/** Use nearly full content height; atomic page units handle breaks (avoid shaving bands that clip text). */
const PRINTABLE_H_MM = CONTENT_H_MM * 0.995;
const EXPORT_WIDTH_PX = 794;
const CAPTURE_SCALE = 2;

const EXPORT_STYLE_ID = "resume-pdf-export-styles";

const BLOCK_ITEM_SELECTOR =
  "article, .tl-item, .exp-item, .edu-item, .edu-card, .card, p.exp-line";

/** Skills / links atoms — without these, entire Skills section is one slice and raster export clips mid-row. */
const SKILL_LINK_ATOM_SELECTOR =
  ".chip, .skill-cell, .skill-row, .link-item, .skills-list > li";

const EXPORT_CSS = `
  body.pdf-export {
    width: ${EXPORT_WIDTH_PX}px !important;
    max-width: ${EXPORT_WIDTH_PX}px !important;
    margin: 0 auto !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body.pdf-export section.sec {
    page-break-inside: auto;
    break-inside: auto;
  }
  body.pdf-export .tl-item,
  body.pdf-export .exp-item,
  body.pdf-export .edu-item,
  body.pdf-export .edu-card,
  body.pdf-export .card,
  body.pdf-export article {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  body.pdf-export .tl-item {
    position: relative !important;
    overflow: visible !important;
  }
  body.pdf-export .tl-marker {
    position: absolute !important;
    left: -7px !important;
    top: 6px !important;
  }
`;

function injectExportStyles(doc: Document) {
  if (doc.getElementById(EXPORT_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = EXPORT_STYLE_ID;
  style.textContent = EXPORT_CSS;
  doc.head.appendChild(style);
  doc.body.classList.add("pdf-export");
}

function waitForIframeDoc(iframe: HTMLIFrameElement): Promise<Document> {
  return new Promise((resolve, reject) => {
    const check = () => {
      const doc = iframe.contentDocument;
      if (doc?.body?.innerHTML?.trim()) return doc;
      return null;
    };

    const existing = check();
    if (existing) {
      resolve(existing);
      return;
    }

    const onLoad = () => {
      const doc = check();
      if (doc) resolve(doc);
      else reject(new Error("Preview document is empty"));
    };

    iframe.addEventListener("load", onLoad, { once: true });
    setTimeout(() => {
      iframe.removeEventListener("load", onLoad);
      const doc = check();
      if (doc) resolve(doc);
      else reject(new Error("Preview did not load in time"));
    }, 8000);
  });
}

type VerticalRange = { top: number; bottom: number };

function rangeOf(el: Element, bodyRect: DOMRect): VerticalRange {
  const r = el.getBoundingClientRect();
  return {
    top: Math.max(0, r.top - bodyRect.top),
    bottom: Math.max(0, r.bottom - bodyRect.top),
  };
}

function mergeRanges(a: VerticalRange, b: VerticalRange): VerticalRange {
  return {
    top: Math.min(a.top, b.top),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

/**
 * Atomic vertical bands: header, then per-section either whole section
 * (skills/summary) or h2+first item / each job or degree entry.
 */
function collectAtomicUnits(doc: Document): VerticalRange[] {
  const bodyRect = doc.body.getBoundingClientRect();
  const units: VerticalRange[] = [];

  const header = doc.body.querySelector("header");
  if (header) units.push(rangeOf(header, bodyRect));

  const sections = doc.body.querySelectorAll("section.sec");
  sections.forEach((sec) => {
    const h2 = sec.querySelector(":scope > h2");
    const secBody = sec.querySelector(":scope > .sec-body");

    if (secBody) {
      const blocks = secBody.querySelectorAll(`:scope > ${BLOCK_ITEM_SELECTOR}`);

      if (blocks.length > 0) {
        blocks.forEach((block, i) => {
          if (i === 0 && h2) {
            units.push(mergeRanges(rangeOf(h2, bodyRect), rangeOf(block, bodyRect)));
          } else {
            units.push(rangeOf(block, bodyRect));
          }
        });
        return;
      }

      const skillAtoms = secBody.querySelectorAll(SKILL_LINK_ATOM_SELECTOR);
      if (skillAtoms.length > 0) {
        skillAtoms.forEach((el, i) => {
          if (i === 0 && h2) {
            units.push(mergeRanges(rangeOf(h2, bodyRect), rangeOf(el, bodyRect)));
          } else {
            units.push(rangeOf(el, bodyRect));
          }
        });
        return;
      }

      units.push(rangeOf(sec, bodyRect));
      return;
    }

    const blockChildren = Array.from(sec.children).filter(
      (c) => c instanceof HTMLElement && c.tagName !== "H2"
    ) as HTMLElement[];

    if (h2 && blockChildren.length > 0) {
      blockChildren.forEach((child, i) => {
        if (i === 0) {
          units.push(mergeRanges(rangeOf(h2, bodyRect), rangeOf(child, bodyRect)));
        } else {
          units.push(rangeOf(child, bodyRect));
        }
      });
    } else {
      units.push(rangeOf(sec, bodyRect));
    }
  });

  if (!units.length) {
    units.push({ top: 0, bottom: doc.body.scrollHeight });
  }

  return units.filter((u) => u.bottom - u.top > 1);
}

type PageSlice = { startPx: number; endPx: number };

function packUnitsIntoPageSlices(
  units: VerticalRange[],
  pageHeightDocPx: number
): PageSlice[] {
  const slices: PageSlice[] = [];
  let groupStart = units[0].top;
  let groupEnd = units[0].bottom;

  for (let i = 1; i < units.length; i++) {
    const unit = units[i];
    const unitH = unit.bottom - unit.top;
    const nextEnd = unit.bottom;
    const nextSpan = nextEnd - groupStart;

    if (unitH > pageHeightDocPx) {
      if (groupEnd > groupStart) {
        slices.push({ startPx: groupStart, endPx: groupEnd });
      }
      slices.push({ startPx: unit.top, endPx: unit.bottom });
      groupStart = unit.bottom;
      groupEnd = unit.bottom;
      continue;
    }

    if (nextSpan > pageHeightDocPx && groupEnd > groupStart) {
      slices.push({ startPx: groupStart, endPx: groupEnd });
      groupStart = unit.top;
      groupEnd = unit.bottom;
    } else {
      groupEnd = nextEnd;
    }
  }

  if (groupEnd > groupStart) {
    slices.push({ startPx: groupStart, endPx: groupEnd });
  }

  return slices;
}

function buildPageSlices(doc: Document): PageSlice[] {
  const pageHeightDocPx = (PRINTABLE_H_MM / CONTENT_W_MM) * EXPORT_WIDTH_PX;
  const units = collectAtomicUnits(doc);
  return packUnitsIntoPageSlices(units, pageHeightDocPx);
}

async function captureFullBody(doc: Document): Promise<HTMLCanvasElement> {
  await new Promise((r) => requestAnimationFrame(() => r(undefined)));

  return html2canvas(doc.body, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: EXPORT_WIDTH_PX,
    windowWidth: EXPORT_WIDTH_PX,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      injectExportStyles(clonedDoc);
    },
  });
}

function cropCanvasRegion(
  source: HTMLCanvasElement,
  startDocPx: number,
  endDocPx: number
): HTMLCanvasElement {
  const start = Math.floor(startDocPx * CAPTURE_SCALE);
  const end = Math.ceil(endDocPx * CAPTURE_SCALE);
  const height = Math.max(1, Math.min(end - start, source.height - start));

  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, 0, start, source.width, height, 0, 0, source.width, height);
  return out;
}

/** Only splits when a single atomic unit is taller than one printed page */
function addRegionToPdf(
  pdf: jsPDF,
  region: HTMLCanvasElement,
  isFirstPdfPage: boolean
) {
  const pageHeightPx = Math.max(
    1,
    Math.floor((PRINTABLE_H_MM / CONTENT_W_MM) * region.width)
  );
  let offsetY = 0;
  let first = isFirstPdfPage;

  while (offsetY < region.height) {
    if (!first) pdf.addPage();
    first = false;

    const isLastChunk = offsetY + pageHeightPx >= region.height;
    /** No vertical "safety shave" — it was clipping descenders between slices. */
    const safetyCanvasPx = 0;
    const slicePx = Math.max(
      1,
      Math.min(pageHeightPx - safetyCanvasPx, region.height - offsetY)
    );

    if (!isLastChunk && slicePx < 8) {
      offsetY = region.height;
      break;
    }

    const slice = document.createElement("canvas");
    slice.width = region.width;
    slice.height = slicePx;
    const ctx = slice.getContext("2d");
    if (!ctx) break;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      region,
      0,
      offsetY,
      region.width,
      slicePx,
      0,
      0,
      region.width,
      slicePx
    );

    const sliceHmm = (slicePx * CONTENT_W_MM) / region.width;
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      MARGIN_MM,
      MARGIN_MM,
      CONTENT_W_MM,
      sliceHmm
    );
    offsetY += slicePx;
  }
}

async function exportDocumentToPdf(
  doc: Document,
  filename: string
): Promise<void> {
  injectExportStyles(doc);

  await new Promise((r) => requestAnimationFrame(() => r(undefined)));

  const slices = buildPageSlices(doc);
  const canvas = await captureFullBody(doc);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let isFirstPdfPage = true;

  for (const slice of slices) {
    const region = cropCanvasRegion(canvas, slice.startPx, slice.endPx);
    addRegionToPdf(pdf, region, isFirstPdfPage);
    isFirstPdfPage = false;
  }

  if (pdf.getNumberOfPages() === 0) {
    throw new Error("Nothing to export — preview is empty");
  }

  pdf.save(filename);
}

export async function exportIframeToPdf(
  iframe: HTMLIFrameElement,
  filename: string
): Promise<void> {
  const doc = await waitForIframeDoc(iframe);
  await exportDocumentToPdf(doc, filename);
}

export async function exportHtmlToPdf(
  html: string,
  filename: string
): Promise<void> {
  if (!html.trim()) {
    throw new Error("Nothing to export — preview is empty");
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "pdf-export");
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${EXPORT_WIDTH_PX}px;border:0;visibility:hidden;`;
  document.body.appendChild(iframe);
  iframe.srcdoc = html;

  try {
    await waitForIframeDoc(iframe);
    await exportDocumentToPdf(iframe.contentDocument!, filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
