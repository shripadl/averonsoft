import { canvasToBlob } from "@passphoto/lib/image";

export async function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality = 0.92,
): Promise<Blob> {
  return canvasToBlob(canvas, "image/jpeg", quality);
}

/** 4×6" photo paper at 300 dpi — six copies of the digital 4:5 photo. */
export const PRINT_SHEET_PX = { width: 1200, height: 1800 } as const;

export async function makePrintSheet(photo: HTMLCanvasElement): Promise<Blob> {
  const sheetW = PRINT_SHEET_PX.width;
  const sheetH = PRINT_SHEET_PX.height;
  const cols = 2;
  const rows = 3;
  const gap = 24;
  const margin = 48;
  const photoAspect = photo.width / photo.height;

  const availW = sheetW - margin * 2 - gap * (cols - 1);
  const availH = sheetH - margin * 2 - gap * (rows - 1);

  let cellW = availW / cols;
  let cellH = cellW / photoAspect;
  if (cellH * rows > availH) {
    cellH = availH / rows;
    cellW = cellH * photoAspect;
  }

  const gridW = cellW * cols + gap * (cols - 1);
  const gridH = cellH * rows + gap * (rows - 1);
  const originX = (sheetW - gridW) / 2;
  const originY = (sheetH - gridH) / 2;

  const sheet = document.createElement("canvas");
  sheet.width = sheetW;
  sheet.height = sheetH;
  const ctx = sheet.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheetW, sheetH);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = originX + c * (cellW + gap);
      const y = originY + r * (cellH + gap);
      ctx.drawImage(photo, x, y, cellW, cellH);
      ctx.strokeStyle = "#d5d0c8";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    }
  }

  return canvasToBlob(sheet, "image/jpeg", 0.92);
}
