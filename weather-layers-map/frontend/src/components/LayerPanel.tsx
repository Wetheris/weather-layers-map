"use client";

import type { Dispatch, SetStateAction } from "react";

type LayersState = {
  radar: boolean;
  wind: boolean;
  temperature: boolean;
  clouds: boolean;
};

type Props = {
  layers: LayersState;
  setLayers: Dispatch<SetStateAction<LayersState>>;
};

export default function LayerPanel({ layers, setLayers }: Props) {
  return (
    <div className="absolute top-4 left-4 z-10 w-64 rounded bg-white shadow p-4">
      <h2 className="mb-2 font-semibold">Layers</h2>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={layers.radar}
            onChange={(e) =>
              setLayers((prev) => ({ ...prev, radar: e.target.checked }))
            }
          />
          Radar (free)
        </label>

        <label className="flex items-center gap-2 opacity-50">
          <input type="checkbox" checked={layers.temperature} disabled />
          Temperature (next)
        </label>

        <label className="flex items-center gap-2 opacity-50">
          <input type="checkbox" checked={layers.clouds} disabled />
          Cloud Cover (next)
        </label>
      </div>
    </div>
  );
}
