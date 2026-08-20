"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FloorPlanCalibration, ImagePoint } from "@homedecor/lib/floor-plan";
import {
  emptyCalibration,
  imageToMetres,
  isCalibrated,
  pixelsPerMetre,
} from "@homedecor/lib/floor-plan";
import { fromMetres, toMetres, type LengthUnit } from "@homedecor/lib/units";
import type { Vec2 } from "@homedecor/lib/room";

type FloorPlanPanelProps = {
  unit: LengthUnit;
  calibration: FloorPlanCalibration;
  onChange: (next: FloorPlanCalibration) => void;
  onApplyOutline: (outline: Vec2[]) => void;
  onClear: () => void;
};

type TraceMode = "calibrate" | "trace";

export function FloorPlanPanel({
  unit,
  calibration,
  onChange,
  onApplyOutline,
  onClear,
}: FloorPlanPanelProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<TraceMode>("calibrate");
  const [trace, setTrace] = useState<ImagePoint[]>([]);
  const [knownDisplay, setKnownDisplay] = useState(() =>
    fromMetres(calibration.knownDistanceM, unit).toFixed(2),
  );

  useEffect(() => {
    setKnownDisplay(fromMetres(calibration.knownDistanceM, unit).toFixed(2));
  }, [calibration.knownDistanceM, unit]);

  const ppm = pixelsPerMetre(calibration);

  const onFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (calibration.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(calibration.imageUrl);
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onChange({
          ...emptyCalibration(),
          imageUrl: url,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          knownDistanceM: calibration.knownDistanceM || 1,
        });
        setTrace([]);
        setMode("calibrate");
      };
      img.src = url;
    },
    [calibration.imageUrl, calibration.knownDistanceM, onChange],
  );

  const clickOnImage = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const img = imgRef.current;
      if (!img || !calibration.imageUrl) return;
      const rect = img.getBoundingClientRect();
      const scaleX = calibration.naturalWidth / rect.width;
      const scaleY = calibration.naturalHeight / rect.height;
      const point: ImagePoint = {
        u: (e.clientX - rect.left) * scaleX,
        v: (e.clientY - rect.top) * scaleY,
      };

      if (mode === "calibrate") {
        if (!calibration.pointA) {
          onChange({ ...calibration, pointA: point, pointB: null });
        } else if (!calibration.pointB) {
          onChange({ ...calibration, pointB: point });
        } else {
          onChange({ ...calibration, pointA: point, pointB: null });
        }
        return;
      }

      setTrace((prev) => [...prev, point]);
    },
    [calibration, mode, onChange],
  );

  const applyKnown = useCallback(() => {
    const n = Number(knownDisplay);
    if (!Number.isFinite(n) || n <= 0) return;
    onChange({ ...calibration, knownDistanceM: toMetres(n, unit) });
  }, [calibration, knownDisplay, onChange, unit]);

  const applyTrace = useCallback(() => {
    if (trace.length < 3 || !isCalibrated(calibration)) return;
    const outline: Vec2[] = [];
    for (const p of trace) {
      const m = imageToMetres(p, calibration);
      if (!m) return;
      outline.push(m);
    }
    onApplyOutline(outline);
  }, [calibration, onApplyOutline, trace]);

  const markers = useMemo(() => {
    const list: { key: string; point: ImagePoint; label: string }[] = [];
    if (calibration.pointA) {
      list.push({ key: "a", point: calibration.pointA, label: "A" });
    }
    if (calibration.pointB) {
      list.push({ key: "b", point: calibration.pointB, label: "B" });
    }
    trace.forEach((p, i) => {
      list.push({ key: `t-${i}`, point: p, label: String(i + 1) });
    });
    return list;
  }, [calibration.pointA, calibration.pointB, trace]);

  return (
    <section className="homedecor-panel">
      <h2 className="homedecor-panel__title">Floor diagram</h2>
      <p className="homedecor-hint">
        Upload a builder plan, click two points of a known wall length, then
        trace the room outline.
      </p>

      <label className="homedecor-file">
        <span>Upload plan (PNG / JPG / PDF scan)</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {calibration.imageUrl ? (
        <>
          <div className="homedecor-plan-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={calibration.imageUrl}
              alt="Floor plan"
              className="homedecor-plan-img"
              onClick={clickOnImage}
              draggable={false}
            />
            {markers.map((m) => (
              <span
                key={m.key}
                className="homedecor-plan-marker"
                style={{
                  left: `${(m.point.u / calibration.naturalWidth) * 100}%`,
                  top: `${(m.point.v / calibration.naturalHeight) * 100}%`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="homedecor-row">
            <button
              type="button"
              className={`homedecor-btn ${mode === "calibrate" ? "homedecor-btn--primary" : ""}`}
              onClick={() => setMode("calibrate")}
            >
              Calibrate
            </button>
            <button
              type="button"
              className={`homedecor-btn ${mode === "trace" ? "homedecor-btn--primary" : ""}`}
              onClick={() => setMode("trace")}
              disabled={!ppm}
            >
              Trace outline
            </button>
          </div>

          <label className="homedecor-field">
            <span>Known distance A→B ({unit})</span>
            <div className="homedecor-inline">
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={knownDisplay}
                onChange={(e) => setKnownDisplay(e.target.value)}
                onBlur={applyKnown}
              />
              <button type="button" className="homedecor-btn" onClick={applyKnown}>
                Set
              </button>
            </div>
          </label>

          <p className="homedecor-meta">
            {ppm
              ? `Scale locked: ${(ppm).toFixed(1)} px / m`
              : "Click points A and B on a known length, then set the distance."}
          </p>

          <div className="homedecor-row">
            <button
              type="button"
              className="homedecor-btn homedecor-btn--primary"
              disabled={trace.length < 3 || !ppm}
              onClick={applyTrace}
            >
              Apply outline ({trace.length} pts)
            </button>
            <button
              type="button"
              className="homedecor-btn"
              onClick={() => {
                setTrace([]);
                onClear();
              }}
            >
              Clear plan
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
