"use client";

import { useCallback, useEffect, useRef } from "react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapMouseEvent,
  type MapTouchEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getBasemap, type BasemapId } from "@areamap/lib/basemaps";
import type { LngLat } from "@areamap/lib/measure";

const SOURCE_ID = "plotmeasure-draw";
const FILL_LAYER = "plotmeasure-fill";
const LINE_LAYER = "plotmeasure-line";
const VERTEX_LAYER = "plotmeasure-vertices";
const VERTEX_HIT_LAYER = "plotmeasure-vertices-hit";
const CLOSE_THRESHOLD_PX = 14;
const VERTEX_HIT_PX = 18;

type MapCanvasProps = {
  points: LngLat[];
  cursor: LngLat | null;
  closed: boolean;
  drawing: boolean;
  basemap: BasemapId;
  onMapClick: (point: LngLat) => void;
  /** Fired when the user clicks near the first vertex (close polygon). */
  onCloseNearFirst: () => void;
  onMoveVertex: (index: number, point: LngLat) => void;
  onCursorMove: (point: LngLat | null) => void;
  onReady?: (map: MapLibreMap) => void;
};

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function drawPaint(basemap: BasemapId) {
  const satellite = basemap === "satellite";
  return {
    fill: satellite ? "#f5d76e" : "#0f6e56",
    fillOpacity: satellite ? 0.35 : 0.28,
    line: satellite ? "#ffe566" : "#0b4f3f",
    vertexStroke: satellite ? "#c9a227" : "#0b4f3f",
  };
}

function buildFeatures(
  points: LngLat[],
  cursor: LngLat | null,
  closed: boolean,
): {
  polygon: GeoJSON.FeatureCollection;
  line: GeoJSON.FeatureCollection;
  vertices: GeoJSON.FeatureCollection;
} {
  const vertices: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: points.map((coordinates, i) => ({
      type: "Feature",
      properties: { index: i },
      geometry: { type: "Point", coordinates },
    })),
  };

  if (points.length === 0) {
    return {
      polygon: emptyCollection(),
      line: emptyCollection(),
      vertices,
    };
  }

  const lineCoords =
    closed && points.length >= 3
      ? [...points, points[0]]
      : cursor && !closed
        ? [...points, cursor]
        : points;

  const line: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features:
      lineCoords.length >= 2
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: lineCoords },
            },
          ]
        : [],
  };

  const polygon: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features:
      closed && points.length >= 3
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [[...points, points[0]]],
              },
            },
          ]
        : !closed && points.length >= 2 && cursor
          ? [
              {
                type: "Feature",
                properties: { preview: true },
                geometry: {
                  type: "Polygon",
                  coordinates: [[...points, cursor, points[0]]],
                },
              },
            ]
          : [],
  };

  return { polygon, line, vertices };
}

function ensureDrawLayers(map: MapLibreMap, basemap: BasemapId) {
  const paint = drawPaint(basemap);

  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, { type: "geojson", data: emptyCollection() });
  }
  if (!map.getSource(`${SOURCE_ID}-line`)) {
    map.addSource(`${SOURCE_ID}-line`, {
      type: "geojson",
      data: emptyCollection(),
    });
  }
  if (!map.getSource(`${SOURCE_ID}-vertices`)) {
    map.addSource(`${SOURCE_ID}-vertices`, {
      type: "geojson",
      data: emptyCollection(),
    });
  }

  if (!map.getLayer(FILL_LAYER)) {
    map.addLayer({
      id: FILL_LAYER,
      type: "fill",
      source: SOURCE_ID,
      paint: {
        "fill-color": paint.fill,
        "fill-opacity": paint.fillOpacity,
      },
    });
  } else {
    map.setPaintProperty(FILL_LAYER, "fill-color", paint.fill);
    map.setPaintProperty(FILL_LAYER, "fill-opacity", paint.fillOpacity);
  }

  if (!map.getLayer(LINE_LAYER)) {
    map.addLayer({
      id: LINE_LAYER,
      type: "line",
      source: `${SOURCE_ID}-line`,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": paint.line,
        "line-width": 2.5,
      },
    });
  } else {
    map.setPaintProperty(LINE_LAYER, "line-color", paint.line);
  }

  if (!map.getLayer(VERTEX_HIT_LAYER)) {
    map.addLayer({
      id: VERTEX_HIT_LAYER,
      type: "circle",
      source: `${SOURCE_ID}-vertices`,
      paint: {
        "circle-radius": VERTEX_HIT_PX,
        "circle-color": "#000000",
        "circle-opacity": 0,
      },
    });
  }

  if (!map.getLayer(VERTEX_LAYER)) {
    map.addLayer({
      id: VERTEX_LAYER,
      type: "circle",
      source: `${SOURCE_ID}-vertices`,
      paint: {
        "circle-radius": 7,
        "circle-color": "#ffffff",
        "circle-stroke-width": 2.5,
        "circle-stroke-color": paint.vertexStroke,
      },
    });
  } else {
    map.setPaintProperty(
      VERTEX_LAYER,
      "circle-stroke-color",
      paint.vertexStroke,
    );
  }
}

