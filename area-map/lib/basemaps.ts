import type { StyleSpecification } from "maplibre-gl";

export type BasemapId = "streets" | "bright" | "light" | "satellite";

export type BasemapOption = {
  id: BasemapId;
  label: string;
  /** OpenFreeMap vector style URL, or inline style for raster satellite. */
  style: string | StyleSpecification;
};

/** Esri World Imagery — free raster tiles with required attribution (not Google). */
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  name: "Satellite",
  sources: {
    "esri-world-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-world-imagery",
      type: "raster",
      source: "esri-world-imagery",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const BASEMAPS: BasemapOption[] = [
  {
    id: "streets",
    label: "Streets",
    style: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    id: "bright",
    label: "Bright",
    style: "https://tiles.openfreemap.org/styles/bright",
  },
  {
    id: "light",
    label: "Light",
    style: "https://tiles.openfreemap.org/styles/positron",
  },
  {
    id: "satellite",
    label: "Satellite",
    style: SATELLITE_STYLE,
  },
];

export function getBasemap(id: BasemapId): BasemapOption {
  return BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
}
