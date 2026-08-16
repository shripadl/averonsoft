"use client";

import {
  AREA_UNITS,
  LENGTH_UNITS,
  convertArea,
  convertLength,
  formatNumber,
  measureAreaSqMeters,
  measurePerimeterMeters,
  type AreaUnit,
  type LengthUnit,
  type LngLat,
} from "@areamap/lib/measure";

type ResultsPanelProps = {
  points: LngLat[];
  closed: boolean;
  areaUnit: AreaUnit;
  lengthUnit: LengthUnit;
  onAreaUnit: (u: AreaUnit) => void;
  onLengthUnit: (u: LengthUnit) => void;
};

export function ResultsPanel({
  points,
  closed,
  areaUnit,
  lengthUnit,
  onAreaUnit,
  onLengthUnit,
}: ResultsPanelProps) {
  const sqM =
    closed && points.length >= 3 ? measureAreaSqMeters(points) : null;
  const perimeterM =
    closed && points.length >= 3
      ? measurePerimeterMeters(points)
      : points.length >= 2
        ? measurePerimeterMeters(points)
        : null;

  const areaValue =
    sqM == null ? null : convertArea(Math.abs(sqM), areaUnit);
  const lengthValue =
    perimeterM == null ? null : convertLength(perimeterM, lengthUnit);

  return (
    <aside className="areamap-panel areamap-results" aria-live="polite">
      <h2 className="areamap-panel__title">Measurement</h2>

      <div className="areamap-stat">
        <div className="areamap-stat__label-row">
          <span className="areamap-stat__label">Area</span>
          <label className="areamap-select-wrap">
            <span className="sr-only">Area unit</span>
            <select
              className="areamap-select"
              value={areaUnit}
              onChange={(e) => onAreaUnit(e.target.value as AreaUnit)}
            >
              {AREA_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="areamap-stat__value">
          {areaValue == null ? "—" : formatNumber(areaValue)}
          {areaValue != null ? (
            <span className="areamap-stat__unit">
              {AREA_UNITS.find((u) => u.id === areaUnit)?.label}
            </span>
          ) : null}
        </p>
        {!closed && points.length > 0 ? (
          <p className="areamap-hint">Close the shape to lock area.</p>
        ) : null}
      </div>

      <div className="areamap-stat">
        <div className="areamap-stat__label-row">
          <span className="areamap-stat__label">
            {closed ? "Perimeter" : "Path length"}
          </span>
          <label className="areamap-select-wrap">
            <span className="sr-only">Length unit</span>
            <select
              className="areamap-select"
              value={lengthUnit}
              onChange={(e) => onLengthUnit(e.target.value as LengthUnit)}
            >
              {LENGTH_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="areamap-stat__value">
          {lengthValue == null ? "—" : formatNumber(lengthValue)}
          {lengthValue != null ? (
            <span className="areamap-stat__unit">
              {LENGTH_UNITS.find((u) => u.id === lengthUnit)?.label}
            </span>
          ) : null}
        </p>
      </div>

      <p className="areamap-meta">
        {points.length} point{points.length === 1 ? "" : "s"}
        {closed ? " · closed" : ""}
      </p>
    </aside>
  );
}