function vertexIndexAt(
  map: MapLibreMap,
  point: { x: number; y: number },
): number | null {
  if (!map.getLayer(VERTEX_HIT_LAYER) && !map.getLayer(VERTEX_LAYER)) {
    return null;
  }
  const layers = [VERTEX_HIT_LAYER, VERTEX_LAYER].filter((id) =>
    map.getLayer(id),
  );
  const features = map.queryRenderedFeatures([point.x, point.y], { layers });
  const index = features[0]?.properties?.index;
  if (typeof index === "number") return index;
  if (typeof index === "string" && index !== "") {
    const n = Number(index);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function MapCanvas({
  points,
  cursor,
  closed,
  drawing,
  basemap,
  onMapClick,
  onCloseNearFirst,
  onMoveVertex,
  onCursorMove,
  onReady,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const basemapRef = useRef(basemap);
  const pointsRef = useRef(points);
  const closedRef = useRef(closed);
  const drawingRef = useRef(drawing);
  const dragIndexRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const onMapClickRef = useRef(onMapClick);
  const onCloseNearFirstRef = useRef(onCloseNearFirst);
  const onMoveVertexRef = useRef(onMoveVertex);
  const onCursorMoveRef = useRef(onCursorMove);
  const onReadyRef = useRef(onReady);

  basemapRef.current = basemap;
  pointsRef.current = points;
  closedRef.current = closed;
  drawingRef.current = drawing;
  onMapClickRef.current = onMapClick;
  onCloseNearFirstRef.current = onCloseNearFirst;
  onMoveVertexRef.current = onMoveVertex;
  onCursorMoveRef.current = onCursorMove;
  onReadyRef.current = onReady;

  const syncSources = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource(SOURCE_ID)) return;

    const { polygon, line, vertices } = buildFeatures(points, cursor, closed);

    (map.getSource(SOURCE_ID) as GeoJSONSource).setData(polygon);
    (map.getSource(`${SOURCE_ID}-line`) as GeoJSONSource).setData(line);
    (map.getSource(`${SOURCE_ID}-vertices`) as GeoJSONSource).setData(vertices);
  }, [points, cursor, closed]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial = getBasemap(basemapRef.current);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initial.style,
      center: [0, 20],
      zoom: 1.6,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "bottom-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "bottom-right",
    );
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    const onStyleReady = () => {
      ensureDrawLayers(map, basemapRef.current);
      syncSources();
    };

    map.on("load", () => {
      onStyleReady();
      mapRef.current = map;
      onReadyRef.current?.(map);
    });

    map.on("style.load", onStyleReady);

    const endDrag = () => {
      if (dragIndexRef.current == null) return;
      dragIndexRef.current = null;
      map.dragPan.enable();
      map.getCanvas().style.cursor = closedRef.current
        ? "grab"
        : drawingRef.current
          ? "crosshair"
          : "";
    };

    const handlePointerDown = (e: MapMouseEvent | MapTouchEvent) => {
      const index = vertexIndexAt(map, e.point);
      if (index == null) return;
      e.preventDefault();
      dragIndexRef.current = index;
      didDragRef.current = false;
      map.dragPan.disable();
      map.getCanvas().style.cursor = "grabbing";
    };

    const handleClick = (e: MapMouseEvent) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      if (vertexIndexAt(map, e.point) != null) {
        // Vertex press without drag — don't add a new point on top of it.
        // Still allow closing when clicking the first vertex while drawing.
        const pts = pointsRef.current;
        if (
          !closedRef.current &&
          pts.length >= 3 &&
          vertexIndexAt(map, e.point) === 0
        ) {
          onCloseNearFirstRef.current();
        }
        return;
      }
      const pts = pointsRef.current;
      if (!closedRef.current && pts.length >= 3) {
        const firstScreen = map.project(pts[0]);
        const dx = firstScreen.x - e.point.x;
        const dy = firstScreen.y - e.point.y;
        if (Math.hypot(dx, dy) <= CLOSE_THRESHOLD_PX) {
          onCloseNearFirstRef.current();
          return;
        }
      }
      onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
    };

    const handleMove = (e: MapMouseEvent) => {
      const dragIndex = dragIndexRef.current;
      if (dragIndex != null) {
        didDragRef.current = true;
        onMoveVertexRef.current(dragIndex, [e.lngLat.lng, e.lngLat.lat]);
        map.getCanvas().style.cursor = "grabbing";
        return;
      }

      const overVertex = vertexIndexAt(map, e.point) != null;
      if (overVertex) {
        map.getCanvas().style.cursor = "grab";
      } else if (!closedRef.current) {
        map.getCanvas().style.cursor = "crosshair";
      } else {
        map.getCanvas().style.cursor = "";
      }

      if (!closedRef.current) {
        onCursorMoveRef.current([e.lngLat.lng, e.lngLat.lat]);
      }
    };

    const handleLeave = () => {
      if (dragIndexRef.current != null) endDrag();
      onCursorMoveRef.current(null);
    };

    map.on("mousedown", handlePointerDown);
    map.on("touchstart", handlePointerDown);
    map.on("mouseup", endDrag);
    map.on("touchend", endDrag);
    map.on("click", handleClick);
    map.on("mousemove", handleMove);
    map.on("mouseout", handleLeave);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Intentionally once — sync happens via effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = getBasemap(basemap);
    map.setStyle(next.style);
  }, [basemap]);

  useEffect(() => {
    syncSources();
  }, [syncSources]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || dragIndexRef.current != null) return;
    map.getCanvas().style.cursor = drawing && !closed ? "crosshair" : "";
  }, [drawing, closed]);

  return (
    <div
      ref={containerRef}
      className="areamap-canvas absolute inset-0 h-full w-full"
      role="application"
      aria-label="Area measuring map"
    />
  );
}
