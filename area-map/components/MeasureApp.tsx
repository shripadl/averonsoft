"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { brand } from "@areamap/config/brand.config";
import { trackEvent } from "@areamap/lib/analytics";
import type { GeocodeResult } from "@areamap/lib/geocode";
import { LocationSearch } from "./LocationSearch";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { ResultsPanel } from "./ResultsPanel";
import type { BasemapId } from "@areamap/lib/basemaps";
import type { AreaUnit, LengthUnit, LngLat } from "@areamap/lib/measure";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="areamap-map-loading" aria-busy="true">
        Loading map…
      </div>
    ),
  },
);

type MeasureAppProps = {
  /** When true, height accounts for Averonsoft site chrome. */
  embedded?: boolean;
};

function flyToResult(map: MapLibreMap, result: GeocodeResult) {
  if (result.bbox) {
    map.fitBounds(result.bbox, {
      padding: 64,
      maxZoom: 18,
      duration: 1200,
    });
    return;
  }
  map.flyTo({
    center: [result.lng, result.lat],
    zoom: 16,
    duration: 1200,
  });
}

export function MeasureApp({ embedded = false }: MeasureAppProps) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [points, setPoints] = useState<LngLat[]>([]);
  const [cursor, setCursor] = useState<LngLat | null>(null);
  const [closed, setClosed] = useState(false);
  const [drawing, setDrawing] = useState(true);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("m");
  const [basemap, setBasemap] = useState<BasemapId>("streets");

  useEffect(() => {
    trackEvent("plotmeasure_open");
  }, []);

  const reset = useCallback(() => {
    setPoints([]);
    setCursor(null);
    setClosed(false);
    setDrawing(true);
    trackEvent("plotmeasure_clear");
  }, []);

  const undo = useCallback(() => {
    if (closed) {
      setClosed(false);
      setDrawing(true);
      return;
    }
    setPoints((prev) => prev.slice(0, -1));
  }, [closed]);

  const finish = useCallback(() => {
    if (points.length < 3) return;
    setClosed(true);
    setDrawing(false);
    setCursor(null);
    trackEvent("plotmeasure_close", { points: points.length });
  }, [points.length]);

  const onMapClick = useCallback(
    (point: LngLat) => {
      if (closed) return;
      if (!drawing) setDrawing(true);
      setPoints((prev) => [...prev, point]);
    },
    [closed, drawing],
  );

  const onMoveVertex = useCallback((index: number, point: LngLat) => {
    setPoints((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.slice();
      next[index] = point;
      return next;
    });
  }, []);

  const onPlaceSelect = useCallback((result: GeocodeResult) => {
    const map = mapRef.current;
    if (map) flyToResult(map, result);
    trackEvent("plotmeasure_search_select");
  }, []);

  const onBasemapChange = useCallback((id: BasemapId) => {
    setBasemap(id);
    trackEvent("plotmeasure_basemap", { basemap: id });
  }, []);

  const canFinish = !closed && points.length >= 3;
  const canUndo = points.length > 0 || closed;

  return (
    <div
      className={`areamap-root ${embedded ? "areamap-root--embedded" : "areamap-root--standalone"}`}
    >
      <div className="areamap-stage">
        <MapCanvas
          points={points}
          cursor={drawing && !closed ? cursor : null}
          closed={closed}
          drawing={drawing}
          basemap={basemap}
          onMapClick={onMapClick}
          onCloseNearFirst={finish}
          onMoveVertex={onMoveVertex}
          onCursorMove={setCursor}
          onReady={(map) => {
            mapRef.current = map;
          }}
        />

        <header className="areamap-chrome">
          <div className="areamap-brand">
            <p className="areamap-logo">{brand.logoText}</p>
            <p className="areamap-tagline">{brand.tagline}</p>
          </div>

          <LocationSearch onSelect={onPlaceSelect} />

          <BasemapSwitcher value={basemap} onChange={onBasemapChange} />

          <div className="areamap-toolbar" role="toolbar" aria-label="Measure tools">
            <button
              type="button"
              className="areamap-btn areamap-btn--primary"
              onClick={finish}
              disabled={!canFinish}
            >
              Close shape
            </button>
            <button
              type="button"
              className="areamap-btn"
              onClick={undo}
              disabled={!canUndo}
            >
              Undo
            </button>
            <button
              type="button"
              className="areamap-btn"
              onClick={reset}
              disabled={points.length === 0 && !closed}
            >
              Clear
            </button>
          </div>

          <p className="areamap-instructions">
            {closed
              ? "Drag any white point to adjust the area. Clear to start over."
              : points.length === 0
                ? "Search a place, then click the map to place the first point."
                : points.length < 3
                  ? "Keep clicking to outline the area. Drag points to adjust."
                  : "Click the first point or Close shape to finish. Drag points anytime."}
          </p>
        </header>

        <ResultsPanel
          points={points}
          closed={closed}
          areaUnit={areaUnit}
          lengthUnit={lengthUnit}
          onAreaUnit={setAreaUnit}
          onLengthUnit={setLengthUnit}
        />

        <footer className="areamap-footer">
          <span>
            {basemap === "satellite"
              ? "Imagery © Esri"
              : "Tiles © OpenFreeMap · Data © OpenStreetMap"}
          </span>
          {brand.parentCredit ? (
            <>
              <span className="areamap-footer__sep" aria-hidden>
                ·
              </span>
              <a href={brand.parentUrl} className="areamap-footer__link">
                {brand.parentCredit}
              </a>
            </>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
