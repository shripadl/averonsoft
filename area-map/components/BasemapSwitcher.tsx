"use client";

import { BASEMAPS, type BasemapId } from "@areamap/lib/basemaps";

type BasemapSwitcherProps = {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
};

export function BasemapSwitcher({ value, onChange }: BasemapSwitcherProps) {
  return (
    <div className="areamap-basemap" role="group" aria-label="Map layers">
      <span className="areamap-basemap__label">Map</span>
      <div className="areamap-basemap__options">
        {BASEMAPS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`areamap-basemap__btn${value === option.id ? " is-active" : ""}`}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
