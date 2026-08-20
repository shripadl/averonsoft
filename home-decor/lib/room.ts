/** Room footprint and placed furniture — all lengths in metres. */

export type Vec2 = { x: number; z: number };

export type RoomMode = "rect" | "polygon";

export type RoomSpec = {
  mode: RoomMode;
  /** Rectangle width (X). Ignored when mode is polygon. */
  width: number;
  /** Rectangle depth (Z). Ignored when mode is polygon. */
  depth: number;
  ceilingHeight: number;
  /** Closed polygon in metres, counter-clockwise preferred. Min 3 points. */
  outline: Vec2[];
};

export type PlacedItem = {
  id: string;
  catalogId: string;
  /** Center of footprint on floor plane. */
  x: number;
  z: number;
  /** Yaw in degrees. */
  rotationY: number;
};

export function rectOutline(width: number, depth: number): Vec2[] {
  const hx = width / 2;
  const hz = depth / 2;
  return [
    { x: -hx, z: -hz },
    { x: hx, z: -hz },
    { x: hx, z: hz },
    { x: -hx, z: hz },
  ];
}

export function defaultRoom(): RoomSpec {
  const width = 4;
  const depth = 3.5;
  return {
    mode: "rect",
    width,
    depth,
    ceilingHeight: 2.4,
    outline: rectOutline(width, depth),
  };
}

export function polygonArea(points: Vec2[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    sum += a.x * b.z - b.x * a.z;
  }
  return Math.abs(sum) / 2;
}

export function polygonBounds(points: Vec2[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  return { minX, maxX, minZ, maxZ };
}

/** Point-in-polygon (ray cast). */
export function pointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersect =
      pi.z > point.z !== pj.z > point.z &&
      point.x <
        ((pj.x - pi.x) * (point.z - pi.z)) / (pj.z - pi.z + Number.EPSILON) +
          pi.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

export type Aabb2 = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

/** Axis-aligned footprint after yaw (bounding box of rotated rectangle). */
export function rotatedFootprintAabb(
  cx: number,
  cz: number,
  width: number,
  depth: number,
  rotationYDeg: number,
): Aabb2 {
  const rad = (rotationYDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hx = width / 2;
  const hz = depth / 2;
  const corners: Vec2[] = [
    { x: -hx, z: -hz },
    { x: hx, z: -hz },
    { x: hx, z: hz },
    { x: -hx, z: hz },
  ].map((c) => ({
    x: cx + c.x * cos - c.z * sin,
    z: cz + c.x * sin + c.z * cos,
  }));
  return polygonBounds(corners);
}

export function aabbOverlap(a: Aabb2, b: Aabb2, epsilon = 0.001): boolean {
  return !(
    a.maxX < b.minX + epsilon ||
    a.minX > b.maxX - epsilon ||
    a.maxZ < b.minZ + epsilon ||
    a.minZ > b.maxZ - epsilon
  );
}

export function aabbFullyInside(inner: Aabb2, outline: Vec2[]): boolean {
  const corners: Vec2[] = [
    { x: inner.minX, z: inner.minZ },
    { x: inner.maxX, z: inner.minZ },
    { x: inner.maxX, z: inner.maxZ },
    { x: inner.minX, z: inner.maxZ },
  ];
  return corners.every((c) => pointInPolygon(c, outline));
}
