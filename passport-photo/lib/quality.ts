import type { FaceBox, GovAudit, PhotoCheck } from "@passphoto/lib/types";
import { UK_MIN_PX } from "@passphoto/lib/uk-spec";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function readImage(image: HTMLImageElement): {
  data: Uint8ClampedArray;
  w: number;
  h: number;
} {
  const maxEdge = 900;
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const w = Math.max(8, Math.round(image.naturalWidth * scale));
  const h = Math.max(8, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(image, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h).data, w, h };
}

function pixel(
  data: Uint8ClampedArray,
  w: number,
  x: number,
  y: number,
): [number, number, number] {
  const i = (y * w + x) * 4;
  return [data[i]!, data[i + 1]!, data[i + 2]!];
}

function regionStats(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { mean: number; std: number; chroma: number; count: number } {
  const left = clamp(Math.floor(Math.min(x0, x1)), 0, w - 1);
  const right = clamp(Math.ceil(Math.max(x0, x1)), left + 1, w);
  const top = clamp(Math.floor(Math.min(y0, y1)), 0, h - 1);
  const bottom = clamp(Math.ceil(Math.max(y0, y1)), top + 1, h);
  let sum = 0;
  let sum2 = 0;
  let chroma = 0;
  let n = 0;
  for (let y = top; y < bottom; y += 2) {
    for (let x = left; x < right; x += 2) {
      const [r, g, b] = pixel(data, w, x, y);
      const yv = luma(r, g, b);
      sum += yv;
      sum2 += yv * yv;
      chroma += Math.abs(r - g) + Math.abs(g - b);
      n += 1;
    }
  }
  if (!n) return { mean: 0, std: 0, chroma: 0, count: 0 };
  const mean = sum / n;
  return {
    mean,
    std: Math.sqrt(Math.max(0, sum2 / n - mean * mean)),
    chroma: chroma / n,
    count: n,
  };
}

function laplacianVar(
  data: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const rw = clamp(Math.floor(x1 - x0), 16, 220);
  const rh = clamp(Math.floor(y1 - y0), 16, 220);
  const left = clamp(Math.floor(x0), 1, srcW - 3);
  const top = clamp(Math.floor(y0), 1, srcH - 3);
  const gray = new Float32Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    const sy = clamp(top + Math.floor((y * (y1 - y0)) / rh), 1, srcH - 2);
    for (let x = 0; x < rw; x++) {
      const sx = clamp(left + Math.floor((x * (x1 - x0)) / rw), 1, srcW - 2);
      gray[y * rw + x] = luma(...pixel(data, srcW, sx, sy));
    }
  }
  let sum = 0;
  let sum2 = 0;
  let n = 0;
  for (let y = 1; y < rh - 1; y++) {
    for (let x = 1; x < rw - 1; x++) {
      const c = gray[y * rw + x]!;
      const L =
        4 * c -
        gray[y * rw + x - 1]! -
        gray[y * rw + x + 1]! -
        gray[(y - 1) * rw + x]! -
        gray[(y + 1) * rw + x]!;
      sum += L;
      sum2 += L * L;
      n += 1;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return sum2 / n - mean * mean;
}

function redEyeScore(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
): number {
  let hit = 0;
  let n = 0;
  const r = Math.max(3, Math.round(radius));
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > r * r) continue;
      const [red, g, b] = pixel(data, w, x, y);
      n += 1;
      if (red > 140 && red > g * 1.45 && red > b * 1.45 && g < 110) hit += 1;
    }
  }
  return n ? hit / n : 0;
}

function check(
  id: string,
  label: string,
  status: PhotoCheck["status"],
  detail: string,
  canImprove: boolean,
): PhotoCheck {
  return { id, label, status, detail, canImprove };
}

/**
 * Approximate the published GOV.UK digital photo rules on the original file.
 * This is not the live HMPO checker.
 */
