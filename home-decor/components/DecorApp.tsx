"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { brand } from "@homedecor/config/brand.config";
import { trackEvent } from "@homedecor/lib/analytics";
import {
  CATEGORY_LABELS,
  FURNITURE_CATALOG,
  getCatalogItem,
  type FurnitureCategory,
} from "@homedecor/lib/furniture-catalog";
import {
  emptyCalibration,
  isCalibrated,
  type FloorPlanCalibration,
} from "@homedecor/lib/floor-plan";
import {
  defaultRoom,
  polygonArea,
  polygonBounds,
  rectOutline,
  type PlacedItem,
  type RoomSpec,
  type Vec2,
} from "@homedecor/lib/room";
import {
  formatArea,
  formatLength,
  fromMetres,
  snapMetres,
  toMetres,
  UNIT_LABELS,
  type LengthUnit,
} from "@homedecor/lib/units";
import { FloorPlanPanel } from "./FloorPlanPanel";

const RoomScene = dynamic(
  () => import("./RoomScene").then((m) => m.RoomScene),
  {
    ssr: false,
    loading: () => (
      <div className="homedecor-canvas-loading" aria-busy="true">
        Loading 3D room…
      </div>
    ),
  },
);

type DecorAppProps = {
  /** Reserved for host chrome variants; CSS is full-bleed either way. */
  embedded?: boolean;
};

function newItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DecorApp({ embedded = false }: DecorAppProps) {
  const titleId = useId();
  const [unit, setUnit] = useState<LengthUnit>("m");
  const [room, setRoom] = useState<RoomSpec>(() => defaultRoom());
  const [widthDisplay, setWidthDisplay] = useState("4");
  const [depthDisplay, setDepthDisplay] = useState("3.5");
  const [heightDisplay, setHeightDisplay] = useState("2.4");
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placingCatalogId, setPlacingCatalogId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [panel, setPanel] = useState<"room" | "plan" | "catalog">("room");
  const [floorPlan, setFloorPlan] = useState<FloorPlanCalibration>(
    emptyCalibration,
  );
  const [category, setCategory] = useState<FurnitureCategory | "all">("all");

  useEffect(() => {
    trackEvent("roomscale_open");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPlacingCatalogId(null);
        setSelectedId(null);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        setItems((prev) => prev.filter((i) => i.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const syncDisplaysFromRoom = useCallback(
    (next: RoomSpec, u: LengthUnit) => {
      setWidthDisplay(fromMetres(next.width, u).toFixed(2));
      setDepthDisplay(fromMetres(next.depth, u).toFixed(2));
      setHeightDisplay(fromMetres(next.ceilingHeight, u).toFixed(2));
    },
    [],
  );

  const applyRectRoom = useCallback(() => {
    const width = toMetres(Number(widthDisplay) || 0, unit);
    const depth = toMetres(Number(depthDisplay) || 0, unit);
    const ceilingHeight = toMetres(Number(heightDisplay) || 0, unit);
    if (width < 0.5 || depth < 0.5 || ceilingHeight < 1.5) return;
    const next: RoomSpec = {
      mode: "rect",
      width,
      depth,
      ceilingHeight,
      outline: rectOutline(width, depth),
    };
    setRoom(next);
    trackEvent("roomscale_room_set", {
      width,
      depth,
      height: ceilingHeight,
      unit,
    });
  }, [depthDisplay, heightDisplay, unit, widthDisplay]);

  useEffect(() => {
    syncDisplaysFromRoom(room, unit);
    // Reformat displayed numbers when the unit system changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- room intentionally omitted
  }, [unit, syncDisplaysFromRoom]);

  const area = useMemo(() => polygonArea(room.outline), [room.outline]);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const selectedCatalog = selected
    ? getCatalogItem(selected.catalogId)
    : null;

  const catalogFiltered = useMemo(() => {
    if (category === "all") return FURNITURE_CATALOG;
    return FURNITURE_CATALOG.filter((c) => c.category === category);
  }, [category]);

  const snapVal = useCallback(
    (v: number) => (snap ? snapMetres(v, 0.05) : v),
    [snap],
  );

  const clearFurniture = useCallback(() => {
    setItems([]);
    setSelectedId(null);
    setPlacingCatalogId(null);
  }, []);

  const onPlace = useCallback(
    (x: number, z: number) => {
      if (!placingCatalogId) return;
      const id = newItemId();
      setItems((prev) => [
        ...prev,
        {
          id,
          catalogId: placingCatalogId,
          x: snapVal(x),
          z: snapVal(z),
          rotationY: 0,
        },
      ]);
      setSelectedId(id);
      setPlacingCatalogId(null);
      trackEvent("roomscale_place", { catalogId: placingCatalogId });
    },
    [placingCatalogId, snapVal],
  );

  const onMoveSelected = useCallback(
    (x: number, z: number) => {
      if (!selectedId) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, x: snapVal(x), z: snapVal(z) }
            : item,
        ),
      );
    },
    [selectedId, snapVal],
  );

  const rotateSelected = useCallback(
    (delta: number) => {
      if (!selectedId) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                rotationY: Math.round((item.rotationY + delta) / 15) * 15,
              }
            : item,
        ),
      );
    },
    [selectedId],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const onApplyOutline = useCallback((outline: Vec2[]) => {
    const bounds = polygonBounds(outline);
    setRoom((prev) => ({
      ...prev,
      mode: "polygon",
      width: bounds.maxX - bounds.minX,
      depth: bounds.maxZ - bounds.minZ,
      outline,
    }));
    setPanel("catalog");
    trackEvent("roomscale_outline_from_plan", { points: outline.length });
  }, []);

  const activeFloorPlan = isCalibrated(floorPlan) ? floorPlan : null;

  return (
    <div
      className={`homedecor-root ${embedded ? "homedecor-root--embedded" : "homedecor-root--standalone"}`}
    >
      <div className="homedecor-stage">
        <div className="homedecor-canvas">
          <RoomScene
            room={room}
            items={items}
            selectedId={selectedId}
            placingCatalogId={placingCatalogId}
            unit={unit}
            showGrid={showGrid}
            floorPlan={activeFloorPlan}
            onSelect={setSelectedId}
            onPlace={onPlace}
            onMoveSelected={onMoveSelected}
          />
        </div>

        <aside className="homedecor-chrome" aria-labelledby={titleId}>
          <header className="homedecor-brand">
            <h1 id={titleId} className="homedecor-logo">
              {brand.logoText}
            </h1>
            <p className="homedecor-tagline">{brand.tagline}</p>
          </header>

          <div className="homedecor-tabs" role="tablist">
            {(
              [
                ["room", "Room"],
                ["plan", "Floor plan"],
                ["catalog", "Furniture"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={panel === id}
                className={`homedecor-tab ${panel === id ? "is-active" : ""}`}
                onClick={() => setPanel(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {panel === "room" ? (
            <section className="homedecor-panel">
              <h2 className="homedecor-panel__title">Room dimensions</h2>
              <p className="homedecor-hint">
                Enter accurate sizes from drawings or a tape measure. Scene
                units are metres internally; switch display units anytime.
              </p>

              <label className="homedecor-field">
                <span>Display units</span>
                <select
                  className="homedecor-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as LengthUnit)}
                >
                  {(Object.keys(UNIT_LABELS) as LengthUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="homedecor-fields">
                <label className="homedecor-field">
                  <span>Width ({unit})</span>
                  <input
                    type="number"
                    min={0.5}
                    step={0.01}
                    value={widthDisplay}
                    onChange={(e) => setWidthDisplay(e.target.value)}
                  />
                </label>
                <label className="homedecor-field">
                  <span>Depth ({unit})</span>
                  <input
                    type="number"
                    min={0.5}
                    step={0.01}
                    value={depthDisplay}
                    onChange={(e) => setDepthDisplay(e.target.value)}
                  />
                </label>
                <label className="homedecor-field">
                  <span>Ceiling ({unit})</span>
                  <input
                    type="number"
                    min={1.5}
                    step={0.01}
                    value={heightDisplay}
                    onChange={(e) => setHeightDisplay(e.target.value)}
                  />
                </label>
              </div>

              <div className="homedecor-row">
                <button
                  type="button"
                  className="homedecor-btn homedecor-btn--primary"
                  onClick={applyRectRoom}
                >
                  Apply room size
                </button>
                <button
                  type="button"
                  className="homedecor-btn"
                  onClick={() => {
                    const next = defaultRoom();
                    setRoom(next);
                    syncDisplaysFromRoom(next, unit);
                    clearFurniture();
                  }}
                >
                  Reset 4×3.5 m
                </button>
              </div>

              <div className="homedecor-stats">
                <div>
                  <span className="homedecor-stat__label">Floor area</span>
                  <p className="homedecor-stat__value">
                    {formatArea(area, unit)}
                  </p>
                </div>
                <div>
                  <span className="homedecor-stat__label">Footprint</span>
                  <p className="homedecor-stat__value">
                    {formatLength(room.width, unit)} ×{" "}
                    {formatLength(room.depth, unit)}
                  </p>
                </div>
              </div>

              <div className="homedecor-row">
                <label className="homedecor-check">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                  10 cm grid
                </label>
                <label className="homedecor-check">
                  <input
                    type="checkbox"
                    checked={snap}
                    onChange={(e) => setSnap(e.target.checked)}
                  />
                  Snap 5 cm
                </label>
              </div>
            </section>
          ) : null}

          {panel === "plan" ? (
            <FloorPlanPanel
              unit={unit}
              calibration={floorPlan}
              onChange={setFloorPlan}
              onApplyOutline={onApplyOutline}
              onClear={() => {
                if (floorPlan.imageUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(floorPlan.imageUrl);
                }
                setFloorPlan(emptyCalibration());
              }}
            />
          ) : null}

          {panel === "catalog" ? (
            <section className="homedecor-panel">
              <h2 className="homedecor-panel__title">Furniture</h2>
              <p className="homedecor-hint">
                Select an item, then click the floor to place it. Click an
                existing piece to move it. Red pieces overlap or sit outside the
                room.
              </p>

              <div className="homedecor-row homedecor-row--wrap">
                <button
                  type="button"
                  className={`homedecor-chip ${category === "all" ? "is-active" : ""}`}
                  onClick={() => setCategory("all")}
                >
                  All
                </button>
                {(Object.keys(CATEGORY_LABELS) as FurnitureCategory[]).map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      className={`homedecor-chip ${category === c ? "is-active" : ""}`}
                      onClick={() => setCategory(c)}
                    >
                      {CATEGORY_LABELS[c]}
                    </button>
                  ),
                )}
              </div>

              <ul className="homedecor-catalog">
                {catalogFiltered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`homedecor-catalog__item ${placingCatalogId === item.id ? "is-active" : ""}`}
                      onClick={() => {
                        setPlacingCatalogId(item.id);
                        setSelectedId(null);
                      }}
                    >
                      <span
                        className="homedecor-catalog__swatch"
                        style={{ background: item.color }}
                        aria-hidden
                      />
                      <span className="homedecor-catalog__meta">
                        <strong>{item.name}</strong>
                        <span>
                          {formatLength(item.width, unit)} ×{" "}
                          {formatLength(item.depth, unit)} ×{" "}
                          {formatLength(item.height, unit)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {placingCatalogId ? (
                <p className="homedecor-banner">
                  Placing{" "}
                  <strong>
                    {getCatalogItem(placingCatalogId)?.name ?? "item"}
                  </strong>
                  — click the floor. Esc to cancel.
                </p>
              ) : null}

              {selected && selectedCatalog ? (
                <div className="homedecor-selection">
                  <h3 className="homedecor-panel__title">Selected</h3>
                  <p className="homedecor-meta">
                    {selectedCatalog.name} · yaw {selected.rotationY}° · pos{" "}
                    {formatLength(selected.x, unit)},{" "}
                    {formatLength(selected.z, unit)}
                  </p>
                  <div className="homedecor-row">
                    <button
                      type="button"
                      className="homedecor-btn"
                      onClick={() => rotateSelected(-15)}
                    >
                      ↺ 15°
                    </button>
                    <button
                      type="button"
                      className="homedecor-btn"
                      onClick={() => rotateSelected(15)}
                    >
                      ↻ 15°
                    </button>
                    <button
                      type="button"
                      className="homedecor-btn"
                      onClick={deleteSelected}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="homedecor-row">
                <button
                  type="button"
                  className="homedecor-btn"
                  onClick={clearFurniture}
                  disabled={items.length === 0}
                >
                  Clear furniture
                </button>
              </div>
            </section>
          ) : null}
        </aside>

        <p className="homedecor-instructions">
          {placingCatalogId
            ? "Click the floor to place. Orbit: drag · Zoom: scroll · Pan: right-drag."
            : "Drag to orbit the room. Open Furniture to place pieces to scale."}
        </p>

        <footer className="homedecor-footer">
          {brand.parentCredit && brand.parentUrl ? (
            <>
              <a
                className="homedecor-footer__link"
                href={brand.parentUrl}
                rel="noreferrer"
              >
                {brand.parentCredit}
              </a>
              <span className="homedecor-footer__sep">·</span>
            </>
          ) : null}
          {brand.footerLinks.map((link, i) => (
            <span key={link.href}>
              {i > 0 ? <span className="homedecor-footer__sep">·</span> : null}
              <a className="homedecor-footer__link" href={link.href}>
                {link.label}
              </a>
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}
