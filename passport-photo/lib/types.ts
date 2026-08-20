export type CheckStatus = "pass" | "warn" | "fail";

export type PhotoCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Failed rule that background/crop can reasonably address. */
  canImprove: boolean;
};

export type GovVerdict = "reject" | "improve" | "ok";

export type GovAudit = {
  verdict: GovVerdict;
  headline: string;
  summary: string;
  checks: PhotoCheck[];
};

export type ProcessStep = {
  id: string;
  label: string;
};

export type FaceBox = {
  /** Pixels in the source image. */
  chin: { x: number; y: number };
  crown: { x: number; y: number };
  centerX: number;
  leftX: number;
  rightX: number;
  eyeY: number;
  faceCount: number;
  eyesOpenLikely: boolean;
  glassesLikely: boolean;
  /** Nose offset vs eyes, as a fraction of face width. */
  yaw: number;
  pitch: number;
  expression: {
    smile: number;
    jawOpen: number;
    lookAway: number;
  };
};

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