export function auditGovUkRules(image: HTMLImageElement, face: FaceBox): GovAudit {
  const { data, w, h } = readImage(image);
  const sx = w / image.naturalWidth;
  const sy = h / image.naturalHeight;
  const pad = Math.max(8, (face.rightX - face.leftX) * sx * 0.15);
  const faceL = face.leftX * sx - pad;
  const faceR = face.rightX * sx + pad;
  const faceT = face.crown.y * sy - pad * 0.4;
  const faceB = face.chin.y * sy + pad * 0.3;
  const faceWpx = (face.rightX - face.leftX) * sx;
  const faceHpxOrig = face.chin.y - face.crown.y;

  const faceStats = regionStats(data, w, h, faceL, faceT, faceR, faceB);
  const sharp = laplacianVar(data, w, h, faceL, faceT, faceR, faceB);
  const eyeR = Math.max(6, faceWpx * 0.12);
  const leftEye = { x: face.leftX * sx + faceWpx * 0.22, y: face.eyeY * sy };
  const rightEye = { x: face.rightX * sx - faceWpx * 0.22, y: face.eyeY * sy };
  const eyeSharp =
    (laplacianVar(
      data,
      w,
      h,
      leftEye.x - eyeR,
      leftEye.y - eyeR,
      leftEye.x + eyeR,
      leftEye.y + eyeR,
    ) +
      laplacianVar(
        data,
        w,
        h,
        rightEye.x - eyeR,
        rightEye.y - eyeR,
        rightEye.x + eyeR,
        rightEye.y + eyeR,
      )) /
    2;

  const corner = 0.18;
  const bgTL = regionStats(data, w, h, 0, 0, w * corner, h * corner);
  const bgTR = regionStats(data, w, h, w * (1 - corner), 0, w, h * corner);
  const bgBL = regionStats(data, w, h, 0, h * (1 - corner), w * corner, h);
  const bgBR = regionStats(data, w, h, w * (1 - corner), h * (1 - corner), w, h);
  const bgStd = (bgTL.std + bgTR.std + bgBL.std + bgBR.std) / 4;
  const bgMean = (bgTL.mean + bgTR.mean + bgBL.mean + bgBR.mean) / 4;
  const bgChroma = (bgTL.chroma + bgTR.chroma + bgBL.chroma + bgBR.chroma) / 4;

  const cheekL = regionStats(
    data,
    w,
    h,
    face.leftX * sx,
    face.eyeY * sy + faceWpx * 0.15,
    face.centerX * sx - faceWpx * 0.05,
    face.chin.y * sy - faceWpx * 0.1,
  );
  const cheekR = regionStats(
    data,
    w,
    h,
    face.centerX * sx + faceWpx * 0.05,
    face.eyeY * sy + faceWpx * 0.15,
    face.rightX * sx,
    face.chin.y * sy - faceWpx * 0.1,
  );
  const cheekDelta = Math.abs(cheekL.mean - cheekR.mean);

  const red =
    redEyeScore(data, w, h, leftEye.x, leftEye.y, eyeR * 0.7) +
    redEyeScore(data, w, h, rightEye.x, rightEye.y, eyeR * 0.7);

  const yaw = Math.abs(face.yaw);
  const pitch = Math.abs(face.pitch);
  const smile = face.expression.smile;
  const jaw = face.expression.jawOpen;

  const sourceOk =
    image.naturalWidth >= UK_MIN_PX.width && image.naturalHeight >= UK_MIN_PX.height;

  const checks: PhotoCheck[] = [
    check(
      "source-size",
      "Source resolution",
      sourceOk ? "pass" : "fail",
      sourceOk
        ? `Upload is ${image.naturalWidth}×${image.naturalHeight} px.`
        : `Upload is ${image.naturalWidth}×${image.naturalHeight} px. GOV.UK needs at least ${UK_MIN_PX.width}×${UK_MIN_PX.height}. Take a new photo; enlarging will not add detail.`,
      false,
    ),
    check(
      "focus",
      "Clear and in focus",
      sharp < 72 || eyeSharp < 55 ? "fail" : "pass",
      sharp < 72 || eyeSharp < 55
        ? "The face or eyes look soft or low-detail. GOV.UK rejects photos that are not in focus. This cannot be sharpened reliably — retake with better light and a steady camera."
        : "Face and eyes look reasonably sharp on this device.",
      false,
    ),
    check(
      "face-pixels",
      "Face detail",
      faceHpxOrig < 240 ? "fail" : faceHpxOrig < 320 ? "warn" : "pass",
      faceHpxOrig < 240
        ? "The face is too small in the frame for a quality digital photo. Move closer and retake."
        : `Chin-to-crown is about ${Math.round(faceHpxOrig)} px in the original.`,
      false,
    ),
    check(
      "colour",
      "In colour",
      faceStats.chroma < 10 ? "fail" : "pass",
      faceStats.chroma < 10
        ? "The portrait looks greyscale or very washed out. GOV.UK requires a colour photo."
        : "Colour information is present.",
      false,
    ),
    check(
      "exposure",
      "Face lighting",
      faceStats.mean < 48 || faceStats.mean > 230 ? "fail" : faceStats.mean < 70 ? "warn" : "pass",
      faceStats.mean < 48
        ? "The face is too dark. Retake facing a window or even indoor light. Brightening in software often fails the official checker."
        : faceStats.mean > 230
          ? "The face is blown out. Retake without direct flash on the skin."
          : "Face brightness looks usable.",
      false,
    ),
    check(
      "shadows",
      "No shadows on the face",
      cheekDelta > 28 ? "fail" : cheekDelta > 18 ? "warn" : "pass",
      cheekDelta > 28
        ? "One side of the face is much darker than the other. GOV.UK asks for no shadows on the face. Retake with light in front of you."
        : "Cheek lighting is reasonably even.",
      false,
    ),
    check(
      "background",
      "Plain light background",
      bgStd > 22 || bgMean < 140 ? "fail" : bgStd > 14 ? "warn" : "pass",
      bgStd > 22
        ? "The wall looks patterned or uneven (texture, dots, objects). This tool can replace it with a plain cream fill."
        : bgMean < 140
          ? "The background looks too dark. A plain light fill can be applied."
          : "Background looks fairly plain and light.",
      true,
    ),
    check(
      "contrast",
      "Contrast with background",
      Math.abs(faceStats.mean - bgMean) < 16 && bgStd < 18 ? "warn" : "pass",
      Math.abs(faceStats.mean - bgMean) < 16
        ? "Face and background are a similar brightness. A lighter plain background can improve contrast."
        : "Face stands out from the sampled background.",
      true,
    ),
    check(
      "people",
      "Only one person",
      face.faceCount === 1 ? "pass" : "fail",
      face.faceCount === 1
        ? "A single face was detected."
        : `${face.faceCount} faces detected. GOV.UK requires nobody else in the photo.`,
      false,
    ),
    check(
      "glasses",
      "No glasses",
      face.glassesLikely ? "fail" : "pass",
      face.glassesLikely
        ? "Glasses or lens glare look present. Remove them and retake (unless GOV.UK medical rules apply)."
        : "No glasses detected.",
      false,
    ),
    check(
      "eyes",
      "Eyes open and looking at the camera",
      !face.eyesOpenLikely || face.expression.lookAway > 0.42 ? "fail" : "pass",
      !face.eyesOpenLikely
        ? "Eyes look closed or nearly closed. Retake with both eyes open."
        : face.expression.lookAway > 0.42
          ? "Gaze looks off-camera. Look straight at the lens and retake."
          : "Eyes look open and toward the camera.",
      false,
    ),
    check(
      "expression",
      "Plain expression, mouth closed",
      jaw > 0.32 || smile > 0.38 ? "fail" : smile > 0.22 ? "warn" : "pass",
      jaw > 0.32 || smile > 0.38
        ? "Mouth looks open or the expression is not plain. Close your mouth, relax your face, and retake."
        : "Expression looks sufficiently plain.",
      false,
    ),
    check(
      "pose",
      "Facing forwards",
      yaw > 0.16 || pitch > 0.18 ? "fail" : yaw > 0.1 ? "warn" : "pass",
      yaw > 0.16 || pitch > 0.18
        ? "The head looks turned or tilted. Face the camera squarely and retake. Pose cannot be fixed by cropping."
        : "Head pose looks roughly frontal.",
      false,
    ),
    check(
      "red-eye",
      "No red-eye",
      red > 0.08 ? "fail" : "pass",
      red > 0.08
        ? "Red-eye looks present. Retake without flash or with bounce lighting. Do not edit it out in software."
        : "No strong red-eye signal in the irises.",
      false,
    ),
    check(
      "bg-colour",
      "Background not strongly coloured",
      bgChroma > 38 && bgStd > 10 ? "warn" : "pass",
      bgChroma > 38
        ? "Background colour is strong. A cream/light-grey replacement may help."
        : "Background colour is muted.",
      true,
    ),
  ];

  const blockers = checks.filter((c) => c.status === "fail" && !c.canImprove);
  const fixableFails = checks.filter((c) => c.status === "fail" && c.canImprove);

  if (blockers.length) {
    return {
      verdict: "reject",
      headline: "This photo cannot be fixed here — retake it",
      summary:
        "GOV.UK rejects files that are soft, poorly lit, or posed incorrectly. Cropping or changing the background will not repair that. The official site uses its own checker; this list follows the published rules as closely as a browser tool can.",
      checks,
    };
  }
  if (fixableFails.length || checks.some((c) => c.status === "warn" && c.canImprove)) {
    return {
      verdict: "improve",
      headline: "The photo can be improved (background / size)",
      summary:
        "Face quality looks usable. A patterned or dark wall can be replaced with a plain light background, then exported at 600×750. Lighting, focus, and pose will stay as they are.",
      checks,
    };
  }
  return {
    verdict: "ok",
    headline: "Published quality checks look OK",
    summary:
      "Measurable GOV.UK rules we can test did not fail. HM Passport Office can still reject the file. Download is a formatting aid, not official approval.",
    checks,
  };
}
