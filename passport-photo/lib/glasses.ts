type Landmark = { x: number; y: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function gray(data: Uint8ClampedArray, w: number, x: number, y: number): number {
  const i = (y * w + x) * 4;
  return 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
}

function regionStats(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { edge: number; mean: number; glare: number; count: number } {
  const left = clamp(Math.floor(Math.min(x0, x1)), 1, w - 2);
  const right = clamp(Math.ceil(Math.max(x0, x1)), left + 1, w - 1);
  const top = clamp(Math.floor(Math.min(y0, y1)), 1, h - 2);
  const bottom = clamp(Math.ceil(Math.max(y0, y1)), top + 1, h - 1);

  let edge = 0;
  let lum = 0;
  let glare = 0;
  let count = 0;

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const g = gray(data, w, x, y);
      const gx = Math.abs(g - gray(data, w, x + 1, y));
      const gy = Math.abs(g - gray(data, w, x, y + 1));
      edge += gx + gy;
      lum += g;
      if (g > 242) glare += 1;
      count += 1;
    }
  }

  return {
    edge: count ? edge / count : 0,
    mean: count ? lum / count : 0,
    glare: count ? glare / count : 0,
    count,
  };
}

/**
 * MediaPipe Face Landmarker has no glasses class. Infer frames from
 * rim edges around the eyes vs nearby skin (forehead).
 */
export function likelyWearingGlasses(
  image: HTMLImageElement,
  landmarks: Landmark[],
): boolean {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  if (w < 32 || h < 32 || landmarks.length < 400) return false;

  const px = (i: number) => {
    const p = landmarks[i];
    if (!p) return null;
    return { x: p.x * w, y: p.y * h };
  };

  const leftOuter = px(33);
  const leftInner = px(133);
  const rightOuter = px(263);
  const rightInner = px(362);
  const leftBrow = px(70);
  const rightBrow = px(300);
  if (!leftOuter || !rightOuter || !leftInner || !rightInner) return false;

  const eyeSpan = Math.hypot(rightOuter.x - leftOuter.x, rightOuter.y - leftOuter.y);
  if (eyeSpan < 24) return false;

  const eyeY = (leftOuter.y + rightOuter.y) / 2;
  const midX = (leftOuter.x + rightOuter.x) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const rimTop = eyeY - eyeSpan * 0.2;
  const rimBottom = eyeY - eyeSpan * 0.04;
  const skinTop = (leftBrow?.y ?? eyeY - eyeSpan * 0.42) - eyeSpan * 0.12;
  const skinBottom = (leftBrow?.y ?? eyeY - eyeSpan * 0.42) - eyeSpan * 0.02;

  const pad = eyeSpan * 0.08;
  const rim = regionStats(
    data,
    w,
    h,
    leftOuter.x - pad,
    rimTop,
    rightOuter.x + pad,
    rimBottom,
  );
  const skin = regionStats(
    data,
    w,
    h,
    leftOuter.x + pad,
    skinTop,
    rightOuter.x - pad,
    Math.max(skinBottom, skinTop + 4),
  );

  const leftLens = regionStats(
    data,
    w,
    h,
    leftOuter.x - pad,
    eyeY - eyeSpan * 0.12,
    leftInner.x + pad,
    eyeY + eyeSpan * 0.14,
  );
  const rightLens = regionStats(
    data,
    w,
    h,
    rightInner.x - pad,
    eyeY - eyeSpan * 0.12,
    rightOuter.x + pad,
    eyeY + eyeSpan * 0.14,
  );

  const cheek = regionStats(
    data,
    w,
    h,
    midX - eyeSpan * 0.12,
    eyeY + eyeSpan * 0.28,
    midX + eyeSpan * 0.12,
    eyeY + eyeSpan * 0.48,
  );

  const rimVsSkin = rim.edge / Math.max(skin.edge, 4);
  const glare = (leftLens.glare + rightLens.glare) / 2;
  const lensMean = (leftLens.mean + rightLens.mean) / 2;
  const darkLenses = cheek.mean > 20 && lensMean < cheek.mean * 0.48;

  const frames = rimVsSkin > 1.7 && rim.edge > 16;
  const glareOnLenses = glare > 0.055 && rimVsSkin > 1.25;

  return frames || glareOnLenses || darkLenses;
}

export const GLASSES_REJECT_MESSAGE =
  "Glasses detected. Take another photo with glasses removed. UK passport photos cannot normally be worn with glasses (except where GOV.UK allows this for medical reasons).";
