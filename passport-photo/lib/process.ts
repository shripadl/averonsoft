import { compositeOnColor, removeBackgroundToCanvas } from "@passphoto/lib/background";
import { cropFromFace, drawCrop, type CropNudge } from "@passphoto/lib/crop";
import { canvasToJpeg, makePrintSheet } from "@passphoto/lib/export";
import { detectFace } from "@passphoto/lib/face";
import { auditGovUkRules } from "@passphoto/lib/quality";
import { DEFAULT_BACKGROUND, UK_DIGITAL_PX, UK_JPEG_MAX_BYTES, UK_JPEG_MIN_BYTES } from "@passphoto/lib/uk-spec";
import type { FaceBox, GovAudit, PhotoCheck, ProcessStep } from "@passphoto/lib/types";

export const PROCESS_STEPS: ProcessStep[] = [
  { id: "face", label: "Finding face" },
  { id: "audit", label: "Checking GOV.UK photo rules" },
  { id: "crop", label: "Cropping to 600×750 px" },
  { id: "bg", label: "Replacing a patterned background" },
  { id: "export", label: "Encoding a JPEG for download" },
];

export type ProcessOutput = {
  photoCanvas: HTMLCanvasElement | null;
  jpeg: Blob | null;
  printSheet: Blob | null;
  checks: PhotoCheck[];
  audit: GovAudit;
  face: FaceBox;
  processed: boolean;
};

function withFileSizeCheck(audit: GovAudit, jpegBytes: number): GovAudit {
  const jpegOk = jpegBytes >= UK_JPEG_MIN_BYTES && jpegBytes <= UK_JPEG_MAX_BYTES;
  const extra: PhotoCheck = {
    id: "file",
    label: "JPEG file size",
    status: jpegOk ? "pass" : "warn",
    canImprove: false,
    detail: jpegOk
      ? `${Math.round(jpegBytes / 1024)} KB — within the 50 KB–10 MB band.`
      : `${Math.round(jpegBytes / 1024)} KB. Online applications usually need 50 KB–10 MB.`,
  };
  return { ...audit, checks: [...audit.checks, extra] };
}

export async function processPassportPhoto(
  image: HTMLImageElement,
  opts: {
    replaceBackground: boolean;
    background: string;
    nudge: CropNudge;
    onStep?: (index: number) => void;
  },
): Promise<ProcessOutput> {
  opts.onStep?.(0);
  const face = await detectFace(image);

  opts.onStep?.(1);
  const audit = auditGovUkRules(image, face);

  if (audit.verdict === "reject") {
    return {
      photoCanvas: null,
      jpeg: null,
      printSheet: null,
      checks: audit.checks,
      audit,
      face,
      processed: false,
    };
  }

  opts.onStep?.(2);
  const crop = cropFromFace(
    image.naturalWidth,
    image.naturalHeight,
    face,
    opts.nudge,
  );
  let photo = drawCrop(
    image,
    crop,
    UK_DIGITAL_PX.width,
    UK_DIGITAL_PX.height,
  );

  opts.onStep?.(3);
  const shouldReplaceBg =
    opts.replaceBackground &&
    (audit.verdict === "improve" ||
      audit.checks.some((c) => c.canImprove && c.status !== "pass"));
  if (shouldReplaceBg) {
    const cutout = await removeBackgroundToCanvas(photo);
    photo = compositeOnColor(cutout, opts.background || DEFAULT_BACKGROUND);
  }

  opts.onStep?.(4);
  const jpeg = await canvasToJpeg(photo);
  const printSheet = await makePrintSheet(photo);
  const finalAudit = withFileSizeCheck(audit, jpeg.size);

  return {
    photoCanvas: photo,
    jpeg,
    printSheet,
    checks: finalAudit.checks,
    audit: finalAudit,
    face,
    processed: true,
  };
}
