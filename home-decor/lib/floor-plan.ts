import type { Vec2 } from "@homedecor/lib/room";

/**
 * Floor-plan image calibration: two image points + known real distance
 * map pixel space → metres on the floor.
 */

export type ImagePoint = { u: number; v: number };

export type FloorPlanCalibration = {
  /** Object URL or data URL of the uploaded diagram. */
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  /** First calibration click in image pixels. */
  pointA: ImagePoint | null;
  /** Second calibration click in image pixels. */
  pointB: ImagePoint | null;
  /** Real-world distance between A and B (metres). */
  knownDistanceM: number;
};

export function emptyCalibration(): FloorPlanCalibration {
  return {
    imageUrl: "",
    naturalWidth: 0,
    naturalHeight: 0,
    pointA: null,
    pointB: null,
    knownDistanceM: 1,
  };
}

export function pixelsPerMetre(cal: FloorPlanCalibration): number | null {
  if (!cal.pointA || !cal.pointB || cal.knownDistanceM <= 0) return null;
  const dx = cal.pointB.u - cal.pointA.u;
  const dy = cal.pointB.v - cal.pointA.v;
  const pixelDist = Math.hypot(dx, dy);
  if (pixelDist < 1) return null;
  return pixelDist / cal.knownDistanceM;
}

export function isCalibrated(cal: FloorPlanCalibration): boolean {
  return pixelsPerMetre(cal) != null;
}

/**
 * Convert image pixel coords to room metres, centred on the image,
 * using calibration scale. Origin is image centre.
 */
export function imageToMetres(
  point: ImagePoint,
  cal: FloorPlanCalibration,
): Vec2 | null {
  const ppm = pixelsPerMetre(cal);
  if (!ppm) return null;
  const cx = cal.naturalWidth / 2;
  const cy = cal.naturalHeight / 2;
  return {
    x: (point.u - cx) / ppm,
    z: (point.v - cy) / ppm,
  };
}

export function metresToImage(
  point: Vec2,
  cal: FloorPlanCalibration,
): ImagePoint | null {
  const ppm = pixelsPerMetre(cal);
  if (!ppm) return null;
  return {
    u: cal.naturalWidth / 2 + point.x * ppm,
    v: cal.naturalHeight / 2 + point.z * ppm,
  };
}

/** World size of the full image once calibrated (metres). */
export function imageWorldSize(cal: FloorPlanCalibration): {
  width: number;
  depth: number;
} | null {
  const ppm = pixelsPerMetre(cal);
  if (!ppm) return null;
  return {
    width: cal.naturalWidth / ppm,
    depth: cal.naturalHeight / ppm,
  };
}
