/** Internal scene units are always metres. */

export type LengthUnit = "m" | "cm" | "ft" | "in";

const M_PER: Record<LengthUnit, number> = {
  m: 1,
  cm: 0.01,
  ft: 0.3048,
  in: 0.0254,
};

export function toMetres(value: number, unit: LengthUnit): number {
  return value * M_PER[unit];
}

export function fromMetres(metres: number, unit: LengthUnit): number {
  return metres / M_PER[unit];
}

export function formatLength(
  metres: number,
  unit: LengthUnit,
  digits = 2,
): string {
  const v = fromMetres(metres, unit);
  const label = unit === "ft" ? "ft" : unit === "in" ? "in" : unit;
  return `${v.toFixed(digits)} ${label}`;
}

export function formatArea(
  sqMetres: number,
  unit: LengthUnit,
  digits = 2,
): string {
  if (unit === "ft" || unit === "in") {
    const sqFt = sqMetres / (0.3048 * 0.3048);
    return `${sqFt.toFixed(digits)} ft²`;
  }
  if (unit === "cm") {
    return `${(sqMetres * 10_000).toFixed(0)} cm²`;
  }
  return `${sqMetres.toFixed(digits)} m²`;
}

export const UNIT_LABELS: Record<LengthUnit, string> = {
  m: "Metres",
  cm: "Centimetres",
  ft: "Feet",
  in: "Inches",
};

/** Snap a metre value to the active grid (default 5 cm). */
export function snapMetres(value: number, step = 0.05): number {
  return Math.round(value / step) * step;
}
