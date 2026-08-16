import area from "@turf/area";
import length from "@turf/length";
import { lineString, polygon } from "@turf/helpers";

/** Lon/lat ring. First and last may differ; closed automatically for area. */
export type LngLat = [number, number];

export type AreaUnit = "m2" | "km2" | "ha" | "acre" | "ft2";
export type LengthUnit = "m" | "km" | "ft" | "mi";

export const AREA_UNITS: { id: AreaUnit; label: string }[] = [
  { id: "m2", label: "m²" },
  { id: "km2", label: "km²" },
  { id: "ha", label: "ha" },
  { id: "acre", label: "acre" },
  { id: "ft2", label: "ft²" },
];

export const LENGTH_UNITS: { id: LengthUnit; label: string }[] = [
  { id: "m", label: "m" },
  { id: "km", label: "km" },
  { id: "ft", label: "ft" },
  { id: "mi", label: "mi" },
];

const SQ_M_TO: Record<AreaUnit, number> = {
  m2: 1,
  km2: 1 / 1_000_000,
  ha: 1 / 10_000,
  acre: 1 / 4046.8564224,
  ft2: 10.76391041671,
};

const M_TO: Record<LengthUnit, number> = {
  m: 1,
  km: 1 / 1000,
  ft: 3.2808398950131,
  mi: 1 / 1609.344,
};

export function convertArea(sqMeters: number, unit: AreaUnit): number {
  return sqMeters * SQ_M_TO[unit];
}

export function convertLength(meters: number, unit: LengthUnit): number {
  return meters * M_TO[unit];
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (abs >= 1) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    });
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  });
}

function closedRing(points: LngLat[]): LngLat[] {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

/** Geodesic area in square meters (Turf / Earth ellipsoid approximation). */
export function measureAreaSqMeters(points: LngLat[]): number | null {
  if (points.length < 3) return null;
  try {
    return area(polygon([closedRing(points)]));
  } catch {
    return null;
  }
}

/** Geodesic perimeter in meters for a closed ring. */
export function measurePerimeterMeters(points: LngLat[]): number | null {
  if (points.length < 2) return null;
  try {
    const ring = points.length >= 3 ? closedRing(points) : points;
    return length(lineString(ring), { units: "meters" });
  } catch {
    return null;
  }
}
