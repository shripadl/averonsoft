import {
  HEAD_RATIO_TARGET,
  UK_DIGITAL_PX,
} from "@passphoto/lib/uk-spec";
import type { CropRect, FaceBox } from "@passphoto/lib/types";

const ASPECT = UK_DIGITAL_PX.width / UK_DIGITAL_PX.height;

export type CropNudge = {
  /** Horizontal pan as a fraction of crop width (−0.2 … 0.2). */
  panX: number;
  /** Vertical pan as a fraction of crop height. */
  panY: number;
  /** Scale multiplier around the auto crop (0.85 … 1.2). */
  zoom: number;
};

export const DEFAULT_NUDGE: CropNudge = { panX: 0, panY: 0, zoom: 1 };

/**
 * Build a 4:5 crop (600×750) so chin-to-crown sits near the 29–34 mm print band.
 */
export function cropFromFace(
  imageWidth: number,
  imageHeight: number,
  face: FaceBox,
  nudge: CropNudge = DEFAULT_NUDGE,
): CropRect {
  const headH = Math.max(8, face.chin.y - face.crown.y);
  let cropH = (headH / HEAD_RATIO_TARGET) * nudge.zoom;
  let cropW = cropH * ASPECT;

  const maxScale = Math.min(imageWidth / cropW, imageHeight / cropH);
  if (maxScale < 1) {
    cropW *= maxScale;
    cropH *= maxScale;
  }

  let x = face.centerX - cropW / 2 + nudge.panX * cropW;
  // Small gap above the crown (GOV.UK: do not crop through the hair).
  let y = face.crown.y - cropH * 0.13 + nudge.panY * cropH;

  x = Math.min(Math.max(0, x), imageWidth - cropW);
  y = Math.min(Math.max(0, y), imageHeight - cropH);

  return { x, y, width: cropW, height: cropH };
}

export function drawCrop(
  source: HTMLImageElement | HTMLCanvasElement,
  crop: CropRect,
  outW: number,
  outH: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outW,
    outH,
  );
  return canvas;
}
